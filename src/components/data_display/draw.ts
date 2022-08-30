/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import { mat4, vec2, vec3 } from 'gl-matrix'
import { ClusterInfo } from '.'
import { DataPoint } from '../../data_point'
import grid_shader_source, { grid_size_px } from './shaders/grid'
import point_shader_source, { point_radius } from './shaders/point'
import ring_shader_source from './shaders/ring'
import line_shader_source from './shaders/line'

const selection_color = [0.14, 0.06, 0.67, 1.0]
const new_group_alpha = 0.8
const group_radius = 25
const group_colors = [
    [1.0, 0.33, 0.33, 1.0],
    [0.33, 1.0, 0.33, 1.0],
    [0.33, 0.33, 1.0, 1.0],
]

type ShaderSource = {
    vertex: string,
    fragment: string,
}

type Shader = {
    program: WebGLProgram,
    position: number,

    projection: WebGLUniformLocation | null,
    view_size: WebGLUniformLocation | null,
    offset: WebGLUniformLocation | null,

    point_position: WebGLUniformLocation | null,
    point_color: WebGLUniformLocation | null,

    ring_width: WebGLUniformLocation | null,
    ring_radius: WebGLUniformLocation | null,
    ring_gap_size: WebGLUniformLocation | null,

    line_transform: WebGLUniformLocation | null,
    line_length: WebGLUniformLocation | null,
}

export type DisplayContext = {
    grid_shader: Shader,
    point_shader: Shader,
    ring_shader: Shader,
    line_shader: Shader,
    quad: WebGLBuffer,
}

function load_shader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type)
    if (shader == null)
        return null

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(
            `Error compiling shader: ` +
            `'${ gl.getShaderInfoLog(shader) }'`)
        gl.deleteShader(shader)
        return null
    }

    return shader
}

function load_shader_program(gl: WebGLRenderingContext, source: ShaderSource): Shader | null {
    const vertex_shader = load_shader(gl, gl.VERTEX_SHADER, source.vertex)
    const fragment_shader = load_shader(gl, gl.FRAGMENT_SHADER, source.fragment)
    if (vertex_shader == null || fragment_shader == null)
        return null

    const program = gl.createProgram()
    if (program == null)
        return null
    
    gl.attachShader(program, vertex_shader)
    gl.attachShader(program, fragment_shader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(
            `Error linking shaders: ` +
            `'${ gl.getShaderInfoLog(program) }'`)
        return null
    }

    const position = gl.getAttribLocation(program, 'position')
    return {
        program,
        position,

        projection: gl.getUniformLocation(program, 'projection'),
        view_size: gl.getUniformLocation(program, 'view_size'),
        offset: gl.getUniformLocation(program, 'offset'),

        point_position: gl.getUniformLocation(program, 'point_position'),
        point_color: gl.getUniformLocation(program, 'point_color'),

        ring_width: gl.getUniformLocation(program, 'ring_width'),
        ring_radius: gl.getUniformLocation(program, 'ring_radius'),
        ring_gap_size: gl.getUniformLocation(program, 'ring_gap_size'),

        line_transform: gl.getUniformLocation(program, 'line_transform'),
        line_length: gl.getUniformLocation(program, 'line_length'),
    }
}

function create_quad(gl: WebGLRenderingContext): WebGLBuffer | null {
    const quad_positions = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0,
    ]

    const position_buffer = gl.createBuffer()
    if (position_buffer == null)
        return null

    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad_positions), gl.STATIC_DRAW)
    return position_buffer
}

export function init_webgl(gl: WebGLRenderingContext): DisplayContext | null {
    const grid_shader = load_shader_program(gl, grid_shader_source)
    const point_shader = load_shader_program(gl, point_shader_source)
    const ring_shader = load_shader_program(gl, ring_shader_source)
    const line_shader = load_shader_program(gl, line_shader_source)
    if (grid_shader == null || point_shader == null || ring_shader == null || line_shader == null)
        return null

    const quad = create_quad(gl)
    if (quad == null)
        return null

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    return {
        grid_shader,
        point_shader,
        ring_shader,
        line_shader,
        quad,
    }
}

export function resize_webgl(gl: WebGLRenderingContext, width: number, height: number) {
    gl.viewport(0, 0, width, height)
}

function bind_shader(gl: WebGLRenderingContext,
                     shader: Shader,
                     offset: { x: number, y: number }) {
    const width = gl.canvas.width
    const height = gl.canvas.height
    const projection_matrix = mat4.ortho(mat4.create(), 0, width, height, 0, -1, 1)

    gl.useProgram(shader.program)
    gl.uniformMatrix4fv(shader.projection, false, projection_matrix)
    gl.uniform2f(shader.view_size, width, height)
    gl.uniform2f(shader.offset, Math.round(offset.x), Math.round(offset.y))
}

function draw_buffer(gl: WebGLRenderingContext, shader: Shader, buffer: WebGLBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    gl.vertexAttribPointer(shader.position, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(shader.position)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

function draw_grid(gl: WebGLRenderingContext,
                   grid_shader: Shader,
                   quad: WebGLBuffer,
                   offset: { x: number, y: number }) {
    bind_shader(gl, grid_shader, offset)
    draw_buffer(gl, grid_shader, quad)
}

function draw_data_points(gl: WebGLRenderingContext,
                          point_shader: Shader,
                          quad: WebGLBuffer,
                          offset: { x: number, y: number },
                          cluster_info: ClusterInfo) {
    bind_shader(gl, point_shader, offset)

    for (let i = 0; i < cluster_info.clusters.length; i++) {
        const cluster = cluster_info.clusters[i]
        gl.uniform4fv(point_shader.point_color, group_colors[i])

        for (const [point] of cluster) {
            gl.uniform2f(point_shader.point_position, point.x * grid_size_px, point.y * grid_size_px)
            draw_buffer(gl, point_shader, quad)
        }
    }
}

function draw_groups(gl: WebGLRenderingContext,
                     ring_shader: Shader,
                     quad: WebGLBuffer,
                     offset: { x: number, y: number },
                     cluster_info: ClusterInfo) {
    bind_shader(gl, ring_shader, offset)

    const draw_group = (index: number, group: DataPoint, alpha: number) => {
        const color = group_colors[index]
        gl.uniform4fv(ring_shader.point_color, [color[0], color[1], color[2], alpha])
        gl.uniform2f(ring_shader.point_position, group.x * grid_size_px, group.y * grid_size_px)
        draw_buffer(gl, ring_shader, quad)
    }

    gl.uniform1f(ring_shader.ring_width, 0.3)
    gl.uniform1f(ring_shader.ring_radius, group_radius)
    gl.uniform1f(ring_shader.ring_gap_size, Math.PI * 0.25)
    for (let i = 0; i < cluster_info.groups.length; i++) {
        draw_group(i, cluster_info.groups[i], 1.0)
    }

    gl.uniform1f(ring_shader.ring_width, 0.2)
    gl.uniform1f(ring_shader.ring_radius, group_radius * 0.8)
    gl.uniform1f(ring_shader.ring_gap_size, Math.PI * 0.2)
    for (let i = 0; i < cluster_info.new_groups.length; i++) {
        draw_group(i, cluster_info.new_groups[i], new_group_alpha)
    }
}

function draw_new_group_lines(gl: WebGLRenderingContext,
                              line_shader: Shader,
                              quad: WebGLBuffer,
                              offset: { x: number, y: number },
                              cluster_info: ClusterInfo) {
    bind_shader(gl, line_shader, offset)

    gl.uniform1f(line_shader.ring_gap_size, 10)
    for (let i = 0; i < cluster_info.groups.length; i++) {
        const start = cluster_info.groups[i]
        const end = cluster_info.new_groups[i]

        const length = vec2.dist(vec2.fromValues(start.x, start.y), vec2.fromValues(end.x, end.y)) * grid_size_px
        const angle = Math.atan((end.y - start.y) / (end.x - start.x))
        const position = vec3.fromValues(
            ((end.x - start.x) / 2 + start.x) * grid_size_px,
            ((end.y - start.y) / 2 + start.y) * grid_size_px,
            0)

        let transform = mat4.identity(mat4.create())
        mat4.translate(transform, transform, position)
        mat4.rotateZ(transform, transform, angle)
        mat4.scale(transform, transform, vec3.fromValues(length / 2, 2, 1))

        const color = group_colors[i]
        gl.uniform4fv(line_shader.point_color, [color[0], color[1], color[2], new_group_alpha])
        gl.uniform1f(line_shader.line_length, length)
        gl.uniformMatrix4fv(line_shader.line_transform, false, transform)
        draw_buffer(gl, line_shader, quad)
    }
}

function find_selected_point(cluster_info: ClusterInfo, selected_point: number | undefined): DataPoint | null {
    if (selected_point === undefined) {
        return null
    }

    for (const cluster of cluster_info.clusters) {
        for (const [point, i] of cluster) {
            if (i === selected_point) {
                return point
            }
        }
    }

    return null
}

function draw_selected_point(gl: WebGLRenderingContext,
                             ring_shader: Shader,
                             quad: WebGLBuffer,
                             offset: { x: number, y: number },
                             cluster_info: ClusterInfo,
                             selected_point: number | undefined) {
    const selected = find_selected_point(cluster_info, selected_point)
    if (selected == null) {
        return
    }

    bind_shader(gl, ring_shader, offset)

    gl.uniform1f(ring_shader.ring_width, 0.1)
    gl.uniform1f(ring_shader.ring_radius, point_radius * 1.5)
    gl.uniform1f(ring_shader.ring_gap_size, 0)
    gl.uniform2f(ring_shader.point_position, selected.x * grid_size_px, selected.y * grid_size_px)
    gl.uniform4fv(ring_shader.point_color, selection_color)
    draw_buffer(gl, ring_shader, quad)
}

export function draw_webgl(gl: WebGLRenderingContext,
                           { grid_shader, point_shader, ring_shader, line_shader, quad }: DisplayContext,
                           offset: { x: number, y: number },
                           cluster_info: ClusterInfo,
                           selected_point: number | undefined) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    draw_grid(gl, grid_shader, quad, offset)
    draw_data_points(gl, point_shader, quad, offset, cluster_info)
    draw_new_group_lines(gl, line_shader, quad, offset, cluster_info)
    draw_groups(gl, ring_shader, quad, offset, cluster_info)
    draw_selected_point(gl, ring_shader, quad, offset, cluster_info, selected_point)
}

