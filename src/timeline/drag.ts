import type { MaskableElement, VisualElement } from "./types";
import type { ParamValues } from "@/params";

interface BaseDragData {
	id: string;
	name: string;
}

export interface MediaDragData extends BaseDragData {
	type: "media";
	mediaType: "image" | "video" | "audio";
	targetElementTypes?: readonly MaskableElement["type"][];
}

export interface TextDragData extends BaseDragData {
	type: "text";
	content: string;
	params?: Partial<ParamValues>;
}

export interface StickerDragData extends BaseDragData {
	type: "sticker";
	stickerId: string;
}

export interface GraphicDragData extends BaseDragData {
	type: "graphic";
	definitionId: string;
	params: Partial<ParamValues>;
}

export interface StockDragData extends BaseDragData {
	type: "stock";
	stockId: string;
	mediaType: "image" | "video" | "audio";
	targetElementTypes?: readonly MaskableElement["type"][];
}

export interface EffectDragData extends BaseDragData {
	type: "effect";
	effectType: string;
	targetElementTypes: readonly VisualElement["type"][];
}

export interface TransitionDragData extends BaseDragData {
	type: "transition";
	transitionType: string;
}

export type TimelineDragData =
	| MediaDragData
	| StockDragData
	| TextDragData
	| StickerDragData
	| GraphicDragData
	| EffectDragData
	| TransitionDragData;
