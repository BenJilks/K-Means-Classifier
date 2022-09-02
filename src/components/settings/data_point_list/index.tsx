/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import React, { useEffect, useState } from 'react'
import { DataPoint } from '../../../data_point'
import styles from './index.module.css'

type DataPointProps = {
    key: string,
    is_selected: boolean,
    data_point: DataPoint,
    set_point: (point: DataPoint) => void,
    on_click: () => void,
    disabled: boolean,
}

function DataPointComponent({ key, is_selected, data_point, set_point, on_click, disabled }: DataPointProps) {
    const on_x_changed = (event: React.ChangeEvent<HTMLInputElement>) => {
        set_point({ x: parseFloat(event.target.value), y: data_point.y })
    }

    const on_y_changed = (event: React.ChangeEvent<HTMLInputElement>) => {
        set_point({ x: data_point.x, y: parseFloat(event.target.value) })
    }

    return (
        <li key={ key } className={ is_selected ? styles.data_point_selected : styles.data_point } onClick={ on_click }>
            <label>X</label>
            <input type="number" onChange={ on_x_changed } step={ 0.1 } value={ data_point.x } disabled={ disabled }></input>
            <label>Y</label>
            <input type="number" onChange={ on_y_changed } step={ 0.1 } value={ data_point.y } disabled={ disabled }></input>
        </li>
    )
}

type DataPointListProps = {
    points: DataPoint[],
    on_point_set: (index: number, point: DataPoint) => void,
    selected_point?: number,
    on_point_selected?: (index: number) => void,
    disabled?: boolean,
}

export default function DataPointList({ points,
                                        selected_point,
                                        on_point_set,
                                        on_point_selected,
                                        disabled }: DataPointListProps) {
    const [data_point_components, set_data_point_components] = useState([] as JSX.Element[])

    useEffect(() => {
        const create_point = (data_point: DataPoint, key: number) => {
            return DataPointComponent({
                key: key.toString(),
                is_selected: key === selected_point,
                data_point: data_point,
                set_point: point => on_point_set(key, point),
                on_click: () => on_point_selected !== undefined ? on_point_selected(key) : {},
                disabled: disabled ?? false,
            })
        }

        const components = points.map((data_point, key) => {
            return create_point(data_point, key)
        })

        set_data_point_components(components)
    }, [points, selected_point, on_point_set, on_point_selected, disabled])

    return (
        <ul className={ disabled ? styles.disabled : styles.data_point_list }>{ data_point_components }</ul>
    )
}
