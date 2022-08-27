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
    const [data_points, set_data_points] = useState(
        generate_random_points(default_point_count))

    const [selected_point, set_selected_point] = useState(
        undefined as number | undefined)

    const [groups, set_groups] = useState(
        new Array(default_group_count).fill(null).map((_, index) => {
            return {
                x: Math.sin(Math.PI * 2 * (index / default_group_count)) * 3,
                y: Math.cos(Math.PI * 2 * (index / default_group_count)) * 3,
            }
        }))

    return (
        <Splitter>
            <Settings
                data_points={ data_points }
                groups={ groups }
                selected_point={ selected_point }
                set_data_points={ set_data_points }
                set_groups={ set_groups }
                set_selected_point={ set_selected_point } />

            <DataDisplay
                data_points={ data_points }
                selected_point={ selected_point }
                groups={ groups }
                set_selected_point={ set_selected_point }
                set_data_points={ set_data_points } />
        </Splitter>
    )
}

const root_element = document.getElementById("root")
document.title = 'K-Means Classifier'

if (root_element !== null) {
    const root = ReactDOM.createRoot(root_element)
    root.render(<Body />)
}

