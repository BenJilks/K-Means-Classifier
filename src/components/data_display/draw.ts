import { ClusterInfo } from '.'
import { DataPoint } from '../../data_point'

export const grid_size_px = 100
export const point_radius = 10
const grid_color = '#999'

const grid_scale_width = 4
const grid_scale_color = '#000'
const selection_color = '#230FAA'

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

export function draw(context: CanvasRenderingContext2D,
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

