/**
 * OpenLVET Audio Waveform Extraction Engine
 * Computes peak and RMS downsampled amplitudes from raw PCM audio channel data
 * for high-performance timeline visualization.
 */

export interface WaveformSummary {
	peaks: Float32Array; // Interleaved min/max or normalized [0..1] peaks
	channels: number;
	sampleRate: number;
	durationSec: number;
	length: number;
}

export class WaveformEngine {
	/**
	 * Compute normalized peak values [0..1] for audio samples downsampled to `targetLength` bars
	 */
	static computePeaks(
		channelData: Float32Array,
		targetLength = 500,
	): Float32Array {
		if (!channelData.length || targetLength <= 0) {
			return new Float32Array(0);
		}

		const step = Math.max(1, Math.floor(channelData.length / targetLength));
		const peaks = new Float32Array(targetLength);

		for (let i = 0; i < targetLength; i++) {
			const start = i * step;
			const end = Math.min(channelData.length, start + step);
			let maxPeak = 0;

			for (let j = start; j < end; j++) {
				const val = Math.abs(channelData[j]);
				if (val > maxPeak) {
					maxPeak = val;
				}
			}

			peaks[i] = Math.min(1.0, maxPeak);
		}

		return peaks;
	}

	/**
	 * Compute Root-Mean-Square (RMS) amplitude downsampled to `targetLength`
	 */
	static computeRMS(
		channelData: Float32Array,
		targetLength = 500,
	): Float32Array {
		if (!channelData.length || targetLength <= 0) {
			return new Float32Array(0);
		}

		const step = Math.max(1, Math.floor(channelData.length / targetLength));
		const rms = new Float32Array(targetLength);

		for (let i = 0; i < targetLength; i++) {
			const start = i * step;
			const end = Math.min(channelData.length, start + step);
			let sumSquares = 0;
			const count = end - start;

			if (count === 0) continue;

			for (let j = start; j < end; j++) {
				sumSquares += channelData[j] * channelData[j];
			}

			rms[i] = Math.min(1.0, Math.sqrt(sumSquares / count));
		}

		return rms;
	}
}
