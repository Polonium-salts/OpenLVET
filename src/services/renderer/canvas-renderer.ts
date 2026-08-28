import type { FrameRate } from "opencut-wasm";
import type { AnyBaseNode } from "./nodes/base-node";
import { createCanvasSurface } from "./canvas-utils";
import { buildFrameDescriptor } from "./compositor/frame-descriptor";
import { wasmCompositor } from "./compositor/wasm-compositor";
import { resolveRenderTree } from "./resolve";
import { glEffectPipeline } from "@/effects/gl/gl-effect-renderer";
import type { FrameDescriptor } from "./compositor/types";
import {
	measureSpanAsync,
	measureSpanSync,
	onRenderPerfFrameComplete,
} from "@/diagnostics/render-perf";

export type CanvasRendererParams = {
	width: number;
	height: number;
	fps: FrameRate;
};

export class CanvasRenderer {
	canvas: OffscreenCanvas;
	context: OffscreenCanvasRenderingContext2D;
	outputCanvas: HTMLCanvasElement | null = null;
	outputContext: CanvasRenderingContext2D | null = null;
	width: number;
	height: number;
	fps: FrameRate;
	private lastFrame: FrameDescriptor | null = null;

	constructor({ width, height, fps }: CanvasRendererParams) {
		this.width = width;
		this.height = height;
		this.fps = fps;

		const surface = createCanvasSurface({ width, height });
		this.canvas = surface.canvas;
		this.context = surface.context;

		if (typeof document !== "undefined") {
			this.outputCanvas = document.createElement("canvas");
			this.outputCanvas.width = width;
			this.outputCanvas.height = height;
			this.outputContext = this.outputCanvas.getContext("2d");
		}
	}

	getOutputCanvas(): HTMLCanvasElement {
		if (this.outputCanvas) {
			return this.outputCanvas;
		}
		wasmCompositor.ensureInitialized({
			width: this.width,
			height: this.height,
		});
		return wasmCompositor.getCanvas();
	}

	setSize({ width, height }: { width: number; height: number }) {
		this.width = width;
		this.height = height;

		const surface = createCanvasSurface({ width, height });
		this.canvas = surface.canvas;
		this.context = surface.context;

		if (this.outputCanvas) {
			this.outputCanvas.width = width;
			this.outputCanvas.height = height;
		}
	}

	async render({ node, time }: { node: AnyBaseNode; time: number }) {
		await measureSpanAsync({
			name: "resolve",
			fn: () => resolveRenderTree({ node, renderer: this, time }),
		});
		const { frame, textures } = await measureSpanAsync({
			name: "buildFrame",
			fn: () => buildFrameDescriptor({ node, renderer: this }),
		});
		this.lastFrame = frame;
		wasmCompositor.ensureInitialized({
			width: this.width,
			height: this.height,
		});
		measureSpanSync({
			name: "syncTextures",
			fn: () => wasmCompositor.syncTextures(textures),
		});
		measureSpanSync({
			name: "renderFrame",
			fn: () => wasmCompositor.render(frame),
		});

		if (this.outputCanvas && this.outputContext) {
			let source: CanvasImageSource = wasmCompositor.getCanvas();
			if (frame.postGlslPasses && frame.postGlslPasses.length > 0) {
				const filtered = glEffectPipeline.render({
					source,
					width: this.width,
					height: this.height,
					passes: frame.postGlslPasses,
					time,
				});
				if (filtered) {
					source = filtered;
				}
			}
			this.outputContext.clearRect(0, 0, this.width, this.height);
			this.outputContext.drawImage(source, 0, 0, this.width, this.height);
		}
	}

	async renderToCanvas({
		node,
		time,
		targetCanvas,
	}: {
		node: AnyBaseNode;
		time: number;
		targetCanvas: HTMLCanvasElement;
	}) {
		await this.render({ node, time });

		const ctx = targetCanvas.getContext("2d");
		if (!ctx) {
			throw new Error("Failed to get target canvas context");
		}

		const sourceCanvas = this.getOutputCanvas();

		measureSpanSync({
			name: "drawImage",
			fn: () =>
				ctx.drawImage(
					sourceCanvas,
					0,
					0,
					targetCanvas.width,
					targetCanvas.height,
				),
		});
		onRenderPerfFrameComplete();
	}
}
