"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useEditor } from "@/editor/use-editor";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TextElement } from "@/timeline";
import { DEFAULTS } from "@/timeline/defaults";
import { UpdateElementsCommand } from "@/commands/timeline/element";
import { cn } from "@/utils/ui";

export interface TextPresetStyle {
	id: string;
	name: string;
	preview: {
		text?: string;
		color?: string;
		stroke?: string;
		textShadow?: string;
		backgroundColor?: string;
		isNone?: boolean;
	};
	params: {
		color: string;
		fontWeight?: "normal" | "bold";
		fontStyle?: "normal" | "italic";
		textDecoration?: "none" | "underline" | "line-through";
		letterSpacing?: number;
		lineHeight?: number;
		"background.enabled": boolean;
		"background.color": string;
		"background.cornerRadius": number;
		"background.paddingX": number;
		"background.paddingY": number;
		"background.offsetX": number;
		"background.offsetY": number;
		"stroke.enabled": boolean;
		"stroke.color": string;
		"stroke.width": number;
		"shadow.enabled": boolean;
		"shadow.color": string;
		"shadow.offsetX": number;
		"shadow.offsetY": number;
		"shadow.blur": number;
	};
}

export const CAPCUT_PRESET_STYLES: TextPresetStyle[] = [
	// -------------------------------------------------------------
	// Row 1 (9 items)
	// -------------------------------------------------------------
	{
		id: "none",
		name: "无预设",
		preview: {
			isNone: true,
		},
		params: {
			color: "#ffffff",
			fontWeight: "normal",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": false,
			"stroke.color": "#000000",
			"stroke.width": 2,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},
	{
		id: "white-black-stroke",
		name: "白字黑边",
		preview: {
			text: "T",
			color: "#ffffff",
			stroke: "1.2px #000000",
		},
		params: {
			color: "#ffffff",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": true,
			"stroke.color": "#000000",
			"stroke.width": 3,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},
	{
		id: "black-white-stroke",
		name: "黑字白边",
		preview: {
			text: "T",
			color: "#000000",
			stroke: "1.2px #ffffff",
		},
		params: {
			color: "#000000",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": true,
			"stroke.color": "#ffffff",
			"stroke.width": 3,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},
	{
		id: "yellow-black-stroke",
		name: "黄字黑边",
		preview: {
			text: "T",
			color: "#ffd700",
			stroke: "1.2px #000000",
		},
		params: {
			color: "#ffd700",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": true,
			"stroke.color": "#000000",
			"stroke.width": 3,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},
	{
		id: "coral-white-stroke",
		name: "粉红白边",
		preview: {
			text: "T",
			color: "#ff8a80",
			stroke: "1.2px #ffffff",
		},
		params: {
			color: "#ff8a80",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": true,
			"stroke.color": "#ffffff",
			"stroke.width": 3,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},
	{
		id: "lightblue-black-stroke",
		name: "浅蓝黑边",
		preview: {
			text: "T",
			color: "#b3e5fc",
			stroke: "1.2px #000000",
		},
		params: {
			color: "#b3e5fc",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": true,
			"stroke.color": "#000000",
			"stroke.width": 3,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},
	{
		id: "pink-white-stroke",
		name: "玫红白边",
		preview: {
			text: "T",
			color: "#ff4081",
			stroke: "1.2px #ffffff",
		},
		params: {
			color: "#ff4081",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": true,
			"stroke.color": "#ffffff",
			"stroke.width": 3,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},
	{
		id: "blue-white-stroke",
		name: "亮蓝白边",
		preview: {
			text: "T",
			color: "#00b0ff",
			stroke: "1.2px #ffffff",
		},
		params: {
			color: "#00b0ff",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": true,
			"stroke.color": "#ffffff",
			"stroke.width": 3,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},
	{
		id: "lime-dark-stroke",
		name: "草绿暗边",
		preview: {
			text: "T",
			color: "#aeea00",
			stroke: "1.2px #1b5e20",
		},
		params: {
			color: "#aeea00",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": true,
			"stroke.color": "#1b5e20",
			"stroke.width": 3,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},

	// -------------------------------------------------------------
	// Row 2 (9 items)
	// -------------------------------------------------------------
	{
		id: "slate-shadow",
		name: "柔蓝暗影",
		preview: {
			text: "T",
			color: "#81d4fa",
			textShadow: "0 2px 4px rgba(0,0,0,0.8)",
		},
		params: {
			color: "#81d4fa",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": false,
			"stroke.color": "#000000",
			"stroke.width": 2,
			"shadow.enabled": true,
			"shadow.color": "rgba(0,0,0,0.8)",
			"shadow.offsetX": 0,
			"shadow.offsetY": 3,
			"shadow.blur": 6,
		},
	},
	{
		id: "red-white-stroke",
		name: "红字白边",
		preview: {
			text: "T",
			color: "#ff1744",
			stroke: "1.2px #ffffff",
		},
		params: {
			color: "#ff1744",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": true,
			"stroke.color": "#ffffff",
			"stroke.width": 3,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},
	{
		id: "brown-white-stroke",
		name: "棕红白边",
		preview: {
			text: "T",
			color: "#bf360c",
			stroke: "1.2px #ffffff",
		},
		params: {
			color: "#bf360c",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": true,
			"stroke.color": "#ffffff",
			"stroke.width": 3,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},
	{
		id: "cream-dark-stroke",
		name: "米黄暗边",
		preview: {
			text: "T",
			color: "#fff9c4",
			stroke: "1.2px #3e2723",
		},
		params: {
			color: "#fff9c4",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": true,
			"stroke.color": "#3e2723",
			"stroke.width": 3,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},
	{
		id: "peach-white-stroke",
		name: "肉粉白边",
		preview: {
			text: "T",
			color: "#ffab91",
			stroke: "1.2px #ffffff",
		},
		params: {
			color: "#ffab91",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": true,
			"stroke.color": "#ffffff",
			"stroke.width": 3,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},
	{
		id: "badge-black",
		name: "黑底白字",
		preview: {
			text: "T",
			color: "#ffffff",
			backgroundColor: "#000000",
		},
		params: {
			color: "#ffffff",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": true,
			"background.color": "#000000",
			"background.cornerRadius": 6,
			"background.paddingX": 10,
			"background.paddingY": 6,
			"background.offsetX": 0,
			"background.offsetY": 0,
			"stroke.enabled": false,
			"stroke.color": "#000000",
			"stroke.width": 2,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},
	{
		id: "badge-white",
		name: "白底黑字",
		preview: {
			text: "T",
			color: "#000000",
			backgroundColor: "#ffffff",
		},
		params: {
			color: "#000000",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": true,
			"background.color": "#ffffff",
			"background.cornerRadius": 6,
			"background.paddingX": 10,
			"background.paddingY": 6,
			"background.offsetX": 0,
			"background.offsetY": 0,
			"stroke.enabled": false,
			"stroke.color": "#000000",
			"stroke.width": 2,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},
	{
		id: "badge-yellow",
		name: "黄底黑字",
		preview: {
			text: "T",
			color: "#000000",
			backgroundColor: "#ffd600",
		},
		params: {
			color: "#000000",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": true,
			"background.color": "#ffd600",
			"background.cornerRadius": 6,
			"background.paddingX": 10,
			"background.paddingY": 6,
			"background.offsetX": 0,
			"background.offsetY": 0,
			"stroke.enabled": false,
			"stroke.color": "#000000",
			"stroke.width": 2,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},
	{
		id: "badge-wine",
		name: "红底白字",
		preview: {
			text: "T",
			color: "#ffffff",
			backgroundColor: "#9e3d46",
		},
		params: {
			color: "#ffffff",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": true,
			"background.color": "#9e3d46",
			"background.cornerRadius": 6,
			"background.paddingX": 10,
			"background.paddingY": 6,
			"background.offsetX": 0,
			"background.offsetY": 0,
			"stroke.enabled": false,
			"stroke.color": "#000000",
			"stroke.width": 2,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},

	// -------------------------------------------------------------
	// Row 3 (6 items)
	// -------------------------------------------------------------
	{
		id: "badge-neon-black",
		name: "黑底绿字",
		preview: {
			text: "T",
			color: "#00e676",
			backgroundColor: "#000000",
		},
		params: {
			color: "#00e676",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": true,
			"background.color": "#000000",
			"background.cornerRadius": 6,
			"background.paddingX": 10,
			"background.paddingY": 6,
			"background.offsetX": 0,
			"background.offsetY": 0,
			"stroke.enabled": false,
			"stroke.color": "#000000",
			"stroke.width": 2,
			"shadow.enabled": false,
			"shadow.color": "#000000",
			"shadow.offsetX": 2,
			"shadow.offsetY": 2,
			"shadow.blur": 0,
		},
	},
	{
		id: "3d-blue",
		name: "白字蓝立体",
		preview: {
			text: "T",
			color: "#ffffff",
			textShadow: "2px 2px 0px #00b0ff, 3px 3px 0px #0091ea",
		},
		params: {
			color: "#ffffff",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": false,
			"stroke.color": "#000000",
			"stroke.width": 2,
			"shadow.enabled": true,
			"shadow.color": "#00b0ff",
			"shadow.offsetX": 3,
			"shadow.offsetY": 3,
			"shadow.blur": 0,
		},
	},
	{
		id: "3d-pink",
		name: "白字粉立体",
		preview: {
			text: "T",
			color: "#ffffff",
			textShadow: "2px 2px 0px #ff4081, 3px 3px 0px #f50057",
		},
		params: {
			color: "#ffffff",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": false,
			"stroke.color": "#000000",
			"stroke.width": 2,
			"shadow.enabled": true,
			"shadow.color": "#ff4081",
			"shadow.offsetX": 3,
			"shadow.offsetY": 3,
			"shadow.blur": 0,
		},
	},
	{
		id: "3d-peach",
		name: "米字粉立体",
		preview: {
			text: "T",
			color: "#fff8e1",
			textShadow: "2px 2px 0px #ff8a80, 3px 3px 0px #ff5252",
		},
		params: {
			color: "#fff8e1",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": false,
			"stroke.color": "#000000",
			"stroke.width": 2,
			"shadow.enabled": true,
			"shadow.color": "#ff8a80",
			"shadow.offsetX": 3,
			"shadow.offsetY": 3,
			"shadow.blur": 0,
		},
	},
	{
		id: "3d-orange",
		name: "黄字红立体",
		preview: {
			text: "T",
			color: "#ffd600",
			textShadow: "2px 2px 0px #d50000, 3px 3px 0px #b71c1c",
		},
		params: {
			color: "#ffd600",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": false,
			"stroke.color": "#000000",
			"stroke.width": 2,
			"shadow.enabled": true,
			"shadow.color": "#d50000",
			"shadow.offsetX": 3,
			"shadow.offsetY": 3,
			"shadow.blur": 0,
		},
	},
	{
		id: "3d-green",
		name: "黑字绿立体",
		preview: {
			text: "T",
			color: "#000000",
			textShadow: "2px 2px 0px #00e676, 3px 3px 0px #00c853",
		},
		params: {
			color: "#000000",
			fontWeight: "bold",
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing: DEFAULTS.text.letterSpacing,
			lineHeight: DEFAULTS.text.lineHeight,
			"background.enabled": false,
			"background.color": DEFAULTS.text.background.color,
			"background.cornerRadius": DEFAULTS.text.background.cornerRadius,
			"background.paddingX": DEFAULTS.text.background.paddingX,
			"background.paddingY": DEFAULTS.text.background.paddingY,
			"background.offsetX": DEFAULTS.text.background.offsetX,
			"background.offsetY": DEFAULTS.text.background.offsetY,
			"stroke.enabled": false,
			"stroke.color": "#000000",
			"stroke.width": 2,
			"shadow.enabled": true,
			"shadow.color": "#00e676",
			"shadow.offsetX": 3,
			"shadow.offsetY": 3,
			"shadow.blur": 0,
		},
	},
];

export function TextStylesTab({
	element,
	trackId,
}: {
	element: TextElement;
	trackId: string;
}) {
	const editor = useEditor();
	const [activeStyleId, setActiveStyleId] = useState<string>("none");

	const handleSelectStyle = (preset: TextPresetStyle) => {
		editor.command.execute({
			command: new UpdateElementsCommand({
				updates: [
					{
						trackId,
						elementId: element.id,
						patch: {
							params: {
								...element.params,
								...preset.params,
							},
						},
					},
				],
			}),
		});

		setActiveStyleId(preset.id);
		if (preset.id === "none") {
			toast.info("已清除预设样式");
		} else {
			toast.success(`已应用预设「${preset.name}」`);
		}
	};

	return (
		<div className="flex flex-col h-full overflow-hidden bg-background select-none font-sans text-xs">
			<ScrollArea className="flex-1 p-4">
				{/* Section Title */}
				<div className="text-[13px] font-medium text-foreground/90 mb-3 tracking-wide">
					预设样式
				</div>

				{/* Presets Grid */}
				<div className="grid grid-cols-9 gap-2">
					{CAPCUT_PRESET_STYLES.map((preset) => {
						const isSelected = activeStyleId === preset.id;
						const isNone = preset.preview.isNone;
						const isBadge = Boolean(preset.preview.backgroundColor);

						return (
							<button
								key={preset.id}
								type="button"
								onClick={() => handleSelectStyle(preset)}
								title={preset.name}
								className={cn(
									"relative size-9 sm:size-10 rounded-[8px] flex items-center justify-center transition-all cursor-pointer select-none",
									isBadge
										? ""
										: "bg-[#27272a] hover:bg-[#323236]",
									isSelected
										? "ring-2 ring-[#00e5ff] ring-offset-1 ring-offset-background z-10"
										: "border border-white/5 hover:border-white/20",
								)}
								style={{
									backgroundColor: preset.preview.backgroundColor || undefined,
								}}
							>
								{isNone ? (
									/* Prohibition Icon (Circle with diagonal slash) */
									<svg
										className={cn(
											"size-5 transition-colors",
											isSelected ? "text-[#00e5ff]" : "text-muted-foreground/70",
										)}
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<circle cx="12" cy="12" r="9" />
										<line x1="5.7" y1="5.7" x2="18.3" y2="18.3" />
									</svg>
								) : (
									/* Stylized 'T' */
									<span
										className="text-base sm:text-lg font-black leading-none select-none pointer-events-none"
										style={{
											color: preset.preview.color,
											WebkitTextStroke: preset.preview.stroke,
											textShadow: preset.preview.textShadow,
											fontFamily: "Arial Black, Impact, sans-serif",
										}}
									>
										{preset.preview.text || "T"}
									</span>
								)}
							</button>
						);
					})}
				</div>

				{/* Bottom Caret Indicator */}
				<div className="flex justify-center mt-4">
					<svg
						className="size-3 text-muted-foreground/40"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
					</svg>
				</div>
			</ScrollArea>
		</div>
	);
}
