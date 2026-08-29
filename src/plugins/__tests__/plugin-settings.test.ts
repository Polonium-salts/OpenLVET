import { describe, expect, it } from "bun:test";
import { unpackPluginZip, packPluginToZip } from "../installers/zip-installer";
import type { PluginManifest } from "../types";

describe("Plugin Settings and Documentation System", () => {
	it("should unpack zip and extract README.md into manifest.readme", () => {
		const manifest: PluginManifest = {
			id: "test-doc-plugin",
			name: "测试文档插件",
			version: "1.0.0",
			description: "测试文档说明",
			author: "Tester",
			category: "tools",
		};

		const code = "module.exports = { activate: function() {} };";
		const zipBuffer = packPluginToZip(manifest, code);

		const result = unpackPluginZip(zipBuffer);
		expect(result.manifest.id).toBe("test-doc-plugin");
		expect(result.manifest.readme).toBeDefined();
		expect(result.manifest.readme).toContain("测试文档插件");
		expect(result.manifest.readme).toContain("测试文档说明");
	});

	it("should preserve custom readme when packed and unpacked", () => {
		const manifest: PluginManifest = {
			id: "test-custom-doc",
			name: "自定义说明插件",
			version: "2.1.0",
			description: "包含完整使用指南",
			author: "OpenLVET Dev",
			category: "visuals",
			readme: "# 自定义使用文档\n\n- 步骤 1\n- 步骤 2",
		};

		const code = "module.exports = { activate: function() {} };";
		const zipBuffer = packPluginToZip(manifest, code);

		const result = unpackPluginZip(zipBuffer);
		expect(result.manifest.readme).toBeDefined();
		expect(result.manifest.readme).toContain("自定义使用文档");
	});
});
