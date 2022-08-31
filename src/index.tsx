/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import { useState } from 'react'
import { generate_random_points } from './data_point'
import ReactDOM from 'react-dom/client'
import Settings from './components/settings'
import Splitter from './components/splitter'
import DataDisplay from './components/data_display'
import './index.css'

const default_point_count = 30
const default_group_count = 3

function Body() {
    const [data_set, set_data_set] = useState({
        points: generate_random_points(default_point_count),
        groups: new Array(default_group_count).fill(null).map((_, index) => {
            return {
                x: Math.sin(Math.PI * 2 * (index / default_group_count)) * 3,
                y: Math.cos(Math.PI * 2 * (index / default_group_count)) * 3,
            }
        })
    })

    const [selected_point, set_selected_point] = useState(
        undefined as number | undefined)

    return (
        <Splitter>
            <Settings
                data_set={ data_set }
                selected_point={ selected_point }
                set_data_set={ set_data_set }
                set_selected_point={ set_selected_point } />

            <DataDisplay
                data_set={ data_set }
                selected_point={ selected_point }
                set_data_set={ set_data_set }
                set_selected_point={ set_selected_point } />
        </Splitter>
    )
}

const root_element = document.getElementById("root")
document.title = 'K-Means Classifier'

if (root_element !== null) {
    const root = ReactDOM.createRoot(root_element)
    root.render(<Body />)
}

