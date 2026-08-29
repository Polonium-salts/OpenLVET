import type { ParamDefinition, ParamValues } from "@/params";
import type { MediaTime } from "@/wasm";

export type TransitionCategory =
	| "basic"
	| "motion"
	| "shapes"
	| "creative"
	| "3d"
	| "blur";

export type TransitionSourceType = "builtin" | "plugin" | "custom";

export interface TransitionDefinition {
	id: string;
	name: string;
	category: TransitionCategory | string;
	keywords: string[];
	glsl: string;
	defaultParams?: ParamValues;
	params?: ParamDefinition[];
	author?: string;
	license?: string;
	isPlugin?: boolean;
	sourceType?: TransitionSourceType;
	pluginId?: string;
	pluginName?: string;
}

export interface TrackTransition {
	id: string;
	type: string; // matches TransitionDefinition.id
	duration: MediaTime; // in ticks (default: 1 second = 1,000,000)
	fromElementId: string;
	toElementId: string;
	params?: ParamValues;
}
