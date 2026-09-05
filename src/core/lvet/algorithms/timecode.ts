/**
 * OpenLVET Frame-Accurate Timecode Engine
 * Supports standard SMPTE Timecode formats, Drop-Frame (DF), Non-Drop-Frame (NDF),
 * and conversions between microseconds, frames, and string representations.
 */

export interface TimecodeOptions {
	fps?: number;
	dropFrame?: boolean;
}

export class Timecode {
	public readonly fps: number;
	public readonly dropFrame: boolean;

	constructor(fps = 30, dropFrame = false) {
		this.fps = fps;
		// Drop-frame is only valid for 29.97 and 59.94 fps
		this.dropFrame = dropFrame && (Math.abs(fps - 29.97) < 0.01 || Math.abs(fps - 59.94) < 0.01);
	}

	/**
	 * Convert frames to SMPTE Timecode string "HH:MM:SS:FF" (or "HH:MM:SS;FF" for drop-frame)
	 */
	framesToTimecode(totalFrames: number): string {
		let frames = Math.max(0, Math.floor(totalFrames));
		const frameRate = Math.round(this.fps);
		const separator = this.dropFrame ? ";" : ":";

		if (this.dropFrame) {
			const dropFrames = this.fps > 30 ? 4 : 2;
			const framesPerMinute = frameRate * 60 - dropFrames;
			const framesPer10Minutes = Math.round(this.fps * 600);

			const d = Math.floor(frames / framesPer10Minutes);
			const m = frames % framesPer10Minutes;

			if (m > dropFrames) {
				frames += dropFrames * 9 * d + dropFrames * Math.floor((m - dropFrames) / framesPerMinute);
			} else {
				frames += dropFrames * 9 * d;
			}
		}

		const ff = frames % frameRate;
		const totalSeconds = Math.floor(frames / frameRate);
		const ss = totalSeconds % 60;
		const totalMinutes = Math.floor(totalSeconds / 60);
		const mm = totalMinutes % 60;
		const hh = Math.floor(totalMinutes / 60);

		const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
		return `${pad(hh)}:${pad(mm)}:${pad(ss)}${separator}${pad(ff)}`;
	}

	/**
	 * Parse SMPTE timecode string into total frame count
	 */
	timecodeToFrames(tc: string): number {
		const match = tc.trim().match(/^(\d{2}):(\d{2}):(\d{2})[:;](\d{2})$/);
		if (!match) {
			throw new Error(`Invalid SMPTE timecode format: "${tc}". Expected "HH:MM:SS:FF"`);
		}

		const hh = parseInt(match[1], 10);
		const mm = parseInt(match[2], 10);
		const ss = parseInt(match[3], 10);
		const ff = parseInt(match[4], 10);
		const frameRate = Math.round(this.fps);

		let totalFrames = (hh * 3600 + mm * 60 + ss) * frameRate + ff;

		if (this.dropFrame) {
			const dropFrames = this.fps > 30 ? 4 : 2;
			const totalMinutes = hh * 60 + mm;
			const dropped = dropFrames * (totalMinutes - Math.floor(totalMinutes / 10));
			totalFrames -= dropped;
		}

		return Math.max(0, totalFrames);
	}

	/**
	 * Convert microseconds to SMPTE Timecode
	 */
	microsecondsToTimecode(us: number): string {
		const seconds = Math.max(0, us) / 1_000_000;
		const frames = Math.round(seconds * this.fps);
		return this.framesToTimecode(frames);
	}

	/**
	 * Convert SMPTE Timecode to microseconds
	 */
	timecodeToMicroseconds(tc: string): number {
		const frames = this.timecodeToFrames(tc);
		return Math.round((frames / this.fps) * 1_000_000);
	}

	/**
	 * Format duration in microseconds to a readable string (e.g. "01:23.45")
	 */
	static formatDuration(us: number): string {
		const totalMs = Math.max(0, Math.floor(us / 1000));
		const ms = totalMs % 1000;
		const totalSec = Math.floor(totalMs / 1000);
		const sec = totalSec % 60;
		const min = Math.floor(totalSec / 60) % 60;
		const hr = Math.floor(totalSec / 3600);

		const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
		const cs = Math.floor(ms / 10); // Centiseconds
		const csPad = cs < 10 ? `0${cs}` : `${cs}`;

		if (hr > 0) {
			return `${pad(hr)}:${pad(min)}:${pad(sec)}.${csPad}`;
		}
		return `${pad(min)}:${pad(sec)}.${csPad}`;
	}
}
