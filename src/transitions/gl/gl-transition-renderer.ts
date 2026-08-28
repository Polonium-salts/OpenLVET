/**
 * High-performance WebGL GLSL Transition Renderer
 * Compatible with standard gl-transitions specifications (https://github.com/gl-transitions/gl-transitions)
 */

type UniformMap = Record<string, number | number[] | boolean>;

const VERTEX_SHADER_SRC = `
attribute vec2 position;
varying vec2 _uv;
void main() {
  _uv = vec2(0.5, 0.5) * (position + vec2(1.0, 1.0));
  // Flip Y coordinate for standard canvas coordinate orientation
  _uv.y = 1.0 - _uv.y;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

function buildFragmentShaderSrc(glsl: string): string {
	return `
precision highp float;
varying vec2 _uv;
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform float ratio;

vec4 getFromColor(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return vec4(0.0);
  }
  return texture2D(from, uv);
}

vec4 getToColor(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return vec4(0.0);
  }
  return texture2D(to, uv);
}

${glsl}

void main() {
  gl_FragColor = transition(_uv);
}
`;
}

class GlTransitionPipeline {
	private gl: WebGLRenderingContext | null = null;
	private canvas: HTMLCanvasElement | OffscreenCanvas | null = null;
	private programCache = new Map<string, WebGLProgram>();
	private positionBuffer: WebGLBuffer | null = null;
	private fromTexture: WebGLTexture | null = null;
	private toTexture: WebGLTexture | null = null;

	constructor() {
		this.init();
	}

	private init() {
		if (typeof document !== "undefined") {
			const canvas = document.createElement("canvas");
			canvas.width = 1;
			canvas.height = 1;
			const gl =
				canvas.getContext("webgl", {
					premultipliedAlpha: true,
					alpha: true,
					preserveDrawingBuffer: true,
				}) ||
				(canvas.getContext(
					"experimental-webgl",
				) as WebGLRenderingContext | null);
			if (gl) {
				this.canvas = canvas;
				this.gl = gl;
				this.initBuffers();
			}
		} else if (typeof OffscreenCanvas !== "undefined") {
			const canvas = new OffscreenCanvas(1, 1);
			const gl = canvas.getContext("webgl", {
				premultipliedAlpha: true,
				alpha: true,
			}) as WebGLRenderingContext | null;
			if (gl) {
				this.canvas = canvas;
				this.gl = gl;
				this.initBuffers();
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

		this.fromTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.fromTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		this.toTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.toTexture);
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
			console.warn("Shader compilation error:", gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	}

	private getProgram(glsl: string): WebGLProgram | null {
		const gl = this.gl;
		if (!gl) return null;

		let program = this.programCache.get(glsl);
		if (program) return program;

		const vertexShader = this.compileShader(
			gl.VERTEX_SHADER,
			VERTEX_SHADER_SRC,
		);
		const fragmentShader = this.compileShader(
			gl.FRAGMENT_SHADER,
			buildFragmentShaderSrc(glsl),
		);
		if (!vertexShader || !fragmentShader) return null;

		program = gl.createProgram();
		if (!program) return null;

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.warn("Program link error:", gl.getProgramInfoLog(program));
			gl.deleteProgram(program);
			return null;
		}

		this.programCache.set(glsl, program);
		return program;
	}

	public render({
		fromSource,
		toSource,
		progress,
		glsl,
		width,
		height,
		uniforms = {},
	}: {
		fromSource: TexImageSource;
		toSource: TexImageSource;
		progress: number;
		glsl: string;
		width: number;
		height: number;
		uniforms?: UniformMap;
	}): HTMLCanvasElement | OffscreenCanvas | null {
		const gl = this.gl;
		const canvas = this.canvas;
		if (!gl || !canvas) return null;

		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
		}

		const program = this.getProgram(glsl);
		if (!program) return null;

		gl.viewport(0, 0, width, height);
		gl.useProgram(program);

		// Bind vertex position
		const posAttr = gl.getAttribLocation(program, "position");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.enableVertexAttribArray(posAttr);
		gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

		// Bind textures
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.fromTexture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			fromSource,
		);
		gl.uniform1i(gl.getUniformLocation(program, "from"), 0);

		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.toTexture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			toSource,
		);
		gl.uniform1i(gl.getUniformLocation(program, "to"), 1);

		// Set standard uniforms
		gl.uniform1f(gl.getUniformLocation(program, "progress"), Math.max(0, Math.min(1, progress)));
		gl.uniform1f(gl.getUniformLocation(program, "ratio"), width / Math.max(1, height));

		// Set custom transition uniforms
		for (const [key, value] of Object.entries(uniforms)) {
			const loc = gl.getUniformLocation(program, key);
			if (loc === null) continue;

			if (typeof value === "number") {
				gl.uniform1f(loc, value);
			} else if (typeof value === "boolean") {
				gl.uniform1i(loc, value ? 1 : 0);
			} else if (Array.isArray(value)) {
				if (value.length === 2) gl.uniform2fv(loc, value);
				else if (value.length === 3) gl.uniform3fv(loc, value);
				else if (value.length === 4) gl.uniform4fv(loc, value);
			}
		}

		// Draw transition quad
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		return canvas;
	}
}

export const glTransitionPipeline = new GlTransitionPipeline();
