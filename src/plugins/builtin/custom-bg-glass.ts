import type { PluginManifest } from "../types";

export const CUSTOM_BG_GLASS_MANIFEST: PluginManifest = {
  "id": "custom-bg-glass",
  "name": "自定义背景与透明毛玻璃特效",
  "version": "1.0.0",
  "description": "为 OpenLVET 带来沉浸式自定义全景背景，并将编辑器面板、导航栏与工具栏自动变换为通透高级的毛玻璃磨砂质感 (Glassmorphism)。",
  "author": "OpenLVET Open Source Team",
  "category": "visuals",
  "tags": [
    "背景",
    "毛玻璃",
    "Glassmorphism",
    "个性化",
    "UI主题",
    "极简美学"
  ],
  "homepage": "https://github.com/Polonium-salts/OpenLVET",
  "builtin": true,
  "configSchema": [
    {
      "key": "enabled",
      "label": "启用全景背景与毛玻璃特效",
      "description": "开启后自动渲染全景背景并将所有面板转为透光毛玻璃",
      "type": "boolean",
      "group": "核心开关",
      "default": true
    },
    {
      "key": "bgType",
      "label": "背景呈现模式",
      "description": "选择全景背景的数据来源",
      "type": "select",
      "group": "全景背景设置",
      "default": "preset",
      "options": [
        {
          "label": "🖼️ 精选高清壁纸 (Curated Wallpaper)",
          "value": "preset"
        },
        {
          "label": "🔗 自定义图片外链 (Image URL)",
          "value": "url"
        },
        {
          "label": "🎨 炫彩流体流动渐变 (Mesh Gradient)",
          "value": "gradient"
        }
      ]
    },
    {
      "key": "presetWallpaper",
      "label": "精选壁纸库",
      "description": "快速应用内置经过调色适配的高清大片壁纸",
      "type": "select",
      "group": "全景背景设置",
      "default": "aurora-galaxy",
      "options": [
        {
          "label": "🌌 极地深空星轨 (Aurora Galaxy)",
          "value": "aurora-galaxy"
        },
        {
          "label": "🌃 赛博暗夜霓虹 (Cyber Night)",
          "value": "cyber-night"
        },
        {
          "label": "🌅 暮光海平面延时 (Sunset Ocean)",
          "value": "sunset-ocean"
        },
        {
          "label": "🌿 治愈森林雾霭 (Misty Forest)",
          "value": "misty-forest"
        },
        {
          "label": "🟣 幻彩流体光晕 (Fluid Glow)",
          "value": "fluid-glow"
        },
        {
          "label": "🖤 极简黑曜石深色 (Dark Obsidian)",
          "value": "dark-obsidian"
        }
      ]
    },
    {
      "key": "customBgUrl",
      "label": "自定义图片直接链接",
      "description": "输入以 http/https 开头的图片外链（支持 jpg/png/webp）",
      "type": "string",
      "group": "全景背景设置",
      "placeholder": "例如: https://images.unsplash.com/photo-...",
      "default": ""
    },
    {
      "key": "bgBrightness",
      "label": "背景明亮度",
      "description": "调暗背景使前台时间线轨道与剪辑画面保持清晰高对比",
      "type": "number",
      "group": "全景背景设置",
      "min": 15,
      "max": 100,
      "step": 5,
      "default": 55
    },
    {
      "key": "bgBlur",
      "label": "背景景深虚化",
      "description": "为背景图本身添加轻微虚化景深，强化层次感",
      "type": "number",
      "group": "全景背景设置",
      "min": 0,
      "max": 40,
      "step": 2,
      "default": 0
    },
    {
      "key": "glassBlur",
      "label": "UI 面板毛玻璃模糊半径",
      "description": "面板背后的磨砂模糊强弱（数值越大越柔和）",
      "type": "number",
      "group": "毛玻璃磨砂规范",
      "min": 4,
      "max": 40,
      "step": 2,
      "default": 18
    },
    {
      "key": "glassOpacity",
      "label": "UI 面板底色透光度",
      "description": "面板背景的不透明度百分比（越低越通透）",
      "type": "number",
      "group": "毛玻璃磨砂规范",
      "min": 15,
      "max": 90,
      "step": 5,
      "default": 55
    },
    {
      "key": "glassSaturation",
      "label": "毛玻璃色彩饱和度增强",
      "description": "透光折射时增强背景鲜艳度，呈现 visionOS 式晶莹质感",
      "type": "number",
      "group": "毛玻璃磨砂规范",
      "min": 100,
      "max": 220,
      "step": 10,
      "default": 160
    },
    {
      "key": "glassBorder",
      "label": "高光玻璃微边框",
      "description": "为面板边缘添加 1px 半透明微高光，勾勒精细轮廓",
      "type": "boolean",
      "group": "毛玻璃磨砂规范",
      "default": true
    }
  ],
  "defaultConfig": {
    "enabled": true,
    "bgType": "preset",
    "presetWallpaper": "aurora-galaxy",
    "customBgUrl": "",
    "bgBrightness": 55,
    "bgBlur": 0,
    "glassBlur": 18,
    "glassOpacity": 55,
    "glassSaturation": 160,
    "glassBorder": true
  },
  "readme": "# 🎨 自定义背景与透明毛玻璃特效 (Custom Background & Glassmorphism)\n\n> OpenLVET 官方扩展插件 · 开启极简轻奢的个性化工作区与透明毛玻璃视觉\n\n---\n\n## ✨ 核心特性\n\n- **🖼️ 沉浸式全屏背景**：\n  - 内置多款精挑细选的 4K 壁纸（赛博霓虹、深空银河、暮光海浪、森林雾霭等）；\n  - 支持任意自定义图片直链（Unsplash、Pexels 等）；\n  - 支持丝滑动态流体渐变；\n  - 自由调节背景明亮度（防止背景过亮干扰主预览画面）与景深虚化。\n- **🔮 全局 UI 自动透明毛玻璃化**：\n  - 自动将左侧资产栏、顶部 Header、时间线面板、属性栏及浮动弹窗重构为透明磨砂材质；\n  - 基于真实 CSS `backdrop-filter: blur() saturate()` 光学折射渲染；\n  - 提供精致的高光透光微边框（Glass Highlight Border）；\n  - 实时响应配置调节，无须重启刷新页面。\n- **⚙️ 闭环交互规范**：\n  - 采用标准的受控两列式自动排版；\n  - 左侧面板支持一键快捷切换壁纸与实时滑块微调；\n  - 右上角直达齿轮（`⚙`）一键直通完整配置面板。\n",
  "sourceCode": "index.js"
};

export const CUSTOM_BG_GLASS_SOURCE = "// ============================================================================\n// OpenLVET 自定义背景与透明毛玻璃特效插件 (Custom Background & Glassmorphism)\n// ============================================================================\n(function() {\n  var PRESET_WALLPAPERS = {\n    \"aurora-galaxy\": {\n      label: \"极地深空星轨\",\n      url: \"https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2560&auto=format&fit=crop\",\n      preview: \"https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=500&auto=format&fit=crop\"\n    },\n    \"cyber-night\": {\n      label: \"赛博暗夜霓虹\",\n      url: \"https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2560&auto=format&fit=crop\",\n      preview: \"https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=500&auto=format&fit=crop\"\n    },\n    \"sunset-ocean\": {\n      label: \"暮光海平面\",\n      url: \"https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2560&auto=format&fit=crop\",\n      preview: \"https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=500&auto=format&fit=crop\"\n    },\n    \"misty-forest\": {\n      label: \"治愈森林雾霭\",\n      url: \"https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2560&auto=format&fit=crop\",\n      preview: \"https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=500&auto=format&fit=crop\"\n    },\n    \"fluid-glow\": {\n      label: \"幻彩流体光晕\",\n      url: \"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2560&auto=format&fit=crop\",\n      preview: \"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop\"\n    },\n    \"dark-obsidian\": {\n      label: \"极简黑曜石\",\n      url: \"linear-gradient(135deg, #090a0f 0%, #101524 45%, #081b2c 100%)\",\n      preview: \"linear-gradient(135deg, #090a0f 0%, #101524 45%, #081b2c 100%)\",\n      isGradient: true\n    }\n  };\n\n  var STYLE_ID = \"openlvet-custom-bg-glass-style\";\n  var BG_LAYER_ID = \"openlvet-custom-bg-layer\";\n\n  function applyGlassmorphism(config) {\n    if (typeof document === 'undefined') return;\n\n    var enabled = config.enabled !== false;\n    var html = document.documentElement;\n\n    if (!enabled) {\n      html.classList.remove(\"openlvet-glass-active\", \"glass-border-enabled\");\n      var existingBg = document.getElementById(BG_LAYER_ID);\n      if (existingBg) existingBg.style.display = \"none\";\n      return;\n    }\n\n    html.classList.add(\"openlvet-glass-active\");\n    if (config.glassBorder !== false) {\n      html.classList.add(\"glass-border-enabled\");\n    } else {\n      html.classList.remove(\"glass-border-enabled\");\n    }\n\n    // 1. 设置 CSS 变量\n    var glassBlur = typeof config.glassBlur === 'number' ? config.glassBlur : 18;\n    var glassOpacity = typeof config.glassOpacity === 'number' ? (config.glassOpacity / 100) : 0.55;\n    var glassSaturation = typeof config.glassSaturation === 'number' ? config.glassSaturation : 160;\n\n    html.style.setProperty(\"--glass-blur-radius\", glassBlur + \"px\");\n    html.style.setProperty(\"--glass-panel-opacity\", String(glassOpacity));\n    html.style.setProperty(\"--glass-saturation\", glassSaturation + \"%\");\n\n    // 2. 注入/更新全局样式表\n    var styleEl = document.getElementById(STYLE_ID);\n    if (!styleEl) {\n      styleEl = document.createElement(\"style\");\n      styleEl.id = STYLE_ID;\n      document.head.appendChild(styleEl);\n    }\n\n    styleEl.textContent = [\n      \"html.openlvet-glass-active,\",\n      \"html.openlvet-glass-active body {\",\n      \"  background-color: transparent !important;\",\n      \"}\",\n      \"\",\n      \"/* 面板、顶栏、侧边栏及弹窗毛玻璃化 */\",\n      \"html.openlvet-glass-active .panel,\",\n      \"html.openlvet-glass-active aside,\",\n      \"html.openlvet-glass-active header,\",\n      \"html.openlvet-glass-active nav,\",\n      \"html.openlvet-glass-active [role='dialog'],\",\n      \"html.openlvet-glass-active [data-radix-popper-content-wrapper] > div,\",\n      \"html.openlvet-glass-active .bg-card:not(#openlvet-custom-bg-layer *),\",\n      \"html.openlvet-glass-active .bg-popover:not(#openlvet-custom-bg-layer *),\",\n      \"html.openlvet-glass-active .bg-background:not(#openlvet-custom-bg-layer *) {\",\n      \"  background-color: hsla(var(--background) / var(--glass-panel-opacity, 0.55)) !important;\",\n      \"  backdrop-filter: blur(var(--glass-blur-radius, 18px)) saturate(var(--glass-saturation, 160%)) !important;\",\n      \"  -webkit-backdrop-filter: blur(var(--glass-blur-radius, 18px)) saturate(var(--glass-saturation, 160%)) !important;\",\n      \"  transition: background-color 0.3s cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 0.3s ease;\",\n      \"}\",\n      \"\",\n      \"/* 玻璃高光边框规范 */\",\n      \"html.openlvet-glass-active.glass-border-enabled .panel,\",\n      \"html.openlvet-glass-active.glass-border-enabled aside,\",\n      \"html.openlvet-glass-active.glass-border-enabled header,\",\n      \"html.openlvet-glass-active.glass-border-enabled [role='dialog'] {\",\n      \"  border-color: rgba(255, 255, 255, 0.12) !important;\",\n      \"}\",\n      \"\",\n      \".dark html.openlvet-glass-active.glass-border-enabled .panel,\",\n      \".dark html.openlvet-glass-active.glass-border-enabled aside,\",\n      \".dark html.openlvet-glass-active.glass-border-enabled header,\",\n      \".dark html.openlvet-glass-active.glass-border-enabled [role='dialog'] {\",\n      \"  border-color: rgba(255, 255, 255, 0.14) !important;\",\n      \"}\",\n      \"\",\n      \"/* 面板悬浮轻微投影 */\",\n      \"html.openlvet-glass-active .panel {\",\n      \"  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.35) !important;\",\n      \"}\"\n    ].join(\"\\n\");\n\n    // 3. 注入/更新背景层\n    var bgLayer = document.getElementById(BG_LAYER_ID);\n    if (!bgLayer) {\n      bgLayer = document.createElement(\"div\");\n      bgLayer.id = BG_LAYER_ID;\n      bgLayer.style.cssText = \"position: fixed; inset: 0; z-index: -9999; pointer-events: none; overflow: hidden; transform: translateZ(0); transition: filter 0.3s ease, opacity 0.4s ease;\";\n      document.body.insertBefore(bgLayer, document.body.firstChild);\n    }\n\n    bgLayer.style.display = \"block\";\n    var bgType = config.bgType || \"preset\";\n    var bgUrl = \"\";\n    var isGradient = false;\n\n    if (bgType === \"url\" && config.customBgUrl) {\n      bgUrl = config.customBgUrl.trim();\n    } else if (bgType === \"gradient\") {\n      isGradient = true;\n      bgUrl = \"radial-gradient(at 10% 20%, rgba(59, 130, 246, 0.45) 0px, transparent 50%), radial-gradient(at 90% 10%, rgba(236, 72, 153, 0.45) 0px, transparent 50%), radial-gradient(at 50% 80%, rgba(16, 185, 129, 0.4) 0px, transparent 50%), #0b0f19\";\n    } else {\n      var presetKey = config.presetWallpaper || \"aurora-galaxy\";\n      var preset = PRESET_WALLPAPERS[presetKey] || PRESET_WALLPAPERS[\"aurora-galaxy\"];\n      bgUrl = preset.url;\n      isGradient = !!preset.isGradient;\n    }\n\n    var brightness = typeof config.bgBrightness === 'number' ? config.bgBrightness / 100 : 0.55;\n    var blurPx = typeof config.bgBlur === 'number' ? config.bgBlur : 0;\n\n    if (isGradient) {\n      bgLayer.style.background = bgUrl;\n      bgLayer.style.backgroundSize = \"cover\";\n    } else {\n      bgLayer.style.background = \"url('\" + bgUrl + \"') no-repeat center center\";\n      bgLayer.style.backgroundSize = \"cover\";\n    }\n\n    bgLayer.style.filter = \"brightness(\" + brightness + \") blur(\" + blurPx + \"px)\";\n    bgLayer.style.transform = blurPx > 0 ? \"scale(1.04)\" : \"scale(1)\";\n  }\n\n  function cleanup() {\n    if (typeof document === 'undefined') return;\n    var html = document.documentElement;\n    html.classList.remove(\"openlvet-glass-active\", \"glass-border-enabled\");\n    html.style.removeProperty(\"--glass-blur-radius\");\n    html.style.removeProperty(\"--glass-panel-opacity\");\n    html.style.removeProperty(\"--glass-saturation\");\n\n    var styleEl = document.getElementById(STYLE_ID);\n    if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);\n\n    var bgLayer = document.getElementById(BG_LAYER_ID);\n    if (bgLayer && bgLayer.parentNode) bgLayer.parentNode.removeChild(bgLayer);\n  }\n\n  module.exports = {\n    manifest: {\n  \"id\": \"custom-bg-glass\",\n  \"name\": \"自定义背景与透明毛玻璃特效\",\n  \"version\": \"1.0.0\",\n  \"description\": \"为 OpenLVET 带来沉浸式自定义全景背景，并将编辑器面板、导航栏与工具栏自动变换为通透高级的毛玻璃磨砂质感 (Glassmorphism)。\",\n  \"author\": \"OpenLVET Open Source Team\",\n  \"category\": \"visuals\",\n  \"tags\": [\n    \"背景\",\n    \"毛玻璃\",\n    \"Glassmorphism\",\n    \"个性化\",\n    \"UI主题\",\n    \"极简美学\"\n  ],\n  \"homepage\": \"https://github.com/Polonium-salts/OpenLVET\",\n  \"builtin\": true,\n  \"configSchema\": [\n    {\n      \"key\": \"enabled\",\n      \"label\": \"启用全景背景与毛玻璃特效\",\n      \"description\": \"开启后自动渲染全景背景并将所有面板转为透光毛玻璃\",\n      \"type\": \"boolean\",\n      \"group\": \"核心开关\",\n      \"default\": true\n    },\n    {\n      \"key\": \"bgType\",\n      \"label\": \"背景呈现模式\",\n      \"description\": \"选择全景背景的数据来源\",\n      \"type\": \"select\",\n      \"group\": \"全景背景设置\",\n      \"default\": \"preset\",\n      \"options\": [\n        {\n          \"label\": \"🖼️ 精选高清壁纸 (Curated Wallpaper)\",\n          \"value\": \"preset\"\n        },\n        {\n          \"label\": \"🔗 自定义图片外链 (Image URL)\",\n          \"value\": \"url\"\n        },\n        {\n          \"label\": \"🎨 炫彩流体流动渐变 (Mesh Gradient)\",\n          \"value\": \"gradient\"\n        }\n      ]\n    },\n    {\n      \"key\": \"presetWallpaper\",\n      \"label\": \"精选壁纸库\",\n      \"description\": \"快速应用内置经过调色适配的高清大片壁纸\",\n      \"type\": \"select\",\n      \"group\": \"全景背景设置\",\n      \"default\": \"aurora-galaxy\",\n      \"options\": [\n        {\n          \"label\": \"🌌 极地深空星轨 (Aurora Galaxy)\",\n          \"value\": \"aurora-galaxy\"\n        },\n        {\n          \"label\": \"🌃 赛博暗夜霓虹 (Cyber Night)\",\n          \"value\": \"cyber-night\"\n        },\n        {\n          \"label\": \"🌅 暮光海平面延时 (Sunset Ocean)\",\n          \"value\": \"sunset-ocean\"\n        },\n        {\n          \"label\": \"🌿 治愈森林雾霭 (Misty Forest)\",\n          \"value\": \"misty-forest\"\n        },\n        {\n          \"label\": \"🟣 幻彩流体光晕 (Fluid Glow)\",\n          \"value\": \"fluid-glow\"\n        },\n        {\n          \"label\": \"🖤 极简黑曜石深色 (Dark Obsidian)\",\n          \"value\": \"dark-obsidian\"\n        }\n      ]\n    },\n    {\n      \"key\": \"customBgUrl\",\n      \"label\": \"自定义图片直接链接\",\n      \"description\": \"输入以 http/https 开头的图片外链（支持 jpg/png/webp）\",\n      \"type\": \"string\",\n      \"group\": \"全景背景设置\",\n      \"placeholder\": \"例如: https://images.unsplash.com/photo-...\",\n      \"default\": \"\"\n    },\n    {\n      \"key\": \"bgBrightness\",\n      \"label\": \"背景明亮度\",\n      \"description\": \"调暗背景使前台时间线轨道与剪辑画面保持清晰高对比\",\n      \"type\": \"number\",\n      \"group\": \"全景背景设置\",\n      \"min\": 15,\n      \"max\": 100,\n      \"step\": 5,\n      \"default\": 55\n    },\n    {\n      \"key\": \"bgBlur\",\n      \"label\": \"背景景深虚化\",\n      \"description\": \"为背景图本身添加轻微虚化景深，强化层次感\",\n      \"type\": \"number\",\n      \"group\": \"全景背景设置\",\n      \"min\": 0,\n      \"max\": 40,\n      \"step\": 2,\n      \"default\": 0\n    },\n    {\n      \"key\": \"glassBlur\",\n      \"label\": \"UI 面板毛玻璃模糊半径\",\n      \"description\": \"面板背后的磨砂模糊强弱（数值越大越柔和）\",\n      \"type\": \"number\",\n      \"group\": \"毛玻璃磨砂规范\",\n      \"min\": 4,\n      \"max\": 40,\n      \"step\": 2,\n      \"default\": 18\n    },\n    {\n      \"key\": \"glassOpacity\",\n      \"label\": \"UI 面板底色透光度\",\n      \"description\": \"面板背景的不透明度百分比（越低越通透）\",\n      \"type\": \"number\",\n      \"group\": \"毛玻璃磨砂规范\",\n      \"min\": 15,\n      \"max\": 90,\n      \"step\": 5,\n      \"default\": 55\n    },\n    {\n      \"key\": \"glassSaturation\",\n      \"label\": \"毛玻璃色彩饱和度增强\",\n      \"description\": \"透光折射时增强背景鲜艳度，呈现 visionOS 式晶莹质感\",\n      \"type\": \"number\",\n      \"group\": \"毛玻璃磨砂规范\",\n      \"min\": 100,\n      \"max\": 220,\n      \"step\": 10,\n      \"default\": 160\n    },\n    {\n      \"key\": \"glassBorder\",\n      \"label\": \"高光玻璃微边框\",\n      \"description\": \"为面板边缘添加 1px 半透明微高光，勾勒精细轮廓\",\n      \"type\": \"boolean\",\n      \"group\": \"毛玻璃磨砂规范\",\n      \"default\": true\n    }\n  ],\n  \"defaultConfig\": {\n    \"enabled\": true,\n    \"bgType\": \"preset\",\n    \"presetWallpaper\": \"aurora-galaxy\",\n    \"customBgUrl\": \"\",\n    \"bgBrightness\": 55,\n    \"bgBlur\": 0,\n    \"glassBlur\": 18,\n    \"glassOpacity\": 55,\n    \"glassSaturation\": 160,\n    \"glassBorder\": true\n  },\n  \"readme\": \"# 🎨 自定义背景与透明毛玻璃特效 (Custom Background & Glassmorphism)\\n\\n> OpenLVET 官方扩展插件 · 开启极简轻奢的个性化工作区与透明毛玻璃视觉\\n\\n---\\n\\n## ✨ 核心特性\\n\\n- **🖼️ 沉浸式全屏背景**：\\n  - 内置多款精挑细选的 4K 壁纸（赛博霓虹、深空银河、暮光海浪、森林雾霭等）；\\n  - 支持任意自定义图片直链（Unsplash、Pexels 等）；\\n  - 支持丝滑动态流体渐变；\\n  - 自由调节背景明亮度（防止背景过亮干扰主预览画面）与景深虚化。\\n- **🔮 全局 UI 自动透明毛玻璃化**：\\n  - 自动将左侧资产栏、顶部 Header、时间线面板、属性栏及浮动弹窗重构为透明磨砂材质；\\n  - 基于真实 CSS `backdrop-filter: blur() saturate()` 光学折射渲染；\\n  - 提供精致的高光透光微边框（Glass Highlight Border）；\\n  - 实时响应配置调节，无须重启刷新页面。\\n- **⚙️ 闭环交互规范**：\\n  - 采用标准的受控两列式自动排版；\\n  - 左侧面板支持一键快捷切换壁纸与实时滑块微调；\\n  - 右上角直达齿轮（`⚙`）一键直通完整配置面板。\\n\"\n},\n\n    activate: function(context) {\n      var initialConfig = Object.assign({}, context.plugin.defaultConfig || {}, context.config.getAll());\n      applyGlassmorphism(initialConfig);\n\n      var unlisten = context.config.onChange(function(newConfig) {\n        applyGlassmorphism(newConfig);\n      });\n      context.addDisposable(unlisten);\n      context.addDisposable(cleanup);\n\n      // 注册左侧资产导航栏快捷控制面板\n      context.panels.registerAssetTab({\n        id: \"custom-bg-glass\",\n        label: \"背景玻璃\",\n        icon: \"🎨\",\n        order: 38,\n        render: function(props) {\n          return React.createElement(CustomBgGlassPanel, {\n            pluginContext: context,\n            manifest: props.plugin\n          });\n        }\n      });\n\n      // 注册动作与快捷菜单\n      context.actions.registerAction({\n        id: \"custom-bg-glass:toggle\",\n        description: \"切换全景背景与毛玻璃特效\",\n        handler: function() {\n          var cur = context.config.get(\"enabled\", true);\n          context.config.set(\"enabled\", !cur);\n          if (context.ui && context.ui.showToast) {\n            context.ui.showToast(!cur ? \"✨ 已开启全景背景与毛玻璃特效\" : \"已暂停毛玻璃效果\", { type: \"info\" });\n          }\n        }\n      });\n\n      context.header.registerHeaderItem({\n        id: \"custom-bg-glass-btn\",\n        icon: \"🎨\",\n        tooltip: \"自定义背景与毛玻璃设置\",\n        position: \"right\",\n        order: 15,\n        onClick: function() {\n          if (context.ui && context.ui.openPluginSettings) {\n            context.ui.openPluginSettings(context.plugin.id);\n          }\n        }\n      });\n    },\n\n    deactivate: function(context) {\n      cleanup();\n    },\n\n    onConfigChange: function(newConfig, context) {\n      applyGlassmorphism(newConfig);\n    }\n  };\n\n  // ============================================================================\n  // React 运行时面板组件：CustomBgGlassPanel\n  // ============================================================================\n  function CustomBgGlassPanel(props) {\n    var React = (typeof window !== 'undefined' ? window.React : null) || (typeof React !== 'undefined' ? React : null) || (typeof require !== 'undefined' ? require('react') : null);\n    if (!React) return null;\n\n    var context = props.pluginContext;\n    var useState = React.useState;\n    var useEffect = React.useEffect;\n\n    var [config, setConfig] = useState(function() {\n      return Object.assign({}, context.plugin.defaultConfig || {}, context.config.getAll());\n    });\n\n    useEffect(function() {\n      var unsub = context.config.onChange(function(latest) {\n        setConfig(Object.assign({}, context.plugin.defaultConfig || {}, latest));\n      });\n      return unsub;\n    }, []);\n\n    var updateField = function(key, val) {\n      context.config.set(key, val);\n    };\n\n    var presetsList = [\n      { id: \"aurora-galaxy\", name: \"极地星轨\", url: PRESET_WALLPAPERS[\"aurora-galaxy\"].preview },\n      { id: \"cyber-night\", name: \"赛博暗夜\", url: PRESET_WALLPAPERS[\"cyber-night\"].preview },\n      { id: \"sunset-ocean\", name: \"暮光海面\", url: PRESET_WALLPAPERS[\"sunset-ocean\"].preview },\n      { id: \"misty-forest\", name: \"治愈森林\", url: PRESET_WALLPAPERS[\"misty-forest\"].preview },\n      { id: \"fluid-glow\", name: \"流体光晕\", url: PRESET_WALLPAPERS[\"fluid-glow\"].preview },\n      { id: \"dark-obsidian\", name: \"极简黑曜\", gradient: PRESET_WALLPAPERS[\"dark-obsidian\"].preview }\n    ];\n\n    return React.createElement(\n      \"div\",\n      { className: \"flex flex-col h-full bg-background select-none text-foreground font-sans\" },\n\n      // 宿主标准 Header\n      React.createElement(\n        \"header\",\n        { className: \"px-3.5 py-2.5 border-b border-border/50 flex items-center justify-between bg-card/30 shrink-0 backdrop-blur-sm\" },\n        React.createElement(\n          \"div\",\n          { className: \"flex items-center gap-2 min-w-0\" },\n          React.createElement(\"span\", { className: \"text-base leading-none\" }, \"🎨\"),\n          React.createElement(\"h3\", { className: \"text-xs font-bold truncate text-foreground\" }, \"背景与毛玻璃\"),\n          React.createElement(\n            \"span\",\n            { className: \"text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium \" + (config.enabled ? \"bg-primary/15 text-primary border border-primary/25\" : \"bg-muted text-muted-foreground border\") },\n            config.enabled ? \"ACTIVE\" : \"OFF\"\n          )\n        ),\n        React.createElement(\n          \"button\",\n          {\n            type: \"button\",\n            title: \"打开完整配置面板\",\n            onClick: function() {\n              if (context.ui && context.ui.openPluginSettings) {\n                context.ui.openPluginSettings(context.plugin.id);\n              }\n            },\n            className: \"text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent/40 transition-colors\"\n          },\n          \"⚙️ 完整设置\"\n        )\n      ),\n\n      // 滚动设置项内容\n      React.createElement(\n        \"div\",\n        { className: \"flex-1 overflow-y-auto p-3 space-y-4\" },\n\n        // 1. 一键总开关\n        React.createElement(\n          \"div\",\n          { className: \"flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card/40 hover:bg-card/70 transition-colors\" },\n          React.createElement(\n            \"div\",\n            { className: \"space-y-0.5\" },\n            React.createElement(\"span\", { className: \"text-xs font-semibold text-foreground block\" }, \"毛玻璃与全景透光\"),\n            React.createElement(\"p\", { className: \"text-[11px] text-muted-foreground\" }, \"开启后编辑器面板全部变成晶莹磨砂透光玻璃\")\n          ),\n          React.createElement(\n            \"button\",\n            {\n              type: \"button\",\n              onClick: function() { updateField(\"enabled\", !config.enabled); },\n              className: \"px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-xs \" + (config.enabled ? \"bg-primary text-primary-foreground\" : \"bg-accent/60 text-muted-foreground hover:text-foreground\")\n            },\n            config.enabled ? \"已开启\" : \"已暂停\"\n          )\n        ),\n\n        // 2. 预设精选壁纸推荐网格\n        React.createElement(\n          \"div\",\n          { className: \"space-y-2\" },\n          React.createElement(\n            \"div\",\n            { className: \"flex items-center justify-between px-0.5\" },\n            React.createElement(\"h4\", { className: \"text-xs font-semibold text-foreground\" }, \"🖼️ 精选壁纸一键应用\"),\n            React.createElement(\n              \"span\",\n              { className: \"text-[10px] text-muted-foreground font-mono\" },\n              \"4K Curated\"\n            )\n          ),\n          React.createElement(\n            \"div\",\n            { className: \"grid grid-cols-3 gap-2\" },\n            presetsList.map(function(item) {\n              var isSelected = config.bgType === \"preset\" && config.presetWallpaper === item.id;\n              return React.createElement(\n                \"button\",\n                {\n                  key: item.id,\n                  type: \"button\",\n                  onClick: function() {\n                    context.config.set(\"bgType\", \"preset\");\n                    context.config.set(\"presetWallpaper\", item.id);\n                  },\n                  className: \"group relative aspect-[16/10] rounded-lg overflow-hidden border transition-all text-left \" + (isSelected ? \"border-primary ring-2 ring-primary/30 shadow-md\" : \"border-border/60 hover:border-border\")\n                },\n                item.url ? React.createElement(\"img\", {\n                  src: item.url,\n                  alt: item.name,\n                  className: \"size-full object-cover transition-transform duration-300 group-hover:scale-110\"\n                }) : React.createElement(\"div\", {\n                  style: { background: item.gradient },\n                  className: \"size-full\"\n                }),\n                React.createElement(\n                  \"div\",\n                  { className: \"absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-1.5\" },\n                  React.createElement(\n                    \"span\",\n                    { className: \"text-[10px] font-medium text-white truncate drop-shadow-sm\" },\n                    item.name\n                  )\n                ),\n                isSelected && React.createElement(\n                  \"span\",\n                  { className: \"absolute top-1 right-1 size-3.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[9px] font-bold shadow-xs\" },\n                  \"✓\"\n                )\n              );\n            })\n          )\n        ),\n\n        // 3. 自定义图片直链输入\n        React.createElement(\n          \"div\",\n          { className: \"p-3 rounded-xl border border-border/60 bg-card/40 space-y-2\" },\n          React.createElement(\"label\", { className: \"text-xs font-semibold text-foreground block\" }, \"🔗 自定义背景图片 URL\"),\n          React.createElement(\n            \"div\",\n            { className: \"flex items-center gap-1.5\" },\n            React.createElement(\"input\", {\n              type: \"text\",\n              value: config.customBgUrl || \"\",\n              onChange: function(e) { updateField(\"customBgUrl\", e.target.value); },\n              placeholder: \"粘贴以 https:// 开头的图片链接...\",\n              className: \"flex-1 h-8 px-2.5 text-xs rounded-lg bg-accent/20 border border-border/50 outline-none focus:border-primary/60 transition-all font-mono\"\n            }),\n            React.createElement(\n              \"button\",\n              {\n                type: \"button\",\n                onClick: function() {\n                  if (config.customBgUrl && config.customBgUrl.trim()) {\n                    context.config.set(\"bgType\", \"url\");\n                    if (context.ui && context.ui.showToast) {\n                      context.ui.showToast(\"已应用自定义背景图片\", { type: \"success\" });\n                    }\n                  }\n                },\n                className: \"h-8 px-3 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shrink-0 shadow-xs\"\n              },\n              \"应用\"\n            )\n          )\n        ),\n\n        // 4. 即时参数微调滑块 (模糊、透光、亮度)\n        React.createElement(\n          \"div\",\n          { className: \"p-3 rounded-xl border border-border/60 bg-card/40 space-y-3.5\" },\n          React.createElement(\"h4\", { className: \"text-xs font-semibold text-foreground\" }, \"⚡ 实时视觉微调\"),\n\n          // 面板透光度\n          React.createElement(\n            \"div\",\n            { className: \"space-y-1.5\" },\n            React.createElement(\n              \"div\",\n              { className: \"flex items-center justify-between text-xs\" },\n              React.createElement(\"span\", { className: \"text-muted-foreground text-[11px]\" }, \"UI 面板不透明度\"),\n              React.createElement(\"span\", { className: \"font-mono font-medium text-foreground text-[11px]\" }, (config.glassOpacity || 55) + \"%\")\n            ),\n            React.createElement(\"input\", {\n              type: \"range\",\n              min: 15,\n              max: 90,\n              step: 5,\n              value: config.glassOpacity || 55,\n              onChange: function(e) { updateField(\"glassOpacity\", parseFloat(e.target.value)); },\n              className: \"w-full accent-primary h-1.5 bg-accent/60 rounded-lg cursor-pointer\"\n            })\n          ),\n\n          // 玻璃模糊半径\n          React.createElement(\n            \"div\",\n            { className: \"space-y-1.5\" },\n            React.createElement(\n              \"div\",\n              { className: \"flex items-center justify-between text-xs\" },\n              React.createElement(\"span\", { className: \"text-muted-foreground text-[11px]\" }, \"玻璃模糊半径 (Blur)\"),\n              React.createElement(\"span\", { className: \"font-mono font-medium text-foreground text-[11px]\" }, (config.glassBlur || 18) + \"px\")\n            ),\n            React.createElement(\"input\", {\n              type: \"range\",\n              min: 4,\n              max: 36,\n              step: 2,\n              value: config.glassBlur || 18,\n              onChange: function(e) { updateField(\"glassBlur\", parseFloat(e.target.value)); },\n              className: \"w-full accent-primary h-1.5 bg-accent/60 rounded-lg cursor-pointer\"\n            })\n          ),\n\n          // 背景明暗度\n          React.createElement(\n            \"div\",\n            { className: \"space-y-1.5\" },\n            React.createElement(\n              \"div\",\n              { className: \"flex items-center justify-between text-xs\" },\n              React.createElement(\"span\", { className: \"text-muted-foreground text-[11px]\" }, \"全景背景明亮度\"),\n              React.createElement(\"span\", { className: \"font-mono font-medium text-foreground text-[11px]\" }, (config.bgBrightness || 55) + \"%\")\n            ),\n            React.createElement(\"input\", {\n              type: \"range\",\n              min: 15,\n              max: 95,\n              step: 5,\n              value: config.bgBrightness || 55,\n              onChange: function(e) { updateField(\"bgBrightness\", parseFloat(e.target.value)); },\n              className: \"w-full accent-primary h-1.5 bg-accent/60 rounded-lg cursor-pointer\"\n            })\n          )\n        )\n      )\n    );\n  }\n})();\n";
