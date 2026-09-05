/**
 * OpenLVET - Open Linear Video Editing Toolkit
 * Official Master Library & SDK Entry Point
 */

import type { EditorCore } from "./core";
import { LVETEngine, Timecode, RippleEngine, SnapEngine, WaveformEngine, CMX3600Parser, OTIOAdapter, FCPXMLAdapter, OpenLVETProtocol } from "./core/lvet";
import { configManager, getConfig, updateConfig, defineConfig, type OpenLVETConfig, type UserOpenLVETConfig } from "./config";
import { logger, createLogger, LogLevel, globalLogBuffer, LogRingBuffer, withTrace, generateTraceId, getActiveTraceId, TRACE_HEADERS } from "./logger";
import {
	OpenLVETError,
	ValidationError,
	NotFoundError,
	TimelineError,
	RenderError,
	PluginError,
	MediaError,
	ProtocolError,
	ConfigError,
	handleApiError,
} from "./errors";
import { pluginManager, PluginManager } from "./plugins/plugin-manager";
import { OpenLVETErrorBoundary } from "./components/error-boundary";
import { runCli } from "./cli";

export interface OpenLVETInitOptions {
	config?: UserOpenLVETConfig;
	autoInitPlugins?: boolean;
}

/**
 * OpenLVET Unified SDK Interface
 * Use this class to programmatically embed, control, and orchestrate the OpenLVET engine.
 */
export class OpenLVET {
	public readonly version = "1.0.0";
	public readonly logger = logger;
	public readonly config = configManager;
	public readonly algorithms = {
		Timecode,
		RippleEngine,
		SnapEngine,
		WaveformEngine,
	};
	public readonly protocols = {
		CMX3600Parser,
		OTIOAdapter,
		FCPXMLAdapter,
		OpenLVETProtocol,
	};
	public readonly pluginManager = pluginManager;

	private _editor: EditorCore | null = null;

	constructor(options: OpenLVETInitOptions = {}) {
		if (options.config) {
			this.config.updateConfig(options.config);
		}
	}

	/**
	 * Access the underlying EditorCore instance
	 */
	get editor(): EditorCore {
		if (!this._editor) {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const { EditorCore } = require("./core");
			this._editor = EditorCore.getInstance();
		}
		return this._editor!;
	}

	/**
	 * Parse any supported project or timeline file (EDL, OTIO, FCPXML, OpenLVET JSON)
	 */
	parseTimeline(content: string, format?: "edl" | "otio" | "fcpxml" | "openlvet" | "auto") {
		return LVETEngine.parseTimelineFile(content, format);
	}

	/**
	 * Convert timeline between interchange formats
	 */
	convertTimeline(params: {
		content: string;
		fromFormat?: "edl" | "otio" | "fcpxml" | "openlvet" | "auto";
		toFormat: "edl" | "otio" | "fcpxml" | "openlvet";
		fps?: number;
	}): string {
		const parsed = LVETEngine.parseTimelineFile(params.content, params.fromFormat);
		const fps = params.fps || 30;

		switch (params.toFormat) {
			case "edl":
				return CMX3600Parser.export({
					title: "CONVERTED_EDL",
					fps,
					events: [],
				});
			case "otio":
				return JSON.stringify(
					OTIOAdapter.exportToOTIO({
						name: "Converted Sequence",
						fps,
						tracks: [],
					}),
					null,
					2,
				);
			case "fcpxml":
				return FCPXMLAdapter.exportToFCPXML({
					projectName: "Converted Sequence",
					fps,
					width: 1920,
					height: 1080,
					clips: [],
				});
			case "openlvet":
			default:
				return JSON.stringify(
					OpenLVETProtocol.packageProject({
						id: "sdk-export",
						name: "Exported Sequence",
						fps,
						width: 1920,
						height: 1080,
						durationUs: 0,
						tracks: [],
					}),
					null,
					2,
				);
		}
	}
}

/**
 * OpenLVET SDK Factory Function
 */
export function createOpenLVET(options?: OpenLVETInitOptions): OpenLVET {
	return new OpenLVET(options);
}

// Export Core Classes and Managers
export type { EditorCore } from "./core";
export function getEditorCore(): EditorCore {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const { EditorCore } = require("./core");
	return EditorCore.getInstance();
}
export { PluginManager, pluginManager } from "./plugins/plugin-manager";

// Export LVET Business Algorithms and Protocols
export {
	LVETEngine,
	Timecode,
	RippleEngine,
	SnapEngine,
	WaveformEngine,
	CMX3600Parser,
	OTIOAdapter,
	FCPXMLAdapter,
	OpenLVETProtocol,
} from "./core/lvet";

// Export Configuration
export {
	configManager,
	getConfig,
	updateConfig,
	defineConfig,
	type OpenLVETConfig,
	type UserOpenLVETConfig,
} from "./config";

// Export Logging and Observability
export {
	logger,
	createLogger,
	LogLevel,
	globalLogBuffer,
	LogRingBuffer,
	withTrace,
	generateTraceId,
	getActiveTraceId,
	TRACE_HEADERS,
} from "./logger";

// Export Unified Exceptions
export {
	OpenLVETError,
	ValidationError,
	NotFoundError,
	TimelineError,
	RenderError,
	PluginError,
	MediaError,
	ProtocolError,
	ConfigError,
	handleApiError,
} from "./errors";

// Export React Components
export { OpenLVETErrorBoundary } from "./components/error-boundary";

// Export CLI
export { runCli } from "./cli";

// Default export
export default OpenLVET;
