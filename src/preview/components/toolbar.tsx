"use client";

import { useState, useEffect } from "react";
import { useEditor } from "@/editor/use-editor";
import { formatTimecode } from "opencut-wasm";
import { invokeAction } from "@/actions";
import { EditableTimecode } from "@/components/editable-timecode";
import { Button } from "@/components/ui/button";
import {
	FullScreenIcon,
	PauseIcon,
	PlayIcon,
	PreviousIcon,
	NextIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectSeparator,
} from "@/components/ui/select";
import { PREVIEW_ZOOM_PRESETS } from "@/preview/zoom";
import { usePreviewViewport } from "./preview-viewport";
import { usePreviewStore } from "@/preview/preview-store";
import type { MediaTime } from "@/wasm";

export function PreviewToolbar({
	onToggleFullscreen,
}: {
	onToggleFullscreen: () => void;
}) {
	return (
		<div className="grid grid-cols-[1fr_auto_1fr] items-center pb-2.5 pt-3 px-4 bg-background/50 select-none">
			<TimecodeDisplay />
			<PlayerControls />
			<div className="justify-self-end flex items-center gap-2">
				<ZoomSelect />
				<Separator orientation="vertical" className="h-4" />
				<Button
					variant="ghost"
					size="icon"
					className="size-8 text-muted-foreground hover:text-foreground"
					onClick={onToggleFullscreen}
					title="全屏预览"
				>
					<HugeiconsIcon icon={FullScreenIcon} className="size-4" />
				</Button>
			</div>
		</div>
	);
}

function TimecodeDisplay() {
	const editor = useEditor();
	const totalDuration = useEditor((e) => e.timeline.getTotalDuration());
	const fps = useEditor((e) => e.project.getActive().settings.fps);
	const [currentTime, setCurrentTime] = useState<MediaTime>(() =>
		editor.playback.getCurrentTime(),
	);

	useEffect(() => {
		const unsubscribeUpdate = editor.playback.onUpdate(setCurrentTime);
		const unsubscribeSeek = editor.playback.onSeek(setCurrentTime);
		return () => {
			unsubscribeUpdate();
			unsubscribeSeek();
		};
	}, [editor.playback]);

	return (
		<div className="flex items-center gap-1.5 font-mono text-xs">
			<EditableTimecode
				time={currentTime}
				duration={totalDuration}
				format="HH:MM:SS:FF"
				fps={fps}
				onTimeChange={({ time }) => editor.playback.seek({ time })}
				className="text-center font-semibold text-foreground bg-accent/40 px-2 py-0.5 rounded"
			/>
			<span className="text-muted-foreground">/</span>
			<span className="text-muted-foreground">
				{formatTimecode({
					time: totalDuration,
					format: "HH:MM:SS:FF",
					rate: fps,
				})}
			</span>
		</div>
	);
}

function ZoomSelect() {
	const { isAtFit, zoomPercent, fitToScreen, setViewportPercent } =
		usePreviewViewport();

	const displayLabel = isAtFit ? "自适应" : `${zoomPercent}%`;

	const onValueChange = (value: string) => {
		if (value === "fit") {
			fitToScreen();
		} else {
			setViewportPercent({ percent: Number(value) });
		}
	};

	return (
		<Select
			value={isAtFit ? "fit" : String(zoomPercent)}
			onValueChange={onValueChange}
		>
			<SelectTrigger className="h-7 text-xs px-2.5 gap-1.5 bg-accent/30 border-border/50 tabular-nums">
				{displayLabel}
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="fit">自适应窗口</SelectItem>
				<SelectSeparator />
				{PREVIEW_ZOOM_PRESETS.map((preset) => (
					<SelectItem key={preset} value={String(preset)}>
						{preset}%
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function PlayerControls() {
	const isPlaying = useEditor((e) => e.playback.getIsPlaying());

	return (
		<div className="flex items-center gap-1">
			<Button
				variant="ghost"
				size="icon"
				className="size-8 text-muted-foreground hover:text-foreground"
				onClick={() => invokeAction("step-backward")}
				title="上一帧 (←)"
			>
				<HugeiconsIcon icon={PreviousIcon} className="size-3.5" />
			</Button>

			<Button
				variant="default"
				size="icon"
				className="size-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
				onClick={() => invokeAction("toggle-play")}
				title={isPlaying ? "暂停 (空格键)" : "播放 (空格键)"}
			>
				<HugeiconsIcon icon={isPlaying ? PauseIcon : PlayIcon} className="size-4 fill-current" />
			</Button>

			<Button
				variant="ghost"
				size="icon"
				className="size-8 text-muted-foreground hover:text-foreground"
				onClick={() => invokeAction("step-forward")}
				title="下一帧 (→)"
			>
				<HugeiconsIcon icon={NextIcon} className="size-3.5" />
			</Button>
		</div>
	);
}
