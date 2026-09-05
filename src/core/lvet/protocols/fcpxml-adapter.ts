/**
 * OpenLVET Apple Final Cut Pro XML (FCPXML) Adapter
 * Provides import and export capability for FCPXML sequence interchange.
 */

export interface FCPXMLClip {
	name: string;
	start: string; // e.g. "0s"
	duration: string; // e.g. "5s"
	offset: string; // e.g. "0s"
}

export class FCPXMLAdapter {
	/**
	 * Export OpenLVET sequence to standard FCPXML string
	 */
	static exportToFCPXML(data: {
		projectName: string;
		fps: number;
		width: number;
		height: number;
		clips: Array<{
			name: string;
			startTimeMicroseconds: number;
			durationMicroseconds: number;
		}>;
	}): string {
		const fps = data.fps || 30;
		const frameDuration = `100/${Math.round(fps * 100)}s`;

		const clipXmls = data.clips.map((clip, idx) => {
			const offsetSec = (clip.startTimeMicroseconds / 1_000_000).toFixed(3);
			const durSec = (clip.durationMicroseconds / 1_000_000).toFixed(3);
			return `                    <video name="${escapeXml(clip.name)}" offset="${offsetSec}s" duration="${durSec}s" start="0s" ref="r${idx + 2}"/>`;
		});

		return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
    <resources>
        <format id="r1" name="FFVideoFormat${data.height}p${Math.round(fps)}" frameDuration="${frameDuration}" width="${data.width}" height="${data.height}"/>
    </resources>
    <library>
        <event name="OpenLVET Event">
            <project name="${escapeXml(data.projectName)}">
                <sequence format="r1">
                    <spine>
${clipXmls.join("\n")}
                    </spine>
                </sequence>
            </project>
        </event>
    </library>
</fcpxml>`;
	}

	/**
	 * Parse basic FCPXML string into clips
	 */
	static parseFCPXML(xmlString: string): {
		projectName: string;
		clips: Array<{
			name: string;
			startTimeUs: number;
			durationUs: number;
		}>;
	} {
		const nameMatch = xmlString.match(/<project name="([^"]+)"/);
		const projectName = nameMatch ? nameMatch[1] : "Imported FCPXML";

		const clips: Array<{ name: string; startTimeUs: number; durationUs: number }> = [];
		const videoRegex = /<video\s+[^>]*name="([^"]+)"[^>]*offset="([0-9.]+)s"[^>]*duration="([0-9.]+)s"/g;

		let match: RegExpExecArray | null;
		while ((match = videoRegex.exec(xmlString)) !== null) {
			const name = match[1];
			const offsetSec = parseFloat(match[2]);
			const durSec = parseFloat(match[3]);

			clips.push({
				name,
				startTimeUs: Math.round(offsetSec * 1_000_000),
				durationUs: Math.round(durSec * 1_000_000),
			});
		}

		return {
			projectName,
			clips,
		};
	}
}

function escapeXml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}
