import type { ReactNode } from "react";
import type { EditorCore } from "@/core";
import type { EffectDefinition } from "@/effects/types";
import type { TransitionDefinition } from "@/transitions/types";
import type { PreviewOverlaySourceResult } from "@/preview/overlays";
import type { TimelineElement } from "@/timeline/types";

export type PluginCategory =
	| "visuals"
	| "tools"
	| "audio"
	| "workflow"
	| "ai"
	| "custom";

export type PluginConfigFieldType =
	| "boolean"
	| "string"
	| "number"
	| "select"
	| "color"
	| "textarea";

export interface PluginConfigFieldOption {
	label: string;
	value: string | number;
}

export interface PluginConfigFieldSchema {
	key: string;
	label: string;
	description?: string;
	type: PluginConfigFieldType;
	group?: string;
	default?: unknown;
	min?: number;
	max?: number;
	step?: number;
	options?: PluginConfigFieldOption[];
	placeholder?: string;
}

export interface PluginManifest {
	id: string;
	name: string;
	version: string;
	description: string;
	author: string;
	category: PluginCategory;
	icon?: string; // Icon name or SVG identifier
	tags?: string[];
	homepage?: string;
	gitUrl?: string;
	builtin?: boolean;
	minAppVersion?: string;
	readme?: string; // Markdown documentation
	configSchema?: PluginConfigFieldSchema[];
	defaultConfig?: Record<string, unknown>;
	sourceCode?: string;
}

export interface PluginAssetTabDefinition {
	id: string;
	label: string;
	icon?: ReactNode | string;
	order?: number;
	pluginId?: string;
	render: (props: { plugin: PluginManifest }) => ReactNode;
}

export interface PluginHeaderItemDefinition {
	id: string;
	label?: string;
	icon?: ReactNode | string;
	position?: "left" | "right";
	order?: number;
	tooltip?: string;
	onClick?: () => void;
	render?: (props: { plugin: PluginManifest }) => ReactNode;
}

export interface PluginToolbarItemDefinition {
	id: string;
	label?: string;
	icon?: ReactNode | string;
	order?: number;
	tooltip?: string;
	onClick?: () => void;
	render?: (props: { plugin: PluginManifest }) => ReactNode;
}

export interface PluginPropertiesTabDefinition {
	id: string;
	label: string;
	icon?: ReactNode | string;
	order?: number;
	elementTypes?: string[]; // e.g. ["video", "image", "text", "audio"]
	render: (props: {
		element: TimelineElement;
		trackId: string;
		plugin: PluginManifest;
	}) => ReactNode;
}

export interface PluginActionDefinition {
	id: string;
	description: string;
	category?: string;
	defaultShortcut?: string; // e.g. "alt+shift+k"
	handler: (context: PluginContext) => void | Promise<void>;
}

export type PluginEventListener<T = unknown> = (data: T) => void;

export interface PluginContext {
	readonly plugin: PluginManifest;
	readonly editor: EditorCore;

	// Actions & Shortcuts
	actions: {
		registerAction: (action: PluginActionDefinition) => () => void;
		invokeAction: (actionId: string, args?: unknown) => void;
	};

	// Effects & WebGL Shaders
	effects: {
		registerEffect: (definition: EffectDefinition) => () => void;
		unregisterEffect: (type: string) => void;
	};

	// Transitions
	transitions: {
		registerTransition: (definition: TransitionDefinition) => () => void;
		unregisterTransition: (id: string) => void;
	};

	// Left Asset Panel Tabs
	panels: {
		registerAssetTab: (tab: PluginAssetTabDefinition) => () => void;
		unregisterAssetTab: (id: string) => void;
		setActiveAssetTab?: (id: string) => void;
	};

	// Top Navigation Header Items
	header: {
		registerHeaderItem: (item: PluginHeaderItemDefinition) => () => void;
		unregisterHeaderItem: (id: string) => void;
	};

	// Timeline Toolbar Action Buttons
	timeline: {
		registerToolbarItem: (item: PluginToolbarItemDefinition) => () => void;
		unregisterToolbarItem: (id: string) => void;
	};

	// Right Properties / Inspector Panel Tabs
	properties: {
		registerTab: (tab: PluginPropertiesTabDefinition) => () => void;
		unregisterTab: (id: string) => void;
	};

	// Preview Overlays (HUD / Watermarks / Guides)
	overlays: {
		registerPreviewOverlay: (
			overlayFactory: () => PreviewOverlaySourceResult,
		) => () => void;
	};

	// Global Event Bus
	events: {
		on: <T = unknown>(
			event: string,
			listener: PluginEventListener<T>,
		) => () => void;
		off: <T = unknown>(
			event: string,
			listener: PluginEventListener<T>,
		) => void;
		emit: <T = unknown>(event: string, data?: T) => void;
	};

	// Plugin-scoped local storage
	storage: {
		get: <T = unknown>(key: string, defaultValue?: T) => T;
		set: <T = unknown>(key: string, value: T) => void;
		delete: (key: string) => void;
		clear: () => void;
	};

	// Dynamic Plugin Config (reactive to user settings)
	config: {
		get: <T = unknown>(key: string, defaultValue?: T) => T;
		getAll: () => Record<string, unknown>;
		set: (key: string, value: unknown) => void;
		onChange: (
			listener: (newConfig: Record<string, unknown>) => void,
		) => () => void;
	};

	// Unified Stock Library Integration
	stock?: {
		addStockItem: (item: {
			name: string;
			type: "video" | "image" | "audio";
			file?: File;
			url?: string;
			blob?: Blob;
			thumbnailUrl?: string;
			duration?: number;
			width?: number;
			height?: number;
			fps?: number;
			tags?: string[];
		}) => Promise<{ id: string; name: string }>;
		getStockItems: () => Promise<unknown[]>;
	};

	// UI Utilities
	ui: {
		showToast: (
			message: string,
			options?: {
				type?: "success" | "error" | "info" | "warning";
				description?: string;
			},
		) => void;
		openPluginCenter: (defaultTab?: string) => void;
		openPluginSettings: (pluginId?: string) => void;
	};

	// Utility to register disposable cleanup handlers
	addDisposable: (disposable: () => void) => void;

	// In-memory or attached stock library items
	stockLibrary?: any;
	[key: string]: any;
}

export interface PluginModule {
	manifest: PluginManifest;
	activate: (context: PluginContext) => void | Promise<void>;
	deactivate?: (context: PluginContext) => void | Promise<void>;
	onConfigChange?: (
		config: Record<string, unknown>,
		context: PluginContext,
	) => void;
}

export interface InstalledPluginRecord {
	manifest: PluginManifest;
	enabled: boolean;
	config: Record<string, unknown>;
	installedAt: number;
	updatedAt: number;
	sourceType: "builtin" | "zip" | "git" | "url" | "code" | "file";
	sourceUrl?: string;
	rawSource?: string;
	readme?: string;
}
