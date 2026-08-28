import { describe, expect, it } from "bun:test";
import {
	GSAP_EASINGS,
	getGsapEasing,
	easeBackOut,
	easeBackIn,
	easeBounceOut,
	easePower2Out,
	easeSineInOut,
} from "../gsap-easings";
import {
	ALL_TEXT_ANIMATION_PRESETS,
	TEXT_ANIMATION_IN_PRESETS,
	TEXT_ANIMATION_OUT_PRESETS,
	TEXT_ANIMATION_LOOP_PRESETS,
	getAnimationPresetById,
} from "../definitions";
import { evaluateTextAnimation } from "../evaluator";

describe("GSAP Easing Curves", () => {
	it("should have all standard GSAP easing curves registered", () => {
		expect(Object.keys(GSAP_EASINGS).length).toBeGreaterThan(15);
		expect(GSAP_EASINGS["power2.out"]).toBeDefined();
		expect(GSAP_EASINGS["back.out"]).toBeDefined();
		expect(GSAP_EASINGS["bounce.out"]).toBeDefined();
		expect(GSAP_EASINGS["sine.inOut"]).toBeDefined();
	});

	it("should return valid boundary values for 0 and 1", () => {
		expect(easePower2Out(0)).toBeCloseTo(0, 4);
		expect(easePower2Out(1)).toBeCloseTo(1, 4);

		expect(easeBackOut(0)).toBeCloseTo(0, 4);
		expect(easeBackOut(1)).toBeCloseTo(1, 4);

		expect(easeBounceOut(0)).toBeCloseTo(0, 4);
		expect(easeBounceOut(1)).toBeCloseTo(1, 4);

		expect(easeSineInOut(0)).toBeCloseTo(0, 4);
		expect(easeSineInOut(1)).toBeCloseTo(1, 4);
	});

	it("should support getGsapEasing with fallback", () => {
		const ease = getGsapEasing("nonexistent.easing");
		expect(typeof ease).toBe("function");
		expect(ease(0.5)).toBeGreaterThan(0);
	});
});

describe("Text Animation Definitions", () => {
	it("should contain all essential In, Out, and Loop presets", () => {
		expect(TEXT_ANIMATION_IN_PRESETS.length).toBeGreaterThanOrEqual(10);
		expect(TEXT_ANIMATION_OUT_PRESETS.length).toBeGreaterThanOrEqual(6);
		expect(TEXT_ANIMATION_LOOP_PRESETS.length).toBeGreaterThanOrEqual(5);
		expect(ALL_TEXT_ANIMATION_PRESETS.length).toBe(
			TEXT_ANIMATION_IN_PRESETS.length +
				TEXT_ANIMATION_OUT_PRESETS.length +
				TEXT_ANIMATION_LOOP_PRESETS.length,
		);
	});

	it("should find presets by id", () => {
		const typewriter = getAnimationPresetById("typewriter");
		expect(typewriter).toBeDefined();
		expect(typewriter?.name).toBe("打字机");
		expect(typewriter?.category).toBe("in");

		const pulse = getAnimationPresetById("pulse");
		expect(pulse).toBeDefined();
		expect(pulse?.name).toBe("呼吸脉冲");
		expect(pulse?.category).toBe("loop");
	});
});

describe("Text Animation Evaluator", () => {
	it("should evaluate In-Animation typewriter character slicing", () => {
		const text = "Hello OpenLVET!";
		const resultStart = evaluateTextAnimation({
			animation: {
				in: { type: "typewriter", duration: 1.0 },
			},
			localTimeSeconds: 0.0,
			totalDurationSeconds: 5.0,
			fullTextLength: text.length,
		});
		expect(resultStart.visibleTextLength).toBe(1);

		const resultMid = evaluateTextAnimation({
			animation: {
				in: { type: "typewriter", duration: 1.0 },
			},
			localTimeSeconds: 0.5,
			totalDurationSeconds: 5.0,
			fullTextLength: text.length,
		});
		expect(resultMid.visibleTextLength).toBe(Math.floor(0.5 * text.length));

		const resultEnd = evaluateTextAnimation({
			animation: {
				in: { type: "typewriter", duration: 1.0 },
			},
			localTimeSeconds: 1.2,
			totalDurationSeconds: 5.0,
			fullTextLength: text.length,
		});
		expect(resultEnd.visibleTextLength).toBe(text.length);
	});

	it("should evaluate In-Animation bounceIn scale and opacity", () => {
		const result = evaluateTextAnimation({
			animation: {
				in: { type: "bounceIn", duration: 0.6 },
			},
			localTimeSeconds: 0.3,
			totalDurationSeconds: 5.0,
			fullTextLength: 10,
		});
		expect(result.scaleX).toBeGreaterThan(0);
		expect(result.opacity).toBeGreaterThan(0);
	});

	it("should evaluate Out-Animation fadeOut and zoomOut at end of clip", () => {
		const result = evaluateTextAnimation({
			animation: {
				out: { type: "fadeOut", duration: 0.5 },
			},
			localTimeSeconds: 4.8, // 0.2s before 5.0s clip end
			totalDurationSeconds: 5.0,
			fullTextLength: 10,
		});
		expect(result.opacity).toBeLessThan(1.0);
	});

	it("should evaluate Loop-Animation pulse scaling", () => {
		const result = evaluateTextAnimation({
			animation: {
				loop: { type: "pulse", duration: 1.0, speed: 1.0 },
			},
			localTimeSeconds: 1.5,
			totalDurationSeconds: 5.0,
			fullTextLength: 10,
		});
		expect(result.scaleX).not.toBe(0);
		expect(result.scaleX).toBeCloseTo(result.scaleY, 4);
	});
});
