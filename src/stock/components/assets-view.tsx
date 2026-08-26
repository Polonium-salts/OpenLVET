"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { STOCK_CATEGORIES } from "@/stock/categories";
import { useStockStore } from "@/stock/stock-store";
import type { StockItem, StockMediaType } from "@/stock/types";
import { cn } from "@/utils/ui";
import {
	AiVideoIcon,
	Camera01Icon,
	Download01Icon,
	FavouriteIcon,
	FilterMailIcon,
	InformationCircleIcon,
	Layers01Icon,
	MagicWand01Icon,
	PlayIcon,
	PlusSignIcon,
	Search01Icon,
	Settings01Icon,
	SparklesIcon,
	Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { toast } from "sonner";

export function StockView() {
	const {
		searchQuery,
		mediaType,
		category,
		orientation,
		order,
		items,
		savedItems,
		viewTab,
		isLoading,
		isLoadingMore,
		hasMore,
		isDemoFallback,
		apiKey,
		setSearchQuery,
		setMediaType,
		setCategory,
		setOrientation,
		setOrder,
		setViewTab,
		setApiKey,
		fetchStockItems,
		loadMore,
		previewItem,
		setPreviewItem,
	} = useStockStore();

	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [tempKey, setTempKey] = useState(apiKey);
	const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

	// Load initial items if empty
	useEffect(() => {
		if (items.length === 0 && !isLoading) {
			fetchStockItems(true);
		}
	}, [fetchStockItems, items.length, isLoading]);

	// Handle search input debounce with ultra-responsive 120ms delay
	const handleSearchChange = (query: string) => {
		setSearchQuery(query);
		if (searchDebounceRef.current) {
			clearTimeout(searchDebounceRef.current);
		}
		searchDebounceRef.current = setTimeout(() => {
			fetchStockItems(true);
		}, 120);
	};

	const { scrollAreaRef, handleScroll } = useInfiniteScroll({
		onLoadMore: loadMore,
		hasMore,
		isLoading: isLoading || isLoadingMore,
	});

	const rawItems = viewTab === "saved" ? savedItems : items;
	const displayedItems = rawItems.filter(
		(item, idx, self) => idx === self.findIndex((i) => i.id === item.id),
	);

	return (
		<div className="flex h-full flex-col bg-background">
			{/* Top Header & Search Area */}
			<div className="flex flex-col gap-2 p-3 pb-2 border-b border-border/40">
				{/* Top Controls: Media Type Tabs + Settings */}
				<div className="flex items-center justify-between gap-2">
					<Tabs
						value={viewTab === "saved" ? "saved" : mediaType}
						onValueChange={(val) => {
							if (val === "saved") {
								setViewTab("saved");
							} else {
								setViewTab("browse");
								setMediaType(val as StockMediaType);
							}
						}}
						className="w-full"
					>
						<TabsList className="grid w-full grid-cols-6 h-8 p-0.5">
							<TabsTrigger value="all" className="text-xs px-1">全部</TabsTrigger>
							<TabsTrigger value="video" className="text-xs px-1">视频</TabsTrigger>
							<TabsTrigger value="photo" className="text-xs px-1">照片</TabsTrigger>
							<TabsTrigger value="illustration" className="text-xs px-1">插画</TabsTrigger>
							<TabsTrigger value="vector" className="text-xs px-1">矢量</TabsTrigger>
							<TabsTrigger value="saved" className="text-xs px-1">收藏</TabsTrigger>
						</TabsList>
					</Tabs>

					{/* API Key Settings Button */}
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className={cn("size-8 shrink-0 relative", apiKey && "text-primary")}
								onClick={() => {
									setTempKey(apiKey);
									setIsSettingsOpen(true);
								}}
							>
								<HugeiconsIcon icon={Settings01Icon} className="size-4" />
								{apiKey && (
									<span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">Pixabay API 设置</TooltipContent>
					</Tooltip>
				</div>

				{/* Search bar + Filters */}
				{viewTab === "browse" && (
					<div className="flex items-center gap-2">
						<div className="relative flex-1">
							<HugeiconsIcon
								icon={Search01Icon}
								className="text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5"
							/>
							<Input
								size="sm"
								placeholder="搜索 Pixabay 海量高清素材 (支持中英文)..."
								value={searchQuery}
								onChange={(e) => handleSearchChange(e.target.value)}
								showClearIcon
								onClear={() => {
									setSearchQuery("");
									fetchStockItems(true);
								}}
								className="pl-8 text-xs h-8"
							/>
						</div>

						{/* Orientation & Order Filter Menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant={orientation !== "all" || order !== "popular" ? "secondary" : "outline"}
									size="icon"
									className="size-8 shrink-0"
								>
									<HugeiconsIcon icon={FilterMailIcon} className="size-3.5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-44 text-xs">
								<DropdownMenuLabel>方向筛选</DropdownMenuLabel>
								<DropdownMenuCheckboxItem
									checked={orientation === "all"}
									onCheckedChange={() => setOrientation("all")}
								>
									全部方向
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={orientation === "horizontal"}
									onCheckedChange={() => setOrientation("horizontal")}
								>
									横屏 (16:9)
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={orientation === "vertical"}
									onCheckedChange={() => setOrientation("vertical")}
								>
									竖屏 (9:16)
								</DropdownMenuCheckboxItem>

								<DropdownMenuSeparator />
								<DropdownMenuLabel>排序规则</DropdownMenuLabel>
								<DropdownMenuCheckboxItem
									checked={order === "popular"}
									onCheckedChange={() => setOrder("popular")}
								>
									最受欢迎
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={order === "latest"}
									onCheckedChange={() => setOrder("latest")}
								>
									最新发布
								</DropdownMenuCheckboxItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}

				{/* Category Carousel Pills */}
				{viewTab === "browse" && (
					<div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none scrollbar-hidden">
						{STOCK_CATEGORIES.map((cat) => (
							<button
								key={cat.key}
								type="button"
								onClick={() => setCategory(cat.key)}
								className={cn(
									"shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
									category === cat.key
										? "bg-primary text-primary-foreground"
										: "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
								)}
							>
								{cat.labelZh}
							</button>
						))}
					</div>
				)}
			</div>

			{/* Content Area */}
			<div className="relative flex-1 min-h-0">
				<ScrollArea
					ref={scrollAreaRef}
					className="h-full px-3 py-2"
					onScrollCapture={handleScroll}
				>
					{isLoading && items.length === 0 ? (
						<div className="grid grid-cols-2 gap-2 pt-2">
							{Array.from({ length: 8 }).map((_, i) => (
								<div
									key={i}
									className="aspect-video bg-muted/40 animate-pulse rounded-md"
								/>
							))}
						</div>
					) : displayedItems.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-center gap-3">
							<div className="size-12 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
								<HugeiconsIcon icon={viewTab === "saved" ? FavouriteIcon : Search01Icon} className="size-6" />
							</div>
							<p className="text-sm font-medium">
								{viewTab === "saved" ? "暂无收藏素材" : "未找到相关素材"}
							</p>
							<p className="text-xs text-muted-foreground max-w-xs">
								{viewTab === "saved"
									? "点击素材卡片上的爱心图标，即可保存到此列表"
									: "尝试更换关键词或分类筛选"}
							</p>
						</div>
					) : (
						<div className="grid grid-cols-2 gap-2 pb-6">
							{displayedItems.map((item) => (
								<StockCard
									key={item.id}
									item={item}
									onPreview={() => setPreviewItem(item)}
								/>
							))}
						</div>
					)}

					{isLoadingMore && (
						<div className="py-4 text-center text-xs text-muted-foreground">
							正在加载更多素材...
						</div>
					)}
				</ScrollArea>
			</div>

			{/* API Key Configuration Dialog */}
			<Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>配置 Pixabay API Key</DialogTitle>
						<DialogDescription>
							Pixabay 提供数百万免费商用的高清视频、照片和插画素材。
						</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col gap-3 py-2">
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-foreground">API Key</label>
							<Input
								placeholder="例如: 12345678-abcdef1234567890abcdef123"
								value={tempKey}
								onChange={(e) => setTempKey(e.target.value)}
							/>
						</div>

						<div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground flex flex-col gap-1.5">
							<p className="font-medium text-foreground">如何获取免费 API Key？</p>
							<ol className="list-decimal pl-4 space-y-1">
								<li>前往 <a href="https://pixabay.com/zh/accounts/register/" target="_blank" rel="noreferrer" className="text-primary underline">Pixabay 官网</a> 注册免费账号。</li>
								<li>访问 <a href="https://pixabay.com/api/docs/" target="_blank" rel="noreferrer" className="text-primary underline">Pixabay API 文档页</a>。</li>
								<li>在文档正文的绿底参数示例中直接复制您的专用 API Key 即可。</li>
							</ol>
						</div>
					</div>

					<DialogFooter className="flex justify-between sm:justify-between items-center">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setApiKey("");
								setTempKey("");
								setIsSettingsOpen(false);
								toast.success("已清除 API Key，恢复内置素材");
							}}
						>
							清除
						</Button>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(false)}>
								取消
							</Button>
							<Button
								size="sm"
								onClick={() => {
									setApiKey(tempKey.trim());
									setIsSettingsOpen(false);
									toast.success("Pixabay API Key 保存成功");
								}}
							>
								保存并生效
							</Button>
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Detail Preview Modal */}
			{previewItem && (
				<StockDetailDialog
					item={previewItem}
					isOpen={!!previewItem}
					onClose={() => setPreviewItem(null)}
				/>
			)}
		</div>
	);
}

function StockCard({
	item,
	onPreview,
}: {
	item: StockItem;
	onPreview: () => void;
}) {
	const {
		toggleSaveItem,
		isItemSaved,
		addStockToTimeline,
		importStockToProject,
		downloadingIds,
	} = useStockStore();

	const [isHovered, setIsHovered] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const isSaved = isItemSaved(item.id);
	const isDownloading = !!downloadingIds[item.id];

	useEffect(() => {
		if (item.type === "video" && videoRef.current) {
			if (isHovered && item.previewUrl) {
				videoRef.current.currentTime = 0;
				videoRef.current.play().catch(() => {});
			} else {
				videoRef.current.pause();
			}
		}
	}, [isHovered, item.type, item.previewUrl]);

	const formatDuration = (sec?: number) => {
		if (!sec) return "";
		const m = Math.floor(sec / 60);
		const s = Math.floor(sec % 60);
		return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	};

	return (
		<div
			className="group relative rounded-md overflow-hidden bg-muted border border-border/40 hover:border-primary/50 transition-all cursor-pointer aspect-video flex flex-col"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={onPreview}
		>
			{/* Media display */}
			{item.type === "video" ? (
				<>
					{/* Fallback poster image */}
					<Image
						src={item.thumbnailUrl}
						alt={item.title}
						fill
						unoptimized
						className={cn(
							"object-cover transition-opacity duration-200",
							isHovered ? "opacity-0" : "opacity-100",
						)}
					/>
					{/* Video for hover preview */}
					<video
						ref={videoRef}
						src={item.previewUrl}
						muted
						loop
						playsInline
						preload="none"
						className={cn(
							"absolute inset-0 size-full object-cover transition-opacity duration-200",
							isHovered ? "opacity-100" : "opacity-0",
						)}
					/>
				</>
			) : (
				<Image
					src={item.thumbnailUrl}
					alt={item.title}
					fill
					unoptimized
					className="object-cover group-hover:scale-105 transition-transform duration-300"
				/>
			)}

			{/* Badges (Duration, Quality, Type) */}
			<div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10">
				{item.type === "video" && (
					<span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/70 text-white backdrop-blur-xs">
						{item.videoQuality || "HD"}
					</span>
				)}
				{item.subType === "illustration" && (
					<span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-600/80 text-white backdrop-blur-xs">
						插画
					</span>
				)}
				{item.subType === "vector" && (
					<span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-600/80 text-white backdrop-blur-xs">
						矢量
					</span>
				)}
			</div>

			{item.duration && (
				<div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/70 text-white backdrop-blur-xs z-10">
					{formatDuration(item.duration)}
				</div>
			)}

			{/* Hover Overlay Actions */}
			<div
				className={cn(
					"absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 flex flex-col justify-between p-2 transition-opacity z-20",
					isHovered ? "opacity-100" : "opacity-0 pointer-events-none",
				)}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Top right: Favorite button */}
				<div className="flex justify-end">
					<button
						type="button"
						className={cn(
							"size-6 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors",
							isSaved && "text-red-500 bg-white/90",
						)}
						onClick={(e) => {
							e.stopPropagation();
							toggleSaveItem(item);
						}}
					>
						<HugeiconsIcon icon={FavouriteIcon} className={cn("size-3.5", isSaved && "fill-current")} />
					</button>
				</div>

				{/* Bottom: Title & Action buttons */}
				<div className="flex items-center justify-between gap-1">
					<span className="text-[11px] text-white font-medium truncate flex-1 drop-shadow-sm">
						{item.title}
					</span>

					<div className="flex items-center gap-1 shrink-0">
						{/* Import to assets button */}
						<button
							type="button"
							title="导入到项目资产"
							disabled={isDownloading}
							className="size-6 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
							onClick={(e) => {
								e.stopPropagation();
								importStockToProject(item);
							}}
						>
							<HugeiconsIcon icon={Download01Icon} className="size-3.5" />
						</button>

						{/* Add directly to timeline button */}
						<button
							type="button"
							title="添加到时间线"
							disabled={isDownloading}
							className="size-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors shadow-sm"
							onClick={(e) => {
								e.stopPropagation();
								addStockToTimeline(item);
							}}
						>
							<HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function StockDetailDialog({
	item,
	isOpen,
	onClose,
}: {
	item: StockItem;
	isOpen: boolean;
	onClose: () => void;
}) {
	const { addStockToTimeline, importStockToProject, toggleSaveItem, isItemSaved, downloadingIds } =
		useStockStore();
	const isSaved = isItemSaved(item.id);
	const isDownloading = !!downloadingIds[item.id];

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
				{/* Media Preview Container */}
				<div className="relative aspect-video bg-black flex items-center justify-center">
					{item.type === "video" ? (
						<video
							src={item.downloadUrl || item.previewUrl}
							controls
							autoPlay
							playsInline
							className="size-full object-contain"
						/>
					) : (
						<Image
							src={item.downloadUrl || item.previewUrl}
							alt={item.title}
							fill
							unoptimized
							className="object-contain"
						/>
					)}
				</div>

				{/* Detail Meta & Actions */}
				<div className="p-4 flex flex-col gap-4">
					<div className="flex items-start justify-between gap-4">
						<div className="flex flex-col gap-1">
							<h3 className="text-base font-semibold">{item.title}</h3>
							<div className="flex items-center gap-3 text-xs text-muted-foreground">
								<span>作者: {item.author}</span>
								<span>•</span>
								<span>分辨率: {item.width} × {item.height}</span>
								{item.duration && (
									<>
										<span>•</span>
										<span>时长: {item.duration}s</span>
									</>
								)}
								<span>•</span>
								<span className="text-emerald-500 font-medium">Pixabay 免费商用授权</span>
							</div>
						</div>

						<Button
							variant="outline"
							size="icon"
							className={cn(isSaved && "text-red-500 border-red-200")}
							onClick={() => toggleSaveItem(item)}
						>
							<HugeiconsIcon icon={FavouriteIcon} className={cn("size-4", isSaved && "fill-current")} />
						</Button>
					</div>

					{/* Tags */}
					{item.tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{item.tags.map((tag) => (
								<span
									key={tag}
									className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
								>
									#{tag}
								</span>
							))}
						</div>
					)}

					<DialogFooter className="flex items-center justify-between sm:justify-between pt-2 border-t">
						{item.pageUrl ? (
							<a
								href={item.pageUrl}
								target="_blank"
								rel="noreferrer"
								className="text-xs text-muted-foreground hover:text-foreground underline flex items-center gap-1"
							>
								在 Pixabay 官网查看
							</a>
						) : (
							<span />
						)}

						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={isDownloading}
								onClick={async () => {
									const success = await importStockToProject(item);
									if (success) onClose();
								}}
							>
								<HugeiconsIcon icon={Download01Icon} className="size-4 mr-1.5" />
								导入到项目资产
							</Button>
							<Button
								size="sm"
								disabled={isDownloading}
								onClick={async () => {
									const success = await addStockToTimeline(item);
									if (success) onClose();
								}}
							>
								<HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-1.5" />
								插入到时间线
							</Button>
						</div>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}
