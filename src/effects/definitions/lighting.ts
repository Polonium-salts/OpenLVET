import type { EffectDefinition } from "../types";

export const bloomEffect: EffectDefinition = {
	type: "bloom",
	name: "梦幻辉光",
	category: "lighting",
	icon: "✨",
	description: "高光溢出扩散与唯美柔焦泛光光晕",
	keywords: ["bloom", "glow", "radiance", "soft", "light", "辉光", "泛光", "光晕", "梦幻"],
	params: [
		{
			key: "threshold",
			label: "高光阈值",
			type: "number",
			default: 0.5,
			min: 0.0,
			max: 1.0,
			step: 0.05,
		},
		{
			key: "intensity",
			label: "辉光强度",
			type: "number",
			default: 1.4,
			min: 0.2,
			max: 3.0,
			step: 0.1,
		},
		{
			key: "radius",
			label: "扩散半径",
			type: "number",
			default: 10.0,
			min: 2.0,
			max: 30.0,
			step: 1.0,
		},
	],
	renderer: {
		passes: [
			{
				shader: "bloom",
				glsl: `
uniform float u_threshold;
uniform float u_intensity;
uniform float u_radius;

vec4 filterPixel(vec2 uv) {
  vec4 base = getSourceColor(uv);
  vec3 glow = vec3(0.0);
  float totalWeight = 0.0;
  
  vec2 stepSize = (u_radius / u_resolution) / 4.0;
  for (float x = -3.0; x <= 3.0; x += 1.0) {
    for (float y = -3.0; y <= 3.0; y += 1.0) {
      vec2 offset = vec2(x, y) * stepSize;
      vec4 s = getSourceColor(uv + offset);
      float luma = dot(s.rgb, vec3(0.299, 0.587, 0.114));
      float factor = max(0.0, luma - u_threshold) / (1.0 - u_threshold + 0.001);
      float w = 1.0 / (1.0 + length(vec2(x, y)));
      glow += s.rgb * factor * w;
      totalWeight += w;
    }
  }
  glow = (glow / totalWeight) * u_intensity;
  return vec4(clamp(base.rgb + glow, 0.0, 1.0), base.a);
}
`,
				uniforms: ({ effectParams }) => ({
					u_threshold: Number(effectParams.threshold ?? 0.5),
					u_intensity: Number(effectParams.intensity ?? 1.4),
					u_radius: Number(effectParams.radius ?? 10.0),
				}),
			},
		],
	},
};

export const zoomBlurEffect: EffectDefinition = {
	type: "zoom-blur",
	name: "放射冲刺",
	category: "lighting",
	icon: "🚀",
	description: "中心向外极速冲刺放射状运动模糊",
	keywords: ["zoom", "blur", "radial", "speed", "rush", "放射", "模糊", "冲刺", "速度"],
	params: [
		{
			key: "strength",
			label: "冲刺强度",
			type: "number",
			default: 0.3,
			min: 0.05,
			max: 1.0,
			step: 0.05,
		},
		{
			key: "centerX",
			label: "中心 X",
			type: "number",
			default: 0.5,
			min: 0.0,
			max: 1.0,
			step: 0.05,
		},
		{
			key: "centerY",
			label: "中心 Y",
			type: "number",
			default: 0.5,
			min: 0.0,
			max: 1.0,
			step: 0.05,
		},
	],
	renderer: {
		passes: [
			{
				shader: "zoom-blur",
				glsl: `
uniform float u_strength;
uniform float u_centerX;
uniform float u_centerY;

vec4 filterPixel(vec2 uv) {
  vec2 center = vec2(u_centerX, u_centerY);
  vec2 toCenter = center - uv;
  vec4 color = vec4(0.0);
  float total = 0.0;
  
  for (float t = 0.0; t <= 16.0; t += 1.0) {
    float percent = (t + 0.5) / 16.0;
    float weight = 4.0 * (percent - percent * percent);
    vec4 s = getSourceColor(uv + toCenter * percent * u_strength * 0.4);
    color += s * weight;
    total += weight;
  }
  return color / total;
}
`,
				uniforms: ({ effectParams }) => ({
					u_strength: Number(effectParams.strength ?? 0.3),
					u_centerX: Number(effectParams.centerX ?? 0.5),
					u_centerY: Number(effectParams.centerY ?? 0.5),
				}),
			},
		],
	},
};

export const motionBlurEffect: EffectDefinition = {
	type: "motion-blur",
	name: "速度拖影",
	category: "lighting",
	icon: "💨",
	description: "电影级特定方向高速运动拖影模糊",
	keywords: ["motion", "blur", "speed", "velocity", "拖影", "运动", "速度"],
	params: [
		{
			key: "velocity",
			label: "拖影距离",
			type: "number",
			default: 20.0,
			min: 2.0,
			max: 80.0,
			step: 2.0,
		},
		{
			key: "angle",
			label: "运动方向",
			type: "number",
			default: 0.0,
			min: 0.0,
			max: 360.0,
			step: 5.0,
		},
	],
	renderer: {
		passes: [
			{
				shader: "motion-blur",
				glsl: `
uniform float u_velocity;
uniform float u_angle;

vec4 filterPixel(vec2 uv) {
  float rad = radians(u_angle);
  vec2 dir = vec2(cos(rad), sin(rad)) * (u_velocity / u_resolution);
  vec4 color = vec4(0.0);
  
  for (float i = -7.0; i <= 7.0; i += 1.0) {
    vec2 offset = dir * (i / 7.0);
    color += getSourceColor(uv + offset);
  }
  return color / 15.0;
}
`,
				uniforms: ({ effectParams }) => ({
					u_velocity: Number(effectParams.velocity ?? 20.0),
					u_angle: Number(effectParams.angle ?? 0.0),
				}),
			},
		],
	},
};
