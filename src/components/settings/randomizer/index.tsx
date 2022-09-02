/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import React, { useState } from 'react'
import {DataPoint, DataSet, generate_random_points} from '../../../data_point'
import DataPointList from '../data_point_list'
import styles from './index.module.css'

export type RandomizerState = {
    is_open: boolean,
    enable_centers: boolean,
    centers: DataPoint[],
}

export function create_randomizer_state(): RandomizerState {
    const angle_offset = Math.random() * Math.PI
    const centers = new Array(3).fill(0).map((_, index) => {
        const radius = Math.random() * 4 + 2
        const angle_variant = (Math.random() - 0.5) * Math.PI * 0.2
        const angle = angle_offset + angle_variant + Math.PI * 2 * (index / 3)
        return {
            x: round(Math.sin(angle) * radius),
            y: round(Math.cos(angle) * radius),
        }
    })

    return {
        is_open: false,
        enable_centers: false,
        centers,
    }
}

type RandomizerProps = {
    randomizer_state: RandomizerState,
    data_set: DataSet,
    set_randomizer_state: React.Dispatch<React.SetStateAction<RandomizerState>>,
    set_data_set: React.Dispatch<React.SetStateAction<DataSet>>,
}

function round(n: number) {
    return Math.round(n * 1000) / 1000
}

export default function Randomizer({ randomizer_state,
                                     data_set,
                                     set_randomizer_state,
                                     set_data_set }: RandomizerProps) {
    const [count, set_count] = useState(data_set.points.length)
    const [spread, set_spread] = useState(6)

    const on_point_set = (index: number, point: DataPoint) => {
        randomizer_state.centers[index] = point
        set_randomizer_state({
            is_open: randomizer_state.is_open,
            enable_centers: randomizer_state.enable_centers,
            centers: randomizer_state.centers.splice(0),
        })
    }

    const set_enable_centers = (enable_centers: boolean) => {
        set_randomizer_state({
            is_open: randomizer_state.is_open,
            enable_centers: enable_centers,
            centers: randomizer_state.centers,
        })
    }

    const on_randomize = () => {
        const points = randomizer_state.enable_centers
            ? generate_random_points(count, spread, randomizer_state.centers)
            : generate_random_points(count, spread)

        set_data_set({
            points: points,
            groups: data_set.groups,
        })
    }

    return (
        <div className={ randomizer_state.is_open ? styles.randomizer : styles.closed }>
            <button onClick={ on_randomize }>Randomize</button>
            <div className={ styles.options }>
                <label>Count</label>
                <input type='number' value={ count } onChange={ e => set_count(parseFloat(e.target.value)) } />

                <label>Spread</label>
                <input type='number' value={ spread } onChange={ e => set_spread(parseFloat(e.target.value)) } />
            </div>

            <label>
                <input
                    type='checkbox'
                    checked={ randomizer_state.enable_centers }
                    onChange={ e => set_enable_centers(e.target.checked) }
                />
                Generate Around Centers
            </label>

            <DataPointList
                points={ randomizer_state.centers }
                on_point_set={ on_point_set }
                disabled={ !randomizer_state.enable_centers }
            />
        </div>
    )
}
