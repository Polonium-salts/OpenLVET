// OpenLVET 大师级电影调色与复古胶片滤镜插件
module.exports = {
  manifest: {
  "id": "cinematic-film-filters",
  "name": "大师级电影调色与复古胶片滤镜 (Cinematic & Film FX)",
  "version": "1.0.0",
  "description": "提供好莱坞青橙色调 (Teal & Orange)、复古胶片颗粒暗角 (Vintage Grain)、日系清新柔光等 3 款专业 WebGL 实时着色器滤镜，并提供专属左侧调色工坊面板。",
  "author": "OpenLVET Colorist Studio",
  "category": "visuals",
  "tags": [
    "滤镜",
    "调色",
    "胶片",
    "青橙",
    "WebGL",
    "颗粒",
    "暗角"
  ],
  "configSchema": [
    {
      "key": "defaultFilter",
      "label": "默认滤镜预设",
      "type": "select",
      "default": "teal-orange",
      "options": [
        {
          "label": "🎬 好莱坞青橙 (Teal & Orange)",
          "value": "teal-orange"
        },
        {
          "label": "🎞️ 复古胶片颗粒 (Vintage Film Grain)",
          "value": "vintage-film"
        },
        {
          "label": "🌸 日系唯美柔光 (Anime Pastel Dream)",
          "value": "pastel-dream"
        }
      ]
    },
    {
      "key": "autoApplyToActive",
      "label": "点击滤镜卡片自动应用至选中片段",
      "type": "boolean",
      "default": true
    }
  ],
  "defaultConfig": {
    "defaultFilter": "teal-orange",
    "autoApplyToActive": true
  }
},

  activate: function(context) {
    // 1. 注册 WebGL 着色器滤镜 1：好莱坞青橙 (Teal & Orange)
    context.effects.registerEffect({
      type: "teal-orange",
      name: "好莱坞青橙",
      category: "color",
      icon: "🎬",
      description: "经典电影级青蓝色阴影与暖橙色高光对比色调",
      keywords: ["teal", "orange", "hollywood", "lut", "青橙", "电影", "调色"],
      params: [
        {
          key: "intensity",
          label: "调色浓度",
          type: "number",
          default: 80,
          min: 0,
          max: 100,
          step: 1
        },
        {
          key: "contrast",
          label: "画面对比度",
          type: "number",
          default: 1.15,
          min: 0.5,
          max: 2.0,
          step: 0.05
        },
        {
          key: "saturation",
          label: "饱和度",
          type: "number",
          default: 1.1,
          min: 0.0,
          max: 2.0,
          step: 0.05
        }
      ],
      renderer: {
        passes: [
          {
            shader: "teal-orange",
            glsl: `
uniform float u_intensity;
uniform float u_contrast;
uniform float u_saturation;

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
  if (color.a == 0.0) return color;

  vec3 rgb = color.rgb;

  // 对比度
  rgb = (rgb - 0.5) * u_contrast + 0.5;

  // 亮度计算
  float lum = dot(rgb, vec3(0.299, 0.587, 0.114));

  // 青橙分离：暗部偏青 (0.0, 0.8, 1.0)，亮部偏橙 (1.0, 0.55, 0.1)
  vec3 shadowTeal = vec3(0.0, 0.75, 0.95);
  vec3 highlightOrange = vec3(1.0, 0.58, 0.15);

  vec3 graded = mix(shadowTeal * (lum * 1.5), highlightOrange + (lum - 0.5), lum);
  graded = clamp(graded, 0.0, 1.0);

  // 混合原色与青橙调色
  float factor = u_intensity / 100.0;
  rgb = mix(rgb, graded, factor * 0.75);

  // 饱和度
  vec3 hsv = rgb2hsv(clamp(rgb, 0.0, 1.0));
  hsv.y = clamp(hsv.y * u_saturation, 0.0, 1.0);
  rgb = hsv2rgb(hsv);

  return vec4(clamp(rgb, 0.0, 1.0), color.a);
}
`,
            uniforms: function(p) {
              return {
                u_intensity: Number(p.effectParams.intensity != null ? p.effectParams.intensity : 80),
                u_contrast: Number(p.effectParams.contrast != null ? p.effectParams.contrast : 1.15),
                u_saturation: Number(p.effectParams.saturation != null ? p.effectParams.saturation : 1.1)
              };
            }
          }
        ]
      }
    });

    // 2. 注册 WebGL 着色器滤镜 2：复古胶片颗粒与暗角 (Vintage Film)
    context.effects.registerEffect({
      type: "vintage-film",
      name: "复古胶片颗粒",
      category: "retro",
      icon: "🎞️",
      description: "柯达 35mm 胶片动态噪点颗粒、暗角与温暖复古色调",
      keywords: ["vintage", "film", "grain", "vignette", "retro", "kodak", "胶片", "颗粒", "暗角"],
      params: [
        {
          key: "grain",
          label: "胶片颗粒感",
          type: "number",
          default: 35,
          min: 0,
          max: 100,
          step: 1
        },
        {
          key: "vignette",
          label: "四周暗角强度",
          type: "number",
          default: 45,
          min: 0,
          max: 100,
          step: 1
        },
        {
          key: "warmth",
          label: "暖色胶片温感",
          type: "number",
          default: 25,
          min: -50,
          max: 50,
          step: 1
        }
      ],
      renderer: {
        passes: [
          {
            shader: "vintage-film",
            glsl: `
uniform float u_grain;
uniform float u_vignette;
uniform float u_warmth;

float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 filterPixel(vec2 uv) {
  vec4 color = getSourceColor(uv);
  if (color.a == 0.0) return color;

  vec3 rgb = color.rgb;

  // 胶片暖色色偏
  float w = u_warmth / 100.0;
  rgb.r += w * 0.12;
  rgb.g += w * 0.04;
  rgb.b -= w * 0.08;

  // 动态高频颗粒
  vec2 seed = uv + vec2(sin(u_time * 15.0), cos(u_time * 15.0));
  float noise = (rand(seed) - 0.5) * (u_grain / 100.0) * 0.45;
  rgb += noise;

  // 胶片边缘暗角 Vignette
  vec2 center = uv - vec2(0.5);
  float dist = length(center);
  float vig = smoothstep(0.75, 0.25, dist * (u_vignette / 100.0 + 0.5));
  rgb *= vig;

  return vec4(clamp(rgb, 0.0, 1.0), color.a);
}
`,
            uniforms: function(p) {
              return {
                u_grain: Number(p.effectParams.grain != null ? p.effectParams.grain : 35),
                u_vignette: Number(p.effectParams.vignette != null ? p.effectParams.vignette : 45),
                u_warmth: Number(p.effectParams.warmth != null ? p.effectParams.warmth : 25)
              };
            }
          }
        ]
      }
    });

    // 3. 注册 WebGL 着色器滤镜 3：日系清新柔光 (Pastel Dream)
    context.effects.registerEffect({
      type: "pastel-dream",
      name: "日系清透柔光",
      category: "lighting",
      icon: "🌸",
      description: "通透日系高光漫反射、粉润肤色与清新梦幻氛围",
      keywords: ["pastel", "dream", "bloom", "anime", "soft", "日系", "清新", "柔光"],
      params: [
        {
          key: "softness",
          label: "高光漫反射",
          type: "number",
          default: 50,
          min: 0,
          max: 100,
          step: 1
        },
        {
          key: "exposure",
          label: "通透曝光度",
          type: "number",
          default: 15,
          min: -20,
          max: 60,
          step: 1
        }
      ],
      renderer: {
        passes: [
          {
            shader: "pastel-dream",
            glsl: `
uniform float u_softness;
uniform float u_exposure;

vec4 filterPixel(vec2 uv) {
  vec4 color = getSourceColor(uv);
  if (color.a == 0.0) return color;

  vec3 rgb = color.rgb;

  // 曝光增益
  rgb += (u_exposure / 100.0) * 0.3;

  // 柔光叠加效果
  vec3 softLight = vec3(
    (rgb.r < 0.5) ? (2.0 * rgb.r * rgb.r + rgb.r * rgb.r * (1.0 - 2.0 * rgb.r)) : (sqrt(rgb.r) * (2.0 * rgb.r - 1.0) + 2.0 * rgb.r * (1.0 - rgb.r)),
    (rgb.g < 0.5) ? (2.0 * rgb.g * rgb.g + rgb.g * rgb.g * (1.0 - 2.0 * rgb.g)) : (sqrt(rgb.g) * (2.0 * rgb.g - 1.0) + 2.0 * rgb.g * (1.0 - rgb.g)),
    (rgb.b < 0.5) ? (2.0 * rgb.b * rgb.b + rgb.b * rgb.b * (1.0 - 2.0 * rgb.b)) : (sqrt(rgb.b) * (2.0 * rgb.b - 1.0) + 2.0 * rgb.b * (1.0 - rgb.b))
  );

  float s = u_softness / 100.0;
  rgb = mix(rgb, softLight, s * 0.6);

  // 清新粉润调色微调
  rgb.r += s * 0.04;
  rgb.b += s * 0.06;

  return vec4(clamp(rgb, 0.0, 1.0), color.a);
}
`,
            uniforms: function(p) {
              return {
                u_softness: Number(p.effectParams.softness != null ? p.effectParams.softness : 50),
                u_exposure: Number(p.effectParams.exposure != null ? p.effectParams.exposure : 15)
              };
            }
          }
        ]
      }
    });

    // 辅助函数：将滤镜应用至当前选中的时间线片段
    function applyFilterToSelection(filterType) {
      try {
        var editor = context.editor;
        var selectedElements = editor.selection.getSelectedElements ? editor.selection.getSelectedElements() : (editor.selection.getSelected ? editor.selection.getSelected() : []);
        var selectedIds = selectedElements.map(function(item) {
          return item.elementId || item.id || item;
        });

        if (!selectedIds || selectedIds.length === 0) {
          context.ui.showToast("请先在时间线上选中一个视频或图片片段！", { type: "warning" });
          return;
        }

        var activeScene = editor.scenes.getActiveSceneOrNull ? editor.scenes.getActiveSceneOrNull() : (editor.scenes.getActiveScene ? editor.scenes.getActiveScene() : null);
        if (!activeScene) return;

        var count = 0;
        for (var i = 0; i < activeScene.tracks.overlay.length; i++) {
          var track = activeScene.tracks.overlay[i];
          for (var j = 0; j < track.elements.length; j++) {
            var el = track.elements[j];
            if (selectedIds.includes(el.id)) {
              var currentEffects = (el.effects || []).filter(function(e) {
                return e.type !== "teal-orange" && e.type !== "vintage-film" && e.type !== "pastel-dream";
              });
              currentEffects.push({
                id: "fx-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
                type: filterType,
                enabled: true,
                params: {}
              });
              editor.timeline.updateElement(el.id, { effects: currentEffects });
              count++;
            }
          }
        }

        if (count > 0) {
          context.ui.showToast("已为 " + count + " 个选中片段应用电影级调色滤镜！", { type: "success" });
        } else {
          context.ui.showToast("请在时间线上选择视频/图片片段", { type: "info" });
        }
      } catch (err) {
        console.error("Failed to apply filter:", err);
        context.ui.showToast("应用滤镜失败: " + err.message, { type: "error" });
      }
    }

    // 辅助函数：清除选中片段上的滤镜
    function clearFiltersFromSelection() {
      try {
        var editor = context.editor;
        var selectedElements = editor.selection.getSelectedElements ? editor.selection.getSelectedElements() : (editor.selection.getSelected ? editor.selection.getSelected() : []);
        var selectedIds = selectedElements.map(function(item) {
          return item.elementId || item.id || item;
        });

        if (!selectedIds || selectedIds.length === 0) {
          context.ui.showToast("请先在时间线上选中片段", { type: "warning" });
          return;
        }

        var activeScene = editor.scenes.getActiveSceneOrNull ? editor.scenes.getActiveSceneOrNull() : (editor.scenes.getActiveScene ? editor.scenes.getActiveScene() : null);
        if (!activeScene) return;

        var count = 0;
        for (var i = 0; i < activeScene.tracks.overlay.length; i++) {
          var track = activeScene.tracks.overlay[i];
          for (var j = 0; j < track.elements.length; j++) {
            var el = track.elements[j];
            if (selectedIds.includes(el.id) && el.effects && el.effects.length > 0) {
              var filtered = el.effects.filter(function(e) {
                return e.type !== "teal-orange" && e.type !== "vintage-film" && e.type !== "pastel-dream";
              });
              if (filtered.length !== el.effects.length) {
                editor.timeline.updateElement(el.id, { effects: filtered });
                count++;
              }
            }
          }
        }

        if (count > 0) {
          context.ui.showToast("已清除选中片段的电影调色滤镜", { type: "success" });
        } else {
          context.ui.showToast("选中片段没有已应用的插件滤镜", { type: "info" });
        }
      } catch (err) {
        console.error("Failed to clear filter:", err);
      }
    }

    // 4. 注册左侧面板「电影滤镜」Tab
    context.panels.registerAssetTab({
      id: "cinematic-filters-tab",
      label: "电影滤镜",
      order: 48,
      render: function() {
        var filters = [
          {
            type: "teal-orange",
            name: "🎬 好莱坞青橙 (Teal & Orange)",
            tag: "经典影院",
            desc: "好莱坞大片标配冷暖对比，提升质感与立体感",
            gradient: "linear-gradient(135deg, #0284c7 0%, #ea580c 100%)",
            color: "#38bdf8"
          },
          {
            type: "vintage-film",
            name: "🎞️ 复古胶片颗粒 (Vintage 35mm)",
            tag: "柯达胶片",
            desc: "35mm 胶片细腻跳动颗粒、怀旧暗角与暖调",
            gradient: "linear-gradient(135deg, #78350f 0%, #d97706 100%)",
            color: "#fbbf24"
          },
          {
            type: "pastel-dream",
            name: "🌸 日系清透柔光 (Pastel Bloom)",
            tag: "动漫唯美",
            desc: "日系通透高光漫反射，清新梦幻粉蓝通透调",
            gradient: "linear-gradient(135deg, #f472b6 0%, #38bdf8 100%)",
            color: "#f472b6"
          }
        ];

        return React.createElement(
          "div",
          {
            style: {
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflowY: "auto",
              gap: "12px",
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
              boxSizing: "border-box"
            }
          },
          React.createElement(
            "div",
            null,
            React.createElement("h4", { style: { margin: "0 0 4px 0", fontSize: "14px", fontWeight: "bold" } }, "🎬 大师级电影滤镜工坊"),
            React.createElement("p", { style: { margin: 0, fontSize: "11px", color: "gray" } }, "专业 WebGL 实时着色器渲染，点击一键应用至选中片段")
          ),
          React.createElement(
            "div",
            { style: { display: "flex", justifyContent: "flex-end" } },
            React.createElement(
              "button",
              {
                onClick: clearFiltersFromSelection,
                style: {
                  fontSize: "11px",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  border: "1px solid rgba(128,128,128,0.3)",
                  background: "transparent",
                  color: "gray",
                  cursor: "pointer"
                }
              },
              "清除选中滤镜"
            )
          ),
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: "10px" } },
            filters.map(function(f) {
              return React.createElement(
                "div",
                {
                  key: f.type,
                  style: {
                    borderRadius: "8px",
                    border: "1px solid rgba(128,128,128,0.2)",
                    backgroundColor: "rgba(128,128,128,0.05)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column"
                  }
                },
                React.createElement(
                  "div",
                  {
                    style: {
                      height: "48px",
                      background: f.gradient,
                      padding: "8px",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      boxSizing: "border-box"
                    }
                  },
                  React.createElement(
                    "span",
                    {
                      style: {
                        fontSize: "10px",
                        fontWeight: "bold",
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "#ffffff",
                        padding: "2px 6px",
                        borderRadius: "4px"
                      }
                    },
                    f.tag
                  ),
                  React.createElement(
                    "span",
                    { style: { fontSize: "10px", color: "rgba(255,255,255,0.8)", fontFamily: "monospace" } },
                    "WebGL GLSL"
                  )
                ),
                React.createElement(
                  "div",
                  { style: { padding: "10px", display: "flex", flexDirection: "column", gap: "6px" } },
                  React.createElement("div", { style: { fontSize: "12px", fontWeight: "bold" } }, f.name),
                  React.createElement("p", { style: { margin: 0, fontSize: "11px", color: "gray", lineHeight: "1.3" } }, f.desc),
                  React.createElement(
                    "button",
                    {
                      onClick: function() { applyFilterToSelection(f.type); },
                      style: {
                        marginTop: "4px",
                        padding: "6px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        backgroundColor: "var(--primary)",
                        color: "var(--primary-foreground)",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                      }
                    },
                    "✨ 应用此滤镜至选中片段"
                  )
                )
              );
            })
          )
        );
      }
    });

    // 5. 注册顶部栏快捷按钮
    context.header.registerHeaderItem({
      id: "cinematic-filter-header-btn",
      position: "left",
      order: 25,
      render: function() {
        return React.createElement(
          "button",
          {
            onClick: function() {
              context.ui.showToast("已注册好莱坞青橙、复古胶片与日系柔光滤镜，可在左侧「电影滤镜」或右侧属性栏「🎞️ 胶片」面板中选用！", { type: "info" });
            },
            title: "点击了解已加载的电影级滤镜",
            style: {
              fontSize: "11px",
              padding: "2px 8px",
              background: "rgba(244, 114, 182, 0.12)",
              border: "1px solid rgba(244, 114, 182, 0.3)",
              borderRadius: "5px",
              color: "#f472b6",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: 500
            }
          },
          "🎬 电影滤镜"
        );
      }
    });

    // 6. 扩展右侧属性面板 (Inspector Panel)：为选中的视频/图片片段注册专属「胶片滤镜」属性Tab
    context.properties.registerTab({
      id: "film-fx-inspector-tab",
      label: "胶片调色",
      icon: "🎞️",
      order: 85,
      elementTypes: ["video", "image"],
      render: function(props) {
        var el = props.element;
        var trackId = props.trackId;
        var editor = context.editor;

        var activeFilter = (el.effects || []).find(function(e) {
          return e.type === "teal-orange" || e.type === "vintage-film" || e.type === "pastel-dream";
        });

        return React.createElement(
          "div",
          { style: { padding: "14px", display: "flex", flexDirection: "column", gap: "12px" } },
          React.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(128,128,128,0.2)", paddingBottom: "8px" } },
            React.createElement("span", { style: { fontSize: "13px", fontWeight: "bold" } }, "🎞️ 胶片与调色扩展属性"),
            React.createElement("span", { style: { fontSize: "10px", color: "gray" } }, el.type)
          ),
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: "8px" } },
            React.createElement(
              "div",
              { style: { fontSize: "12px", color: "gray" } },
              "当前应用的插件滤镜：" + (activeFilter ? ("「" + activeFilter.type + "」") : "无")
            ),
            React.createElement(
              "div",
              { style: { display: "flex", gap: "6px" } },
              React.createElement(
                "button",
                {
                  onClick: function() { applyFilterToSelection("teal-orange"); },
                  style: { flex: 1, padding: "6px", fontSize: "11px", borderRadius: "5px", background: "rgba(2, 132, 199, 0.15)", border: "1px solid #0284c7", color: "#38bdf8", cursor: "pointer", fontWeight: "bold" }
                },
                "青橙"
              ),
              React.createElement(
                "button",
                {
                  onClick: function() { applyFilterToSelection("vintage-film"); },
                  style: { flex: 1, padding: "6px", fontSize: "11px", borderRadius: "5px", background: "rgba(217, 119, 6, 0.15)", border: "1px solid #d97706", color: "#fbbf24", cursor: "pointer", fontWeight: "bold" }
                },
                "胶片"
              ),
              React.createElement(
                "button",
                {
                  onClick: function() { applyFilterToSelection("pastel-dream"); },
                  style: { flex: 1, padding: "6px", fontSize: "11px", borderRadius: "5px", background: "rgba(244, 114, 182, 0.15)", border: "1px solid #f472b6", color: "#f472b6", cursor: "pointer", fontWeight: "bold" }
                },
                "柔光"
              )
            ),
            activeFilter && React.createElement(
              "button",
              {
                onClick: clearFiltersFromSelection,
                style: { marginTop: "6px", padding: "5px", fontSize: "11px", borderRadius: "4px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", cursor: "pointer" }
              },
              "清除此片段的滤镜"
            )
          )
        );
      }
    });

    context.ui.showToast("大师级电影调色与复古胶片滤镜插件已启动！", { type: "success" });
  },

  deactivate: function(context) {
    context.effects.unregisterEffect("teal-orange");
    context.effects.unregisterEffect("vintage-film");
    context.effects.unregisterEffect("pastel-dream");
    context.ui.showToast("电影滤镜插件已停用", { type: "info" });
  }
};
