import { getGsapEasing } from "./gsap-easings";
import type {
	TextAnimationEvaluationResult,
	TextAnimationState,
} from "./types";

export function evaluateTextAnimation({
	animation,
	localTimeSeconds,
	totalDurationSeconds,
	fullTextLength,
}: {
	animation?: TextAnimationState;
	localTimeSeconds: number;
	totalDurationSeconds: number;
	fullTextLength: number;
}): TextAnimationEvaluationResult {
	let offsetX = 0;
	let offsetY = 0;
	let scaleX = 1;
	let scaleY = 1;
	let rotate = 0;
	let opacity = 1;
	let visibleTextLength = fullTextLength;

	if (!animation) {
		return {
			offsetX,
			offsetY,
			scaleX,
			scaleY,
			rotate,
			opacity,
			visibleTextLength,
		};
	}

	// 1. Loop Animation Evaluation
	if (animation.loop && animation.loop.type) {
		const speed = animation.loop.speed ?? 1.0;
		const loopType = animation.loop.type;
		const t = localTimeSeconds * speed;

		switch (loopType) {
			case "pulse": {
				const wave = Math.sin(t * 3.5);
				const s = 1 + wave * 0.08;
				scaleX *= s;
				scaleY *= s;
				break;
			}
			case "float": {
				offsetY += Math.sin(t * 2.8) * 16;
				break;
			}
			case "shake": {
				const jitter =
					Math.sin(t * 30) * 0.6 +
					Math.sin(t * 47) * 0.4;
				offsetX += jitter * 8;
				offsetY += Math.cos(t * 35) * 5;
				rotate += Math.sin(t * 22) * 2;
				break;
			}
			case "swing": {
				rotate += Math.sin(t * 3.2) * 9;
				break;
			}
			case "shimmer": {
				opacity *= 0.65 + 0.35 * Math.sin(t * 5.0);
				break;
			}
		}
	}

	// 2. In Animation Evaluation
	if (
		animation.in &&
		animation.in.type &&
		animation.in.duration > 0 &&
		localTimeSeconds < animation.in.duration
	) {
		const rawProgress = Math.max(
			0,
			Math.min(1, localTimeSeconds / animation.in.duration),
		);
		const inType = animation.in.type;
		const easingName = animation.in.easing || "power2.out";
		const ease = getGsapEasing(easingName);
		const progress = ease(rawProgress);

		switch (inType) {
			case "whisperFade": {
				scaleX *= 1.04 - 0.04 * progress;
				scaleY *= 1.04 - 0.04 * progress;
				opacity *= progress;
				break;
			}
			case "riseSettle": {
				offsetY += (1 - progress) * 35;
				opacity *= Math.min(1, rawProgress * 2.0);
				break;
			}
			case "stackReveal": {
				offsetY += (1 - progress) * 45;
				opacity *= Math.min(1, rawProgress * 2.5);
				break;
			}
			case "letterCascade": {
				offsetY += (1 - progress) * 30;
				scaleX *= 0.7 + 0.3 * progress;
				scaleY *= 0.7 + 0.3 * progress;
				opacity *= progress;
				break;
			}
			case "maskWipeUp": {
				offsetY += (1 - progress) * 50;
				opacity *= Math.min(1, rawProgress * 3.0);
				break;
			}
			case "splitLine": {
				scaleX *= 1.25 - 0.25 * progress;
				opacity *= progress;
				break;
			}
			case "weightShift": {
				scaleX *= 1.2 - 0.2 * progress;
				scaleY *= 0.9 + 0.1 * progress;
				opacity *= progress;
				break;
			}
			case "kineticPop": {
				const backEase = getGsapEasing("back.out");
				const s = Math.max(0, backEase(rawProgress));
				scaleX *= s * 1.06;
				scaleY *= s * 1.06;
				opacity *= Math.min(1, rawProgress * 3.0);
				break;
			}
			case "underlineSweep": {
				offsetX -= (1 - progress) * 45;
				opacity *= progress;
				break;
			}
			case "lowerThird": {
				offsetX -= (1 - progress) * 70;
				opacity *= Math.min(1, rawProgress * 2.2);
				break;
			}
			case "zoomOutStat": {
				scaleX *= 1.6 - 0.6 * progress;
				scaleY *= 1.6 - 0.6 * progress;
				opacity *= Math.min(1, rawProgress * 2.5);
				break;
			}
			case "typewriter": {
				visibleTextLength = Math.max(
					1,
					Math.floor(rawProgress * fullTextLength),
				);
				break;
			}
			case "bounceIn": {
				const backEase = getGsapEasing("back.out");
				const s = Math.max(0, backEase(rawProgress));
				scaleX *= s;
				scaleY *= s;
				opacity *= Math.min(1, rawProgress * 2.5);
				break;
			}
			case "zoomIn": {
				scaleX *= progress;
				scaleY *= progress;
				opacity *= progress;
				break;
			}
			case "slideUp": {
				const power3 = getGsapEasing("power3.out");
				offsetY += (1 - power3(rawProgress)) * 90;
				opacity *= rawProgress;
				break;
			}
			case "slideDown": {
				const power3 = getGsapEasing("power3.out");
				offsetY -= (1 - power3(rawProgress)) * 90;
				opacity *= rawProgress;
				break;
			}
			case "slideRight": {
				const power3 = getGsapEasing("power3.out");
				offsetX -= (1 - power3(rawProgress)) * 120;
				opacity *= rawProgress;
				break;
			}
			case "slideLeft": {
				const power3 = getGsapEasing("power3.out");
				offsetX += (1 - power3(rawProgress)) * 120;
				opacity *= rawProgress;
				break;
			}
			case "flipIn": {
				const backEase = getGsapEasing("back.out");
				rotate += (1 - backEase(rawProgress)) * 45;
				scaleY *= Math.max(0, backEase(rawProgress));
				opacity *= rawProgress;
				break;
			}
			case "waveIn": {
				const sineEase = getGsapEasing("sine.out");
				offsetY += (1 - sineEase(rawProgress)) * 60;
				scaleX *= Math.min(1.2, 0.5 + 0.5 * sineEase(rawProgress));
				scaleY *= Math.min(1.2, 0.5 + 0.5 * sineEase(rawProgress));
				opacity *= rawProgress;
				break;
			}
			case "blurIn": {
				scaleX *= 0.8 + 0.2 * progress;
				scaleY *= 0.8 + 0.2 * progress;
				opacity *= progress;
				break;
			}
			case "elasticIn": {
				const elasticEase = getGsapEasing("elastic.out");
				const s = Math.max(0, elasticEase(rawProgress));
				scaleX *= s;
				scaleY *= s;
				opacity *= Math.min(1, rawProgress * 2.0);
				break;
			}
			default: {
				opacity *= progress;
				break;
			}
		}
	}

	// 3. Out Animation Evaluation
	if (
		animation.out &&
		animation.out.type &&
		animation.out.duration > 0
	) {
		const outStartTime = totalDurationSeconds - animation.out.duration;
		if (localTimeSeconds > outStartTime) {
			const timeIntoOut = localTimeSeconds - outStartTime;
			const rawProgress = Math.max(
				0,
				Math.min(1, timeIntoOut / animation.out.duration),
			);
			const remaining = 1 - rawProgress;
			const outType = animation.out.type;
			const easingName = animation.out.easing || "power2.in";
			const ease = getGsapEasing(easingName);
			const progress = ease(remaining);

			switch (outType) {
				case "fadeOut": {
					opacity *= progress;
					break;
				}
				case "zoomOut": {
					const backIn = getGsapEasing("back.in");
					const s = Math.max(0, backIn(remaining));
					scaleX *= s;
					scaleY *= s;
					opacity *= remaining;
					break;
				}
				case "slideDownOut": {
					const power3 = getGsapEasing("power3.in");
					offsetY += (1 - power3(remaining)) * 100;
					opacity *= remaining;
					break;
				}
				case "slideUpOut": {
					const power3 = getGsapEasing("power3.in");
					offsetY -= (1 - power3(remaining)) * 100;
					opacity *= remaining;
					break;
				}
				case "slideLeftOut": {
					const power3 = getGsapEasing("power3.in");
					offsetX -= (1 - power3(remaining)) * 140;
					opacity *= remaining;
					break;
				}
				case "slideRightOut": {
					const power3 = getGsapEasing("power3.in");
					offsetX += (1 - power3(remaining)) * 140;
					opacity *= remaining;
					break;
				}
				case "typewriterErase": {
					visibleTextLength = Math.max(
						0,
						Math.floor(remaining * fullTextLength),
					);
					break;
				}
				default: {
					opacity *= remaining;
					break;
				}
			}
		}
	}

	return {
		offsetX,
		offsetY,
		scaleX,
		scaleY,
		rotate,
		opacity,
		visibleTextLength,
	};
}
