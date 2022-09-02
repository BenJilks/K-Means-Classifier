/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import { DataPoint } from '../../data_point'
import { grid_size_px } from './shaders/grid'
import { point_radius } from './shaders/point'
import { ViewState } from '.'

function distance_squared(p1: { x: number, y: number },
                          p2: { x: number, y: number }): number {
    const a = p2.x - p1.x
    const b = p2.y - p1.y
    return a*a + b*b
}

export function find_point_under_cursor(data_points: DataPoint[],
                                        { offset, zoom }: ViewState,
                                        cursor: { x: number, y: number },
                                        radius = point_radius): number | undefined {
    for (let index = 0; index < data_points.length; index++) {
        const point = data_points[index]
        const point_in_view = {
            x: (point.x * grid_size_px + offset.x) / zoom,
            y: (point.y * grid_size_px + offset.y) / zoom,
        }

        const distance = distance_squared(point_in_view, cursor)
        const view_radius = radius / zoom
        if (distance <= view_radius*view_radius) {
            return index
        }
    }

    return undefined
}

