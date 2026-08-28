import fs from "node:fs";
import path from "node:path";
import { zipSync, strToU8 } from "fflate";

const manifest = {
  id: "third-party-stock-hub",
  name: "第三方高清云素材库 (Cloud Stock Hub)",
  version: "1.0.0",
  description: "汇聚海量免版权 4K/1080P 视频空镜、精选摄影图、动态光效叠加层与电影级免版权 BGM 音效，支持一键导入到当前剪辑工程。",
  author: "OpenLVET Open Stock Community",
  category: "tools",
  tags: ["素材库", "免版税", "4K视频", "BGM", "音效", "背景"],
  configSchema: [
    {
      key: "defaultCategory",
      label: "默认素材分类",
      type: "select",
      default: "all",
      options: [
        { label: "🌟 全部素材 (All)", value: "all" },
        { label: "🎬 视频背景与空镜 (Video)", value: "video" },
        { label: "📸 高清壁纸与图片 (Photo)", value: "image" },
        { label: "🎵 免版税 BGM 与音效 (Audio)", value: "audio" },
        { label: "✨ 动态光效与遮罩 (Overlay)", value: "overlay" }
      ]
    },
    {
      key: "downloadQuality",
      label: "默认下载画质",
      type: "select",
      default: "1080p",
      options: [
        { label: "高清 1080P", value: "1080p" },
        { label: "超清 4K", value: "4k" },
        { label: "标清 720P (省流量)", value: "720p" }
      ]
    }
  ],
  defaultConfig: {
    defaultCategory: "all",
    downloadQuality: "1080p"
  }
};

const indexJs = `// OpenLVET 第三方高清云素材库插件
module.exports = {
  manifest: ${JSON.stringify(manifest, null, 2)},

  activate: function(context) {
    // 精选免版税高清云端素材库列表
    var STOCK_LIBRARY = [
      {
        id: "stock-vid-cyberpunk",
        name: "赛博朋克霓虹雨夜空镜",
        category: "video",
        type: "video",
        badge: "1080P",
        duration: "0:12",
        author: "NeoMotion",
        thumbnail: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&auto=format&fit=crop&q=80",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        desc: "炫酷科技感蓝紫霓虹城市延时空镜，适合科技、Vlog片头背景"
      },
      {
        id: "stock-vid-nature-timelapse",
        name: "极光与壮丽星空延时",
        category: "video",
        type: "video",
        badge: "4K 60FPS",
        duration: "0:15",
        author: "AstroVisuals",
        thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&auto=format&fit=crop&q=80",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        desc: "深邃星空与北极光流动慢门延时摄影，适合风景与宏大叙事"
      },
      {
        id: "stock-vid-ocean-waves",
        name: "蔚蓝海岸浪花慢动作",
        category: "video",
        type: "video",
        badge: "1080P",
        duration: "0:10",
        author: "OceanMotion",
        thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
        desc: "清澈蔚蓝海水拍打沙滩特写慢动作，治愈系风景素材"
      },
      {
        id: "stock-img-space-nebula",
        name: "深空宇宙星云 4K 摄影",
        category: "image",
        type: "image",
        badge: "3840x2160",
        author: "NASA Hubble",
        thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&auto=format&fit=crop&q=80",
        url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&auto=format&fit=crop&q=80",
        desc: "超高清深空星云与星际尘埃摄影，适合视频背景或蒙太奇转场"
      },
      {
        id: "stock-img-mountain-sunset",
        name: "雪山日落金山 4K 宽幅",
        category: "image",
        type: "image",
        badge: "3840x2160",
        author: "PeakShots",
        thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format&fit=crop&q=80",
        url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&auto=format&fit=crop&q=80",
        desc: "壮阔阿尔卑斯雪山日落金色晚霞，高质感摄影壁纸素材"
      },
      {
        id: "stock-img-cyber-texture",
        name: "抽象科技暗光矩阵纹理",
        category: "image",
        type: "image",
        badge: "4K Texture",
        author: "TechGfx",
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&auto=format&fit=crop&q=80",
        desc: "暗黑奢华科技感渐变光影背景，适合用作文字垫底与底纹"
      },
      {
        id: "stock-aud-lofi-sunset",
        name: "慵懒 Lo-Fi 晚风氛围旋律",
        category: "audio",
        type: "audio",
        badge: "BGM • 320K",
        duration: "0:30",
        author: "ChillBeat",
        thumbnail: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
        url: "https://cdn.freesound.org/previews/612/612644_5674468-lq.mp3",
        desc: "轻松悠扬的舒缓钢琴与复古鼓点，非常适合 Vlog、解说与开箱视频"
      },
      {
        id: "stock-aud-whoosh-cinematic",
        name: "电影级重低音呼啸转场音效",
        category: "audio",
        type: "audio",
        badge: "SFX • 无损",
        duration: "0:03",
        author: "SoundForge",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
        url: "https://cdn.freesound.org/previews/608/608645_11861866-lq.mp3",
        desc: "强有力的空气推背感高速转场打击音效，剪辑卡点必备"
      },
      {
        id: "stock-overlay-lens-flare",
        name: "电影级暖金色镜头光晕",
        category: "overlay",
        type: "image",
        badge: "4K Overlay",
        author: "OpticLens",
        thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80",
        url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&auto=format&fit=crop&q=80",
        desc: "黑底透明混合模式光晕，使用「滤色 (Screen)」模式可叠加华丽光芒"
      }
    ];

    // 下载并导入素材到当前工程资产库
    async function importStockItem(item) {
      try {
        var editor = context.editor;
        var activeProject = editor.project.getActiveOrNull ? editor.project.getActiveOrNull() : (editor.project.getActive ? editor.project.getActive() : null);

        if (!activeProject) {
          context.ui.showToast("当前没有打开的项目，无法导入素材", { type: "warning" });
          return;
        }

        context.ui.showToast("正在下载并导入素材: " + item.name + "...", { type: "info" });

        // 获取或直接下载文件 Blob
        var response = await fetch(item.url);
        if (!response.ok) {
          throw new Error("下载远程素材失败: HTTP " + response.status);
        }
        var blob = await response.blob();
        var ext = item.type === "video" ? ".mp4" : item.type === "audio" ? ".mp3" : ".jpg";
        var fileName = item.name + ext;
        var file = new File([blob], fileName, { type: blob.type || (item.type === "video" ? "video/mp4" : item.type === "audio" ? "audio/mpeg" : "image/jpeg") });

        var created = await editor.media.addMediaAsset({
          projectId: activeProject.metadata.id,
          asset: {
            name: fileName,
            type: item.type,
            file: file,
            thumbnailUrl: item.thumbnail,
            hasAudio: item.type === "video" || item.type === "audio"
          }
        });

        if (created) {
          context.ui.showToast("素材「" + item.name + "」已成功添加到左侧项目资产！", { type: "success" });
        } else {
          context.ui.showToast("素材添加完成", { type: "success" });
        }
      } catch (err) {
        console.error("Failed to import stock asset:", err);
        context.ui.showToast("导入失败: " + (err.message || String(err)), { type: "error" });
      }
    }

    // 1. 注册左侧资产面板 Tab「云端素材」
    context.panels.registerAssetTab({
      id: "third-party-stock-tab",
      label: "云端素材",
      order: 45,
      render: function() {
        var [activeCat, setActiveCat] = React.useState("all");
        var [searchQuery, setSearchQuery] = React.useState("");

        var filteredItems = STOCK_LIBRARY.filter(function(item) {
          if (activeCat !== "all" && item.category !== activeCat) return false;
          if (searchQuery.trim()) {
            var q = searchQuery.toLowerCase().trim();
            return (
              item.name.toLowerCase().includes(q) ||
              item.desc.toLowerCase().includes(q) ||
              item.author.toLowerCase().includes(q)
            );
          }
          return true;
        });

        var categories = [
          { id: "all", label: "全部" },
          { id: "video", label: "🎬 视频" },
          { id: "image", label: "📸 图片" },
          { id: "audio", label: "🎵 音乐音效" },
          { id: "overlay", label: "✨ 动态光效" }
        ];

        return React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              height: "100%",
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
              overflow: "hidden",
              select: "none"
            }
          },
          // 顶部筛选与搜索栏
          React.createElement(
            "div",
            { style: { padding: "10px", borderBottom: "1px solid rgba(128,128,128,0.2)", display: "flex", flexDirection: "column", gap: "8px" } },
            React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
              React.createElement("span", { style: { fontSize: "13px", fontWeight: "bold" } }, "☁️ 第三方高清云素材库"),
              React.createElement("span", { style: { fontSize: "10px", color: "var(--primary)", fontWeight: "bold" } }, "免版权商用")
            ),
            React.createElement("input", {
              type: "text",
              placeholder: "搜索 4K 视频、图片、BGM、音效...",
              value: searchQuery,
              onChange: function(e) { setSearchQuery(e.target.value); },
              style: {
                width: "100%",
                padding: "5px 8px",
                fontSize: "11px",
                borderRadius: "5px",
                border: "1px solid rgba(128,128,128,0.3)",
                background: "rgba(0,0,0,0.06)",
                color: "inherit",
                boxSizing: "border-box"
              }
            }),
            React.createElement(
              "div",
              { style: { display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "2px" } },
              categories.map(function(cat) {
                var isActive = activeCat === cat.id;
                return React.createElement(
                  "button",
                  {
                    key: cat.id,
                    onClick: function() { setActiveCat(cat.id); },
                    style: {
                      fontSize: "10px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      border: "none",
                      background: isActive ? "var(--primary)" : "rgba(128,128,128,0.15)",
                      color: isActive ? "var(--primary-foreground)" : "inherit",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      fontWeight: isActive ? "bold" : "normal"
                    }
                  },
                  cat.label
                );
              })
            )
          ),

          // 素材卡片网格列表
          React.createElement(
            "div",
            { style: { flex: 1, overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: "10px" } },
            filteredItems.map(function(item) {
              return React.createElement(
                "div",
                {
                  key: item.id,
                  style: {
                    borderRadius: "8px",
                    border: "1px solid rgba(128,128,128,0.2)",
                    backgroundColor: "rgba(128,128,128,0.04)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                  }
                },
                // 封面图与角标
                React.createElement(
                  "div",
                  { style: { position: "relative", width: "100%", height: "96px", backgroundColor: "#000", overflow: "hidden" } },
                  React.createElement("img", {
                    src: item.thumbnail,
                    alt: item.name,
                    style: { width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }
                  }),
                  React.createElement(
                    "span",
                    {
                      style: {
                        position: "absolute",
                        top: "6px",
                        left: "6px",
                        fontSize: "9px",
                        fontWeight: "bold",
                        backgroundColor: "rgba(0,0,0,0.75)",
                        color: "#38bdf8",
                        padding: "2px 5px",
                        borderRadius: "4px",
                        fontFamily: "monospace"
                      }
                    },
                    item.badge
                  ),
                  item.duration && React.createElement(
                    "span",
                    {
                      style: {
                        position: "absolute",
                        bottom: "6px",
                        right: "6px",
                        fontSize: "9px",
                        fontWeight: "bold",
                        backgroundColor: "rgba(0,0,0,0.8)",
                        color: "#ffffff",
                        padding: "1px 4px",
                        borderRadius: "3px",
                        fontFamily: "monospace"
                      }
                    },
                    item.duration
                  )
                ),

                // 描述与操作
                React.createElement(
                  "div",
                  { style: { padding: "0 8px 8px 8px", display: "flex", flexDirection: "column", gap: "4px" } },
                  React.createElement(
                    "div",
                    { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
                    React.createElement("span", { style: { fontSize: "12px", fontWeight: "bold" } }, item.name),
                    React.createElement("span", { style: { fontSize: "10px", color: "gray" } }, "by " + item.author)
                  ),
                  React.createElement(
                    "p",
                    { style: { margin: 0, fontSize: "10px", color: "gray", lineHeight: "1.3" } },
                    item.desc
                  ),
                  React.createElement(
                    "div",
                    { style: { display: "flex", gap: "6px", marginTop: "4px" } },
                    React.createElement(
                      "button",
                      {
                        onClick: function() { importStockItem(item); },
                        style: {
                          flex: 1,
                          padding: "4px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          backgroundColor: "var(--primary)",
                          color: "var(--primary-foreground)",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }
                      },
                      "📥 导入到项目"
                    ),
                    React.createElement(
                      "button",
                      {
                        onClick: function() {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(item.url);
                            context.ui.showToast("素材直链已复制到剪贴板！", { type: "info" });
                          }
                        },
                        title: "复制直链",
                        style: {
                          padding: "4px 8px",
                          fontSize: "11px",
                          backgroundColor: "rgba(128,128,128,0.15)",
                          color: "inherit",
                          border: "1px solid rgba(128,128,128,0.25)",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }
                      },
                      "🔗"
                    )
                  )
                )
              );
            })
          )
        );
      }
    });

    // 2. 注册顶部 Header 栏快捷打开按钮
    context.header.registerHeaderItem({
      id: "stock-hub-header-btn",
      position: "left",
      order: 22,
      render: function() {
        return React.createElement(
          "button",
          {
            onClick: function() {
              context.ui.showToast("请在左侧面板选择「云端素材」Tab 浏览海量高清素材库！", { type: "info" });
            },
            title: "点击了解第三方高清云素材库",
            style: {
              fontSize: "11px",
              padding: "2px 8px",
              background: "rgba(56, 189, 248, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "5px",
              color: "#38bdf8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: 500
            }
          },
          "☁️ 云素材"
        );
      }
    });

    context.ui.showToast("第三方高清云素材库插件已加载成功！", { type: "success" });
  },

  deactivate: function(context) {
    context.ui.showToast("第三方云素材库已停用", { type: "info" });
  }
};
`;

const readme = `# 第三方高清云素材库 (Cloud Stock Hub v1.0.0)

OpenLVET 专属第三方免版权高清媒体素材库插件。

### 功能亮点：
1. **多分类高清素材库**：
   - 🎬 4K/1080P 科技、自然、赛博朋克空镜视频
   - 📸 超清宇宙星云、雪山、渐变纹理摄影图
   - 🎵 免版税 Lo-Fi 氛围 BGM 与电影级转场音效
   - ✨ 动态光效与透明叠加层
2. **一键导入项目**：支持在左侧面板直接一键下载并加入当前剪辑工程资产库。
3. **实时分类与即时搜索**：毫秒级响应关键词过滤。
`;

// Save files
const outputDir = path.resolve("sample-plugins", "third-party-stock-hub");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "plugin.json"), JSON.stringify(manifest, null, 2));
fs.writeFileSync(path.join(outputDir, "index.js"), indexJs);
fs.writeFileSync(path.join(outputDir, "README.md"), readme);

// Zip packaging
const zipData = zipSync({
  "plugin.json": strToU8(JSON.stringify(manifest, null, 2)),
  "index.js": strToU8(indexJs),
  "README.md": strToU8(readme),
});

fs.writeFileSync(path.resolve("sample-plugins", "third-party-stock-hub.zip"), Buffer.from(zipData));
fs.writeFileSync(path.resolve("third-party-stock-hub.zip"), Buffer.from(zipData));

console.log("Successfully built third-party-stock-hub.zip!");
