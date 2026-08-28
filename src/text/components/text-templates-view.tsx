"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditor } from "@/editor/use-editor";
import {
	BUILTIN_TEXT_TEMPLATES,
	CAPCUT_TEXT_CATEGORIES,
	type TextTemplate,
} from "@/text/text-templates";
import { buildTextElement } from "@/timeline/element-utils";
import type { MediaTime } from "@/wasm";
import { cn } from "@/utils/ui";
import {
	Search01Icon,
	FavouriteIcon,
	SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function TextTemplatesView() {
	const editor = useEditor();
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

	const toggleFavorite = (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		setFavoriteIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
				toast.info("已取消收藏");
			} else {
				next.add(id);
				toast.success("已加入收藏");
			}
			return next;
		});
	};

	const filteredTemplates = useMemo(() => {
		let list = [...BUILTIN_TEXT_TEMPLATES];

		if (selectedCategory !== "all") {
			list = list.filter((t) => t.category === selectedCategory);
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			const words = q.split(/\s+/).filter(Boolean);
			list = list.filter((t) =>
				words.some(
					(w) =>
						t.name.toLowerCase().includes(w) ||
						t.categoryNameZh.toLowerCase().includes(w) ||
						t.previewText.toLowerCase().includes(w) ||
						t.tags.some((tag) => tag.toLowerCase().includes(w)),
				),
			);
		}

		return list;
	}, [selectedCategory, searchQuery]);

	// Insert styled CapCut text template to timeline
	const handleAddTemplateToTimeline = (
		template: TextTemplate,
		customTime?: MediaTime,
	) => {
		const activeScene = editor.scenes.getActiveScene();
		if (!activeScene) return;

		const currentTime =
			customTime !== undefined
				? customTime
				: editor.playback.getCurrentTime();

		const element = buildTextElement({
			raw: {
				name: template.name,
				params: {
					...template.params,
					content: template.previewText || template.params.content,
				},
			},
			startTime: currentTime,
		});

		editor.timeline.insertElement({
			element,
			placement: { mode: "auto" },
		});
		toast.success(`已添加「${template.name}」`);
	};

	return (
		<div className="flex h-full flex-col bg-background">
			{/* Search Header */}
			<div className="flex flex-col gap-2 p-3 pb-2 border-b border-border/40">
				<div className="relative">
					<HugeiconsIcon
						icon={Search01Icon}
						className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 size-3.5"
					/>
					<Input
						size="sm"
						placeholder="搜索花字、综艺、标题、排版模板..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						showClearIcon
						onClear={() => setSearchQuery("")}
						className="pl-8.5 text-xs h-8 bg-muted/40"
					/>
				</div>

				{/* CapCut Category Tabs Carousel */}
				<div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
					{CAPCUT_TEXT_CATEGORIES.map((cat) => (
						<button
							key={cat.id}
							type="button"
							onClick={() => setSelectedCategory(cat.id)}
							className={cn(
								"shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
								selectedCategory === cat.id
									? "bg-primary text-primary-foreground shadow-xs"
									: "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
						>
							{cat.label}
						</button>
					))}
				</div>
			</div>

			{/* Template Cards Stream */}
			<ScrollArea className="flex-1 px-3 py-2.5">
				{/* Section Title */}
				<div className="flex items-center justify-between mb-2">
					<span className="text-[11px] font-semibold text-muted-foreground tracking-wide flex items-center gap-1.5">
						<HugeiconsIcon icon={SparklesIcon} className="size-3 text-primary" />
						{selectedCategory === "all"
							? "精选花字与模板"
							: CAPCUT_TEXT_CATEGORIES.find((c) => c.id === selectedCategory)?.label || "花字列表"}
						{" "}({filteredTemplates.length})
					</span>
				</div>

				{/* CapCut Square Grid Layout */}
				<div className="grid grid-cols-2 gap-2.5 pb-6">
					{filteredTemplates.map((template) => {
						const isFav = favoriteIds.has(template.id);
						return (
							<DraggableItem
								key={template.id}
								name={template.name}
								preview={
									<div
										className="relative size-full flex flex-col items-center justify-center p-2 rounded-lg overflow-hidden border border-border/50 transition-all group select-none"
										style={{
											background:
												template.previewBackground ||
												"linear-gradient(135deg, #18181b 0%, #09090b 100%)",
										}}
									>
										{/* Favorite Button */}
										<button
											type="button"
											onClick={(e) => toggleFavorite(template.id, e)}
											className={cn(
												"absolute top-1.5 right-1.5 size-5 rounded-full flex items-center justify-center transition-opacity z-10",
												isFav
													? "text-red-500 bg-black/40 opacity-100"
													: "text-white/60 hover:text-red-400 bg-black/30 opacity-0 group-hover:opacity-100",
											)}
											title={isFav ? "取消收藏" : "收藏模板"}
										>
											<HugeiconsIcon
												icon={FavouriteIcon}
												className={cn("size-3", isFav && "fill-red-500")}
											/>
										</button>

										{/* Rendered Template Text */}
										<div
											className="w-full text-center px-1 font-bold line-clamp-2 leading-snug drop-shadow-md select-none pointer-events-none"
											style={{
												fontFamily:
													template.params.fontFamily ||
													"system-ui, sans-serif",
												fontSize: `${Math.min(
													16,
													Math.max(12, template.params.fontSize / 3.5),
												)}px`,
												color: template.params.color || "#ffffff",
												letterSpacing: `${template.params.letterSpacing || 0}px`,
												WebkitTextStroke: template.params.border?.width
													? `${Math.max(1, template.params.border.width / 4)}px ${template.params.border.color}`
													: undefined,
												textShadow: template.params.shadow?.blur
													? `${template.params.shadow.offsetX / 4}px ${template.params.shadow.offsetY / 4}px ${template.params.shadow.blur / 4}px ${template.params.shadow.color}`
													: undefined,
												fontStyle: template.params.fontStyle || "normal",
												fontWeight: template.params.fontWeight || "bold",
											}}
										>
											{template.previewText || template.name}
										</div>

										{/* Category/Tag Tag Pill */}
										<div className="absolute bottom-1 left-1.5 max-w-[80%] truncate text-[9px] text-white/50 tracking-tight font-medium">
											{template.categoryNameZh}
										</div>
									</div>
								}
								dragData={{
									id: template.id,
									type: "text",
									name: template.name,
									content: template.previewText || template.params.content,
									params: template.params,
								}}
								aspectRatio={1.4}
								onAddToTimeline={({ currentTime }) =>
									handleAddTemplateToTimeline(template, currentTime)
								}
								shouldShowLabel={true}
								containerClassName="w-full"
							/>
						);
					})}
				</div>
			</ScrollArea>
		</div>
	);
}
