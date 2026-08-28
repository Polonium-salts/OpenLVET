import type { EffectDefinition } from "../types";

export const rgbSplitEffect: EffectDefinition = {
	type: "rgb-split",
	name: "色相分离",
	category: "glitch",
	icon: "🔴",
	description: "RGB 红绿蓝色彩通道分离抖动 (抖音故障风)",
	keywords: ["rgb", "split", "glitch", "chromatic", "aberration", "色差", "分离"],
	params: [
		{
			key: "offset",
			label: "分离距离",
			type: "number",
			default: 12,
			min: 0,
			max: 50,
			step: 1,
		},
		{
			key: "angle",
			label: "分离角度",
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
				shader: "rgb-split",
				glsl: `
uniform float u_offset;
uniform float u_angle;

vec4 filterPixel(vec2 uv) {
  float rad = radians(u_angle);
  vec2 dir = vec2(cos(rad), sin(rad)) * (u_offset / u_resolution);
  vec4 cr = getSourceColor(uv + dir);
  vec4 cg = getSourceColor(uv);
  vec4 cb = getSourceColor(uv - dir);
  return vec4(cr.r, cg.g, cb.b, max(cg.a, max(cr.a, cb.a)));
}
`,
				uniforms: ({ effectParams }) => ({
					u_offset: Number(effectParams.offset ?? 12),
					u_angle: Number(effectParams.angle ?? 0),
				}),
			},
		],
	},
};

export const glitchEffect: EffectDefinition = {
	type: "glitch",
	name: "数码故障",
	category: "glitch",
	icon: "⚡",
	description: "数字信号扫描线撕裂与噪点毛刺",
	keywords: ["glitch", "cyberpunk", "noise", "tear", "故障", "赛博朋克", "撕裂"],
	params: [
		{
			key: "slices",
			label: "切片密度",
			type: "number",
			default: 16,
			min: 2,
			max: 40,
			step: 1,
		},
		{
			key: "offset",
			label: "撕裂强度",
			type: "number",
			default: 20,
			min: 0,
			max: 60,
			step: 1,
		},
		{
			key: "chromatic",
			label: "色散偏移",
			type: "number",
			default: 8,
			min: 0,
			max: 30,
			step: 1,
		},
	],
	renderer: {
		passes: [
			{
				shader: "glitch",
				glsl: `
uniform float u_slices;
uniform float u_offset;
uniform float u_chromatic;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

vec4 filterPixel(vec2 uv) {
  float slice = floor(uv.y * u_slices);
  float rnd = hash(slice + floor(u_time * 8.0));
  float shift = (rnd > 0.65) ? (hash(slice * 1.7) - 0.5) * (u_offset / u_resolution.x) : 0.0;
  vec2 uvGlitch = vec2(uv.x + shift, uv.y);

  float chr = u_chromatic / u_resolution.x;
  float r = getSourceColor(vec2(uvGlitch.x + chr, uvGlitch.y)).r;
  float g = getSourceColor(uvGlitch).g;
  float b = getSourceColor(vec2(uvGlitch.x - chr, uvGlitch.y)).b;
  float a = getSourceColor(uvGlitch).a;

  // Scanline dark line
  float scanline = sin(uv.y * u_resolution.y * 1.2) * 0.06;
  return vec4(clamp(vec3(r, g, b) - scanline, 0.0, 1.0), a);
}
`,
				uniforms: ({ effectParams }) => ({
					u_slices: Number(effectParams.slices ?? 16),
					u_offset: Number(effectParams.offset ?? 20),
					u_chromatic: Number(effectParams.chromatic ?? 8),
				}),
			},
		],
	},
};
