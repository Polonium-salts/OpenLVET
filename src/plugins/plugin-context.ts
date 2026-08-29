import type { EditorCore } from "@/core";
import { toast } from "sonner";
import { effectsRegistry } from "@/effects";
import { transitionsRegistry } from "@/transitions/registry";
import type {
	PluginActionDefinition,
	PluginAssetTabDefinition,
	PluginContext,
	PluginEventListener,
	PluginHeaderItemDefinition,
	PluginManifest,
	PluginPropertiesTabDefinition,
	PluginToolbarItemDefinition,
} from "./types";
import { usePluginStore } from "./plugin-store";
import { useAssetsPanelStore } from "@/components/editor/panels/assets/assets-panel-store";
import type { EffectDefinition } from "@/effects/types";
import type { TransitionDefinition } from "@/transitions/types";
import type { PreviewOverlaySourceResult } from "@/preview/overlays";
import { stockStorage } from "@/stock/stock-storage";
import { generateUUID } from "@/utils/id";
import type { StockItem } from "@/stock/types";

// Global event bus for plugin system
class PluginEventBus {
	private listeners = new Map<string, Set<PluginEventListener>>();

	on<T = unknown>(event: string, listener: PluginEventListener<T>): () => void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}
		const set = this.listeners.get(event)!;
		set.add(listener as PluginEventListener);
		return () => this.off(event, listener);
	}

	off<T = unknown>(event: string, listener: PluginEventListener<T>): void {
		this.listeners.get(event)?.delete(listener as PluginEventListener);
	}

	emit<T = unknown>(event: string, data?: T): void {
		const set = this.listeners.get(event);
		if (set) {
			set.forEach((listener) => {
				try {
					listener(data);
				} catch (err) {
					console.error(`Error in event listener for '${event}':`, err);
				}
			});
		}
	}
}

export const globalPluginEvents = new PluginEventBus();

// Dynamic action registry for plugins
export const pluginActionHandlers = new Map<
	string,
	(context: PluginContext) => void | Promise<void>
>();

export interface PluginContextController {
	context: PluginContext;
	dispose: () => void;
	triggerConfigChange: (newConfig: Record<string, unknown>) => void;
}

export function createPluginContext({
	manifest,
	editor,
	config,
	onUpdateConfig,
}: {
	manifest: PluginManifest;
	editor: EditorCore;
	config: Record<string, unknown>;
	onUpdateConfig: (newConfig: Record<string, unknown>) => void;
}): PluginContextController {
	const disposables: Array<() => void> = [];
	const configListeners = new Set<(c: Record<string, unknown>) => void>();
	let currentConfig = { ...(manifest.defaultConfig ?? {}), ...config };

	const addDisposable = (fn: () => void) => {
		disposables.push(fn);
	};

	const context: PluginContext = {
		plugin: manifest,
		editor,

		actions: {
			registerAction: (actionDef: PluginActionDefinition) => {
				pluginActionHandlers.set(actionDef.id, actionDef.handler);
				const unregister = () => {
					pluginActionHandlers.delete(actionDef.id);
				};
				addDisposable(unregister);
				return unregister;
			},
			invokeAction: (actionId: string, _args?: unknown) => {
				const handler = pluginActionHandlers.get(actionId);
				if (handler) {
					handler(context);
				}
			},
		},

		effects: {
			registerEffect: (definition: EffectDefinition) => {
				effectsRegistry.register({
					key: definition.type,
					definition,
				});
				const unregister = () => {
					effectsRegistry.unregister(definition.type);
				};
				addDisposable(unregister);
				return unregister;
			},
			unregisterEffect: (type: string) => {
				effectsRegistry.unregister(type);
			},
		},

		transitions: {
			registerTransition: (definition: TransitionDefinition) => {
				transitionsRegistry.register({
					...definition,
					isPlugin: true,
					sourceType: "plugin",
					pluginId: manifest.id,
					pluginName: manifest.name,
				});
				const unregister = () => {
					transitionsRegistry.unregister(definition.id);
				};
				addDisposable(unregister);
				return unregister;
			},
			unregisterTransition: (id: string) => {
				transitionsRegistry.unregister(id);
			},
		},

		panels: {
			registerAssetTab: (tab: PluginAssetTabDefinition) => {
				usePluginStore.getState().registerDynamicTab(tab);
				const unregister = () => {
					usePluginStore.getState().unregisterDynamicTab(tab.id);
				};
				addDisposable(unregister);
				return unregister;
			},
			unregisterAssetTab: (id: string) => {
				usePluginStore.getState().unregisterDynamicTab(id);
			},
			setActiveAssetTab: (id: string) => {
				useAssetsPanelStore.getState().setActiveTab(id);
			},
		},

		header: {
			registerHeaderItem: (item: PluginHeaderItemDefinition) => {
				usePluginStore.getState().registerDynamicHeaderItem(item);
				const unregister = () => {
					usePluginStore.getState().unregisterDynamicHeaderItem(item.id);
				};
				addDisposable(unregister);
				return unregister;
			},
			unregisterHeaderItem: (id: string) => {
				usePluginStore.getState().unregisterDynamicHeaderItem(id);
			},
		},

		timeline: {
			registerToolbarItem: (item: PluginToolbarItemDefinition) => {
				usePluginStore.getState().registerDynamicToolbarItem(item);
				const unregister = () => {
					usePluginStore.getState().unregisterDynamicToolbarItem(item.id);
				};
				addDisposable(unregister);
				return unregister;
			},
			unregisterToolbarItem: (id: string) => {
				usePluginStore.getState().unregisterDynamicToolbarItem(id);
			},
		},

		properties: {
			registerTab: (tab: PluginPropertiesTabDefinition) => {
				usePluginStore.getState().registerDynamicPropertiesTab(tab);
				const unregister = () => {
					usePluginStore.getState().unregisterDynamicPropertiesTab(tab.id);
				};
				addDisposable(unregister);
				return unregister;
			},
			unregisterTab: (id: string) => {
				usePluginStore.getState().unregisterDynamicPropertiesTab(id);
			},
		},

		overlays: {
			registerPreviewOverlay: (
				provider: () => PreviewOverlaySourceResult,
			) => {
				usePluginStore.getState().registerOverlayProvider(manifest.id, provider);
				const unregister = () => {
					usePluginStore.getState().unregisterOverlayProvider(manifest.id);
				};
				addDisposable(unregister);
				return unregister;
			},
		},

		events: {
			on: <T = unknown>(event: string, listener: PluginEventListener<T>) => {
				const unregister = globalPluginEvents.on(event, listener);
				addDisposable(unregister);
				return unregister;
			},
			off: <T = unknown>(event: string, listener: PluginEventListener<T>) => {
				globalPluginEvents.off(event, listener);
			},
			emit: <T = unknown>(event: string, data?: T) => {
				globalPluginEvents.emit(event, data);
			},
		},

		storage: {
			get: <T = unknown>(key: string, defaultValue?: T): T => {
				if (typeof window === "undefined" || typeof localStorage === "undefined") {
					return defaultValue as T;
				}
				try {
					const raw = localStorage.getItem(`openlvet:plugin:${manifest.id}:${key}`);
					return raw !== null ? JSON.parse(raw) : (defaultValue as T);
				} catch {
					return defaultValue as T;
				}
			},
			set: <T = unknown>(key: string, value: T): void => {
				if (typeof window === "undefined" || typeof localStorage === "undefined") {
					return;
				}
				try {
					localStorage.setItem(
						`openlvet:plugin:${manifest.id}:${key}`,
						JSON.stringify(value),
					);
				} catch (e) {
					console.error("Plugin storage write error:", e);
				}
			},
			delete: (key: string): void => {
				if (typeof window === "undefined" || typeof localStorage === "undefined") {
					return;
				}
				try {
					localStorage.removeItem(`openlvet:plugin:${manifest.id}:${key}`);
				} catch (e) {
					console.error("Plugin storage delete error:", e);
				}
			},
			clear: (): void => {
				if (typeof window === "undefined" || typeof localStorage === "undefined") {
					return;
				}
				try {
					const prefix = `openlvet:plugin:${manifest.id}:`;
					Object.keys(localStorage)
						.filter((k) => k.startsWith(prefix))
						.forEach((k) => localStorage.removeItem(k));
				} catch (e) {
					console.error("Plugin storage clear error:", e);
				}
			},
		},

		config: {
			get: <T = unknown>(key: string, defaultValue?: T): T => {
				const val = currentConfig[key];
				return val !== undefined ? (val as T) : (defaultValue as T);
			},
			getAll: () => ({ ...currentConfig }),
			set: (key: string, value: unknown) => {
				currentConfig = { ...currentConfig, [key]: value };
				onUpdateConfig(currentConfig);
				configListeners.forEach((l) => l(currentConfig));
			},
			onChange: (listener) => {
				configListeners.add(listener);
				const unregister = () => {
					configListeners.delete(listener);
				};
				addDisposable(unregister);
				return unregister;
			},
		},

		stock: {
			addStockItem: async (param) => {
				const id = generateUUID();
				const now = new Date().toISOString();
				let file: File;

				if (param.file) {
					file = param.file;
				} else if (param.blob) {
					const ext =
						param.type === "video"
							? "mp4"
							: param.type === "audio"
								? "mp3"
								: "jpg";
					file = new File([param.blob], `${param.name || "download"}.${ext}`, {
						type: param.blob.type || (param.type === "video" ? "video/mp4" : param.type === "audio" ? "audio/mpeg" : "image/jpeg"),
					});
				} else if (param.url) {
					const res = await fetch(param.url);
					const blob = await res.blob();
					const ext =
						param.type === "video"
							? "mp4"
							: param.type === "audio"
								? "mp3"
								: "jpg";
					file = new File([blob], `${param.name || "download"}.${ext}`, {
						type: blob.type || (param.type === "video" ? "video/mp4" : param.type === "audio" ? "audio/mpeg" : "image/jpeg"),
					});
				} else {
					throw new Error("必须提供 file, blob 或 url");
				}

				const stockItem: StockItem = {
					id,
					name: param.name || "Pexels 素材",
					type: param.type,
					tags: param.tags || ["pexels", "stock"],
					file,
					url: URL.createObjectURL(file),
					thumbnailUrl: param.thumbnailUrl,
					duration: param.duration,
					width: param.width,
					height: param.height,
					fps: param.fps,
					size: file.size,
					isFavorite: false,
					createdAt: now,
					updatedAt: now,
				};

				await stockStorage.saveStockItem(stockItem);
				try {
					if (typeof window !== "undefined") {
						const { useStockStore } = await import("@/stock/stock-store");
						useStockStore.setState((prev) => ({
							items: [stockItem, ...prev.items.filter((i) => i.id !== id)],
						}));
					}
				} catch {}

				return { id: stockItem.id, name: stockItem.name };
			},
			getStockItems: async () => {
				return await stockStorage.loadAllStockItems();
			},
		},

		ui: {
			showToast: (message, options) => {
				if (options?.type === "success") toast.success(message, { description: options.description });
				else if (options?.type === "error") toast.error(message, { description: options.description });
				else if (options?.type === "warning") toast.warning(message, { description: options.description });
				else toast(message, { description: options?.description });
			},
			openPluginCenter: (tab) => {
				usePluginStore.getState().openPluginCenter(tab as any);
			},
			openPluginSettings: (pluginId) => {
				usePluginStore.getState().openPluginSettings(pluginId || manifest.id);
			},
		},

		addDisposable,
	};

	const triggerConfigChange = (newConfig: Record<string, unknown>) => {
		currentConfig = { ...(manifest.defaultConfig ?? {}), ...newConfig };
		configListeners.forEach((l) => {
			try {
				l(currentConfig);
			} catch (e) {
				console.error(`Error in config change listener for ${manifest.id}:`, e);
			}
		});
	};

	const dispose = () => {
		for (const d of disposables.reverse()) {
			try {
				d();
			} catch (err) {
				console.error(`Error disposing plugin resource for ${manifest.id}:`, err);
			}
		}
		disposables.length = 0;
		configListeners.clear();
	};

	return {
		context,
		dispose,
		triggerConfigChange,
	};
}
