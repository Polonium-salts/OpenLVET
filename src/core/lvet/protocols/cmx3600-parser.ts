/**
 * OpenLVET CMX 3600 EDL (Edit Decision List) Parser & Generator
 * Conforms to industry standard CMX 3600 ASCII specification.
 */

import { Timecode } from "../algorithms/timecode";

export interface EDLEvent {
	eventNum: string;
	reel: string;
	trackType: "V" | "A" | "A2" | "AA" | "NONE";
	editType: "C" | "D" | "W"; // Cut, Dissolve, Wipe
	transitionDuration?: number;
	srcIn: string;
	srcOut: string;
	recIn: string;
	recOut: string;
	clipName?: string;
	comment?: string;
}

export interface EDLDocument {
	title: string;
	fcm: "DROP FRAME" | "NON-DROP FRAME";
	fps: number;
	events: EDLEvent[];
}

export class CMX3600Parser {
	/**
	 * Parse CMX 3600 EDL text content into structured EDLDocument
	 */
	static parse(edlText: string, defaultFps = 30): EDLDocument {
		const lines = edlText.split(/\r?\n/);
		let title = "UNTITLED_EDL";
		let fcm: "DROP FRAME" | "NON-DROP FRAME" = "NON-DROP FRAME";
		let fps = defaultFps;
		const events: EDLEvent[] = [];

		let currentEvent: EDLEvent | null = null;

		for (const rawLine of lines) {
			const line = rawLine.trim();
			if (!line) continue;

			// Header commands
			if (line.startsWith("TITLE:")) {
				title = line.substring(6).trim();
				continue;
			}
			if (line.startsWith("FCM:")) {
				fcm = line.includes("DROP") ? "DROP FRAME" : "NON-DROP FRAME";
				if (fcm === "DROP FRAME") {
					fps = 29.97;
				}
				continue;
			}

			// Comments / metadata for current event
			if (line.startsWith("*") || line.startsWith("#")) {
				const comment = line.substring(1).trim();
				if (comment.startsWith("FROM CLIP NAME:") && currentEvent) {
					currentEvent.clipName = comment.substring(15).trim();
				} else if (currentEvent) {
					currentEvent.comment = (currentEvent.comment ? `${currentEvent.comment}\n` : "") + comment;
				}
				continue;
			}

			// Event line pattern:
			// 001  AX       V     C        00:00:00:00 00:00:05:00 00:00:00:00 00:00:05:00
			const tokens = line.split(/\s+/);
			if (tokens.length >= 8 && /^\d+$/.test(tokens[0])) {
				if (currentEvent) {
					events.push(currentEvent);
				}

				currentEvent = {
					eventNum: tokens[0],
					reel: tokens[1] || "AX",
					trackType: (tokens[2] as EDLEvent["trackType"]) || "V",
					editType: (tokens[3] as EDLEvent["editType"]) || "C",
					srcIn: tokens[4],
					srcOut: tokens[5],
					recIn: tokens[6],
					recOut: tokens[7],
				};
			}
		}

		if (currentEvent) {
			events.push(currentEvent);
		}

		return {
			title,
			fcm,
			fps,
			events,
		};
	}

	/**
	 * Export structured EDL events into valid CMX 3600 EDL string
	 */
	static export(doc: {
		title?: string;
		fps?: number;
		events: Array<{
			clipName?: string;
			trackType?: "V" | "A";
			srcInMicroseconds: number;
			srcOutMicroseconds: number;
			recInMicroseconds: number;
			recOutMicroseconds: number;
		}>;
	}): string {
		const fps = doc.fps || 30;
		const tc = new Timecode(fps);
		const lines: string[] = [
			`TITLE: ${doc.title || "OPENLVET_PROJECT"}`,
			`FCM: NON-DROP FRAME`,
			"",
		];

		let eventIdx = 1;
		for (const ev of doc.events) {
			const eventNum = String(eventIdx).padStart(3, "0");
			const reel = "AX";
			const track = ev.trackType === "A" ? "A   " : "V   ";
			const edit = "C   ";

			const srcIn = tc.microsecondsToTimecode(ev.srcInMicroseconds);
			const srcOut = tc.microsecondsToTimecode(ev.srcOutMicroseconds);
			const recIn = tc.microsecondsToTimecode(ev.recInMicroseconds);
			const recOut = tc.microsecondsToTimecode(ev.recOutMicroseconds);

			lines.push(`${eventNum}  ${reel}       ${track}  ${edit}     ${srcIn} ${srcOut} ${recIn} ${recOut}`);
			if (ev.clipName) {
				lines.push(`* FROM CLIP NAME: ${ev.clipName}`);
			}
			lines.push("");
			eventIdx++;
		}

		return lines.join("\r\n");
	}
}
