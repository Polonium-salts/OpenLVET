import { describe, expect, it } from "bun:test";
import {
	TRANSITION_DEFINITIONS,
	TRANSITION_MAP,
	getTransitionDefinition,
} from "../definitions";

describe("GL Transitions System", () => {
	it("should have registered standard gl-transitions", () => {
		expect(TRANSITION_DEFINITIONS.length).toBeGreaterThanOrEqual(20);
		expect(TRANSITION_MAP.size).toBe(TRANSITION_DEFINITIONS.length);
	});

	it("should contain all essential transition categories", () => {
		const categories = new Set(TRANSITION_DEFINITIONS.map((d) => d.category));
		expect(categories.has("basic")).toBe(true);
		expect(categories.has("motion")).toBe(true);
		expect(categories.has("shapes")).toBe(true);
		expect(categories.has("creative")).toBe(true);
		expect(categories.has("3d")).toBe(true);
	});

	it("should contain valid GLSL transition function in each definition", () => {
		for (const def of TRANSITION_DEFINITIONS) {
			expect(def.id).toBeTruthy();
			expect(def.name).toBeTruthy();
			expect(def.glsl).toContain("vec4 transition");
		}
	});

	it("should look up transitions by id", () => {
		const crossfade = getTransitionDefinition("crossfade");
		expect(crossfade).toBeDefined();
		expect(crossfade?.name).toBe("叠化溶解");
		expect(crossfade?.category).toBe("basic");

		const wipeLeft = getTransitionDefinition("wipeLeft");
		expect(wipeLeft).toBeDefined();
		expect(wipeLeft?.name).toBe("左向划像");

		const glitch = getTransitionDefinition("glitch");
		expect(glitch).toBeDefined();
		expect(glitch?.category).toBe("creative");
	});

	it("should calculate correct transition progress over time", () => {
		const timeOffset = 4000000; // 4.0s in ticks
		const duration = 1000000; // 1.0s in ticks

		const calcProgress = (t: number) =>
			Math.max(0, Math.min(1, (t - timeOffset) / duration));

		expect(calcProgress(3500000)).toBe(0);
		expect(calcProgress(4000000)).toBe(0);
		expect(calcProgress(4500000)).toBe(0.5);
		expect(calcProgress(5000000)).toBe(1);
		expect(calcProgress(5500000)).toBe(1);
	});
});
