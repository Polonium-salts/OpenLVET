/**
 * OpenLVET Ripple Editing Engine
 * Implements NLE standard ripple push, ripple cut, gap closing, and rolling edits.
 */

export interface TimelineClip {
	id: string;
	startTime: number; // Microseconds
	duration: number; // Microseconds
	trimIn?: number;
	trimOut?: number;
	[key: string]: unknown;
}

export interface Gap {
	startTime: number;
	duration: number;
	endTime: number;
}

export class RippleEngine {
	/**
	 * Ripple Push: When a clip is inserted or lengthened at `atTime`,
	 * shift all downstream clips by `deltaDuration`.
	 */
	static ripplePush<T extends TimelineClip>(
		clips: T[],
		atTime: number,
		deltaDuration: number,
	): T[] {
		if (deltaDuration === 0) return [...clips];

		return clips.map((clip) => {
			if (clip.startTime >= atTime) {
				return {
					...clip,
					startTime: Math.max(0, clip.startTime + deltaDuration),
				};
			}
			return { ...clip };
		});
	}

	/**
	 * Ripple Cut: Removes a range [startTime, startTime + duration] and shifts
	 * all subsequent clips left by `duration` to automatically close the gap.
	 */
	static rippleCut<T extends TimelineClip>(
		clips: T[],
		startTime: number,
		duration: number,
	): T[] {
		if (duration <= 0) return [...clips];
		const endTime = startTime + duration;

		const remainingClips = clips.filter((clip) => {
			const clipEnd = clip.startTime + clip.duration;
			// Drop clips entirely within cut range
			return !(clip.startTime >= startTime && clipEnd <= endTime);
		});

		return remainingClips.map((clip) => {
			if (clip.startTime >= endTime) {
				return {
					...clip,
					startTime: Math.max(0, clip.startTime - duration),
				};
			}
			return { ...clip };
		});
	}

	/**
	 * Detect all empty gaps on a track up to `totalDuration`
	 */
	static findGaps<T extends TimelineClip>(
		clips: T[],
		totalDuration?: number,
	): Gap[] {
		const sorted = [...clips].sort((a, b) => a.startTime - b.startTime);
		const gaps: Gap[] = [];
		let cursor = 0;

		for (const clip of sorted) {
			if (clip.startTime > cursor) {
				gaps.push({
					startTime: cursor,
					duration: clip.startTime - cursor,
					endTime: clip.startTime,
				});
			}
			cursor = Math.max(cursor, clip.startTime + clip.duration);
		}

		if (totalDuration !== undefined && totalDuration > cursor) {
			gaps.push({
				startTime: cursor,
				duration: totalDuration - cursor,
				endTime: totalDuration,
			});
		}

		return gaps;
	}

	/**
	 * Close all gaps on a track by packing all clips contiguously starting from 0
	 */
	static closeAllGaps<T extends TimelineClip>(clips: T[]): T[] {
		const sorted = [...clips].sort((a, b) => a.startTime - b.startTime);
		let cursor = 0;

		return sorted.map((clip) => {
			const updated = {
				...clip,
				startTime: cursor,
			};
			cursor += clip.duration;
			return updated;
		});
	}

	/**
	 * Roll Edit: Adjusts the cut point between two adjacent clips.
	 * Clip A's duration changes by +delta, while Clip B's startTime and duration change by +delta and -delta.
	 * Total sequence duration remains constant.
	 */
	static rollEdit<T extends TimelineClip>(
		clipA: T,
		clipB: T,
		deltaMicroseconds: number,
		minClipDuration = 100_000, // 100ms
	): { clipA: T; clipB: T } {
		const newDurationA = clipA.duration + deltaMicroseconds;
		const newDurationB = clipB.duration - deltaMicroseconds;

		if (newDurationA < minClipDuration || newDurationB < minClipDuration) {
			throw new Error("Roll edit exceeds minimum clip duration limit");
		}

		const updatedA: T = {
			...clipA,
			duration: newDurationA,
		};

		const updatedB: T = {
			...clipB,
			startTime: clipB.startTime + deltaMicroseconds,
			duration: newDurationB,
		};

		return { clipA: updatedA, clipB: updatedB };
	}
}
