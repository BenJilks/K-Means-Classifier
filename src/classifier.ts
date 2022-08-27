import { DataPoint } from '.'

export function classify(data_points: DataPoint[], groups: DataPoint[]): DataPoint[] {
    const clusters = group_data_points(data_points, groups)
    const new_groups: DataPoint[] = []
    for (const cluster of clusters) {
        new_groups.push({
            x: cluster.map(({ x }) => x).reduce((x, a) => x + a, 0) / cluster.length,
            y: cluster.map(({ y }) => y).reduce((x, a) => x + a, 0) / cluster.length,
        })
    }

    return new_groups
}

function distance_squared(point_a: DataPoint, point_b: DataPoint): number {
    const a = point_b.x - point_a.x
    const b = point_b.y - point_a.y
    return a*a + b*b
}

export function group_data_points(data_points: DataPoint[], groups: DataPoint[]): DataPoint[][] {
    const clusters: DataPoint[][] = new Array(groups.length).fill(null).map(_ => [])
    for (const point of data_points) {
        let min_distance_squared = Infinity
        let min_group_index = -1
        for (let i = 0; i < groups.length; i++) {
            const distance = distance_squared(point, groups[i])
            if (distance <= min_distance_squared) {
                min_group_index = i
                min_distance_squared = distance
            }
        }

        clusters[min_group_index].push(point)
    }

    return clusters
}

