import { create } from "zustand";
import type {
	InstalledPluginRecord,
	PluginAssetTabDefinition,
	PluginHeaderItemDefinition,
	PluginToolbarItemDefinition,
	PluginPropertiesTabDefinition,
	PluginManifest,
} from "./types";
import type { PreviewOverlaySourceResult } from "@/preview/overlays";

interface PluginStoreState {
	// Installed Plugins map (persisted)
	installedPlugins: Record<string, InstalledPluginRecord>;
	
	// Dynamic UI registries (in-memory, populated on plugin activation)
	dynamicTabs: PluginAssetTabDefinition[];
	dynamicHeaderItems: PluginHeaderItemDefinition[];
	dynamicToolbarItems: PluginToolbarItemDefinition[];
	dynamicPropertiesTabs: PluginPropertiesTabDefinition[];
	dynamicOverlayProviders: Record<string, () => PreviewOverlaySourceResult>;

	// Modal / UI visibility
	isPluginCenterOpen: boolean;
	pluginCenterTab: "installed" | "install";
	activeSettingsPluginId: string | null;

	// UI Actions
	setInstalledPlugins: (
		plugins: Record<string, InstalledPluginRecord> | ((prev: Record<string, InstalledPluginRecord>) => Record<string, InstalledPluginRecord>),
	) => void;
	registerDynamicTab: (tab: PluginAssetTabDefinition) => void;
	unregisterDynamicTab: (tabId: string) => void;
	registerDynamicHeaderItem: (item: PluginHeaderItemDefinition) => void;
	unregisterDynamicHeaderItem: (itemId: string) => void;
	registerDynamicToolbarItem: (item: PluginToolbarItemDefinition) => void;
	unregisterDynamicToolbarItem: (itemId: string) => void;
	registerDynamicPropertiesTab: (tab: PluginPropertiesTabDefinition) => void;
	unregisterDynamicPropertiesTab: (tabId: string) => void;
	registerOverlayProvider: (
		pluginId: string,
		provider: () => PreviewOverlaySourceResult,
	) => void;
	unregisterOverlayProvider: (pluginId: string) => void;

	openPluginCenter: (
		tab?: "installed" | "install",
	) => void;
	closePluginCenter: () => void;
	openPluginSettings: (pluginId: string) => void;
	closePluginSettings: () => void;
}

export const usePluginStore = create<PluginStoreState>((set) => ({
	installedPlugins: {},
	dynamicTabs: [],
	dynamicHeaderItems: [],
	dynamicToolbarItems: [],
	dynamicPropertiesTabs: [],
	dynamicOverlayProviders: {},

	isPluginCenterOpen: false,
	pluginCenterTab: "installed",
	activeSettingsPluginId: null,

	setInstalledPlugins: (plugins) =>
		set((state) => ({
			installedPlugins:
				typeof plugins === "function" ? plugins(state.installedPlugins) : plugins,
		})),

	registerDynamicTab: (tab) =>
		set((state) => ({
			dynamicTabs: [
				...state.dynamicTabs.filter((t) => t.id !== tab.id),
				tab,
			].sort((a, b) => (a.order ?? 50) - (b.order ?? 50)),
		})),

	unregisterDynamicTab: (tabId) =>
		set((state) => ({
			dynamicTabs: state.dynamicTabs.filter((t) => t.id !== tabId),
		})),

	registerDynamicHeaderItem: (item) =>
		set((state) => ({
			dynamicHeaderItems: [
				...state.dynamicHeaderItems.filter((i) => i.id !== item.id),
				item,
			].sort((a, b) => (a.order ?? 50) - (b.order ?? 50)),
		})),

	unregisterDynamicHeaderItem: (itemId) =>
		set((state) => ({
			dynamicHeaderItems: state.dynamicHeaderItems.filter((i) => i.id !== itemId),
		})),

	registerDynamicToolbarItem: (item) =>
		set((state) => ({
			dynamicToolbarItems: [
				...state.dynamicToolbarItems.filter((i) => i.id !== item.id),
				item,
			].sort((a, b) => (a.order ?? 50) - (b.order ?? 50)),
		})),

	unregisterDynamicToolbarItem: (itemId) =>
		set((state) => ({
			dynamicToolbarItems: state.dynamicToolbarItems.filter((i) => i.id !== itemId),
		})),

	registerDynamicPropertiesTab: (tab) =>
		set((state) => ({
			dynamicPropertiesTabs: [
				...state.dynamicPropertiesTabs.filter((t) => t.id !== tab.id),
				tab,
			].sort((a, b) => (a.order ?? 50) - (b.order ?? 50)),
		})),

	unregisterDynamicPropertiesTab: (tabId) =>
		set((state) => ({
			dynamicPropertiesTabs: state.dynamicPropertiesTabs.filter((t) => t.id !== tabId),
		})),

	registerOverlayProvider: (pluginId, provider) =>
		set((state) => ({
			dynamicOverlayProviders: {
				...state.dynamicOverlayProviders,
				[pluginId]: provider,
			},
		})),

	unregisterOverlayProvider: (pluginId) =>
		set((state) => {
			const next = { ...state.dynamicOverlayProviders };
			delete next[pluginId];
			return { dynamicOverlayProviders: next };
		}),

	openPluginCenter: (tab = "installed") =>
		set({ isPluginCenterOpen: true, pluginCenterTab: tab }),

	closePluginCenter: () =>
		set({ isPluginCenterOpen: false }),

	openPluginSettings: (pluginId) =>
		set({ activeSettingsPluginId: pluginId }),

	closePluginSettings: () =>
		set({ activeSettingsPluginId: null }),
}));
