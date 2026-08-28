export type TextAnimationCategory = "in" | "out" | "loop";

export interface TextAnimationPreset {
	id: string;
	name: string;
	category: TextAnimationCategory;
	icon: string;
	description: string;
	defaultDuration: number; // in seconds
	easing?: string;
	previewKeyframes?: string; // CSS animation keyframes for panel hover preview
}

export interface TextAnimationItemConfig {
	type: string;
	duration: number; // in seconds
	easing?: string;
	speed?: number; // for loop animations
}

export interface TextAnimationState {
	in?: TextAnimationItemConfig;
	out?: TextAnimationItemConfig;
	loop?: TextAnimationItemConfig;
}

export interface TextAnimationEvaluationResult {
	offsetX: number;
	offsetY: number;
	scaleX: number;
	scaleY: number;
	rotate: number;
	opacity: number;
	visibleTextLength?: number;
	charOffsets?: Array<{ x: number; y: number; opacity: number; scale: number }>;
}
