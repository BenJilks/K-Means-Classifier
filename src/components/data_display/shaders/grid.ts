/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

export const grid_size_px = 100

const grid_color = 12.0 / 16.0
const grid_scale_width = 4
const grid_scale_color = 0

const grid_shader_source = {
    vertex: `
        precision highp float;

        attribute vec4 position;
        varying vec2 v_position;

        void main() {
            v_position = vec2(-position.x, position.y);
            gl_Position = position;
        }
    `,

    fragment: `
        precision highp float;

        uniform vec2 view_size;
        uniform vec2 offset;
        varying vec2 v_position;

        const vec3 background_color = vec3(1.0);
        const vec3 grid_color = vec3(${ grid_color });
        const vec3 axis_color = vec3(${ grid_scale_color }.0);

        void main() {
            vec2 grid_position = (v_position / 2.0 - 0.5) * view_size + offset;
            vec3 color = background_color;

            if (mod(grid_position.x, ${ grid_size_px }.0) < 2.0 || mod(grid_position.y, ${ grid_size_px }.0) < 2.0) {
                color = grid_color;
            }
            if (abs(grid_position.x) < ${ grid_scale_width / 2 }.0 || abs(grid_position.y) < ${ grid_scale_width / 2 }.0) {
                color = axis_color;
            }

            gl_FragColor = vec4(color, 1.0);
        }
    `,
}

export default grid_shader_source

