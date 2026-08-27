export const STICKER_CATEGORIES = {
	all: "全部",
	trending: "🔥 热门推荐",
	yellow_face: "😀 经典黄脸",
	bili_girls: "📺 2233娘",
	moe_pet: "🐱 萌宠治愈",
	anime: "🎭 动漫国创",
	meme: "💬 搞怪热梗",
	shapes: "🔷 基础形状",
	flags: "🚩 国家旗帜",
} as const;

export type StickerCategory = keyof typeof STICKER_CATEGORIES;
