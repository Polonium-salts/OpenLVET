/**
 * OpenLVET Configuration Schema Specification
 * Defines type-safe settings for Editor, Storage, Server, Rendering, Plugins, and Logging.
 */

import { z } from "zod";

export const LoggingConfigSchema = z.object({
	level: z.enum(["DEBUG", "INFO", "WARN", "ERROR", "SILENT"]).default("INFO"),
	enableConsole: z.boolean().default(true),
	enableBuffer: z.boolean().default(true),
	bufferCapacity: z.number().int().min(50).max(5000).default(1000),
});

export const StorageConfigSchema = z.object({
	persistence: z.enum(["opfs", "indexeddb", "memory"]).default("opfs"),
	autoPersistPrompt: z.boolean().default(true),
	maxProjectSizeMb: z.number().default(2048),
	quotaWarningThresholdPercent: z.number().min(50).max(95).default(80),
});

export const EditorConfigSchema = z.object({
	defaultFps: z.number().default(30),
	defaultWidth: z.number().int().default(1920),
	defaultHeight: z.number().int().default(1080),
	defaultAspectRatio: z.string().default("16:9"),
	maxUndoStack: z.number().int().default(100),
	autoSaveIntervalMs: z.number().int().default(2000),
	snappingTolerancePx: z.number().int().default(10),
	magneticSnapping: z.boolean().default(true),
	rippleEditingDefault: z.boolean().default(false),
});

export const RenderingConfigSchema = z.object({
	concurrency: z.number().int().min(1).max(16).default(2),
	hardwareAcceleration: z.boolean().default(true),
	preferredCodec: z.enum(["avc1", "vp09", "av01", "auto"]).default("auto"),
	defaultFormat: z.enum(["mp4", "webm", "gif"]).default("mp4"),
	maxExportDurationSec: z.number().default(3600),
});

export const PluginsConfigSchema = z.object({
	enabled: z.boolean().default(true),
	autoSeedBuiltin: z.boolean().default(true),
	allowThirdPartyGit: z.boolean().default(true),
	allowedHosts: z.array(z.string()).default(["github.com", "api.pexels.com"]),
});

export const ServerConfigSchema = z.object({
	port: z.number().int().default(3000),
	host: z.string().default("0.0.0.0"),
	siteUrl: z.string().default("http://localhost:3000"),
	apiPrefix: z.string().default("/api/v1"),
	corsEnabled: z.boolean().default(true),
});

export const OpenLVETConfigSchema = z.object({
	env: z.enum(["development", "production", "test"]).default("development"),
	version: z.string().default("1.0.0"),
	server: ServerConfigSchema.default(() => ServerConfigSchema.parse({})),
	editor: EditorConfigSchema.default(() => EditorConfigSchema.parse({})),
	storage: StorageConfigSchema.default(() => StorageConfigSchema.parse({})),
	rendering: RenderingConfigSchema.default(() => RenderingConfigSchema.parse({})),
	plugins: PluginsConfigSchema.default(() => PluginsConfigSchema.parse({})),
	logging: LoggingConfigSchema.default(() => LoggingConfigSchema.parse({})),
	apiKeys: z
		.object({
			pexels: z.string().optional().default(""),
			pixabay: z.string().optional().default(""),
			freesound: z.string().optional().default(""),
		})
		.default(() => ({ pexels: "", pixabay: "", freesound: "" })),
});

export type OpenLVETConfig = z.infer<typeof OpenLVETConfigSchema>;
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends Array<infer U>
		? U[]
		: T[P] extends object
			? DeepPartial<T[P]>
			: T[P];
};
export type UserOpenLVETConfig = DeepPartial<OpenLVETConfig>;
