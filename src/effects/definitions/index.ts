import { blurEffectDefinition } from "./blur";
import { rgbSplitEffect, glitchEffect } from "./glitch";
import {
	pixelateEffect,
	twistEffect,
	bulgePinchEffect,
	shockwaveEffect,
} from "./distortion";
import {
	adjustmentEffect,
	invertEffect,
	thermalEffect,
	nightVisionEffect,
} from "./color-adjust";
import {
	oldFilmEffect,
	dotEffect,
	asciiEffect,
	crossHatchEffect,
	embossEffect,
	vignetteEffect,
} from "./artistic";
import {
	bloomEffect,
	zoomBlurEffect,
	motionBlurEffect,
} from "./lighting";
import type { EffectDefinition } from "../types";

export const defaultEffects: EffectDefinition[] = [
	// Color & Adjustment
	adjustmentEffect,
	invertEffect,
	thermalEffect,
	nightVisionEffect,
	// Lighting & Glow
	bloomEffect,
	blurEffectDefinition,
	zoomBlurEffect,
	motionBlurEffect,
	// Glitch & Motion
	rgbSplitEffect,
	glitchEffect,
	// Distortion & Warp
	pixelateEffect,
	twistEffect,
	bulgePinchEffect,
	shockwaveEffect,
	// Retro & Artistic
	oldFilmEffect,
	dotEffect,
	asciiEffect,
	crossHatchEffect,
	embossEffect,
	vignetteEffect,
];

export function registerDefaultEffects(): void {
	// Handled by EffectsRegistry
}
