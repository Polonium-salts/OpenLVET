import type { EffectDefinition } from "../types";

export const pixelateEffect: EffectDefinition = {
	type: "pixelate",
	name: "复古像素",
	category: "distortion",
	icon: "👾",
	description: "8-bit 经典像素块与马赛克风格",
	keywords: ["pixel", "mosaic", "8bit", "retro", "像素", "马赛克", "复古"],
	params: [
		{
			key: "pixelSize",
			label: "像素尺寸",
			type: "number",
			default: 14,
			min: 2,
			max: 64,
			step: 2,
		},
	],
	renderer: {
		passes: [
			{
				shader: "pixelate",
				glsl: `
uniform float u_pixelSize;

vec4 filterPixel(vec2 uv) {
  vec2 d = u_pixelSize / u_resolution;
  vec2 coord = floor(uv / d) * d + d * 0.5;
  return getSourceColor(coord);
}
`,
				uniforms: ({ effectParams }) => ({
					u_pixelSize: Number(effectParams.pixelSize ?? 14),
				}),
			},
		],
	},
};

export const twistEffect: EffectDefinition = {
	type: "twist",
	name: "旋涡扭曲",
	category: "distortion",
	icon: "🌀",
	description: "中心向外螺旋扭曲与黑洞吸引视效",
	keywords: ["twist", "swirl", "vortex", "warp", "扭曲", "旋涡", "螺旋"],
	params: [
		{
			key: "radius",
			label: "扭曲半径",
			type: "number",
			default: 0.5,
			min: 0.1,
			max: 1.0,
			step: 0.05,
		},
		{
			key: "angle",
			label: "旋转角度",
			type: "number",
			default: 4.0,
			min: -15.0,
			max: 15.0,
			step: 0.5,
		},
	],
	renderer: {
		passes: [
			{
				shader: "twist",
				glsl: `
uniform float u_radius;
uniform float u_angle;

vec4 filterPixel(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 tc = uv - center;
  tc.x *= u_resolution.x / u_resolution.y;
  float dist = length(tc);
  if (dist < u_radius) {
    float percent = (u_radius - dist) / u_radius;
    float theta = percent * percent * u_angle;
    float s = sin(theta);
    float c = cos(theta);
    tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c)));
  }
  tc.x *= u_resolution.y / u_resolution.x;
  return getSourceColor(tc + center);
}
`,
				uniforms: ({ effectParams }) => ({
					u_radius: Number(effectParams.radius ?? 0.5),
					u_angle: Number(effectParams.angle ?? 4.0),
				}),
			},
		],
	},
};

export const bulgePinchEffect: EffectDefinition = {
	type: "bulge-pinch",
	name: "鱼眼膨胀",
	category: "distortion",
	icon: "🐡",
	description: "凸透镜凸起膨胀或凹透镜收缩挤压",
	keywords: ["bulge", "pinch", "fisheye", "magnify", "膨胀", "鱼眼", "挤压"],
	params: [
		{
			key: "radius",
			label: "影响半径",
			type: "number",
			default: 0.45,
			min: 0.1,
			max: 1.0,
			step: 0.05,
		},
		{
			key: "strength",
			label: "变形强度",
			type: "number",
			default: 0.6,
			min: -1.0,
			max: 1.0,
			step: 0.05,
		},
	],
	renderer: {
		passes: [
			{
				shader: "bulge-pinch",
				glsl: `
uniform float u_radius;
uniform float u_strength;

vec4 filterPixel(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 coord = uv - center;
  coord.x *= u_resolution.x / u_resolution.y;
  float dist = length(coord);
  if (dist < u_radius) {
    float percent = dist / u_radius;
    if (u_strength > 0.0) {
      coord *= mix(1.0, smoothstep(0.0, u_radius / dist, percent), u_strength * 0.75);
    } else {
      coord *= mix(1.0, pow(percent, 1.0 + u_strength * 0.75) * u_radius / dist, 1.0 - percent);
    }
  }
  coord.x *= u_resolution.y / u_resolution.x;
  return getSourceColor(coord + center);
}
`,
				uniforms: ({ effectParams }) => ({
					u_radius: Number(effectParams.radius ?? 0.45),
					u_strength: Number(effectParams.strength ?? 0.6),
				}),
			},
		],
	},
};

export const shockwaveEffect: EffectDefinition = {
	type: "shockwave",
	name: "冲击水波",
	category: "distortion",
	icon: "🌊",
	description: "中心向外扩散的水波涟漪与震荡折射",
	keywords: ["shockwave", "wave", "ripple", "water", "冲击波", "水波", "涟漪"],
	params: [
		{
			key: "progress",
			label: "波纹进度",
			type: "number",
			default: 0.5,
			min: 0.0,
			max: 1.0,
			step: 0.02,
		},
		{
			key: "amplitude",
			label: "波纹振幅",
			type: "number",
			default: 25.0,
			min: 0.0,
			max: 60.0,
			step: 1.0,
		},
		{
			key: "wavelength",
			label: "波长跨度",
			type: "number",
			default: 120.0,
			min: 20.0,
			max: 300.0,
			step: 10.0,
		},
	],
	renderer: {
		passes: [
			{
				shader: "shockwave",
				glsl: `
uniform float u_progress;
uniform float u_amplitude;
uniform float u_wavelength;

vec4 filterPixel(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 tc = uv - center;
  tc.x *= u_resolution.x / u_resolution.y;
  float dist = length(tc);
  float radius = u_progress * 0.9;
  float halfW = (u_wavelength / u_resolution.y) * 0.5;

  if (dist >= (radius - halfW) && dist <= (radius + halfW)) {
    float diff = (dist - radius) / halfW;
    float powDiff = 1.0 - pow(abs(diff), 0.8);
    float diffOffset = diff * powDiff;
    vec2 dir = normalize(tc);
    vec2 offset = dir * (diffOffset * (u_amplitude / u_resolution.y));
    offset.x *= u_resolution.y / u_resolution.x;
    return getSourceColor(uv - offset);
  }
  return getSourceColor(uv);
}
`,
				uniforms: ({ effectParams }) => ({
					u_progress: Number(effectParams.progress ?? 0.5),
					u_amplitude: Number(effectParams.amplitude ?? 25.0),
					u_wavelength: Number(effectParams.wavelength ?? 120.0),
				}),
			},
		],
	},
};
