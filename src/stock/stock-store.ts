import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
	StockItem,
	StockMediaType,
	StockSortKey,
	StockSortOrder,
} from "./types";
import { stockStorage } from "./stock-storage";
import { toast } from "sonner";
import { EditorCore } from "@/core";
import { processMediaAssets } from "@/media/processing";
import { buildElementFromMedia } from "@/timeline/element-utils";
import { generateUUID } from "@/utils/id";
import { mediaTimeFromSeconds } from "@/wasm";
import { DEFAULT_NEW_ELEMENT_DURATION } from "@/timeline/creation";

interface StockStoreState {
	items: StockItem[];
	mediaType: StockMediaType;
	searchQuery: string;
	sortKey: StockSortKey;
	sortOrder: StockSortOrder;
	viewMode: "grid" | "list";
	isLoading: boolean;
	isImporting: boolean;
	importProgress: number;
	previewItem: StockItem | null;
	selectedItemIds: string[];

	setSearchQuery: (query: string) => void;
	setMediaType: (type: StockMediaType) => void;
	setSort: (key: StockSortKey, order?: StockSortOrder) => void;
	setViewMode: (mode: "grid" | "list") => void;
	setPreviewItem: (item: StockItem | null) => void;
	setSelectedItems: (ids: string[]) => void;
	toggleSelectItem: (id: string) => void;

	loadStockLibrary: () => Promise<void>;
	importFiles: (files: FileList | File[]) => Promise<void>;
	deleteItem: (id: string) => Promise<void>;
	deleteSelectedItems: () => Promise<void>;
	renameItem: (id: string, newName: string) => Promise<void>;
	toggleFavorite: (id: string) => Promise<void>;

	importStockToProject: (item: StockItem) => Promise<boolean>;
	addStockToTimeline: (item: StockItem) => Promise<boolean>;
	getItem: (id: string) => StockItem | undefined;
}

export const useStockStore = create<StockStoreState>()(
	persist(
		(set, get) => ({
			items: [],
			mediaType: "all",
			searchQuery: "",
			sortKey: "date",
			sortOrder: "desc",
			viewMode: "grid",
			isLoading: false,
			isImporting: false,
			importProgress: 0,
			previewItem: null,
			selectedItemIds: [],

			setSearchQuery: (query) => set({ searchQuery: query }),
			setMediaType: (type) => set({ mediaType: type }),
			setSort: (key, order) => {
				const currentOrder = get().sortOrder;
				const newOrder = order ?? (get().sortKey === key ? (currentOrder === "asc" ? "desc" : "asc") : "desc");
				set({ sortKey: key, sortOrder: newOrder });
			},
			setViewMode: (mode) => set({ viewMode: mode }),
			setPreviewItem: (item) => set({ previewItem: item }),
			setSelectedItems: (ids) => set({ selectedItemIds: ids }),
			toggleSelectItem: (id) => {
				const { selectedItemIds } = get();
				if (selectedItemIds.includes(id)) {
					set({ selectedItemIds: selectedItemIds.filter((item) => item !== id) });
				} else {
					set({ selectedItemIds: [...selectedItemIds, id] });
				}
			},

			loadStockLibrary: async () => {
				set({ isLoading: true });
				try {
					const items = await stockStorage.loadAllStockItems();
					set({ items, isLoading: false });
				} catch (error) {
					console.error("Failed to load stock library:", error);
					set({ isLoading: false });
				}
			},

			importFiles: async (files) => {
				const fileArray = Array.from(files);
				if (fileArray.length === 0) return;

				set({ isImporting: true, importProgress: 0 });
				const toastId = toast.loading(`正在导入 ${fileArray.length} 个素材到统一素材库...`);

				try {
					const processedAssets = await processMediaAssets({
						files: fileArray,
						onProgress: ({ progress }) => {
							set({ importProgress: progress });
						},
					});

					if (processedAssets.length === 0) {
						toast.error("没有可导入的有效媒体素材", { id: toastId });
						set({ isImporting: false, importProgress: 0 });
						return;
					}

					const newStockItems: StockItem[] = [];

					for (const asset of processedAssets) {
						const id = generateUUID();
						const now = new Date().toISOString();
						const stockItem: StockItem = {
							id,
							name: asset.name,
							type: asset.type,
							tags: [],
							file: asset.file,
							url: asset.url || URL.createObjectURL(asset.file),
							thumbnailUrl: asset.thumbnailUrl,
							duration: asset.duration,
							width: asset.width,
							height: asset.height,
							fps: asset.fps,
							hasAudio: asset.hasAudio,
							size: asset.file.size,
							isFavorite: false,
							createdAt: now,
							updatedAt: now,
						};

						await stockStorage.saveStockItem(stockItem);
						newStockItems.push(stockItem);
					}

					set((prev) => ({
						items: [...newStockItems, ...prev.items],
						isImporting: false,
						importProgress: 0,
					}));

					toast.success(`成功导入 ${newStockItems.length} 个素材至素材库`, { id: toastId });
				} catch (error) {
					console.error("Failed to import stock files:", error);
					toast.error("导入素材失败", { id: toastId });
					set({ isImporting: false, importProgress: 0 });
				}
			},

			deleteItem: async (id) => {
				const item = get().items.find((i) => i.id === id);
				if (!item) return;

				try {
					await stockStorage.deleteStockItem(id);
					if (item.url) {
						URL.revokeObjectURL(item.url);
					}
					set((prev) => ({
						items: prev.items.filter((i) => i.id !== id),
						selectedItemIds: prev.selectedItemIds.filter((itemId) => itemId !== id),
						previewItem: prev.previewItem?.id === id ? null : prev.previewItem,
					}));
					toast.success(`已删除素材: ${item.name}`);
				} catch (error) {
					console.error("Failed to delete stock item:", error);
					toast.error("删除素材失败");
				}
			},

			deleteSelectedItems: async () => {
				const { selectedItemIds, items } = get();
				if (selectedItemIds.length === 0) return;

				const count = selectedItemIds.length;
				try {
					for (const id of selectedItemIds) {
						const item = items.find((i) => i.id === id);
						await stockStorage.deleteStockItem(id);
						if (item?.url) {
							URL.revokeObjectURL(item.url);
						}
					}
					set((prev) => ({
						items: prev.items.filter((i) => !selectedItemIds.includes(i.id)),
						selectedItemIds: [],
						previewItem: selectedItemIds.includes(prev.previewItem?.id || "") ? null : prev.previewItem,
					}));
					toast.success(`已批量删除 ${count} 个素材`);
				} catch (error) {
					console.error("Failed to batch delete stock items:", error);
					toast.error("批量删除素材失败");
				}
			},

			renameItem: async (id, newName) => {
				const trimmed = newName.trim();
				if (!trimmed) return;

				try {
					await stockStorage.updateStockMetadata(id, { name: trimmed });
					set((prev) => ({
						items: prev.items.map((i) => (i.id === id ? { ...i, name: trimmed, updatedAt: new Date().toISOString() } : i)),
						previewItem: prev.previewItem?.id === id ? { ...prev.previewItem, name: trimmed } : prev.previewItem,
					}));
					toast.success("素材已重命名");
				} catch (error) {
					console.error("Failed to rename stock item:", error);
					toast.error("重命名失败");
				}
			},

			toggleFavorite: async (id) => {
				const item = get().items.find((i) => i.id === id);
				if (!item) return;

				const nextFav = !item.isFavorite;
				try {
					await stockStorage.updateStockMetadata(id, { isFavorite: nextFav });
					set((prev) => ({
						items: prev.items.map((i) => (i.id === id ? { ...i, isFavorite: nextFav } : i)),
						previewItem: prev.previewItem?.id === id ? { ...prev.previewItem, isFavorite: nextFav } : prev.previewItem,
					}));
					toast.success(nextFav ? "已添加到收藏" : "已从收藏中移除");
				} catch (error) {
					console.error("Failed to toggle favorite:", error);
				}
			},

			importStockToProject: async (item) => {
				const editor = EditorCore.getInstance();
				const activeProject = editor.project.getActive();

				if (!activeProject) {
					toast.error("当前没有打开的项目");
					return false;
				}

				const toastId = toast.loading(`正在将 \"${item.name}\" 导入到项目资产...`);
				try {
					const existingAssets = editor.media.getAssets();
					const existing = existingAssets.find((a) => a.name === item.name && a.file?.size === item.size);
					if (existing) {
						toast.info(`素材 \"${item.name}\" 已在当前项目资产中`, { id: toastId });
						return true;
					}

					await editor.media.addMediaAsset({
						projectId: activeProject.metadata.id,
						asset: {
							name: item.name,
							type: item.type,
							file: item.file,
							url: item.url,
							thumbnailUrl: item.thumbnailUrl,
							duration: item.duration,
							width: item.width,
							height: item.height,
							fps: item.fps,
							hasAudio: item.hasAudio,
						},
					});

					toast.success(`素材 \"${item.name}\" 已添加到当前工程`, { id: toastId });
					return true;
				} catch (error) {
					console.error("Failed to import stock to project:", error);
					toast.error("导入到项目失败", { id: toastId });
					return false;
				}
			},

			addStockToTimeline: async (item) => {
				const editor = EditorCore.getInstance();
				const activeProject = editor.project.getActive();

				if (!activeProject) {
					toast.error("当前没有打开的项目");
					return false;
				}

				const toastId = toast.loading(`正在插入素材: ${item.name}...`);
				try {
					let asset = editor.media.getAssets().find((a) => a.name === item.name && a.file?.size === item.size);

					if (!asset) {
						const created = await editor.media.addMediaAsset({
							projectId: activeProject.metadata.id,
							asset: {
								name: item.name,
								type: item.type,
								file: item.file,
								url: item.url,
								thumbnailUrl: item.thumbnailUrl,
								duration: item.duration,
								width: item.width,
								height: item.height,
								fps: item.fps,
								hasAudio: item.hasAudio,
							},
						});
						if (!created) {
							toast.error("添加素材失败", { id: toastId });
							return false;
						}
						asset = created;
					}

					const currentTime = editor.playback.getCurrentTime();
					const duration =
						item.duration != null
							? mediaTimeFromSeconds({ seconds: item.duration })
							: DEFAULT_NEW_ELEMENT_DURATION;

					const element = buildElementFromMedia({
						mediaId: asset.id,
						mediaType: asset.type,
						name: asset.name,
						duration,
						startTime: currentTime,
					});

					editor.timeline.insertElement({
						placement: { mode: "auto", trackType: asset.type === "audio" ? "audio" : "video" },
						element,
					});

					toast.success(`已插入时间线: ${item.name}`, { id: toastId });
					return true;
				} catch (error) {
					console.error("Failed to add stock to timeline:", error);
					toast.error("插入时间线失败", { id: toastId });
					return false;
				}
			},

			getItem: (id) => {
				return get().items.find((i) => i.id === id);
			},
		}),
		{
			name: "opencut-stock-preferences",
			partialize: (state) => ({
				mediaType: state.mediaType,
				sortKey: state.sortKey,
				sortOrder: state.sortOrder,
				viewMode: state.viewMode,
			}),
		},
	),
);
