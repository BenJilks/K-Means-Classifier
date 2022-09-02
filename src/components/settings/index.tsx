/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import React from 'react'
import { DataPoint, DataSet } from '../../data_point'
import { classify } from '../../classifier'
import Randomizer, { RandomizerState } from './randomizer'
import DataPointList from './data_point_list'
import styles from './index.module.css'

type SettingsProps = {
    data_set: DataSet,
    selected_point: number | undefined,
    randomizer_state: RandomizerState,
    set_data_set: React.Dispatch<React.SetStateAction<DataSet>>,
    set_selected_point: React.Dispatch<React.SetStateAction<number | undefined>>,
    set_randomizer_state: React.Dispatch<React.SetStateAction<RandomizerState>>,
}

export default function Settings({ data_set,
                                   selected_point,
                                   randomizer_state,
                                   set_data_set,
                                   set_selected_point,
                                   set_randomizer_state }: SettingsProps) {
    const on_point_set = (key: number, new_point: DataPoint) => {
        data_set.points[key] = new_point
        set_data_set({
            points: data_set.points,
            groups: data_set.groups,
        })
    }

    const on_add_data_point = () => {
        set_data_set({
            points: data_set.points.concat({ x: 0, y: 0 }),
            groups: data_set.groups,
        })
    }

    const on_randomizer_toggle = () => {
        set_randomizer_state({
            is_open: !randomizer_state.is_open,
            enable_centers: randomizer_state.enable_centers,
            centers: randomizer_state.centers,
        })
    }

    const on_iterate = () => {
        set_data_set({
            points: data_set.points,
            groups: classify(data_set.points, data_set.groups),
        })
    }

    return (
        <div className={ styles.settings }>
            <button onClick={ on_randomizer_toggle }>
                Randomize Data { randomizer_state.is_open ? '<<' : '>>' }
            </button>
            <button onClick={ on_add_data_point }>Add Data Point</button>

            <DataPointList
                points={ data_set.points }
                selected_point={ selected_point }
                on_point_set={ on_point_set }
                on_point_selected={ set_selected_point }
            />

            <button onClick={ on_iterate }>Iterate</button>
            <Randomizer
                randomizer_state={ randomizer_state }
                data_set={ data_set }
                set_randomizer_state={ set_randomizer_state }
                set_data_set={ set_data_set }
            />
        </div>
    )
}

