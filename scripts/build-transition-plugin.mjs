import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync, strToU8 } from "fflate";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const manifest = {
  id: "creative-transitions-pack",
  name: "创意转场预设大师 (Creative Transitions Master Pack)",
  version: "1.0.0",
  description: "为转场库提供 8 款高品质电影级与动感 WebGL 着色器转场预设（旋转缩放、胶片漏光、万花筒、液化流体、百叶窗、RGB色差、故障切片、引力黑洞），并包含转场工坊面板与自定义 GLSL 着色器预设创造器。",
  author: "OpenLVET Transition Lab",
  category: "visuals",
  tags: [
    "转场",
    "预设",
    "GLSL",
    "着色器",
    "电影感",
    "运镜",
    "光效",
    "故障",
    "万花筒"
  ],
  configSchema: [
    {
      key: "defaultDuration",
      label: "默认转场时长 (秒)",
      type: "select",
      default: 1.0,
      options: [
        { label: "⚡ 极速 (0.5 秒)", value: 0.5 },
        { label: "⏱️ 流畅 (0.8 秒)", value: 0.8 },
        { label: "🎬 标准 (1.0 秒)", value: 1.0 },
        { label: "🌟 柔和 (1.5 秒)", value: 1.5 },
        { label: "⏳ 舒缓 (2.0 秒)", value: 2.0 }
      ]
    },
    {
      key: "preferredPreset",
      label: "默认推荐转场",
      type: "select",
      default: "spin-zoom",
      options: [
        { label: "🌀 极速旋转缩放 (Spin Zoom)", value: "spin-zoom" },
        { label: "✨ 电影胶片漏光 (Light Leak)", value: "light-leak" },
        { label: "🔮 万花筒棱镜 (Kaleidoscope)", value: "kaleidoscope" },
        { label: "🌊 液化流体涟漪 (Liquid Wave)", value: "liquid-wave" },
        { label: "🧱 百叶窗划像 (Venetian Blinds)", value: "venetian-blinds" },
        { label: "🌈 RGB色差推进 (Chromatic Push)", value: "chromatic-aberration" },
        { label: "💥 赛博故障切片 (Glitch Displace)", value: "glitch-displace" },
        { label: "🌌 引力奇点黑洞 (Black Hole Warp)", value: "black-hole-warp" }
      ]
    },
    {
      key: "enableShaderStudio",
      label: "在左侧启用转场工坊面板",
      type: "boolean",
      default: true
    }
  ],
  defaultConfig: {
    defaultDuration: 1.0,
    preferredPreset: "spin-zoom",
    enableShaderStudio: true
  }
};

const indexJs = `// OpenLVET 创意转场预设大师 (Creative Transitions Master Pack)
module.exports = {
  manifest: ${JSON.stringify(manifest, null, 2)},

  activate: function(context) {
    var editor = context.editor;
    var React = (typeof window !== 'undefined' ? window.React : null) || (typeof React !== 'undefined' ? React : null) || (typeof require !== 'undefined' ? require('react') : null);

    // ─── 1. 定义 8 款高品质 WebGL GLSL 转场预设 ──────────────────────────────
    var PRESET_DEFINITIONS = [
      {
        id: "spin-zoom",
        name: "极速旋转缩放",
        category: "motion",
        keywords: ["旋转", "缩放", "推焦", "spin", "vortex", "zoom", "rotate"],
        glsl: \`
#define PI 3.14159265359
vec2 rotate(vec2 uv, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c) * (uv - 0.5) + 0.5;
}
vec2 zoom(vec2 uv, float factor) {
  return (uv - 0.5) * factor + 0.5;
}
vec4 transition(vec2 uv) {
  float p = progress;
  float angle = p * PI * 2.0;
  if (p < 0.5) {
    float scale = 1.0 + p * 2.0;
    vec2 rotUv = rotate(uv, angle * 0.5);
    vec2 zUv = zoom(rotUv, 1.0 / scale);
    return mix(getFromColor(zUv), vec4(1.0), p * 0.6);
  } else {
    float scale = 1.0 + (1.0 - p) * 2.0;
    vec2 rotUv = rotate(uv, (angle - PI * 2.0) * 0.5);
    vec2 zUv = zoom(rotUv, 1.0 / scale);
    return mix(vec4(1.0), getToColor(zUv), (p - 0.5) * 2.0);
  }
}
\`
      },
      {
        id: "light-leak",
        name: "胶片漏光耀斑",
        category: "creative",
        keywords: ["漏光", "胶片", "耀斑", "光晕", "light leak", "flare", "burn", "film"],
        glsl: \`
float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
vec4 transition(vec2 uv) {
  float p = progress;
  // 光晕中心摆动
  vec2 lightPos = vec2(0.5 + sin(p * 3.1415) * 0.3, 0.4 + cos(p * 3.1415) * 0.2);
  float dist = length((uv - lightPos) * vec2(ratio, 1.0));
  float flare = exp(-dist * 2.2) * sin(p * 3.14159) * 2.5;
  vec3 flareColor = vec3(1.0, 0.65, 0.25) * flare;

  vec4 fromCol = getFromColor(uv);
  vec4 toCol = getToColor(uv);
  vec4 mixedCol = mix(fromCol, toCol, smoothstep(0.1, 0.9, p));

  return vec4(mixedCol.rgb + flareColor, mixedCol.a);
}
\`
      },
      {
        id: "kaleidoscope",
        name: "万花筒棱镜",
        category: "creative",
        keywords: ["万花筒", "棱镜", "分形", "折射", "kaleidoscope", "prism", "crystal"],
        glsl: \`
#define PI 3.14159265359
vec2 kaleido(vec2 uv, float segments) {
  vec2 p = uv - 0.5;
  float r = length(p);
  float a = atan(p.y, p.x);
  float segmentAngle = 2.0 * PI / segments;
  a = mod(a, segmentAngle);
  if (a > segmentAngle * 0.5) {
    a = segmentAngle - a;
  }
  return vec2(cos(a), sin(a)) * r + 0.5;
}
vec4 transition(vec2 uv) {
  float p = progress;
  float segs = mix(1.0, 8.0, sin(p * PI));
  vec2 kUv = kaleido(uv, segs);
  return mix(getFromColor(kUv), getToColor(kUv), p);
}
\`
      },
      {
        id: "liquid-wave",
        name: "液化流体涟漪",
        category: "creative",
        keywords: ["液化", "水波", "流体", "涟漪", "liquid", "wave", "fluid", "distort"],
        glsl: \`
#define PI 3.14159265359
vec4 transition(vec2 uv) {
  float p = progress;
  vec2 center = vec2(0.5, 0.5);
  vec2 offset = uv - center;
  float d = length(offset);
  
  float wave = sin(d * 30.0 - p * 18.0) * (1.0 - p) * p * 0.08;
  vec2 distortedUv = uv + normalize(offset) * wave;
  
  return mix(getFromColor(distortedUv), getToColor(distortedUv), smoothstep(0.0, 1.0, p));
}
\`
      },
      {
        id: "venetian-blinds",
        name: "百叶窗划像",
        category: "shapes",
        keywords: ["百叶窗", "栅格", "切片", "venetian", "blinds", "grid", "slats"],
        glsl: \`
vec4 transition(vec2 uv) {
  float numBars = 12.0;
  float bar = fract(uv.y * numBars);
  float p = progress;
  if (bar < p) {
    return getToColor(uv);
  } else {
    return getFromColor(uv);
  }
}
\`
      },
      {
        id: "chromatic-aberration",
        name: "RGB色差推进",
        category: "motion",
        keywords: ["色差", "RGB", "推进", "冲刺", "chromatic", "aberration", "rgb split", "push"],
        glsl: \`
vec2 zoomUv(vec2 uv, float amt) {
  return (uv - 0.5) * amt + 0.5;
}
vec4 transition(vec2 uv) {
  float p = progress;
  float split = sin(p * 3.14159) * 0.04;
  
  vec2 rUv = zoomUv(uv, 1.0 + split * 1.5);
  vec2 gUv = zoomUv(uv, 1.0);
  vec2 bUv = zoomUv(uv, 1.0 - split * 1.5);
  
  vec4 rCol = mix(getFromColor(rUv), getToColor(rUv), p);
  vec4 gCol = mix(getFromColor(gUv), getToColor(gUv), p);
  vec4 bCol = mix(getFromColor(bUv), getToColor(bUv), p);
  
  return vec4(rCol.r, gCol.g, bCol.b, (rCol.a + gCol.a + bCol.a) / 3.0);
}
\`
      },
      {
        id: "glitch-displace",
        name: "赛博故障切片",
        category: "creative",
        keywords: ["故障", "赛博朋克", "切片", "噪点", "glitch", "displace", "cyberpunk"],
        glsl: \`
float rnd(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}
vec4 transition(vec2 uv) {
  float p = progress;
  float strength = sin(p * 3.14159);
  
  float slice = floor(uv.y * 24.0);
  float offset = (rnd(vec2(slice, floor(p * 15.0))) - 0.5) * 0.15 * strength;
  
  vec2 uvDisplaced = uv + vec2(offset, 0.0);
  vec4 cFrom = getFromColor(uvDisplaced);
  vec4 cTo = getToColor(uvDisplaced);
  
  vec4 col = mix(cFrom, cTo, p);
  // RGB 微分离
  if (strength > 0.3) {
    col.r = mix(getFromColor(uvDisplaced + vec2(0.01 * strength, 0.0)).r, cTo.r, p);
    col.b = mix(getFromColor(uvDisplaced - vec2(0.01 * strength, 0.0)).b, cTo.b, p);
  }
  return col;
}
\`
      },
      {
        id: "black-hole-warp",
        name: "引力奇点黑洞",
        category: "3d",
        keywords: ["黑洞", "引力", "奇点", "扭曲", "black hole", "singularity", "warp", "gravity"],
        glsl: \`
#define PI 3.14159265359
vec4 transition(vec2 uv) {
  float p = progress;
  vec2 center = vec2(0.5, 0.5);
  vec2 delta = (uv - center) * vec2(ratio, 1.0);
  float dist = length(delta);
  
  float strength = sin(p * PI) * 0.8;
  float twist = (1.0 - smoothstep(0.0, 0.7, dist)) * strength * 4.0;
  
  float angle = atan(delta.y, delta.x) + twist;
  float newDist = dist * (1.0 + (p < 0.5 ? -strength : strength * 0.8));
  
  vec2 warpedUv = center + vec2(cos(angle), sin(angle)) * newDist * vec2(1.0 / ratio, 1.0);
  
  vec4 c = mix(getFromColor(warpedUv), getToColor(warpedUv), smoothstep(0.3, 0.7, p));
  // 奇点中心暗化
  if (dist < strength * 0.15) {
    c = mix(c, vec4(0.0, 0.0, 0.0, 1.0), (1.0 - dist / (strength * 0.15)));
  }
  return c;
}
\`
      }
    ];

    // ─── 2. 注册预设至 OpenLVET 转场库 ─────────────────────────────────────────
    PRESET_DEFINITIONS.forEach(function(def) {
      context.transitions.registerTransition(def);
    });

    // 注册本地保存的用户自定义 GLSL 预设
    var customPresets = context.storage.get("customTransitions", []);
    if (Array.isArray(customPresets)) {
      customPresets.forEach(function(def) {
        if (def && def.id && def.name && def.glsl) {
          context.transitions.registerTransition(def);
        }
      });
    }

    // ─── 3. 时间轴添加转场工具方法 ────────────────────────────────────────────
    function applyTransitionToActiveCut(transitionId, durationSeconds) {
      var scene = editor.scenes.getActiveScene();
      if (!scene) {
        context.ui.showToast("当前未打开任何场景", { type: "error" });
        return;
      }

      var videoTrack = (scene.tracks.main.type === "video" && scene.tracks.main.elements.length >= 2)
        ? scene.tracks.main
        : (scene.tracks.overlay && scene.tracks.overlay.find(function(t) {
            return t.type === "video" && t.elements.length >= 2;
          }));

      if (!videoTrack || videoTrack.elements.length < 2) {
        context.ui.showToast("请先在时间轴放置至少两个相邻视频素材", { type: "info" });
        return;
      }

      var playheadTime = editor.playback.getCurrentTime();
      var sorted = videoTrack.elements.slice().sort(function(a, b) { return a.startTime - b.startTime; });

      var bestPair = null;
      var minDiff = Infinity;
      for (var i = 0; i < sorted.length - 1; i++) {
        var current = sorted[i];
        var next = sorted[i + 1];
        var cutTime = current.startTime + current.duration;
        var diff = Math.abs(playheadTime - cutTime);
        if (diff < minDiff) {
          minDiff = diff;
          bestPair = { fromId: current.id, toId: next.id };
        }
      }

      if (!bestPair) {
        bestPair = { fromId: sorted[0].id, toId: sorted[1].id };
      }

      var durTicks = Math.round((durationSeconds || context.config.get("defaultDuration", 1.0)) * 1000000);

      editor.timeline.addTransition({
        trackId: videoTrack.id,
        fromElementId: bestPair.fromId,
        toElementId: bestPair.toId,
        type: transitionId,
        duration: durTicks
      });

      context.ui.showToast("已成功应用转场预设！", { type: "success" });
    }

    // ─── 4. 注册快捷 Action (Alt+T) ───────────────────────────────────────────
    context.actions.registerAction({
      id: "apply-creative-transition",
      description: "快速应用创意转场至切点",
      defaultShortcut: "alt+t",
      category: "转场与运镜",
      handler: function() {
        var preferred = context.config.get("preferredPreset", "spin-zoom");
        var dur = context.config.get("defaultDuration", 1.0);
        applyTransitionToActiveCut(preferred, dur);
      }
    });

    // ─── 5. 注册顶部导航栏快速转场入口 ───────────────────────────────────────
    context.header.registerHeaderItem({
      id: "creative-transitions-header-badge",
      position: "left",
      order: 15,
      render: function() {
        if (!React) return null;
        return React.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(59, 130, 246, 0.15))",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              fontSize: "12px",
              fontWeight: "600",
              color: "#c084fc",
              cursor: "pointer",
              userSelect: "none"
            },
            onClick: function() {
              var preferred = context.config.get("preferredPreset", "spin-zoom");
              applyTransitionToActiveCut(preferred);
            },
            title: "点击一键应用推荐创意转场 (Alt+T)"
          },
          React.createElement("span", null, "⚡"),
          React.createElement("span", null, "转场大师")
        );
      }
    });

    // ─── 6. 注册左侧专属资产面板「转场工坊 (Transitions Studio)」───────────────
    if (context.config.get("enableShaderStudio", true)) {
      context.panels.registerAssetTab({
        id: "creative-transitions-studio-panel",
        label: "转场工坊",
        icon: "⚡",
        order: 4,
        render: function() {
          if (!React) return null;
          return React.createElement(TransitionsStudioPanelComponent, {
            context: context,
            presets: PRESET_DEFINITIONS,
            onApply: applyTransitionToActiveCut
          });
        }
      });
    }

    context.ui.showToast("创意转场预设大师已激活，8 款全新转场已注入转场库！", { type: "success" });
  }
};

// ─── React UI 组件: 转场工坊资产面板 ──────────────────────────────────────────
function TransitionsStudioPanelComponent(props) {
  var React = (typeof window !== 'undefined' ? window.React : null) || (typeof React !== 'undefined' ? React : null) || (typeof require !== 'undefined' ? require('react') : null);
  if (!React) return null;

  var context = props.context;
  var presets = props.presets;
  var onApply = props.onApply;

  var useState = React.useState;
  var useEffect = React.useEffect;
  var useRef = React.useRef;

  var _tabState = useState("presets"); // "presets" | "creator"
  var activeSubTab = _tabState[0];
  var setActiveSubTab = _tabState[1];

  var _durState = useState(context.config.get("defaultDuration", 1.0));
  var duration = _durState[0];
  var setDuration = _durState[1];

  var _customState = useState(function() {
    return context.storage.get("customTransitions", []);
  });
  var customList = _customState[0];
  var setCustomList = _customState[1];

  // Creator state
  var _newIdState = useState("my-custom-transition");
  var newId = _newIdState[0];
  var setNewId = _newIdState[1];

  var _newNameState = useState("霓虹光波扭曲");
  var newName = _newNameState[0];
  var setNewName = _newNameState[1];

  var _newGlslState = useState(
\`vec4 transition(vec2 uv) {
  vec2 p = uv - vec2(0.5);
  float r = length(p);
  float wave = sin(r * 25.0 - progress * 10.0) * 0.05 * sin(progress * 3.14159);
  vec2 warped = uv + normalize(p) * wave;
  return mix(getFromColor(warped), getToColor(warped), progress);
}\`
  );
  var newGlsl = _newGlslState[0];
  var setNewGlsl = _newGlslState[1];

  var handleSaveCustom = function() {
    if (!newId.trim() || !newName.trim() || !newGlsl.trim()) {
      context.ui.showToast("请填写完整的 ID、名称与 GLSL 源码", { type: "error" });
      return;
    }

    var def = {
      id: newId.trim(),
      name: newName.trim(),
      category: "creative",
      keywords: ["自定义", newName.trim(), newId.trim()],
      glsl: newGlsl.trim()
    };

    // 注册到转场库
    context.transitions.registerTransition(def);

    // 持久化到存储
    var updated = customList.filter(function(x) { return x.id !== def.id; }).concat([def]);
    context.storage.set("customTransitions", updated);
    setCustomList(updated);

    context.ui.showToast("自定义转场已成功保存并注册至转场库！", { type: "success" });
  };

  var handleDeleteCustom = function(id) {
    if (context.transitions.unregisterTransition) {
      context.transitions.unregisterTransition(id);
    }
    var updated = customList.filter(function(x) { return x.id !== id; });
    context.storage.set("customTransitions", updated);
    setCustomList(updated);
    context.ui.showToast("已删除自定义转场", { type: "info" });
  };

  var handleApplyToAll = function(transitionId) {
    var editor = context.editor;
    var durTicks = Math.round(duration * 1000000);
    editor.timeline.applyTransitionToAll({
      type: transitionId,
      duration: durTicks
    });
    context.ui.showToast("已将转场应用至全部切点！", { type: "success" });
  };

  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#09090b",
        color: "#f4f4f5",
        fontSize: "12px",
        overflow: "hidden",
        userSelect: "none"
      }
    },
    // Top Bar
    React.createElement(
      "div",
      {
        style: {
          padding: "12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }
      },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" } },
          React.createElement("span", { style: { color: "#a855f7" } }, "⚡"),
          React.createElement("span", null, "转场工坊 (Studio)")
        ),
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(255,255,255,0.05)",
              padding: "2px",
              borderRadius: "6px"
            }
          },
          React.createElement(
            "button",
            {
              type: "button",
              onClick: function() { setActiveSubTab("presets"); },
              style: {
                padding: "3px 8px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                fontSize: "11px",
                background: activeSubTab === "presets" ? "#a855f7" : "transparent",
                color: activeSubTab === "presets" ? "#fff" : "#a1a1aa"
              }
            },
            "精选预设"
          ),
          React.createElement(
            "button",
            {
              type: "button",
              onClick: function() { setActiveSubTab("creator"); },
              style: {
                padding: "3px 8px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                fontSize: "11px",
                background: activeSubTab === "creator" ? "#a855f7" : "transparent",
                color: activeSubTab === "creator" ? "#fff" : "#a1a1aa"
              }
            },
            "着色器创造器"
          )
        )
      ),

      // Duration Presets
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "#a1a1aa" } },
        React.createElement("span", null, "转场时长预设: " + duration.toFixed(1) + "s"),
        React.createElement(
          "div",
          { style: { display: "flex", gap: "4px" } },
          [0.5, 0.8, 1.0, 1.5, 2.0].map(function(s) {
            return React.createElement(
              "button",
              {
                key: s,
                type: "button",
                onClick: function() { setDuration(s); },
                style: {
                  padding: "2px 6px",
                  borderRadius: "4px",
                  border: duration === s ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.1)",
                  background: duration === s ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.03)",
                  color: duration === s ? "#c084fc" : "#a1a1aa",
                  cursor: "pointer",
                  fontSize: "10px"
                }
              },
              s + "s"
            );
          })
        )
      )
    ),

    // Content
    React.createElement(
      "div",
      {
        style: {
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }
      },
      activeSubTab === "presets" && React.createElement(
        React.Fragment,
        null,
        // Preset cards
        presets.concat(customList).map(function(item) {
          return React.createElement(
            "div",
            {
              key: item.id,
              style: {
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }
            },
            React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: "6px" } },
                React.createElement("span", { style: { fontWeight: "600", color: "#f4f4f5" } }, item.name),
                React.createElement(
                  "span",
                  {
                    style: {
                      fontSize: "10px",
                      padding: "1px 5px",
                      borderRadius: "4px",
                      background: "rgba(168,85,247,0.15)",
                      color: "#c084fc"
                    }
                  },
                  item.category
                )
              ),
              customList.some(function(c) { return c.id === item.id; }) && React.createElement(
                "button",
                {
                  type: "button",
                  onClick: function() { handleDeleteCustom(item.id); },
                  style: {
                    border: "none",
                    background: "transparent",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: "11px"
                  }
                },
                "删除"
              )
            ),
            React.createElement(
              "div",
              { style: { display: "flex", gap: "6px" } },
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: function() { onApply(item.id, duration); },
                  style: {
                    flex: 1,
                    padding: "6px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#a855f7",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "11px"
                  }
                },
                "应用到当前切点"
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: function() { handleApplyToAll(item.id); },
                  style: {
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#e4e4e7",
                    cursor: "pointer",
                    fontSize: "11px"
                  }
                },
                "全部切点"
              )
            )
          );
        })
      ),

      activeSubTab === "creator" && React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "8px" } },
        React.createElement(
          "div",
          { style: { fontSize: "11px", color: "#a1a1aa" } },
          "在线编写标准 GLSL 转场着色器，即刻动态注入转场素材库并支持实时渲染。"
        ),
        React.createElement(
          "label",
          { style: { fontSize: "11px", color: "#d4d4d8" } },
          "转场唯一 ID:"
        ),
        React.createElement("input", {
          value: newId,
          onChange: function(e) { setNewId(e.target.value); },
          style: {
            padding: "6px 8px",
            borderRadius: "6px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            fontSize: "12px",
            fontFamily: "monospace"
          }
        }),
        React.createElement(
          "label",
          { style: { fontSize: "11px", color: "#d4d4d8" } },
          "转场显示名称:"
        ),
        React.createElement("input", {
          value: newName,
          onChange: function(e) { setNewName(e.target.value); },
          style: {
            padding: "6px 8px",
            borderRadius: "6px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            fontSize: "12px"
          }
        }),
        React.createElement(
          "label",
          { style: { fontSize: "11px", color: "#d4d4d8" } },
          "GLSL 核心 transition(vec2 uv) 源码:"
        ),
        React.createElement("textarea", {
          value: newGlsl,
          rows: 8,
          onChange: function(e) { setNewGlsl(e.target.value); },
          style: {
            padding: "8px",
            borderRadius: "6px",
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#38bdf8",
            fontSize: "11px",
            fontFamily: "monospace",
            resize: "vertical"
          }
        }),
        React.createElement(
          "button",
          {
            type: "button",
            onClick: handleSaveCustom,
            style: {
              marginTop: "4px",
              padding: "8px",
              borderRadius: "6px",
              border: "none",
              background: "linear-gradient(135deg, #a855f7, #3b82f6)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "12px"
            }
          },
          "✨ 保存并立即注册至转场素材库"
        )
      )
    )
  );
}
`;

// 1. 确保 sample-plugins 目录存在
const pluginDir = path.join(rootDir, "sample-plugins", "creative-transitions-pack");
fs.mkdirSync(pluginDir, { recursive: true });

// 2. 写入 plugin.json 与 index.js
fs.writeFileSync(path.join(pluginDir, "plugin.json"), JSON.stringify(manifest, null, 2), "utf8");
fs.writeFileSync(path.join(pluginDir, "index.js"), indexJs, "utf8");

// 3. 打包 ZIP
const zipData = {
  "plugin.json": strToU8(JSON.stringify(manifest, null, 2)),
  "index.js": strToU8(indexJs),
  "README.md": strToU8(
    "# 创意转场预设大师 (Creative Transitions Master Pack)\n\n为 OpenLVET 增加 8 款 WebGL 转场预设与转场工坊面板。"
  )
};

const zippedBuffer = zipSync(zipData);

// 写入 zip 至 root 与 sample-plugins
fs.writeFileSync(path.join(rootDir, "creative-transitions-pack.zip"), Buffer.from(zippedBuffer));
fs.writeFileSync(path.join(rootDir, "sample-plugins", "creative-transitions-pack.zip"), Buffer.from(zippedBuffer));

console.log("✅ 创意转场预设大师插件构建成功！");
console.log("   - plugin.json & index.js -> sample-plugins/creative-transitions-pack/");
console.log("   - ZIP -> creative-transitions-pack.zip");
