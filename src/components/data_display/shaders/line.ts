/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

const line_shader_source = {
    vertex: `
        precision highp float;

        attribute vec4 position;
        uniform mat4 projection;
        uniform mat4 line_transform;
        uniform vec2 offset;
        varying vec2 v_position;

        void main() {
            v_position = position.xy;

            vec2 screen_position = (line_transform * position).xy + offset;
            gl_Position = projection * vec4(screen_position, 0.0, 1.0);
        }
    `,

    fragment: `
        precision highp float;

        uniform vec4 point_color;
        uniform float ring_gap_size;
        uniform float line_length;
        varying vec2 v_position;

        void main() {
            float line_position = (v_position.x / 2.0 + 0.5) * line_length;
            if (mod(line_position, ring_gap_size) < ring_gap_size / 2.0) {
                discard;
            }

            gl_FragColor = point_color;
        }
    `,
}

export default line_shader_source

