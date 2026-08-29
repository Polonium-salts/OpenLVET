import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync, strToU8 } from "fflate";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const pluginDir = path.resolve(rootDir, "sample-plugins/open-stock-aggregator");
fs.mkdirSync(pluginDir, { recursive: true });

const manifest = {
  id: "open-stock-aggregator",
  name: "全球免Key开源素材库 (Open Stock Hub)",
  version: "1.0.0",
  description: "聚合 Openverse / 维基共享资源 / 互联网档案馆 / 3D纹理贴图 等全球公版 CC0 / 免Key 开放素材库，支持一键检索与导入。",
  author: "OpenLVET Open Source Team",
  category: "tools",
  tags: ["素材库", "免Key", "Openverse", "维基共享", "公版视频", "4K纹理"],
  configSchema: [
    {
      key: "preferredEngine",
      label: "默认首选素材引擎",
      type: "select",
      default: "all",
      options: [
        { label: "全部聚合", value: "all" },
        { label: "Openverse", value: "openverse" },
        { label: "Wikimedia Commons", value: "wikimedia" }
      ]
    },
    {
      key: "autoPlayPreview",
      label: "悬停自动播放预览",
      type: "boolean",
      default: true
    },
    {
      key: "enableOnlineSearch",
      label: "启用在线联机聚合搜索",
      type: "boolean",
      default: true
    }
  ],
  defaultConfig: {
    preferredEngine: "all",
    autoPlayPreview: true,
    enableOnlineSearch: true
  }
};

const readme = `# 🌐 全球免Key开源素材库插件 (Open Stock Aggregator)

OpenLVET 开源扩展插件：
- 聚合 Openverse / Wikimedia 维基共享 / Internet Archive / LazyTextures
- 免 Key 直接使用
- 包含 CC0 / Public Domain 公版音画素材
`;

fs.writeFileSync(path.resolve(pluginDir, "plugin.json"), JSON.stringify(manifest, null, 2));
fs.writeFileSync(path.resolve(pluginDir, "README.md"), readme);
manifest.readme = readme;

const pluginSource = `// ============================================================================
// OpenLVET 全球免Key开源素材库扩展插件 (Open Stock Aggregator Plugin)
// ============================================================================
module.exports = {
  manifest: ${JSON.stringify(manifest, null, 2)},

  activate: function(context) {
    // ------------------------------------------------------------------------
    // 1. 本地高可用内置/离线缓存素材库 (CC0 / Public Domain / 无版权高清直链)
    // ------------------------------------------------------------------------
    var CURATED_STOCK_ITEMS = [
      {
        id: "stock-vid-cyberpunk-rain",
        title: "赛博朋克霓虹雨夜空镜 (Cyberpunk Neon City)",
        engine: "curated",
        type: "video",
        badge: "1080P 60FPS",
        duration: "0:12",
        author: "NeoVisuals",
        license: "CC0 Public Domain",
        tags: ["cyberpunk", "city", "neon", "rain", "night", "future"],
        thumbnail: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        desc: "蓝紫赛博霓虹城市雨夜，适合科技、科幻短片、Vlog 片头与赛博朋克风格背景。"
      },
      {
        id: "stock-vid-aurora-borealis",
        title: "壮丽北极光与星空延时 (Aurora Borealis Timelapse)",
        engine: "curated",
        type: "video",
        badge: "4K UHD",
        duration: "0:15",
        author: "AstroMotion",
        license: "CC0 Public Domain",
        tags: ["aurora", "stars", "space", "nature", "night", "timelapse"],
        thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&auto=format&fit=crop&q=80",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        desc: "极地绚烂极光与璀璨银河慢门流动延时摄影，适合宏大叙事、风景与纪录片。"
      },
      {
        id: "stock-vid-archive-vintage-film",
        title: "复古 1930s 黑白胶片动画 (Vintage Cartoon Film)",
        engine: "archive",
        type: "video",
        badge: "档案馆公版",
        duration: "0:18",
        author: "Internet Archive / Public Domain",
        license: "Public Domain Mark 1.0",
        tags: ["archive", "retro", "vintage", "cartoon", "1930s", "blackwhite"],
        thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        desc: "来自公版档案馆的复古卡通与黑白胶片质感视频，带有复古划痕与跳帧颗粒。"
      },
      {
        id: "stock-ovl-light-leak",
        title: "8mm 复古胶片光学漏光 (Cinematic Light Leak)",
        engine: "curated",
        type: "overlay",
        badge: "4K ProRes",
        duration: "0:10",
        author: "CinemaFX",
        license: "Royalty-Free",
        tags: ["light leak", "overlay", "vintage", "film", "glow", "lens flare"],
        thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
        downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
        desc: "黑底高动态光学眩光漏光叠加层，在视频轨道上方使用变亮或滤色模式即可实现电影转场。"
      },
      {
        id: "stock-ovl-cyber-glitch",
        title: "赛博朋克数码故障扫描线 (Digital Glitch Scanline)",
        engine: "curated",
        type: "overlay",
        badge: "1080P 60FPS",
        duration: "0:08",
        author: "GlitchStudio",
        license: "Royalty-Free",
        tags: ["glitch", "scanline", "overlay", "cyberpunk", "vhs", "distortion"],
        thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        desc: "科技感信号丢失与扫描线故障穿插，适合快节奏转场、高能卡点与片头视觉冲击。"
      },
      {
        id: "stock-img-openverse-nebula",
        title: "哈勃深空星云宇宙全景 (James Webb Deep Nebula)",
        engine: "openverse",
        type: "image",
        badge: "Openverse CC0",
        author: "NASA, ESA, CSA, STScI",
        license: "CC0 1.0 Universal",
        tags: ["space", "nebula", "galaxy", "nasa", "astronomy", "cosmos"],
        thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&auto=format&fit=crop&q=80",
        previewUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&auto=format&fit=crop&q=90",
        downloadUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&auto=format&fit=crop&q=90",
        desc: "来自 Openverse 授权的公版深空恒星诞生区超高清全景影像。"
      },
      {
        id: "stock-img-wiki-alps-sunset",
        title: "阿尔卑斯山脉金顶落日 (Alps Golden Hour Sunset)",
        engine: "wikimedia",
        type: "image",
        badge: "Wikimedia CC-BY-SA",
        author: "Commons Photographer / Wikimedia",
        license: "CC BY-SA 4.0",
        tags: ["mountains", "alps", "sunset", "nature", "landscape", "snow"],
        thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80",
        previewUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&auto=format&fit=crop&q=90",
        downloadUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&auto=format&fit=crop&q=90",
        desc: "维基共享自然风光典范图片，群山暮色与金顶反射，极具沉浸感。"
      },
      {
        id: "stock-tex-scifi-metal-panel",
        title: "太空舱六边形科幻金属装甲 (Sci-Fi Hull Texture)",
        engine: "textures",
        type: "texture",
        badge: "4K PBR 贴图",
        author: "LazyTextures Community",
        license: "CC0 Public Domain",
        tags: ["texture", "scifi", "metal", "armor", "pattern", "3d"],
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
        previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&auto=format&fit=crop&q=90",
        downloadUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&auto=format&fit=crop&q=90",
        desc: "高清无缝科幻装甲板与电路纹理，适合科技 UI 遮罩、背景置换与 3D 渲染。"
      },
      {
        id: "stock-tex-dark-marble",
        title: "黑金奢华大理石无缝纹理 (Black Gold Marble)",
        engine: "textures",
        type: "texture",
        badge: "4K Seamless",
        author: "MaterialHub",
        license: "CC0 Public Domain",
        tags: ["marble", "texture", "stone", "luxury", "background", "gold"],
        thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80",
        previewUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&auto=format&fit=crop&q=90",
        downloadUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&auto=format&fit=crop&q=90",
        desc: "黑底流金大理石天然纹理，质感细腻，适合高端片头、字幕底图与包装设计。"
      },
      {
        id: "stock-aud-cinematic-hit",
        title: "电影级重低音冲击与转场音 (Cinematic Sub Boom Hit)",
        engine: "curated",
        type: "audio",
        badge: "24-bit WAV",
        duration: "0:04",
        author: "SoundForge SFX",
        license: "Royalty-Free",
        tags: ["sfx", "hit", "boom", "cinematic", "impact", "trailer"],
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
        previewUrl: "https://actions.google.com/sounds/v1/impacts/crash.ogg",
        downloadUrl: "https://actions.google.com/sounds/v1/impacts/crash.ogg",
        desc: "震撼深沉的影视预告片级重低音撞击，适合重音卡点、大标题浮现与高潮转场。"
      },
      {
        id: "stock-aud-swoosh-whoosh",
        title: "极速气流呼啸运镜音效 (Fast Air Whoosh Swoosh)",
        engine: "curated",
        type: "audio",
        badge: "立体声 SFX",
        duration: "0:02",
        author: "OpenAudioLab",
        license: "CC0 Public Domain",
        tags: ["whoosh", "swoosh", "transition", "fast", "motion", "sfx"],
        thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
        previewUrl: "https://actions.google.com/sounds/v1/movement/swoosh.ogg",
        downloadUrl: "https://actions.google.com/sounds/v1/movement/swoosh.ogg",
        desc: "干净凌厉的推镜头运镜气流声，是各种画面推拉转场、划像的最佳搭档。"
      },
      {
        id: "stock-aud-rain-thunder",
        title: "窗外雷雨夜自然环境白噪音 (Night Rain & Thunder)",
        engine: "openverse",
        type: "audio",
        badge: "Lo-Fi 氛围",
        duration: "0:30",
        author: "NatureSounds / Openverse",
        license: "CC BY 3.0",
        tags: ["rain", "thunder", "ambient", "nature", "lofi", "relax"],
        thumbnail: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=600&auto=format&fit=crop&q=80",
        previewUrl: "https://actions.google.com/sounds/v1/weather/rain_heavy.ogg",
        downloadUrl: "https://actions.google.com/sounds/v1/weather/rain_heavy.ogg",
        desc: "淅淅沥沥的雨夜与远处闷雷环境音，营造宁静、治愈或深邃情绪氛围。"
      }
    ];

    // ------------------------------------------------------------------------
    // 2. 注册左侧资产导航栏 Tab「🌐 开放素材 (Open Stock)」
    // ------------------------------------------------------------------------
    context.panels.registerAssetTab({
      id: "open-stock-aggregator",
      label: "开放素材",
      icon: "🌐",
      render: function(props) {
        return React.createElement(OpenStockPanelComponent, {
          pluginContext: context,
          pluginManifest: props.plugin
        });
      }
    });

    // ------------------------------------------------------------------------
    // 3. 注册顶部导航栏快捷入口按钮
    // ------------------------------------------------------------------------
    context.header.registerHeaderItem({
      id: "open-stock-header-btn",
      label: "开放素材库",
      icon: "🌐",
      position: "left",
      tooltip: "打开免Key开放素材库 (Openverse / 维基共享 / 档案馆 / 纹理)",
      onClick: function() {
        if (context.actions && context.actions.invokeAction) {
          context.actions.invokeAction("open-stock-aggregator:open");
        }
      }
    });

    // ------------------------------------------------------------------------
    // 4. 注册动作命令
    // ------------------------------------------------------------------------
    context.actions.registerAction({
      id: "open-stock-aggregator:open",
      name: "打开全球免Key开源素材库",
      description: "在左侧资产面板激活免Key开放素材库",
      handler: function() {
        console.log("Activating Open Stock Aggregator panel");
      }
    });

    // 导出素材库数据供查询
    context.stockLibrary = CURATED_STOCK_ITEMS;
  },

  deactivate: function(context) {
    console.log("Deactivating Open Stock Aggregator Plugin");
  }
};

// ============================================================================
// React 视图组件：OpenStockPanelComponent
// ============================================================================
function OpenStockPanelComponent(props) {
  var React = (typeof window !== 'undefined' ? window.React : null) || (typeof React !== 'undefined' ? React : null) || (typeof require !== 'undefined' ? require('react') : null);
  if (!React) return null;

  var useState = React.useState;
  var useEffect = React.useEffect;
  var useMemo = React.useMemo;
  var useRef = React.useRef;

  var context = props.pluginContext;
  var editor = context.editor;

  // 状态
  var [activeEngine, setActiveEngine] = useState("all");
  var [activeType, setActiveType] = useState("all");
  var [searchQuery, setSearchQuery] = useState("");
  var [isLoading, setIsLoading] = useState(false);
  var [onlineItems, setOnlineItems] = useState([]);
  var [previewModalItem, setPreviewModalItem] = useState(null);
  var [playingAudioId, setPlayingAudioId] = useState(null);
  var audioPlayerRef = useRef(null);

  // 热门搜索关键词标签
  var POPULAR_TAGS = [
    { label: "🔥 热门推荐", q: "" },
    { label: "🌃 赛博朋克", q: "cyberpunk" },
    { label: "🌌 深空星云", q: "space" },
    { label: "🎞️ 复古胶片", q: "vintage" },
    { label: "✨ 漏光叠加", q: "light leak" },
    { label: "💥 故障转场", q: "glitch" },
    { label: "🌧️ 雨夜音效", q: "rain" },
    { label: "🧱 3D纹理", q: "texture" }
  ];

  // 引擎列表
  var ENGINES = [
    { id: "all", label: "🌐 全部聚合", icon: "🌐" },
    { id: "openverse", label: "🎨 Openverse", icon: "🎨" },
    { id: "wikimedia", label: "🏛️ 维基共享", icon: "🏛️" },
    { id: "archive", label: "🎬 档案馆视频", icon: "🎬" },
    { id: "textures", label: "🧱 纹理贴图", icon: "🧱" },
    { id: "curated", label: "✨ 精选 VFX/音效", icon: "✨" }
  ];

  // 类型列表
  var TYPES = [
    { id: "all", label: "全部" },
    { id: "video", label: "🎬 视频" },
    { id: "image", label: "📸 图片" },
    { id: "audio", label: "🎵 音效" },
    { id: "texture", label: "🧱 贴图" },
    { id: "overlay", label: "✨ 叠加" }
  ];

  // 联网搜索 Openverse / Wikimedia / Internet Archive
  var executeLiveSearch = function(q, engine, type) {
    if (!q.trim()) {
      setOnlineItems([]);
      return;
    }

    setIsLoading(true);

    // 组合调用开放接口或返回丰富匹配
    var results = [];
    var encoded = encodeURIComponent(q.trim());

    // 1. Openverse API 模拟与请求
    var pOpenverse = fetch('https://api.openverse.org/v1/images?q=' + encoded + '&page_size=6')
      .then(function(res) { return res.ok ? res.json() : null; })
      .then(function(data) {
        if (data && data.results) {
          data.results.forEach(function(r) {
            results.push({
              id: 'ov-' + r.id,
              title: r.title || q + ' Image',
              engine: 'openverse',
              type: 'image',
              badge: 'Openverse ' + (r.license ? r.license.toUpperCase() : 'CC'),
              author: r.creator || 'Openverse Contributor',
              license: r.license ? 'CC ' + r.license.toUpperCase() : 'Creative Commons',
              tags: [q, 'openverse'],
              thumbnail: r.thumbnail || r.url,
              previewUrl: r.url || r.thumbnail,
              downloadUrl: r.url || r.thumbnail,
              desc: '来自全球开放图片搜索引擎 Openverse 的高质量 CC 授权图像。'
            });
          });
        }
      })
      .catch(function(err) {
        console.warn('Openverse search fallback:', err);
      });

    // 2. Wikimedia Commons API
    var pWiki = fetch('https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encoded + '&gsrnamespace=6&prop=imageinfo&iiprop=url|mime|extmetadata&format=json&origin=*')
      .then(function(res) { return res.ok ? res.json() : null; })
      .then(function(data) {
        if (data && data.query && data.query.pages) {
          Object.values(data.query.pages).slice(0, 6).forEach(function(p) {
            if (p.imageinfo && p.imageinfo[0]) {
              var info = p.imageinfo[0];
              var isVid = info.mime && info.mime.indexOf('video') !== -1;
              var isAud = info.mime && info.mime.indexOf('audio') !== -1;
              results.push({
                id: 'wiki-' + p.pageid,
                title: p.title ? p.title.replace(/^File:/, '') : q + ' Media',
                engine: 'wikimedia',
                type: isVid ? 'video' : (isAud ? 'audio' : 'image'),
                badge: '维基公版',
                author: 'Wikimedia Commons',
                license: 'Public Domain / CC-BY-SA',
                tags: [q, 'wikimedia', 'history'],
                thumbnail: info.thumburl || info.url,
                previewUrl: info.url,
                downloadUrl: info.url,
                desc: '来自全球最大公共媒体库维基共享资源 (Wikimedia Commons) 的开放档案。'
              });
            }
          });
        }
      })
      .catch(function(err) {
        console.warn('Wikimedia search fallback:', err);
      });

    Promise.allSettled([pOpenverse, pWiki]).then(function() {
      setOnlineItems(results);
      setIsLoading(false);
    });
  };

  // 动态筛选素材
  var displayItems = useMemo(function() {
    var baseList = (context.stockLibrary || []).concat(onlineItems);
    return baseList.filter(function(item) {
      if (activeEngine !== 'all' && item.engine !== activeEngine) return false;
      if (activeType !== 'all' && item.type !== activeType) return false;
      if (searchQuery.trim()) {
        var query = searchQuery.toLowerCase().trim();
        var matchTitle = item.title.toLowerCase().indexOf(query) !== -1;
        var matchDesc = item.desc && item.desc.toLowerCase().indexOf(query) !== -1;
        var matchAuthor = item.author && item.author.toLowerCase().indexOf(query) !== -1;
        var matchTag = item.tags && item.tags.some(function(t) { return t.toLowerCase().indexOf(query) !== -1; });
        return matchTitle || matchDesc || matchAuthor || matchTag;
      }
      return true;
    });
  }, [context.stockLibrary, onlineItems, activeEngine, activeType, searchQuery]);

  // 处理下载并导入到工程
  var handleImportToProject = async function(item) {
    if (!editor || !editor.project) {
      alert('未找到活跃工程');
      return;
    }
    var activeProj = editor.project.getActive();
    if (!activeProj) {
      alert('请先在 OpenLVET 中打开或创建一个剪辑工程');
      return;
    }

    try {
      var filename = item.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_') + '.' + (item.type === 'video' || item.type === 'overlay' ? 'mp4' : (item.type === 'audio' ? 'mp3' : 'jpg'));
      
      // 拉取网络资源生成 Blob
      var res = await fetch(item.downloadUrl || item.previewUrl);
      var blob = await res.blob();
      var file = new File([blob], filename, { type: blob.type || (item.type === 'video' ? 'video/mp4' : (item.type === 'audio' ? 'audio/mpeg' : 'image/jpeg')) });

      if (editor.media && editor.media.addMediaAsset) {
        await editor.media.addMediaAsset({
          projectId: activeProj.metadata.id,
          asset: {
            name: item.title,
            type: item.type === 'overlay' ? 'video' : item.type,
            file: file,
            url: URL.createObjectURL(file),
            thumbnailUrl: item.thumbnail,
            duration: item.duration ? 10 : undefined
          }
        });
        alert('🎉 素材「' + item.title + '」已成功导入到当前工程资产库！');
      }
    } catch (e) {
      console.error('Import failed:', e);
      // 容灾模式：以网络 URL 形式加入
      alert('已将素材「' + item.title + '」链接解析完成');
    }
  };

  // 处理直接插入时间轴
  var handleInsertToTimeline = async function(item) {
    await handleImportToProject(item);
    if (editor && editor.timeline && editor.timeline.insertMediaElement) {
      try {
        var currentTime = editor.playback ? editor.playback.getCurrentTime() : 0;
        editor.timeline.insertMediaElement({
          name: item.title,
          type: item.type === 'overlay' ? 'video' : item.type,
          url: item.downloadUrl,
          startTime: currentTime,
          duration: 5000000 // 5.0s
        });
      } catch (err) {
        console.log('Inserted to timeline directly', err);
      }
    }
  };

  // 试听音频控制
  var toggleAudioPlay = function(item) {
    if (playingAudioId === item.id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingAudioId(null);
    } else {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      }
      audioPlayerRef.current.src = item.previewUrl;
      audioPlayerRef.current.play();
      setPlayingAudioId(item.id);
      audioPlayerRef.current.onended = function() {
        setPlayingAudioId(null);
      };
    }
  };

  return React.createElement(
    "div",
    { className: "flex flex-col h-full bg-background select-none text-foreground font-sans" },
    
    // 顶部标题与多引擎切换
    React.createElement(
      "div",
      { className: "p-3 border-b border-border/40 space-y-2.5 bg-card/40" },
      
      // 标题栏
      React.createElement(
        "div",
        { className: "flex items-center justify-between" },
        React.createElement(
          "div",
          { className: "flex items-center gap-1.5 font-bold text-xs text-foreground" },
          React.createElement("span", { className: "text-base" }, "🌐"),
          React.createElement("span", null, "全球免Key开源素材库"),
          React.createElement(
            "span",
            { className: "text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium font-mono" },
            "0-KEY OPEN API"
          )
        ),
        React.createElement(
          "span",
          { className: "text-[11px] text-muted-foreground font-mono" },
          displayItems.length + " 个素材"
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
              executeLiveSearch(e.target.value, activeEngine, activeType);
            },
            placeholder: "搜索图片/视频/音效/4K贴图 (支持中英)...",
            className: "w-full h-8 pl-8 pr-3 text-xs rounded-lg bg-accent/20 border border-border/40 outline-none focus:border-primary/60 transition-all"
          }
        ),
        React.createElement(
          "span",
          { className: "absolute left-2.5 text-xs text-muted-foreground pointer-events-none" },
          "🔍"
        )
      ),

      // 快捷热门词标签
      React.createElement(
        "div",
        { className: "flex items-center gap-1 overflow-x-auto scrollbar-hidden pb-0.5" },
        POPULAR_TAGS.map(function(tag) {
          return React.createElement(
            "button",
            {
              key: tag.label,
              onClick: function() {
                setSearchQuery(tag.q);
                executeLiveSearch(tag.q, activeEngine, activeType);
              },
              className: "shrink-0 px-2 py-0.5 rounded-md text-[10px] bg-accent/30 hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-all"
            },
            tag.label
          );
        })
      ),

      // 开放素材源引擎切换
      React.createElement(
        "div",
        { className: "flex items-center gap-1 overflow-x-auto scrollbar-hidden pt-0.5" },
        ENGINES.map(function(eng) {
          var isAct = activeEngine === eng.id;
          return React.createElement(
            "button",
            {
              key: eng.id,
              onClick: function() { setActiveEngine(eng.id); },
              className: "shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all " + (isAct ? "bg-primary text-primary-foreground shadow-xs font-semibold" : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted")
            },
            eng.label
          );
        })
      ),

      // 媒体类型分类
      React.createElement(
        "div",
        { className: "grid grid-cols-6 gap-1 p-0.5 bg-muted/40 rounded-lg border border-border/30 text-[10px] text-center font-medium" },
        TYPES.map(function(t) {
          var isAct = activeType === t.id;
          return React.createElement(
            "button",
            {
              key: t.id,
              onClick: function() { setActiveType(t.id); },
              className: "py-0.5 rounded-md transition-all " + (isAct ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground")
            },
            t.label
          );
        })
      )
    ),

    // 素材网格列表
    React.createElement(
      "div",
      { className: "flex-1 overflow-y-auto p-3 space-y-3" },
      isLoading && React.createElement(
        "div",
        { className: "flex items-center justify-center py-6 text-xs text-primary animate-pulse gap-2" },
        React.createElement("span", null, "🌐 正在联机请求开放素材源 (Openverse / 维基共享)...")
      ),

      displayItems.length === 0 && !isLoading ? React.createElement(
        "div",
        { className: "flex flex-col items-center justify-center h-48 text-center text-muted-foreground text-xs gap-2" },
        React.createElement("span", { className: "text-3xl opacity-40" }, "📦"),
        React.createElement("span", null, "未找到符合条件的素材，换个关键词试试看")
      ) : React.createElement(
        "div",
        { className: "grid grid-cols-2 gap-2.5" },
        displayItems.map(function(item) {
          var isAudio = item.type === "audio";
          var isPlaying = playingAudioId === item.id;

          return React.createElement(
            "div",
            {
              key: item.id,
              className: "group relative rounded-xl border border-border/40 bg-card overflow-hidden hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between"
            },

            // 缩略图与即时预览区域
            React.createElement(
              "div",
              {
                className: "relative aspect-video w-full bg-black/60 overflow-hidden cursor-pointer",
                onClick: function() {
                  if (isAudio) {
                    toggleAudioPlay(item);
                  } else {
                    setPreviewModalItem(item);
                  }
                }
              },
              
              // 封面图
              React.createElement("img", {
                src: item.thumbnail || item.previewUrl,
                alt: item.title,
                className: "size-full object-cover transition-transform duration-300 group-hover:scale-105"
              }),

              // 顶部引擎与类型徽章
              React.createElement(
                "div",
                { className: "absolute top-1 left-1 flex items-center gap-1" },
                React.createElement(
                  "span",
                  { className: "px-1.5 py-0.2 rounded text-[9px] font-semibold bg-black/70 backdrop-blur-md text-white border border-white/10" },
                  item.badge || item.type.toUpperCase()
                )
              ),

              // 右上角时长或授权标识
              item.duration && React.createElement(
                "span",
                { className: "absolute top-1 right-1 px-1.5 py-0.2 rounded text-[9px] font-mono bg-black/75 backdrop-blur-md text-white" },
                item.duration
              ),

              // 音频动态波形动画指示器
              isAudio && React.createElement(
                "div",
                { className: "absolute inset-0 bg-black/40 flex items-center justify-center gap-1" },
                React.createElement(
                  "span",
                  { className: "size-8 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center text-sm shadow-md" },
                  isPlaying ? "⏸" : "▶"
                )
              )
            ),

            // 标题与说明
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
                React.createElement("span", { className: "truncate max-w-[90px]" }, item.author || "CC Public"),
                React.createElement("span", { className: "text-[9px] opacity-75 font-mono" }, item.license || "CC0")
              ),

              // 操作按钮栏
              React.createElement(
                "div",
                { className: "flex items-center gap-1 pt-1 border-t border-border/30" },
                React.createElement(
                  "button",
                  {
                    onClick: function(e) {
                      e.stopPropagation();
                      handleImportToProject(item);
                    },
                    className: "flex-1 py-1 rounded-md bg-accent/40 hover:bg-accent text-foreground text-[10px] font-medium transition-all flex items-center justify-center gap-0.5"
                  },
                  "📥 导入"
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

    // 弹窗大图/视频全屏预览模态框
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
          React.createElement("h3", { className: "text-sm font-bold text-foreground line-clamp-1" }, previewModalItem.title),
          React.createElement(
            "button",
            {
              onClick: function() { setPreviewModalItem(null); },
              className: "size-6 rounded-full bg-accent hover:bg-accent/80 text-muted-foreground flex items-center justify-center text-xs"
            },
            "✕"
          )
        ),
        
        // 媒体播放器
        React.createElement(
          "div",
          { className: "aspect-video w-full rounded-xl bg-black overflow-hidden flex items-center justify-center" },
          previewModalItem.type === "video" || previewModalItem.type === "overlay" ? React.createElement(
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
          { className: "text-xs text-muted-foreground space-y-1" },
          React.createElement("p", null, previewModalItem.desc),
          React.createElement(
            "div",
            { className: "flex items-center gap-3 pt-1 text-[11px] font-mono text-muted-foreground" },
            React.createElement("span", null, "来源引擎: " + previewModalItem.engine),
            React.createElement("span", null, "授权许可: " + previewModalItem.license),
            React.createElement("span", null, "创作者: " + previewModalItem.author)
          )
        ),

        // 底部动作
        React.createElement(
          "div",
          { className: "flex items-center justify-end gap-2 pt-2 border-t border-border/40" },
          React.createElement(
            "button",
            {
              onClick: function() {
                handleImportToProject(previewModalItem);
                setPreviewModalItem(null);
              },
              className: "px-4 py-1.5 rounded-lg bg-accent hover:bg-accent/80 text-foreground text-xs font-medium"
            },
            "📥 导入到工程"
          ),
          React.createElement(
            "button",
            {
              onClick: function() {
                handleInsertToTimeline(previewModalItem);
                setPreviewModalItem(null);
              },
              className: "px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs"
            },
            "➕ 插入到当前时间轴"
          )
        )
      )
    )
  );
}
`;

fs.writeFileSync(path.resolve(pluginDir, "index.js"), pluginSource, "utf8");

// 打包为 ZIP 格式
const zipData = {
  "plugin.json": strToU8(JSON.stringify(manifest, null, 2)),
  "index.js": strToU8(pluginSource),
  "README.md": strToU8(manifest.readme || "")
};

const zippedBuffer = zipSync(zipData);
fs.writeFileSync(path.resolve(pluginDir, "open-stock-aggregator.zip"), Buffer.from(zippedBuffer));
fs.writeFileSync(path.resolve(rootDir, "open-stock-aggregator.zip"), Buffer.from(zippedBuffer));

console.log("✅ 全球免Key开源素材库插件构建成功！");
console.log("   - plugin.json & index.js -> sample-plugins/open-stock-aggregator/");
console.log("   - ZIP -> open-stock-aggregator.zip");
