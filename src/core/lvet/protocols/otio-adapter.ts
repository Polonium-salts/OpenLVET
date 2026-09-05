/**
 * OpenLVET OpenTimelineIO (OTIO) Adapter
 * Provides bidirectional serialization between OpenLVET timeline structure and OTIO 1.0 JSON format.
 */

export interface OTIORationalTime {
	value: number;
	rate: number;
}

export interface OTIOTimeRange {
	start_time: OTIORationalTime;
	duration: OTIORationalTime;
}

export interface OTIOItem {
	OTIO_SCHEMA: string;
	name: string;
	source_range?: OTIOTimeRange;
	target_url?: string;
	metadata?: Record<string, unknown>;
}

export interface OTIOTimeline {
	OTIO_SCHEMA: "Timeline.1";
	name: string;
	global_start_time?: OTIORationalTime;
	tracks: {
		OTIO_SCHEMA: "Stack.1";
		children: Array<{
			OTIO_SCHEMA: "Track.1";
			name: string;
			kind: "Video" | "Audio";
			children: OTIOItem[];
		}>;
	};
}

export class OTIOAdapter {
	/**
	 * Convert OpenLVET tracks and clips to OpenTimelineIO schema
	 */
	static exportToOTIO(project: {
		name: string;
		fps: number;
		tracks: Array<{
			id: string;
			name: string;
			type: "video" | "audio" | "text";
			elements: Array<{
				id: string;
				name: string;
				startTime: number; // Microseconds
				duration: number; // Microseconds
				url?: string;
			}>;
		}>;
	}): OTIOTimeline {
		const rate = project.fps || 30;

		const otioTracks = project.tracks.map((t) => {
			const kind: "Video" | "Audio" = t.type === "audio" ? "Audio" : "Video";
			const sorted = [...t.elements].sort((a, b) => a.startTime - b.startTime);
			const children: OTIOItem[] = [];
			let cursorUs = 0;

			for (const el of sorted) {
				// Insert Gap if needed
				if (el.startTime > cursorUs) {
					const gapUs = el.startTime - cursorUs;
					children.push({
						OTIO_SCHEMA: "Gap.1",
						name: "Gap",
						source_range: {
							start_time: { value: 0, rate },
							duration: { value: Math.round((gapUs / 1_000_000) * rate), rate },
						},
					});
				}

				// Insert Clip
				const durationFrames = Math.round((el.duration / 1_000_000) * rate);
				children.push({
					OTIO_SCHEMA: "Clip.1",
					name: el.name,
					target_url: el.url,
					source_range: {
						start_time: { value: 0, rate },
						duration: { value: durationFrames, rate },
					},
					metadata: {
						openlvet_element_id: el.id,
						startTimeMicroseconds: el.startTime,
						durationMicroseconds: el.duration,
					},
				});

				cursorUs = el.startTime + el.duration;
			}

			return {
				OTIO_SCHEMA: "Track.1" as const,
				name: t.name || t.id,
				kind,
				children,
			};
		});

		return {
			OTIO_SCHEMA: "Timeline.1",
			name: project.name || "OpenLVET Timeline",
			tracks: {
				OTIO_SCHEMA: "Stack.1",
				children: otioTracks,
			},
		};
	}

	/**
	 * Parse standard OTIO JSON into OpenLVET track representations
	 */
	static parseOTIO(otio: OTIOTimeline): {
		name: string;
		tracks: Array<{
			name: string;
			kind: "video" | "audio";
			clips: Array<{
				name: string;
				startTimeUs: number;
				durationUs: number;
				url?: string;
			}>;
		}>;
	} {
		const tracks = (otio.tracks?.children || []).map((t) => {
			let cursorUs = 0;
			const clips: Array<{
				name: string;
				startTimeUs: number;
				durationUs: number;
				url?: string;
			}> = [];

			for (const child of t.children || []) {
				const durationSec = child.source_range?.duration
					? child.source_range.duration.value / child.source_range.duration.rate
					: 0;
				const durationUs = Math.round(durationSec * 1_000_000);

				if (child.OTIO_SCHEMA === "Clip.1") {
					clips.push({
						name: child.name,
						startTimeUs: cursorUs,
						durationUs,
						url: child.target_url,
					});
				}

				cursorUs += durationUs;
			}

			return {
				name: t.name,
				kind: t.kind === "Audio" ? ("audio" as const) : ("video" as const),
				clips,
			};
		});

		return {
			name: otio.name,
			tracks,
		};
	}
}
