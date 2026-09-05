import type { EditorCore } from "@/core";
import {
	createPluginContext,
	type PluginContextController,
} from "./plugin-context";
import { evaluatePluginCode } from "./plugin-loader";
import { unpackPluginZip, packPluginToZip } from "./installers/zip-installer";
import { installPluginFromGit } from "./installers/git-installer";
import { usePluginStore } from "./plugin-store";
import type {
	InstalledPluginRecord,
	PluginManifest,
	PluginModule,
} from "./types";
import { toast } from "sonner";

import { getPresetPlugins } from "./preset-plugins";

const STORAGE_KEY = "openlvet:installed_plugins";

export class PluginManager {
	private static instance: PluginManager | null = null;
	private editor: EditorCore | null = null;
	private activeControllers = new Map<string, PluginContextController>();
	private pluginModules = new Map<string, PluginModule>();
	private memoryRecords: Record<string, InstalledPluginRecord> = {};
	private initialized = false;

	private constructor() {}

	static getInstance(): PluginManager {
		if (!PluginManager.instance) {
			PluginManager.instance = new PluginManager();
		}
		return PluginManager.instance;
	}

	/**
	 * Initialize the plugin system with EditorCore.
	 */
	init(editor: EditorCore): void {
		if (this.initialized && this.editor === editor) {
			return;
		}

		this.editor = editor;
		this.initialized = true;

		// 1. In SSR / server context, seed memory records and skip client activation
		if (typeof window === "undefined") {
			try {
				const presetPlugins = getPresetPlugins();
				for (const [id, preset] of Object.entries(presetPlugins)) {
					this.memoryRecords[id] = preset;
				}
			} catch (e) {
				console.warn("Failed to load preset plugins in SSR:", e);
			}
			return;
		}

		// 2. Load stored records from localStorage & merge with memory
		const storedRecords = this.loadStoredRecords();

		// 3. Seed official preset plugins (e.g. Pexels Stock Hub) if not present
		try {
			const presetPlugins = getPresetPlugins();
			for (const [id, preset] of Object.entries(presetPlugins)) {
				if (!storedRecords[id]) {
					storedRecords[id] = preset;
				} else if (storedRecords[id].sourceType === "builtin") {
					storedRecords[id].rawSource = preset.rawSource;
					storedRecords[id].manifest = {
						...preset.manifest,
						...storedRecords[id].manifest,
						configSchema: preset.manifest.configSchema,
					};
				}
			}
		} catch (e) {
			console.warn("Failed to load preset plugins:", e);
		}

		// 4. Load and evaluate custom plugins stored with source code
		for (const record of Object.values(storedRecords)) {
			const sourceCode = record.rawSource || record.manifest.sourceCode;
			if (sourceCode) {
				try {
					const mod = evaluatePluginCode(sourceCode, record.manifest);
					this.pluginModules.set(record.manifest.id, mod);
				} catch (err) {
					console.error(
						`Failed to compile custom plugin ${record.manifest.id}:`,
						err,
					);
				}
			}
		}

		// Save normalized records
		this.saveStoredRecords(storedRecords);
		usePluginStore.getState().setInstalledPlugins(storedRecords);

		// 5. Activate enabled plugins
		for (const [id, record] of Object.entries(storedRecords)) {
			if (record.enabled) {
				this.activatePlugin(id).catch((err) => {
					console.error(`Failed to activate plugin ${id}:`, err);
				});
			}
		}
	}

	/**
	 * Activate a plugin by ID.
	 */
	async activatePlugin(pluginId: string): Promise<void> {
		if (!this.editor) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-require-imports
				const { EditorCore } = require("@/core");
				this.editor = EditorCore.getInstance();
			} catch {}
		}

		if (!this.editor) {
			console.warn("Editor not initialized yet, plugin activation queued");
			return;
		}

		if (typeof window === "undefined") {
			return;
		}

		if (this.activeControllers.has(pluginId)) {
			return; // Already active
		}

		const mod = this.pluginModules.get(pluginId);
		const records = this.loadStoredRecords();
		const record = this.memoryRecords[pluginId] || records[pluginId];

		if (!mod || !record) {
			console.warn(`Plugin ${pluginId} not found in modules or records, skipping activation`);
			return;
		}

		try {
			const controller = createPluginContext({
				manifest: mod.manifest,
				editor: this.editor,
				config: record.config,
				onUpdateConfig: (newConfig) => {
					this.updatePluginConfig(pluginId, newConfig);
				},
			});

			this.activeControllers.set(pluginId, controller);
			await mod.activate(controller.context);

			// Mark enabled in store
			if (!record.enabled) {
				record.enabled = true;
				record.updatedAt = Date.now();
				records[pluginId] = record;
				this.saveStoredRecords(records);
				usePluginStore.getState().setInstalledPlugins(records);
			}
		} catch (err) {
			this.deactivatePlugin(pluginId);
			throw new Error(
				`激活插件 ${mod.manifest.name} 失败: ${err instanceof Error ? err.message : String(err)}`,
			);
		}
	}

	/**
	 * Deactivate an active plugin by ID.
	 */
	async deactivatePlugin(pluginId: string): Promise<void> {
		const controller = this.activeControllers.get(pluginId);
		const mod = this.pluginModules.get(pluginId);

		if (controller) {
			try {
				if (mod?.deactivate) {
					await mod.deactivate(controller.context);
				}
			} catch (err) {
				console.error(`Error in deactivate() of plugin ${pluginId}:`, err);
			} finally {
				controller.dispose();
				this.activeControllers.delete(pluginId);
			}
		}

		const records = this.loadStoredRecords();
		if (records[pluginId] && records[pluginId].enabled) {
			records[pluginId].enabled = false;
			records[pluginId].updatedAt = Date.now();
			this.saveStoredRecords(records);
			usePluginStore.getState().setInstalledPlugins(records);
		}
	}

	/**
	 * Toggle plugin enabled/disabled.
	 */
	async togglePlugin(pluginId: string): Promise<boolean> {
		const records = this.loadStoredRecords();
		const record = records[pluginId];
		if (!record) return false;

		if (record.enabled) {
			await this.deactivatePlugin(pluginId);
			return false;
		} else {
			await this.activatePlugin(pluginId);
			return true;
		}
	}

	/**
	 * Install a plugin from a ZIP file or ArrayBuffer.
	 */
	async installFromZip(zipData: Uint8Array | ArrayBuffer): Promise<PluginManifest> {
		const { manifest, sourceCode } = unpackPluginZip(zipData);
		return this.registerAndInstallModule({
			manifest,
			sourceCode,
			sourceType: "zip",
		});
	}

	/**
	 * Install a plugin from a Git / GitHub URL.
	 */
	async installFromGit(gitUrl: string): Promise<PluginManifest> {
		const { manifest, sourceCode } = await installPluginFromGit(gitUrl);
		return this.registerAndInstallModule({
			manifest,
			sourceCode,
			sourceType: "git",
			sourceUrl: gitUrl,
		});
	}

	/**
	 * Install a plugin from a remote URL.
	 */
	async installFromUrl(url: string): Promise<PluginManifest> {
		const res = await fetch(url);
		if (!res.ok) {
			throw new Error(`无法下载插件文件: HTTP ${res.status}`);
		}
		const text = await res.text();
		return this.installFromCode(text, { sourceType: "url", sourceUrl: url });
	}

	/**
	 * Install a plugin from source code string (e.g. from Dev Studio).
	 */
	async installFromCode(
		sourceCode: string,
		options?: {
			manifest?: PluginManifest;
			sourceType?: "code" | "file" | "url";
			sourceUrl?: string;
		},
	): Promise<PluginManifest> {
		const mod = evaluatePluginCode(sourceCode, options?.manifest);
		return this.registerAndInstallModule({
			manifest: mod.manifest,
			sourceCode,
			sourceType: options?.sourceType ?? "code",
			sourceUrl: options?.sourceUrl,
		});
	}

	/**
	 * Common registration helper.
	 */
	private async registerAndInstallModule({
		manifest,
		sourceCode,
		sourceType,
		sourceUrl,
	}: {
		manifest: PluginManifest;
		sourceCode: string;
		sourceType: "builtin" | "zip" | "git" | "url" | "code" | "file";
		sourceUrl?: string;
	}): Promise<PluginManifest> {
		// Verify and evaluate module
		manifest.sourceCode = sourceCode;
		const mod = evaluatePluginCode(sourceCode, manifest);

		// Store in memory
		this.pluginModules.set(manifest.id, mod);

		// Store record in storage
		const records = this.loadStoredRecords();
		const record: InstalledPluginRecord = {
			manifest: mod.manifest,
			enabled: true,
			config: mod.manifest.defaultConfig ?? {},
			installedAt: records[manifest.id]?.installedAt ?? Date.now(),
			updatedAt: Date.now(),
			sourceType,
			sourceUrl,
			rawSource: sourceCode,
			readme: mod.manifest.readme || manifest.readme || records[manifest.id]?.readme,
		};

		records[manifest.id] = record;
		this.saveStoredRecords(records);
		usePluginStore.getState().setInstalledPlugins(records);

		if (!this.editor) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-require-imports
				const { EditorCore } = require("@/core");
				this.editor = EditorCore.getInstance();
			} catch {}
		}

		// If editor is already running, activate immediately
		if (this.editor) {
			// If already active, deactivate first to reload
			if (this.activeControllers.has(manifest.id)) {
				await this.deactivatePlugin(manifest.id);
			}
			await this.activatePlugin(manifest.id);
		}

		toast.success(`插件 "${manifest.name}" 安装成功并已启用！`);
		return manifest;
	}

	/**
	 * Uninstall a plugin.
	 */
	async uninstallPlugin(pluginId: string): Promise<void> {
		const records = this.loadStoredRecords();
		const record = records[pluginId];

		if (!record) return;

		await this.deactivatePlugin(pluginId);
		this.pluginModules.delete(pluginId);

		delete records[pluginId];
		this.saveStoredRecords(records);
		usePluginStore.getState().setInstalledPlugins(records);

		toast.success(`插件 "${record.manifest.name}" 已成功卸载`);
	}

	/**
	 * Update plugin settings / config.
	 */
	updatePluginConfig(pluginId: string, newConfig: Record<string, unknown>): void {
		const records = this.loadStoredRecords();
		if (!records[pluginId]) return;

		records[pluginId].config = newConfig;
		records[pluginId].updatedAt = Date.now();
		this.saveStoredRecords(records);
		usePluginStore.getState().setInstalledPlugins(records);

		const controller = this.activeControllers.get(pluginId);
		if (controller) {
			controller.triggerConfigChange(newConfig);
			const mod = this.pluginModules.get(pluginId);
			if (mod?.onConfigChange) {
				try {
					mod.onConfigChange(newConfig, controller.context);
				} catch (err) {
					console.error(`Error in onConfigChange for ${pluginId}:`, err);
				}
			}
		}
	}

	/**
	 * Pack a plugin as ZIP for sharing / downloading.
	 */
	exportPluginZip(pluginId: string): Uint8Array {
		const records = this.loadStoredRecords();
		const record = records[pluginId];
		if (!record) throw new Error("Plugin not found");

		const sourceCode =
			record.rawSource ||
			record.manifest.sourceCode ||
			`// Plugin: ${record.manifest.name}\nmodule.exports = { activate(context) {} };`;

		return packPluginToZip(record.manifest, sourceCode);
	}

	/**
	 * Retrieve a plugin record by ID from memory, storage, or preset plugins.
	 */
	getPluginRecord(pluginId: string): InstalledPluginRecord | undefined {
		const records = this.loadStoredRecords();
		if (records[pluginId]) return records[pluginId];
		const found = Object.values(records).find(
			(r) =>
				r.manifest.id === pluginId ||
				r.manifest.id.toLowerCase() === pluginId.toLowerCase(),
		);
		if (found) return found;
		const presets = getPresetPlugins();
		return (
			presets[pluginId] ||
			Object.values(presets).find(
				(p) =>
					p.manifest.id === pluginId ||
					p.manifest.id.toLowerCase() === pluginId.toLowerCase(),
			)
		);
	}

	private loadStoredRecords(): Record<string, InstalledPluginRecord> {
		if (typeof window === "undefined" || typeof localStorage === "undefined") {
			return { ...this.memoryRecords };
		}
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			const parsed = raw ? JSON.parse(raw) : {};
			this.memoryRecords = { ...this.memoryRecords, ...parsed };
			return { ...this.memoryRecords };
		} catch {
			return { ...this.memoryRecords };
		}
	}

	private saveStoredRecords(records: Record<string, InstalledPluginRecord>): void {
		this.memoryRecords = { ...records };
		if (typeof window === "undefined" || typeof localStorage === "undefined") {
			return;
		}
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
		} catch (e) {
			console.error("Failed to save plugins to localStorage:", e);
		}
	}
}

export const pluginManager = PluginManager.getInstance();
