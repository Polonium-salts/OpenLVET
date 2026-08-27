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

// Pre-defined category mapping based on Bilibili package IDs / Names
function categorizePackage(pkg: BilibiliPackage): string {
	const name = pkg.text;
	const id = pkg.id;

	if (id === 1 || name.includes("小黄脸")) return "yellow_face";
	if (id === 2 || id === 5 || id === 6 || name.includes("2233") || name.includes("小电视")) return "bili_girls";
	if (
		[3, 11, 14, 25, 58, 64].includes(id) ||
		name.includes("喵") ||
		name.includes("红小豆") ||
		name.includes("罗小黑") ||
		name.includes("冷兔") ||
		name.includes("咕咕") ||
		name.includes("猫") ||
		name.includes("狗")
	) {
		return "moe_pet";
	}
	if (
		[9, 15, 19, 20, 22, 55, 60, 62, 65].includes(id) ||
		name.includes("洛天依") ||
		name.includes("一人之下") ||
		name.includes("狐妖") ||
		name.includes("灵笼") ||
		name.includes("伍六七") ||
		name.includes("那兔") ||
		name.includes("动漫")
	) {
		return "anime";
	}
	if (
		[7, 8, 10, 12, 16, 18, 24, 53].includes(id) ||
		name.includes("热词") ||
		name.includes("正经人") ||
		name.includes("蛆音娘") ||
		name.includes("梗")
	) {
		return "meme";
	}

	return "meme";
}

async function fetchBilibiliStickers(): Promise<StickerDto[]> {
	const now = Date.now();
	if (cachedStickers && now - cacheTime < CACHE_TTL) {
		return cachedStickers;
	}

	const allPackages: BilibiliPackage[] = [];
	const batchSize = 50;
	const maxBatches = 6; // Check IDs 1..300

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

	for (const pkg of allPackages) {
		if (!pkg.emote || !Array.isArray(pkg.emote)) continue;

		const category = categorizePackage(pkg);

		for (const emote of pkg.emote) {
			if (!emote.url) continue;

			// Clean up text like "[doge_金箍]" -> "doge_金箍" or "doge 金箍"
			const cleanName = emote.text.replace(/^\[|\]$/g, "");
			const secureUrl = emote.url.replace(/^http:\/\//, "https://");

			items.push({
				id: `bilibili:${encodeURIComponent(secureUrl)}`,
				name: cleanName,
				previewUrl: secureUrl,
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
				// Trending: Top items from 小黄脸, 2233娘, tv_小电视, 热词系列
				filtered = allStickers.filter(
					(s) =>
						[1, 2, 5, 6, 9, 25, 53].includes(s.packageId) &&
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
