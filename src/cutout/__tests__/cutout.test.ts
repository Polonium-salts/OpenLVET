import { describe, expect, it } from "bun:test";
import { chromaKeyEffect, lumaKeyEffect } from "@/effects/definitions/cutout";
import { defaultEffects } from "@/effects/definitions";
import { resolveEffectPasses } from "@/effects";

describe("Cutout / Chroma Keying System (画中画/叠轨抠图功能)", () => {
	it("should have valid chroma-key and luma-key effect definitions", () => {
		expect(chromaKeyEffect.type).toBe("chroma-key");
		expect(chromaKeyEffect.name).toBe("色度抠图");
		expect(chromaKeyEffect.params.some((p) => p.key === "keyColor")).toBe(true);
		expect(chromaKeyEffect.params.some((p) => p.key === "similarity")).toBe(true);
		expect(chromaKeyEffect.params.some((p) => p.key === "smoothness")).toBe(true);
		expect(chromaKeyEffect.params.some((p) => p.key === "spill")).toBe(true);

		expect(lumaKeyEffect.type).toBe("luma-key");
		expect(lumaKeyEffect.name).toBe("明度抠图");
		expect(lumaKeyEffect.params.some((p) => p.key === "mode")).toBe(true);
		expect(lumaKeyEffect.params.some((p) => p.key === "threshold")).toBe(true);
	});

	it("should register chroma-key and luma-key into defaultEffects list", () => {
		const types = defaultEffects.map((e) => e.type);
		expect(types).toContain("chroma-key");
		expect(types).toContain("luma-key");
	});

	it("should compile and resolve GLSL shaders and uniforms for chroma keying", () => {
		const passes = resolveEffectPasses({
			definition: chromaKeyEffect,
			effectParams: {
				keyColor: "#00FF00",
				similarity: 0.4,
				smoothness: 0.15,
				spill: 0.6,
				invert: false,
			},
			width: 1920,
			height: 1080,
		});

		expect(passes.length).toBe(1);
		expect(passes[0].shader).toBe("chroma-key");
		expect(passes[0].glsl).toContain("u_keyColor");
		expect(passes[0].glsl).toContain("rgb2uv");
		expect(passes[0].uniforms.u_similarity).toBe(0.4);
		expect(passes[0].uniforms.u_smoothness).toBe(0.15);
		expect(passes[0].uniforms.u_spill).toBe(0.6);
		expect(passes[0].uniforms.u_invert).toBe(0);
	});

	it("should compile and resolve GLSL shaders and uniforms for luma keying", () => {
		const passes = resolveEffectPasses({
			definition: lumaKeyEffect,
			effectParams: {
				mode: "black",
				threshold: 0.2,
				smoothness: 0.05,
			},
			width: 1920,
			height: 1080,
		});

		expect(passes.length).toBe(1);
		expect(passes[0].shader).toBe("luma-key");
		expect(passes[0].uniforms.u_mode).toBe(0);
		expect(passes[0].uniforms.u_threshold).toBe(0.2);
	});
});
