/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

export const point_radius = 15

const point_shader_source = {
    vertex: `
        precision highp float;

        attribute vec4 position;
        uniform mat4 projection;
        uniform vec2 offset;
        uniform vec2 point_position;
        varying vec2 v_position;

        const vec2 scale = vec2(${ point_radius }.0);

        void main() {
            v_position = position.xy;

            vec2 screen_position = position.xy * scale + offset + point_position;
            gl_Position = projection * vec4(screen_position, 0.0, 1.0);
        }
    `,

    fragment: `
        precision highp float;

        uniform vec4 point_color;
        varying vec2 v_position;

        void main() {
            if (v_position.x*v_position.x + v_position.y*v_position.y > 1.0) {
                discard;
            }

            gl_FragColor = point_color;
        }
    `,
}

export default point_shader_source

