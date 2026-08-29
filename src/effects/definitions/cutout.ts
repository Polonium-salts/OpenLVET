import type { EffectDefinition } from "../types";

function hexToRgb(hex: string): [number, number, number] {
	if (!hex || typeof hex !== "string") return [0, 1, 0];
	let clean = hex.replace("#", "").trim();
	if (clean.length === 3) {
		clean = clean
			.split("")
			.map((c) => c + c)
			.join("");
	}
	const num = parseInt(clean, 16);
	if (isNaN(num)) return [0, 1, 0];
	return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

export const chromaKeyEffect: EffectDefinition = {
	type: "chroma-key",
	name: "色度抠图",
	category: "color",
	icon: "✂️",
	description: "专业绿幕/蓝幕与自定义颜色智能抠像，支持边缘羽化与溢色消除",
	keywords: ["chroma", "key", "cutout", "green screen", "blue screen", "抠图", "绿幕", "抠像", "透明"],
	params: [
		{
			key: "keyColor",
			label: "抠除目标颜色",
			type: "color",
			default: "#00FF00",
		},
		{
			key: "similarity",
			label: "相似度 / 容差",
			type: "number",
			default: 0.1,
			min: 0.0,
			max: 1.0,
			step: 0.01,
		},
		{
			key: "smoothness",
			label: "边缘平滑度",
			type: "number",
			default: 0.05,
			min: 0.0,
			max: 0.5,
			step: 0.01,
		},
		{
			key: "spill",
			label: "溢色消除 (去杂光)",
			type: "number",
			default: 0.3,
			min: 0.0,
			max: 1.0,
			step: 0.05,
		},
		{
			key: "invert",
			label: "反转抠图区域",
			type: "boolean",
			default: false,
		},
	],
	renderer: {
		passes: [
			{
				shader: "chroma-key",
				glsl: `
uniform vec3 u_keyColor;
uniform float u_similarity;
uniform float u_smoothness;
uniform float u_spill;
uniform float u_invert;

vec2 rgb2uv(vec3 rgb) {
  float u = -0.14713 * rgb.r - 0.28886 * rgb.g + 0.43600 * rgb.b;
  float v =  0.61500 * rgb.r - 0.51499 * rgb.g - 0.10001 * rgb.b;
  return vec2(u, v);
}

vec4 filterPixel(vec2 uv) {
  vec4 color = getSourceColor(uv);
  if (color.a <= 0.0) return color;

  // 相似度为 0 时完全无抠图，保留完整原始画面
  if (u_similarity <= 0.001) {
    if (u_invert > 0.5) return vec4(color.rgb, 0.0);
    return color;
  }

  vec2 pixelUV = rgb2uv(color.rgb);
  vec2 keyUV = rgb2uv(u_keyColor);
  
  // 色度空间实际欧式距离 (UV 色彩偏移)
  float chromaDist = length(pixelUV - keyUV);
  
  // 结合适量 RGB 色差微调
  float rgbDist = length(color.rgb - u_keyColor) / 1.73205;
  float dist = mix(chromaDist, rgbDist, 0.12);

  // 平滑渐进校准：相似度 (0% ~ 100%) 均匀分布在全量程 (0.0 ~ 0.22)，50% 恰好为适中强度
  float normSim = pow(clamp(u_similarity, 0.0, 1.0), 1.2);
  float threshold = normSim * 0.22;
  float softness = max(0.001, u_smoothness * 0.12);

  float edge0 = max(0.0, threshold - softness * 0.5);
  float edge1 = threshold + softness * 0.5;

  float alpha = clamp((dist - edge0) / max(0.0001, edge1 - edge0), 0.0, 1.0);
  alpha = smoothstep(0.0, 1.0, alpha);
  
  if (u_invert > 0.5) {
    alpha = 1.0 - alpha;
  }

  vec3 outRgb = color.rgb;

  // 边缘溢色消除
  if (u_spill > 0.0 && alpha < 0.99) {
    float spillAmount = u_spill * (1.0 - alpha);
    if (u_keyColor.g > u_keyColor.r && u_keyColor.g > u_keyColor.b) {
      float maxRB = max(outRgb.r, outRgb.b);
      if (outRgb.g > maxRB) {
        outRgb.g = mix(outRgb.g, maxRB, spillAmount);
      }
    } else if (u_keyColor.b > u_keyColor.r && u_keyColor.b > u_keyColor.g) {
      float maxRG = max(outRgb.r, outRgb.g);
      if (outRgb.b > maxRG) {
        outRgb.b = mix(outRgb.b, maxRG, spillAmount);
      }
    }
  }

  return vec4(outRgb, color.a * alpha);
}
`,
				uniforms: ({ effectParams }) => {
					const rgb = hexToRgb(String(effectParams.keyColor ?? "#00FF00"));
					return {
						u_keyColor: rgb,
						u_similarity: Number(effectParams.similarity ?? 0.1),
						u_smoothness: Number(effectParams.smoothness ?? 0.03),
						u_spill: Number(effectParams.spill ?? 0.2),
						u_invert: effectParams.invert ? 1.0 : 0.0,
					};
				},
			},
		],
	},
};

export const lumaKeyEffect: EffectDefinition = {
	type: "luma-key",
	name: "明度抠图",
	category: "color",
	icon: "🌓",
	description: "一键快速抠除纯黑或纯白背景，适用于光效叠加与线稿免抠",
	keywords: ["luma", "black key", "white key", "cutout", "黑底", "白底", "去黑底", "去白底", "明度"],
	params: [
		{
			key: "mode",
			label: "抠图模式",
			type: "select",
			default: "black",
			options: [
				{ label: "抠除黑底 (黑底转透明)", value: "black" },
				{ label: "抠除白底 (白底转透明)", value: "white" },
			],
		},
		{
			key: "threshold",
			label: "明度阈值",
			type: "number",
			default: 0.15,
			min: 0.0,
			max: 1.0,
			step: 0.01,
		},
		{
			key: "smoothness",
			label: "平滑过渡",
			type: "number",
			default: 0.08,
			min: 0.0,
			max: 0.5,
			step: 0.01,
		},
	],
	renderer: {
		passes: [
			{
				shader: "luma-key",
				glsl: `
uniform float u_mode;
uniform float u_threshold;
uniform float u_smoothness;

vec4 filterPixel(vec2 uv) {
  vec4 color = getSourceColor(uv);
  if (color.a <= 0.0) return color;

  float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  float alpha = 1.0;

  if (u_mode < 0.5) {
    // 抠除黑底
    alpha = smoothstep(u_threshold, u_threshold + max(0.001, u_smoothness), luma);
  } else {
    // 抠除白底
    alpha = 1.0 - smoothstep(1.0 - u_threshold - max(0.001, u_smoothness), 1.0 - u_threshold, luma);
  }

  return vec4(color.rgb, color.a * alpha);
}
`,
				uniforms: ({ effectParams }) => ({
					u_mode: effectParams.mode === "white" ? 1.0 : 0.0,
					u_threshold: Number(effectParams.threshold ?? 0.15),
					u_smoothness: Number(effectParams.smoothness ?? 0.08),
				}),
			},
		],
	},
};
