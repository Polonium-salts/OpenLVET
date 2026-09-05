/**
 * OpenLVET Magnetic Snapping Engine
 * Calculates candidate snap targets (clip boundaries, playhead, bookmarks, grid markers)
 * and determines optimal magnetic snap points with customizable tolerance.
 */

export interface SnapPoint {
	time: number; // Microseconds
	type: "playhead" | "clip_start" | "clip_end" | "marker" | "grid";
	label?: string;
	priority: number; // Higher is prioritized
}

export interface SnapTarget {
	snappedTime: number;
	originalTime: number;
	delta: number;
	point: SnapPoint;
}

export class SnapEngine {
	/**
	 * Gather all candidate snap points across clips, playhead, markers, and grid
	 */
	static collectSnapPoints(params: {
		clips?: Array<{ startTime: number; duration: number }>;
		playheadTime?: number;
		markers?: Array<{ time: number; note?: string }>;
		gridIntervalMicroseconds?: number;
		maxDuration?: number;
	}): SnapPoint[] {
		const points: SnapPoint[] = [];

		// 1. Playhead (Highest priority)
		if (params.playheadTime !== undefined && params.playheadTime >= 0) {
			points.push({
				time: params.playheadTime,
				type: "playhead",
				label: "播放头",
				priority: 100,
			});
		}

		// 2. Clip boundaries (Start and End)
		if (params.clips) {
			for (const clip of params.clips) {
				points.push({
					time: clip.startTime,
					type: "clip_start",
					label: "片段起点",
					priority: 80,
				});
				points.push({
					time: clip.startTime + clip.duration,
					type: "clip_end",
					label: "片段终点",
					priority: 80,
				});
			}
		}

		// 3. Markers / Bookmarks
		if (params.markers) {
			for (const marker of params.markers) {
				points.push({
					time: marker.time,
					type: "marker",
					label: marker.note || "书签标记",
					priority: 70,
				});
			}
		}

		// 4. Sequence Origin
		points.push({
			time: 0,
			type: "grid",
			label: "序列起点",
			priority: 90,
		});

		// De-duplicate points with same timestamp (keep highest priority)
		const map = new Map<number, SnapPoint>();
		for (const p of points) {
			const existing = map.get(p.time);
			if (!existing || p.priority > existing.priority) {
				map.set(p.time, p);
			}
		}

		return Array.from(map.values()).sort((a, b) => a.time - b.time);
	}

	/**
	 * Find nearest snap point within tolerance (in microseconds)
	 */
	static findNearestSnap(
		targetTime: number,
		snapPoints: SnapPoint[],
		toleranceMicroseconds = 200_000, // 200ms default tolerance
	): SnapTarget | null {
		if (!snapPoints.length || toleranceMicroseconds <= 0) {
			return null;
		}

		let bestMatch: SnapPoint | null = null;
		let minDistance = Infinity;

		for (const point of snapPoints) {
			const distance = Math.abs(point.time - targetTime);
			if (distance <= toleranceMicroseconds) {
				if (
					distance < minDistance ||
					(distance === minDistance && (!bestMatch || point.priority > bestMatch.priority))
				) {
					minDistance = distance;
					bestMatch = point;
				}
			}
		}

		if (!bestMatch) {
			return null;
		}

		return {
			snappedTime: bestMatch.time,
			originalTime: targetTime,
			delta: bestMatch.time - targetTime,
			point: bestMatch,
		};
	}
}
