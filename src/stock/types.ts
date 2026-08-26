export type StockMediaType = "all" | "video" | "photo" | "illustration" | "vector";

export type StockOrientation = "all" | "horizontal" | "vertical";

export type StockSortOrder = "popular" | "latest";

export interface StockItem {
	id: number | string;
	type: "video" | "image";
	subType: "video" | "photo" | "illustration" | "vector";
	title: string;
	tags: string[];
	duration?: number; // duration in seconds for video
	previewUrl: string;
	downloadUrl: string;
	thumbnailUrl: string;
	width: number;
	height: number;
	aspectRatio: number;
	author: string;
	authorAvatar?: string;
	views?: number;
	downloads?: number;
	likes?: number;
	pageUrl?: string;
	videoQuality?: "4K" | "HD" | "SD";
}

export interface StockSearchResponse {
	total: number;
	totalHits: number;
	hits: StockItem[];
	page: number;
	pageSize: number;
	hasMore: boolean;
}

export interface SavedStockItem extends StockItem {
	savedAt: string;
}
