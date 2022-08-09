import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import Settings from './components/settings'
import Splitter from './components/splitter'
import DataDisplay from './components/data_display'
import './index.css'

const default_point_count = 10
const default_group_count = 3

export type DataPoint = { x: number, y: number }

function Body() {
    const [data_points, set_data_points] = useState(
        new Array(default_point_count).fill({ x: 0, y: 0 }))

    const [groups, set_groups] = useState(
        new Array(default_group_count).fill(null).map((_, index) => {
            return {
                x: Math.sin(Math.PI * 2 * (index / default_group_count)) * 3,
                y: Math.cos(Math.PI * 2 * (index / default_group_count)) * 3,
            }
        }))

    return (
        <Splitter>
            <Settings data_points={ data_points } set_data_points={ set_data_points } />
            <DataDisplay data_points={ data_points } groups={ groups } />
        </Splitter>
    )
}

const root_element = document.getElementById("root")
document.title = 'K-Means Classifier'

if (root_element !== null) {
    const root = ReactDOM.createRoot(root_element)
    root.render(<Body />)
}

