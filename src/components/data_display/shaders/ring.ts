/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

const ring_shader_source = {
    vertex: `
        precision highp float;

        attribute vec4 position;
        uniform mat4 projection;
        uniform vec2 offset;
        uniform vec2 point_position;
        uniform float point_radius;
        varying vec2 v_position;

        void main() {
            v_position = position.xy;

            vec2 screen_position = position.xy * vec2(point_radius) + offset + point_position;
            gl_Position = projection * vec4(screen_position, 0.0, 1.0);
        }
    `,

    fragment: `
        precision highp float;

        uniform vec4 point_color;
        uniform float ring_width;
        uniform float ring_gap_size;
        varying vec2 v_position;

        void main() {
            float distance = v_position.x*v_position.x + v_position.y*v_position.y;
            if (distance < 1.0 - ring_width || distance > 1.0) {
                discard;
            }

            float angle = atan(v_position.y / v_position.x);
            if (mod(angle, ring_gap_size) < ring_gap_size * 0.35) {
                discard;
            }

            gl_FragColor = point_color;
        }
    `,
}

export default ring_shader_source

