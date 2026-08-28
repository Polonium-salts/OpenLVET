"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useEditor } from "@/editor/use-editor";
import { TRANSITION_DEFINITIONS } from "../definitions";
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
	PlusSignIcon,
	SparklesIcon,
	ArrowRightDoubleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const CATEGORIES: { id: TransitionCategory | "all"; label: string }[] = [
	{ id: "all", label: "全部" },
	{ id: "basic", label: "基础叠化" },
	{ id: "motion", label: "运镜推拉" },
	{ id: "shapes", label: "形状划像" },
	{ id: "creative", label: "创意光效" },
	{ id: "3d", label: "3D立体" },
];

export function TransitionsView() {
	const editor = useEditor();
	const { activeCategory, setActiveCategory, searchQuery, setSearchQuery } =
		useTransitionsStore();

	const filteredTransitions = useMemo(() => {
		return TRANSITION_DEFINITIONS.filter((def) => {
			if (activeCategory !== "all" && def.category !== activeCategory) {
				return false;
			}
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase().trim();
				const matchName = def.name.toLowerCase().includes(q);
				const matchId = def.id.toLowerCase().includes(q);
				const matchKw = def.keywords.some((k) => k.toLowerCase().includes(q));
				return matchName || matchId || matchKw;
			}
			return true;
		});
	}, [activeCategory, searchQuery]);

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
						<span className="text-[11px] text-muted-foreground font-normal bg-accent/60 px-1.5 py-0.5 rounded-full ml-1">
							{TRANSITION_DEFINITIONS.length}
						</span>
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
						placeholder="搜索转场效果（如叠化、推入、光晕）..."
						className="h-8 pl-8 text-xs bg-accent/20 border-border/40"
					/>
				</div>

				{/* Category Tabs */}
				<div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hidden pb-0.5">
					{CATEGORIES.map((cat) => (
						<button
							key={cat.id}
							type="button"
							onClick={() => setActiveCategory(cat.id)}
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
			className="relative aspect-video w-full bg-black/40 overflow-hidden"
		>
			<canvas
				ref={canvasRef}
				width={120}
				height={68}
				className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
			/>
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
