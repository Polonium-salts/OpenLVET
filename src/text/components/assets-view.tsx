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
import { DEFAULTS } from "@/timeline/defaults";
import { buildTextElement } from "@/timeline/element-utils";
import type { TimelineDragData } from "@/timeline/drag";
import type { MediaTime } from "@/wasm";
import { cn } from "@/utils/ui";
import {
	Download01Icon,
	PlusSignIcon,
	Search01Icon,
	TextIcon,
	FavouriteIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function TextView() {
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

	// Insert standard default text
	const handleAddDefaultText = ({ currentTime }: { currentTime: MediaTime }) => {
		const activeScene = editor.scenes.getActiveScene();
		if (!activeScene) return;

		const element = buildTextElement({
			raw: DEFAULTS.text.element,
			startTime: currentTime,
		});

		editor.timeline.insertElement({
			element,
			placement: { mode: "auto" },
		});
		toast.success("已添加默认文本");
	};

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
						placeholder="搜索花字、综艺、标题、贴纸..."
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
								"shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
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
				{/* Top Quick Default Text bar (when on 'all' or empty search) */}
				{selectedCategory === "all" && !searchQuery.trim() && (
					<div className="mb-3">
						<div className="flex items-center justify-between mb-1.5">
							<span className="text-[11px] font-semibold text-muted-foreground tracking-wide">
								默认文本
							</span>
						</div>
						<DraggableItem
							name="默认文本"
							preview={
								<div className="flex w-full items-center justify-between px-3 py-2 rounded-lg bg-card/70 border border-border/60 hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer">
									<div className="flex items-center gap-2">
										<div className="size-6 rounded-md bg-muted flex items-center justify-center text-foreground/80">
											<HugeiconsIcon icon={TextIcon} className="size-3.5" />
										</div>
										<span className="text-xs font-medium text-foreground">
											+ 添加默认文本 (标准样式)
										</span>
									</div>
									<HugeiconsIcon icon={PlusSignIcon} className="size-3.5 text-muted-foreground" />
								</div>
							}
							dragData={{
								id: "capcut-default-text-id",
								type: "text",
								name: "默认文本",
								content: "默认文本",
							}}
							aspectRatio={6}
							onAddToTimeline={handleAddDefaultText}
							shouldShowLabel={false}
							containerClassName="w-full"
						/>
					</div>
				)}

				{/* Section Title */}
				<div className="flex items-center justify-between mb-2">
					<span className="text-[11px] font-semibold text-muted-foreground tracking-wide">
						{selectedCategory === "all"
							? "热门推荐"
							: CAPCUT_TEXT_CATEGORIES.find((c) => c.id === selectedCategory)?.label || "花字列表"}
						{" "}({filteredTemplates.length})
					</span>
				</div>

				{/* CapCut Square Grid Layout */}
				{filteredTemplates.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-center gap-2">
						<div className="size-10 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
							<HugeiconsIcon icon={Search01Icon} className="size-5" />
						</div>
						<p className="text-xs font-medium text-foreground">未找到相关花字模板</p>
						<p className="text-[11px] text-muted-foreground">
							尝试更换关键词或在上方切换分类
						</p>
					</div>
				) : (
					<div className="grid grid-cols-3 gap-2 pb-6">
						{filteredTemplates.map((template) => (
							<CapCutCardItem
								key={template.id}
								template={template}
								isFavorited={favoriteIds.has(template.id)}
								onToggleFavorite={(e) => toggleFavorite(template.id, e)}
								onAdd={(customTime) => handleAddTemplateToTimeline(template, customTime)}
							/>
						))}
					</div>
				)}
			</ScrollArea>
		</div>
	);
}

interface CapCutCardItemProps {
	template: TextTemplate;
	isFavorited: boolean;
	onToggleFavorite: (e: React.MouseEvent) => void;
	onAdd: (customTime?: MediaTime) => void;
}

function CapCutCardItem({
	template,
	isFavorited,
	onToggleFavorite,
	onAdd,
}: CapCutCardItemProps) {
	const dragData: TimelineDragData = {
		id: `text-tpl-${template.id}`,
		type: "text",
		name: template.name,
		content: template.params.content,
		params: template.params,
	};

	const preview = (
		<div className="relative flex size-full items-center justify-center p-2 select-none overflow-hidden bg-[#1b1b20] group-hover:bg-[#25252c] transition-colors rounded-xl">
			{/* Top Left: CapCut Cyan VIP Diamond Badge */}
			<div className="absolute top-1.5 left-1.5 z-10 flex items-center justify-center pointer-events-none">
				<div className="size-2 rounded-xs bg-cyan-400 rotate-45 shadow-[0_0_6px_#22d3ee]" />
			</div>

			{/* Center: Stylized Text */}
			<div
				style={template.previewStyle}
				className="text-xs sm:text-sm font-black tracking-wide text-center max-w-full px-1 truncate group-hover:scale-110 transition-transform duration-200 drop-shadow-md"
			>
				{template.previewText}
			</div>

			{/* Bottom Left: Favorite Toggle */}
			<button
				type="button"
				onClick={onToggleFavorite}
				className={cn(
					"absolute bottom-1.5 left-1.5 z-20 size-5 rounded-full flex items-center justify-center transition-all",
					isFavorited
						? "text-red-500 opacity-100"
						: "text-white/40 hover:text-white opacity-0 group-hover:opacity-100",
				)}
				title={isFavorited ? "取消收藏" : "收藏花字"}
			>
				<HugeiconsIcon
					icon={FavouriteIcon}
					className={cn("size-3", isFavorited && "fill-current")}
				/>
			</button>

			{/* Bottom Right: Download/Add Icon indicator */}
			<div className="absolute bottom-1.5 right-1.5 z-10 pointer-events-none">
				<div className="size-5 rounded-full bg-black/60 group-hover:bg-primary text-white/80 group-hover:text-primary-foreground flex items-center justify-center transition-all shadow-xs">
					<HugeiconsIcon icon={Download01Icon} className="size-3" />
				</div>
			</div>
		</div>
	);

	return (
		<div className="group relative w-full aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-primary/80 transition-all shadow-xs cursor-pointer">
			<DraggableItem
				name={template.name}
				preview={preview}
				dragData={dragData}
				aspectRatio={1}
				shouldShowLabel={false}
				shouldShowPlusOnDrag={false}
				onAddToTimeline={({ currentTime }) => onAdd(currentTime)}
				containerClassName="w-full h-full"
				className="size-full"
			/>
		</div>
	);
}
