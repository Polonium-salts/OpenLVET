import { type NextRequest, NextResponse } from "next/server";

interface BilibiliEmoteItem {
	id: number;
	package_id: number;
	text: string;
	url: string;
	mtime?: number;
	type?: number;
	attr?: number;
}

interface BilibiliPackage {
	id: number;
	text: string;
	url: string;
	mtime: number;
	type: number;
	attr: number;
	emote: BilibiliEmoteItem[];
}

export interface StickerDto {
	id: string;
	name: string;
	previewUrl: string;
	packageName: string;
	packageId: number;
	category: string;
	keywords: string[];
}

// Memory cache for scraped Bilibili stickers
let cachedStickers: StickerDto[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

// Smart category classifier based on Bilibili package IDs / Names
function categorizePackage(pkg: BilibiliPackage): string {
	const name = pkg.text.toLowerCase();
	const id = pkg.id;

	// 1. Classic Yellow Face
	if (id === 1 || name.includes("小黄脸") || name.includes("黄脸")) {
		return "yellow_face";
	}

	// 2. Bilibili Mascots (2233 & TV)
	if (
		id === 2 ||
		id === 5 ||
		id === 6 ||
		id === 33 ||
		name.includes("2233") ||
		name.includes("小电视") ||
		name.includes("tv_小电视")
	) {
		return "bili_girls";
	}

	// 3. Gaming IP
	if (
		[84, 97, 139, 178, 226, 354, 366, 470, 536, 766, 852].includes(id) ||
		name.includes("原神") ||
		name.includes("崩坏") ||
		name.includes("铁道") ||
		name.includes("星穹") ||
		name.includes("方舟") ||
		name.includes("明日方舟") ||
		name.includes("绝区零") ||
		name.includes("王者") ||
		name.includes("英雄联盟") ||
		name.includes("碧蓝") ||
		name.includes("阴阳师") ||
		name.includes("游戏") ||
		name.includes("电竞") ||
		name.includes("剑网3")
	) {
		return "game";
	}

	// 4. VUP / Virtual Idols
	if (
		[9, 101, 166, 221, 245, 255, 340, 380, 440, 984].includes(id) ||
		name.includes("洛天依") ||
		name.includes("嘉然") ||
		name.includes("a-soul") ||
		name.includes("asoul") ||
		name.includes("taffy") ||
		name.includes("初音") ||
		name.includes("言和") ||
		name.includes("乐正绫") ||
		name.includes("虚拟") ||
		name.includes("vup") ||
		name.includes("vtuber")
	) {
		return "vup";
	}

	// 5. Moe Pets & Animals
	if (
		[3, 11, 14, 25, 58, 64, 147, 148, 200, 219, 275, 296, 318, 370, 418, 490, 532, 539, 579, 593, 605, 641, 644, 654, 685, 708, 710, 721, 731, 749, 809, 841, 845, 857, 866, 867, 897, 910, 917, 921, 928, 933, 935, 938, 942, 943, 948, 955, 993].includes(id) ||
		name.includes("线条小狗") ||
		name.includes("小狗") ||
		name.includes("修狗") ||
		name.includes("黄油小狗") ||
		name.includes("猫") ||
		name.includes("喵") ||
		name.includes("小豆泥") ||
		name.includes("蜜桃猫") ||
		name.includes("红小豆") ||
		name.includes("罗小黑") ||
		name.includes("冷兔") ||
		name.includes("咕咕") ||
		name.includes("萌宠") ||
		name.includes("动物") ||
		name.includes("兔") ||
		name.includes("鸭") ||
		name.includes("鲨") ||
		name.includes("熊猫")
	) {
		return "moe_pet";
	}

	// 6. Anime & Donghua IP
	if (
		[13, 15, 16, 17, 18, 19, 20, 22, 24, 27, 28, 29, 55, 60, 62, 65].includes(id) ||
		name.includes("一人之下") ||
		name.includes("狐妖") ||
		name.includes("灵笼") ||
		name.includes("伍六七") ||
		name.includes("那兔") ||
		name.includes("天官赐福") ||
		name.includes("魔道") ||
		name.includes("时光代理人") ||
		name.includes("百妖谱") ||
		name.includes("非人哉") ||
		name.includes("动漫") ||
		name.includes("国创") ||
		name.includes("番剧")
	) {
		return "anime";
	}

	// 7. Memes & Funny
	return "meme";
}

async function fetchBilibiliStickers(): Promise<StickerDto[]> {
	const now = Date.now();
	if (cachedStickers && now - cacheTime < CACHE_TTL) {
		return cachedStickers;
	}

	const allPackages: BilibiliPackage[] = [];
	const batchSize = 50;
	// Query packages across IDs 1..1200
	const maxBatches = 24;

	const batchPromises = [];
	for (let b = 0; b < maxBatches; b++) {
		const start = b * batchSize + 1;
		const ids = Array.from({ length: batchSize }, (_, i) => start + i).join(",");
		const url = `https://api.bilibili.com/x/emote/package?business=reply&ids=${ids}`;

		batchPromises.push(
			fetch(url, {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
					Referer: "https://cool.bilibili.com/square/sticker",
				},
				next: { revalidate: 86400 },
			})
				.then((res) => res.json())
				.then((data) => (data?.data?.packages ? (data.data.packages as BilibiliPackage[]) : []))
				.catch((err) => {
					console.error("Failed to fetch bilibili batch:", err);
					return [] as BilibiliPackage[];
				}),
		);
	}

	const batchResults = await Promise.all(batchPromises);
	for (const pkgs of batchResults) {
		allPackages.push(...pkgs);
	}

	const items: StickerDto[] = [];
	const seenUrls = new Set<string>();

	for (const pkg of allPackages) {
		if (!pkg.emote || !Array.isArray(pkg.emote)) continue;

		const category = categorizePackage(pkg);

		for (const emote of pkg.emote) {
			const rawUrl = (emote as any).gif_url || emote.url;
			if (!rawUrl) continue;

			const secureUrl = rawUrl.replace(/^http:\/\//, "https://");
			if (seenUrls.has(secureUrl)) continue;
			seenUrls.add(secureUrl);

			const cleanName = emote.text.replace(/^\[|\]$/g, "");
			const proxiedUrl = `/api/stickers/proxy?url=${encodeURIComponent(secureUrl)}`;

			items.push({
				id: `bilibili:${encodeURIComponent(secureUrl)}`,
				name: cleanName,
				previewUrl: proxiedUrl,
				packageName: pkg.text,
				packageId: pkg.id,
				category,
				keywords: [
					cleanName,
					pkg.text,
					category,
					...cleanName.split(/[_ \-]/),
				].filter(Boolean),
			});
		}
	}

	cachedStickers = items;
	cacheTime = now;
	return items;
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const category = searchParams.get("category");
		const query = searchParams.get("query")?.trim().toLowerCase();
		const limit = Number.parseInt(searchParams.get("limit") || "100", 10);
		const page = Number.parseInt(searchParams.get("page") || "1", 10);

		const allStickers = await fetchBilibiliStickers();

		let filtered = allStickers;

		if (category && category !== "all") {
			if (category === "trending") {
				// Trending: Top items from 小黄脸, 2233娘, tv_小电视, 原神, 洛天依, 线条小狗, 罗小黑, 崩坏
				filtered = allStickers.filter(
					(s) =>
						[1, 2, 5, 6, 9, 25, 84, 97, 139, 245, 490, 852].includes(s.packageId) &&
						!s.name.includes("未定义"),
				);
			} else {
				filtered = allStickers.filter((s) => s.category === category);
			}
		}

		if (query) {
			filtered = filtered.filter((s) =>
				s.keywords.some((k) => k.toLowerCase().includes(query)),
			);
		}

		const total = filtered.length;
		const offset = (page - 1) * limit;
		const paged = filtered.slice(offset, offset + limit);

		return NextResponse.json({
			items: paged,
			total,
			page,
			hasMore: offset + limit < total,
		});
	} catch (error) {
		console.error("Error in bilibili stickers API:", error);
		return NextResponse.json(
			{ error: "Failed to fetch bilibili stickers", items: [], total: 0, hasMore: false },
			{ status: 500 },
		);
	}
}
