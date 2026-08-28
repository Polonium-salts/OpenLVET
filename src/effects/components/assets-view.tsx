"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { toast } from "sonner";
import { PanelView } from "@/components/editor/panels/assets/views/base-panel";
import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";
import {
	effectsRegistry,
	EFFECT_TARGET_ELEMENT_TYPES,
	buildDefaultEffectInstance,
} from "@/effects";
import { effectPreviewService } from "@/services/renderer/effect-preview";
import { useEditor } from "@/editor/use-editor";
import { buildEffectElement } from "@/timeline/element-utils";
import { findTrackInSceneTracks } from "@/timeline/track-element-update";
import type { EffectDefinition, EffectCategory } from "@/effects/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/ui";
import {
	Search01Icon,
	SparklesIcon,
	ColorPickerIcon,
	MagicWand05Icon,
	FlashIcon,
	Video01Icon,
	EyeIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const CATEGORIES: { id: EffectCategory; label: string; icon: any }[] = [
	{ id: "all", label: "全部", icon: SparklesIcon },
	{ id: "color", label: "色彩调色", icon: ColorPickerIcon },
	{ id: "lighting", label: "光影氛围", icon: EyeIcon },
	{ id: "distortion", label: "扭曲形变", icon: MagicWand05Icon },
	{ id: "retro", label: "复古艺术", icon: Video01Icon },
	{ id: "glitch", label: "动态故障", icon: FlashIcon },
];

export function EffectsView() {
	const [activeCategory, setActiveCategory] = useState<EffectCategory>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [allEffects, setAllEffects] = useState<EffectDefinition[]>(() =>
		effectsRegistry.getAll(),
	);

	useEffect(() => {
		setAllEffects(effectsRegistry.getAll());
		return effectsRegistry.subscribe(() => {
			setAllEffects(effectsRegistry.getAll());
		});
	}, []);

	const filteredEffects = useMemo(() => {
		return allEffects.filter((effect) => {
			if (activeCategory !== "all" && effect.category !== activeCategory) {
				return false;
			}
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase().trim();
				const matchName = effect.name.toLowerCase().includes(q);
				const matchType = effect.type.toLowerCase().includes(q);
				const matchKw = effect.keywords?.some((k) =>
					k.toLowerCase().includes(q),
				);
				return matchName || matchType || matchKw;
			}
			return true;
		});
	}, [allEffects, activeCategory, searchQuery]);

	return (
		<PanelView title="特效">
			<div className="flex flex-col gap-3">
				{/* Search Bar */}
				<div className="relative">
					<HugeiconsIcon
						icon={Search01Icon}
						className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
					/>
					<Input
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="搜索特效名称、风格关键字..."
						className="pl-8 h-8 text-xs bg-muted/30 rounded-lg border-border/50 focus-visible:ring-1"
					/>
				</div>

				{/* Category Pills */}
				<div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
					{CATEGORIES.map((cat) => {
						const isSelected = activeCategory === cat.id;
						return (
							<button
								key={cat.id}
								type="button"
								onClick={() => setActiveCategory(cat.id)}
								className={cn(
									"flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all shrink-0 cursor-pointer",
									isSelected
										? "bg-primary text-primary-foreground border-primary shadow-xs"
										: "bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted border-border/40",
								)}
							>
								<HugeiconsIcon icon={cat.icon} className="size-3.5" />
								<span>{cat.label}</span>
							</button>
						);
					})}
				</div>

				{/* Effects Grid */}
				<EffectsGrid effects={filteredEffects} />
			</div>
		</PanelView>
	);
}

function EffectsGrid({ effects }: { effects: EffectDefinition[] }) {
	if (effects.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-8 text-muted-foreground gap-2">
				<HugeiconsIcon icon={MagicWand05Icon} className="size-8 opacity-40" />
				<span className="text-xs">未找到匹配的特效</span>
			</div>
		);
	}

	return (
		<div
			className="grid gap-2"
			style={{ gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))" }}
		>
			{effects.map((effect) => (
				<EffectItem key={effect.type} effect={effect} />
			))}
		</div>
	);
}

function EffectPreviewCanvas({ effectType }: { effectType: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const render = () => {
			if (canvasRef.current) {
				effectPreviewService.renderPreview({
					effectType,
					params: {},
					targetCanvas: canvasRef.current,
				});
			}
		};

		render();
		return effectPreviewService.onPreviewImageReady({ callback: render });
	}, [effectType]);

	return <canvas ref={canvasRef} className="size-full object-cover" />;
}

function EffectItem({ effect }: { effect: EffectDefinition }) {
	const editor = useEditor();

	const handleAddToTimeline = useCallback(() => {
		const selectedRefs = editor.selection.getSelectedElements();
		let selectedVisualRef: { trackId: string; elementId: string } | null = null;

		if (selectedRefs && selectedRefs.length > 0) {
			const tracks = editor.scenes.getActiveScene().tracks;
			for (const ref of selectedRefs) {
				const track = findTrackInSceneTracks({ tracks, trackId: ref.trackId });
				const element = track?.elements.find((el) => el.id === ref.elementId);
				if (
					element &&
					(EFFECT_TARGET_ELEMENT_TYPES as readonly string[]).includes(
						element.type,
					)
				) {
					selectedVisualRef = ref;
					break;
				}
			}
		}

		if (selectedVisualRef) {
			editor.timeline.addClipEffect({
				trackId: selectedVisualRef.trackId,
				elementId: selectedVisualRef.elementId,
				effectType: effect.type,
			});
			toast.success(`已为选中片段添加「${effect.name}」特效`);
			return;
		}

		const currentTime = editor.playback.getCurrentTime();
		const element = buildEffectElement({
			effectType: effect.type,
			startTime: currentTime,
		});

		editor.timeline.insertElement({
			placement: { mode: "auto", trackType: "effect" },
			element,
		});
		toast.success(`已添加「${effect.name}」到特效轨道`);
	}, [editor, effect]);

	const preview = <EffectPreviewCanvas effectType={effect.type} />;

	return (
		<DraggableItem
			name={effect.name}
			preview={preview}
			dragData={{
				id: effect.type,
				name: effect.name,
				type: "effect",
				effectType: effect.type,
				targetElementTypes: EFFECT_TARGET_ELEMENT_TYPES,
			}}
			onAddToTimeline={handleAddToTimeline}
			aspectRatio={1}
			isRounded
			variant="card"
			containerClassName="w-full group"
		/>
	);
}

