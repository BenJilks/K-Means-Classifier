/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import React, { useEffect, useRef, useState } from 'react'
import { DataPoint } from '../../data_point'
import { classify, group_data_points } from '../../classifier'
import styles from './index.module.css'

const grid_size_px = 100
const grid_color = '#999'

const grid_scale_width = 4
const grid_scale_color = '#000'
const selection_color = '#230FAA'

const point_radius = 10
const group_radius = 25
const group_colors = [
    '#F55',
    '#5F5',
    '#55F',
]

function draw_grid(canvas: HTMLCanvasElement,
                   context: CanvasRenderingContext2D,
                   offset: { x: number, y: number }) {
    // TODO: Replace this with just drawing textures,
    //       to improve performance.

    context.beginPath()
    context.strokeStyle = grid_color
    context.lineWidth = 1
    context.setLineDash([])

    const pixel_offset_x = offset.x % grid_size_px
    for (let x = 0; x < (canvas.width / grid_size_px) + 1; x++) {
        context.moveTo(x * grid_size_px + pixel_offset_x, 0)
        context.lineTo(x * grid_size_px + pixel_offset_x, canvas.height)
    }

    const pixel_offset_y = offset.y % grid_size_px
    for (let y = 0; y < (canvas.height / grid_size_px) + 1; y++) {
        context.moveTo(0, y * grid_size_px + pixel_offset_y)
        context.lineTo(canvas.width, y * grid_size_px + pixel_offset_y)
    }

    context.stroke()
}

function draw_axes(canvas: HTMLCanvasElement,
                    context: CanvasRenderingContext2D,
                    offset: { x: number, y: number }) {
    context.beginPath()
    context.strokeStyle = grid_scale_color
    context.lineWidth = grid_scale_width
    context.setLineDash([])

    if (offset.x >= -grid_scale_width && offset.x < canvas.width + grid_scale_width) {
        const pixel_offset_x = offset.x
        context.moveTo(pixel_offset_x, 0)
        context.lineTo(pixel_offset_x, canvas.height)
    }

    if (offset.y >= -grid_scale_width && offset.y < canvas.height + grid_scale_width) {
        const pixel_offset_y = offset.y
        context.moveTo(0, pixel_offset_y)
        context.lineTo(canvas.width, pixel_offset_y)
    }

    context.stroke()
}

function draw_data_points(context: CanvasRenderingContext2D,
                          offset: { x: number, y: number },
                          selected_point: number | undefined,
                          clusters: [DataPoint, number][][]) {
    for (let i = 0; i < clusters.length; i++) {
        for (const [point, index] of clusters[i]) {
            const [x, y] = [
                point.x * grid_size_px + offset.x,
                point.y * grid_size_px + offset.y,
            ]

            context.beginPath()
            context.fillStyle = group_colors[i % group_colors.length]
            context.arc(x, y, point_radius, 0, Math.PI * 2)
            context.fill()

            if (selected_point === index) {
                context.beginPath()
                context.strokeStyle = selection_color
                context.arc(x, y, point_radius + 10, 0, Math.PI * 2)
                context.stroke()
            }
        }
    }
}

function draw_groups(context: CanvasRenderingContext2D,
                     offset: { x: number, y: number },
                     groups: DataPoint[],
                     new_groups: DataPoint[]) {
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i]
        const new_group = new_groups[i]
        const [x, y] = [
            group.x * grid_size_px + offset.x,
            group.y * grid_size_px + offset.y,
        ]

        context.beginPath()
        context.strokeStyle = group_colors[i % group_colors.length]
        context.lineWidth = 5
        context.setLineDash([11, 6.2])
        context.arc(x, y, group_radius, 0, Math.PI * 2)
        context.stroke()

        const [new_x, new_y] = [
            new_group.x * grid_size_px + offset.x,
            new_group.y * grid_size_px + offset.y,
        ]
        context.beginPath()
        context.lineWidth = 3
        context.setLineDash([11/2, 6.2])
        context.arc(new_x, new_y, group_radius * 0.8, 0, Math.PI * 2)
        context.stroke()

        context.beginPath()
        context.moveTo(x, y)
        context.lineTo(new_x, new_y)
        context.stroke()
    }
}

type ClusterInfo = {
    data_points: DataPoint[],
    clusters: [DataPoint, number][][],
    groups: DataPoint[],
    new_groups: DataPoint[],
}

function draw(context: CanvasRenderingContext2D,
              canvas: HTMLCanvasElement,
              offset: { x: number, y: number },
              selected_point: number | undefined,
              cluster_info: ClusterInfo) {
    context.fillStyle = '#FFF'
    context.fillRect(0, 0, canvas.width, canvas.height)

    draw_grid(canvas, context, offset)
    draw_data_points(context, offset, selected_point, cluster_info.clusters)
    draw_groups(context, offset, cluster_info.groups, cluster_info.new_groups)
    draw_axes(canvas, context, offset)
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

function distance_squared(p1: { x: number, y: number },
                          p2: { x: number, y: number }): number {
    const a = p2.x - p1.x
    const b = p2.y - p1.y
    return a*a + b*b
}

function find_point_under_cursor(data_points: DataPoint[],
                                 offset: { x: number, y: number },
                                 cursor: { x: number, y: number }): number | undefined {
    for (let index = 0; index < data_points.length; index++) {
        const point = data_points[index]
        const point_in_view = {
            x: point.x * grid_size_px + offset.x,
            y: point.y * grid_size_px + offset.y,
        }

        const distance = distance_squared(point_in_view, cursor)
        if (distance <= point_radius*point_radius) {
            return index
        }
    }

    return undefined
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
    useEffect(() => {
        const canvas = canvas_ref.current
        const context = canvas.getContext('2d')!

        const handleResize = () => {
            canvas.width = canvas.getBoundingClientRect().width
            canvas.height = canvas.getBoundingClientRect().height
            requestAnimationFrame(() => {
                draw(context, canvas, offset, selected_point, cluster_info)
            })
        }

        handleResize()
        window.addEventListener("resize", handleResize)
    }, [cluster_info, offset, selected_point])

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
        const point_under_cursor = find_point_under_cursor(data_points, offset, cursor)
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
                x: (cursor.x - offset.x) / grid_size_px,
                y: (cursor.y - offset.y) / grid_size_px,
            }

            set_data_points(data_points.splice(0))
        } else {
            set_offset({
                x: offset.x + event.movementX,
                y: offset.y + event.movementY,
            })
        }
    }

    const on_mouse_move = (event: React.MouseEvent) => {
        const canvas = canvas_ref.current
        canvas.style.cursor = 'default'

        const cursor = compute_cursor_position(event)
        if (is_mouse_down) {
            on_mouse_drag(event, cursor)
        } else if (find_point_under_cursor(data_points, offset, cursor) !== undefined) {
            canvas.style.cursor = 'pointer'
        }
    }

    return (
        <div className={ styles.data_display }>
            <canvas
                ref={ canvas_ref }
                className={ styles.canvas }
                onMouseDown={ on_mouse_down }
                onMouseUp={ on_mouse_up }
                onMouseMove={ on_mouse_move }>
            </canvas>
        </div>
    )
}

