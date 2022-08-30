/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import { DataPoint, distance_squared } from './data_point'

export function classify(data_points: DataPoint[], groups: DataPoint[]): DataPoint[] {
    const clusters = group_data_points(data_points, groups)
    const new_groups: DataPoint[] = []
    for (const cluster of clusters) {
        new_groups.push({
            x: cluster.map(([{ x }]) => x).reduce((x, a) => x + a, 0) / cluster.length,
            y: cluster.map(([{ y }]) => y).reduce((x, a) => x + a, 0) / cluster.length,
        })
    }

    return new_groups
}

export function group_data_points(data_points: DataPoint[], groups: DataPoint[]): [DataPoint, number][][] {
    const clusters = new Array(groups.length)
        .fill(null)
        .map(_ => [] as [DataPoint, number][])

    for (let i = 0; i < data_points.length; i++) {
        const point = data_points[i]
        if (point === undefined) {
            continue
        }

        let min_distance_squared = Infinity
        let min_group_index = -1
        for (let i = 0; i < groups.length; i++) {
            const distance = distance_squared(point, groups[i])
            if (distance <= min_distance_squared) {
                min_group_index = i
                min_distance_squared = distance
            }
        }

        clusters[min_group_index].push([point, i])
    }

    return clusters
}

