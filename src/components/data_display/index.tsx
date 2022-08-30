/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import React, { useEffect, useRef, useState } from 'react'
import { DataPoint } from '../../data_point'
import { classify, group_data_points } from '../../classifier'
import { DisplayContext, draw_webgl, init_webgl, resize_webgl } from './draw'
import { grid_size_px } from './shaders/grid'
import { find_point_under_cursor } from './input'
import styles from './index.module.css'

export type ClusterInfo = {
    data_points: DataPoint[],
    clusters: [DataPoint, number][][],
    groups: DataPoint[],
    new_groups: DataPoint[],
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
    data_points: DataPoint[],
    selected_point: number | undefined,
    groups: DataPoint[],
    set_selected_point: React.Dispatch<React.SetStateAction<number | undefined>>,
    set_data_points: React.Dispatch<React.SetStateAction<DataPoint[]>>,
}

export default function DataDisplay({ data_points,
                                      selected_point,
                                      groups,
                                      set_selected_point,
                                      set_data_points }: DataDisplayProps) {
    const canvas_ref = useRef(document.createElement('canvas'))
    const rendering_context = useRef(null as DisplayContext | null)

    useEffect(() => {
        const canvas = canvas_ref.current
        const bounding_rect = canvas.getBoundingClientRect()
        set_offset({
            x: bounding_rect.width / 2,
            y: bounding_rect.height / 2,
        })
    }, [])

    const [cluster_info, set_cluster_info] = useState(compute_cluster_info(data_points, groups))
    useEffect(() => {
        set_cluster_info(compute_cluster_info(data_points, groups))
    }, [data_points, groups])

    const [offset, set_offset] = useState({ x: NaN, y: NaN })
    const [zoom, set_zoom] = useState(1)
    useEffect(() => {
        const canvas = canvas_ref.current
        const gl = canvas.getContext('webgl')!

        const handleResize = () => {
            canvas.width = canvas.getBoundingClientRect().width
            canvas.height = canvas.getBoundingClientRect().height
            resize_webgl(gl, canvas.width, canvas.height)

            requestAnimationFrame(() => {
                if (rendering_context.current == null)
                    rendering_context.current = init_webgl(gl)
                draw_webgl(gl, rendering_context.current!, offset, zoom, cluster_info, selected_point)
            })
        }

        handleResize()
        window.addEventListener("resize", handleResize)
    }, [cluster_info, offset, zoom, selected_point])

    const [is_mouse_down, set_is_mouse_down] = useState(false)
    const [is_dragging_point, set_is_dragging_point] = useState(false)

    const compute_cursor_position = (event: React.MouseEvent) => {
        const bounding_rect = canvas_ref.current.getBoundingClientRect()
        return {
            x: event.clientX - bounding_rect.x,
            y: event.clientY - bounding_rect.y,
        }
    }

    const on_mouse_down = (event: React.MouseEvent) => {
        const cursor = compute_cursor_position(event)
        const point_under_cursor = find_point_under_cursor(data_points, offset, zoom, cursor)
        if (point_under_cursor !== undefined)
            set_is_dragging_point(true)
        set_selected_point(point_under_cursor)

        set_is_mouse_down(true)
    }

    const on_mouse_up = () => {
        set_is_dragging_point(false)
        set_is_mouse_down(false)
    }

    const on_mouse_drag = (event: React.MouseEvent,
                           cursor: { x: number, y: number }) => {
        const canvas = canvas_ref.current
        if (selected_point !== undefined && is_dragging_point) {
            canvas.style.cursor = 'pointer'
            data_points[selected_point] = {
                x: (cursor.x * zoom - offset.x) / grid_size_px,
                y: (cursor.y * zoom - offset.y) / grid_size_px,
            }

            set_data_points(data_points.splice(0))
        } else {
            set_offset({
                x: offset.x + event.movementX * zoom,
                y: offset.y + event.movementY * zoom,
            })
        }
    }

    const on_mouse_move = (event: React.MouseEvent) => {
        const canvas = canvas_ref.current
        canvas.style.cursor = 'default'

        const cursor = compute_cursor_position(event)
        if (is_mouse_down) {
            on_mouse_drag(event, cursor)
        } else if (find_point_under_cursor(data_points, offset, zoom, cursor) !== undefined) {
            canvas.style.cursor = 'pointer'
        }
    }

    const on_wheel = (event: React.WheelEvent) => {
        const delta = event.deltaY / (138.0 * 10.0) * zoom
        const new_zoom = zoom + delta

        const cursor = compute_cursor_position(event)
        set_zoom(new_zoom)
        set_offset({
            x: offset.x + cursor.x * delta,
            y: offset.y + cursor.y * delta,
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

