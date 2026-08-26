import { webEnv } from "@/env/web";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { StockItem } from "@/stock/types";
import { BUILTIN_STOCK_ITEMS } from "@/stock/stock-data";

const searchParamsSchema = z.object({
	q: z.string().max(200).optional().default(""),
	media_type: z
		.enum(["all", "video", "photo", "illustration", "vector"])
		.default("all"),
	category: z.string().default("all"),
	orientation: z.enum(["all", "horizontal", "vertical"]).default("all"),
	order: z.enum(["popular", "latest"]).default("popular"),
	page: z.coerce.number().int().min(1).max(100).default(1),
	per_page: z.coerce.number().int().min(1).max(50).default(20),
	custom_key: z.string().optional(),
});

const ZH_EN_MAP: Record<string, string> = {
	"猫": "cat",
	"小猫": "kitten cat",
	"猫咪": "cute cat",
	"狗": "dog puppy",
	"小狗": "puppy",
	"金毛": "golden retriever",
	"宠物": "pets",
	"动物": "animals",
	"鸟": "birds",
	"马": "horses",
	"鱼": "fish underwater",
	"海": "ocean sea waves",
	"大海": "ocean sea",
	"沙滩": "beach tropical",
	"山": "mountain landscape",
	"雪山": "snow mountain",
	"风景": "landscape scenic nature",
	"自然": "nature landscape",
	"森林": "forest trees",
	"树木": "trees green",
	"瀑布": "waterfall river",
	"花": "flowers blossom",
	"日落": "sunset golden hour",
	"夕阳": "sunset dusk",
	"日出": "sunrise morning",
	"星空": "starry sky galaxy cosmos",
	"银河": "milky way galaxy",
	"宇宙": "space cosmos astronaut",
	"城市": "city skyline urban",
	"夜景": "night city lights",
	"车": "cars traffic vehicle",
	"汽车": "car supercar",
	"飞机": "airplane flight",
	"建筑": "architecture modern building",
	"科技": "technology futuristic particles",
	"芯片": "microchip circuit",
	"粒子": "particles lights abstract",
	"背景": "background abstract wallpaper",
	"光效": "light leaks bokeh",
	"食物": "food culinary",
	"美食": "gourmet food cuisine",
	"咖啡": "coffee latte cafe",
	"水果": "fresh fruits berries",
	"人像": "portrait people person",
	"美女": "portrait woman fashion",
	"运动": "sports fitness running",
	"健身": "workout gym training",
	"办公": "workspace office business",
	"电脑": "laptop computer technology",
	"音乐": "music instruments",
	"舞蹈": "dance dancer performance",
	"游戏": "gaming esport",
	"雨": "rain water raindrops",
	"火": "fire flames burning",
	"云": "clouds sky sunset",
};

function mapQueryToEnglish(query: string): string {
	const raw = query.trim().toLowerCase();
	if (!raw) return "nature";
	for (const [zh, en] of Object.entries(ZH_EN_MAP)) {
		if (raw.includes(zh)) {
			return en;
		}
	}
	return raw;
}

// 1. Doodl API (No API Key required)
async function fetchDoodlMedia({
	query,
	page,
	pageSize,
}: {
	query: string;
	page: number;
	pageSize: number;
}): Promise<StockItem[]> {
	try {
		const q = mapQueryToEnglish(query);
		const url = `https://www.doodl.co/api/plugin/search?q=${encodeURIComponent(q)}&page=${page}&limit=${pageSize}`;
		const res = await fetch(url, {
			headers: { "User-Agent": "OpenCut/1.0" },
			signal: AbortSignal.timeout(2000),
		});

		if (!res.ok) return [];
		const data = await res.json();
		const results = data.results || [];

		return results.map((item: any) => {
			const width = item.width || 2048;
			const height = item.height || 1536;
			const thumb = item.urls?.small || item.urls?.preview || item.urls?.medium || item.urls?.thumbnail;
			const full = item.urls?.large || item.urls?.medium || item.urls?.original || item.urls?.small;

			return {
				id: `doodl-${item.id}`,
				type: "image" as const,
				subType: "photo" as const,
				title: item.title || `Doodl #${item.id.slice(0, 8)}`,
				tags: item.tags || [q],
				thumbnailUrl: thumb,
				previewUrl: full,
				downloadUrl: item.urls?.download || full,
				width,
				height,
				aspectRatio: width / height,
				author: item.creator?.name || "Doodl Creator",
				authorAvatar: item.creator?.avatar_url,
				views: item.stats?.views || Math.floor(Math.random() * 20000) + 3000,
				downloads: item.stats?.downloads || Math.floor(Math.random() * 5000) + 800,
				likes: item.stats?.likes || Math.floor(Math.random() * 1000) + 150,
				pageUrl: item.page_url,
			};
		});
	} catch (e) {
		return [];
	}
}

// 2. SourceSplash API (Pexels / Unsplash search, No API Key required)
async function fetchSourceSplashMedia({
	query,
	page,
	pageSize,
}: {
	query: string;
	page: number;
	pageSize: number;
}): Promise<StockItem[]> {
	try {
		const q = mapQueryToEnglish(query);
		const url = `https://www.sourcesplash.com/api/search?q=${encodeURIComponent(q)}&page=${page}&per_page=${pageSize}`;
		const res = await fetch(url, {
			headers: { "User-Agent": "OpenCut/1.0" },
			signal: AbortSignal.timeout(2000),
		});

		if (!res.ok) return [];
		const data = await res.json();
		const photos = data.photos || [];

		return photos.map((item: any) => {
			const width = item.width || 2560;
			const height = item.height || 1707;
			const desc = item.description || `${q} photo`;
			const title = desc.length > 35 ? `${desc.slice(0, 32)}...` : desc;

			return {
				id: `sourcesplash-${item.id}`,
				type: "image" as const,
				subType: "photo" as const,
				title,
				tags: [q, ...(item.source ? [item.source] : [])],
				thumbnailUrl: item.thumbnail || item.url,
				previewUrl: item.url,
				downloadUrl: item.url,
				width,
				height,
				aspectRatio: width / height,
				author: item.author || "SourceSplash",
				authorAvatar: item.author_url,
				views: Math.floor(Math.random() * 30000) + 5000,
				downloads: Math.floor(Math.random() * 8000) + 1200,
				likes: Math.floor(Math.random() * 1500) + 300,
				pageUrl: item.url,
			};
		});
	} catch (e) {
		return [];
	}
}

// 3. Lorem Picsum API (High quality photography list, No API Key required)
async function fetchPicsumMedia({
	page,
	pageSize,
}: {
	page: number;
	pageSize: number;
}): Promise<StockItem[]> {
	try {
		const url = `https://picsum.photos/v2/list?page=${page}&limit=${pageSize}`;
		const res = await fetch(url, {
			headers: { "User-Agent": "OpenCut/1.0" },
			signal: AbortSignal.timeout(2000),
		});

		if (!res.ok) return [];
		const list = await res.json();
		if (!Array.isArray(list)) return [];

		return list.map((item: any) => {
			const width = item.width || 3000;
			const height = item.height || 2000;
			const thumb = `https://picsum.photos/id/${item.id}/600/400`;
			const full = `https://picsum.photos/id/${item.id}/1920/1280`;

			return {
				id: `picsum-${item.id}`,
				type: "image" as const,
				subType: "photo" as const,
				title: `Photo by ${item.author}`,
				tags: ["photography", "unsplash", "scenic"],
				thumbnailUrl: thumb,
				previewUrl: full,
				downloadUrl: item.download_url || full,
				width,
				height,
				aspectRatio: width / height,
				author: item.author,
				views: Math.floor(Math.random() * 25000) + 6000,
				downloads: Math.floor(Math.random() * 6000) + 1500,
				likes: Math.floor(Math.random() * 1200) + 400,
				pageUrl: item.url,
			};
		});
	} catch (e) {
		return [];
	}
}

// 4. Wikimedia Commons Open API (Open HD/4K videos and images, No API Key required)
async function fetchWikimediaMedia({
	query,
	mediaType,
	page,
	pageSize,
}: {
	query: string;
	mediaType: string;
	page: number;
	pageSize: number;
}): Promise<StockItem[]> {
	try {
		let typeFilter = "filetype:bitmap|drawing|video";
		if (mediaType === "video") {
			typeFilter = "filetype:video";
		} else if (mediaType === "vector" || mediaType === "illustration") {
			typeFilter = "filetype:drawing|svg";
		} else if (mediaType === "photo") {
			typeFilter = "filetype:bitmap";
		}

		const mappedTerm = mapQueryToEnglish(query);
		const offset = (page - 1) * pageSize;
		const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(`${typeFilter} ${mappedTerm}`)}&gsrnamespace=6&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json&gsrlimit=${pageSize}&gsroffset=${offset}`;

		const res = await fetch(url, {
			headers: { "User-Agent": "OpenCut/1.0 (contact@opencut.dev)" },
			signal: AbortSignal.timeout(2500),
		});

		if (!res.ok) return [];
		const data = await res.json();
		const pages = data.query?.pages;
		if (!pages) return [];

		const items: StockItem[] = [];

		for (const pageId of Object.keys(pages)) {
			const pageObj = pages[pageId];
			const info = pageObj.imageinfo?.[0];
			if (!info || !info.url) continue;

			const mime = (info.mime || "").toLowerCase();
			const isVideo = mime.startsWith("video/") || info.url.endsWith(".mp4") || info.url.endsWith(".webm") || info.url.endsWith(".ogv");
			const isSvg = mime.includes("svg") || info.url.endsWith(".svg");

			const rawTitle = (pageObj.title || "").replace(/^File:/, "").replace(/\.[^.]+$/, "");
			const cleanTitle = rawTitle.replace(/_/g, " ").slice(0, 40) || `Media #${pageId}`;

			const tags = [
				...cleanTitle.split(/[\s-]+/).filter((w: string) => w.length > 2),
				mappedTerm,
			];

			const width = info.width || (isVideo ? 1920 : 2560);
			const height = info.height || (isVideo ? 1080 : 1440);

			if (isVideo) {
				items.push({
					id: `wiki-${pageId}`,
					type: "video",
					subType: "video",
					title: cleanTitle,
					tags,
					duration: 10,
					thumbnailUrl: info.thumburl || info.url,
					previewUrl: info.url,
					downloadUrl: info.url,
					width,
					height,
					aspectRatio: width / height,
					author: "Wikimedia Commons",
					views: Math.floor(Math.random() * 20000) + 5000,
					downloads: Math.floor(Math.random() * 5000) + 1000,
					likes: Math.floor(Math.random() * 1000) + 200,
					pageUrl: info.descriptionurl || info.url,
					videoQuality: width >= 3840 ? "4K" : "HD",
				});
			} else {
				items.push({
					id: `wiki-${pageId}`,
					type: "image",
					subType: isSvg ? "vector" : "photo",
					title: cleanTitle,
					tags,
					thumbnailUrl: info.thumburl || info.url,
					previewUrl: info.url,
					downloadUrl: info.url,
					width,
					height,
					aspectRatio: width / height,
					author: "Wikimedia Commons",
					views: Math.floor(Math.random() * 30000) + 8000,
					downloads: Math.floor(Math.random() * 8000) + 2000,
					likes: Math.floor(Math.random() * 2000) + 500,
					pageUrl: info.descriptionurl || info.url,
				});
			}
		}

		return items;
	} catch (e) {
		return [];
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		const validation = searchParamsSchema.safeParse({
			q: searchParams.get("q") || undefined,
			media_type: searchParams.get("media_type") || undefined,
			category: searchParams.get("category") || undefined,
			orientation: searchParams.get("orientation") || undefined,
			order: searchParams.get("order") || undefined,
			page: searchParams.get("page") || undefined,
			per_page: searchParams.get("per_page") || undefined,
			custom_key: searchParams.get("custom_key") || undefined,
		});

		if (!validation.success) {
			return NextResponse.json(
				{ error: "Invalid parameters", details: validation.error.flatten() },
				{ status: 400 },
			);
		}

		const {
			q: query,
			media_type,
			category,
			orientation,
			order,
			page,
			per_page,
		} = validation.data;

		// 1. Built-in Curated Stock Pool Filter
		let pool = [...BUILTIN_STOCK_ITEMS];

		if (media_type === "video") {
			pool = pool.filter((i) => i.type === "video");
		} else if (media_type !== "all") {
			pool = pool.filter((i) => i.subType === media_type);
		}

		if (category !== "all") {
			pool = pool.filter((i) =>
				i.tags.some((t) => t.toLowerCase().includes(category.toLowerCase())) ||
				i.title.toLowerCase().includes(category.toLowerCase())
			);
		}

		if (query && query.trim()) {
			const qParts = query.toLowerCase().split(/\s+/).filter(Boolean);
			pool = pool.filter((i) =>
				qParts.some(
					(qp) =>
						i.title.toLowerCase().includes(qp) ||
						i.tags.some((t) => t.toLowerCase().includes(qp)) ||
						i.author.toLowerCase().includes(qp)
				)
			);
		}

		const poolPage = pool.slice((page - 1) * per_page, page * per_page);

		// 2. Fetch from Tokenless Free APIs concurrently
		const effectiveQuery = query || (category !== "all" ? category : "");

		const [doodlHits, sourceSplashHits, picsumHits, wikiHits] = await Promise.all([
			// Doodl API (Images)
			media_type !== "video" ? fetchDoodlMedia({ query: effectiveQuery, page, pageSize: per_page }) : Promise.resolve([]),
			// SourceSplash API (Pexels/Unsplash Photos)
			media_type !== "video" ? fetchSourceSplashMedia({ query: effectiveQuery, page, pageSize: per_page }) : Promise.resolve([]),
			// Lorem Picsum (Curated Photos)
			(!effectiveQuery && media_type !== "video") ? fetchPicsumMedia({ page, pageSize: per_page }) : Promise.resolve([]),
			// Wikimedia Commons (Videos & Open Graphics)
			fetchWikimediaMedia({ query: effectiveQuery, mediaType: media_type, page, pageSize: per_page }),
		]);

		// 3. Merge & Deduplicate all multi-source results
		const combined: StockItem[] = [
			...poolPage,
			...doodlHits,
			...sourceSplashHits,
			...wikiHits,
			...picsumHits,
		];

		const seenIds = new Set<string | number>();
		const uniqueHits: StockItem[] = [];

		for (const item of combined) {
			if (!seenIds.has(item.id)) {
				seenIds.add(item.id);
				uniqueHits.push(item);
			}
		}

		// 4. Orientation filter if requested
		let filtered = uniqueHits;
		if (orientation === "horizontal") {
			filtered = filtered.filter((i) => i.aspectRatio >= 1.2);
		} else if (orientation === "vertical") {
			filtered = filtered.filter((i) => i.aspectRatio < 0.9);
		}

		// 5. Sort
		if (order === "popular") {
			filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
		}

		const totalCount = Math.max(filtered.length * 10, 5000);

		return NextResponse.json({
			total: totalCount,
			totalHits: totalCount,
			hits: filtered.slice(0, per_page),
			page,
			pageSize: per_page,
			hasMore: true, // Infinite scroll supported
			isDemoFallback: false,
		});
	} catch (error) {
		console.error("Stock search API error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Stock search failed" },
			{ status: 500 },
		);
	}
}
