/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import React, { useEffect, useState } from 'react'
import { DataPoint, generate_random_points } from '../../data_point'
import { classify } from '../../classifier'
import styles from './index.module.css'

type DataPointProps = {
    key: string,
    is_selected: boolean,
    data_point: DataPoint,
    set_point: (point: DataPoint) => void
    on_click: () => void
}

function DataPointComponent({ key, is_selected, data_point, set_point, on_click }: DataPointProps) {
    const on_x_changed = (event: React.ChangeEvent<HTMLInputElement>) => {
        set_point({ x: parseFloat(event.target.value), y: data_point.y })
    }

    const on_y_changed = (event: React.ChangeEvent<HTMLInputElement>) => {
        set_point({ x: data_point.x, y: parseFloat(event.target.value) })
    }

    return (
        <li key={ key } className={ is_selected ? styles.data_point_selected : styles.data_point } onClick={ on_click }>
            <label>X</label>
            <input type="number" onChange={ on_x_changed } step={ 0.1 } value={ data_point.x }></input>
            <label>Y</label>
            <input type="number" onChange={ on_y_changed } step={ 0.1 } value={ data_point.y }></input>
        </li>
    )
}

type SettingsProps = {
    data_points: DataPoint[],
    groups: DataPoint[],
    selected_point: number | undefined,
    set_data_points: React.Dispatch<React.SetStateAction<DataPoint[]>>,
    set_groups: React.Dispatch<React.SetStateAction<DataPoint[]>>,
    set_selected_point: React.Dispatch<React.SetStateAction<number | undefined>>,
}

export default function Settings({ data_points,
                                   groups,
                                   selected_point,
                                   set_data_points,
                                   set_groups,
                                   set_selected_point }: SettingsProps) {
    const [data_point_components, set_data_point_components] = useState([] as JSX.Element[])

    useEffect(() => {
        const on_point_set = (key: number, new_point: DataPoint) => {
            data_points[key] = new_point
            set_data_points(data_points.splice(0))
        }
            
        const create_point = (data_point: DataPoint, key: number) => {
            return DataPointComponent({
                key: key.toString(),
                is_selected: key === selected_point,
                data_point: data_point,
                set_point: point => on_point_set(key, point),
                on_click: () => set_selected_point(key),
            })
        }

        const components = data_points.map((data_point, key) => {
            return create_point(data_point, key)
        })

        set_data_point_components(components)
    }, [data_points, selected_point, set_data_points, set_selected_point])

    const on_add_data_point = () => {
        set_data_points(data_points.concat({ x: 0, y: 0 }))
    }

    const on_randomize_data = () => {
        set_data_points(generate_random_points(data_points.length))
    }

    const on_iterate = () => {
        set_groups(classify(data_points, groups))
    }

    return (
        <div className={ styles.settings }>
            <button onClick={ on_randomize_data }>Randomize Data</button>
            <button onClick={ on_add_data_point }>Add Data Point</button>
            <ul className={ styles.data_point_list }>{ data_point_components }</ul>
            <button onClick={ on_iterate }>Iterate</button>
        </div>
    )
}

