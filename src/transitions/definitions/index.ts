import type { TransitionDefinition } from "../types";

export const TRANSITION_DEFINITIONS: TransitionDefinition[] = [
	// ─── 基础与叠化 (Basic & Fade) ──────────────────────────────────────────
	{
		id: "crossfade",
		name: "叠化溶解",
		category: "basic",
		keywords: ["叠化", "溶解", "淡入淡出", "fade", "dissolve", "crossfade"],
		glsl: `
vec4 transition (vec2 uv) {
  return mix(
    getFromColor(uv),
    getToColor(uv),
    progress
  );
}
`,
	},
	{
		id: "fadeblack",
		name: "闪黑淡出",
		category: "basic",
		keywords: ["闪黑", "黑场", "fade to black", "dip to black"],
		glsl: `
vec4 transition (vec2 uv) {
  if (progress < 0.5) {
    return mix(getFromColor(uv), vec4(0.0, 0.0, 0.0, 1.0), progress * 2.0);
  } else {
    return mix(vec4(0.0, 0.0, 0.0, 1.0), getToColor(uv), (progress - 0.5) * 2.0);
  }
}
`,
	},
	{
		id: "fadewhite",
		name: "闪白光晕",
		category: "basic",
		keywords: ["闪白", "白光", "高光", "fade to white", "flash"],
		glsl: `
vec4 transition (vec2 uv) {
  if (progress < 0.5) {
    return mix(getFromColor(uv), vec4(1.0, 1.0, 1.0, 1.0), progress * 2.0);
  } else {
    return mix(vec4(1.0, 1.0, 1.0, 1.0), getToColor(uv), (progress - 0.5) * 2.0);
  }
}
`,
	},
	{
		id: "colorphase",
		name: "色彩幻变",
		category: "basic",
		keywords: ["色彩", "渐变", "color phase", "phase"],
		glsl: `
vec4 transition (vec2 uv) {
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  return mix(a, b, smoothstep(0.0, 1.0, progress));
}
`,
	},

	// ─── 运镜与推拉 (Motion & Slide) ─────────────────────────────────────────
	{
		id: "slideLeft",
		name: "向左推入",
		category: "motion",
		keywords: ["推入", "向左", "slide left", "push"],
		glsl: `
vec4 transition (vec2 uv) {
  float p = progress;
  if (uv.x < 1.0 - p) {
    return getFromColor(uv + vec2(p, 0.0));
  } else {
    return getToColor(uv - vec2(1.0 - p, 0.0));
  }
}
`,
	},
	{
		id: "slideRight",
		name: "向右推入",
		category: "motion",
		keywords: ["推入", "向右", "slide right", "push"],
		glsl: `
vec4 transition (vec2 uv) {
  float p = progress;
  if (uv.x > p) {
    return getFromColor(uv - vec2(p, 0.0));
  } else {
    return getToColor(uv + vec2(1.0 - p, 0.0));
  }
}
`,
	},
	{
		id: "slideUp",
		name: "向上推入",
		category: "motion",
		keywords: ["推入", "向上", "slide up", "push"],
		glsl: `
vec4 transition (vec2 uv) {
  float p = progress;
  if (uv.y < 1.0 - p) {
    return getFromColor(uv + vec2(0.0, p));
  } else {
    return getToColor(uv - vec2(0.0, 1.0 - p));
  }
}
`,
	},
	{
		id: "slideDown",
		name: "向下推入",
		category: "motion",
		keywords: ["推入", "向下", "slide down", "push"],
		glsl: `
vec4 transition (vec2 uv) {
  float p = progress;
  if (uv.y > p) {
    return getFromColor(uv - vec2(0.0, p));
  } else {
    return getToColor(uv + vec2(0.0, 1.0 - p));
  }
}
`,
	},
	{
		id: "wind",
		name: "疾风推移",
		category: "motion",
		keywords: ["风", "疾风", "wind", "speed"],
		glsl: `
float rand (vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
vec4 transition (vec2 uv) {
  float size = 0.2;
  float r = rand(vec2(0.0, uv.y));
  float m = smoothstep(0.0, -size, uv.x * (1.0-size) + size * r - (progress * (1.0 + size)));
  return mix(getFromColor(uv), getToColor(uv), m);
}
`,
	},

	// ─── 形状与划像 (Shapes & Wipe) ──────────────────────────────────────────
	{
		id: "wipeLeft",
		name: "左向划像",
		category: "shapes",
		keywords: ["划像", "向左", "wipe left"],
		glsl: `
vec4 transition (vec2 uv) {
  vec2 p = uv;
  return mix(getFromColor(p), getToColor(p), step(1.0 - progress, p.x));
}
`,
	},
	{
		id: "wipeRight",
		name: "右向划像",
		category: "shapes",
		keywords: ["划像", "向右", "wipe right"],
		glsl: `
vec4 transition (vec2 uv) {
  vec2 p = uv;
  return mix(getFromColor(p), getToColor(p), step(p.x, progress));
}
`,
	},
	{
		id: "circleOpen",
		name: "圆形开幕",
		category: "shapes",
		keywords: ["圆形", "遮罩", "开幕", "circle", "iris"],
		glsl: `
vec4 transition (vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  float distance = length((uv - center) * vec2(ratio, 1.0));
  float radius = progress * 1.5;
  return mix(getFromColor(uv), getToColor(uv), step(distance, radius));
}
`,
	},
	{
		id: "radial",
		name: "径向扫描",
		category: "shapes",
		keywords: ["径向", "旋转", "扫描", "radial", "clock"],
		glsl: `
#define PI 3.141592653589793
vec4 transition (vec2 uv) {
  vec2 rp = uv - vec2(0.5, 0.5);
  float a = atan(rp.y, rp.x) + PI;
  float pa = progress * 2.0 * PI;
  return mix(getFromColor(uv), getToColor(uv), step(a, pa));
}
`,
	},
	{
		id: "squares",
		name: "方块碎裂",
		category: "shapes",
		keywords: ["方块", "马赛克", "像素", "squares", "grid"],
		glsl: `
vec4 transition (vec2 uv) {
  vec2 size = vec2(10.0, 10.0);
  vec2 p = floor(uv * size) / size;
  float pr = smoothstep(0.0, 1.0, (progress*1.4 - 0.2 + (p.x + p.y)*0.4 / 2.0));
  return mix(getFromColor(uv), getToColor(uv), pr);
}
`,
	},
	{
		id: "pixelize",
		name: "像素粒子",
		category: "shapes",
		keywords: ["像素", "复古", "pixelize", "mosaic"],
		glsl: `
vec4 transition (vec2 uv) {
  float d = min(progress, 1.0 - progress);
  float strength = floor(d * 40.0 + 1.0);
  vec2 size = vec2(strength, strength);
  vec2 p = floor(uv * size) / size;
  return mix(getFromColor(p), getToColor(p), progress);
}
`,
	},

	// ─── 创意与光效 (Creative & Glitch) ───────────────────────────────────────
	{
		id: "dreamy",
		name: "梦幻光晕",
		category: "creative",
		keywords: ["梦幻", "光斑", "光晕", "dreamy", "glow"],
		glsl: `
vec4 transition (vec2 uv) {
  return mix(
    getFromColor(uv + vec2(progress * 0.05, 0.0)),
    getToColor(uv - vec2((1.0 - progress) * 0.05, 0.0)),
    progress
  );
}
`,
	},
	{
		id: "glitch",
		name: "故障毛刺",
		category: "creative",
		keywords: ["故障", "毛刺", "赛博朋克", "glitch", "cyberpunk"],
		glsl: `
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
vec4 transition (vec2 uv) {
  float block = floor(uv.y * 20.0);
  float displace = (hash(vec2(block, floor(progress * 10.0))) - 0.5) * 0.1 * sin(progress * 3.14159);
  vec2 uvFrom = uv + vec2(displace, 0.0);
  vec2 uvTo = uv - vec2(displace, 0.0);
  return mix(getFromColor(uvFrom), getToColor(uvTo), progress);
}
`,
	},
	{
		id: "swirl",
		name: "漩涡扭曲",
		category: "creative",
		keywords: ["漩涡", "扭曲", "黑洞", "swirl", "twist"],
		glsl: `
vec4 transition (vec2 uv) {
  float Radius = 1.0;
  float Angle = 3.0;
  vec2 center = vec2(0.5, 0.5);
  vec2 tc = uv - center;
  float dist = length(tc);
  if (dist < Radius) {
    float percent = (Radius - dist) / Radius;
    float theta = percent * percent * Angle * 8.0 * (0.5 - abs(progress - 0.5));
    float s = sin(theta);
    float c = cos(theta);
    tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c)));
  }
  tc += center;
  return mix(getFromColor(tc), getToColor(tc), progress);
}
`,
	},
	{
		id: "ripple",
		name: "水波涟漪",
		category: "creative",
		keywords: ["水波", "涟漪", "波纹", "ripple", "water"],
		glsl: `
vec4 transition (vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = length(toCenter);
  float wave = sin(dist * 30.0 - progress * 15.0) * 0.03 * (1.0 - progress) * progress * 4.0;
  vec2 warpedUv = uv + normalize(toCenter) * wave;
  return mix(getFromColor(warpedUv), getToColor(warpedUv), progress);
}
`,
	},
	{
		id: "doomScreen",
		name: "融化下坠",
		category: "creative",
		keywords: ["融化", "下坠", "液化", "doom", "melt"],
		glsl: `
float randD(int num) {
  return fract(mod(float(num) * 67123.989, 23.32));
}
vec4 transition (vec2 uv) {
  int bar = int(uv.x * 20.0);
  float scale = 1.0 + randD(bar) * 0.8;
  float phase = progress * scale;
  if (phase > 0.0) {
    uv.y += phase * phase;
  }
  if (uv.y > 1.0) {
    return getToColor(vec2(uv.x, uv.y - 1.0));
  }
  return mix(getFromColor(uv), getToColor(uv), progress);
}
`,
	},

	// ─── 3D与缩放 (3D & Zoom) ────────────────────────────────────────────────
	{
		id: "simpleZoom",
		name: "镜头推焦",
		category: "3d",
		keywords: ["推焦", "缩放", "zoom", "scale", "focus"],
		glsl: `
vec2 zoom(vec2 uv, float amount) {
  return 0.5 + ((uv - 0.5) * (1.0 - amount));
}
vec4 transition (vec2 uv) {
  float nquick = clamp(progress * 1.5, 0.0, 1.0);
  return mix(
    getFromColor(zoom(uv, nquick * 0.3)),
    getToColor(uv),
    smoothstep(0.3, 1.0, progress)
  );
}
`,
	},
	{
		id: "doorway",
		name: "立体开门",
		category: "3d",
		keywords: ["开门", "穿梭", "3D", "doorway", "enter"],
		glsl: `
vec4 transition (vec2 uv) {
  float p = progress;
  vec2 p1 = uv;
  vec2 p2 = uv;
  if (uv.x < 0.5) {
    p1.x -= p * 0.5;
  } else {
    p1.x += p * 0.5;
  }
  vec4 c1 = getFromColor(p1);
  vec4 c2 = getToColor(p2);
  return mix(c1, c2, p);
}
`,
	},
	{
		id: "cube",
		name: "3D 立方体",
		category: "3d",
		keywords: ["立方体", "旋转", "3D", "cube", "rotate"],
		glsl: `
vec4 transition (vec2 uv) {
  float p = progress;
  float x = uv.x;
  if (p < 0.5) {
    float uz = (1.0 - p * 2.0);
    vec2 pA = vec2((uv.x - p) / max(0.001, uz), uv.y);
    return mix(getFromColor(pA), vec4(0.0), step(1.0, pA.x) + step(pA.x, 0.0));
  } else {
    float uz = (p - 0.5) * 2.0;
    vec2 pB = vec2((uv.x - (1.0 - p)) / max(0.001, uz), uv.y);
    return mix(getToColor(pB), vec4(0.0), step(1.0, pB.x) + step(pB.x, 0.0));
  }
}
`,
	},
];

export const TRANSITION_MAP = new Map<string, TransitionDefinition>(
	TRANSITION_DEFINITIONS.map((def) => [def.id, def]),
);

export function getTransitionDefinition(id: string): TransitionDefinition | undefined {
	return TRANSITION_MAP.get(id);
}
