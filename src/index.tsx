import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import Settings from './components/settings'
import Splitter from './components/splitter'
import DataDisplay from './components/data_display'
import './index.css'

const default_point_count = 30
const default_group_count = 3

const random_decimal_places = 3
const random_scale = 6

export type DataPoint = { x: number, y: number }

export function generate_random_points(count: number): DataPoint[] {
    const decimal_places = 10 ** random_decimal_places
    const round = (x: number) =>
        Math.round(x * decimal_places) / decimal_places

    const new_points = new Array(count)
    for (let i = 0; i < count; i++) {
        const rotation = Math.random() * Math.PI * 2
        const radius = Math.random() * random_scale
        new_points[i] = {
            x: round(Math.sin(rotation) * radius),
            y: round(Math.cos(rotation) * radius),
        }
    }

    return new_points
}

function Body() {
    const [data_points, set_data_points] = useState(
        generate_random_points(default_point_count))

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
                set_data_points={ set_data_points }
                set_groups={ set_groups } />
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

