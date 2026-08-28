"use client";

import { useEditor } from "@/editor/use-editor";
import { useTransitionsStore } from "../transitions-store";
import {
	TRANSITION_DEFINITIONS,
	getTransitionDefinition,
} from "../definitions";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { mediaTimeToSeconds, mediaTimeFromSeconds } from "@/wasm";
import { toast } from "sonner";
import {
	SparklesIcon,
	Delete02Icon,
	ArrowRightDoubleIcon,
	Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const DURATION_PRESETS = [0.3, 0.5, 1.0, 1.5, 2.0];

export function TransitionPropertiesTab() {
	const editor = useEditor();
	const { selectedTransitionRef, setSelectedTransitionRef } =
		useTransitionsStore();

	const activeScene = useEditor((e) => e.scenes.getActiveScene());

	if (!selectedTransitionRef || !activeScene) {
		return (
			<div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground text-xs gap-2">
				<HugeiconsIcon
					icon={ArrowRightDoubleIcon}
					className="size-8 text-muted-foreground/40"
				/>
				<span>未选择转场。在时间轴点击素材切点处的转场图标进行编辑。</span>
			</div>
		);
	}

	const { trackId, transitionId } = selectedTransitionRef;
	const track =
		activeScene.tracks.main.id === trackId
			? activeScene.tracks.main
			: activeScene.tracks.overlay.find((t) => t.id === trackId);

	const transition = track?.transitions?.find((t) => t.id === transitionId);

	if (!transition) {
		return (
			<div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground text-xs gap-2">
				<span>转场已被移除</span>
			</div>
		);
	}

	const def = getTransitionDefinition(transition.type);
	const durationSeconds = mediaTimeToSeconds({ time: transition.duration });

	const handleDurationChange = (seconds: number) => {
		const dur = mediaTimeFromSeconds({ seconds: Math.max(0.1, seconds) });
		editor.timeline.updateTransition({
			trackId,
			transitionId,
			patch: { duration: dur },
		});
	};

	const handleTypeChange = (newType: string) => {
		editor.timeline.updateTransition({
			trackId,
			transitionId,
			patch: { type: newType },
		});
	};

	const handleDelete = () => {
		editor.timeline.removeTransition({ trackId, transitionId });
		setSelectedTransitionRef(null);
		toast.success("已删除转场");
	};

	const handleApplyToAll = () => {
		editor.timeline.applyTransitionToAll({
			type: transition.type,
			duration: transition.duration,
		});
		toast.success(`已将 “${def?.name ?? "转场"}” 应用到所有切点`);
	};

	return (
		<div className="flex flex-col gap-5 p-4 text-xs select-none">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-border/40 pb-3">
				<div className="flex items-center gap-2">
					<div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
						<HugeiconsIcon icon={ArrowRightDoubleIcon} className="size-4" />
					</div>
					<div>
						<h3 className="font-semibold text-sm text-foreground">
							{def?.name ?? "转场设置"}
						</h3>
						<span className="text-[11px] text-muted-foreground">
							视频切点平滑过渡
						</span>
					</div>
				</div>

				<Button
					variant="ghost"
					size="icon"
					className="size-7 text-destructive hover:bg-destructive/10"
					onClick={handleDelete}
					title="删除转场"
				>
					<HugeiconsIcon icon={Delete02Icon} className="size-4" />
				</Button>
			</div>

			{/* Transition Type Selector */}
			<div className="space-y-2">
				<label className="text-[11px] font-medium text-muted-foreground">
					转场效果
				</label>
				<Select value={transition.type} onValueChange={handleTypeChange}>
					<SelectTrigger className="h-8 text-xs bg-accent/20 border-border/50">
						<SelectValue placeholder="选择转场" />
					</SelectTrigger>
					<SelectContent className="max-h-64">
						{TRANSITION_DEFINITIONS.map((item) => (
							<SelectItem key={item.id} value={item.id} className="text-xs">
								{item.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Duration Slider */}
			<div className="space-y-2.5">
				<div className="flex items-center justify-between text-[11px]">
					<span className="font-medium text-muted-foreground flex items-center gap-1">
						<HugeiconsIcon icon={Clock01Icon} className="size-3.5" />
						转场时长
					</span>
					<span className="font-mono text-foreground font-semibold">
						{durationSeconds.toFixed(1)}s
					</span>
				</div>

				<Slider
					value={[durationSeconds]}
					min={0.1}
					max={3.0}
					step={0.1}
					onValueChange={([val]) => handleDurationChange(val)}
				/>

				{/* Quick Duration Presets */}
				<div className="flex items-center gap-1.5 pt-1">
					{DURATION_PRESETS.map((preset) => (
						<button
							key={preset}
							type="button"
							onClick={() => handleDurationChange(preset)}
							className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors border ${
								Math.abs(durationSeconds - preset) < 0.05
									? "bg-primary text-primary-foreground border-primary"
									: "bg-accent/30 text-muted-foreground border-border/40 hover:bg-accent/60"
							}`}
						>
							{preset}s
						</button>
					))}
				</div>
			</div>

			{/* Apply to All Cut Points */}
			<div className="pt-2 border-t border-border/40 flex flex-col gap-2">
				<Button
					variant="outline"
					size="sm"
					className="w-full gap-1.5 text-xs h-8 border-border/60 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
					onClick={handleApplyToAll}
				>
					<HugeiconsIcon icon={SparklesIcon} className="size-3.5 text-primary" />
					应用到全部切点
				</Button>

				<Button
					variant="outline"
					size="sm"
					className="w-full text-destructive hover:bg-destructive/10 text-xs h-8 border-destructive/30"
					onClick={handleDelete}
				>
					删除此转场
				</Button>
			</div>
		</div>
	);
}
