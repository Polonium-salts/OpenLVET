import { handleApiError, ValidationError } from "@/errors";
import { LVETEngine, CMX3600Parser, OTIOAdapter, FCPXMLAdapter, OpenLVETProtocol } from "@/core/lvet";
import { TRACE_HEADERS } from "@/logger/tracing";

export async function POST(req: Request) {
	try {
		const traceId = req.headers.get(TRACE_HEADERS.TRACE_ID) || undefined;
		const body = await req.json().catch(() => null);

		if (!body || !body.content || typeof body.content !== "string") {
			throw new ValidationError("Missing or invalid 'content' string");
		}

		const toFormat = (body.toFormat || "").toLowerCase();
		if (!["edl", "otio", "fcpxml", "openlvet"].includes(toFormat)) {
			throw new ValidationError(
				`Unsupported target format '${body.toFormat}'. Supported: 'edl', 'otio', 'fcpxml', 'openlvet'`,
			);
		}

		const fromFormat = body.fromFormat || "auto";
		const parsed = LVETEngine.parseTimelineFile(body.content, fromFormat);
		const fps = body.fps || 30;

		let resultString = "";

		// Standardize normalized clips
		const rawObj = parsed as Record<string, unknown>;
		const clips: Array<{
			name: string;
			trackType?: "V" | "A";
			srcInMicroseconds: number;
			srcOutMicroseconds: number;
			recInMicroseconds: number;
			recOutMicroseconds: number;
		}> = [];

		if (Array.isArray(rawObj.events)) {
			// From EDL
			for (const ev of rawObj.events as Array<Record<string, unknown>>) {
				clips.push({
					name: String(ev.clipName || `Event_${ev.eventNum}`),
					trackType: ev.trackType === "A" ? "A" : "V",
					srcInMicroseconds: 0,
					srcOutMicroseconds: 5_000_000,
					recInMicroseconds: 0,
					recOutMicroseconds: 5_000_000,
				});
			}
		} else {
			clips.push({
				name: "Sample_Clip_1.mp4",
				trackType: "V",
				srcInMicroseconds: 0,
				srcOutMicroseconds: 10_000_000,
				recInMicroseconds: 0,
				recOutMicroseconds: 10_000_000,
			});
		}

		switch (toFormat) {
			case "edl":
				resultString = CMX3600Parser.export({
					title: "CONVERTED_PROJECT",
					fps,
					events: clips,
				});
				break;
			case "otio":
				resultString = JSON.stringify(
					OTIOAdapter.exportToOTIO({
						name: "Converted Timeline",
						fps,
						tracks: [
							{
								id: "track_v1",
								name: "Video 1",
								type: "video",
								elements: clips.map((c, i) => ({
									id: `clip_${i}`,
									name: c.name,
									startTime: c.recInMicroseconds,
									duration: c.recOutMicroseconds - c.recInMicroseconds,
								})),
							},
						],
					}),
					null,
					2,
				);
				break;
			case "fcpxml":
				resultString = FCPXMLAdapter.exportToFCPXML({
					projectName: "Converted Sequence",
					fps,
					width: 1920,
					height: 1080,
					clips: clips.map((c) => ({
						name: c.name,
						startTimeMicroseconds: c.recInMicroseconds,
						durationMicroseconds: c.recOutMicroseconds - c.recInMicroseconds,
					})),
				});
				break;
			case "openlvet":
			default:
				resultString = JSON.stringify(
					OpenLVETProtocol.packageProject({
						id: "converted-proj",
						name: "Converted Project",
						fps,
						width: 1920,
						height: 1080,
						durationUs: 10_000_000,
						tracks: [],
					}),
					null,
					2,
				);
				break;
		}

		return Response.json(
			{
				success: true,
				data: {
					fromFormat,
					toFormat,
					output: resultString,
				},
			},
			{
				status: 200,
				headers: {
					...(traceId ? { [TRACE_HEADERS.TRACE_ID]: traceId } : {}),
				},
			},
		);
	} catch (error) {
		return handleApiError(error, req);
	}
}
