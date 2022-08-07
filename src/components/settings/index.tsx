import { useEffect, useState } from 'react'
import styles from './index.module.css'

const default_point_count = 10
const random_decimal_places = 3

type DataPoint = { x: number, y: number }
type DataPointProps = {
    key: string,
    data_point: DataPoint,
    set_point: (point: DataPoint) => void
}

function DataPointComponent({ key, data_point, set_point }: DataPointProps) {
    const on_x_changed = (event: React.ChangeEvent<HTMLInputElement>) => {
        set_point({ x: parseFloat(event.target.value), y: data_point.y })
    }

    const on_y_changed = (event: React.ChangeEvent<HTMLInputElement>) => {
        set_point({ x: data_point.x, y: parseFloat(event.target.value) })
    }

    return (
        <li key={ key } className={ styles.data_point }>
            <label>X</label>
            <input type="number" onChange={ on_x_changed } step={ 0.1 } value={ data_point.x }></input>
            <label>Y</label>
            <input type="number" onChange={ on_y_changed } step={ 0.1 } value={ data_point.y }></input>
        </li>
    )
}

export default function Settings() {
    const [data_point_components, set_data_point_components] = useState([] as JSX.Element[])
    const [data_points, set_data_points] = useState(
        new Array(default_point_count).fill({ x: 0, y: 0 }))

    useEffect(() => {
        const on_point_set = (key: number, new_point: DataPoint) => {
            data_points[key] = new_point
            set_data_points(data_points.splice(0))
        }
            
        const create_point = (data_point: DataPoint, key: number) => {
            return DataPointComponent({
                key: key.toString(),
                data_point: data_point,
                set_point: point => on_point_set(key, point),
            })
        }

        const components = data_points.map((data_point, key) => {
            return create_point(data_point, key)
        })

        set_data_point_components(components)
    }, [data_points])

    const on_add_data_point = () => {
        set_data_points(data_points.concat({ x: 0, y: 0 }))
    }

    const on_randomize_data = () => {
        const decimal_places = 10 ** random_decimal_places
        const pick_random = () =>
            Math.round((Math.random()*20 - 10) * decimal_places) / decimal_places

        const new_points = new Array(data_points.length)
        for (let i = 0; i < data_points.length; i++) {
            new_points[i] = { x: pick_random(), y: pick_random() }
        }
        
        set_data_points(new_points)
    }

    return (
        <div className={ styles.settings }>
            <h1>Data Points</h1>
            <ul className={ styles.data_point_list }>{ data_point_components }</ul>
            <button onClick={ on_add_data_point }>Add Data Point</button>
            <button onClick={ on_randomize_data }>Randomize Data</button>
        </div>
    )
}
