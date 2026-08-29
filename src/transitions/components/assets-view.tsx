"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useEditor } from "@/editor/use-editor";
import { transitionsRegistry } from "../registry";
import type { TransitionCategory, TransitionDefinition } from "../types";
import { useTransitionsStore } from "../transitions-store";
import { glTransitionPipeline } from "../gl/gl-transition-renderer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";
import { cn } from "@/utils/ui";
import { toast } from "sonner";
import { mediaTimeFromSeconds } from "@/wasm";
import {
	Search01Icon,
	SparklesIcon,
	ArrowRightDoubleIcon,
	PuzzleIcon,
	FlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const BASE_CATEGORIES: { id: TransitionCategory | string; label: string }[] = [
	{ id: "all", label: "全部" },
	{ id: "basic", label: "基础叠化" },
	{ id: "motion", label: "运镜推拉" },
	{ id: "shapes", label: "形状划像" },
	{ id: "creative", label: "创意光效" },
	{ id: "3d", label: "3D立体" },
	{ id: "blur", label: "模糊转场" },
];

export function TransitionsView() {
	const editor = useEditor();
	const { activeCategory, setActiveCategory, searchQuery, setSearchQuery } =
		useTransitionsStore();

	const [sourceFilter, setSourceFilter] = useState<"all" | "builtin" | "plugin">("all");

	const [allTransitions, setAllTransitions] = useState<TransitionDefinition[]>(
		() => transitionsRegistry.getAll(),
	);

	useEffect(() => {
		setAllTransitions(transitionsRegistry.getAll());
		return transitionsRegistry.subscribe(() => {
			setAllTransitions(transitionsRegistry.getAll());
		});
	}, []);

	const builtinCount = useMemo(
		() => allTransitions.filter((t) => !t.isPlugin && t.sourceType !== "plugin").length,
		[allTransitions],
	);

	const pluginCount = useMemo(
		() => allTransitions.filter((t) => t.isPlugin || t.sourceType === "plugin").length,
		[allTransitions],
	);

	const categories = useMemo(() => {
		const knownIds = new Set(BASE_CATEGORIES.map((c) => c.id));
		const extra: { id: string; label: string }[] = [];
		allTransitions.forEach((t) => {
			if (t.category && !knownIds.has(t.category)) {
				knownIds.add(t.category);
				extra.push({
					id: t.category,
					label: t.category.toUpperCase(),
				});
			}
		});
		return [...BASE_CATEGORIES, ...extra];
	}, [allTransitions]);

	const filteredTransitions = useMemo(() => {
		return allTransitions.filter((def) => {
			const isPlugin = Boolean(def.isPlugin || def.sourceType === "plugin");
			if (sourceFilter === "builtin" && isPlugin) return false;
			if (sourceFilter === "plugin" && !isPlugin) return false;

			if (activeCategory !== "all" && def.category !== activeCategory) {
				return false;
			}
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase().trim();
				const matchName = def.name.toLowerCase().includes(q);
				const matchId = def.id.toLowerCase().includes(q);
				const matchPlugin = def.pluginName?.toLowerCase().includes(q);
				const matchKw = def.keywords?.some((k) => k.toLowerCase().includes(q));
				return matchName || matchId || matchKw || matchPlugin;
			}
			return true;
		});
	}, [allTransitions, sourceFilter, activeCategory, searchQuery]);

	const handleAddTransition = (transition: TransitionDefinition) => {
		const scene = editor.scenes.getActiveScene();
		if (!scene) {
			toast.error("当前未打开任何场景");
			return;
		}

		// Find the main video track (or first video track)
		const videoTrack =
			scene.tracks.main.type === "video" &&
			scene.tracks.main.elements.length >= 2
				? scene.tracks.main
				: (scene.tracks.overlay.find(
						(t) => t.type === "video" && t.elements.length >= 2,
					) as typeof scene.tracks.main | undefined);

		if (!videoTrack || videoTrack.elements.length < 2) {
			toast.info("请先在时间轴放置至少两个相邻的视频或图片素材");
			return;
		}

		const playheadTime = editor.playback.getCurrentTime();
		const sortedElements = videoTrack.elements
			.slice()
			.sort((a, b) => a.startTime - b.startTime);

		// Find the cut point closest to current playhead
		let bestPair: { fromId: string; toId: string } | null = null;
		let minDiff = Infinity;

		for (let i = 0; i < sortedElements.length - 1; i++) {
			const current = sortedElements[i];
			const next = sortedElements[i + 1];
			const cutTime = current.startTime + current.duration;
			const diff = Math.abs(playheadTime - cutTime);

			if (diff < minDiff) {
				minDiff = diff;
				bestPair = { fromId: current.id, toId: next.id };
			}
		}

		if (!bestPair) {
			bestPair = {
				fromId: sortedElements[0].id,
				toId: sortedElements[1].id,
			};
		}

		editor.timeline.addTransition({
			trackId: videoTrack.id,
			fromElementId: bestPair.fromId,
			toElementId: bestPair.toId,
			type: transition.id,
			duration: mediaTimeFromSeconds({ seconds: 1.0 }),
		});

		toast.success(`已添加转场 “${transition.name}”`);
	};

	return (
		<div className="flex flex-col h-full bg-background select-none">
			{/* Top Header & Search */}
			<div className="p-3 border-b border-border/40 flex flex-col gap-2.5">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-1.5 text-foreground font-semibold text-sm">
						<HugeiconsIcon
							icon={ArrowRightDoubleIcon}
							className="size-4 text-primary"
						/>
						<span>转场库</span>
						<div className="flex items-center gap-1 ml-1">
							<span className="text-[10px] text-muted-foreground font-medium bg-accent/60 px-1.5 py-0.5 rounded-full" title={`内置转场: ${builtinCount} 款`}>
								内置 {builtinCount}
							</span>
							{pluginCount > 0 && (
								<span className="text-[10px] text-purple-400 font-semibold bg-purple-500/15 border border-purple-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-0.5" title={`插件转场: ${pluginCount} 款`}>
									<HugeiconsIcon icon={FlashIcon} className="size-2.5" />
									插件 {pluginCount}
								</span>
							)}
						</div>
					</div>
					<Button
						variant="outline"
						size="sm"
						className="h-7 text-xs gap-1 border-border/50 text-muted-foreground hover:text-foreground"
						onClick={() => {
							editor.timeline.applyTransitionToAll({
								type: "crossfade",
								duration: mediaTimeFromSeconds({ seconds: 1.0 }),
							});
							toast.success("已将叠化转场应用到所有切点");
						}}
					>
						<HugeiconsIcon icon={SparklesIcon} className="size-3 text-primary" />
						一键应用全部
					</Button>
				</div>

				<div className="relative">
					<HugeiconsIcon
						icon={Search01Icon}
						className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
					/>
					<Input
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="搜索转场效果、插件名称或关键词..."
						className="h-8 pl-8 text-xs bg-accent/20 border-border/40"
					/>
				</div>

				{/* Source Distinction Segmented Tabs */}
				<div className="grid grid-cols-3 gap-1 p-0.5 bg-muted/40 rounded-lg border border-border/30 text-xs">
					<button
						type="button"
						onClick={() => setSourceFilter("all")}
						className={cn(
							"py-1 rounded-md text-center transition-all font-medium flex items-center justify-center gap-1",
							sourceFilter === "all"
								? "bg-background text-foreground shadow-xs font-semibold"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						<span>全部</span>
						<span className="text-[10px] opacity-70 font-mono">({allTransitions.length})</span>
					</button>
					<button
						type="button"
						onClick={() => setSourceFilter("builtin")}
						className={cn(
							"py-1 rounded-md text-center transition-all font-medium flex items-center justify-center gap-1",
							sourceFilter === "builtin"
								? "bg-background text-foreground shadow-xs font-semibold"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						<span>官方内置</span>
						<span className="text-[10px] opacity-70 font-mono">({builtinCount})</span>
					</button>
					<button
						type="button"
						onClick={() => setSourceFilter("plugin")}
						className={cn(
							"py-1 rounded-md text-center transition-all font-medium flex items-center justify-center gap-1",
							sourceFilter === "plugin"
								? "bg-background text-purple-400 shadow-xs font-semibold"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						<HugeiconsIcon icon={FlashIcon} className="size-3 text-purple-400" />
						<span>插件扩展</span>
						<span className="text-[10px] opacity-70 font-mono text-purple-400">({pluginCount})</span>
					</button>
				</div>

				{/* Category Tabs */}
				<div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hidden pb-0.5">
					{categories.map((cat) => (
						<button
							key={cat.id}
							type="button"
							onClick={() => setActiveCategory(cat.id as any)}
							className={cn(
								"shrink-0 px-2.5 py-1 rounded-full text-xs transition-all font-medium",
								activeCategory === cat.id
									? "bg-primary text-primary-foreground shadow-xs"
									: "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground",
							)}
						>
							{cat.label}
						</button>
					))}
				</div>
			</div>

			{/* Transition Cards Grid */}
			<div className="flex-1 overflow-y-auto p-3">
				{filteredTransitions.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground text-xs gap-2">
						<HugeiconsIcon icon={ArrowRightDoubleIcon} className="size-8 text-muted-foreground/40" />
						<span>未找到匹配的转场效果</span>
						{sourceFilter !== "all" && (
							<Button
								variant="ghost"
								size="sm"
								className="text-xs text-primary hover:underline h-7"
								onClick={() => setSourceFilter("all")}
							>
								清除来源筛选
							</Button>
						)}
					</div>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
						{filteredTransitions.map((transition) => (
							<TransitionCard
								key={transition.id}
								transition={transition}
								onAdd={() => handleAddTransition(transition)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function TransitionCard({
	transition,
	onAdd,
}: {
	transition: TransitionDefinition;
	onAdd: () => void;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isHovered, setIsHovered] = useState(false);
	const animRef = useRef<number | null>(null);

	const isPlugin = Boolean(transition.isPlugin || transition.sourceType === "plugin");

	// Offscreen sample textures for preview
	const texturesRef = useRef<{
		from: OffscreenCanvas;
		to: OffscreenCanvas;
	} | null>(null);

	useEffect(() => {
		const size = 160;
		const fromCanvas = new OffscreenCanvas(size, size);
		const toCanvas = new OffscreenCanvas(size, size);

		const ctxA = fromCanvas.getContext("2d");
		if (ctxA) {
			const gradA = ctxA.createLinearGradient(0, 0, size, size);
			gradA.addColorStop(0, "#2563eb");
			gradA.addColorStop(1, "#38bdf8");
			ctxA.fillStyle = gradA;
			ctxA.fillRect(0, 0, size, size);
			ctxA.fillStyle = "rgba(255, 255, 255, 0.9)";
			ctxA.font = "bold 24px sans-serif";
			ctxA.textAlign = "center";
			ctxA.textBaseline = "middle";
			ctxA.fillText("A", size / 2, size / 2);
		}

		const ctxB = toCanvas.getContext("2d");
		if (ctxB) {
			const gradB = ctxB.createLinearGradient(0, 0, size, size);
			gradB.addColorStop(0, "#ec4899");
			gradB.addColorStop(1, "#f97316");
			ctxB.fillStyle = gradB;
			ctxB.fillRect(0, 0, size, size);
			ctxB.fillStyle = "rgba(255, 255, 255, 0.9)";
			ctxB.font = "bold 24px sans-serif";
			ctxB.textAlign = "center";
			ctxB.textBaseline = "middle";
			ctxB.fillText("B", size / 2, size / 2);
		}

		texturesRef.current = { from: fromCanvas, to: toCanvas };
	}, []);

	// Render preview frame
	const renderPreview = (progress: number) => {
		const canvas = canvasRef.current;
		const textures = texturesRef.current;
		if (!canvas || !textures) return;

		const resultCanvas = glTransitionPipeline.render({
			fromSource: textures.from,
			toSource: textures.to,
			progress,
			glsl: transition.glsl,
			width: canvas.width || 120,
			height: canvas.height || 80,
			uniforms: transition.defaultParams as any,
		});

		if (resultCanvas) {
			const ctx = canvas.getContext("2d");
			if (ctx) {
				ctx.drawImage(resultCanvas, 0, 0, canvas.width, canvas.height);
			}
		}
	};

	// Static initial render
	useEffect(() => {
		renderPreview(0.5);
	}, [transition]);

	// Interactive animated preview on hover
	useEffect(() => {
		if (!isHovered) {
			if (animRef.current) {
				cancelAnimationFrame(animRef.current);
				animRef.current = null;
			}
			renderPreview(0.5);
			return;
		}

		const startTime = performance.now();
		const loopDuration = 1600; // 1.6s full cycle

		const animate = () => {
			const elapsed = performance.now() - startTime;
			const cycle = (elapsed % loopDuration) / loopDuration;
			// Ping-pong or continuous progress:
			const progress = cycle < 0.8 ? cycle / 0.8 : 1.0;
			renderPreview(progress);
			animRef.current = requestAnimationFrame(animate);
		};

		animRef.current = requestAnimationFrame(animate);

		return () => {
			if (animRef.current) {
				cancelAnimationFrame(animRef.current);
				animRef.current = null;
			}
		};
	}, [isHovered]);

	const preview = (
		<div
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className="relative aspect-video w-full bg-black/40 overflow-hidden group/thumb"
		>
			<canvas
				ref={canvasRef}
				width={120}
				height={68}
				className="size-full object-cover transition-transform duration-200 group-hover/thumb:scale-105"
			/>
			{/* Distinct Badge for Plugin vs Built-in */}
			{isPlugin ? (
				<div
					className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-600/90 backdrop-blur-md text-white text-[9px] font-semibold shadow-xs border border-purple-400/40 pointer-events-none"
					title={transition.pluginName ? `来自插件: ${transition.pluginName}` : "插件转场预设"}
				>
					<HugeiconsIcon icon={FlashIcon} className="size-2.5" />
					<span>插件</span>
				</div>
			) : (
				<div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-zinc-300 text-[9px] font-medium border border-white/10 opacity-0 group-hover/thumb:opacity-100 transition-opacity pointer-events-none">
					<span>内置</span>
				</div>
			)}
		</div>
	);

	return (
		<DraggableItem
			name={transition.name}
			preview={preview}
			dragData={{
				id: transition.id,
				name: transition.name,
				type: "transition",
				transitionType: transition.id,
			}}
			onAddToTimeline={onAdd}
			aspectRatio={16 / 9}
			isRounded
			variant="card"
			containerClassName="w-full"
		/>
	);
}
