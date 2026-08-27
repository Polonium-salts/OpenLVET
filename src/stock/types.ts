export type StockMediaType = "all" | "video" | "image" | "audio";
export type StockSortKey = "name" | "date" | "size" | "duration";
export type StockSortOrder = "asc" | "desc";

export interface StockItem {
	id: string;
	name: string;
	type: "video" | "image" | "audio";
	tags: string[];
	file: File;
	url: string;
	thumbnailUrl?: string;
	duration?: number; // seconds
	width?: number;
	height?: number;
	fps?: number;
	hasAudio?: boolean;
	size: number;
	isFavorite?: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface StockMetadata {
	id: string;
	name: string;
	type: "video" | "image" | "audio";
	tags: string[];
	thumbnailUrl?: string;
	duration?: number;
	width?: number;
	height?: number;
	fps?: number;
	hasAudio?: boolean;
	size: number;
	isFavorite?: boolean;
	createdAt: string;
	updatedAt: string;
}
