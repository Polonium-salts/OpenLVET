"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditor } from "@/editor/use-editor";
import { resolveStickerIntrinsicSize } from "@/stickers";
import {
	buildGraphicElement,
	buildStickerElement,
} from "@/timeline/element-utils";
import { STICKER_CATEGORIES } from "@/stickers/categories";
import { parseShapeStickerId } from "@/stickers/providers/shapes";
import type { TimelineDragData } from "@/timeline/drag";
import type {
	StickerBrowseSection,
	StickerCategory,
	StickerItem as StickerData,
} from "@/stickers";
import { useStickersStore } from "@/stickers/stickers-store";
import { cn } from "@/utils/ui";
import {
	HappyIcon,
	Search01Icon,
	SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function StickersView() {
	const {
		browseContent,
		browseStickers,
		searchQuery,
		searchStickers,
		selectedCategory,
		setSearchQuery,
		setSelectedCategory,
		viewMode,
	} = useStickersStore();

	useEffect(() => {
		if (viewMode === "browse" && !browseContent) {
			void browseStickers();
		}
	}, [browseContent, browseStickers, viewMode]);

	return (
		<div className="flex h-full flex-col py-2">
			{/* Sticker Square Banner Header */}
			<div className="mx-2 mb-2 px-2.5 py-2 rounded-xl border border-sky-500/20 bg-gradient-to-r from-sky-500/10 via-pink-500/5 to-purple-500/10 flex items-center justify-between shadow-xs">
				<div className="flex flex-col">
					<div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
						<span>贴纸</span>
						<span className="px-1.5 py-0.2 rounded-md text-[11px] bg-primary/20 text-primary font-mono font-bold">
							(9999+)
						</span>
					</div>
					<span className="text-[10px] text-muted-foreground mt-0.5">
						已有 3380+ 位 UP 主贡献与 18,000+ 款官方表情包
					</span>
				</div>
				<div className="flex items-center gap-1">
					<span className="text-[10px] text-muted-foreground bg-background/60 px-1.5 py-0.5 rounded border border-border/40 shrink-0">
						可拖拽上轨
					</span>
				</div>
			</div>

			<div className="px-2">
				<div className="relative">
					<HugeiconsIcon
						icon={Search01Icon}
						className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 size-3.5"
					/>
					<Input
						size="sm"
						variant="default"
						placeholder="搜索贴纸（小黄脸、2233娘、罗小黑、洛天依...）"
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery({ query: e.target.value });
							void searchStickers({ query: e.target.value });
						}}
						showClearIcon
						onClear={() => {
							setSearchQuery({ query: "" });
							void searchStickers({ query: "" });
						}}
						className="w-full pl-8.5 text-xs h-8 bg-muted/40"
						containerClassName="w-full"
					/>
				</div>
			</div>

			<Tabs
				value={selectedCategory}
				onValueChange={(value) => {
					setSelectedCategory({ category: value as StickerCategory });
				}}
				variant="underline"
				className="mt-2 flex min-h-0 flex-1 flex-col"
			>
				<TabsList aria-label="Sticker categories" className="flex overflow-x-auto no-scrollbar w-full justify-start gap-1 px-2 border-b border-border/40 pb-1">
					{Object.entries(STICKER_CATEGORIES).map(([key, label]) => (
						<TabsTrigger key={key} value={key} className="shrink-0 text-xs px-2.5 py-1">
							{label}
						</TabsTrigger>
					))}
				</TabsList>
				<div className="min-h-0 flex-1 overflow-y-auto px-4 pt-3">
					<StickersContentView />
				</div>
			</Tabs>
		</div>
	);
}

function StickerGrid({
	items,
	shouldCapSize = false,
	initialCount = 60,
	batchSize = 60,
}: {
	items: StickerData[];
	shouldCapSize?: boolean;
	initialCount?: number;
	batchSize?: number;
}) {
	const [visibleCount, setVisibleCount] = useState(initialCount);
	const loadMoreRef = useRef<HTMLDivElement>(null);

	const gridStyle: CSSProperties & {
		"--sticker-min": string;
		"--sticker-max"?: string;
	} = {
		gridTemplateColumns: shouldCapSize
			? "repeat(auto-fill, minmax(var(--sticker-min, 80px), var(--sticker-max, 140px)))"
			: "repeat(auto-fill, minmax(var(--sticker-min, 80px), 1fr))",
		"--sticker-min": "80px",
		...(shouldCapSize ? { "--sticker-max": "140px" } : {}),
	};

	const displayedItems = useMemo(
		() => items.slice(0, visibleCount),
		[items, visibleCount],
	);
	const hasMore = visibleCount < items.length;

	useEffect(() => {
		if (!hasMore) return;
		const el = loadMoreRef.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setVisibleCount((prev) => Math.min(items.length, prev + batchSize));
				}
			},
			{ rootMargin: "300px" },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [hasMore, items.length, batchSize]);

	return (
		<div className="flex flex-col gap-3">
			<div className="grid gap-2" style={gridStyle}>
				{displayedItems.map((item) => (
					<StickerItem key={item.id} item={item} shouldCapSize={shouldCapSize} />
				))}
			</div>

			{hasMore && (
				<div
					ref={loadMoreRef}
					className="flex flex-col items-center justify-center py-4 gap-2 text-xs text-muted-foreground"
				>
					<div className="flex items-center gap-2">
						<Spinner className="size-4 text-primary" />
						<span>加载更多贴纸 ({displayedItems.length} / {items.length})...</span>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setVisibleCount((prev) => Math.min(items.length, prev + 120))}
						className="h-7 text-xs"
					>
						加载下一批贴纸
					</Button>
				</div>
			)}

			{!hasMore && items.length > 30 && (
				<div className="text-center py-3 text-[11px] text-muted-foreground/60 border-t border-border/20 mt-2">
					已加载全部 {items.length} 款贴纸素材
				</div>
			)}
		</div>
	);
}

function StickerRow({ items }: { items: StickerData[] }) {
	return (
		<div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hidden">
			{items.map((item) => (
				<div key={item.id} className="w-20 shrink-0">
					<StickerItem item={item} shouldCapSize containerClassName="w-full" />
				</div>
			))}
		</div>
	);
}

function EmptyView({ message }: { message: string }) {
	return (
		<div className="bg-background flex h-full flex-col items-center justify-center gap-3 p-4">
			<HugeiconsIcon
				icon={HappyIcon}
				className="text-muted-foreground size-10"
			/>
			<div className="flex flex-col gap-1.5 text-center">
				<p className="text-sm font-medium text-foreground">未找到相关贴纸</p>
				<p className="text-muted-foreground text-xs text-balance">{message}</p>
			</div>
		</div>
	);
}

function StickersContentView() {
	const {
		browseContent,
		clearRecentStickers,
		isBrowsing,
		isSearching,
		searchQuery,
		searchResults,
		selectedCategory,
		setSelectedCategory,
		viewMode,
	} = useStickersStore();

	if (viewMode === "search") {
		if (isSearching) {
			return (
				<div className="flex items-center justify-center py-8">
					<Spinner className="text-muted-foreground size-6" />
				</div>
			);
		}

		if (searchResults?.items.length) {
			return (
				<div className="flex flex-col gap-3 pb-4">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-xs">
							找到 {searchResults.total} 个贴纸
						</span>
					</div>
					<StickerGrid items={searchResults.items} />
				</div>
			);
		}

		// "all" tab search — sections are in browseContent, fall through to section rendering below
		if (selectedCategory !== "all" && searchQuery) {
			return <EmptyView message={`未找到与 "${searchQuery}" 相关的贴纸`} />;
		}
	}

	if (isBrowsing && !browseContent) {
		return (
			<div className="flex items-center justify-center py-8">
				<Spinner className="text-muted-foreground size-6" />
			</div>
		);
	}

	if (!browseContent?.sections.length) {
		const categoryLabel = STICKER_CATEGORIES[selectedCategory] ?? selectedCategory;
		return (
			<EmptyView
				message={
					viewMode === "search"
						? `未找到与 "${searchQuery}" 相关的贴纸`
						: selectedCategory === "all"
							? "暂无可用贴纸素材"
							: `在「${categoryLabel}」分类下暂无可用贴纸`
				}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-4 pb-4">
			{browseContent.sections.map((section) => (
				<StickerSection
					key={section.id}
					section={section}
					onClearRecent={clearRecentStickers}
					onSeeAll={(category) => {
						setSelectedCategory({ category });
					}}
				/>
			))}
		</div>
	);
}

function StickerSection({
	section,
	onClearRecent,
	onSeeAll,
}: {
	section: StickerBrowseSection;
	onClearRecent: () => void;
	onSeeAll: (category: StickerCategory) => void;
}) {
	const hasHeader =
		Boolean(section.title) || section.id === "recent" || section.action;

	return (
		<div className="flex flex-col gap-2">
			{hasHeader && (
				<div className="flex items-center justify-between gap-2">
					{section.title ? (
						<p className="text-xs font-semibold text-muted-foreground">{section.title}</p>
					) : (
						<div />
					)}

					<div className="ml-auto flex items-center gap-2">
						{section.id === "recent" && (
							<Button
								onClick={onClearRecent}
								variant="text"
								size="sm"
								className="h-auto gap-1 p-0 text-xs text-muted-foreground hover:text-foreground"
							>
								清空
							</Button>
						)}

						{section.action?.type === "see-all" && section.action.category && (
							<Button
								variant="text"
								size="sm"
								className="h-auto gap-1 p-0 text-xs text-primary hover:underline"
								onClick={() => {
									onSeeAll(section.action?.category as StickerCategory);
								}}
							>
								查看全部
							</Button>
						)}
					</div>
				</div>
			)}

			{section.layout === "row" ? (
				<StickerRow items={section.items} />
			) : (
				<StickerGrid items={section.items} />
			)}
		</div>
	);
}

interface StickerItemProps {
	item: StickerData;
	shouldCapSize?: boolean;
	containerClassName?: string;
}

function StickerItem({
	item,
	shouldCapSize = false,
	containerClassName,
}: StickerItemProps) {
	const editor = useEditor();
	const { addToRecentStickers } = useStickersStore();
	const [isAdding, setIsAdding] = useState(false);
	const [hasImageError, setHasImageError] = useState(false);

	useEffect(() => {
		if (!item.id) {
			return;
		}

		setHasImageError(false);
	}, [item.id]);

	const displayName = item.name;
	const shapePreset =
		item.provider === "shapes" ? parseShapeStickerId({ stickerId: item.id }) : null;

	const handleAdd = async () => {
		setIsAdding(true);
		try {
			const currentTime = editor.playback.getCurrentTime();

			let element:
				| ReturnType<typeof buildGraphicElement>
				| ReturnType<typeof buildStickerElement>;
			if (shapePreset) {
				element = buildGraphicElement({
					definitionId: shapePreset.definitionId,
					name: shapePreset.name,
					startTime: currentTime,
					params: shapePreset.params,
				});
			} else {
				const { width: intrinsicWidth, height: intrinsicHeight } =
					await resolveStickerIntrinsicSize({ stickerId: item.id });
				element = buildStickerElement({
					stickerId: item.id,
					name: item.name,
					startTime: currentTime,
					intrinsicWidth,
					intrinsicHeight,
				});
			}

			editor.timeline.insertElement({
				placement: { mode: "auto" },
				element,
			});

			addToRecentStickers({ stickerId: item.id });
			toast.success(`已添加贴纸「${item.name}」`);
		} catch (error) {
			console.error("Failed to add sticker:", error);
			toast.error("添加贴纸到时间线失败");
		} finally {
			setIsAdding(false);
		}
	};

	const preview = (
		<div className="flex size-full items-center justify-center p-2.5 transition-transform hover:scale-105">
			{hasImageError ? (
				<span className="text-muted-foreground text-center text-xs break-all">
					{displayName}
				</span>
			) : (
				<Image
					src={item.previewUrl}
					alt={displayName}
					width={64}
					height={64}
					className="size-full object-contain drop-shadow-sm"
					style={
						shouldCapSize
							? {
									maxWidth: "var(--sticker-max, 160px)",
									maxHeight: "var(--sticker-max, 160px)",
								}
							: undefined
					}
					onError={() => setHasImageError(true)}
					loading="lazy"
					unoptimized
					referrerPolicy="no-referrer"
				/>
			)}
		</div>
	);

	const dragData: TimelineDragData = shapePreset
		? {
				id: item.id,
				type: "graphic",
				name: displayName,
				definitionId: shapePreset.definitionId,
				params: shapePreset.params ?? {},
			}
		: {
				id: item.id,
				type: "sticker",
				name: displayName,
				stickerId: item.id,
			};

	return (
		<div
			className={cn("relative group", isAdding && "pointer-events-none opacity-50")}
		>
			<DraggableItem
				name={displayName}
				preview={preview}
				dragData={dragData}
				onAddToTimeline={handleAdd}
				aspectRatio={1}
				shouldShowLabel={false}
				isRounded
				variant="card"
				containerClassName={containerClassName ?? "w-full"}
			/>
			{isAdding && (
				<div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-black/60">
					<Spinner className="size-6 text-white" />
				</div>
			)}
		</div>
	);
}
