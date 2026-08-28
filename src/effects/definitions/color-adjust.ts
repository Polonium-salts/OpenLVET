import type { EffectDefinition } from "../types";

export const adjustmentEffect: EffectDefinition = {
	type: "adjustment",
	name: "电影调色",
	category: "color",
	icon: "🎨",
	description: "专业级曝光、对比度、色彩饱和度与色相微调",
	keywords: ["adjust", "color", "grade", "brightness", "contrast", "saturation", "调色", "饱和度", "对比度"],
	params: [
		{
			key: "brightness",
			label: "明亮度",
			type: "number",
			default: 1.0,
			min: 0.0,
			max: 2.0,
			step: 0.05,
		},
		{
			key: "contrast",
			label: "对比度",
			type: "number",
			default: 1.0,
			min: 0.0,
			max: 2.0,
			step: 0.05,
		},
		{
			key: "saturation",
			label: "饱和度",
			type: "number",
			default: 1.0,
			min: 0.0,
			max: 3.0,
			step: 0.05,
		},
		{
			key: "gamma",
			label: "伽马值",
			type: "number",
			default: 1.0,
			min: 0.2,
			max: 2.5,
			step: 0.05,
		},
		{
			key: "hue",
			label: "色相旋转",
			type: "number",
			default: 0,
			min: 0,
			max: 360,
			step: 5,
		},
	],
	renderer: {
		passes: [
			{
				shader: "adjustment",
				glsl: `
uniform float u_brightness;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_gamma;
uniform float u_hue;

vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 filterPixel(vec2 uv) {
  vec4 color = getSourceColor(uv);
  vec3 rgb = color.rgb;

  // Brightness
  rgb *= u_brightness;

  // Contrast
  rgb = (rgb - 0.5) * u_contrast + 0.5;

  // Saturation & Hue
  vec3 hsv = rgb2hsv(clamp(rgb, 0.0, 1.0));
  hsv.x = fract(hsv.x + u_hue / 360.0);
  hsv.y = clamp(hsv.y * u_saturation, 0.0, 1.0);
  rgb = hsv2rgb(hsv);

  // Gamma
  rgb = pow(clamp(rgb, 0.0, 1.0), vec3(1.0 / max(0.01, u_gamma)));

  return vec4(clamp(rgb, 0.0, 1.0), color.a);
}
`,
				uniforms: ({ effectParams }) => ({
					u_brightness: Number(effectParams.brightness ?? 1.0),
					u_contrast: Number(effectParams.contrast ?? 1.0),
					u_saturation: Number(effectParams.saturation ?? 1.0),
					u_gamma: Number(effectParams.gamma ?? 1.0),
					u_hue: Number(effectParams.hue ?? 0),
				}),
			},
		],
	},
};

export const invertEffect: EffectDefinition = {
	type: "invert",
	name: "反色胶片",
	category: "color",
	icon: "🌓",
	description: "底片反转负像色彩与反转混合",
	keywords: ["invert", "negative", "film", "反相", "底片", "反色"],
	params: [
		{
			key: "intensity",
			label: "反相程度",
			type: "number",
			default: 1.0,
			min: 0.0,
			max: 1.0,
			step: 0.05,
		},
	],
	renderer: {
		passes: [
			{
				shader: "invert",
				glsl: `
uniform float u_intensity;

vec4 filterPixel(vec2 uv) {
  vec4 color = getSourceColor(uv);
  vec3 inv = vec3(1.0) - color.rgb;
  return vec4(mix(color.rgb, inv, u_intensity), color.a);
}
`,
				uniforms: ({ effectParams }) => ({
					u_intensity: Number(effectParams.intensity ?? 1.0),
				}),
			},
		],
	},
};

export const thermalEffect: EffectDefinition = {
	type: "thermal",
	name: "热成像",
	category: "color",
	icon: "🌡️",
	description: "红外热成像伪彩色能量感应光效",
	keywords: ["thermal", "heat", "infrared", "vision", "热成像", "红外", "能量"],
	params: [
		{
			key: "intensity",
			label: "热度增强",
			type: "number",
			default: 1.0,
			min: 0.2,
			max: 2.0,
			step: 0.1,
		},
	],
	renderer: {
		passes: [
			{
				shader: "thermal",
				glsl: `
uniform float u_intensity;

vec3 thermalPalette(float val) {
  val = clamp(val * u_intensity, 0.0, 1.0);
  vec3 c = vec3(0.0);
  if (val < 0.25) {
    c = mix(vec3(0.0, 0.0, 0.3), vec3(0.0, 0.2, 0.8), val / 0.25);
  } else if (val < 0.5) {
    c = mix(vec3(0.0, 0.2, 0.8), vec3(0.9, 0.1, 0.7), (val - 0.25) / 0.25);
  } else if (val < 0.75) {
    c = mix(vec3(0.9, 0.1, 0.7), vec3(1.0, 0.8, 0.0), (val - 0.5) / 0.25);
  } else {
    c = mix(vec3(1.0, 0.8, 0.0), vec3(1.0, 1.0, 1.0), (val - 0.75) / 0.25);
  }
  return c;
}

vec4 filterPixel(vec2 uv) {
  vec4 color = getSourceColor(uv);
  float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  return vec4(thermalPalette(luma), color.a);
}
`,
				uniforms: ({ effectParams }) => ({
					u_intensity: Number(effectParams.intensity ?? 1.0),
				}),
			},
		],
	},
};

export const nightVisionEffect: EffectDefinition = {
	type: "night-vision",
	name: "夜视仪",
	category: "color",
	icon: "🪖",
	description: "军用微光夜视仪荧光绿与噪点扫描线",
	keywords: ["night", "vision", "green", "military", "夜视", "微光", "绿色"],
	params: [
		{
			key: "greenBoost",
			label: "荧光强度",
			type: "number",
			default: 1.2,
			min: 0.5,
			max: 2.5,
			step: 0.1,
		},
		{
			key: "noise",
			label: "微光噪点",
			type: "number",
			default: 0.2,
			min: 0.0,
			max: 0.6,
			step: 0.05,
		},
	],
	renderer: {
		passes: [
			{
				shader: "night-vision",
				glsl: `
uniform float u_greenBoost;
uniform float u_noise;

float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 filterPixel(vec2 uv) {
  vec4 color = getSourceColor(uv);
  float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  
  // Green phosphor tint
  vec3 green = vec3(0.1, luma * u_greenBoost, 0.15);
  
  // Noise grain
  float n = (rand(uv + vec2(u_time * 0.1, u_time * 0.2)) - 0.5) * u_noise;
  green += vec3(n * 0.5, n, n * 0.3);

  // Vignette mask
  float dist = distance(uv, vec2(0.5));
  float vignette = smoothstep(0.7, 0.4, dist);

  return vec4(clamp(green * vignette, 0.0, 1.0), color.a);
}
`,
				uniforms: ({ effectParams }) => ({
					u_greenBoost: Number(effectParams.greenBoost ?? 1.2),
					u_noise: Number(effectParams.noise ?? 0.2),
				}),
			},
		],
	},
};
