import { describe, expect, it } from "bun:test";
import {
	TRANSITION_DEFINITIONS,
	TRANSITION_MAP,
	getTransitionDefinition,
} from "../definitions";
import { transitionsRegistry } from "../registry";
import { createPluginContext } from "@/plugins/plugin-context";
import { evaluatePluginCode } from "@/plugins/plugin-loader";
import fs from "node:fs";
import path from "node:path";

describe("GL Transitions System", () => {
	it("should have registered standard gl-transitions", () => {
		expect(TRANSITION_DEFINITIONS.length).toBeGreaterThanOrEqual(20);
		expect(TRANSITION_MAP.size).toBe(TRANSITION_DEFINITIONS.length);
		expect(transitionsRegistry.getAll().length).toBeGreaterThanOrEqual(20);
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

	it("should support dynamic registration and unregistration via transitionsRegistry", () => {
		let notified = false;
		const unsubscribe = transitionsRegistry.subscribe(() => {
			notified = true;
		});

		const customDef = {
			id: "test-custom-wipe",
			name: "测试自定义划像",
			category: "motion" as const,
			keywords: ["test", "custom"],
			glsl: `vec4 transition(vec2 uv) { return mix(getFromColor(uv), getToColor(uv), progress); }`,
		};

		transitionsRegistry.register(customDef);
		expect(notified).toBe(true);
		expect(transitionsRegistry.has("test-custom-wipe")).toBe(true);
		expect(getTransitionDefinition("test-custom-wipe")?.name).toBe("测试自定义划像");

		notified = false;
		transitionsRegistry.unregister("test-custom-wipe");
		expect(notified).toBe(true);
		expect(transitionsRegistry.has("test-custom-wipe")).toBe(false);
		expect(getTransitionDefinition("test-custom-wipe")).toBeUndefined();

		unsubscribe();
	});

	it("should support plugin lifecycle transition registration through plugin context", () => {
		const mockEditor = {} as any;
		const controller = createPluginContext({
			manifest: {
				id: "test-transition-plugin",
				name: "测试转场插件",
				version: "1.0.0",
				description: "测试",
				author: "test",
				category: "visuals",
			},
			editor: mockEditor,
			config: {},
			onUpdateConfig: () => {},
		});

		const unregister = controller.context.transitions.registerTransition({
			id: "plugin-dynamic-glow",
			name: "插件光效转场",
			category: "creative",
			keywords: ["plugin", "glow"],
			glsl: `vec4 transition(vec2 uv) { return mix(getFromColor(uv), getToColor(uv), progress); }`,
		});

		expect(transitionsRegistry.has("plugin-dynamic-glow")).toBe(true);
		expect(getTransitionDefinition("plugin-dynamic-glow")?.name).toBe("插件光效转场");

		// Clean up via controller dispose
		controller.dispose();
		expect(transitionsRegistry.has("plugin-dynamic-glow")).toBe(false);
		expect(getTransitionDefinition("plugin-dynamic-glow")).toBeUndefined();
	});

	it("should correctly activate creative-transitions-pack and register all 8 presets", () => {
		const pluginPath = path.resolve(
			__dirname,
			"../../../sample-plugins/creative-transitions-pack/index.js",
		);
		const sourceCode = fs.readFileSync(pluginPath, "utf8");

		const mod = evaluatePluginCode(sourceCode);
		expect(mod.manifest.id).toBe("creative-transitions-pack");
		expect(mod.manifest.name).toContain("创意转场预设大师");

		const mockEditor = {
			scenes: { getActiveScene: () => null },
			playback: { getCurrentTime: () => 0 },
			timeline: { addTransition: () => {}, applyTransitionToAll: () => {} },
		} as any;

		const controller = createPluginContext({
			manifest: mod.manifest,
			editor: mockEditor,
			config: {},
			onUpdateConfig: () => {},
		});

		mod.activate(controller.context);

		// Verify that all 8 transition presets were registered into transitionsRegistry
		const expectedPresets = [
			"spin-zoom",
			"light-leak",
			"kaleidoscope",
			"liquid-wave",
			"venetian-blinds",
			"chromatic-aberration",
			"glitch-displace",
			"black-hole-warp",
		];

		for (const id of expectedPresets) {
			expect(transitionsRegistry.has(id)).toBe(true);
			const def = getTransitionDefinition(id);
			expect(def).toBeDefined();
			expect(def?.glsl).toContain("vec4 transition");
		}

		// Dispose and check clean unregistration
		controller.dispose();
		for (const id of expectedPresets) {
			expect(transitionsRegistry.has(id)).toBe(false);
		}
	});

	it("should distinguish between builtin and plugin transitions correctly", () => {
		const all = transitionsRegistry.getAll();
		const builtins = all.filter((t) => !t.isPlugin && t.sourceType === "builtin");
		expect(builtins.length).toBeGreaterThanOrEqual(20);

		const mockEditor = {} as any;
		const controller = createPluginContext({
			manifest: {
				id: "sample-plugin-fx",
				name: "转场插件包",
				version: "1.0.0",
				description: "测试插件",
				author: "Dev",
				category: "visuals",
			},
			editor: mockEditor,
			config: {},
			onUpdateConfig: () => {},
		});

		controller.context.transitions.registerTransition({
			id: "plugin-laser-cut",
			name: "激光划切",
			category: "creative",
			keywords: ["laser"],
			glsl: `vec4 transition(vec2 uv) { return mix(getFromColor(uv), getToColor(uv), progress); }`,
		});

		const registered = getTransitionDefinition("plugin-laser-cut");
		expect(registered).toBeDefined();
		expect(registered?.isPlugin).toBe(true);
		expect(registered?.sourceType).toBe("plugin");
		expect(registered?.pluginId).toBe("sample-plugin-fx");
		expect(registered?.pluginName).toBe("转场插件包");

		controller.dispose();
	});
});
