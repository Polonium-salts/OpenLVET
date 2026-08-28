import type { SceneTracks, TimelineTrack, TimelineElement, TrackTransition } from "@/timeline";
import type { MediaAsset } from "@/media/types";
import { RootNode } from "./nodes/root-node";
import { VideoNode } from "./nodes/video-node";
import { ImageNode } from "./nodes/image-node";
import { TextNode } from "./nodes/text-node";
import { StickerNode } from "./nodes/sticker-node";
import { GraphicNode } from "./nodes/graphic-node";
import { ColorNode } from "./nodes/color-node";
import { BlurBackgroundNode } from "./nodes/blur-background-node";
import { EffectLayerNode } from "./nodes/effect-layer-node";
import { TransitionNode } from "./nodes/transition-node";
import type { AnyBaseNode } from "./nodes/base-node";
import type { TBackground, TCanvasSize } from "@/project/types";
import { DEFAULT_BACKGROUND_BLUR_INTENSITY } from "@/background/blur";
import {
	buildTransformFromParams,
	readBlendModeFromParams,
	readOpacityFromParams,
} from "@/rendering";

const PREVIEW_MAX_IMAGE_SIZE = 2048;

function getVisibleSortedElements({ track }: { track: TimelineTrack }) {
	return track.elements
		.filter((element) => !("hidden" in element && element.hidden))
		.slice()
		.sort((a, b) => {
			if (a.startTime !== b.startTime) return a.startTime - b.startTime;
			return a.id.localeCompare(b.id);
		});
}

function buildTrackNodes({
	tracks,
	mediaMap,
	canvasSize,
	isPreview,
}: {
	tracks: TimelineTrack[];
	mediaMap: Map<string, MediaAsset>;
	canvasSize: TCanvasSize;
	isPreview?: boolean;
}): AnyBaseNode[] {
	const nodes: AnyBaseNode[] = [];

	const buildVisualNode = (element: TimelineElement): AnyBaseNode | null => {
		if (element.type === "video" || element.type === "image") {
			const mediaAsset = mediaMap.get(element.mediaId);
			if (!mediaAsset?.file || !mediaAsset?.url) {
				return null;
			}

			if (element.type === "video" && mediaAsset.type === "video") {
				return new VideoNode({
					mediaId: mediaAsset.id,
					url: mediaAsset.url,
					file: mediaAsset.file,
					duration: element.duration,
					timeOffset: element.startTime,
					trimStart: element.trimStart,
					trimEnd: element.trimEnd,
					retime: element.retime,
					transform: buildTransformFromParams({ params: element.params }),
					animations: element.animations,
					opacity: readOpacityFromParams({ params: element.params }),
					blendMode: readBlendModeFromParams({ params: element.params }),
					effects: element.effects ?? [],
					masks: element.masks ?? [],
				});
			}
			if (element.type === "image" && mediaAsset.type === "image") {
				return new ImageNode({
					url: mediaAsset.url,
					duration: element.duration,
					timeOffset: element.startTime,
					trimStart: element.trimStart,
					trimEnd: element.trimEnd,
					transform: buildTransformFromParams({ params: element.params }),
					animations: element.animations,
					opacity: readOpacityFromParams({ params: element.params }),
					blendMode: readBlendModeFromParams({ params: element.params }),
					effects: element.effects ?? [],
					masks: element.masks ?? [],
					...(isPreview && {
						maxSourceSize: PREVIEW_MAX_IMAGE_SIZE,
					}),
				});
			}
		}
		return null;
	};

	for (const track of tracks) {
		const elements = getVisibleSortedElements({ track });

		if (
			track.type === "video" &&
			track.transitions &&
			track.transitions.length > 0
		) {
			const transitionMap = new Map<string, TrackTransition>();
			for (const t of track.transitions) {
				transitionMap.set(t.fromElementId, t);
			}

			const processedIds = new Set<string>();

			for (let i = 0; i < elements.length; i++) {
				const element = elements[i];
				if (processedIds.has(element.id)) continue;

				const transition = transitionMap.get(element.id);
				const nextElement = i + 1 < elements.length ? elements[i + 1] : null;

				if (
					transition &&
					nextElement &&
					transition.toElementId === nextElement.id
				) {
					const nodeFrom = buildVisualNode(element);
					const nodeTo = buildVisualNode(nextElement);

					if (nodeFrom && nodeTo) {
						const cutTime = element.startTime + element.duration;
						const duration = transition.duration;
						const timeOffset = cutTime - duration / 2;

						nodes.push(
							new TransitionNode({
								fromNode: nodeFrom,
								toNode: nodeTo,
								transitionType: transition.type,
								timeOffset,
								duration,
								params: transition.params,
							}),
						);
						processedIds.add(element.id);
						processedIds.add(nextElement.id);
						continue;
					}
				}

				const singleNode = buildVisualNode(element);
				if (singleNode) {
					nodes.push(singleNode);
				}
				processedIds.add(element.id);
			}
			continue;
		}

		for (const element of elements) {
			if (element.type === "effect") {
				nodes.push(
					new EffectLayerNode({
						effectType: element.effectType,
						effectParams: element.params,
						timeOffset: element.startTime,
						duration: element.duration,
					}),
				);
				continue;
			}

			const visualNode = buildVisualNode(element);
			if (visualNode) {
				nodes.push(visualNode);
				continue;
			}

			if (element.type === "text") {
				nodes.push(
					new TextNode({
						...element,
						transform: buildTransformFromParams({ params: element.params }),
						opacity: readOpacityFromParams({ params: element.params }),
						blendMode: readBlendModeFromParams({ params: element.params }),
						canvasCenter: { x: canvasSize.width / 2, y: canvasSize.height / 2 },
						canvasHeight: canvasSize.height,
						textBaseline: "middle",
						effects: element.effects ?? [],
					}),
				);
			}

			if (element.type === "sticker") {
				nodes.push(
					new StickerNode({
						stickerId: element.stickerId,
						intrinsicWidth: element.intrinsicWidth,
						intrinsicHeight: element.intrinsicHeight,
						duration: element.duration,
						timeOffset: element.startTime,
						trimStart: element.trimStart,
						trimEnd: element.trimEnd,
						transform: buildTransformFromParams({ params: element.params }),
						animations: element.animations,
						opacity: readOpacityFromParams({ params: element.params }),
						blendMode: readBlendModeFromParams({ params: element.params }),
						effects: element.effects ?? [],
					}),
				);
			}

			if (element.type === "graphic") {
				nodes.push(
					new GraphicNode({
						definitionId: element.definitionId,
						params: element.params,
						duration: element.duration,
						timeOffset: element.startTime,
						trimStart: element.trimStart,
						trimEnd: element.trimEnd,
						transform: buildTransformFromParams({ params: element.params }),
						animations: element.animations,
						opacity: readOpacityFromParams({ params: element.params }),
						blendMode: readBlendModeFromParams({ params: element.params }),
						effects: element.effects ?? [],
						masks: element.masks ?? [],
					}),
				);
			}
		}
	}

	return nodes;
}

function buildBlurBackgroundNodes({
	track,
	mediaMap,
	blurIntensity,
}: {
	track: TimelineTrack | undefined;
	mediaMap: Map<string, MediaAsset>;
	blurIntensity: number;
}): AnyBaseNode[] {
	if (!track) {
		return [];
	}

	const nodes: AnyBaseNode[] = [];
	const elements = getVisibleSortedElements({ track });

	for (const element of elements) {
		if (element.type !== "video" && element.type !== "image") {
			continue;
		}

		const mediaAsset = mediaMap.get(element.mediaId);
		if (
			!mediaAsset?.file ||
			!mediaAsset?.url ||
			(mediaAsset.type !== "video" && mediaAsset.type !== "image")
		) {
			continue;
		}

		nodes.push(
			new BlurBackgroundNode({
				mediaId: mediaAsset.id,
				url: mediaAsset.url,
				file: mediaAsset.file,
				mediaType: mediaAsset.type,
				duration: element.duration,
				timeOffset: element.startTime,
				trimStart: element.trimStart,
				trimEnd: element.trimEnd,
				retime: element.type === "video" ? element.retime : undefined,
				blurIntensity,
			}),
		);
	}

	return nodes;
}

export type BuildSceneParams = {
	canvasSize: TCanvasSize;
	tracks: SceneTracks;
	mediaAssets: MediaAsset[];
	duration: number;
	background: TBackground;
	isPreview?: boolean;
};

export function buildScene({
	canvasSize,
	tracks,
	mediaAssets,
	duration,
	background,
	isPreview,
}: BuildSceneParams) {
	const rootNode = new RootNode({ duration });
	const mediaMap = new Map(mediaAssets.map((m) => [m.id, m]));

	const visibleTracks = [
		...tracks.overlay.filter((track) => !("hidden" in track && track.hidden)),
		...(!tracks.main.hidden ? [tracks.main] : []),
	];
	const orderedTracksBottomToTop = visibleTracks.slice().reverse();
	const mainTrack = tracks.main.hidden ? undefined : tracks.main;

	const allNodes = buildTrackNodes({
		tracks: orderedTracksBottomToTop,
		mediaMap,
		canvasSize,
		isPreview,
	});

	if (background.type === "blur") {
		const blurNodes = buildBlurBackgroundNodes({
			track: mainTrack,
			mediaMap,
			blurIntensity:
				background.blurIntensity ?? DEFAULT_BACKGROUND_BLUR_INTENSITY,
		});
		for (const node of blurNodes) {
			rootNode.add(node);
		}
	} else if (
		background.type === "color" &&
		background.color !== "transparent"
	) {
		rootNode.add(new ColorNode({ color: background.color }));
	}

	for (const node of allNodes) {
		rootNode.add(node);
	}

	return rootNode;
}
