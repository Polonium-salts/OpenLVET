export interface StockCategory {
	key: string;
	label: string;
	labelZh: string;
	icon?: string;
}

export const STOCK_CATEGORIES: StockCategory[] = [
	{ key: "all", label: "All", labelZh: "全部" },
	{ key: "backgrounds", label: "Backgrounds", labelZh: "背景" },
	{ key: "nature", label: "Nature", labelZh: "自然风光" },
	{ key: "science", label: "Science & Tech", labelZh: "科技科学" },
	{ key: "people", label: "People", labelZh: "人物生活" },
	{ key: "buildings", label: "Architecture", labelZh: "建筑城市" },
	{ key: "business", label: "Business", labelZh: "商务办公" },
	{ key: "food", label: "Food & Drinks", labelZh: "美食饮品" },
	{ key: "animals", label: "Animals", labelZh: "动物萌宠" },
	{ key: "travel", label: "Travel", labelZh: "旅行度假" },
	{ key: "sports", label: "Sports", labelZh: "运动健身" },
	{ key: "fashion", label: "Fashion", labelZh: "时尚美妆" },
	{ key: "music", label: "Music & Art", labelZh: "音乐艺术" },
	{ key: "transportation", label: "Transportation", labelZh: "交通出行" },
	{ key: "health", label: "Health", labelZh: "医疗健康" },
	{ key: "education", label: "Education", labelZh: "教育学习" },
];
