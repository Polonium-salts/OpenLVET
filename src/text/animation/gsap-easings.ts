/**
 * GSAP-compatible Easing Formulas
 * Reference: https://github.com/greensock/GSAP
 */

export type EasingFunction = (t: number) => number;

// Power / Quad, Cubic, Quart, Quint
export const easeLinear: EasingFunction = (t) => t;

export const easePower1In: EasingFunction = (t) => t * t;
export const easePower1Out: EasingFunction = (t) => t * (2 - t);
export const easePower1InOut: EasingFunction = (t) =>
	t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export const easePower2In: EasingFunction = (t) => t * t * t;
export const easePower2Out: EasingFunction = (t) => --t * t * t + 1;
export const easePower2InOut: EasingFunction = (t) =>
	t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

export const easePower3In: EasingFunction = (t) => t * t * t * t;
export const easePower3Out: EasingFunction = (t) => 1 - --t * t * t * t;
export const easePower3InOut: EasingFunction = (t) =>
	t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;

export const easePower4In: EasingFunction = (t) => t * t * t * t * t;
export const easePower4Out: EasingFunction = (t) => 1 + --t * t * t * t * t;
export const easePower4InOut: EasingFunction = (t) =>
	t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;

// Sine
export const easeSineIn: EasingFunction = (t) => 1 - Math.cos((t * Math.PI) / 2);
export const easeSineOut: EasingFunction = (t) => Math.sin((t * Math.PI) / 2);
export const easeSineInOut: EasingFunction = (t) =>
	-(Math.cos(Math.PI * t) - 1) / 2;

// Expo
export const easeExpoIn: EasingFunction = (t) =>
	t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
export const easeExpoOut: EasingFunction = (t) =>
	t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
export const easeExpoInOut: EasingFunction = (t) => {
	if (t === 0) return 0;
	if (t === 1) return 1;
	return (t *= 2) < 1
		? 0.5 * Math.pow(2, 10 * (t - 1))
		: 0.5 * (2 - Math.pow(2, -10 * (t - 1)));
};

// Back (with standard overshoot s = 1.70158)
export const createEaseBackOut = (s = 1.70158): EasingFunction => {
	return (t) => {
		const t1 = t - 1;
		return t1 * t1 * ((s + 1) * t1 + s) + 1;
	};
};

export const createEaseBackIn = (s = 1.70158): EasingFunction => {
	return (t) => t * t * ((s + 1) * t - s);
};

export const easeBackOut: EasingFunction = createEaseBackOut(1.70158);
export const easeBackIn: EasingFunction = createEaseBackIn(1.70158);
export const easeBackInOut: EasingFunction = (t) => {
	const s = 1.70158 * 1.525;
	return (t *= 2) < 1
		? 0.5 * (t * t * ((s + 1) * t - s))
		: 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
};

// Elastic
export const easeElasticOut: EasingFunction = (t) => {
	if (t === 0) return 0;
	if (t === 1) return 1;
	const p = 0.3;
	return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
};

export const easeElasticIn: EasingFunction = (t) => {
	if (t === 0) return 0;
	if (t === 1) return 1;
	const p = 0.3;
	const t1 = t - 1;
	return (
		-Math.pow(2, 10 * t1) * Math.sin(((t1 - p / 4) * (2 * Math.PI)) / p)
	);
};

// Bounce
export const easeBounceOut: EasingFunction = (t) => {
	const n1 = 7.5625;
	const d1 = 2.75;
	if (t < 1 / d1) {
		return n1 * t * t;
	}
	if (t < 2 / d1) {
		return n1 * (t -= 1.5 / d1) * t + 0.75;
	}
	if (t < 2.5 / d1) {
		return n1 * (t -= 2.25 / d1) * t + 0.9375;
	}
	return n1 * (t -= 2.625 / d1) * t + 0.984375;
};

export const easeBounceIn: EasingFunction = (t) => 1 - easeBounceOut(1 - t);

export const easeBounceInOut: EasingFunction = (t) =>
	t < 0.5 ? 0.5 * easeBounceIn(t * 2) : 0.5 * easeBounceOut(t * 2 - 1) + 0.5;

export const GSAP_EASINGS: Record<string, EasingFunction> = {
	linear: easeLinear,
	"power1.in": easePower1In,
	"power1.out": easePower1Out,
	"power1.inOut": easePower1InOut,
	"power2.in": easePower2In,
	"power2.out": easePower2Out,
	"power2.inOut": easePower2InOut,
	"power3.in": easePower3In,
	"power3.out": easePower3Out,
	"power3.inOut": easePower3InOut,
	"power4.in": easePower4In,
	"power4.out": easePower4Out,
	"power4.inOut": easePower4InOut,
	"sine.in": easeSineIn,
	"sine.out": easeSineOut,
	"sine.inOut": easeSineInOut,
	"expo.in": easeExpoIn,
	"expo.out": easeExpoOut,
	"expo.inOut": easeExpoInOut,
	"back.in": easeBackIn,
	"back.out": easeBackOut,
	"back.inOut": easeBackInOut,
	"elastic.in": easeElasticIn,
	"elastic.out": easeElasticOut,
	"bounce.in": easeBounceIn,
	"bounce.out": easeBounceOut,
	"bounce.inOut": easeBounceInOut,
};

export function getGsapEasing(name?: string): EasingFunction {
	if (!name) return easePower2Out;
	return GSAP_EASINGS[name] || easePower2Out;
}
