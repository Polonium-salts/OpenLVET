// OpenLVET 示例测试插件
module.exports = {
  manifest: {
  "id": "demo-watermark-hud",
  "name": "实时时间码与安全框 HUD 插件",
  "version": "1.0.0",
  "description": "在视频预览画面上显示专业时间码 HUD、安全辅助框与自定义水印，并在左侧资产栏与顶部栏注入扩展面板与快捷按钮。",
  "author": "OpenLVET Tester",
  "category": "tools",
  "tags": [
    "HUD",
    "水印",
    "安全框",
    "便签",
    "测试插件"
  ],
  "configSchema": [
    {
      "key": "watermarkText",
      "label": "水印文字",
      "type": "string",
      "default": "OPENLVET DEMO PLUGIN"
    },
    {
      "key": "showSafeGrid",
      "label": "显示安全框",
      "type": "boolean",
      "default": true
    },
    {
      "key": "watermarkColor",
      "label": "水印颜色",
      "type": "select",
      "default": "#38bdf8",
      "options": [
        {
          "label": "天蓝色",
          "value": "#38bdf8"
        },
        {
          "label": "霓虹绿",
          "value": "#4ade80"
        },
        {
          "label": "活力橙",
          "value": "#fb923c"
        },
        {
          "label": "纯白",
          "value": "#ffffff"
        }
      ]
    }
  ],
  "defaultConfig": {
    "watermarkText": "OPENLVET DEMO PLUGIN",
    "showSafeGrid": true,
    "watermarkColor": "#38bdf8"
  }
},

  activate: function(context) {
    // 1. 注册画幅浮层 Overlay (HUD 水印与安全框)
    context.overlays.registerPreviewOverlay(function() {
      var watermarkText = context.config.get("watermarkText", "OPENLVET DEMO PLUGIN");
      var showSafeGrid = context.config.get("showSafeGrid", true);
      var watermarkColor = context.config.get("watermarkColor", "#38bdf8");

      return {
        definitions: [
          {
            id: "demo-hud-def",
            label: "测试 HUD 与水印"
          }
        ],
        instances: [
          {
            id: "demo-hud-instance",
            mount: { kind: "viewport" },
            plane: "over-interaction",
            pointerEvents: "none",
            zIndex: 88,
            render: function() {
              var elements = [];

              // 90% 安全框
              if (showSafeGrid) {
                elements.push(
                  React.createElement(
                    "div",
                    {
                      key: "safe-grid-90",
                      style: {
                        position: "absolute",
                        top: "5%",
                        left: "5%",
                        right: "5%",
                        bottom: "5%",
                        border: "1px dashed rgba(56, 189, 248, 0.4)",
                        pointerEvents: "none",
                        boxSizing: "border-box"
                      }
                    },
                    React.createElement(
                      "span",
                      {
                        style: {
                          position: "absolute",
                          top: "4px",
                          left: "6px",
                          fontSize: "10px",
                          color: "rgba(56, 189, 248, 0.8)",
                          fontFamily: "monospace"
                        }
                      },
                      "90% SAFE AREA"
                    )
                  )
                );
              }

              // 自定义水印
              if (watermarkText) {
                elements.push(
                  React.createElement(
                    "div",
                    {
                      key: "watermark-badge",
                      style: {
                        position: "absolute",
                        top: "16px",
                        left: "16px",
                        backgroundColor: "rgba(0, 0, 0, 0.65)",
                        border: "1px solid " + watermarkColor,
                        color: watermarkColor,
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        fontFamily: "monospace",
                        letterSpacing: "0.05em",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
                      }
                    },
                    "✨ " + watermarkText
                  )
                );
              }

              return React.createElement(
                "div",
                {
                  style: {
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none"
                  }
                },
                elements
              );
            }
          }
        ]
      };
    });

    // 2. 注册顶部栏快捷按钮 (Header Item)
    context.header.registerHeaderItem({
      id: "demo-time-badge",
      position: "left",
      order: 15,
      render: function() {
        return React.createElement(
          "button",
          {
            onClick: function() {
              var time = context.editor.playback.getCurrentTime();
              var seconds = (time / 1000000).toFixed(2);
              context.ui.showToast("当前播放头位置: " + seconds + " 秒", { type: "info" });
            },
            style: {
              fontSize: "11px",
              padding: "3px 8px",
              background: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }
          },
          "⏱️ 探针"
        );
      }
    });

    // 3. 注册侧边栏资产面板 Tab (Asset Tab)
    context.panels.registerAssetTab({
      id: "demo-notes-tab",
      label: "测试便签",
      order: 70,
      render: function() {
        return React.createElement(
          "div",
          {
            style: {
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              boxSizing: "border-box",
              gap: "10px"
            }
          },
          React.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
            React.createElement("h4", { style: { margin: 0, fontSize: "13px", fontWeight: "bold" } }, "📝 插件便签本"),
            React.createElement(
              "button",
              {
                onClick: function() {
                  context.ui.showToast("便签已自动保存！", { type: "success" });
                },
                style: {
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  border: "1px solid #38bdf8",
                  background: "#38bdf8",
                  color: "#000",
                  fontWeight: "bold",
                  cursor: "pointer"
                }
              },
              "保存"
            )
          ),
          React.createElement(
            "p",
            { style: { fontSize: "11px", color: "gray", margin: 0 } },
            "这是由自定义 ZIP 扩展插件注入的侧边栏交互面板。"
          ),
          React.createElement("textarea", {
            placeholder: "在此输入测试便签内容...",
            style: {
              flex: 1,
              width: "100%",
              borderRadius: "6px",
              padding: "8px",
              fontSize: "12px",
              backgroundColor: "rgba(0,0,0,0.1)",
              border: "1px solid rgba(128,128,128,0.3)",
              color: "inherit",
              resize: "none",
              boxSizing: "border-box"
            }
          })
        );
      }
    });

    // 4. 监听播放事件
    context.events.on("playback:play", function() {
      console.log("[Demo Plugin] 播放开始");
    });

    context.ui.showToast("测试插件「实时时间码与安全框 HUD」加载成功！", { type: "success" });
  },

  deactivate: function(context) {
    context.ui.showToast("测试插件已停用", { type: "info" });
  }
};
