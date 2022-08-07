import { useEffect, useRef } from 'react'
import styles from './index.module.css'

export default function DataDisplay() {
    const canvas_ref = useRef(document.createElement('canvas'))
    useEffect(() => {
        const canvas = canvas_ref.current
        const context = canvas.getContext('2d')!
        context.fillStyle = '#000'
        context.fillRect(0, 0, canvas.width, canvas.height)
    })

    return (
        <div className={ styles.data_display }>
            <canvas ref={ canvas_ref } className={ styles.canvas }></canvas>
        </div>
    )
}

