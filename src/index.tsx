import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import Settings from './components/settings'
import Splitter from './components/splitter'
import DataDisplay from './components/data_display'
import './index.css'

const default_point_count = 10

export type DataPoint = { x: number, y: number }

function Body() {
    const [data_points, set_data_points] = useState(
        new Array(default_point_count).fill({ x: 0, y: 0 }))

    return (
        <Splitter>
            <Settings data_points={ data_points } set_data_points={ set_data_points } />
            <DataDisplay data_points={ data_points } />
        </Splitter>
    )
}

const root_element = document.getElementById("root")
document.title = 'K-Means Classifier'

if (root_element !== null) {
    const root = ReactDOM.createRoot(root_element)
    root.render(<Body />)
}

