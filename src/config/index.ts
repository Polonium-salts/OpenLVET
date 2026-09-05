/**
 * OpenLVET Configuration Management Center
 * Handles multi-tier configuration loading, validation, environment overrides, and change subscriptions.
 */

import {
	OpenLVETConfigSchema,
	type OpenLVETConfig,
	type UserOpenLVETConfig,
} from "./schema";
import { logger, LogLevel } from "@/logger";

export const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
export const isServer = !isBrowser;
export const isDevelopment = process.env.NODE_ENV === "development";
export const isProduction = process.env.NODE_ENV === "production";
export const isTest = process.env.NODE_ENV === "test";

type ConfigListener = (config: OpenLVETConfig) => void;

class ConfigManager {
	private static instance: ConfigManager | null = null;
	private currentConfig: OpenLVETConfig;
	private listeners: Set<ConfigListener> = new Set();

	private constructor() {
		this.currentConfig = this.loadInitialConfig();
		this.syncLoggerLevel();
	}

	static getInstance(): ConfigManager {
		if (!ConfigManager.instance) {
			ConfigManager.instance = new ConfigManager();
		}
		return ConfigManager.instance;
	}

	private loadInitialConfig(): OpenLVETConfig {
		// 1. Base defaults from schema
		const base = OpenLVETConfigSchema.parse({});

		// 2. Read environment variables if available
		const env = (process.env.NODE_ENV || "development") as "development" | "production" | "test";
		const port = process.env.PORT ? parseInt(process.env.PORT, 10) : base.server.port;
		const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || base.server.siteUrl;
		const logLevel = (process.env.LOG_LEVEL?.toUpperCase() || (isDevelopment ? "DEBUG" : "INFO")) as
			| "DEBUG"
			| "INFO"
			| "WARN"
			| "ERROR"
			| "SILENT";

		const pexelsKey = process.env.PEXELS_API_KEY || "";
		const pixabayKey = process.env.PIXABAY_API_KEY || "";
		const freesoundKey = process.env.FREESOUND_API_KEY || "";

		const merged: OpenLVETConfig = {
			...base,
			env,
			server: {
				...base.server,
				port: isNaN(port) ? base.server.port : port,
				siteUrl,
			},
			logging: {
				...base.logging,
				level: logLevel,
			},
			apiKeys: {
				pexels: pexelsKey,
				pixabay: pixabayKey,
				freesound: freesoundKey,
			},
		};

		return merged;
	}

	getConfig(): OpenLVETConfig {
		return { ...this.currentConfig };
	}

	get<K extends keyof OpenLVETConfig>(key: K): OpenLVETConfig[K] {
		return this.currentConfig[key];
	}

	updateConfig(partial: UserOpenLVETConfig): OpenLVETConfig {
		const updated = {
			...this.currentConfig,
			...partial,
			server: { ...this.currentConfig.server, ...((partial.server as object) || {}) },
			editor: { ...this.currentConfig.editor, ...((partial.editor as object) || {}) },
			storage: { ...this.currentConfig.storage, ...((partial.storage as object) || {}) },
			rendering: { ...this.currentConfig.rendering, ...((partial.rendering as object) || {}) },
			plugins: {
				...this.currentConfig.plugins,
				...((partial.plugins as object) || {}),
				allowedHosts: partial.plugins?.allowedHosts
					? [...partial.plugins.allowedHosts]
					: this.currentConfig.plugins.allowedHosts,
			},
			logging: { ...this.currentConfig.logging, ...((partial.logging as object) || {}) },
			apiKeys: { ...this.currentConfig.apiKeys, ...((partial.apiKeys as object) || {}) },
		};

		const validated = OpenLVETConfigSchema.parse(updated);
		this.currentConfig = validated;
		this.syncLoggerLevel();

		// Notify listeners
		for (const listener of this.listeners) {
			try {
				listener(this.currentConfig);
			} catch (err) {
				logger.error("Error in config change listener", err);
			}
		}

		return this.currentConfig;
	}

	subscribe(listener: ConfigListener): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private syncLoggerLevel(): void {
		const levelStr = this.currentConfig.logging.level;
		const map: Record<string, LogLevel> = {
			DEBUG: LogLevel.DEBUG,
			INFO: LogLevel.INFO,
			WARN: LogLevel.WARN,
			ERROR: LogLevel.ERROR,
			SILENT: LogLevel.SILENT,
		};
		if (map[levelStr] !== undefined) {
			logger.setLevel(map[levelStr]);
		}
	}
}

export const configManager = ConfigManager.getInstance();

export function getConfig(): OpenLVETConfig {
	return configManager.getConfig();
}

export function updateConfig(partial: UserOpenLVETConfig): OpenLVETConfig {
	return configManager.updateConfig(partial);
}

export function defineConfig(config: UserOpenLVETConfig): UserOpenLVETConfig {
	return config;
}

export * from "./schema";
