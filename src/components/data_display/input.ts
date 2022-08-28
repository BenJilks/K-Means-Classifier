import { DataPoint } from '../../data_point'
import { grid_size_px, point_radius } from './draw'

function distance_squared(p1: { x: number, y: number },
                          p2: { x: number, y: number }): number {
    const a = p2.x - p1.x
    const b = p2.y - p1.y
    return a*a + b*b
}

export function find_point_under_cursor(data_points: DataPoint[],
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
