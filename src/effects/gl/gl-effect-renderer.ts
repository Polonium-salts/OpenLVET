/**
 * High-performance WebGL GLSL Effect Filter Pipeline
 * Inspired by PixiJS Filters (https://github.com/pixijs/filters)
 */

import type { EffectPass, EffectUniformValue } from "../types";

const VERTEX_SHADER_SRC = `
attribute vec2 position;
varying vec2 v_uv;
void main() {
  v_uv = vec2(0.5, 0.5) * (position + vec2(1.0, 1.0));
  // Standard canvas coordinate orientation
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

function wrapFragmentShader(glsl: string): string {
	return `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_time;

vec4 getSourceColor(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return vec4(0.0);
  }
  return texture2D(u_texture, uv);
}

${glsl}

void main() {
  gl_FragColor = filterPixel(v_uv);
}
`;
}

export class GlEffectPipeline {
	private gl: WebGLRenderingContext | null = null;
	private canvas: HTMLCanvasElement | OffscreenCanvas | null = null;
	private programCache = new Map<string, WebGLProgram>();
	private positionBuffer: WebGLBuffer | null = null;
	private inputTexture: WebGLTexture | null = null;
	private pingPongTexture: WebGLTexture | null = null;

	constructor() {
		this.init();
	}

	private ensureInitialized(): boolean {
		if (!this.gl || !this.canvas) {
			this.init();
		}
		return Boolean(this.gl && this.canvas);
	}

	private init() {
		if (typeof OffscreenCanvas !== "undefined") {
			try {
				const canvas = new OffscreenCanvas(1, 1);
				const gl = canvas.getContext("webgl", {
					premultipliedAlpha: true,
					alpha: true,
					preserveDrawingBuffer: true,
				}) as WebGLRenderingContext | null;
				if (gl) {
					this.canvas = canvas;
					this.gl = gl;
					this.initBuffers();
					return;
				}
			} catch (e) {
				console.warn("OffscreenCanvas WebGL init skipped", e);
			}
		}

		if (typeof document !== "undefined") {
			try {
				const canvas = document.createElement("canvas");
				canvas.width = 1;
				canvas.height = 1;
				const gl = (canvas.getContext("webgl", {
					premultipliedAlpha: true,
					alpha: true,
					preserveDrawingBuffer: true,
				}) ||
					canvas.getContext(
						"experimental-webgl",
					)) as WebGLRenderingContext | null;
				if (gl) {
					this.canvas = canvas;
					this.gl = gl;
					this.initBuffers();
				}
			} catch (e) {
				console.warn("Document canvas WebGL init skipped", e);
			}
		}
	}

	private initBuffers() {
		const gl = this.gl;
		if (!gl) return;

		this.positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
			gl.STATIC_DRAW,
		);

		this.inputTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.inputTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		this.pingPongTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.pingPongTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	}

	private compileShader(type: number, source: string): WebGLShader | null {
		const gl = this.gl;
		if (!gl) return null;
		const shader = gl.createShader(type);
		if (!shader) return null;
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.warn("Effect shader compilation error:", gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	}

	private getProgram(glsl: string): WebGLProgram | null {
		const gl = this.gl;
		if (!gl) return null;

		const cached = this.programCache.get(glsl);
		if (cached) return cached;

		const vertexShader = this.compileShader(
			gl.VERTEX_SHADER,
			VERTEX_SHADER_SRC,
		);
		const fragmentShader = this.compileShader(
			gl.FRAGMENT_SHADER,
			wrapFragmentShader(glsl),
		);
		if (!vertexShader || !fragmentShader) return null;

		const program = gl.createProgram();
		if (!program) return null;

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.warn("Effect program link error:", gl.getProgramInfoLog(program));
			gl.deleteProgram(program);
			return null;
		}

		this.programCache.set(glsl, program);
		return program;
	}

	private setUniform(
		program: WebGLProgram,
		name: string,
		value: EffectUniformValue,
	) {
		const gl = this.gl;
		if (!gl) return;
		const loc = gl.getUniformLocation(program, name);
		if (!loc) return;

		if (typeof value === "boolean") {
			gl.uniform1i(loc, value ? 1 : 0);
		} else if (typeof value === "number") {
			gl.uniform1f(loc, value);
		} else if (Array.isArray(value)) {
			if (value.length === 2) {
				gl.uniform2fv(loc, new Float32Array(value));
			} else if (value.length === 3) {
				gl.uniform3fv(loc, new Float32Array(value));
			} else if (value.length === 4) {
				gl.uniform4fv(loc, new Float32Array(value));
			} else {
				gl.uniform1fv(loc, new Float32Array(value));
			}
		}
	}

	render({
		source,
		width,
		height,
		passes,
		time = 0,
	}: {
		source: CanvasImageSource;
		width: number;
		height: number;
		passes: EffectPass[];
		time?: number;
	}): HTMLCanvasElement | OffscreenCanvas | null {
		if (!this.ensureInitialized()) return null;
		const gl = this.gl;
		const canvas = this.canvas;
		if (!gl || !canvas || passes.length === 0) return null;

		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
		}

		gl.viewport(0, 0, width, height);

		let currentTexture = this.inputTexture;
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, currentTexture);
		try {
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				source as TexImageSource,
			);
		} catch (e) {
			console.warn("Failed to upload texture to WebGL effect pipeline", e);
			return null;
		}

		for (let passIdx = 0; passIdx < passes.length; passIdx++) {
			const pass = passes[passIdx];
			if (!pass.glsl) continue;
			const program = this.getProgram(pass.glsl);
			if (!program) continue;

			gl.useProgram(program);

			// Position buffer
			const posAttr = gl.getAttribLocation(program, "position");
			if (posAttr >= 0) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
				gl.enableVertexAttribArray(posAttr);
				gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
			}

			// Bind current input texture
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, currentTexture);

			const texLoc = gl.getUniformLocation(program, "u_texture");
			if (texLoc) gl.uniform1i(texLoc, 0);

			const resLoc = gl.getUniformLocation(program, "u_resolution");
			if (resLoc) gl.uniform2f(resLoc, width, height);

			const timeLoc = gl.getUniformLocation(program, "u_time");
			if (timeLoc) gl.uniform1f(timeLoc, time);

			// Custom uniforms
			for (const [key, val] of Object.entries(pass.uniforms)) {
				this.setUniform(program, key, val);
			}

			// Draw pass to canvas
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.drawArrays(gl.TRIANGLES, 0, 6);

			// If another pass follows, copy canvas pixels to ping-pong texture
			if (passIdx < passes.length - 1) {
				currentTexture =
					currentTexture === this.inputTexture
						? this.pingPongTexture
						: this.inputTexture;
				gl.bindTexture(gl.TEXTURE_2D, currentTexture);
				gl.copyTexImage2D(
					gl.TEXTURE_2D,
					0,
					gl.RGBA,
					0,
					0,
					width,
					height,
					0,
				);
			}
		}

		return canvas;
	}
}

export const glEffectPipeline = new GlEffectPipeline();
