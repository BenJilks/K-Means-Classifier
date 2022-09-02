/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import React, { useEffect, useRef, useState } from 'react'
import { DataPoint } from '../../data_point'
import { classify, group_data_points } from '../../classifier'
import { DisplayContext, draw_webgl, group_radius, init_webgl, resize_webgl } from './draw'
import { grid_size_px } from './shaders/grid'
import { find_point_under_cursor } from './input'
import { DataSet } from '../../data_point'
import { RandomizerState } from '../settings/randomizer'
import styles from './index.module.css'

export type ClusterInfo = {
    data_points: DataPoint[],
    clusters: [DataPoint, number][][],
    groups: DataPoint[],
    new_groups: DataPoint[],
}

export type ViewState = {
    offset: { x: number, y: number },
    zoom: number,
}

function compute_cluster_info(data_points: DataPoint[], groups: DataPoint[]): ClusterInfo {
    const clusters = group_data_points(data_points, groups)
    const new_groups = classify(data_points, groups)
    return {
        data_points,
        clusters,
        groups,
        new_groups,
    }
}

type DataDisplayProps = {
    data_set: DataSet,
    selected_point: number | undefined,
    randomizer_state: RandomizerState,
    set_data_set: React.Dispatch<React.SetStateAction<DataSet>>,
    set_selected_point: React.Dispatch<React.SetStateAction<number | undefined>>,
    set_randomizer_state: React.Dispatch<React.SetStateAction<RandomizerState>>,
}

export default function DataDisplay({ data_set,
                                      selected_point,
                                      randomizer_state,
                                      set_data_set,
                                      set_selected_point,
                                      set_randomizer_state }: DataDisplayProps) {
    const canvas_ref = useRef(document.createElement('canvas'))
    const rendering_context = useRef(null as DisplayContext | null)

    const [cluster_info, set_cluster_info] = useState(compute_cluster_info(data_set.points, data_set.groups))
    const [view_state, set_view_state] = useState({
        offset: { x: NaN, y: NaN },
        zoom: 1,
    })

    useEffect(() => {
        set_cluster_info(compute_cluster_info(data_set.points, data_set.groups))
    }, [data_set])

    useEffect(() => {
        const canvas = canvas_ref.current
        const gl = canvas.getContext('webgl')!

        if (isNaN(view_state.offset.x) && isNaN(view_state.offset.y)) {
            const bounding_rect = canvas.getBoundingClientRect()
            set_view_state({
                offset: {
                    x: bounding_rect.width / 2,
                    y: bounding_rect.height / 2,
                },
                zoom: view_state.zoom,
            })

            return
        }

        const handleResize = () => {
            canvas.width = canvas.getBoundingClientRect().width
            canvas.height = canvas.getBoundingClientRect().height
            resize_webgl(gl, canvas.width, canvas.height)

            requestAnimationFrame(() => {
                if (rendering_context.current == null)
                    rendering_context.current = init_webgl(gl)
                draw_webgl(gl, rendering_context.current!, view_state, cluster_info, randomizer_state, selected_point)
            })
        }

        handleResize()
        window.addEventListener("resize", handleResize)
    }, [view_state, cluster_info, randomizer_state, selected_point])

    const [is_mouse_down, set_is_mouse_down] = useState(false)
    const [is_dragging_point, set_is_dragging_point] = useState(false)
    const [is_dragging_center, set_is_dragging_center] = useState(false)
    const [selected_center, set_selected_center] = useState(undefined as number | undefined)
    const compute_cursor_position = (event: React.MouseEvent) => {
        const bounding_rect = canvas_ref.current.getBoundingClientRect()
        return {
            x: event.clientX - bounding_rect.x,
            y: event.clientY - bounding_rect.y,
        }
    }

    const on_mouse_down = (event: React.MouseEvent) => {
        const cursor = compute_cursor_position(event)

        const point_under_cursor = find_point_under_cursor(data_set.points, view_state, cursor)
        if (point_under_cursor !== undefined) {
            set_is_dragging_point(true)
        }
        set_selected_point(point_under_cursor)

        if (randomizer_state.is_open && randomizer_state.enable_centers) {
            const center_inder_cursor = find_point_under_cursor(randomizer_state.centers, view_state, cursor, group_radius * 1.7)
            if (center_inder_cursor !== undefined) {
                set_is_dragging_center(true)
            }
            set_selected_center(center_inder_cursor)
        }

        set_is_mouse_down(true)
    }

    const on_mouse_up = () => {
        set_is_dragging_point(false)
        set_is_dragging_center(false)
        set_is_mouse_down(false)
    }

    const on_mouse_drag = (event: React.MouseEvent,
                           cursor: { x: number, y: number }) => {
        const canvas = canvas_ref.current
        if (selected_point !== undefined && is_dragging_point) {
            canvas.style.cursor = 'pointer'
            data_set.points[selected_point] = {
                x: (cursor.x * view_state.zoom - view_state.offset.x) / grid_size_px,
                y: (cursor.y * view_state.zoom - view_state.offset.y) / grid_size_px,
            }

            set_data_set({
                points: data_set.points,
                groups: data_set.groups,
            })
        } else if (selected_center !== undefined && is_dragging_center) {
            canvas.style.cursor = 'pointer'
            randomizer_state.centers[selected_center] = {
                x: (cursor.x * view_state.zoom - view_state.offset.x) / grid_size_px,
                y: (cursor.y * view_state.zoom - view_state.offset.y) / grid_size_px,
            }

            set_randomizer_state({
                is_open: randomizer_state.is_open,
                enable_centers: randomizer_state.enable_centers,
                centers: randomizer_state.centers,
            })
        } else {
            set_view_state({
                offset: {
                    x: view_state.offset.x + event.movementX * view_state.zoom,
                    y: view_state.offset.y + event.movementY * view_state.zoom,
                },
                zoom: view_state.zoom,
            })
        }
    }

    const on_mouse_move = (event: React.MouseEvent) => {
        const canvas = canvas_ref.current
        canvas.style.cursor = 'default'

        const cursor = compute_cursor_position(event)
        if (is_mouse_down) {
            on_mouse_drag(event, cursor)
            return
        }

        if (find_point_under_cursor(data_set.points, view_state, cursor) !== undefined) {
            canvas.style.cursor = 'pointer'
        }

        if (randomizer_state.is_open && randomizer_state.enable_centers) {
            if (find_point_under_cursor(randomizer_state.centers, view_state,
                                        cursor, group_radius * 1.7) !== undefined) {
                canvas.style.cursor = 'pointer'
            }
        }
    }

    const on_wheel = (event: React.WheelEvent) => {
        const delta = event.deltaY / (138.0 * 10.0) * view_state.zoom
        const new_zoom = view_state.zoom + delta
        if (new_zoom >= 3.8 || new_zoom <= 0.2) {
            return
        }

        const cursor = compute_cursor_position(event)
        set_view_state({
            offset: {
                x: view_state.offset.x + cursor.x * delta,
                y: view_state.offset.y + cursor.y * delta,
            },
            zoom: new_zoom,
        })
    }

    return (
        <div className={ styles.data_display }>
            <canvas
                ref={ canvas_ref }
                className={ styles.canvas }
                onMouseDown={ on_mouse_down }
                onMouseUp={ on_mouse_up }
                onMouseMove={ on_mouse_move }
                onWheel={ on_wheel }>
            </canvas>
        </div>
    )
}

