import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { evaluatePluginCode } from "../plugin-loader";
import { createPluginContext } from "../plugin-context";
import { unpackPluginZip } from "../installers/zip-installer";

describe("Pexels Stock Hub Plugin (Pexels 官方素材库扩展插件)", () => {
	const pluginDir = path.resolve(
		__dirname,
		"../../../sample-plugins/pexels-stock-hub",
	);

	it("should have valid plugin.json manifest with Pexels API configuration", () => {
		const manifestPath = path.resolve(pluginDir, "plugin.json");
		expect(fs.existsSync(manifestPath)).toBe(true);

		const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
		expect(manifest.id).toBe("pexels-stock-hub");
		expect(manifest.name).toContain("Pexels");
		expect(manifest.category).toBe("tools");
		expect(manifest.configSchema).toBeDefined();
		expect(manifest.configSchema.length).toBeGreaterThanOrEqual(3);

		const keys = manifest.configSchema.map((c: any) => c.key);
		expect(keys).toContain("apiKey");
		expect(keys).toContain("defaultOrientation");
		expect(keys).toContain("videoQuality");
	});

	it("should contain comprehensive README markdown documentation", () => {
		const readmePath = path.resolve(pluginDir, "README.md");
		expect(fs.existsSync(readmePath)).toBe(true);

		const readme = fs.readFileSync(readmePath, "utf8");
		expect(readme).toContain("Pexels");
		expect(readme).toContain("API Key");
		expect(readme).toContain("统一素材库");
		expect(readme).toContain("4K");
	});

	it("should successfully unpack pexels-stock-hub.zip package", () => {
		const zipPath = path.resolve(pluginDir, "pexels-stock-hub.zip");
		expect(fs.existsSync(zipPath)).toBe(true);

		const zipBuffer = fs.readFileSync(zipPath);
		const result = unpackPluginZip(zipBuffer);

		expect(result.manifest.id).toBe("pexels-stock-hub");
		expect(result.sourceCode).toContain("CURATED_PEXELS_ITEMS");
		expect(result.manifest.readme).toContain("Pexels");
	});

	it("should activate plugin, register asset panel tab, and actions", () => {
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
		expect(controller.context.stockLibrary.length).toBeGreaterThanOrEqual(6);

		// Verify items belong to pexels
		const items = controller.context.stockLibrary;
		const hasVideo = items.some((i: any) => i.type === "video");
		const hasImage = items.some((i: any) => i.type === "image");
		expect(hasVideo).toBe(true);
		expect(hasImage).toBe(true);

		// Cleanup
		controller.dispose();
	});

	it("should support adding stock items into unified stock library via context.stock", async () => {
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

		expect(controller.context.stock).toBeDefined();
		expect(typeof controller.context.stock?.addStockItem).toBe("function");

		// Test adding a blob item
		const sampleBlob = new Blob(["sample video data"], { type: "video/mp4" });
		const saved = await controller.context.stock!.addStockItem({
			name: "测试 Pexels 海浪视频 4K",
			type: "video",
			blob: sampleBlob,
			duration: 15,
			width: 3840,
			height: 2160,
			tags: ["pexels", "test", "ocean"],
		});

		expect(saved.id).toBeDefined();
		expect(saved.name).toBe("测试 Pexels 海浪视频 4K");

		// Cleanup
		controller.dispose();
	});
});
