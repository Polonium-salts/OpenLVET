import { toast } from "sonner";
import type { EditorCore } from "@/core";
import type { TextElement } from "@/timeline";
import type { TTSProsody, TTSVoice } from "./types";
import { buildElementFromMedia } from "@/timeline/element-utils";
import { mediaTimeFromSeconds } from "@/wasm";

export function formatProsody(prosody: TTSProsody): { rate: string; pitch: string; volume: string } {
	// Rate: 0.5 -> "-50%", 1.0 -> "+0%", 2.0 -> "+100%"
	const ratePercent = Math.round((prosody.rate - 1.0) * 100);
	const rateStr = `${ratePercent >= 0 ? "+" : ""}${ratePercent}%`;

	// Pitch: -50 -> "-50Hz", 0 -> "+0Hz", +50 -> "+50Hz"
	const pitchStr = `${prosody.pitch >= 0 ? "+" : ""}${prosody.pitch}Hz`;

	// Volume: 100 -> "+0%", 50 -> "-50%"
	const volumePercent = Math.round(prosody.volume - 100);
	const volumeStr = `${volumePercent >= 0 ? "+" : ""}${volumePercent}%`;

	return {
		rate: rateStr,
		pitch: pitchStr,
		volume: volumeStr,
	};
}

export function getAudioBlobDuration(blob: Blob): Promise<number> {
	return new Promise((resolve) => {
		const audio = new Audio();
		const url = URL.createObjectURL(blob);
		audio.src = url;
		audio.onloadedmetadata = () => {
			const duration = audio.duration;
			URL.revokeObjectURL(url);
			resolve(Number.isFinite(duration) ? duration : 3);
		};
		audio.onerror = () => {
			URL.revokeObjectURL(url);
			resolve(3);
		};
	});
}

export async function generateSpeechAudio({
	text,
	voice,
	prosody,
}: {
	text: string;
	voice: TTSVoice;
	prosody: TTSProsody;
}): Promise<{ blob: Blob; duration: number }> {
	const { rate, pitch, volume } = formatProsody(prosody);

	const response = await fetch("/api/tts", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			text: text.trim(),
			voice: voice.id,
			rate,
			pitch,
			volume,
		}),
	});

	if (!response.ok) {
		const errJson = await response.json().catch(() => ({ error: "语音合成失败" }));
		throw new Error(errJson.error || "语音合成服务响应异常");
	}

	const blob = await response.blob();
	const duration = await getAudioBlobDuration(blob);

	return { blob, duration };
}

let activePreviewAudio: HTMLAudioElement | null = null;

export function stopSpeechPreview() {
	if (activePreviewAudio) {
		activePreviewAudio.pause();
		activePreviewAudio.currentTime = 0;
		activePreviewAudio = null;
	}
}

export async function playSpeechPreview({
	blob,
	onEnded,
}: {
	blob: Blob;
	onEnded?: () => void;
}): Promise<() => void> {
	stopSpeechPreview();

	const audio = new Audio();
	const url = URL.createObjectURL(blob);
	audio.src = url;
	activePreviewAudio = audio;

	audio.onended = () => {
		URL.revokeObjectURL(url);
		if (activePreviewAudio === audio) {
			activePreviewAudio = null;
		}
		onEnded?.();
	};

	audio.onerror = () => {
		URL.revokeObjectURL(url);
		if (activePreviewAudio === audio) {
			activePreviewAudio = null;
		}
		onEnded?.();
	};

	await audio.play();

	return () => {
		audio.pause();
		URL.revokeObjectURL(url);
		if (activePreviewAudio === audio) {
			activePreviewAudio = null;
		}
		onEnded?.();
	};
}

export async function insertSpeechToTimeline({
	editor,
	textElement,
	voice,
	prosody,
	syncDuration = false,
}: {
	editor: EditorCore;
	textElement: TextElement;
	voice: TTSVoice;
	prosody: TTSProsody;
	syncDuration?: boolean;
}): Promise<boolean> {
	const activeProject = editor.project.getActive();
	if (!activeProject) {
		toast.error("当前没有打开的项目");
		return false;
	}

	const rawContent = textElement.params.content;
	const textContent = (typeof rawContent === "string" ? rawContent : String(rawContent || "")).trim();
	if (!textContent) {
		toast.error("文本内容为空，请输入文本后朗读");
		return false;
	}

	const toastId = toast.loading(`正在为文本生成「${voice.name}」朗读语音...`);

	try {
		const { blob, duration } = await generateSpeechAudio({
			text: textContent,
			voice,
			prosody,
		});

		const safeSnippet = textContent.replace(/[\r\n\t]/g, " ").slice(0, 8);
		const fileName = `朗读_${voice.name}_${safeSnippet}.mp3`;
		const file = new File([blob], fileName, { type: "audio/mpeg" });

		const mediaAsset = await editor.media.addMediaAsset({
			projectId: activeProject.metadata.id,
			asset: {
				name: fileName,
				type: "audio",
				file,
				url: URL.createObjectURL(blob),
				duration,
				hasAudio: true,
			},
		});

		if (!mediaAsset) {
			toast.error("音频资产添加失败", { id: toastId });
			return false;
		}

		const audioDuration = mediaTimeFromSeconds({ seconds: duration });
		const audioElement = buildElementFromMedia({
			mediaId: mediaAsset.id,
			mediaType: "audio",
			name: fileName,
			duration: audioDuration,
			startTime: textElement.startTime,
		});

		editor.timeline.insertElement({
			placement: { mode: "auto", trackType: "audio" },
			element: audioElement,
		});

		// If user requested sync, update text element duration to match audio duration
		if (syncDuration && textElement.id) {
			const scene = editor.scenes.getActiveSceneOrNull();
			const allTracks = scene ? [scene.tracks.main, ...scene.tracks.overlay, ...scene.tracks.audio] : [];
			const track = allTracks.find((t) => t.elements.some((el) => el.id === textElement.id));
			if (track) {
				editor.timeline.updateElements({
					updates: [
						{
							trackId: track.id,
							elementId: textElement.id,
							patch: { duration: audioDuration },
						},
					],
				});
			}
		}

		toast.success(`已生成并插入朗读音频 (${duration.toFixed(1)}s)`, { id: toastId });
		return true;
	} catch (error) {
		console.error("Failed to insert speech audio:", error);
		const message = error instanceof Error ? error.message : "语音合成失败";
		toast.error(message, { id: toastId });
		return false;
	}
}
