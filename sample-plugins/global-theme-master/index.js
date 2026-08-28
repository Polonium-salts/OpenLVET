// OpenLVET 全局主题定制大师插件
module.exports = {
  manifest: {
  "id": "global-theme-master",
  "name": "全局主题定制大师 (Theme Master)",
  "version": "1.0.0",
  "description": "一键切换与深度定制 OpenLVET 全局色彩主题（赛博朋克、极光翡翠、日落暮光、樱花粉、深海蓝等），支持在左侧面板可视化调色和顶部快捷切换。",
  "author": "OpenLVET Team",
  "category": "visuals",
  "tags": [
    "主题",
    "调色",
    "外观",
    "UI",
    "个性化"
  ],
  "configSchema": [
    {
      "key": "themePreset",
      "label": "预设主题配色",
      "description": "选择系统全局的主题基调风格",
      "type": "select",
      "default": "cyberpunk",
      "options": [
        {
          "label": "🌌 赛博霓虹 (Cyberpunk Purple)",
          "value": "cyberpunk"
        },
        {
          "label": "🍃 极光翡翠 (Emerald Aurora)",
          "value": "emerald"
        },
        {
          "label": "🌅 日落暮光 (Sunset Amber)",
          "value": "sunset"
        },
        {
          "label": "🌸 樱花绯粉 (Sakura Rose)",
          "value": "sakura"
        },
        {
          "label": "🌊 深海湛蓝 (Ocean Cobalt)",
          "value": "ocean"
        },
        {
          "label": "⚡ 极客冷灰 (Monochrome)",
          "value": "monochrome"
        },
        {
          "label": "🎨 自定义主色 (Custom Hex)",
          "value": "custom"
        }
      ]
    },
    {
      "key": "customPrimary",
      "label": "自定义主色 (HEX 或 HSL)",
      "description": "当主题选择「自定义主色」时生效",
      "type": "string",
      "default": "#a855f7"
    },
    {
      "key": "enableAccentGlow",
      "label": "启用强调色流光与光晕",
      "description": "在激活按钮和轨道选中状态添加微光氛围特效",
      "type": "boolean",
      "default": true
    }
  ],
  "defaultConfig": {
    "themePreset": "cyberpunk",
    "customPrimary": "#a855f7",
    "enableAccentGlow": true
  }
},

  activate: function(context) {
    var STYLE_ELEMENT_ID = "openlvet-theme-master-style";

    // 预设主题色彩定义表 (HSL & HEX)
    var PRESETS = {
      cyberpunk: {
        id: "cyberpunk",
        name: "赛博霓虹",
        icon: "🌌",
        primary: "hsl(285, 90%, 62%)",
        primaryHex: "#c084fc",
        primaryForeground: "hsl(0, 0%, 100%)",
        secondary: "hsl(285, 90%, 18%)",
        secondaryBorder: "hsl(285, 90%, 25%)",
        secondaryForeground: "hsl(285, 90%, 75%)",
        ring: "hsl(285, 90%, 62%)",
        previewGradient: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
      },
      emerald: {
        id: "emerald",
        name: "极光翡翠",
        icon: "🍃",
        primary: "hsl(158, 85%, 44%)",
        primaryHex: "#10b981",
        primaryForeground: "hsl(0, 0%, 100%)",
        secondary: "hsl(158, 85%, 15%)",
        secondaryBorder: "hsl(158, 85%, 22%)",
        secondaryForeground: "hsl(158, 85%, 65%)",
        ring: "hsl(158, 85%, 44%)",
        previewGradient: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)"
      },
      sunset: {
        id: "sunset",
        name: "日落暮光",
        icon: "🌅",
        primary: "hsl(25, 95%, 53%)",
        primaryHex: "#f97316",
        primaryForeground: "hsl(0, 0%, 100%)",
        secondary: "hsl(25, 95%, 15%)",
        secondaryBorder: "hsl(25, 95%, 22%)",
        secondaryForeground: "hsl(25, 95%, 65%)",
        ring: "hsl(25, 95%, 53%)",
        previewGradient: "linear-gradient(135deg, #f97316 0%, #eab308 100%)"
      },
      sakura: {
        id: "sakura",
        name: "樱花绯粉",
        icon: "🌸",
        primary: "hsl(330, 85%, 62%)",
        primaryHex: "#f472b6",
        primaryForeground: "hsl(0, 0%, 100%)",
        secondary: "hsl(330, 85%, 18%)",
        secondaryBorder: "hsl(330, 85%, 25%)",
        secondaryForeground: "hsl(330, 85%, 75%)",
        ring: "hsl(330, 85%, 62%)",
        previewGradient: "linear-gradient(135deg, #f472b6 0%, #fb7185 100%)"
      },
      ocean: {
        id: "ocean",
        name: "深海湛蓝",
        icon: "🌊",
        primary: "hsl(215, 95%, 55%)",
        primaryHex: "#0284c7",
        primaryForeground: "hsl(0, 0%, 100%)",
        secondary: "hsl(215, 95%, 16%)",
        secondaryBorder: "hsl(215, 95%, 24%)",
        secondaryForeground: "hsl(215, 95%, 68%)",
        ring: "hsl(215, 95%, 55%)",
        previewGradient: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)"
      },
      monochrome: {
        id: "monochrome",
        name: "极客冷灰",
        icon: "⚡",
        primary: "hsl(215, 15%, 75%)",
        primaryHex: "#cbd5e1",
        primaryForeground: "hsl(220, 20%, 10%)",
        secondary: "hsl(215, 15%, 20%)",
        secondaryBorder: "hsl(215, 15%, 30%)",
        secondaryForeground: "hsl(215, 15%, 85%)",
        ring: "hsl(215, 15%, 75%)",
        previewGradient: "linear-gradient(135deg, #94a3b8 0%, #e2e8f0 100%)"
      }
    };

    // 应用全局 CSS 变量与微光效果
    function applyTheme() {
      var presetKey = context.config.get("themePreset", "cyberpunk");
      var customPrimary = context.config.get("customPrimary", "#a855f7");
      var enableGlow = context.config.get("enableAccentGlow", true);

      var theme = PRESETS[presetKey];
      var primaryColor = theme ? theme.primary : customPrimary;
      var primaryHex = theme ? theme.primaryHex : customPrimary;
      var primaryFg = theme ? theme.primaryForeground : "#ffffff";
      var ringColor = theme ? theme.ring : customPrimary;
      var secColor = theme ? theme.secondary : "rgba(168,85,247,0.15)";
      var secBorder = theme ? theme.secondaryBorder : "rgba(168,85,247,0.25)";
      var secFg = theme ? theme.secondaryForeground : primaryHex;

      if (typeof document !== "undefined") {
        // Direct root property setters for instant update
        var root = document.documentElement;
        root.style.setProperty("--primary", primaryColor);
        root.style.setProperty("--primary-foreground", primaryFg);
        root.style.setProperty("--ring", ringColor);
        root.style.setProperty("--sidebar-primary", primaryColor);

        var glowCss = enableGlow
          ? "button[data-state='active'], .border-primary { box-shadow: 0 0 12px " + primaryHex + "44 !important; }"
          : "";

        var cssContent = [
          ":root, html, body, .dark, .panel, .dark .panel {",
          "  --primary: " + primaryColor + " !important;",
          "  --primary-foreground: " + primaryFg + " !important;",
          "  --ring: " + ringColor + " !important;",
          "  --sidebar-primary: " + primaryColor + " !important;",
          "  --secondary: " + secColor + " !important;",
          "  --secondary-border: " + secBorder + " !important;",
          "  --secondary-foreground: " + secFg + " !important;",
          "}",
          "::selection {",
          "  background: " + primaryHex + "55 !important;",
          "}",
          glowCss
        ].join("\n");

        var styleEl = document.getElementById(STYLE_ELEMENT_ID);
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = STYLE_ELEMENT_ID;
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = cssContent;
      }
    }

    // 初始执行应用
    applyTheme();

    // 监听配置变更自动重新应用
    var unbindConfig = context.config.onChange(function() {
      applyTheme();
    });
    context.addDisposable(unbindConfig);

    // 1. 注册顶部栏快捷主题切换按钮
    context.header.registerHeaderItem({
      id: "theme-master-header-btn",
      position: "left",
      order: 18,
      render: function() {
        var currentPreset = context.config.get("themePreset", "cyberpunk");
        var activeTheme = PRESETS[currentPreset] || { name: "自定义", icon: "🎨", primaryHex: "#a855f7" };

        return React.createElement(
          "button",
          {
            onClick: function() {
              var keys = Object.keys(PRESETS);
              var nextIdx = (keys.indexOf(currentPreset) + 1) % keys.length;
              var nextKey = keys[nextIdx];
              context.config.set("themePreset", nextKey);
              context.ui.showToast("已切换主题: " + PRESETS[nextKey].icon + " " + PRESETS[nextKey].name, {
                type: "success"
              });
            },
            title: "点击循环切换全局色彩主题",
            style: {
              fontSize: "11px",
              padding: "2px 8px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              borderRadius: "5px",
              color: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontWeight: 500,
              transition: "all 0.2s"
            }
          },
          React.createElement("span", {
            style: {
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: activeTheme.primaryHex,
              boxShadow: "0 0 6px " + activeTheme.primaryHex
            }
          }),
          React.createElement("span", null, activeTheme.name)
        );
      }
    });

    // 2. 注册左侧资产面板 Tab「全局主题」
    context.panels.registerAssetTab({
      id: "theme-master-tab",
      label: "全局主题",
      order: 85,
      render: function() {
        var currentPreset = context.config.get("themePreset", "cyberpunk");
        var customColor = context.config.get("customPrimary", "#a855f7");

        var presetCards = Object.entries(PRESETS).map(function(entry) {
          var key = entry[0];
          var t = entry[1];
          var isSelected = currentPreset === key;

          return React.createElement(
            "div",
            {
              key: key,
              onClick: function() {
                context.config.set("themePreset", key);
                context.ui.showToast("已应用主题：" + t.icon + " " + t.name, { type: "success" });
              },
              style: {
                padding: "10px",
                borderRadius: "8px",
                border: isSelected ? "2px solid " + t.primaryHex : "1px solid rgba(128,128,128,0.2)",
                background: isSelected ? "rgba(255, 255, 255, 0.08)" : "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.2s"
              }
            },
            React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: "8px" } },
              React.createElement("span", { style: { fontSize: "16px" } }, t.icon),
              React.createElement(
                "div",
                null,
                React.createElement("div", { style: { fontSize: "12px", fontWeight: "bold" } }, t.name),
                React.createElement("div", { style: { fontSize: "10px", color: "gray", fontFamily: "monospace" } }, t.primaryHex)
              )
            ),
            React.createElement("div", {
              style: {
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                background: t.previewGradient,
                boxShadow: isSelected ? "0 0 8px " + t.primaryHex : "none"
              }
            })
          );
        });

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
              boxSizing: "border-box"
            }
          },
          React.createElement(
            "div",
            null,
            React.createElement("h4", { style: { margin: "0 0 4px 0", fontSize: "14px", fontWeight: "bold" } }, "🎨 全局色彩调色板"),
            React.createElement("p", { style: { margin: 0, fontSize: "11px", color: "gray" } }, "点击即可实时为整个 OpenLVET 界面换肤")
          ),
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: "8px" } },
            presetCards
          ),
          React.createElement("hr", { style: { border: 0, borderTop: "1px solid rgba(128,128,128,0.2)", margin: "4px 0" } }),
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: "8px" } },
            React.createElement("span", { style: { fontSize: "12px", fontWeight: "bold" } }, "自定义主色 (Custom Hex)"),
            React.createElement(
              "div",
              { style: { display: "flex", gap: "8px", alignItems: "center" } },
              React.createElement("input", {
                type: "color",
                value: customColor,
                onChange: function(e) {
                  context.config.set("customPrimary", e.target.value);
                  context.config.set("themePreset", "custom");
                },
                style: {
                  width: "36px",
                  height: "30px",
                  borderRadius: "4px",
                  border: "1px solid rgba(128,128,128,0.3)",
                  cursor: "pointer",
                  background: "transparent"
                }
              }),
              React.createElement("input", {
                type: "text",
                value: customColor,
                placeholder: "#a855f7",
                onChange: function(e) {
                  context.config.set("customPrimary", e.target.value);
                  context.config.set("themePreset", "custom");
                },
                style: {
                  flex: 1,
                  padding: "4px 8px",
                  fontSize: "12px",
                  borderRadius: "4px",
                  border: "1px solid rgba(128,128,128,0.3)",
                  background: "rgba(0,0,0,0.1)",
                  color: "inherit",
                  fontFamily: "monospace"
                }
              })
            )
          )
        );
      }
    });

    context.ui.showToast("全局主题定制大师已启动！", { type: "success" });
  },

  deactivate: function(context) {
    if (typeof document !== "undefined") {
      var root = document.documentElement;
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-foreground");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--sidebar-primary");
      var styleEl = document.getElementById("openlvet-theme-master-style");
      if (styleEl) {
        styleEl.remove();
      }
    }
    context.ui.showToast("已恢复默认主题风格", { type: "info" });
  }
};
