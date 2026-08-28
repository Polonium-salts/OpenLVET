// OpenLVET 全能插件功能测试套件
module.exports = {
  manifest: {
  "id": "plugin-feature-tester",
  "name": "全能插件功能测试套件 (Plugin Feature Tester)",
  "version": "1.0.0",
  "description": "全方位测试 OpenLVET 插件系统所有扩展点：左侧资产Tab、右侧属性面板Tab、时间线工具栏按钮、顶部导航栏按钮、预览视口HUD浮层、WebGL着色器滤镜、快捷Action及本地存储与响应式配置。",
  "author": "OpenLVET Core QA Team",
  "category": "tools",
  "tags": [
    "测试套件",
    "全功能",
    "诊断",
    "HUD",
    "属性面板",
    "工具栏",
    "着色器"
  ],
  "configSchema": [
    {
      "key": "showHudProbe",
      "label": "显示预览区 HUD 实时探针",
      "type": "boolean",
      "default": true
    },
    {
      "key": "themeAccentColor",
      "label": "测试套件强调色",
      "type": "select",
      "default": "#8b5cf6",
      "options": [
        {
          "label": "💜 极光紫 (#8b5cf6)",
          "value": "#8b5cf6"
        },
        {
          "label": "💚 荧光绿 (#10b981)",
          "value": "#10b981"
        },
        {
          "label": "💙 科技蓝 (#0ea5e9)",
          "value": "#0ea5e9"
        },
        {
          "label": "🧡 活力橙 (#f97316)",
          "value": "#f97316"
        }
      ]
    }
  ],
  "defaultConfig": {
    "showHudProbe": true,
    "themeAccentColor": "#8b5cf6"
  }
},

  activate: function(context) {
    var editor = context.editor;
    var accentColor = context.config.get("themeAccentColor", "#8b5cf6");

    // 1. 【扩展点 1】：注册 WebGL 着色器测试滤镜 (动态反色与扫描波)
    context.effects.registerEffect({
      type: "test-scanwave-invert",
      name: "🧪 测试扫描反色",
      category: "glitch",
      icon: "🧪",
      description: "插件系统 WebGL 动态测试滤镜：正弦扫描波色彩反转",
      keywords: ["test", "scanwave", "invert", "glitch", "测试", "反色"],
      params: [
        {
          key: "speed",
          label: "扫描速度",
          type: "number",
          default: 3,
          min: 0,
          max: 10,
          step: 1
        },
        {
          key: "invertRatio",
          label: "反色强度",
          type: "number",
          default: 80,
          min: 0,
          max: 100,
          step: 5
        }
      ],
      renderer: {
        passes: [
          {
            shader: "test-scanwave-invert",
            glsl: `
uniform float u_speed;
uniform float u_invertRatio;

vec4 filterPixel(vec2 uv) {
  vec4 color = getSourceColor(uv);
  if (color.a == 0.0) return color;

  float wave = sin(uv.y * 20.0 + u_time * u_speed);
  vec3 inv = vec3(1.0) - color.rgb;
  float factor = step(0.0, wave) * (u_invertRatio / 100.0);
  vec3 res = mix(color.rgb, inv, factor);

  return vec4(res, color.a);
}
`,
            uniforms: function(p) {
              return {
                u_speed: Number(p.effectParams.speed != null ? p.effectParams.speed : 3),
                u_invertRatio: Number(p.effectParams.invertRatio != null ? p.effectParams.invertRatio : 80)
              };
            }
          }
        ]
      }
    });

    // 2. 【扩展点 2】：注册预览区 HUD 探针浮层
    context.overlays.registerPreviewOverlay(function() {
      var isVisible = context.config.get("showHudProbe", true);
      if (!isVisible) {
        return { definitions: [], instances: [] };
      }

      return {
        definitions: [],
        instances: [
          {
            id: "hud-plugin-tester-probe",
            plane: "viewport",
            mount: { kind: "hud", anchor: "top-right", order: 5 },
            pointerEvents: "none",
            render: function() {
              var time = editor.playback.getCurrentTime();
              var seconds = (time / 1000).toFixed(2);
              return React.createElement(
                "div",
                {
                  style: {
                    padding: "4px 8px",
                    background: "rgba(0,0,0,0.75)",
                    border: "1px solid " + accentColor,
                    borderRadius: "6px",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
                  }
                },
                React.createElement("span", { style: { color: accentColor, fontWeight: "bold" } }, "🧪 插件探针"),
                React.createElement("span", null, seconds + "s")
              );
            }
          }
        ]
      };
    });

    // 3. 【扩展点 3】：注册顶部导航栏 Header 按钮
    context.header.registerHeaderItem({
      id: "tester-header-btn",
      position: "left",
      order: 15,
      render: function() {
        return React.createElement(
          "button",
          {
            onClick: function() {
              var activeProject = editor.project.getActiveOrNull ? editor.project.getActiveOrNull() : (editor.project.getActive ? editor.project.getActive() : null);
              var msg = activeProject ? ("当前工程: " + activeProject.metadata.name) : "当前未打开工程";
              context.ui.showToast("🧪 测试套件运行正常！" + msg, { type: "success" });
            },
            title: "点击触发插件系统全局诊断",
            style: {
              fontSize: "11px",
              padding: "2px 8px",
              background: "rgba(139, 92, 246, 0.12)",
              border: "1px solid rgba(139, 92, 246, 0.35)",
              borderRadius: "5px",
              color: "#a78bfa",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: 500
            }
          },
          "🧪 插件测试"
        );
      }
    });

    // 4. 【扩展点 4】：注册时间线工具栏 Timeline Toolbar 按钮
    context.timeline.registerToolbarItem({
      id: "tester-timeline-btn",
      order: 60,
      render: function() {
        return React.createElement(
          "button",
          {
            onClick: function() {
              var count = context.storage.get("clickCount", 0) + 1;
              context.storage.set("clickCount", count);
              context.ui.showToast("时间线工具栏插件按钮已触发！(累计点击: " + count + " 次)", { type: "info" });
            },
            title: "时间线插件扩展按钮测试",
            style: {
              fontSize: "11px",
              padding: "2px 6px",
              background: "rgba(139, 92, 246, 0.15)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: "4px",
              color: "#c4b5fd",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "3px"
            }
          },
          "⚡ 工具栏扩展"
        );
      }
    });

    // 5. 【扩展点 5】：注册右侧属性面板 Tab (Properties / Inspector Tab)
    context.properties.registerTab({
      id: "tester-inspector-tab",
      label: "测试属性",
      icon: "🧪",
      order: 90,
      elementTypes: ["video", "image", "text", "audio"],
      render: function(props) {
        var el = props.element;
        var trackId = props.trackId;

        return React.createElement(
          "div",
          { style: { padding: "14px", display: "flex", flexDirection: "column", gap: "10px" } },
          React.createElement(
            "div",
            { style: { paddingBottom: "6px", borderBottom: "1px solid rgba(128,128,128,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" } },
            React.createElement("span", { style: { fontSize: "13px", fontWeight: "bold" } }, "🧪 插件属性面板扩展测试"),
            React.createElement("span", { style: { fontSize: "10px", padding: "1px 5px", background: accentColor, color: "#fff", borderRadius: "3px" } }, el.type)
          ),
          React.createElement(
            "div",
            { style: { fontSize: "11px", display: "flex", flexDirection: "column", gap: "4px", color: "gray" } },
            React.createElement("div", null, "元素 ID: " + el.id),
            React.createElement("div", null, "所在轨道: " + trackId),
            React.createElement("div", null, "起始时间: " + (el.startTime / 1000).toFixed(2) + "s"),
            React.createElement("div", null, "片段长度: " + (el.duration / 1000).toFixed(2) + "s")
          ),
          React.createElement(
            "div",
            { style: { display: "flex", gap: "6px", marginTop: "6px" } },
            React.createElement(
              "button",
              {
                onClick: function() {
                  var newName = (el.name || "片段") + " [测试标记]";
                  editor.timeline.updateElement(el.id, { name: newName });
                  context.ui.showToast("已重命名片段为: " + newName, { type: "success" });
                },
                style: { flex: 1, padding: "6px", fontSize: "11px", background: "rgba(139, 92, 246, 0.15)", border: "1px solid #8b5cf6", color: "#a78bfa", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }
              },
              "🏷️ 修改片段名称"
            ),
            React.createElement(
              "button",
              {
                onClick: function() {
                  var currentEffects = (el.effects || []).filter(function(e) { return e.type !== "test-scanwave-invert"; });
                  currentEffects.push({
                    id: "fx-test-" + Date.now(),
                    type: "test-scanwave-invert",
                    enabled: true,
                    params: {}
                  });
                  editor.timeline.updateElement(el.id, { effects: currentEffects });
                  context.ui.showToast("已在此片段附加扫描反色测试滤镜！", { type: "success" });
                },
                style: { flex: 1, padding: "6px", fontSize: "11px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", color: "#34d399", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }
              },
              "✨ 注入测试滤镜"
            )
          )
        );
      }
    });

    // 6. 【扩展点 6】：注册左侧资产面板 Tab「插件测试」
    context.panels.registerAssetTab({
      id: "plugin-tester-tab",
      label: "插件测试",
      order: 40,
      render: function() {
        var [testCount, setTestCount] = React.useState(function() {
          return context.storage.get("testRunCount", 0);
        });

        function runStorageTest() {
          var next = testCount + 1;
          context.storage.set("testRunCount", next);
          setTestCount(next);
          context.ui.showToast("✅ Storage 本地持久化测试成功！当前计数: " + next, { type: "success" });
        }

        function testToastNotifications() {
          context.ui.showToast("🌟 成功提示测试 (Success Toast)", { type: "success" });
          setTimeout(function() {
            context.ui.showToast("ℹ️ 消息提示测试 (Info Toast)", { type: "info" });
          }, 300);
        }

        return React.createElement(
          "div",
          {
            style: {
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflowY: "auto",
              gap: "14px",
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
              boxSizing: "border-box"
            }
          },
          React.createElement(
            "div",
            null,
            React.createElement("h4", { style: { margin: "0 0 4px 0", fontSize: "14px", fontWeight: "bold" } }, "🧪 插件系统全功能测试中心"),
            React.createElement("p", { style: { margin: 0, fontSize: "11px", color: "gray" } }, "验证左侧面板、右侧属性、时间线工具栏、顶部栏、WebGL 与 HUD 扩展")
          ),

          // 功能测试卡片 1：诊断状态
          React.createElement(
            "div",
            { style: { padding: "10px", borderRadius: "8px", border: "1px solid rgba(128,128,128,0.2)", background: "rgba(128,128,128,0.05)", display: "flex", flexDirection: "column", gap: "6px" } },
            React.createElement("span", { style: { fontSize: "12px", fontWeight: "bold" } }, "📊 运行环境诊断"),
            React.createElement(
              "div",
              { style: { fontSize: "11px", color: "gray", display: "flex", flexDirection: "column", gap: "3px" } },
              React.createElement("div", null, "• 插件 ID: plugin-feature-tester"),
              React.createElement("div", null, "• 强调色设置: " + accentColor),
              React.createElement("div", null, "• 累计持久化运行次数: " + testCount)
            )
          ),

          // 功能测试卡片 2：操作测试
          React.createElement(
            "div",
            { style: { padding: "10px", borderRadius: "8px", border: "1px solid rgba(128,128,128,0.2)", background: "rgba(128,128,128,0.05)", display: "flex", flexDirection: "column", gap: "8px" } },
            React.createElement("span", { style: { fontSize: "12px", fontWeight: "bold" } }, "⚡ 交互与功能测试"),
            React.createElement(
              "button",
              {
                onClick: runStorageTest,
                style: { padding: "6px", fontSize: "11px", background: "var(--primary)", color: "var(--primary-foreground)", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }
              },
              "💾 测试插件本地 Storage 存储"
            ),
            React.createElement(
              "button",
              {
                onClick: testToastNotifications,
                style: { padding: "6px", fontSize: "11px", background: "rgba(128,128,128,0.15)", color: "inherit", border: "1px solid rgba(128,128,128,0.25)", borderRadius: "5px", cursor: "pointer" }
              },
              "🔔 测试全局 Toast 消息推送"
            ),
            React.createElement(
              "button",
              {
                onClick: function() { context.ui.openPluginSettings(manifest.id); },
                style: { padding: "6px", fontSize: "11px", background: "rgba(139, 92, 246, 0.15)", color: "#a78bfa", border: "1px solid #8b5cf6", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }
              },
              "⚙️ 打开本插件参数配置弹窗"
            )
          ),

          // 提示引导
          React.createElement(
            "div",
            { style: { padding: "10px", borderRadius: "8px", background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.25)", fontSize: "11px", lineHeight: "1.4", color: "#38bdf8" } },
            React.createElement("div", { style: { fontWeight: "bold", marginBottom: "4px" } }, "💡 当前已激活的测试扩展点："),
            React.createElement("div", null, "1. 顶部栏：已添加「🧪 插件测试」按钮"),
            React.createElement("div", null, "2. 时间线工具栏：已添加「⚡ 工具栏扩展」按钮"),
            React.createElement("div", null, "3. 预览视口：右上角显示实时播放时间 HUD 探针"),
            React.createElement("div", null, "4. 右侧属性栏：选中任意视频/图片将出现「🧪 测试属性」Tab"),
            React.createElement("div", null, "5. 原生特效库：已注册「🧪 测试扫描反色」着色器滤镜")
          )
        );
      }
    });

    context.ui.showToast("全能插件功能测试套件已激活！", { type: "success" });
  },

  deactivate: function(context) {
    context.effects.unregisterEffect("test-scanwave-invert");
    context.ui.showToast("全能插件测试套件已停用", { type: "info" });
  }
};
