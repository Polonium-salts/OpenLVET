import { BaseNode, type AnyBaseNode } from "./base-node";
import type { ParamValues } from "@/params";
import { getTransitionDefinition } from "@/transitions/definitions";

export interface TransitionNodeParams {
	fromNode: AnyBaseNode;
	toNode: AnyBaseNode;
	transitionType: string;
	timeOffset: number;
	duration: number;
	params?: ParamValues;
}

export interface ResolvedTransitionNodeState {
	progress: number;
	glsl: string;
	fromNode: AnyBaseNode;
	toNode: AnyBaseNode;
}

export class TransitionNode extends BaseNode<
	TransitionNodeParams,
	ResolvedTransitionNodeState
> {
	constructor(params: TransitionNodeParams) {
		super(params);
		this.children = [params.fromNode, params.toNode];
	}

	resolve({ time }: { time: number }): ResolvedTransitionNodeState | null {
		const { timeOffset, duration, transitionType, fromNode, toNode } =
			this.params;

		if (duration <= 0) return null;

		const progress = Math.max(0, Math.min(1, (time - timeOffset) / duration));
		const def = getTransitionDefinition(transitionType);
		const glsl =
			def?.glsl ??
			`
vec4 transition (vec2 uv) {
  return mix(getFromColor(uv), getToColor(uv), progress);
}
`;

		return {
			progress,
			glsl,
			fromNode,
			toNode,
		};
	}
}
