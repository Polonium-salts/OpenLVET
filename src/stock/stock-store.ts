import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
	SavedStockItem,
	StockItem,
	StockMediaType,
	StockOrientation,
	StockSortOrder,
} from "./types";
import { toast } from "sonner";
import { EditorCore } from "@/core";
import { processMediaAssets } from "@/media/processing";
import { buildElementFromMedia } from "@/timeline/element-utils";

// In-memory query cache for instant 0ms responses
const stockQueryCache = new Map<string, { hits: StockItem[]; hasMore: boolean }>();
let activeFetchController: AbortController | null = null;

interface StockStoreState {
	searchQuery: string;
	mediaType: StockMediaType;
	category: string;
	orientation: StockOrientation;
	order: StockSortOrder;
	page: number;
	hasMore: boolean;
	isLoading: boolean;
	isLoadingMore: boolean;
	isDemoFallback: boolean;
	items: StockItem[];
	savedItems: SavedStockItem[];
	viewTab: "browse" | "saved";
	apiKey: string;
	previewItem: StockItem | null;
	downloadingIds: Record<string | number, boolean>;

	setSearchQuery: (query: string) => void;
	setMediaType: (type: StockMediaType) => void;
	setCategory: (category: string) => void;
	setOrientation: (orientation: StockOrientation) => void;
	setOrder: (order: StockSortOrder) => void;
	setViewTab: (tab: "browse" | "saved") => void;
	setApiKey: (key: string) => void;
	setPreviewItem: (item: StockItem | null) => void;

	fetchStockItems: (resetPage?: boolean) => Promise<void>;
	loadMore: () => Promise<void>;
	toggleSaveItem: (item: StockItem) => void;
	isItemSaved: (id: number | string) => boolean;

	downloadStockBlob: (item: StockItem) => Promise<File | null>;
	importStockToProject: (item: StockItem) => Promise<boolean>;
	addStockToTimeline: (item: StockItem) => Promise<boolean>;
}

export const useStockStore = create<StockStoreState>()(
	persist(
		(set, get) => ({
			searchQuery: "",
			mediaType: "all",
			category: "all",
			orientation: "all",
			order: "popular",
			page: 1,
			hasMore: true,
			isLoading: false,
			isLoadingMore: false,
			isDemoFallback: false,
			items: [],
			savedItems: [],
			viewTab: "browse",
			apiKey: "",
			previewItem: null,
			downloadingIds: {},

			setSearchQuery: (query) => set({ searchQuery: query }),
			setMediaType: (type) => {
				set({ mediaType: type });
				get().fetchStockItems(true);
			},
			setCategory: (category) => {
				set({ category });
				get().fetchStockItems(true);
			},
			setOrientation: (orientation) => {
				set({ orientation });
				get().fetchStockItems(true);
			},
			setOrder: (order) => {
				set({ order });
				get().fetchStockItems(true);
			},
			setViewTab: (tab) => set({ viewTab: tab }),
			setApiKey: (key) => {
				set({ apiKey: key });
				stockQueryCache.clear();
				get().fetchStockItems(true);
			},
			setPreviewItem: (item) => set({ previewItem: item }),

			fetchStockItems: async (resetPage = false) => {
				const state = get();
				const targetPage = resetPage ? 1 : state.page;

				// Cancel previous ongoing fetch to avoid race condition and save bandwidth
				if (activeFetchController) {
					activeFetchController.abort();
				}
				activeFetchController = new AbortController();
				const { signal } = activeFetchController;

				// Generate cache key
				const cacheKey = `${state.searchQuery.trim()}:${state.mediaType}:${state.category}:${state.orientation}:${state.order}:${targetPage}:${state.apiKey}`;

				// Check cache for instant response
				if (stockQueryCache.has(cacheKey)) {
					const cached = stockQueryCache.get(cacheKey)!;
					set({
						items: cached.hits,
						hasMore: cached.hasMore,
						isLoading: false,
						page: targetPage,
					});
					return;
				}

				set({ isLoading: true, page: targetPage });

				try {
					const params = new URLSearchParams({
						q: state.searchQuery.trim(),
						media_type: state.mediaType,
						category: state.category,
						orientation: state.orientation,
						order: state.order,
						page: targetPage.toString(),
						per_page: "24",
					});

					if (state.apiKey) {
						params.set("custom_key", state.apiKey);
					}

					const response = await fetch(`/api/stock/pixabay/search?${params.toString()}`, {
						signal,
					});

					if (!response.ok) {
						throw new Error(`Failed to fetch stock: ${response.statusText}`);
					}

					const data = await response.json();
					const hits: StockItem[] = data.hits || [];
					const hasMore = !!data.hasMore;

					// Deduplicate initial hits
					const seen = new Set<string | number>();
					const uniqueHits: StockItem[] = [];
					for (const item of hits) {
						if (!seen.has(item.id)) {
							seen.add(item.id);
							uniqueHits.push(item);
						}
					}

					// Cache result
					stockQueryCache.set(cacheKey, { hits: uniqueHits, hasMore });

					set({
						items: uniqueHits,
						hasMore,
						isDemoFallback: false,
						isLoading: false,
					});
				} catch (error) {
					if (error instanceof Error && error.name === "AbortError") {
						return; // Ignore aborted requests
					}
					console.error("Failed to load stock media:", error);
					set({ isLoading: false });
				}
			},

			loadMore: async () => {
				const state = get();
				if (state.isLoading || state.isLoadingMore || !state.hasMore) return;

				const nextPage = state.page + 1;
				const cacheKey = `${state.searchQuery.trim()}:${state.mediaType}:${state.category}:${state.orientation}:${state.order}:${nextPage}:${state.apiKey}`;

				if (stockQueryCache.has(cacheKey)) {
					const cached = stockQueryCache.get(cacheKey)!;
					set((prev) => {
						const existingIds = new Set(prev.items.map((i) => i.id));
						const newHits = cached.hits.filter((i) => !existingIds.has(i.id));
						return {
							items: [...prev.items, ...newHits],
							page: nextPage,
							hasMore: cached.hasMore,
						};
					});
					return;
				}

				set({ isLoadingMore: true });

				try {
					const params = new URLSearchParams({
						q: state.searchQuery.trim(),
						media_type: state.mediaType,
						category: state.category,
						orientation: state.orientation,
						order: state.order,
						page: nextPage.toString(),
						per_page: "24",
					});

					if (state.apiKey) {
						params.set("custom_key", state.apiKey);
					}

					const response = await fetch(`/api/stock/pixabay/search?${params.toString()}`);
					if (!response.ok) {
						throw new Error(`Failed to fetch more stock: ${response.statusText}`);
					}

					const data = await response.json();
					const hits: StockItem[] = data.hits || [];
					const hasMore = !!data.hasMore;

					// Deduplicate incoming hits
					const seen = new Set<string | number>();
					const uniqueHits: StockItem[] = [];
					for (const item of hits) {
						if (!seen.has(item.id)) {
							seen.add(item.id);
							uniqueHits.push(item);
						}
					}

					stockQueryCache.set(cacheKey, { hits: uniqueHits, hasMore });

					set((prev) => {
						const existingIds = new Set(prev.items.map((i) => i.id));
						const newHits = uniqueHits.filter((i) => !existingIds.has(i.id));
						return {
							items: [...prev.items, ...newHits],
							page: nextPage,
							hasMore,
							isLoadingMore: false,
						};
					});
				} catch (error) {
					console.error("Failed to load more stock media:", error);
					set({ isLoadingMore: false });
				}
			},

			toggleSaveItem: (item) => {
				const { savedItems } = get();
				const exists = savedItems.some((s) => s.id === item.id);

				if (exists) {
					set({
						savedItems: savedItems.filter((s) => s.id !== item.id),
					});
					toast.success("已从素材收藏夹移除");
				} else {
					const newSaved: SavedStockItem = {
						...item,
						savedAt: new Date().toISOString(),
					};
					set({
						savedItems: [newSaved, ...savedItems],
					});
					toast.success("已收藏至素材库");
				}
			},

			isItemSaved: (id) => {
				return get().savedItems.some((s) => s.id === id);
			},

			downloadStockBlob: async (item) => {
				const downloadUrl = item.downloadUrl || item.previewUrl;
				if (!downloadUrl) return null;

				try {
					const proxyUrl = `/api/stock/pixabay/proxy-download?url=${encodeURIComponent(downloadUrl)}`;
					const res = await fetch(proxyUrl);
					if (!res.ok) {
						const directRes = await fetch(downloadUrl);
						if (!directRes.ok) throw new Error("Download failed");
						const blob = await directRes.blob();
						const ext = item.type === "video" ? "mp4" : "jpg";
						return new File([blob], `${item.title.replace(/[^\w\u4e00-\u9fa5]/g, "_")}.${ext}`, {
							type: blob.type || (item.type === "video" ? "video/mp4" : "image/jpeg"),
						});
					}

					const blob = await res.blob();
					const ext = item.type === "video" ? "mp4" : "jpg";
					return new File([blob], `${item.title.replace(/[^\w\u4e00-\u9fa5]/g, "_")}.${ext}`, {
						type: blob.type || (item.type === "video" ? "video/mp4" : "image/jpeg"),
					});
				} catch (error) {
					console.error("Error downloading stock file:", error);
					return null;
				}
			},

			importStockToProject: async (item) => {
				const editor = EditorCore.getInstance();
				const activeProject = editor.project.getActive();

				if (!activeProject) {
					toast.error("当前没有打开的项目");
					return false;
				}

				set((prev) => ({
					downloadingIds: { ...prev.downloadingIds, [item.id]: true },
				}));

				try {
					const toastId = toast.loading(`正在下载并导入素材: ${item.title}...`);
					const file = await get().downloadStockBlob(item);

					if (!file) {
						toast.error("下载素材文件失败", { id: toastId });
						return false;
					}

					const processedAssets = await processMediaAssets({
						files: [file],
					});

					for (const asset of processedAssets) {
						await editor.media.addMediaAsset({
							projectId: activeProject.metadata.id,
							asset,
						});
					}

					toast.success(`素材 "${item.title}" 已添加到资产库`, { id: toastId });
					return true;
				} catch (error) {
					console.error("Failed to import stock to project:", error);
					toast.error("导入素材失败");
					return false;
				} finally {
					set((prev) => {
						const next = { ...prev.downloadingIds };
						delete next[item.id];
						return { downloadingIds: next };
					});
				}
			},

			addStockToTimeline: async (item) => {
				const editor = EditorCore.getInstance();
				const activeProject = editor.project.getActive();

				if (!activeProject) {
					toast.error("当前没有打开的项目");
					return false;
				}

				set((prev) => ({
					downloadingIds: { ...prev.downloadingIds, [item.id]: true },
				}));

				try {
					const toastId = toast.loading(`正在添加素材到时间线: ${item.title}...`);
					const file = await get().downloadStockBlob(item);

					if (!file) {
						toast.error("下载素材文件失败", { id: toastId });
						return false;
					}

					const processedAssets = await processMediaAssets({
						files: [file],
					});

					const asset = processedAssets[0];
					if (!asset) {
						toast.error("处理素材失败", { id: toastId });
						return false;
					}

					// Add to project assets
					await editor.media.addMediaAsset({
						projectId: activeProject.metadata.id,
						asset,
					});

					// Insert to timeline
					const currentTime = editor.playback.getCurrentTime();
					const element = buildElementFromMedia({
						media: asset,
						startTime: currentTime,
					});

					editor.timeline.insertElement({
						placement: { mode: "auto", trackType: "video" },
						element,
					});

					toast.success(`素材已插入时间线`, { id: toastId });
					return true;
				} catch (error) {
					console.error("Failed to add stock to timeline:", error);
					toast.error("添加素材到时间线失败");
					return false;
				} finally {
					set((prev) => {
						const next = { ...prev.downloadingIds };
						delete next[item.id];
						return { downloadingIds: next };
					});
				}
			},
		}),
		{
			name: "opencut-stock-store",
			partialize: (state) => ({
				apiKey: state.apiKey,
				savedItems: state.savedItems,
				mediaType: state.mediaType,
				category: state.category,
				orientation: state.orientation,
				order: state.order,
			}),
		},
	),
);
