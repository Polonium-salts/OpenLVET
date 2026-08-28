import type { ParamDefinition, ParamValues } from "@/params";
import type { MediaTime } from "@/wasm";

export type TransitionCategory =
	| "basic"
	| "motion"
	| "shapes"
	| "creative"
	| "3d"
	| "blur";

export interface TransitionDefinition {
	id: string;
	name: string;
	category: TransitionCategory;
	keywords: string[];
	glsl: string;
	defaultParams?: ParamValues;
	params?: ParamDefinition[];
	author?: string;
	license?: string;
}

export interface TrackTransition {
	id: string;
	type: string; // matches TransitionDefinition.id
	duration: MediaTime; // in ticks (default: 1 second = 1,000,000)
	fromElementId: string;
	toElementId: string;
	params?: ParamValues;
}
