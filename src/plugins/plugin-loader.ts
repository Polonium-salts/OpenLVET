import * as React from "react";
import type { PluginManifest, PluginModule } from "./types";

/**
 * Safely evaluates a plugin script in the browser context and extracts the PluginModule.
 */
export function evaluatePluginCode(
	sourceCode: string,
	fallbackManifest?: PluginManifest,
): PluginModule {
	let definedPlugin: PluginModule | null = null;

	const moduleObj = { exports: {} as Record<string, unknown> };
	const exportsObj = moduleObj.exports;

	const definePlugin = (plugin: PluginModule) => {
		definedPlugin = plugin;
	};

	// Environment provided to the script
	const sandboxScope = {
		React,
		module: moduleObj,
		exports: exportsObj,
		definePlugin,
		OpenLVET: {
			definePlugin,
		},
		document: typeof document !== "undefined" ? document : undefined,
		window: typeof window !== "undefined" ? window : undefined,
		console,
		fetch: typeof window !== "undefined" ? window.fetch?.bind(window) : globalThis.fetch?.bind(globalThis),
		setTimeout: typeof window !== "undefined" ? window.setTimeout?.bind(window) : globalThis.setTimeout?.bind(globalThis),
		clearTimeout: typeof window !== "undefined" ? window.clearTimeout?.bind(window) : globalThis.clearTimeout?.bind(globalThis),
		setInterval: typeof window !== "undefined" ? window.setInterval?.bind(window) : globalThis.setInterval?.bind(globalThis),
		clearInterval: typeof window !== "undefined" ? window.clearInterval?.bind(window) : globalThis.clearInterval?.bind(globalThis),
		Date,
		Math,
		JSON,
		Array,
		Object,
		String,
		Number,
		Boolean,
		RegExp,
		Promise,
	};

	try {
		const paramNames = Object.keys(sandboxScope);
		const paramValues = Object.values(sandboxScope);

		// Wrap script inside a function body
		const runner = new Function(
			...paramNames,
			`"use strict";\n${sourceCode}\n;return module.exports;`,
		);

		const result = runner(...paramValues);

		if (definedPlugin) {
			return normalizePluginModule(definedPlugin, fallbackManifest);
		}

		if (result && typeof result === "object") {
			const mod = result as {
				default?: Partial<PluginModule>;
				manifest?: PluginManifest;
				activate?: PluginModule["activate"];
			};
			if (mod.default && (mod.default.manifest || mod.default.activate)) {
				return normalizePluginModule(mod.default, fallbackManifest);
			}
			if (mod.manifest || typeof mod.activate === "function") {
				return normalizePluginModule(mod as unknown as Partial<PluginModule>, fallbackManifest);
			}
		}

		if (exportsObj && typeof exportsObj === "object") {
			const mod = exportsObj as Record<string, unknown>;
			if (mod.manifest || typeof mod.activate === "function") {
				return normalizePluginModule(mod as unknown as Partial<PluginModule>, fallbackManifest);
			}
		}

		throw new Error(
			"插件脚本未导出有效的 PluginModule。请确保导出了包含 activate(context) 函数的对象或调用了 definePlugin()",
		);
	} catch (err) {
		throw new Error(
			`插件脚本执行失败: ${err instanceof Error ? err.message : String(err)}`,
		);
	}
}

function normalizePluginModule(
	plugin: Partial<PluginModule>,
	fallbackManifest?: PluginManifest,
): PluginModule {
	const manifest = { ...(fallbackManifest ?? {}), ...(plugin.manifest ?? {}) } as PluginManifest;

	if (!manifest.id) {
		throw new Error("插件必须包含唯一的 id 字段");
	}
	if (!manifest.name) {
		manifest.name = manifest.id;
	}
	if (!manifest.version) {
		manifest.version = "1.0.0";
	}
	if (!manifest.category) {
		manifest.category = "custom";
	}

	const activate =
		plugin.activate ??
		(() => {
			console.log(`Plugin ${manifest.id} activated (no-op)`);
		});

	return {
		manifest,
		activate,
		deactivate: plugin.deactivate,
		onConfigChange: plugin.onConfigChange,
	};
}
