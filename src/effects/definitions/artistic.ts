import type { EffectDefinition } from "../types";

export const oldFilmEffect: EffectDefinition = {
	type: "old-film",
	name: "复古胶片",
	category: "retro",
	icon: "🎞️",
	description: "老电影颗粒噪点、划痕抖动、暗角与复古暖褐色",
	keywords: ["film", "vintage", "retro", "sepia", "scratch", "胶片", "复古", "老电影", "划痕"],
	params: [
		{
			key: "sepia",
			label: "暖褐复古色",
			type: "number",
			default: 0.7,
			min: 0.0,
			max: 1.0,
			step: 0.05,
		},
		{
			key: "noise",
			label: "胶片噪点",
			type: "number",
			default: 0.25,
			min: 0.0,
			max: 0.8,
			step: 0.05,
		},
		{
			key: "vignette",
			label: "镜头暗角",
			type: "number",
			default: 0.4,
			min: 0.0,
			max: 1.0,
			step: 0.05,
		},
	],
	renderer: {
		passes: [
			{
				shader: "old-film",
				glsl: `
uniform float u_sepia;
uniform float u_noise;
uniform float u_vignette;

float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 filterPixel(vec2 uv) {
  vec4 color = getSourceColor(uv);
  
  // Sepia tone conversion
  vec3 sepiaColor;
  sepiaColor.r = dot(color.rgb, vec3(0.393, 0.769, 0.189));
  sepiaColor.g = dot(color.rgb, vec3(0.349, 0.686, 0.168));
  sepiaColor.b = dot(color.rgb, vec3(0.272, 0.534, 0.131));
  vec3 rgb = mix(color.rgb, sepiaColor, u_sepia);

  // Grain noise
  float n = (rand(uv + fract(u_time * 17.13)) - 0.5) * u_noise;
  rgb += n;

  // Film scratches (vertical lines)
  float scratchX = fract(sin(floor(u_time * 5.0) * 123.45) * 678.9);
  if (abs(uv.x - scratchX) < 0.002) {
    rgb += 0.25 * (rand(uv + u_time) > 0.3 ? 1.0 : 0.0);
  }

  // Vignette
  float dist = distance(uv, vec2(0.5));
  float vig = smoothstep(0.75, 0.75 - u_vignette * 0.45, dist);
  rgb *= vig;

  return vec4(clamp(rgb, 0.0, 1.0), color.a);
}
`,
				uniforms: ({ effectParams }) => ({
					u_sepia: Number(effectParams.sepia ?? 0.7),
					u_noise: Number(effectParams.noise ?? 0.25),
					u_vignette: Number(effectParams.vignette ?? 0.4),
				}),
			},
		],
	},
};

export const dotEffect: EffectDefinition = {
	type: "dot",
	name: "波普网点",
	category: "retro",
	icon: "⚪",
	description: "波普艺术漫画印刷半色调圆点网格",
	keywords: ["dot", "halftone", "comic", "popart", "网点", "波普", "漫画"],
	params: [
		{
			key: "scale",
			label: "网格尺寸",
			type: "number",
			default: 10,
			min: 4,
			max: 32,
			step: 1,
		},
		{
			key: "angle",
			label: "网点角度",
			type: "number",
			default: 45,
			min: 0,
			max: 180,
			step: 5,
		},
	],
	renderer: {
		passes: [
			{
				shader: "dot",
				glsl: `
uniform float u_scale;
uniform float u_angle;

float pattern(vec2 uv) {
  float s = sin(radians(u_angle));
  float c = cos(radians(u_angle));
  vec2 tex = uv * u_resolution - 0.5 * u_resolution;
  vec2 point = vec2(c * tex.x - s * tex.y, s * tex.x + c * tex.y) * (1.0 / u_scale);
  return (sin(point.x) * sin(point.y)) * 4.0;
}

vec4 filterPixel(vec2 uv) {
  vec4 color = getSourceColor(uv);
  float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  float pat = pattern(uv);
  float c = clamp(luma * 10.0 - 5.0 + pat, 0.0, 1.0);
  return vec4(vec3(c), color.a);
}
`,
				uniforms: ({ effectParams }) => ({
					u_scale: Number(effectParams.scale ?? 10),
					u_angle: Number(effectParams.angle ?? 45),
				}),
			},
		],
	},
};

export const asciiEffect: EffectDefinition = {
	type: "ascii",
	name: "字符代码",
	category: "retro",
	icon: "📟",
	description: "赛博黑客 ASCII 字符终端矩阵与矩阵光栅",
	keywords: ["ascii", "matrix", "terminal", "hacker", "字符", "代码", "黑客"],
	params: [
		{
			key: "size",
			label: "字符尺寸",
			type: "number",
			default: 12,
			min: 6,
			max: 28,
			step: 2,
		},
		{
			key: "greenPhosphor",
			label: "荧光绿增益",
			type: "number",
			default: 1.0,
			min: 0.0,
			max: 1.0,
			step: 0.1,
		},
	],
	renderer: {
		passes: [
			{
				shader: "ascii",
				glsl: `
uniform float u_size;
uniform float u_greenPhosphor;

float character(int n, vec2 p) {
  p = floor(p * vec2(4.0, 4.0) + 2.5);
  if (clamp(p.x, 0.0, 4.0) == p.x && clamp(p.y, 0.0, 4.0) == p.y) {
    if (int(mod(p.x + p.y, 2.0)) == 0) return 1.0;
  }
  return 0.2;
}

vec4 filterPixel(vec2 uv) {
  vec2 d = u_size / u_resolution;
  vec2 blockCoord = floor(uv / d) * d + d * 0.5;
  vec4 color = getSourceColor(blockCoord);
  float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));

  vec2 charPos = fract(uv / d) - 0.5;
  float shape = smoothstep(0.4, 0.1, length(charPos)) * step(0.15, luma);

  vec3 rgb = mix(color.rgb, vec3(0.1, 1.0, 0.3) * luma, u_greenPhosphor);
  return vec4(rgb * (shape + 0.15), color.a);
}
`,
				uniforms: ({ effectParams }) => ({
					u_size: Number(effectParams.size ?? 12),
					u_greenPhosphor: Number(effectParams.greenPhosphor ?? 1.0),
				}),
			},
		],
	},
};

export const crossHatchEffect: EffectDefinition = {
	type: "cross-hatch",
	name: "素描排线",
	category: "retro",
	icon: "✏️",
	description: "手绘铅笔素描网状交叉排线阴影质感",
	keywords: ["sketch", "hatch", "pencil", "drawing", "素描", "手绘", "排线"],
	params: [
		{
			key: "spacing",
			label: "线条密度",
			type: "number",
			default: 6.0,
			min: 3.0,
			max: 16.0,
			step: 1.0,
		},
	],
	renderer: {
		passes: [
			{
				shader: "cross-hatch",
				glsl: `
uniform float u_spacing;

vec4 filterPixel(vec2 uv) {
  vec4 color = getSourceColor(uv);
  float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  float c = 1.0;

  if (luma < 0.8) {
    if (mod(gl_FragCoord.x + gl_FragCoord.y, u_spacing) < 1.0) c = 0.0;
  }
  if (luma < 0.6) {
    if (mod(gl_FragCoord.x - gl_FragCoord.y, u_spacing) < 1.0) c = 0.0;
  }
  if (luma < 0.4) {
    if (mod(gl_FragCoord.x + gl_FragCoord.y - u_spacing * 0.5, u_spacing) < 1.0) c = 0.0;
  }
  if (luma < 0.2) {
    if (mod(gl_FragCoord.x - gl_FragCoord.y - u_spacing * 0.5, u_spacing) < 1.0) c = 0.0;
  }

  return vec4(vec3(c), color.a);
}
`,
				uniforms: ({ effectParams }) => ({
					u_spacing: Number(effectParams.spacing ?? 6.0),
				}),
			},
		],
	},
};

export const embossEffect: EffectDefinition = {
	type: "emboss",
	name: "立体浮雕",
	category: "retro",
	icon: "🗿",
	description: "金属与石雕边缘光影凹凸立体浮雕",
	keywords: ["emboss", "3d", "relief", "stone", "浮雕", "立体", "金属"],
	params: [
		{
			key: "strength",
			label: "浮雕深度",
			type: "number",
			default: 2.0,
			min: 0.5,
			max: 6.0,
			step: 0.2,
		},
	],
	renderer: {
		passes: [
			{
				shader: "emboss",
				glsl: `
uniform float u_strength;

vec4 filterPixel(vec2 uv) {
  vec2 onePixel = u_strength / u_resolution;
  vec4 color = getSourceColor(uv);
  vec4 c1 = getSourceColor(uv - onePixel);
  vec4 c2 = getSourceColor(uv + onePixel);
  
  vec3 diff = c1.rgb - c2.rgb;
  float luma = dot(diff, vec3(0.299, 0.587, 0.114));
  vec3 rgb = vec3(0.5) + vec3(luma);
  return vec4(clamp(rgb, 0.0, 1.0), color.a);
}
`,
				uniforms: ({ effectParams }) => ({
					u_strength: Number(effectParams.strength ?? 2.0),
				}),
			},
		],
	},
};

export const vignetteEffect: EffectDefinition = {
	type: "vignette",
	name: "电影暗角",
	category: "retro",
	icon: "🎬",
	description: "电影镜头四周柔和渐变暗角聚焦主体",
	keywords: ["vignette", "dark", "cinema", "focus", "暗角", "电影", "聚焦"],
	params: [
		{
			key: "radius",
			label: "暗角范围",
			type: "number",
			default: 0.45,
			min: 0.1,
			max: 0.9,
			step: 0.05,
		},
		{
			key: "darkness",
			label: "暗化深度",
			type: "number",
			default: 0.65,
			min: 0.0,
			max: 1.0,
			step: 0.05,
		},
	],
	renderer: {
		passes: [
			{
				shader: "vignette",
				glsl: `
uniform float u_radius;
uniform float u_darkness;

vec4 filterPixel(vec2 uv) {
  vec4 color = getSourceColor(uv);
  vec2 coord = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
  float dist = length(coord);
  float vig = smoothstep(u_radius, u_radius + 0.4, dist);
  color.rgb = mix(color.rgb, color.rgb * (1.0 - u_darkness), vig);
  return color;
}
`,
				uniforms: ({ effectParams }) => ({
					u_radius: Number(effectParams.radius ?? 0.45),
					u_darkness: Number(effectParams.darkness ?? 0.65),
				}),
			},
		],
	},
};
