import {
	applyEffectPasses,
	applyMaskFeather as applyMaskFeatherWasm,
	initializeGpu,
} from "opencut-wasm";
import type { EffectPass, EffectUniformValue } from "@/effects/types";

let gpuAvailable = false;
let initPromise: Promise<void> | null = null;

export function initializeGpuRenderer(): Promise<void> {
	if (!initPromise) {
		initPromise = initializeGpu()
			.then(() => {
				gpuAvailable = true;
			})
			.catch((error: unknown) => {
				gpuAvailable = false;
				const message = error instanceof Error ? error.message : String(error);
				console.warn(`GPU renderer unavailable: ${message}`);
			});
	}
	return initPromise;
}

export function isGpuAvailable(): boolean {
	return gpuAvailable;
}

import { glEffectPipeline } from "@/effects/gl/gl-effect-renderer";

export const gpuRenderer = {
	applyEffect({
		source,
		width,
		height,
		passes,
		time = 0,
	}: {
		source: OffscreenCanvas;
		width: number;
		height: number;
		passes: EffectPass[];
		time?: number;
	}): OffscreenCanvas {
		if (passes.length === 0) {
			return source;
		}

		// If any pass has glsl shader code, use high-performance WebGL GLSL pipeline
		const hasGlsl = passes.some((p) => Boolean(p.glsl));
		if (hasGlsl) {
			const glResult = glEffectPipeline.render({
				source,
				width,
				height,
				passes,
				time,
			});
			if (glResult) {
				return glResult as OffscreenCanvas;
			}
		}

		if (gpuAvailable) {
			try {
				return applyEffectPasses({
					source,
					width,
					height,
					passes: serializeEffectPasses(passes),
				});
			} catch (error) {
				console.warn("WASM applyEffectPasses failed, falling back to WebGL:", error);
				const glResult = glEffectPipeline.render({
					source,
					width,
					height,
					passes,
					time,
				});
				if (glResult) {
					return glResult as OffscreenCanvas;
				}
			}
		}

		return source;
	},

	applyMaskFeather({
		maskCanvas,
		width,
		height,
		feather,
	}: {
		maskCanvas: OffscreenCanvas;
		width: number;
		height: number;
		feather: number;
	}): OffscreenCanvas {
		if (!gpuAvailable) {
			return maskCanvas;
		}

		return applyMaskFeatherWasm({
			mask: maskCanvas,
			width,
			height,
			feather,
		});
	},
};

function serializeEffectPasses(passes: EffectPass[]) {
	return passes.map((pass) => ({
		shader: pass.shader,
		uniforms: Object.entries(pass.uniforms).map(([name, value]) => ({
			name,
			value: normalizeUniformValue(value),
		})),
	}));
}

function normalizeUniformValue(value: EffectUniformValue): number[] {
	if (typeof value === "boolean") {
		return [value ? 1 : 0];
	}
	return typeof value === "number" ? [value] : value;
}

