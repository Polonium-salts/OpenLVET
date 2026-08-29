"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { VisualElement } from "@/timeline";
import type { Effect } from "@/effects/types";
import type { ParamValues } from "@/params";
import { useEditor } from "@/editor/use-editor";
import { useElementPreview } from "@/timeline/hooks/use-element-preview";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	RotateLeft01Icon,
	ColorPickerIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/utils/ui";
import { generateUUID } from "@/utils/id";
import {
	ToggleClipEffectCommand,
	RemoveClipEffectCommand,
	UpdateClipEffectParamsCommand,
} from "@/commands/timeline/element/effects";
import { UpdateElementsCommand } from "@/commands/timeline/element";

export function CutoutTab({
	element,
	trackId,
}: {
	element: VisualElement;
	trackId: string;
}) {
	const editor = useEditor();
	const colorInputRef = useRef<HTMLInputElement>(null);
	const [isPickingColor, setIsPickingColor] = useState(false);
	const [isPro, setIsPro] = useState(false);

	const { renderElement, previewUpdates } = useElementPreview({
		trackId,
		elementId: element.id,
		fallback: element,
	});

	const effects: Effect[] =
		(renderElement as VisualElement).effects ?? element.effects ?? [];

	const chromaEffect = useMemo(
		() => effects.find((e) => e.type === "chroma-key"),
		[effects],
	);

	const isChromaEnabled = Boolean(chromaEffect && chromaEffect.enabled !== false);

	// Local state for smooth, real-time dragging & 100% responsive percentage display
	const [localParams, setLocalParams] = useState({
		keyColor: String(chromaEffect?.params?.keyColor ?? "#00FF00"),
		similarity: Number(chromaEffect?.params?.similarity ?? 0.1),
		smoothness: Number(chromaEffect?.params?.smoothness ?? 0.03),
		spill: Number(chromaEffect?.params?.spill ?? 0.2),
		invert: Boolean(chromaEffect?.params?.invert ?? false),
	});

	// Sync local state when chromaEffect params change externally
	useEffect(() => {
		if (chromaEffect?.params) {
			setLocalParams({
				keyColor: String(chromaEffect.params.keyColor ?? "#00FF00"),
				similarity: Number(chromaEffect.params.similarity ?? 0.1),
				smoothness: Number(chromaEffect.params.smoothness ?? 0.03),
				spill: Number(chromaEffect.params.spill ?? 0.2),
				invert: Boolean(chromaEffect.params.invert ?? false),
			});
		}
	}, [
		chromaEffect?.id,
		chromaEffect?.params?.keyColor,
		chromaEffect?.params?.similarity,
		chromaEffect?.params?.smoothness,
		chromaEffect?.params?.spill,
		chromaEffect?.params?.invert,
	]);

	// Toggle Chroma Key
	const handleToggleChroma = (enabled: boolean) => {
		if (enabled) {
			if (!chromaEffect) {
				const newParams = {
					keyColor: "#00FF00",
					similarity: 0.1,
					smoothness: 0.03,
					spill: 0.2,
					invert: false,
				};
				setLocalParams(newParams);
				const newEffect: Effect = {
					id: generateUUID(),
					type: "chroma-key",
					params: newParams,
					enabled: true,
				};
				const otherEffects = effects.filter(
					(e) => e.type !== "chroma-key" && e.type !== "luma-key",
				);
				previewUpdates({ effects: [...otherEffects, newEffect] });
				editor.command.execute({
					command: new UpdateElementsCommand({
						updates: [
							{
								trackId,
								elementId: element.id,
								patch: {
									effects: [...otherEffects, newEffect],
								},
							},
						],
					}),
				});
			} else {
				editor.command.execute({
					command: new ToggleClipEffectCommand({
						trackId,
						elementId: element.id,
						effectId: chromaEffect.id,
					}),
				});
			}
		} else if (chromaEffect) {
			const otherEffects = effects.filter((e) => e.id !== chromaEffect.id);
			previewUpdates({ effects: otherEffects });
			editor.command.execute({
				command: new RemoveClipEffectCommand({
					trackId,
					elementId: element.id,
					effectId: chromaEffect.id,
				}),
			});
		}
	};

	// Real-time preview update during dragging
	const handlePreviewParam = (key: string, value: unknown) => {
		setLocalParams((prev) => {
			const updated = { ...prev, [key]: value };
			if (chromaEffect) {
				const nextEffects = effects.map((e) =>
					e.id === chromaEffect.id ? { ...e, params: updated } : e,
				);
				previewUpdates({ effects: nextEffects });
			}
			return updated;
		});
	};

	// Real-time preview update for simple mode
	const handleSimplePreview = (val: number) => {
		const s = val / 100;
		const updated = {
			...localParams,
			similarity: parseFloat(s.toFixed(2)),
			smoothness: parseFloat((0.02 + s * 0.06).toFixed(2)),
			spill: parseFloat((s * 0.4).toFixed(2)),
		};
		setLocalParams(updated);
		if (chromaEffect) {
			const nextEffects = effects.map((e) =>
				e.id === chromaEffect.id ? { ...e, params: updated } : e,
			);
			previewUpdates({ effects: nextEffects });
		}
	};

	// Commit changes to history/undo stack
	const handleCommitParams = (paramsToCommit?: Partial<ParamValues>) => {
		if (!chromaEffect) return;
		const params = paramsToCommit ?? localParams;
		editor.command.execute({
			command: new UpdateClipEffectParamsCommand({
				trackId,
				elementId: element.id,
				effectId: chromaEffect.id,
				params,
			}),
		});
	};

	// Color change helper
	const handleColorChange = (hex: string) => {
		const cleanHex = hex.toUpperCase();
		handlePreviewParam("keyColor", cleanHex);
		handleCommitParams({ keyColor: cleanHex });
	};

	// EyeDropper
	const handleEyeDropper = async () => {
		if (typeof window !== "undefined" && "EyeDropper" in window && (window as any).EyeDropper) {
			try {
				setIsPickingColor(true);
				const dropper = new (window as any).EyeDropper();
				const result = await dropper.open();
				if (result?.sRGBHex) {
					handleColorChange(result.sRGBHex);
				}
			} catch {
				// User cancelled
			} finally {
				setIsPickingColor(false);
			}
		} else {
			colorInputRef.current?.click();
		}
	};

	// Reset
	const handleResetChroma = () => {
		if (!chromaEffect) return;
		const defaultParams = {
			keyColor: "#00FF00",
			similarity: 0.1,
			smoothness: 0.03,
			spill: 0.2,
			invert: false,
		};
		setLocalParams(defaultParams);
		const nextEffects = effects.map((e) =>
			e.id === chromaEffect.id ? { ...e, params: defaultParams } : e,
		);
		previewUpdates({ effects: nextEffects });
		handleCommitParams(defaultParams);
	};

	return (
		<div className="flex flex-col h-full overflow-y-auto p-3 space-y-4 select-none font-sans">
			{/* Main Toggle Card */}
			<div
				className={cn(
					"p-3 rounded-xl border transition-all space-y-3",
					isChromaEnabled
						? "bg-card border-primary/40 shadow-xs"
						: "bg-muted/15 border-border/40",
				)}
			>
				{/* Header row: label + mode switcher + enable switch */}
				<div className="flex items-center justify-between gap-2">
					<div className="flex-1 min-w-0">
						<h3 className="text-xs font-bold text-foreground">色度抠图</h3>
						<p className="text-[10px] text-muted-foreground mt-0.5">
							使用吸管工具吸取背景色进行智能抠像
						</p>
					</div>

					{/* Mode Toggle Pill */}
					<div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/60 border border-border/40 shrink-0">
						<button
							type="button"
							onClick={() => setIsPro(false)}
							className={cn(
								"px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer",
								!isPro
									? "bg-background text-foreground shadow-xs"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							简易
						</button>
						<button
							type="button"
							onClick={() => setIsPro(true)}
							className={cn(
								"px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer",
								isPro
									? "bg-background text-foreground shadow-xs"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							专业
						</button>
					</div>

					<Switch
						checked={isChromaEnabled}
						onCheckedChange={handleToggleChroma}
					/>
				</div>

				{/* Parameters Section (only when enabled) */}
				{isChromaEnabled && (
					<div className="space-y-3.5 pt-3 border-t border-border/40 animate-in fade-in-50 duration-150">
						{/* ── EyeDropper + Color Picker (shared by both modes) ── */}
						<div className="space-y-2 p-2.5 rounded-lg bg-muted/30 border border-border/50">
							<div className="flex items-center justify-between">
								<Label className="text-[11px] text-muted-foreground font-medium">
									当前取色值
								</Label>
								<span className="font-mono text-[10px] uppercase text-foreground font-bold">
									{localParams.keyColor}
								</span>
							</div>

							<div className="flex items-center gap-2">
								{/* Color swatch */}
								<div className="relative size-8 shrink-0 rounded-lg border border-border/80 overflow-hidden cursor-pointer shadow-xs">
									<input
										ref={colorInputRef}
										type="color"
										value={localParams.keyColor}
										onChange={(e) => handleColorChange(e.target.value)}
										className="absolute inset-0 size-full opacity-0 cursor-pointer"
										title="手动微调颜色"
									/>
									<div
										className="size-full border border-black/20"
										style={{ backgroundColor: localParams.keyColor }}
									/>
								</div>

								{/* EyeDropper button */}
								<Button
									type="button"
									variant="default"
									size="sm"
									onClick={handleEyeDropper}
									disabled={isPickingColor}
									className="flex-1 h-8 text-xs font-semibold gap-1.5 shadow-sm cursor-pointer"
								>
									<HugeiconsIcon icon={ColorPickerIcon} className="size-4" />
									{isPickingColor ? "正在吸取颜色..." : "吸管取色工具"}
								</Button>
							</div>
						</div>

						{/* ── SIMPLE MODE: single strength slider ── */}
						{!isPro && (
							<div className="space-y-1.5 animate-in fade-in-50 duration-150">
								<div className="flex items-center justify-between text-[11px]">
									<span className="text-muted-foreground font-medium">抠图效果强度</span>
									<span className="font-mono text-[10px] font-semibold text-foreground">
										{Math.round(localParams.similarity * 100)}%
									</span>
								</div>
								<Slider
									value={[Math.round(localParams.similarity * 100)]}
									min={0}
									max={100}
									step={1}
									onValueChange={([val]) => handleSimplePreview(val)}
									onValueCommit={([val]) => {
										const s = val / 100;
										handleCommitParams({
											similarity: parseFloat(s.toFixed(2)),
											smoothness: parseFloat((0.02 + s * 0.06).toFixed(2)),
											spill: parseFloat((s * 0.4).toFixed(2)),
										});
									}}
								/>
								<p className="text-[10px] text-muted-foreground mt-0.5">
									拖动滑块调节整体抠图强度（0% 为无抠图，100% 为最强抠图）；如需精细调参请切换至「专业」模式。
								</p>
							</div>
						)}

						{/* ── PRO MODE: full parameter sliders ── */}
						{isPro && (
							<div className="space-y-3 animate-in fade-in-50 duration-150">
								<div className="flex items-center justify-between">
									<span className="text-[11px] font-semibold text-foreground">精细参数调节</span>
									<Button
										size="sm"
										variant="ghost"
										className="h-6 text-[10px] px-1.5 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
										onClick={handleResetChroma}
									>
										<HugeiconsIcon icon={RotateLeft01Icon} className="size-3" />
										重置默认
									</Button>
								</div>

								{/* Similarity */}
								<div className="space-y-1.5">
									<div className="flex items-center justify-between text-[11px]">
										<span className="text-muted-foreground">相似度 / 容差范围</span>
										<span className="font-mono text-[10px] font-semibold text-foreground">
											{Math.round(localParams.similarity * 100)}%
										</span>
									</div>
									<Slider
										value={[Math.round(localParams.similarity * 100)]}
										min={0}
										max={100}
										step={1}
										onValueChange={([val]) => handlePreviewParam("similarity", val / 100)}
										onValueCommit={([val]) => handleCommitParams({ similarity: val / 100 })}
									/>
								</div>

								{/* Smoothness */}
								<div className="space-y-1.5">
									<div className="flex items-center justify-between text-[11px]">
										<span className="text-muted-foreground">边缘平滑 / 羽化</span>
										<span className="font-mono text-[10px] font-semibold text-foreground">
											{Math.round(localParams.smoothness * 200)}%
										</span>
									</div>
									<Slider
										value={[Math.round(localParams.smoothness * 200)]}
										min={0}
										max={100}
										step={1}
										onValueChange={([val]) => handlePreviewParam("smoothness", val / 200)}
										onValueCommit={([val]) => handleCommitParams({ smoothness: val / 200 })}
									/>
								</div>

								{/* Spill */}
								<div className="space-y-1.5">
									<div className="flex items-center justify-between text-[11px]">
										<span className="text-muted-foreground">溢色消除 (去边缘绿光/杂色)</span>
										<span className="font-mono text-[10px] font-semibold text-foreground">
											{Math.round(localParams.spill * 100)}%
										</span>
									</div>
									<Slider
										value={[Math.round(localParams.spill * 100)]}
										min={0}
										max={100}
										step={1}
										onValueChange={([val]) => handlePreviewParam("spill", val / 100)}
										onValueCommit={([val]) => handleCommitParams({ spill: val / 100 })}
									/>
								</div>

								{/* Invert */}
								<div className="flex items-center justify-between pt-1 border-t border-border/30">
									<div>
										<span className="text-[11px] font-medium text-foreground block">反转抠图区域</span>
										<span className="text-[10px] text-muted-foreground">仅保留选中的背景颜色</span>
									</div>
									<Switch
										checked={localParams.invert}
										onCheckedChange={(checked) => {
											handlePreviewParam("invert", checked);
											handleCommitParams({ invert: checked });
										}}
									/>
								</div>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Tip */}
			<div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
				<p className="text-[11px] leading-relaxed text-muted-foreground">
					<strong>使用提示</strong>：点击「吸管取色工具」后在预览画面中点击绿幕/背景色，即可精准取色抠像。调整不满意时可点击「重置默认」。
				</p>
			</div>
		</div>
	);
}
