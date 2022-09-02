/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

const random_decimal_places = 3
const random_scale = 6

export type DataPoint = { x: number, y: number }
export type DataSet = {
    points: DataPoint[],
    groups: DataPoint[],
}

export function generate_random_points(count: number,
                                       spread: number = random_scale,
                                       centers: DataPoint[] = [{ x: 0, y: 0 }]): DataPoint[] {
    const decimal_places = 10 ** random_decimal_places
    const round = (x: number) =>
        Math.round(x * decimal_places) / decimal_places

    const new_points = new Array(count)
    for (let i = 0; i < count; i++) {
        const center = centers[Math.round(Math.random() * (centers.length-1))]
        const rotation = Math.random() * Math.PI * 2
        const radius = Math.random() * spread
        new_points[i] = {
            x: center.x + round(Math.sin(rotation) * radius),
            y: center.y + round(Math.cos(rotation) * radius),
        }
    }

    return new_points
}

export function distance_squared(point_a: DataPoint, point_b: DataPoint): number {
    const a = point_b.x - point_a.x
    const b = point_b.y - point_a.y
    return a*a + b*b
}

