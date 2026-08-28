"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useEditor } from "@/editor/use-editor";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { TextElement } from "@/timeline";
import {
	TEXT_ANIMATION_IN_PRESETS,
	TEXT_ANIMATION_OUT_PRESETS,
	TEXT_ANIMATION_LOOP_PRESETS,
} from "@/text/animation/definitions";
import type {
	TextAnimationPreset,
	TextAnimationCategory,
	TextAnimationState,
} from "@/text/animation/types";
import { evaluateTextAnimation } from "@/text/animation/evaluator";
import { cn } from "@/utils/ui";
import {
	PlayIcon,
	ArrowRight01Icon,
	ArrowLeft01Icon,
	RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const IN_OUT_DURATION_PRESETS = [0.3, 0.5, 0.8, 1.0, 1.5, 2.0];
const LOOP_SPEED_PRESETS = [0.5, 0.75, 1.0, 1.5, 2.0];

function TextAnimationCard({
	preset,
	category,
	isSelected,
	onSelect,
}: {
	preset: TextAnimationPreset;
	category: TextAnimationCategory;
	isSelected: boolean;
	onSelect: () => void;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isHovered, setIsHovered] = useState(false);
	const animRef = useRef<number | null>(null);

	const renderFrame = (localTime: number, totalDur: number) => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const width = canvas.width;
		const height = canvas.height;

		// Clear & background
		ctx.clearRect(0, 0, width, height);

		// Sleek dark gradient background
		const bgGrad = ctx.createLinearGradient(0, 0, width, height);
		bgGrad.addColorStop(0, isSelected ? "#0c1322" : "#090d16");
		bgGrad.addColorStop(1, isSelected ? "#1e1b4b" : "#111827");
		ctx.fillStyle = bgGrad;
		ctx.fillRect(0, 0, width, height);

		// Ambient glow on selected/hover
		if (isSelected || isHovered) {
			const glow = ctx.createRadialGradient(
				width / 2,
				height / 2,
				4,
				width / 2,
				height / 2,
				48,
			);
			glow.addColorStop(0, isSelected ? "rgba(56, 189, 248, 0.3)" : "rgba(255, 255, 255, 0.12)");
			glow.addColorStop(1, "transparent");
			ctx.fillStyle = glow;
			ctx.fillRect(0, 0, width, height);
		}

		// Animation evaluation
		const sampleText = "Aa";
		const animConfig: TextAnimationState = {
			[category]: {
				type: preset.id,
				duration: preset.defaultDuration,
				speed: 1.0,
			},
		};

		const evalResult = evaluateTextAnimation({
			animation: animConfig,
			localTimeSeconds: localTime,
			totalDurationSeconds: totalDur,
			fullTextLength: sampleText.length,
		});

		const centerX = width / 2;
		const centerY = height / 2;

		ctx.save();
		// Clip for mask wipes
		if (preset.id === "maskWipeUp" || preset.id === "stackReveal") {
			ctx.beginPath();
			ctx.rect(0, 8, width, height - 16);
			ctx.clip();
		}

		ctx.translate(
			centerX + evalResult.offsetX * 0.45,
			centerY + evalResult.offsetY * 0.45,
		);
		ctx.rotate((evalResult.rotate * Math.PI) / 180);
		ctx.scale(evalResult.scaleX, evalResult.scaleY);
		ctx.globalAlpha = Math.max(0, Math.min(1, evalResult.opacity));

		// Text typography
		ctx.font = "bold 23px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		if (isSelected) {
			ctx.fillStyle = "#38bdf8";
			ctx.shadowColor = "rgba(56, 189, 248, 0.6)";
			ctx.shadowBlur = 8;
		} else {
			ctx.fillStyle = "#f8fafc";
			ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
			ctx.shadowBlur = 4;
		}

		const displayText = sampleText.slice(
			0,
			evalResult.visibleTextLength ?? sampleText.length,
		);
		ctx.fillText(displayText || sampleText, 0, 0);

		// Underline sweep effect
		if (preset.id === "underlineSweep") {
			ctx.shadowBlur = 0;
			ctx.fillStyle = "#38bdf8";
			const sweepProgress = Math.min(1, localTime / preset.defaultDuration);
			const lineWidth = 36 * sweepProgress;
			ctx.fillRect(-18, 14, lineWidth, 2.5);
		}

		ctx.restore();
	};

	// Static initial state
	useEffect(() => {
		const restingTime =
			category === "in"
				? preset.defaultDuration
				: category === "out"
					? 0
					: 0.4;
		renderFrame(restingTime, preset.defaultDuration + 0.5);
	}, [preset, category, isSelected]);

	// Hover interactive animation loop
	useEffect(() => {
		if (!isHovered) {
			if (animRef.current) {
				cancelAnimationFrame(animRef.current);
				animRef.current = null;
			}
			const restingTime =
				category === "in"
					? preset.defaultDuration
					: category === "out"
						? 0
						: 0.4;
			renderFrame(restingTime, preset.defaultDuration + 0.5);
			return;
		}

		const startTime = performance.now();
		const animDuration = Math.max(800, preset.defaultDuration * 1000);
		const totalCycle = animDuration + 400; // anim + 0.4s pause

		const animate = () => {
			const elapsed = performance.now() - startTime;
			const loopTime = elapsed % totalCycle;
			const currentTimeSec = Math.min(preset.defaultDuration, loopTime / 1000);
			renderFrame(currentTimeSec, preset.defaultDuration + 0.5);
			animRef.current = requestAnimationFrame(animate);
		};

		animRef.current = requestAnimationFrame(animate);

		return () => {
			if (animRef.current) {
				cancelAnimationFrame(animRef.current);
				animRef.current = null;
			}
		};
	}, [isHovered, preset, category]);

	return (
		<button
			type="button"
			onClick={onSelect}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={cn(
				"group relative flex flex-col rounded-xl border transition-all text-left cursor-pointer overflow-hidden bg-card/70 shadow-xs",
				isSelected
					? "border-primary ring-1 ring-primary/40 bg-primary/5"
					: "border-border/50 hover:border-border/80 hover:bg-muted/30",
			)}
		>
			{/* Preview Canvas Stage */}
			<div className="relative aspect-video w-full bg-black/60 overflow-hidden border-b border-border/30">
				<canvas
					ref={canvasRef}
					width={140}
					height={80}
					className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
				{/* Top right status badge */}
				{isSelected && (
					<div className="absolute top-1.5 right-1.5 flex items-center justify-center size-4 rounded-full bg-primary text-primary-foreground shadow-xs">
						<span className="text-[10px] font-bold">✓</span>
					</div>
				)}
				{/* Hover playing indicator */}
				{isHovered && (
					<div className="absolute bottom-1 right-1.5 px-1 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] text-muted-foreground flex items-center gap-1">
						<span className="size-1.5 rounded-full bg-primary animate-pulse" />
						<span>动效预览</span>
					</div>
				)}
			</div>

			{/* Info footer */}
			<div className="p-2 flex flex-col gap-0.5">
				<div className="flex items-center justify-between gap-1">
					<span
						className={cn(
							"text-xs font-semibold truncate",
							isSelected
								? "text-primary"
								: "text-foreground group-hover:text-primary transition-colors",
						)}
					>
						{preset.name}
					</span>
					<span className="text-xs shrink-0">{preset.icon}</span>
				</div>
				<p className="text-[10px] text-muted-foreground line-clamp-1">
					{preset.description}
				</p>
			</div>
		</button>
	);
}

export function TextAnimationTab({
	element,
	trackId,
}: {
	element: TextElement;
	trackId: string;
}) {
	const editor = useEditor();
	const [activeCategory, setActiveCategory] =
		useState<TextAnimationCategory>("in");

	const currentAnimation: TextAnimationState =
		((element.params as any).textAnimation as TextAnimationState) || {};

	const activeInType = currentAnimation.in?.type || "none";
	const activeInDuration = currentAnimation.in?.duration ?? 0.5;

	const activeOutType = currentAnimation.out?.type || "none";
	const activeOutDuration = currentAnimation.out?.duration ?? 0.5;

	const activeLoopType = currentAnimation.loop?.type || "none";
	const activeLoopSpeed = currentAnimation.loop?.speed ?? 1.0;

	const updateAnimation = (nextAnimation: TextAnimationState) => {
		editor.timeline.updateElements({
			updates: [
				{
					trackId,
					elementId: element.id,
					patch: {
						params: {
							...element.params,
							textAnimation: nextAnimation as any,
						},
					},
				},
			],
		});
	};

	const handleSelectPreset = (presetId: string) => {
		if (activeCategory === "in") {
			if (presetId === "none") {
				const next = { ...currentAnimation };
				delete next.in;
				updateAnimation(next);
				toast.info("已清除入场动画");
				return;
			}
			const preset = TEXT_ANIMATION_IN_PRESETS.find((p) => p.id === presetId);
			updateAnimation({
				...currentAnimation,
				in: {
					type: presetId,
					duration: activeInDuration,
					easing: preset?.easing || "power2.out",
				},
			});
			toast.success(`已应用入场动画「${preset?.name || presetId}」`);
		} else if (activeCategory === "out") {
			if (presetId === "none") {
				const next = { ...currentAnimation };
				delete next.out;
				updateAnimation(next);
				toast.info("已清除出场动画");
				return;
			}
			const preset = TEXT_ANIMATION_OUT_PRESETS.find((p) => p.id === presetId);
			updateAnimation({
				...currentAnimation,
				out: {
					type: presetId,
					duration: activeOutDuration,
					easing: preset?.easing || "power2.in",
				},
			});
			toast.success(`已应用出场动画「${preset?.name || presetId}」`);
		} else if (activeCategory === "loop") {
			if (presetId === "none") {
				const next = { ...currentAnimation };
				delete next.loop;
				updateAnimation(next);
				toast.info("已清除循环动画");
				return;
			}
			const preset = TEXT_ANIMATION_LOOP_PRESETS.find((p) => p.id === presetId);
			updateAnimation({
				...currentAnimation,
				loop: {
					type: presetId,
					duration: 1.0,
					speed: activeLoopSpeed,
				},
			});
			toast.success(`已应用循环动画「${preset?.name || presetId}」`);
		}
	};

	const handlePreviewAnimation = () => {
		editor.playback.seek({ time: element.startTime });
		editor.playback.play();
	};

	const activePresetList: TextAnimationPreset[] = useMemo(() => {
		switch (activeCategory) {
			case "in":
				return TEXT_ANIMATION_IN_PRESETS;
			case "out":
				return TEXT_ANIMATION_OUT_PRESETS;
			case "loop":
				return TEXT_ANIMATION_LOOP_PRESETS;
			default:
				return [];
		}
	}, [activeCategory]);

	const currentSelectedId =
		activeCategory === "in"
			? activeInType
			: activeCategory === "out"
				? activeOutType
				: activeLoopType;

	return (
		<div className="flex flex-col gap-4 p-3 text-xs">
			{/* Top Category Segment Buttons */}
			<div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/40">
				<button
					type="button"
					onClick={() => setActiveCategory("in")}
					className={cn(
						"flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
						activeCategory === "in"
							? "bg-background text-foreground shadow-xs border border-border/60"
							: "text-muted-foreground hover:text-foreground",
					)}
				>
					<HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
					<span>入场动画</span>
					{activeInType !== "none" && (
						<span className="size-1.5 rounded-full bg-primary" />
					)}
				</button>
				<button
					type="button"
					onClick={() => setActiveCategory("out")}
					className={cn(
						"flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
						activeCategory === "out"
							? "bg-background text-foreground shadow-xs border border-border/60"
							: "text-muted-foreground hover:text-foreground",
					)}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
					<span>出场动画</span>
					{activeOutType !== "none" && (
						<span className="size-1.5 rounded-full bg-primary" />
					)}
				</button>
				<button
					type="button"
					onClick={() => setActiveCategory("loop")}
					className={cn(
						"flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
						activeCategory === "loop"
							? "bg-background text-foreground shadow-xs border border-border/60"
							: "text-muted-foreground hover:text-foreground",
					)}
				>
					<HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
					<span>循环动画</span>
					{activeLoopType !== "none" && (
						<span className="size-1.5 rounded-full bg-primary" />
					)}
				</button>
			</div>

			{/* Presets Grid */}
			<div className="grid grid-cols-2 gap-2.5">
				{/* None Card */}
				<button
					type="button"
					onClick={() => handleSelectPreset("none")}
					className={cn(
						"group relative flex flex-col rounded-xl border transition-all text-left cursor-pointer overflow-hidden bg-card/70 shadow-xs",
						currentSelectedId === "none"
							? "border-primary ring-1 ring-primary/40 bg-primary/5 font-semibold"
							: "border-border/50 hover:border-border/80 hover:bg-muted/30 text-muted-foreground",
					)}
				>
					<div className="relative aspect-video w-full bg-black/60 flex items-center justify-center border-b border-border/30">
						<span className="text-2xl group-hover:scale-110 transition-transform">🚫</span>
						{currentSelectedId === "none" && (
							<div className="absolute top-1.5 right-1.5 flex items-center justify-center size-4 rounded-full bg-primary text-primary-foreground shadow-xs">
								<span className="text-[10px] font-bold">✓</span>
							</div>
						)}
					</div>
					<div className="p-2 flex flex-col gap-0.5">
						<span className={cn(
							"text-xs font-semibold truncate",
							currentSelectedId === "none" ? "text-primary" : "text-foreground",
						)}>
							无动画
						</span>
						<p className="text-[10px] text-muted-foreground line-clamp-1">
							保持静态文本显示
						</p>
					</div>
				</button>

				{/* Animation Preset Cards with Live Dynamic Visual Previews */}
				{activePresetList.map((preset) => (
					<TextAnimationCard
						key={preset.id}
						preset={preset}
						category={activeCategory}
						isSelected={currentSelectedId === preset.id}
						onSelect={() => handleSelectPreset(preset.id)}
					/>
				))}
			</div>

			{/* Controls: Duration / Speed Slider */}
			{currentSelectedId !== "none" && (
				<div className="flex flex-col gap-3 p-3 rounded-xl border border-border/40 bg-card/40 mt-1">
					{activeCategory !== "loop" ? (
						<div className="flex flex-col gap-2">
							<div className="flex items-center justify-between">
								<span className="text-xs font-medium text-foreground">
									动画时长
								</span>
								<span className="text-xs font-mono text-primary font-bold">
									{(activeCategory === "in" ? activeInDuration : activeOutDuration).toFixed(2)}s
								</span>
							</div>

							<div className="py-1">
								<Slider
									min={0.1}
									max={3.0}
									step={0.05}
									value={[activeCategory === "in" ? activeInDuration : activeOutDuration]}
									onValueChange={([val]) => {
										if (val !== undefined) {
											if (activeCategory === "in") {
												updateAnimation({
													...currentAnimation,
													in: {
														type: activeInType,
														duration: val,
														easing: currentAnimation.in?.easing,
													},
												});
											} else {
												updateAnimation({
													...currentAnimation,
													out: {
														type: activeOutType,
														duration: val,
														easing: currentAnimation.out?.easing,
													},
												});
											}
										}
									}}
									className="cursor-pointer"
								/>
							</div>

							{/* Duration Presets */}
							<div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
								{IN_OUT_DURATION_PRESETS.map((dur) => {
									const isCurrent =
										Math.abs(
											(activeCategory === "in"
												? activeInDuration
												: activeOutDuration) - dur,
										) < 0.05;
									return (
										<button
											key={dur}
											type="button"
											onClick={() => {
												if (activeCategory === "in") {
													updateAnimation({
														...currentAnimation,
														in: {
															type: activeInType,
															duration: dur,
															easing: currentAnimation.in?.easing,
														},
													});
												} else {
													updateAnimation({
														...currentAnimation,
														out: {
															type: activeOutType,
															duration: dur,
															easing: currentAnimation.out?.easing,
														},
													});
												}
											}}
											className={cn(
												"px-2 py-0.5 rounded text-[10px] font-medium border transition-all shrink-0",
												isCurrent
													? "bg-primary text-primary-foreground border-primary"
													: "bg-muted/40 text-muted-foreground hover:bg-muted border-border/40",
											)}
										>
											{dur}s
										</button>
									);
								})}
							</div>
						</div>
					) : (
						<div className="flex flex-col gap-2">
							<div className="flex items-center justify-between">
								<span className="text-xs font-medium text-foreground">
									循环速率
								</span>
								<span className="text-xs font-mono text-primary font-bold">
									{activeLoopSpeed.toFixed(2)}x
								</span>
							</div>

							<div className="py-1">
								<Slider
									min={0.2}
									max={3.0}
									step={0.05}
									value={[activeLoopSpeed]}
									onValueChange={([val]) => {
										if (val !== undefined) {
											updateAnimation({
												...currentAnimation,
												loop: {
													type: activeLoopType,
													duration: 1.0,
													speed: val,
												},
											});
										}
									}}
									className="cursor-pointer"
								/>
							</div>

							{/* Speed Presets */}
							<div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
								{LOOP_SPEED_PRESETS.map((spd) => {
									const isCurrent = Math.abs(activeLoopSpeed - spd) < 0.05;
									return (
										<button
											key={spd}
											type="button"
											onClick={() => {
												updateAnimation({
													...currentAnimation,
													loop: {
														type: activeLoopType,
														duration: 1.0,
														speed: spd,
													},
												});
											}}
											className={cn(
												"px-2 py-0.5 rounded text-[10px] font-medium border transition-all shrink-0",
												isCurrent
													? "bg-primary text-primary-foreground border-primary"
													: "bg-muted/40 text-muted-foreground hover:bg-muted border-border/40",
											)}
										>
											{spd}x
										</button>
									);
								})}
							</div>
						</div>
					)}

					{/* Instant Preview Play Button */}
					<Button
						variant="outline"
						size="sm"
						onClick={handlePreviewAnimation}
						className="w-full gap-1.5 text-xs mt-1"
					>
						<HugeiconsIcon icon={PlayIcon} className="size-3.5 fill-current" />
						<span>即时试听/预览动画效果</span>
					</Button>
				</div>
			)}
		</div>
	);
}
