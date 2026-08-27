"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useStockStore } from "@/stock/stock-store";
import type { StockItem, StockMediaType, StockSortKey } from "@/stock/types";
import { cn } from "@/utils/ui";
import {
	Delete02Icon,
	FavouriteIcon,
	Film01Icon,
	Folder03Icon,
	GridViewIcon,
	HeadphonesIcon,
	LeftToRightListDashIcon,
	MoreHorizontalIcon,
	PlusSignIcon,
	Search01Icon,
	SortingOneNineIcon,
	Upload01Icon,
	Video01Icon,
	ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";
import { MASKABLE_ELEMENT_TYPES } from "@/timeline";
import { formatStorageBytes } from "@/services/storage/quota";

function formatSeconds(seconds?: number): string {
	if (!seconds || isNaN(seconds)) return "00:00";
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function StockView() {
	const {
		items,
		mediaType,
		searchQuery,
		sortKey,
		sortOrder,
		viewMode,
		isImporting,
		importProgress,
		previewItem,
		setMediaType,
		setSearchQuery,
		setSort,
		setViewMode,
		setPreviewItem,
		loadStockLibrary,
		importFiles,
		deleteItem,
		renameItem,
		toggleFavorite,
		importStockToProject,
		addStockToTimeline,
	} = useStockStore();

	const [isDragOver, setIsDragOver] = useState(false);
	const [renameDialogOpen, setRenameDialogOpen] = useState(false);
	const [renameTargetItem, setRenameTargetItem] = useState<StockItem | null>(null);
	const [renameInput, setRenameInput] = useState("");

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Load library on mount
	useEffect(() => {
		loadStockLibrary();
	}, [loadStockLibrary]);

	// Filter & Sort items
	const filteredItems = useMemo(() => {
		let result = [...items];

		// Media type filter
		if (mediaType !== "all") {
			result = result.filter((item) => item.type === mediaType);
		}

		// Search query
		if (searchQuery.trim()) {
			const q = searchQuery.trim().toLowerCase();
			result = result.filter(
				(item) =>
					item.name.toLowerCase().includes(q) ||
					item.tags.some((t) => t.toLowerCase().includes(q)),
			);
		}

		// Sort
		result.sort((a, b) => {
			let cmp = 0;
			if (sortKey === "name") {
				cmp = a.name.localeCompare(b.name, "zh-CN");
			} else if (sortKey === "size") {
				cmp = a.size - b.size;
			} else if (sortKey === "duration") {
				cmp = (a.duration || 0) - (b.duration || 0);
			} else {
				// "date"
				cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
			}
			return sortOrder === "asc" ? cmp : -cmp;
		});

		return result;
	}, [items, mediaType, searchQuery, sortKey, sortOrder]);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			importFiles(e.target.files);
			e.target.value = "";
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			importFiles(e.dataTransfer.files);
		}
	};

	const handleRenameSubmit = async () => {
		if (!renameTargetItem || !renameInput.trim()) return;
		await renameItem(renameTargetItem.id, renameInput);
		setRenameDialogOpen(false);
		setRenameTargetItem(null);
		setRenameInput("");
	};

	return (
		<div
			className={cn(
				"flex h-full flex-col bg-background relative select-none transition-colors",
				isDragOver && "bg-primary/5 ring-2 ring-primary/40 ring-inset",
			)}
			onDragOver={(e) => {
				e.preventDefault();
				setIsDragOver(true);
			}}
			onDragLeave={() => setIsDragOver(false)}
			onDrop={handleDrop}
		>
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept="video/*,image/*,audio/*"
				className="hidden"
				onChange={handleFileSelect}
			/>

			{/* Top Header */}
			<div className="flex flex-col gap-2 p-3 pb-2 border-b border-border/40">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<span className="font-semibold text-sm">统一素材库</span>
						<span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium border border-primary/20">
							所有工程通用
						</span>
					</div>

					<Button
						size="sm"
						className="h-7 text-xs gap-1 px-2.5 shadow-sm"
						disabled={isImporting}
						onClick={() => fileInputRef.current?.click()}
					>
						<HugeiconsIcon icon={Upload01Icon} className="size-3.5" />
						{isImporting ? `导入中 ${importProgress}%` : "导入素材"}
					</Button>
				</div>

				{/* Search & View Switcher */}
				<div className="flex items-center gap-2">
					<div className="relative flex-1">
						<HugeiconsIcon
							icon={Search01Icon}
							className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
						/>
						<Input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="搜索素材名称..."
							className="h-8 pl-8 pr-7 text-xs bg-muted/40"
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
							>
								✕
							</button>
						)}
					</div>

					{/* View Mode & Sort Dropdowns */}
					<div className="flex items-center gap-1">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="size-8">
									<HugeiconsIcon icon={SortingOneNineIcon} className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-40 text-xs">
								<DropdownMenuLabel className="text-xs">排序规则</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuRadioGroup
									value={sortKey}
									onValueChange={(val) => setSort(val as StockSortKey)}
								>
									<DropdownMenuRadioItem value="date" className="text-xs">按导入时间</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="name" className="text-xs">按名称</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="size" className="text-xs">按文件大小</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="duration" className="text-xs">按时长</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-xs"
									onClick={() => setSort(sortKey, sortOrder === "asc" ? "desc" : "asc")}
								>
									{sortOrder === "asc" ? "切换为降序 (新到旧)" : "切换为升序 (旧到新)"}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<Button
							variant="ghost"
							size="icon"
							className="size-8"
							onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
						>
							<HugeiconsIcon
								icon={viewMode === "grid" ? LeftToRightListDashIcon : GridViewIcon}
								className="size-4"
							/>
						</Button>
					</div>
				</div>

				{/* Media Type Filter Tabs */}
				<Tabs
					value={mediaType}
					onValueChange={(val) => setMediaType(val as StockMediaType)}
					className="w-full"
				>
					<TabsList className="grid w-full grid-cols-4 h-7 p-0.5 bg-muted/60">
						<TabsTrigger value="all" className="text-[11px] px-1 h-6">全部</TabsTrigger>
						<TabsTrigger value="video" className="text-[11px] px-1 h-6">视频</TabsTrigger>
						<TabsTrigger value="image" className="text-[11px] px-1 h-6">图片</TabsTrigger>
						<TabsTrigger value="audio" className="text-[11px] px-1 h-6">音频</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{/* Drag Overlay Hint */}
			{isDragOver && (
				<div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm border-2 border-dashed border-primary m-3 rounded-lg pointer-events-none">
					<HugeiconsIcon icon={Upload01Icon} className="size-12 text-primary animate-bounce mb-2" />
					<p className="font-semibold text-sm">释放文件即可导入至统一素材库</p>
					<p className="text-xs text-muted-foreground mt-1">支持视频、图片、音频文件，在所有工程中通用</p>
				</div>
			)}

			{/* Material Items List / Grid */}
			<ScrollArea className="flex-1 min-h-0">
				<div className="p-3">
					{filteredItems.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
							<div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
								<HugeiconsIcon icon={Folder03Icon} className="size-6" />
							</div>
							<h3 className="font-semibold text-sm text-foreground mb-1">
								{searchQuery ? "未找到匹配素材" : "素材库暂无素材"}
							</h3>
							<p className="text-xs text-muted-foreground max-w-xs mb-4">
								{searchQuery
									? "尝试更换关键词搜索，或切换媒体类型"
									: "点击上方“导入素材”或拖拽音视频、图片文件到此处，添加后将在所有工程中永久共享"}
							</p>
							{!searchQuery && (
								<Button
									size="sm"
									variant="outline"
									className="gap-1.5 text-xs font-normal"
									onClick={() => fileInputRef.current?.click()}
								>
									<HugeiconsIcon icon={Upload01Icon} className="size-3.5" />
									立即导入素材
								</Button>
							)}
						</div>
					) : viewMode === "grid" ? (
						<div className="grid grid-cols-2 gap-2.5 pb-6">
							{filteredItems.map((item) => (
								<StockGridCard
									key={item.id}
									item={item}
									onPreview={() => setPreviewItem(item)}
									onInsertTimeline={() => addStockToTimeline(item)}
									onImportProject={() => importStockToProject(item)}
									onToggleFavorite={() => toggleFavorite(item.id)}
									onRename={() => {
										setRenameTargetItem(item);
										setRenameInput(item.name);
										setRenameDialogOpen(true);
									}}
									onDelete={() => deleteItem(item.id)}
								/>
							))}
						</div>
					) : (
						<div className="flex flex-col gap-1.5 pb-6">
							{filteredItems.map((item) => (
								<StockListRow
									key={item.id}
									item={item}
									onPreview={() => setPreviewItem(item)}
									onInsertTimeline={() => addStockToTimeline(item)}
									onImportProject={() => importStockToProject(item)}
									onToggleFavorite={() => toggleFavorite(item.id)}
									onRename={() => {
										setRenameTargetItem(item);
										setRenameInput(item.name);
										setRenameDialogOpen(true);
									}}
									onDelete={() => deleteItem(item.id)}
								/>
							))}
						</div>
					)}
				</div>
			</ScrollArea>

			{/* Rename Item Dialog */}
			<Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
				<DialogContent className="sm:max-w-[360px]">
					<DialogHeader>
						<DialogTitle className="text-base">重命名素材</DialogTitle>
						<DialogDescription className="text-xs">
							修改该素材在统一素材库中的显示名称。
						</DialogDescription>
					</DialogHeader>
					<div className="py-2">
						<Input
							value={renameInput}
							onChange={(e) => setRenameInput(e.target.value)}
							placeholder="输入新名称..."
							className="text-xs"
							autoFocus
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleRenameSubmit();
								}
							}}
						/>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setRenameDialogOpen(false)}
							className="text-xs"
						>
							取消
						</Button>
						<Button
							size="sm"
							onClick={handleRenameSubmit}
							disabled={!renameInput.trim()}
							className="text-xs"
						>
							确定
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Detail Preview Modal */}
			{previewItem && (
				<StockPreviewDialog
					item={previewItem}
					onClose={() => setPreviewItem(null)}
					onInsertTimeline={() => addStockToTimeline(previewItem)}
					onImportProject={() => importStockToProject(previewItem)}
					onToggleFavorite={() => toggleFavorite(previewItem.id)}
					onDelete={() => {
						deleteItem(previewItem.id);
						setPreviewItem(null);
					}}
				/>
			)}
		</div>
	);
}

function StockGridCard({
	item,
	onPreview,
	onInsertTimeline,
	onImportProject,
	onToggleFavorite,
	onRename,
	onDelete,
}: {
	item: StockItem;
	onPreview: () => void;
	onInsertTimeline: () => void;
	onImportProject: () => void;
	onToggleFavorite: () => void;
	onRename: () => void;
	onDelete: () => void;
}) {
	const previewNode = (
		<div className="relative size-full bg-muted/70 overflow-hidden flex items-center justify-center">
			{item.type === "image" || (item.type === "video" && item.thumbnailUrl) ? (
				<img
					src={item.thumbnailUrl || item.url}
					alt={item.name}
					className="size-full object-cover"
					loading="lazy"
				/>
			) : item.type === "video" ? (
				<video
					src={item.url}
					className="size-full object-cover pointer-events-none"
					muted
					playsInline
					preload="metadata"
				/>
			) : (
				<div className="flex flex-col items-center justify-center gap-1.5 text-primary size-full bg-gradient-to-br from-primary/15 via-primary/5 to-muted/50 p-2">
					<div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-xs">
						<HugeiconsIcon icon={HeadphonesIcon} className="size-4.5" />
					</div>
					<span className="text-[10px] text-muted-foreground font-mono font-medium">
						{formatSeconds(item.duration)}
					</span>
				</div>
			)}

			{/* Badges */}
			<div className="absolute bottom-1 right-1 flex items-center gap-1 z-10 pointer-events-none">
				{item.duration != null && item.type !== "image" && (
					<span className="text-[9px] px-1 py-0.2 rounded bg-black/75 text-white font-mono backdrop-blur-xs">
						{formatSeconds(item.duration)}
					</span>
				)}
				{item.width && item.height && (
					<span className="text-[9px] px-1 py-0.2 rounded bg-black/75 text-white font-mono backdrop-blur-xs">
						{item.width}×{item.height}
					</span>
				)}
			</div>

			{/* Favorite status indicator */}
			{item.isFavorite && (
				<div className="absolute top-1 right-1 size-5 rounded-full bg-red-500 text-white flex items-center justify-center z-10 shadow-sm pointer-events-none">
					<HugeiconsIcon icon={FavouriteIcon} className="size-3 fill-current" />
				</div>
			)}
		</div>
	);

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<div className="group relative flex flex-col rounded-lg border border-border/50 bg-card overflow-hidden hover:border-primary/50 transition-all hover:shadow-md p-1">
					<div className="relative w-full cursor-pointer overflow-hidden rounded" onClick={onPreview}>
						<DraggableItem
							name={item.name}
							preview={previewNode}
							dragData={{
								id: item.id,
								stockId: item.id,
								type: "stock",
								mediaType: item.type,
								name: item.name,
								...(item.type !== "audio" && {
									targetElementTypes: [...MASKABLE_ELEMENT_TYPES],
								}),
							}}
							shouldShowPlusOnDrag={false}
							shouldShowLabel={false}
							onAddToTimeline={onInsertTimeline}
							variant="card"
							aspectRatio={4 / 3}
						/>

						{/* Hover Action Overlay */}
						<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-1.5 pointer-events-none z-20">
							<button
								onClick={(e) => {
									e.stopPropagation();
									onToggleFavorite();
								}}
								className={cn(
									"size-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 hover:text-red-400 pointer-events-auto transition-colors",
									item.isFavorite && "text-red-500",
								)}
								title={item.isFavorite ? "取消收藏" : "加入收藏"}
							>
								<HugeiconsIcon icon={FavouriteIcon} className={cn("size-3.5", item.isFavorite && "fill-current")} />
							</button>

							<div className="flex items-center gap-1 pointer-events-auto">
								<button
									onClick={(e) => {
										e.stopPropagation();
										onPreview();
									}}
									className="size-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 hover:text-primary transition-colors"
									title="详情预览"
								>
									<HugeiconsIcon icon={ViewIcon} className="size-3.5" />
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										onInsertTimeline();
									}}
									className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 shadow-sm transition-transform active:scale-95"
									title="插入到时间线"
								>
									<HugeiconsIcon icon={PlusSignIcon} className="size-4" />
								</button>
							</div>
						</div>
					</div>

					{/* Card Bottom Meta */}
					<div className="flex items-center justify-between pt-1.5 pb-0.5 px-1 bg-card gap-1">
						<div className="flex flex-col min-w-0 flex-1">
							<span className="text-[11px] font-medium truncate leading-tight" title={item.name}>
								{item.name}
							</span>
							<span className="text-[9px] text-muted-foreground truncate">
								{formatStorageBytes({ bytes: item.size })}
							</span>
						</div>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-foreground shrink-0">
									<HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-40 text-xs">
								<DropdownMenuItem onClick={onInsertTimeline} className="text-xs">
									<HugeiconsIcon icon={PlusSignIcon} className="size-3.5 mr-2" />
									插入到时间线
								</DropdownMenuItem>
								<DropdownMenuItem onClick={onImportProject} className="text-xs">
									<HugeiconsIcon icon={Film01Icon} className="size-3.5 mr-2" />
									导入到项目资产
								</DropdownMenuItem>
								<DropdownMenuItem onClick={onPreview} className="text-xs">
									<HugeiconsIcon icon={ViewIcon} className="size-3.5 mr-2" />
									素材详情预览
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={onRename} className="text-xs">
									重命名
								</DropdownMenuItem>
								<DropdownMenuItem onClick={onToggleFavorite} className="text-xs">
									<HugeiconsIcon icon={FavouriteIcon} className="size-3.5 mr-2" />
									{item.isFavorite ? "取消收藏" : "加入收藏"}
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={onDelete} className="text-xs text-destructive focus:text-destructive">
									<HugeiconsIcon icon={Delete02Icon} className="size-3.5 mr-2" />
									删除素材
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent className="w-44 text-xs">
				<ContextMenuItem onClick={onInsertTimeline}>
					<HugeiconsIcon icon={PlusSignIcon} className="size-3.5 mr-2" />
					插入到时间线
				</ContextMenuItem>
				<ContextMenuItem onClick={onImportProject}>
					<HugeiconsIcon icon={Film01Icon} className="size-3.5 mr-2" />
					导入到当前工程
				</ContextMenuItem>
				<ContextMenuItem onClick={onPreview}>
					<HugeiconsIcon icon={ViewIcon} className="size-3.5 mr-2" />
					查看详情
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem onClick={onRename}>重命名</ContextMenuItem>
				<ContextMenuItem onClick={onToggleFavorite}>
					<HugeiconsIcon icon={FavouriteIcon} className="size-3.5 mr-2" />
					{item.isFavorite ? "取消收藏" : "收藏素材"}
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
					<HugeiconsIcon icon={Delete02Icon} className="size-3.5 mr-2" />
					删除素材
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}

function StockListRow({
	item,
	onPreview,
	onInsertTimeline,
	onImportProject,
	onToggleFavorite,
	onRename,
	onDelete,
}: {
	item: StockItem;
	onPreview: () => void;
	onInsertTimeline: () => void;
	onImportProject: () => void;
	onToggleFavorite: () => void;
	onRename: () => void;
	onDelete: () => void;
}) {
	return (
		<div className="group flex items-center justify-between p-1.5 px-2 rounded-lg border border-border/40 bg-card hover:border-primary/40 hover:bg-muted/30 transition-all gap-2">
			<div className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer" onClick={onPreview}>
				<div className="relative size-10 rounded bg-muted/80 shrink-0 overflow-hidden flex items-center justify-center">
					{item.type === "image" ? (
						<img src={item.thumbnailUrl || item.url} alt={item.name} className="size-full object-cover" />
					) : item.type === "video" ? (
						item.thumbnailUrl ? (
							<img src={item.thumbnailUrl} alt={item.name} className="size-full object-cover" />
						) : (
							<video src={item.url} className="size-full object-cover pointer-events-none" muted playsInline preload="metadata" />
						)
					) : (
						<div className="size-full bg-primary/10 flex items-center justify-center">
							<HugeiconsIcon icon={HeadphonesIcon} className="size-5 text-primary" />
						</div>
					)}
				</div>

				<div className="flex flex-col min-w-0 flex-1">
					<div className="flex items-center gap-1.5">
						<span className="text-xs font-medium truncate" title={item.name}>
							{item.name}
						</span>
						{item.isFavorite && (
							<HugeiconsIcon icon={FavouriteIcon} className="size-3 text-red-500 fill-current shrink-0" />
						)}
					</div>
					<div className="flex items-center gap-2 text-[10px] text-muted-foreground">
						<span>{formatStorageBytes({ bytes: item.size })}</span>
						{item.duration != null && (
							<>
								<span>•</span>
								<span>{formatSeconds(item.duration)}</span>
							</>
						)}
					</div>
				</div>
			</div>

			<div className="flex items-center gap-1">
				<Button
					size="sm"
					variant="ghost"
					className="h-7 text-xs px-2 gap-1"
					onClick={onInsertTimeline}
				>
					<HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
					插入
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
							<HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-40 text-xs">
						<DropdownMenuItem onClick={onInsertTimeline}>插入到时间线</DropdownMenuItem>
						<DropdownMenuItem onClick={onImportProject}>导入到项目资产</DropdownMenuItem>
						<DropdownMenuItem onClick={onPreview}>素材详情预览</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={onRename}>重命名</DropdownMenuItem>
						<DropdownMenuItem onClick={onToggleFavorite}>
							{item.isFavorite ? "取消收藏" : "加入收藏"}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
							删除素材
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

function StockPreviewDialog({
	item,
	onClose,
	onInsertTimeline,
	onImportProject,
	onToggleFavorite,
	onDelete,
}: {
	item: StockItem;
	onClose: () => void;
	onInsertTimeline: () => void;
	onImportProject: () => void;
	onToggleFavorite: () => void;
	onDelete: () => void;
}) {
	return (
		<Dialog open={true} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
				{/* Media Player / Preview Area */}
				<div className="relative w-full aspect-video bg-black/95 flex items-center justify-center overflow-hidden">
					{item.type === "video" ? (
						<video
							src={item.url}
							controls
							autoPlay
							className="w-full h-full object-contain"
						/>
					) : item.type === "image" ? (
						<img
							src={item.url}
							alt={item.name}
							className="w-full h-full object-contain"
						/>
					) : (
						<div className="flex flex-col items-center justify-center gap-4 w-full p-6 text-white">
							<HugeiconsIcon icon={HeadphonesIcon} className="size-16 text-primary animate-pulse" />
							<audio src={item.url} controls autoPlay className="w-full max-w-sm" />
						</div>
					)}
				</div>

				{/* Metadata & Actions */}
				<div className="p-4 flex flex-col gap-3">
					<div className="flex items-start justify-between gap-3">
						<div className="flex flex-col gap-0.5">
							<h3 className="font-semibold text-sm leading-tight text-foreground">{item.name}</h3>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className={cn("h-7 px-2 text-xs gap-1", item.isFavorite && "text-red-500")}
							onClick={onToggleFavorite}
						>
							<HugeiconsIcon icon={FavouriteIcon} className={cn("size-3.5", item.isFavorite && "fill-current")} />
							{item.isFavorite ? "已收藏" : "收藏"}
						</Button>
					</div>

					{/* Metadata Grid */}
					<div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-muted/40 text-xs">
						<div>
							<span className="text-muted-foreground text-[10px] block">媒体类型</span>
							<span className="font-medium">
								{item.type === "video" ? "视频 (Video)" : item.type === "image" ? "图片 (Image)" : "音频 (Audio)"}
							</span>
						</div>
						<div>
							<span className="text-muted-foreground text-[10px] block">文件大小</span>
							<span className="font-medium">{formatStorageBytes({ bytes: item.size })}</span>
						</div>
						<div>
							<span className="text-muted-foreground text-[10px] block">
								{item.type === "image" || item.type === "video" ? "分辨率 / 时长" : "音频时长"}
							</span>
							<span className="font-medium font-mono">
								{item.width && item.height ? `${item.width}×${item.height} ` : ""}
								{item.duration != null ? `(${formatSeconds(item.duration)})` : ""}
							</span>
						</div>
					</div>

					{/* Footer Actions */}
					<div className="flex items-center justify-between pt-1 border-t border-border/40">
						<Button
							variant="ghost"
							size="sm"
							className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
							onClick={onDelete}
						>
							<HugeiconsIcon icon={Delete02Icon} className="size-3.5 mr-1" />
							删除素材
						</Button>

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								className="h-8 text-xs font-normal"
								onClick={() => {
									onImportProject();
									onClose();
								}}
							>
								导入到项目资产
							</Button>
							<Button
								size="sm"
								className="h-8 text-xs gap-1 px-3 shadow-sm"
								onClick={() => {
									onInsertTimeline();
									onClose();
								}}
							>
								<HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
								插入到时间线
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
