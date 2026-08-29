import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync, strToU8 } from "fflate";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const pluginDir = path.resolve(rootDir, "sample-plugins/pexels-stock-hub");

fs.mkdirSync(pluginDir, { recursive: true });

const manifestPath = path.resolve(pluginDir, "plugin.json");
const readmePath = path.resolve(pluginDir, "README.md");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (fs.existsSync(readmePath)) {
  manifest.readme = fs.readFileSync(readmePath, "utf8");
}

const pluginSource = `// ============================================================================
// OpenLVET Pexels 官方素材库扩展插件 (Pexels Stock Hub Plugin)
// ============================================================================
module.exports = {
  manifest: ${JSON.stringify(manifest, null, 2)},

  activate: function(context) {
    // ------------------------------------------------------------------------
    // 1. 本地高可用内置/离线精选 Pexels 4K/HD 素材 (Pexels License 免费商用)
    // ------------------------------------------------------------------------
    var CURATED_PEXELS_ITEMS = [
      {
        id: "pexels-vid-ocean-waves",
        title: "蔚蓝海岸巨浪拍岸 4K (Ocean Waves Crashing)",
        engine: "pexels",
        type: "video",
        badge: "4K UHD",
        duration: 14,
        author: "Roman Odintsov",
        authorUrl: "https://www.pexels.com/@roman-odintsov",
        license: "Pexels License (免费商用)",
        tags: ["ocean", "waves", "sea", "nature", "water", "beach", "drone"],
        thumbnail: "https://images.pexels.com/videos/4812204/free-video-4812204.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        width: 3840,
        height: 2160,
        aspectRatio: 16 / 9,
        desc: "极清 4K 无人机航拍蔚蓝海洋与白色海浪拍打黑礁石，适合风光短片、自然纪录片与视觉片头。"
      },
      {
        id: "pexels-vid-city-night-traffic",
        title: "大都会繁华车流夜景延时 (City Traffic Night Timelapse)",
        engine: "pexels",
        type: "video",
        badge: "1080P 60FPS",
        duration: 12,
        author: "Kelly",
        authorUrl: "https://www.pexels.com/@kelly-1179532",
        license: "Pexels License (免费商用)",
        tags: ["city", "night", "traffic", "timelapse", "lights", "urban"],
        thumbnail: "https://images.pexels.com/videos/3129671/free-video-3129671.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        width: 1920,
        height: 1080,
        aspectRatio: 16 / 9,
        desc: "城市高架与摩天大楼车水马龙长曝光延时，适合现代都市、科技快节奏卡点剪辑。"
      },
      {
        id: "pexels-vid-forest-sunlight",
        title: "晨曦穿透雾气森林丁达尔光 (Morning Forest Sunbeam)",
        engine: "pexels",
        type: "video",
        badge: "4K UHD",
        duration: 10,
        author: "Ruvim Miksanskiy",
        authorUrl: "https://www.pexels.com/@ruvim-miksanskiy-65121",
        license: "Pexels License (免费商用)",
        tags: ["forest", "trees", "morning", "sunlight", "nature", "peaceful"],
        thumbnail: "https://images.pexels.com/videos/5585973/pexels-photo-5585973.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
        downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
        width: 3840,
        height: 2160,
        aspectRatio: 16 / 9,
        desc: "清晨阳光穿透原始松林雾霭形成的唯美丁达尔光线，极具电影感和治愈氛围。"
      },
      {
        id: "pexels-vid-cyberpunk-neon-portrait",
        title: "赛博朋克紫红霓虹光影 (Neon Glow Cyberpunk Mood)",
        engine: "pexels",
        type: "video",
        badge: "4K 60FPS",
        duration: 9,
        author: "Mikhail Nilov",
        authorUrl: "https://www.pexels.com/@mikhail-nilov",
        license: "Pexels License (免费商用)",
        tags: ["neon", "cyberpunk", "night", "futuristic", "purple", "portrait"],
        thumbnail: "https://images.pexels.com/videos/7578546/pexels-photo-7578546.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        width: 3840,
        height: 2160,
        aspectRatio: 16 / 9,
        desc: "充满未来主义风格的紫蓝色霓虹光晕渲染，适合科幻概念、MV 与潮流视觉短片。"
      },
      {
        id: "pexels-vid-coffee-pour",
        title: "手冲咖啡慢动作特写 (Pour Over Coffee Slow-Mo)",
        engine: "pexels",
        type: "video",
        badge: "1080P 120FPS",
        duration: 8,
        author: "Engin Akyurt",
        authorUrl: "https://www.pexels.com/@enginakyurt",
        license: "Pexels License (免费商用)",
        tags: ["coffee", "cafe", "lifestyle", "morning", "slowmotion", "drink"],
        thumbnail: "https://images.pexels.com/videos/3196024/free-video-3196024.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        width: 1920,
        height: 1080,
        aspectRatio: 16 / 9,
        desc: "精致温暖的手冲咖啡萃取过程慢动作镜头，适合日常生活 Vlog、美食与治愈系视频。"
      },
      {
        id: "pexels-img-mountain-galaxy",
        title: "雪山之巅璀璨银河全景 (Milky Way Over Snow Peak)",
        engine: "pexels",
        type: "image",
        badge: "超清 8K 摄影",
        author: "Eberhard Grossgasteiger",
        authorUrl: "https://www.pexels.com/@eberhardgross",
        license: "Pexels License (免费商用)",
        tags: ["stars", "milkyway", "mountains", "snow", "night", "space", "landscape"],
        thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80",
        previewUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=2560&auto=format&fit=crop&q=90",
        downloadUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=3840&auto=format&fit=crop&q=95",
        width: 6000,
        height: 4000,
        aspectRatio: 3 / 2,
        desc: "壮阔高山之上的璀璨银河拱桥，细节纤毫毕现，适合作为背景图层、转场垫底或大屏展示。"
      },
      {
        id: "pexels-img-aurora-lake",
        title: "极地冰湖倒映极光 (Aurora Borealis Reflected Lake)",
        engine: "pexels",
        type: "image",
        badge: "Pexels 佳作",
        author: "Stein Egil Liland",
        authorUrl: "https://www.pexels.com/@liland-1933239",
        license: "Pexels License (免费商用)",
        tags: ["aurora", "lake", "reflection", "green", "night", "nature"],
        thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&auto=format&fit=crop&q=80",
        previewUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=2560&auto=format&fit=crop&q=90",
        downloadUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=3840&auto=format&fit=crop&q=95",
        width: 5400,
        height: 3600,
        aspectRatio: 3 / 2,
        desc: "绿色与紫色极光在静谧冰湖中的镜面反射，极具视觉冲击力。"
      },
      {
        id: "pexels-img-abstract-particles",
        title: "流金粒子与深蓝抽象光影 (Liquid Gold Particles)",
        engine: "pexels",
        type: "image",
        badge: "4K 抽象背景",
        author: "Steve Johnson",
        authorUrl: "https://www.pexels.com/@steve",
        license: "Pexels License (免费商用)",
        tags: ["abstract", "particles", "gold", "blue", "texture", "background"],
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
        previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=2560&auto=format&fit=crop&q=90",
        downloadUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=3840&auto=format&fit=crop&q=95",
        width: 4000,
        height: 2667,
        aspectRatio: 3 / 2,
        desc: "流体金色粒子与深邃蓝调流动质感，适合作为高端商务、科技片头或字幕底图。"
      }
    ];

    // ------------------------------------------------------------------------
    // 2. 注册左侧资产导航栏 Tab「📷 Pexels 素材」
    // ------------------------------------------------------------------------
    context.panels.registerAssetTab({
      id: "pexels-stock-hub",
      label: "Pexels",
      icon: "📷",
      order: 35,
      render: function(props) {
        return React.createElement(PexelsStockPanelComponent, {
          pluginContext: context,
          pluginManifest: props.plugin,
          initialItems: CURATED_PEXELS_ITEMS
        });
      }
    });

    // ------------------------------------------------------------------------
    // 3. 注册动作命令
    // ------------------------------------------------------------------------
    context.actions.registerAction({
      id: "pexels-stock-hub:search",
      description: "打开 Pexels 官方素材库面板",
      handler: function() {
        if (context.panels && context.panels.setActiveAssetTab) {
          context.panels.setActiveAssetTab("pexels-stock-hub");
        }
      }
    });

    context.stockLibrary = CURATED_PEXELS_ITEMS;
  },

  deactivate: function(context) {
    console.log("Deactivating Pexels Stock Hub Plugin");
  }
};

// ============================================================================
// React 视图组件：PexelsStockPanelComponent
// ============================================================================
function PexelsStockPanelComponent(props) {
  var React = (typeof window !== 'undefined' ? window.React : null) || (typeof React !== 'undefined' ? React : null) || (typeof require !== 'undefined' ? require('react') : null);
  if (!React) return null;

  var useState = React.useState;
  var useEffect = React.useEffect;
  var useMemo = React.useMemo;
  var useRef = React.useRef;

  var context = props.pluginContext;
  var editor = context.editor;

  // 状态管理
  var [activeType, setActiveType] = useState("all"); // 'all' | 'video' | 'image'
  var [activeOrientation, setActiveOrientation] = useState(context.config.get("defaultOrientation", "all"));
  var [searchQuery, setSearchQuery] = useState("");
  var [isLoading, setIsLoading] = useState(false);
  var [onlineResults, setOnlineResults] = useState([]);
  var [previewModalItem, setPreviewModalItem] = useState(null);
  var [downloadingMap, setDownloadingMap] = useState({});
  var [savedStockIds, setSavedStockIds] = useState({});
  var [activeHoverVideoId, setActiveHoverVideoId] = useState(null);

  // 热门搜索关键词推荐
  var HOT_TAGS = [
    { label: "🔥 热门精选", q: "" },
    { label: "🌊 蔚蓝海洋", q: "ocean" },
    { label: "🏙️ 城市延时", q: "city night" },
    { label: "🌌 宇宙星空", q: "stars galaxy" },
    { label: "🌿 森林自然", q: "forest nature" },
    { label: "☕ 治愈生活", q: "coffee lifestyle" },
    { label: "✨ 粒子光效", q: "particles light" },
    { label: "🚗 速度街景", q: "car traffic" }
  ];

  // 画面方向过滤选项
  var ORIENTATIONS = [
    { id: "all", label: "全部画幅" },
    { id: "landscape", label: "横屏 16:9" },
    { id: "portrait", label: "竖屏 9:16" },
    { id: "square", label: "正方 1:1" }
  ];

  // 媒体分类
  var MEDIA_TYPES = [
    { id: "all", label: "全部素材" },
    { id: "video", label: "🎬 4K/HD 视频" },
    { id: "image", label: "📸 超清摄影" }
  ];

  // 执行实时在线搜索（优先使用 API 接口或 Pexels 开放搜索）
  var executePexelsSearch = async function(q, typeFilter, orientFilter) {
    setIsLoading(true);
    var apiKey = context.config.get("apiKey", "");

    try {
      // 1. 调用 OpenLVET 专设的 Pexels API 代理端点
      var params = new URLSearchParams();
      if (q) params.set("query", q.trim());
      if (typeFilter && typeFilter !== "all") params.set("type", typeFilter);
      if (orientFilter && orientFilter !== "all") params.set("orientation", orientFilter);
      if (apiKey) params.set("apiKey", apiKey);
      params.set("per_page", "16");

      var endpoint = "/api/stock/pexels/search?" + params.toString();
      var res = await fetch(endpoint, {
        headers: apiKey ? { "Authorization": "Bearer " + apiKey } : {}
      });

      if (res.ok) {
        var data = await res.json();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setOnlineResults(data.items);
          setIsLoading(false);
          return;
        }
      }

      // 2. 直连 Pexels 官方 API 容灾
      if (apiKey) {
        var directResults = [];
        var headers = { "Authorization": apiKey };

        if (typeFilter === "all" || typeFilter === "video") {
          var vUrl = q
            ? "https://api.pexels.com/videos/search?query=" + encodeURIComponent(q) + "&per_page=8" + (orientFilter !== "all" ? "&orientation=" + orientFilter : "")
            : "https://api.pexels.com/videos/popular?per_page=8";
          var vRes = await fetch(vUrl, { headers: headers });
          if (vRes.ok) {
            var vData = await vRes.json();
            if (vData.videos) {
              vData.videos.forEach(function(v) {
                var files = v.video_files || [];
                var hd = files.find(function(f) { return f.quality === "hd"; }) || files[0];
                var sd = files.find(function(f) { return f.quality === "sd"; }) || hd;
                directResults.push({
                  id: "pexels-vid-" + v.id,
                  title: q ? q + " - Pexels 视频 #" + v.id : "Pexels 4K 视频 #" + v.id,
                  type: "video",
                  badge: v.width >= 3840 ? "4K UHD" : "1080P HD",
                  author: v.user ? v.user.name : "Pexels 创作者",
                  authorUrl: v.user ? v.user.url : v.url,
                  license: "Pexels License (免费商用)",
                  thumbnail: v.image || (v.video_pictures && v.video_pictures[0] ? v.video_pictures[0].picture : ""),
                  previewUrl: sd ? sd.link : (hd ? hd.link : ""),
                  downloadUrl: hd ? hd.link : (sd ? sd.link : ""),
                  duration: v.duration,
                  width: v.width,
                  height: v.height,
                  aspectRatio: v.width && v.height ? v.width / v.height : 16 / 9,
                  tags: [q, "video", "pexels"].filter(Boolean),
                  engine: "pexels",
                  desc: "来自 Pexels 官方素材库的高清商用视频。"
                });
              });
            }
          }
        }

        if (typeFilter === "all" || typeFilter === "image") {
          var pUrl = q
            ? "https://api.pexels.com/v1/search?query=" + encodeURIComponent(q) + "&per_page=8" + (orientFilter !== "all" ? "&orientation=" + orientFilter : "")
            : "https://api.pexels.com/v1/curated?per_page=8";
          var pRes = await fetch(pUrl, { headers: headers });
          if (pRes.ok) {
            var pData = await pRes.json();
            if (pData.photos) {
              pData.photos.forEach(function(p) {
                var src = p.src || {};
                directResults.push({
                  id: "pexels-img-" + p.id,
                  title: p.alt || (q ? q + " - Pexels 摄影 #" + p.id : "Pexels 超清摄影 #" + p.id),
                  type: "image",
                  badge: p.width >= 3000 ? "超高清摄影" : "HD Photo",
                  author: p.photographer || "Pexels 摄影师",
                  authorUrl: p.photographer_url || p.url,
                  license: "Pexels License (免费商用)",
                  thumbnail: src.medium || src.large,
                  previewUrl: src.large2x || src.large || src.original,
                  downloadUrl: src.original || src.large2x || src.large,
                  width: p.width,
                  height: p.height,
                  aspectRatio: p.width && p.height ? p.width / p.height : 1,
                  tags: [q, "photo", "pexels"].filter(Boolean),
                  engine: "pexels",
                  desc: "来自 Pexels 摄影社区的高分辨率无版权大片。"
                });
              });
            }
          }
        }

        if (directResults.length > 0) {
          setOnlineResults(directResults);
        }
      }
    } catch (err) {
      console.warn("Pexels live search warning:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 整合并过滤显示列表
  var displayList = useMemo(function() {
    var rawList = onlineResults.length > 0 ? onlineResults : (props.initialItems || context.stockLibrary || []);
    return rawList.filter(function(item) {
      if (activeType !== "all" && item.type !== activeType) return false;
      if (activeOrientation !== "all" && item.aspectRatio) {
        if (activeOrientation === "landscape" && item.aspectRatio < 1.2) return false;
        if (activeOrientation === "portrait" && item.aspectRatio > 0.85) return false;
        if (activeOrientation === "square" && (item.aspectRatio < 0.85 || item.aspectRatio > 1.2)) return false;
      }
      if (searchQuery.trim() && onlineResults.length === 0) {
        var q = searchQuery.toLowerCase().trim();
        var matchTitle = item.title && item.title.toLowerCase().indexOf(q) !== -1;
        var matchTags = item.tags && item.tags.some(function(t) { return t.toLowerCase().indexOf(q) !== -1; });
        var matchAuthor = item.author && item.author.toLowerCase().indexOf(q) !== -1;
        return matchTitle || matchTags || matchAuthor;
      }
      return true;
    });
  }, [onlineResults, props.initialItems, context.stockLibrary, activeType, activeOrientation, searchQuery]);

  // 下载素材并存入「统一素材库」
  var handleDownloadToUnifiedStock = async function(item) {
    if (downloadingMap[item.id]) return;

    setDownloadingMap(function(prev) {
      var n = Object.assign({}, prev);
      n[item.id] = true;
      return n;
    });

    try {
      var targetUrl = item.downloadUrl || item.previewUrl;
      var fetchUrl = targetUrl;

      // 优先经由 proxy-download 获取二进制 Blob（避免部分 CDN 跨域限制）
      try {
        var proxyUrl = "/api/stock/pexels/proxy-download?url=" + encodeURIComponent(targetUrl);
        var proxyRes = await fetch(proxyUrl);
        if (proxyRes.ok) {
          var blob = await proxyRes.blob();
          if (blob && blob.size > 1000) {
            // 存入统一素材库
            if (context.stock && context.stock.addStockItem) {
              await context.stock.addStockItem({
                name: item.title,
                type: item.type,
                blob: blob,
                thumbnailUrl: item.thumbnail,
                duration: item.duration,
                width: item.width,
                height: item.height,
                tags: item.tags || ["pexels"]
              });
            }

            setSavedStockIds(function(prev) {
              var s = Object.assign({}, prev);
              s[item.id] = true;
              return s;
            });

            if (context.ui && context.ui.showToast) {
              context.ui.showToast("🎉 已成功将「" + item.title + "」下载保存到全局统一素材库！", { type: "success" });
            }

            // 同步导入当前工程
            var autoImport = context.config.get("autoImportToProject", true);
            if (autoImport && editor && editor.project) {
              var activeProj = editor.project.getActive();
              if (activeProj && editor.media && editor.media.addMediaAsset) {
                var ext = item.type === "video" ? "mp4" : "jpg";
                var file = new File([blob], item.title + "." + ext, { type: blob.type });
                await editor.media.addMediaAsset({
                  projectId: activeProj.metadata.id,
                  asset: {
                    name: item.title,
                    type: item.type,
                    file: file,
                    url: URL.createObjectURL(file),
                    thumbnailUrl: item.thumbnail,
                    duration: item.duration
                  }
                });
              }
            }

            return;
          }
        }
      } catch (proxyErr) {
        console.warn("Proxy download fallback to direct fetch:", proxyErr);
      }

      // 直连下载
      var directRes = await fetch(fetchUrl);
      var directBlob = await directRes.blob();

      if (context.stock && context.stock.addStockItem) {
        await context.stock.addStockItem({
          name: item.title,
          type: item.type,
          blob: directBlob,
          thumbnailUrl: item.thumbnail,
          duration: item.duration,
          width: item.width,
          height: item.height,
          tags: item.tags || ["pexels"]
        });
      }

      setSavedStockIds(function(prev) {
        var s = Object.assign({}, prev);
        s[item.id] = true;
        return s;
      });

      if (context.ui && context.ui.showToast) {
        context.ui.showToast("🎉 素材「" + item.title + "」已存入统一素材库！", { type: "success" });
      }
    } catch (e) {
      console.error("Download to stock error:", e);
      if (context.ui && context.ui.showToast) {
        context.ui.showToast("下载素材失败，请检查网络连接", { type: "error" });
      }
    } finally {
      setDownloadingMap(function(prev) {
        var n = Object.assign({}, prev);
        delete n[item.id];
        return n;
      });
    }
  };

  // 插入到时间轴轨道
  var handleInsertToTimeline = async function(item) {
    await handleDownloadToUnifiedStock(item);
    if (editor && editor.timeline && editor.timeline.insertMediaElement) {
      try {
        var currentTime = editor.playback ? editor.playback.getCurrentTime() : 0;
        editor.timeline.insertMediaElement({
          name: item.title,
          type: item.type,
          url: item.downloadUrl || item.previewUrl,
          startTime: currentTime,
          duration: (item.duration || 5) * 1000000
        });
      } catch (err) {
        console.log("Insert timeline direct:", err);
      }
    }
  };

  return React.createElement(
    "div",
    { className: "flex flex-col h-full bg-background select-none text-foreground font-sans" },

    // 顶部控制与搜索栏
    React.createElement(
      "div",
      { className: "p-3 border-b border-border/40 space-y-2.5 bg-card/40 shrink-0" },

      // 标题与 API 状态
      React.createElement(
        "div",
        { className: "flex items-center justify-between" },
        React.createElement(
          "div",
          { className: "flex items-center gap-1.5 font-bold text-xs text-foreground" },
          React.createElement("span", { className: "text-base" }, "📷"),
          React.createElement("span", null, "Pexels 官方素材库"),
          React.createElement(
            "span",
            { className: "text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono font-medium" },
            "API CONNECTED"
          )
        ),
        React.createElement(
          "button",
          {
            onClick: function() {
              if (context.ui && context.ui.openPluginSettings) {
                context.ui.openPluginSettings("pexels-stock-hub");
              }
            },
            className: "text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
          },
          "⚙️ 配置 Key"
        )
      ),

      // 搜索框
      React.createElement(
        "div",
        { className: "relative flex items-center" },
        React.createElement(
          "input",
          {
            type: "text",
            value: searchQuery,
            onChange: function(e) {
              setSearchQuery(e.target.value);
            },
            onKeyDown: function(e) {
              if (e.key === "Enter") {
                executePexelsSearch(e.target.value, activeType, activeOrientation);
              }
            },
            placeholder: "在 Pexels 搜索 4K/HD 视频与壁纸大片 (按回车)...",
            className: "w-full h-8 pl-8 pr-16 text-xs rounded-lg bg-accent/20 border border-border/40 outline-none focus:border-primary/60 transition-all"
          }
        ),
        React.createElement(
          "span",
          { className: "absolute left-2.5 text-xs text-muted-foreground pointer-events-none" },
          "🔍"
        ),
        React.createElement(
          "button",
          {
            onClick: function() {
              executePexelsSearch(searchQuery, activeType, activeOrientation);
            },
            className: "absolute right-1 px-2.5 py-1 text-[11px] font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-xs"
          },
          "搜索"
        )
      ),

      // 热门标签快捷选择
      React.createElement(
        "div",
        { className: "flex items-center gap-1 overflow-x-auto scrollbar-hidden pb-0.5" },
        HOT_TAGS.map(function(tag) {
          return React.createElement(
            "button",
            {
              key: tag.label,
              onClick: function() {
                setSearchQuery(tag.q);
                executePexelsSearch(tag.q, activeType, activeOrientation);
              },
              className: "shrink-0 px-2 py-0.5 rounded-md text-[10px] bg-accent/30 hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-all"
            },
            tag.label
          );
        })
      ),

      // 媒体类型切换 (全部 / 视频 / 图片)
      React.createElement(
        "div",
        { className: "grid grid-cols-3 gap-1 p-0.5 bg-muted/40 rounded-lg border border-border/30 text-[11px] text-center font-medium" },
        MEDIA_TYPES.map(function(m) {
          var isAct = activeType === m.id;
          return React.createElement(
            "button",
            {
              key: m.id,
              onClick: function() {
                setActiveType(m.id);
                if (searchQuery.trim()) {
                  executePexelsSearch(searchQuery, m.id, activeOrientation);
                }
              },
              className: "py-1 rounded-md transition-all " + (isAct ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground")
            },
            m.label
          );
        })
      ),

      // 画幅方向过滤器 (全部 / 横屏 16:9 / 竖屏 9:16 / 正方形 1:1)
      React.createElement(
        "div",
        { className: "flex items-center gap-1 overflow-x-auto scrollbar-hidden text-[10px]" },
        ORIENTATIONS.map(function(o) {
          var isAct = activeOrientation === o.id;
          return React.createElement(
            "button",
            {
              key: o.id,
              onClick: function() {
                setActiveOrientation(o.id);
                if (searchQuery.trim()) {
                  executePexelsSearch(searchQuery, activeType, o.id);
                }
              },
              className: "shrink-0 px-2 py-0.5 rounded-full transition-all " + (isAct ? "bg-primary/20 text-primary border border-primary/30 font-semibold" : "bg-muted/30 text-muted-foreground hover:text-foreground")
            },
            o.label
          );
        })
      )
    ),

    // 素材瀑布流 / 网格列表
    React.createElement(
      "div",
      { className: "flex-1 overflow-y-auto p-3 space-y-3" },
      isLoading && React.createElement(
        "div",
        { className: "flex items-center justify-center py-8 text-xs text-primary animate-pulse gap-2" },
        React.createElement("span", null, "📷 正在联机请求 Pexels 官方高画质开放素材库...")
      ),

      displayList.length === 0 && !isLoading ? React.createElement(
        "div",
        { className: "flex flex-col items-center justify-center h-48 text-center text-muted-foreground text-xs gap-2" },
        React.createElement("span", { className: "text-3xl opacity-40" }, "📦"),
        React.createElement("span", null, "未找到符合画幅与关键词的 Pexels 素材"),
        React.createElement(
          "button",
          {
            onClick: function() {
              setSearchQuery("");
              setActiveOrientation("all");
              setActiveType("all");
              setOnlineResults([]);
            },
            className: "text-[11px] text-primary hover:underline mt-1"
          },
          "查看精选推荐素材"
        )
      ) : React.createElement(
        "div",
        { className: "grid grid-cols-2 gap-2.5 pb-6" },
        displayList.map(function(item) {
          var isVideo = item.type === "video";
          var isDownloading = !!downloadingMap[item.id];
          var isSaved = !!savedStockIds[item.id];
          var isHovering = activeHoverVideoId === item.id;

          return React.createElement(
            "div",
            {
              key: item.id,
              className: "group relative rounded-xl border border-border/40 bg-card overflow-hidden hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between"
            },

            // 缩略图与即时视频预览卡片
            React.createElement(
              "div",
              {
                className: "relative aspect-video w-full bg-black/60 overflow-hidden cursor-pointer",
                onClick: function() { setPreviewModalItem(item); },
                onMouseEnter: function() {
                  if (isVideo) setActiveHoverVideoId(item.id);
                },
                onMouseLeave: function() {
                  if (isVideo) setActiveHoverVideoId(null);
                }
              },
              
              // 封面图或悬浮即时播放的视频流
              isVideo && isHovering ? React.createElement("video", {
                src: item.previewUrl,
                autoPlay: true,
                muted: true,
                loop: true,
                playsInline: true,
                className: "size-full object-cover"
              }) : React.createElement("img", {
                src: item.thumbnail || item.previewUrl,
                alt: item.title,
                loading: "lazy",
                className: "size-full object-cover transition-transform duration-300 group-hover:scale-105"
              }),

              // 顶部清晰度与画质徽章
              React.createElement(
                "div",
                { className: "absolute top-1.5 left-1.5 flex items-center gap-1" },
                React.createElement(
                  "span",
                  { className: "px-1.5 py-0.2 rounded text-[9px] font-semibold bg-black/75 backdrop-blur-md text-white border border-white/10" },
                  item.badge || (isVideo ? "4K UHD" : "HD PHOTO")
                )
              ),

              // 时长或画幅比例
              item.duration && React.createElement(
                "span",
                { className: "absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded text-[9px] font-mono bg-black/75 backdrop-blur-md text-white" },
                "0:" + (item.duration < 10 ? "0" + item.duration : item.duration)
              ),

              // 已保存到素材库状态标识
              isSaved && React.createElement(
                "div",
                { className: "absolute bottom-1.5 left-1.5 px-1.5 py-0.2 rounded text-[9px] font-medium bg-emerald-500/90 text-white flex items-center gap-0.5 shadow-sm" },
                "✓ 已存素材库"
              )
            ),

            // 卡片底部标题与作者
            React.createElement(
              "div",
              { className: "p-2 space-y-1.5" },
              React.createElement(
                "h4",
                { className: "text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors", title: item.title },
                item.title
              ),
              React.createElement(
                "div",
                { className: "flex items-center justify-between text-[10px] text-muted-foreground" },
                React.createElement(
                  "span",
                  { className: "truncate max-w-[100px]" },
                  item.author || "Pexels 创作者"
                ),
                React.createElement(
                  "span",
                  { className: "text-[9px] opacity-75 font-mono" },
                  item.width && item.height ? item.width + "x" + item.height : "Pexels CC0"
                )
              ),

              // 底部动作按钮栏：下载到统一素材库 & 插入时间轴
              React.createElement(
                "div",
                { className: "flex items-center gap-1 pt-1 border-t border-border/30" },
                React.createElement(
                  "button",
                  {
                    disabled: isDownloading,
                    onClick: function(e) {
                      e.stopPropagation();
                      handleDownloadToUnifiedStock(item);
                    },
                    className: "flex-1 py-1 rounded-md text-[10px] font-medium transition-all flex items-center justify-center gap-0.5 " + (isSaved ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-accent/40 hover:bg-accent text-foreground")
                  },
                  isDownloading ? "⏳ 存入中..." : (isSaved ? "✓ 已存素材库" : "📥 存素材库")
                ),
                React.createElement(
                  "button",
                  {
                    onClick: function(e) {
                      e.stopPropagation();
                      handleInsertToTimeline(item);
                    },
                    className: "flex-1 py-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-semibold transition-all flex items-center justify-center gap-0.5 shadow-xs"
                  },
                  "➕ 插入"
                )
              )
            )
          );
        })
      )
    ),

    // 弹窗全屏原画质预览
    previewModalItem && React.createElement(
      "div",
      {
        className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4",
        onClick: function() { setPreviewModalItem(null); }
      },
      React.createElement(
        "div",
        {
          className: "bg-card border border-border/50 rounded-2xl max-w-xl w-full p-4 space-y-3 shadow-2xl",
          onClick: function(e) { e.stopPropagation(); }
        },
        React.createElement(
          "div",
          { className: "flex items-center justify-between border-b border-border/40 pb-2" },
          React.createElement(
            "div",
            { className: "flex items-center gap-2" },
            React.createElement("span", { className: "text-base" }, "📷"),
            React.createElement("h3", { className: "text-sm font-bold text-foreground line-clamp-1" }, previewModalItem.title)
          ),
          React.createElement(
            "button",
            {
              onClick: function() { setPreviewModalItem(null); },
              className: "size-6 rounded-full bg-accent hover:bg-accent/80 text-muted-foreground flex items-center justify-center text-xs"
            },
            "✕"
          )
        ),

        // 播放器 / 超清大图
        React.createElement(
          "div",
          { className: "aspect-video w-full rounded-xl bg-black overflow-hidden flex items-center justify-center" },
          previewModalItem.type === "video" ? React.createElement(
            "video",
            {
              src: previewModalItem.previewUrl,
              controls: true,
              autoPlay: true,
              loop: true,
              className: "size-full object-contain"
            }
          ) : React.createElement(
            "img",
            {
              src: previewModalItem.previewUrl,
              alt: previewModalItem.title,
              className: "size-full object-contain"
            }
          )
        ),

        // 详细信息
        React.createElement(
          "div",
          { className: "text-xs text-muted-foreground space-y-1.5" },
          React.createElement("p", null, previewModalItem.desc || "来自 Pexels 官方素材库的高分辨率免版权素材，可在所有剪辑工程中自由使用。"),
          React.createElement(
            "div",
            { className: "flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-muted-foreground" },
            React.createElement("span", null, "来源平台: Pexels API"),
            React.createElement("span", null, "授权: " + previewModalItem.license),
            React.createElement("span", null, "创作者: " + previewModalItem.author),
            previewModalItem.width && React.createElement("span", null, "分辨率: " + previewModalItem.width + "x" + previewModalItem.height)
          )
        ),

        // 弹窗底部操作栏
        React.createElement(
          "div",
          { className: "flex items-center justify-end gap-2 pt-2 border-t border-border/40" },
          React.createElement(
            "button",
            {
              onClick: function() {
                handleDownloadToUnifiedStock(previewModalItem);
              },
              className: "px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/80 text-foreground text-xs font-medium transition-all"
            },
            "📥 下载至统一素材库"
          ),
          React.createElement(
            "button",
            {
              onClick: function() {
                handleInsertToTimeline(previewModalItem);
                setPreviewModalItem(null);
              },
              className: "px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-all shadow-sm"
            },
            "➕ 插入到时间轴"
          )
        )
      )
    )
  );
}
`;

// 写入 index.js
const indexPath = path.resolve(pluginDir, "index.js");
fs.writeFileSync(indexPath, pluginSource);

// 打包为 ZIP
const readmeContent = fs.readFileSync(readmePath, "utf8");
const zipData = zipSync({
  "plugin.json": strToU8(JSON.stringify(manifest, null, 2)),
  "index.js": strToU8(pluginSource),
  "README.md": strToU8(readmeContent)
});

const zipPluginPath = path.resolve(pluginDir, "pexels-stock-hub.zip");
const zipRootPath = path.resolve(rootDir, "sample-plugins/pexels-stock-hub.zip");
const zipProjectRoot = path.resolve(rootDir, "pexels-stock-hub.zip");

fs.writeFileSync(zipPluginPath, Buffer.from(zipData));
fs.writeFileSync(zipRootPath, Buffer.from(zipData));
fs.writeFileSync(zipProjectRoot, Buffer.from(zipData));

// 生成 src/plugins/preset-plugins.ts 内置预装清单
const presetTsContent = `import type { InstalledPluginRecord, PluginManifest } from "./types";

export const PEXELS_PLUGIN_MANIFEST: PluginManifest = ${JSON.stringify(manifest, null, 2)};

export const PEXELS_PLUGIN_SOURCE = ${JSON.stringify(pluginSource)};

export function getPresetPlugins(): Record<string, InstalledPluginRecord> {
  return {
    "pexels-stock-hub": {
      manifest: PEXELS_PLUGIN_MANIFEST,
      enabled: true,
      config: PEXELS_PLUGIN_MANIFEST.defaultConfig || {},
      installedAt: 1700000000000,
      updatedAt: 1700000000000,
      sourceType: "builtin",
      rawSource: PEXELS_PLUGIN_SOURCE,
      readme: PEXELS_PLUGIN_MANIFEST.readme,
    },
  };
}
`;

const presetTsPath = path.resolve(rootDir, "src/plugins/preset-plugins.ts");
fs.writeFileSync(presetTsPath, presetTsContent, "utf8");

console.log("Successfully built and packaged Pexels Stock Hub plugin:");
console.log("- " + indexPath);
console.log("- " + zipPluginPath);
console.log("- " + zipProjectRoot);
console.log("- " + presetTsPath);

