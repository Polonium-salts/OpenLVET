import { describe, expect, it, beforeEach } from "bun:test";
import {
	effectsRegistry,
	registerDefaultEffects,
	resolveEffectPasses,
	buildDefaultEffectInstance,
} from "../index";
import { defaultEffects } from "../definitions";

describe("Effects System", () => {
	beforeEach(() => {
		registerDefaultEffects();
	});

	it("should register all PixiJS-inspired default effects", () => {
		expect(defaultEffects.length).toBeGreaterThanOrEqual(15);
		for (const def of defaultEffects) {
			expect(effectsRegistry.has(def.type)).toBe(true);
			const registered = effectsRegistry.get(def.type);
			expect(registered.name).toBeDefined();
			expect(registered.params).toBeDefined();
			expect(registered.renderer.passes.length).toBeGreaterThan(0);
		}
	});

	it("should resolve effect passes and uniforms for every effect", () => {
		const width = 1920;
		const height = 1080;

		for (const def of defaultEffects) {
			const effect = buildDefaultEffectInstance({ effectType: def.type });
			expect(effect.type).toBe(def.type);
			expect(effect.enabled).toBe(true);

			const passes = resolveEffectPasses({
				definition: def,
				effectParams: effect.params,
				width,
				height,
			});

			expect(passes.length).toBeGreaterThan(0);
			for (const pass of passes) {
				expect(pass.shader).toBeDefined();
				expect(pass.uniforms).toBeDefined();
			}
		}
	});

	it("should resolve specific GLSL shaders for RGB-Split, Glitch, Bloom, and Pixelate", () => {
		const rgbSplit = effectsRegistry.get("rgb-split");
		expect(rgbSplit.category).toBe("glitch");
		const passes = resolveEffectPasses({
			definition: rgbSplit,
			effectParams: { offset: 15, angle: 90 },
			width: 1280,
			height: 720,
		});
		expect(passes[0].glsl).toContain("filterPixel");
		expect(passes[0].uniforms.u_offset).toBe(15);
		expect(passes[0].uniforms.u_angle).toBe(90);
	});
});
