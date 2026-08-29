import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { evaluatePluginCode } from "../plugin-loader";
import { createPluginContext } from "../plugin-context";
import { unpackPluginZip } from "../installers/zip-installer";

describe("Open Stock Aggregator Plugin (全球免Key开源素材库插件)", () => {
	const pluginDir = path.resolve(
		__dirname,
		"../../../sample-plugins/open-stock-aggregator",
	);

	it("should have valid plugin.json manifest with 0-key configuration", () => {
		const manifestPath = path.resolve(pluginDir, "plugin.json");
		const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

		expect(manifest.id).toBe("open-stock-aggregator");
		expect(manifest.name).toContain("开源素材库");
		expect(manifest.category).toBe("tools");
		expect(manifest.configSchema).toBeDefined();
		expect(manifest.configSchema.length).toBeGreaterThanOrEqual(3);
	});

	it("should contain comprehensive README markdown documentation", () => {
		const readmePath = path.resolve(pluginDir, "README.md");
		const readme = fs.readFileSync(readmePath, "utf8");

		expect(readme).toContain("Openverse");
		expect(readme).toContain("Wikimedia");
		expect(readme).toContain("Internet Archive");
		expect(readme).toContain("LazyTextures");
	});

	it("should successfully unpack open-stock-aggregator.zip package", () => {
		const zipPath = path.resolve(pluginDir, "open-stock-aggregator.zip");
		expect(fs.existsSync(zipPath)).toBe(true);

		const zipBuffer = fs.readFileSync(zipPath);
		const result = unpackPluginZip(zipBuffer);

		expect(result.manifest.id).toBe("open-stock-aggregator");
		expect(result.sourceCode).toContain("CURATED_STOCK_ITEMS");
		expect(result.manifest.readme).toContain("Openverse");
	});

	it("should activate plugin and register stock panel tab, header button, and actions", () => {
		const sourceCode = fs.readFileSync(
			path.resolve(pluginDir, "index.js"),
			"utf8",
		);
		const mod = evaluatePluginCode(sourceCode);

		const mockEditor = {
			project: { getActive: () => ({ metadata: { id: "test-proj" } }) },
			media: { addMediaAsset: async () => ({ id: "media-1" }) },
			timeline: { insertMediaElement: () => {} },
			playback: { getCurrentTime: () => 0 },
		} as any;

		const controller = createPluginContext({
			manifest: mod.manifest,
			editor: mockEditor,
			config: {},
			onUpdateConfig: () => {},
		});

		mod.activate(controller.context);

		// Verify stock library was initialized
		expect(controller.context.stockLibrary).toBeDefined();
		expect(controller.context.stockLibrary.length).toBeGreaterThanOrEqual(10);

		// Check curated items contains essential 0-key engines
		const engines = new Set(controller.context.stockLibrary.map((i: any) => i.engine));
		expect(engines.has("openverse")).toBe(true);
		expect(engines.has("wikimedia")).toBe(true);
		expect(engines.has("archive")).toBe(true);
		expect(engines.has("textures")).toBe(true);
		expect(engines.has("curated")).toBe(true);

		// Cleanup
		controller.dispose();
	});
});
