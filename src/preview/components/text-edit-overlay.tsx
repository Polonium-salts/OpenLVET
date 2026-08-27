"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePreviewViewport } from "@/preview/components/preview-viewport";
import { useEditor } from "@/editor/use-editor";
import type { TextElement } from "@/timeline";
import { DEFAULTS } from "@/timeline/defaults";
import {
	getElementLocalTime,
} from "@/animation";
import { resolveTransformAtTime } from "@/rendering/animation-values";
import { buildTransformFromParams } from "@/rendering";
import { resolveTextLayout } from "@/text/primitives";
import {
	buildTextBackgroundFromElement,
	buildTextLayoutParamsFromElement,
} from "@/text/measure-element";

export function TextEditOverlay({
	trackId,
	elementId,
	element,
	onCommit,
}: {
	trackId: string;
	elementId: string;
	element: TextElement;
	onCommit: () => void;
}) {
	const editor = useEditor();
	const viewport = usePreviewViewport();
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [text, setText] = useState<string>(
		typeof element.params.content === "string"
			? element.params.content
			: String(element.params.content || ""),
	);

	useEffect(() => {
		const ta = textareaRef.current;
		if (!ta) return;
		ta.focus();
		ta.select();
	}, []);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const newText = e.target.value;
			setText(newText);
			editor.timeline.previewElements({
				updates: [
					{
						trackId,
						elementId,
						updates: { params: { ...element.params, content: newText } },
					},
				],
			});
		},
		[editor.timeline, trackId, elementId, element.params],
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			const { key } = event;
			if (key === "Escape") {
				event.preventDefault();
				onCommit();
			}
		},
		[onCommit],
	);

	const canvasSize = editor.project.getActive().settings.canvasSize;

	if (!canvasSize) return null;

	const currentTime = editor.playback.getCurrentTime();
	const localTime = getElementLocalTime({
		timelineTime: currentTime,
		elementStartTime: element.startTime,
		elementDuration: element.duration,
	});
	const transform = resolveTransformAtTime({
		baseTransform: buildTransformFromParams({ params: element.params }),
		animations: element.animations,
		localTime,
	});

	const { x: posX, y: posY } = viewport.positionToOverlay({
		positionX: transform.position.x,
		positionY: transform.position.y,
	});

	const { x: displayScaleX } = viewport.getDisplayScale();
	const textParams = buildTextLayoutParamsFromElement({ element });
	const resolvedTextLayout = resolveTextLayout({
		text: textParams,
		canvasHeight: canvasSize.height,
	});

	const lineHeight = textParams.lineHeight ?? DEFAULTS.text.lineHeight;
	const canvasLetterSpacing = textParams.letterSpacing ?? 0;
	const lineHeightPx = resolvedTextLayout.lineHeightPx;

	const bg = buildTextBackgroundFromElement({ element });
	const shouldShowBackground =
		bg.enabled && bg.color && bg.color !== "transparent";
	const fontSizeRatio = resolvedTextLayout.fontSizeRatio;
	const canvasPaddingX = shouldShowBackground
		? (bg.paddingX ?? DEFAULTS.text.background.paddingX) * fontSizeRatio
		: 0;
	const canvasPaddingY = shouldShowBackground
		? (bg.paddingY ?? DEFAULTS.text.background.paddingY) * fontSizeRatio
		: 0;

	return (
		<div
			className="absolute"
			style={{
				left: posX,
				top: posY,
				transform: `translate(-50%, -50%) scale(${transform.scaleX * displayScaleX}, ${transform.scaleY * displayScaleX}) rotate(${transform.rotate}deg)`,
				transformOrigin: "center center",
			}}
		>
			<textarea
				ref={textareaRef}
				value={text}
				onChange={handleChange}
				onBlur={onCommit}
				onKeyDown={handleKeyDown}
				aria-label="Edit text"
				rows={Math.max(1, text.split("\n").length)}
				className="resize-none overflow-hidden outline-none whitespace-pre border-none p-0 m-0 bg-transparent block"
				style={{
					fontSize: resolvedTextLayout.scaledFontSize,
					fontFamily: textParams.fontFamily,
					fontWeight: textParams.fontWeight === "bold" ? "bold" : "normal",
					fontStyle: textParams.fontStyle === "italic" ? "italic" : "normal",
					textAlign: textParams.textAlign,
					letterSpacing: `${canvasLetterSpacing}px`,
					lineHeight,
					color: "transparent",
					caretColor:
						typeof element.params.color === "string"
							? element.params.color
							: "#ffffff",
					backgroundColor: shouldShowBackground ? bg.color : "transparent",
					minHeight: lineHeightPx,
					textDecoration: textParams.textDecoration ?? "none",
					padding: shouldShowBackground
						? `${canvasPaddingY}px ${canvasPaddingX}px`
						: 0,
					minWidth: "1em",
					width: "max-content",
				}}
			/>
		</div>
	);
}
