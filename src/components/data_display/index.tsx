import { useEffect, useRef, useState } from 'react'
import {DataPoint} from '../..'
import styles from './index.module.css'

const grid_size_px = 100
const grid_color = '#999'
const grid_scale_width = 4
const grid_scale_color = '#000'
const point_color = '#99F'
const point_radius = 10

function draw_grid(canvas: HTMLCanvasElement,
                   context: CanvasRenderingContext2D,
                   offset: { x: number, y: number }) {
    // TODO: Replace this with just drawing textures,
    //       to improve performance.

    context.beginPath()
    context.strokeStyle = grid_color
    context.lineWidth = 1

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
                          data_points: DataPoint[]) {
    for (const point of data_points) {
        const [x, y] = [
            point.x * grid_size_px + offset.x,
            point.y * grid_size_px + offset.y,
        ]

        context.beginPath()
        context.fillStyle = point_color
        context.arc(x, y, point_radius, 0, Math.PI * 2)
        context.fill()
    }
}

export default function DataDisplay({ data_points }: { data_points: DataPoint[] }) {
    const canvas_ref = useRef(document.createElement('canvas'))
    const [offset, set_offset] = useState({ x: NaN, y: NaN })
    const [is_mouse_down, set_is_mouse_down] = useState(false)

    useEffect(() => {
        const canvas = canvas_ref.current
        if (isNaN(offset.x) && isNaN(offset.y)) {
            const bounding_rect = canvas.getBoundingClientRect()
            set_offset({
                x: bounding_rect.width / 2,
                y: bounding_rect.height / 2,
            })

            return
        }

        const context = canvas.getContext('2d')!
        requestAnimationFrame(() => {
            canvas.width = canvas.getBoundingClientRect().width
            canvas.height = canvas.getBoundingClientRect().height

            context.fillStyle = '#FFF'
            context.fillRect(0, 0, canvas.width, canvas.height)
            draw_grid(canvas, context, offset)
            draw_data_points(context, offset, data_points)
            draw_axes(canvas, context, offset)
        })
    }, [offset, data_points])

    const on_mouse_down = () => set_is_mouse_down(true)
    const on_mouse_up = () => set_is_mouse_down(false)
    const on_mouse_move = (event: React.MouseEvent) => {
        if (!is_mouse_down)
            return

        set_offset({
            x: offset.x + event.movementX,
            y: offset.y + event.movementY,
        })
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

