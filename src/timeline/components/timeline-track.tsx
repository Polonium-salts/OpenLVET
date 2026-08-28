"use client";

import { useState } from "react";
import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { TimelineElement } from "./timeline-element";
import type { TimelineTrack, TrackTransition } from "@/timeline";
import type { TimelineElement as TimelineElementType } from "@/timeline";
import { TIMELINE_LAYERS } from "./layers";
import type { ElementDragView } from "@/timeline";
import { timelineTimeToSnappedPixels } from "@/timeline";
import { useEditor } from "@/editor/use-editor";
import { useTransitionsStore } from "@/transitions/transitions-store";
import { ArrowRightDoubleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/utils/ui";
import type { MediaTime } from "@/wasm";

interface TimelineTrackContentProps {
	track: TimelineTrack;
	zoomLevel: number;
	dragView: ElementDragView;
	onResizeStart: (params: {
		event: React.MouseEvent;
		element: TimelineElementType;
		track: TimelineTrack;
		side: "left" | "right";
	}) => void;
	onElementMouseDown: (params: {
		event: React.MouseEvent;
		element: TimelineElementType;
		track: TimelineTrack;
	}) => void;
	onElementClick: (params: {
		event: React.MouseEvent;
		element: TimelineElementType;
		track: TimelineTrack;
	}) => void;
	onTrackMouseDown?: (event: React.MouseEvent) => void;
	onTrackMouseUp?: (event: React.MouseEvent) => void;
	shouldIgnoreClick?: () => boolean;
	targetElementId?: string | null;
}

export function TimelineTrackContent({
	track,
	zoomLevel,
	dragView,
	onResizeStart,
	onElementMouseDown,
	onElementClick,
	onTrackMouseDown,
	onTrackMouseUp,
	shouldIgnoreClick,
	targetElementId = null,
}: TimelineTrackContentProps) {
	const { isElementSelected } = useElementSelection();

	return (
		<div className="relative size-full">
			<button
				type="button"
				className="absolute inset-0 m-0 size-full appearance-none border-0 bg-transparent p-0"
				aria-label={`Select ${track.name} track`}
				onMouseUp={(event) => {
					if (shouldIgnoreClick?.()) return;
					onTrackMouseUp?.(event);
				}}
				onMouseDown={(event) => {
					event.preventDefault();
					onTrackMouseDown?.(event);
				}}
			/>
			{/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- spatial gesture surface; the wrapping <button> handles keyboard track selection, this <div> only forwards background clicks for box-select / deselect. */}
			<div
				className="relative h-full min-w-full"
				style={{ zIndex: TIMELINE_LAYERS.trackContent }}
				onMouseUp={(event) => {
					if (event.target !== event.currentTarget) return;
					if (shouldIgnoreClick?.()) return;
					onTrackMouseUp?.(event);
				}}
				onMouseDown={(event) => {
					if (event.target !== event.currentTarget) return;
					event.preventDefault();
					onTrackMouseDown?.(event);
				}}
			>
				{track.elements.length === 0 ? (
					<div className="text-muted-foreground border-muted/30 pointer-events-none flex size-full items-center justify-center rounded-sm border-2 border-dashed text-xs" />
				) : (
					<>
						{track.elements.map((element) => {
							const isSelected = isElementSelected({
								trackId: track.id,
								elementId: element.id,
							});

							return (
								<TimelineElement
									key={element.id}
									element={element}
									track={track}
									zoomLevel={zoomLevel}
									isSelected={isSelected}
									onResizeStart={({ event, element, side }) =>
										onResizeStart({ event, element, track, side })
									}
									onElementMouseDown={({ event, element }) =>
										onElementMouseDown({ event, element, track })
									}
									onElementClick={({ event, element }) =>
										onElementClick({ event, element, track })
									}
									dragView={dragView}
									isDropTarget={element.id === targetElementId}
								/>
							);
						})}

						{/* Cut-Point Transition Buttons */}
						{track.type === "video" &&
							track.elements
								.slice()
								.sort((a, b) => a.startTime - b.startTime)
								.map((curr, idx, arr) => {
									if (idx >= arr.length - 1) return null;
									const next = arr[idx + 1];
									const cutTime = (curr.startTime + curr.duration) as MediaTime;
									const isAdjacent =
										Math.abs((next.startTime as number) - (cutTime as number)) <
										200000;
									if (!isAdjacent) return null;

									const existingTransition = track.transitions?.find(
										(t) =>
											t.fromElementId === curr.id &&
											t.toElementId === next.id,
									);

									return (
										<CutPointTransitionButton
											key={`trans-${curr.id}-${next.id}`}
											trackId={track.id}
											fromElementId={curr.id}
											toElementId={next.id}
											cutTime={cutTime}
											zoomLevel={zoomLevel}
											existingTransition={existingTransition}
										/>
									);
								})}
					</>
				)}
			</div>
		</div>
	);
}

function CutPointTransitionButton({
	trackId,
	fromElementId,
	toElementId,
	cutTime,
	zoomLevel,
	existingTransition,
}: {
	trackId: string;
	fromElementId: string;
	toElementId: string;
	cutTime: MediaTime;
	zoomLevel: number;
	existingTransition?: TrackTransition;
}) {
	const editor = useEditor();
	const { selectedTransitionRef, setSelectedTransitionRef } =
		useTransitionsStore();
	const { clearElementSelection } = useElementSelection();
	const [isDragOver, setIsDragOver] = useState(false);

	const left = timelineTimeToSnappedPixels({ time: cutTime, zoomLevel });
	const isSelected =
		selectedTransitionRef?.trackId === trackId &&
		selectedTransitionRef?.transitionId === existingTransition?.id;

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		clearElementSelection();

		if (existingTransition) {
			setSelectedTransitionRef({
				trackId,
				transitionId: existingTransition.id,
			});
		} else {
			const id = editor.timeline.addTransition({
				trackId,
				fromElementId,
				toElementId,
				type: "crossfade",
			});
			setSelectedTransitionRef({ trackId, transitionId: id });
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		const dragData = editor.timeline.dragSource.getActive();
		if (dragData?.type === "transition") {
			e.preventDefault();
			e.stopPropagation();
			setIsDragOver(true);
		}
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		const dragData = editor.timeline.dragSource.getActive();
		if (dragData?.type === "transition") {
			e.preventDefault();
			e.stopPropagation();
			setIsDragOver(false);
			const id = editor.timeline.addTransition({
				trackId,
				fromElementId,
				toElementId,
				type: dragData.transitionType,
			});
			setSelectedTransitionRef({ trackId, transitionId: id });
		}
	};

	return (
		<div
			className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 pointer-events-auto"
			style={{ left: `${left}px` }}
		>
			<button
				type="button"
				onClick={handleClick}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={cn(
					"size-5 rounded flex items-center justify-center transition-all shadow-sm cursor-pointer",
					isDragOver
						? "bg-primary text-primary-foreground ring-4 ring-primary/80 scale-125"
						: existingTransition
							? isSelected
								? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 scale-110"
								: "bg-primary/90 text-primary-foreground hover:scale-110"
							: "bg-background/80 hover:bg-background text-muted-foreground hover:text-primary border border-border/80 hover:border-primary opacity-40 hover:opacity-100 hover:scale-110",
				)}
				title={
					existingTransition
						? `转场: ${existingTransition.type} (点击编辑 / 拖拽替换)`
						: "添加转场 (点击或拖拽)"
				}
			>
				<HugeiconsIcon icon={ArrowRightDoubleIcon} className="size-3" />
			</button>
		</div>
	);
}
