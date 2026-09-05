/**
 * OpenLVET Core Business Engine Facade
 * Bundles algorithms (Timecode, Ripple, Snapping, Waveform) and protocols (EDL, OTIO, FCPXML, OpenLVET).
 */

import { Timecode } from "./algorithms/timecode";
import { RippleEngine } from "./algorithms/ripple-engine";
import { SnapEngine } from "./algorithms/snap-engine";
import { WaveformEngine } from "./algorithms/waveform-engine";
import { CMX3600Parser } from "./protocols/cmx3600-parser";
import { OTIOAdapter } from "./protocols/otio-adapter";
import { FCPXMLAdapter } from "./protocols/fcpxml-adapter";
import { OpenLVETProtocol } from "./protocols/openlvet-protocol";
import { logger } from "@/logger";

export class LVETEngine {
	public static readonly algorithms = {
		Timecode,
		RippleEngine,
		SnapEngine,
		WaveformEngine,
	};

	public static readonly protocols = {
		CMX3600Parser,
		OTIOAdapter,
		FCPXMLAdapter,
		OpenLVETProtocol,
	};

	/**
	 * Parse any supported project or timeline file format (EDL, OTIO, FCPXML, OpenLVET JSON)
	 */
	static parseTimelineFile(content: string, format?: "edl" | "otio" | "fcpxml" | "openlvet" | "auto"): unknown {
		const trimmed = content.trim();

		// Auto-detect format
		let detectedFormat = format || "auto";
		if (detectedFormat === "auto") {
			if (trimmed.startsWith("TITLE:") || trimmed.includes("FCM:")) {
				detectedFormat = "edl";
			} else if (trimmed.startsWith("<?xml") || trimmed.includes("<fcpxml")) {
				detectedFormat = "fcpxml";
			} else if (trimmed.startsWith("{") && trimmed.includes("Timeline.1")) {
				detectedFormat = "otio";
			} else {
				detectedFormat = "openlvet";
			}
		}

		logger.info(`LVETEngine: Parsing timeline file using format '${detectedFormat}'`);

		switch (detectedFormat) {
			case "edl":
				return CMX3600Parser.parse(trimmed);
			case "otio":
				return OTIOAdapter.parseOTIO(JSON.parse(trimmed));
			case "fcpxml":
				return FCPXMLAdapter.parseFCPXML(trimmed);
			case "openlvet":
			default:
				return OpenLVETProtocol.unpackageProject(JSON.parse(trimmed));
		}
	}
}

export * from "./algorithms/timecode";
export * from "./algorithms/ripple-engine";
export * from "./algorithms/snap-engine";
export * from "./algorithms/waveform-engine";
export * from "./protocols/cmx3600-parser";
export * from "./protocols/otio-adapter";
export * from "./protocols/fcpxml-adapter";
export * from "./protocols/openlvet-protocol";
