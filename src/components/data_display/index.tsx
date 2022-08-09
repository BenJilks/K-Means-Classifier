import { useEffect, useRef, useState } from 'react'
import styles from './index.module.css'

const grid_size_px = 100
const grid_color = '#999'

export default function DataDisplay() {
    const canvas_ref = useRef(document.createElement('canvas'))
    const [offset, set_offset] = useState({ x: 0, y: 0 })
    const [is_mouse_down, set_is_mouse_down] = useState(false)

    useEffect(() => {
        const canvas = canvas_ref.current
        const context = canvas.getContext('2d')!
        canvas.width = canvas.getBoundingClientRect().width
        canvas.height = canvas.getBoundingClientRect().height

        // TODO: Replace this with just drawing textures,
        //       to improve performance.

        context.fillStyle = '#FFF'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.lineWidth = 1
        context.strokeStyle = grid_color

        const start_x = offset.x % grid_size_px
        for (let x = 0; x < (canvas.width / grid_size_px) + 1; x++) {
            context.moveTo(x * grid_size_px + start_x, 0)
            context.lineTo(x * grid_size_px + start_x, canvas.height)
        }

        const start_y = offset.y % grid_size_px
        for (let y = 0; y < (canvas.height / grid_size_px) + 1; y++) {
            context.moveTo(0, y * grid_size_px + start_y)
            context.lineTo(canvas.width, y * grid_size_px + start_y)
        }

        context.stroke()
    }, [offset])

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

