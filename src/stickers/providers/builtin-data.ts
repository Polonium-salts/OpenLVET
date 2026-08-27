export interface BuiltinStickerDef {
	id: string; // key without provider, e.g. "like-heart"
	name: string; // Chinese display name
	category: "trending" | "variety" | "arrows" | "emojis" | "sparkles" | "vlog" | "cta";
	keywords: string[];
	svg: string;
}

function svgToDataUrl(svg: string): string {
	return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const BUILTIN_STICKERS: BuiltinStickerDef[] = [
	// ==========================================
	// 1. 🔥 热门 (Trending)
	// ==========================================
	{
		id: "like-heart",
		name: "爆赞红心",
		category: "trending",
		keywords: ["点赞", "红心", "喜欢", "爱心", "like", "heart"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<defs>
				<linearGradient id="lh-grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#ff3b5c"/>
					<stop offset="100%" stop-color="#e11d48"/>
				</linearGradient>
				<filter id="lh-shadow" x="-20%" y="-20%" width="140%" height="140%">
					<feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#e11d48" flood-opacity="0.45"/>
				</filter>
			</defs>
			<circle cx="64" cy="64" r="54" fill="url(#lh-grad)" filter="url(#lh-shadow)"/>
			<path d="M64 96s-28-17.5-28-36c0-10.2 8.3-18.5 18.5-18.5 6.2 0 11.7 3.1 15 7.8 3.3-4.7 8.8-7.8 15-7.8 10.2 0 18.5 8.3 18.5 18.5 0 18.5-29 36-29 36z" fill="#ffffff"/>
		</svg>`,
	},
	{
		id: "fire-hot",
		name: "爆火高能",
		category: "trending",
		keywords: ["火", "热门", "高能", "爆款", "fire", "hot"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<defs>
				<linearGradient id="fh-grad1" x1="0%" y1="100%" x2="0%" y2="0%">
					<stop offset="0%" stop-color="#ef4444"/>
					<stop offset="50%" stop-color="#f97316"/>
					<stop offset="100%" stop-color="#fbbf24"/>
				</linearGradient>
				<linearGradient id="fh-grad2" x1="0%" y1="100%" x2="0%" y2="0%">
					<stop offset="0%" stop-color="#f59e0b"/>
					<stop offset="100%" stop-color="#fef08a"/>
				</linearGradient>
			</defs>
			<path d="M64 8c-2 20-16 32-16 52 0 18 14 32 32 32s32-14 32-32c0-26-22-38-24-60-12 12-14 26-10 38-8-10-10-20-14-30z" fill="url(#fh-grad1)"/>
			<path d="M64 54c-1 10-8 16-8 26 0 9 7 16 16 16s16-7 16-16c0-13-11-19-12-30-6 6-7 13-5 19-4-5-5-10-7-15z" fill="url(#fh-grad2)"/>
		</svg>`,
	},
	{
		id: "triple-combo",
		name: "一键三连",
		category: "trending",
		keywords: ["三连", "点赞", "投币", "收藏", "B站", "combo"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<rect x="8" y="24" width="112" height="80" rx="20" fill="#0284c7" stroke="#38bdf8" stroke-width="4"/>
			<circle cx="36" cy="64" r="14" fill="#fbbf24"/>
			<path d="M36 55l2.5 5.5 6 .8-4.5 4.2 1.2 6-5.2-3-5.2 3 1.2-6-4.5-4.2 6-.8z" fill="#b45309"/>
			<circle cx="64" cy="64" r="14" fill="#ef4444"/>
			<path d="M64 73s-8-5-8-10c0-2.8 2.2-5 5-5 1.7 0 3.2.8 4.1 2.1.9-1.3 2.4-2.1 4.1-2.1 2.8 0 5 2.2 5 5 0 5-10.2 10-10.2 10z" fill="#ffffff"/>
			<circle cx="92" cy="64" r="14" fill="#10b981"/>
			<path d="M88 64l3 3 6-6" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
		</svg>`,
	},
	{
		id: "hot-badge",
		name: "HOT爆款标签",
		category: "trending",
		keywords: ["HOT", "爆", "热门", "标签", "badge"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<rect x="14" y="38" width="100" height="52" rx="16" fill="#dc2626" stroke="#ffffff" stroke-width="4"/>
			<text x="64" y="74" fill="#ffffff" font-size="30" font-weight="900" font-family="Arial Black, Impact, sans-serif" text-anchor="middle" letter-spacing="2">HOT</text>
		</svg>`,
	},
	{
		id: "crown-gold",
		name: "金色王冠",
		category: "trending",
		keywords: ["王冠", "皇冠", "冠军", "第一", "金色", "crown", "gold"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<defs>
				<linearGradient id="cr-gold" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stop-color="#fef08a"/>
					<stop offset="50%" stop-color="#eab308"/>
					<stop offset="100%" stop-color="#ca8a04"/>
				</linearGradient>
			</defs>
			<path d="M18 90l8-52 24 24 14-36 14 36 24-24 8 52z" fill="url(#cr-gold)" stroke="#854d0e" stroke-width="3" stroke-linejoin="round"/>
			<rect x="18" y="90" width="92" height="14" rx="4" fill="#ca8a04" stroke="#854d0e" stroke-width="2"/>
			<circle cx="26" cy="38" r="5" fill="#fef08a" stroke="#854d0e" stroke-width="1.5"/>
			<circle cx="64" cy="26" r="6" fill="#ef4444" stroke="#854d0e" stroke-width="1.5"/>
			<circle cx="102" cy="38" r="5" fill="#fef08a" stroke="#854d0e" stroke-width="1.5"/>
		</svg>`,
	},
	{
		id: "vip-diamond",
		name: "VIP钻石徽章",
		category: "trending",
		keywords: ["VIP", "钻石", "尊贵", "会员", "diamond"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<defs>
				<linearGradient id="dia-grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#38bdf8"/>
					<stop offset="50%" stop-color="#0284c7"/>
					<stop offset="100%" stop-color="#0369a1"/>
				</linearGradient>
			</defs>
			<polygon points="64,16 108,44 64,112 20,44" fill="url(#dia-grad)" stroke="#bae6fd" stroke-width="3"/>
			<polygon points="64,16 108,44 20,44" fill="#7dd3fc" opacity="0.6"/>
			<polygon points="44,44 64,112 84,44" fill="#0284c7" opacity="0.8"/>
			<text x="64" y="40" fill="#ffffff" font-size="14" font-weight="900" font-family="Arial Black" text-anchor="middle">VIP</text>
		</svg>`,
	},
	{
		id: "bomb-burst",
		name: "炸裂爆破",
		category: "trending",
		keywords: ["炸弹", "爆破", "炸裂", "爆", "bomb", "boom"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<circle cx="58" cy="74" r="38" fill="#18181b" stroke="#3f3f46" stroke-width="3"/>
			<circle cx="48" cy="62" r="10" fill="#ffffff" opacity="0.25"/>
			<rect x="74" y="34" width="14" height="10" rx="2" fill="#71717a" transform="rotate(35 74 34)"/>
			<path d="M84 34c10-10 16-6 24-14" fill="none" stroke="#f59e0b" stroke-width="4" stroke-dasharray="4 2"/>
			<polygon points="112,16 118,22 110,24 116,30 108,28 106,36 102,28 94,30 100,24 92,22 100,18 98,10 104,16 110,10" fill="#ef4444"/>
		</svg>`,
	},
	{
		id: "100-score",
		name: "100分满分",
		category: "trending",
		keywords: ["100", "满分", "满分印章", "优秀", "score"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<g transform="rotate(-12 64 64)">
				<text x="64" y="70" fill="#dc2626" font-size="44" font-weight="900" font-family="Arial Black" text-anchor="middle">100</text>
				<line x1="20" y1="84" x2="108" y2="84" stroke="#dc2626" stroke-width="5" stroke-linecap="round"/>
				<line x1="26" y1="94" x2="102" y2="94" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>
			</g>
		</svg>`,
	},

	// ==========================================
	// 2. 🎭 综艺搞怪 (Variety & Memes)
	// ==========================================
	{
		id: "thug-sunglasses",
		name: "搞怪黑超墨镜",
		category: "variety",
		keywords: ["墨镜", "装酷", "Thug Life", "黑超", "sunglasses"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<path d="M12 50h44v32H20l-8-12z M72 50h44v20l-8 12H72z" fill="#18181b" stroke="#000000" stroke-width="2"/>
			<rect x="56" y="52" width="16" height="8" fill="#18181b"/>
			<polygon points="18,54 28,54 18,74" fill="#ffffff" opacity="0.5"/>
			<polygon points="78,54 88,54 78,74" fill="#ffffff" opacity="0.5"/>
		</svg>`,
	},
	{
		id: "sweat-drop",
		name: "尴尬冷汗",
		category: "variety",
		keywords: ["流汗", "冷汗", "无语", "尴尬", "sweat"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<defs>
				<linearGradient id="sw-grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#bae6fd"/>
					<stop offset="50%" stop-color="#38bdf8"/>
					<stop offset="100%" stop-color="#0284c7"/>
				</linearGradient>
			</defs>
			<path d="M64 16 C64 16 32 60 32 84 C32 102 46 116 64 116 C82 116 96 102 96 84 C96 60 64 16 64 16 Z" fill="url(#sw-grad)" stroke="#ffffff" stroke-width="3"/>
			<ellipse cx="50" cy="80" rx="6" ry="16" fill="#ffffff" opacity="0.6" transform="rotate(-20 50 80)"/>
		</svg>`,
	},
	{
		id: "question-three",
		name: "黑人问号???",
		category: "variety",
		keywords: ["问号", "疑问", "黑人问号", "懵逼", "question"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<text x="32" y="80" fill="#facc15" stroke="#000000" stroke-width="2" font-size="48" font-weight="900" font-family="Arial Black">?</text>
			<text x="64" y="60" fill="#ef4444" stroke="#000000" stroke-width="2" font-size="58" font-weight="900" font-family="Arial Black">?</text>
			<text x="96" y="80" fill="#38bdf8" stroke="#000000" stroke-width="2" font-size="48" font-weight="900" font-family="Arial Black">?</text>
		</svg>`,
	},
	{
		id: "eating-watermelon",
		name: "吃瓜群众西瓜",
		category: "variety",
		keywords: ["西瓜", "吃瓜", "八卦", "围观", "watermelon"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<path d="M16 48 C16 96 56 112 64 112 C72 112 112 96 112 48 Z" fill="#22c55e" stroke="#15803d" stroke-width="4"/>
			<path d="M22 50 C22 92 58 104 64 104 C70 104 106 92 106 50 Z" fill="#f8fafc"/>
			<path d="M28 52 C28 88 58 98 64 98 C70 98 100 88 100 52 Z" fill="#ef4444"/>
			<ellipse cx="48" cy="68" rx="2" ry="4" fill="#000000"/>
			<ellipse cx="64" cy="74" rx="2" ry="4" fill="#000000"/>
			<ellipse cx="80" cy="68" rx="2" ry="4" fill="#000000"/>
			<ellipse cx="56" cy="84" rx="2" ry="4" fill="#000000"/>
			<ellipse cx="72" cy="84" rx="2" ry="4" fill="#000000"/>
		</svg>`,
	},
	{
		id: "broken-heart-split",
		name: "心碎一地",
		category: "variety",
		keywords: ["心碎", "扎心", "emo", "难过", "broken heart"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<path d="M64 96s-28-17.5-28-36c0-10.2 8.3-18.5 18.5-18.5 6.2 0 11.7 3.1 15 7.8L64 56l-8 12 12 10-6 18z" fill="#94a3b8"/>
			<path d="M64 96l6-18-12-10 8-12-4.5-6.7c3.3-4.7 8.8-7.8 15-7.8 10.2 0 18.5 8.3 18.5 18.5 0 18.5-29 36-29 36z" fill="#64748b"/>
		</svg>`,
	},
	{
		id: "speechless-lines",
		name: "满头黑线",
		category: "variety",
		keywords: ["黑线", "无语", "尴尬", "晕", "lines"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<g stroke="#3b82f6" stroke-width="4" stroke-linecap="round">
				<line x1="40" y1="20" x2="32" y2="108"/>
				<line x1="56" y1="20" x2="48" y2="108"/>
				<line x1="72" y1="20" x2="64" y2="108"/>
				<line x1="88" y1="20" x2="80" y2="108"/>
			</g>
		</svg>`,
	},

	// ==========================================
	// 3. 📌 箭头标注 (Arrows & Pointers)
	// ==========================================
	{
		id: "hand-pointing-right",
		name: "食指指引手势",
		category: "arrows",
		keywords: ["手势", "食指", "看这里", "指引", "pointer", "hand"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<path d="M20 54h36V42a8 8 0 0 1 16 0v20h28a8 8 0 0 1 0 16H84v6a8 8 0 0 1-16 0v-4H20z" fill="#fcd34d" stroke="#b45309" stroke-width="4" stroke-linejoin="round"/>
		</svg>`,
	},
	{
		id: "red-curved-arrow",
		name: "红色弧形转折箭头",
		category: "arrows",
		keywords: ["箭头", "红色", "转折", "强调", "arrow", "red"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<path d="M24 96 C24 40 60 28 88 32 L84 16 L116 40 L84 64 L88 48 C68 44 40 52 40 96 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
		</svg>`,
	},
	{
		id: "neon-green-arrow",
		name: "荧光绿动态箭头",
		category: "arrows",
		keywords: ["箭头", "荧光", "绿色", "右指", "neon", "arrow"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<polygon points="20,44 68,44 68,24 112,64 68,104 68,84 20,84" fill="#22c55e" stroke="#15803d" stroke-width="4"/>
		</svg>`,
	},
	{
		id: "red-circle-highlight",
		name: "红色荧光手绘圈",
		category: "arrows",
		keywords: ["红圈", "画圈", "重点", "标注", "circle", "highlight"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<ellipse cx="64" cy="64" rx="48" ry="36" fill="none" stroke="#ef4444" stroke-width="6" stroke-linecap="round" stroke-dasharray="280 20" transform="rotate(-6 64 64)"/>
		</svg>`,
	},
	{
		id: "crosshair-target",
		name: "科技瞄准准心",
		category: "arrows",
		keywords: ["准心", "瞄准", "科技", "锁定", "crosshair", "target"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<circle cx="64" cy="64" r="44" fill="none" stroke="#ef4444" stroke-width="4" stroke-dasharray="16 10"/>
			<circle cx="64" cy="64" r="12" fill="none" stroke="#ef4444" stroke-width="3"/>
			<line x1="64" y1="8" x2="64" y2="36" stroke="#ef4444" stroke-width="4"/>
			<line x1="64" y1="92" x2="64" y2="120" stroke="#ef4444" stroke-width="4"/>
			<line x1="8" y1="64" x2="36" y2="64" stroke="#ef4444" stroke-width="4"/>
			<line x1="92" y1="64" x2="120" y2="64" stroke="#ef4444" stroke-width="4"/>
		</svg>`,
	},
	{
		id: "pin-location",
		name: "红色定位图钉",
		category: "arrows",
		keywords: ["定位", "图钉", "地址", "打卡", "pin", "location"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<path d="M64 12 C44 12 28 28 28 48 C28 76 64 116 64 116 C64 116 100 76 100 48 C100 28 84 12 64 12 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="3"/>
			<circle cx="64" cy="48" r="16" fill="#ffffff"/>
		</svg>`,
	},

	// ==========================================
	// 4. 💖 表情情绪 (Emojis & Mood)
	// ==========================================
	{
		id: "emoji-laugh-tears",
		name: "笑哭",
		category: "emojis",
		keywords: ["笑哭", "搞笑", "哈哈", "emoji", "laugh", "tears"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<circle cx="64" cy="64" r="54" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>
			<path d="M38 72 C46 94 82 94 90 72 Z" fill="#78350f"/>
			<path d="M46 72 C52 82 76 82 82 72 Z" fill="#ffffff"/>
			<path d="M34 50 Q44 42 54 50" stroke="#78350f" stroke-width="4" stroke-linecap="round" fill="none"/>
			<path d="M74 50 Q84 42 94 50" stroke="#78350f" stroke-width="4" stroke-linecap="round" fill="none"/>
			<path d="M22 56 C22 56 12 70 20 78 C28 86 36 74 36 74 Z" fill="#38bdf8"/>
			<path d="M106 56 C106 56 116 70 108 78 C100 86 92 74 92 74 Z" fill="#38bdf8"/>
		</svg>`,
	},
	{
		id: "emoji-heart-eyes",
		name: "色迷迷心心眼",
		category: "emojis",
		keywords: ["心动", "喜欢", "爱心眼", "emoji", "love", "heart"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<circle cx="64" cy="64" r="54" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>
			<path d="M44 38s-12 7-12 16c0 8 7 13 12 13s12-5 12-13c0-9-12-16-12-16z" fill="#ef4444"/>
			<path d="M84 38s-12 7-12 16c0 8 7 13 12 13s12-5 12-13c0-9-12-16-12-16z" fill="#ef4444"/>
			<path d="M42 80 C50 96 78 96 86 80 Z" fill="#78350f"/>
		</svg>`,
	},
	{
		id: "emoji-cool-glasses",
		name: "酷拽墨镜笑",
		category: "emojis",
		keywords: ["酷", "装逼", "墨镜", "emoji", "cool"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<circle cx="64" cy="64" r="54" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>
			<path d="M20 48h38v18l-8 10H28l-8-10z M70 48h38v18l-8 10H78l-8-10z" fill="#18181b"/>
			<rect x="56" y="50" width="16" height="6" fill="#18181b"/>
			<path d="M46 88 C54 98 74 98 82 88" stroke="#78350f" stroke-width="5" stroke-linecap="round" fill="none"/>
		</svg>`,
	},
	{
		id: "emoji-star-eyes",
		name: "星星眼崇拜",
		category: "emojis",
		keywords: ["星星眼", "崇拜", "期待", "emoji", "star", "excited"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<circle cx="64" cy="64" r="54" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>
			<polygon points="44,36 48,46 58,48 50,54 52,64 44,58 36,64 38,54 30,48 40,46" fill="#ef4444"/>
			<polygon points="84,36 88,46 98,48 90,54 92,64 84,58 76,64 78,54 70,48 80,46" fill="#ef4444"/>
			<path d="M38 78 C46 98 82 98 90 78 Z" fill="#78350f"/>
		</svg>`,
	},

	// ==========================================
	// 5. ✨ 光效氛围 (Sparkles & Atmosphere)
	// ==========================================
	{
		id: "sparkle-stars-cluster",
		name: "梦幻闪烁星芒",
		category: "sparkles",
		keywords: ["星星", "闪光", "星芒", "高光", "sparkles", "stars"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<path d="M64 12 C64 38 76 50 102 50 C76 50 64 62 64 88 C64 62 52 50 26 50 C52 50 64 38 64 12 Z" fill="#facc15"/>
			<path d="M96 74 C96 86 102 92 114 92 C102 92 96 98 96 110 C96 98 90 92 78 92 C90 92 96 86 96 74 Z" fill="#38bdf8"/>
			<path d="M32 78 C32 86 36 90 44 90 C36 90 32 94 32 102 C32 94 28 90 20 90 C28 90 32 86 32 78 Z" fill="#ec4899"/>
		</svg>`,
	},
	{
		id: "rainbow-dream",
		name: "七彩梦幻彩虹",
		category: "sparkles",
		keywords: ["彩虹", "梦幻", "美好", "七彩", "rainbow"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<path d="M16 88 A48 48 0 0 1 112 88" stroke="#ef4444" stroke-width="8" fill="none"/>
			<path d="M24 88 A40 40 0 0 1 104 88" stroke="#f59e0b" stroke-width="8" fill="none"/>
			<path d="M32 88 A32 32 0 0 1 96 88" stroke="#22c55e" stroke-width="8" fill="none"/>
			<path d="M40 88 A24 24 0 0 1 88 88" stroke="#3b82f6" stroke-width="8" fill="none"/>
			<path d="M48 88 A16 16 0 0 1 80 88" stroke="#a855f7" stroke-width="8" fill="none"/>
		</svg>`,
	},
	{
		id: "party-popper-confetti",
		name: "庆祝礼花彩带",
		category: "sparkles",
		keywords: ["庆祝", "礼花", "彩带", "派对", "party", "confetti"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<polygon points="18,110 54,74 34,54" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>
			<circle cx="70" cy="40" r="4" fill="#ef4444"/>
			<circle cx="86" cy="24" r="5" fill="#3b82f6"/>
			<circle cx="104" cy="50" r="4" fill="#22c55e"/>
			<circle cx="60" cy="20" r="3" fill="#ec4899"/>
			<rect x="80" y="60" width="8" height="8" rx="2" fill="#a855f7" transform="rotate(25 80 60)"/>
			<rect x="94" y="34" width="8" height="8" rx="2" fill="#facc15" transform="rotate(45 94 34)"/>
		</svg>`,
	},
	{
		id: "music-notes-vibe",
		name: "动感发光音符",
		category: "sparkles",
		keywords: ["音符", "音乐", "旋律", "动感", "music", "notes"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<path d="M40 84 A12 12 0 1 1 28 72 L28 28 L92 16 L92 68 A12 12 0 1 1 80 56 L80 32 L40 40 Z" fill="#ec4899" stroke="#be185d" stroke-width="3"/>
		</svg>`,
	},

	// ==========================================
	// 6. 🌿 潮流日常 (Vlog & Lifestyle)
	// ==========================================
	{
		id: "coffee-latte-cup",
		name: "香醇热咖啡",
		category: "vlog",
		keywords: ["咖啡", "下午茶", "慢生活", "拿铁", "coffee", "cup"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<path d="M28 44h56v36a28 28 0 0 1-56 0z" fill="#78350f" stroke="#451a03" stroke-width="3"/>
			<path d="M84 50h12a14 14 0 0 1 0 28H84" fill="none" stroke="#451a03" stroke-width="4"/>
			<rect x="20" y="94" width="72" height="8" rx="4" fill="#d97706"/>
			<path d="M44 32 Q48 20 44 12" stroke="#b45309" stroke-width="3" stroke-linecap="round" fill="none"/>
			<path d="M64 32 Q68 20 64 12" stroke="#b45309" stroke-width="3" stroke-linecap="round" fill="none"/>
		</svg>`,
	},
	{
		id: "polaroid-camera",
		name: "复古拍立得相机",
		category: "vlog",
		keywords: ["相机", "胶片", "拍照", "摄影", "camera", "polaroid"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<rect x="20" y="32" width="88" height="72" rx="16" fill="#f8fafc" stroke="#334155" stroke-width="4"/>
			<circle cx="64" cy="68" r="22" fill="#334155"/>
			<circle cx="64" cy="68" r="14" fill="#0284c7"/>
			<circle cx="60" cy="64" r="5" fill="#ffffff"/>
			<circle cx="92" cy="46" r="6" fill="#ef4444"/>
		</svg>`,
	},
	{
		id: "cute-cat-paw",
		name: "软萌粉色猫爪",
		category: "vlog",
		keywords: ["猫爪", "萌宠", "可爱", "粉色", "cat", "paw"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<ellipse cx="64" cy="78" rx="28" ry="22" fill="#f472b6"/>
			<circle cx="38" cy="48" r="10" fill="#f472b6"/>
			<circle cx="56" cy="38" r="11" fill="#f472b6"/>
			<circle cx="74" cy="38" r="11" fill="#f472b6"/>
			<circle cx="92" cy="48" r="10" fill="#f472b6"/>
		</svg>`,
	},
	{
		id: "sweet-strawberry",
		name: "新鲜红草莓",
		category: "vlog",
		keywords: ["草莓", "水果", "甜美", "甜品", "strawberry"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<path d="M64 112 C32 96 24 64 28 44 C36 28 92 28 100 44 C104 64 96 96 64 112 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="3"/>
			<path d="M48 24 L64 36 L80 24 L68 14 L64 6 L60 14 Z" fill="#22c55e"/>
			<circle cx="48" cy="52" r="2" fill="#fef08a"/>
			<circle cx="64" cy="56" r="2" fill="#fef08a"/>
			<circle cx="80" cy="52" r="2" fill="#fef08a"/>
			<circle cx="56" cy="74" r="2" fill="#fef08a"/>
			<circle cx="72" cy="74" r="2" fill="#fef08a"/>
			<circle cx="64" cy="92" r="2" fill="#fef08a"/>
		</svg>`,
	},

	// ==========================================
	// 7. 👆 互动引导 (Action & CTA)
	// ==========================================
	{
		id: "cta-subscribe-red",
		name: "SUBSCRIBE 订阅按钮",
		category: "cta",
		keywords: ["订阅", "关注", "subscribe", "youtube", "cta"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<rect x="8" y="42" width="112" height="44" rx="22" fill="#dc2626" stroke="#ffffff" stroke-width="3"/>
			<text x="64" y="70" fill="#ffffff" font-size="14" font-weight="900" font-family="Arial Black" text-anchor="middle" letter-spacing="1">SUBSCRIBE</text>
		</svg>`,
	},
	{
		id: "cta-follow-pink",
		name: "+ 关注",
		category: "cta",
		keywords: ["关注", "加粉", "互动", "follow", "cta"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<rect x="14" y="44" width="100" height="40" rx="20" fill="#ec4899" stroke="#ffffff" stroke-width="3"/>
			<text x="64" y="70" fill="#ffffff" font-size="18" font-weight="900" font-family="Arial" text-anchor="middle">+ 关注</text>
		</svg>`,
	},
	{
		id: "cta-bell-ring",
		name: "小铃铛提醒",
		category: "cta",
		keywords: ["铃铛", "提醒", "通知", "开启通知", "bell"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<path d="M64 20 A24 24 0 0 0 40 44 C40 68 30 78 30 84 L98 84 C98 78 88 68 88 44 A24 24 0 0 0 64 20 Z" fill="#fbbf24" stroke="#d97706" stroke-width="4"/>
			<circle cx="64" cy="96" r="10" fill="#f59e0b"/>
		</svg>`,
	},
	{
		id: "cta-click-pointer",
		name: "点击这里 CLICK",
		category: "cta",
		keywords: ["点击", "click", "手指", "按钮", "cta"],
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
			<circle cx="64" cy="64" r="48" fill="#3b82f6" stroke="#ffffff" stroke-width="4"/>
			<text x="64" y="58" fill="#ffffff" font-size="14" font-weight="900" font-family="Arial Black" text-anchor="middle">CLICK</text>
			<path d="M64 68 L64 86 M54 78 L64 88 L74 78" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
		</svg>`,
	},
];

export function getBuiltinStickersByCategory(category: string): BuiltinStickerDef[] {
	return BUILTIN_STICKERS.filter((s) => s.category === category);
}

export function getBuiltinStickerById(id: string): BuiltinStickerDef | null {
	return BUILTIN_STICKERS.find((s) => s.id === id) ?? null;
}

export function getBuiltinStickerDataUrl(sticker: BuiltinStickerDef): string {
	return svgToDataUrl(sticker.svg);
}
