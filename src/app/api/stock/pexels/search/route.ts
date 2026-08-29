import { type NextRequest, NextResponse } from "next/server";

export interface PexelsStockItem {
	id: string;
	title: string;
	type: "video" | "image";
	badge: string;
	author: string;
	authorUrl: string;
	license: string;
	thumbnail: string;
	previewUrl: string;
	downloadUrl: string;
	duration?: number;
	width?: number;
	height?: number;
	tags: string[];
	aspectRatio?: number;
	engine: "pexels";
}

const DEFAULT_PEXELS_KEY = process.env.PEXELS_API_KEY || "";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const query = (searchParams.get("query") || searchParams.get("q") || "").trim();
		const type = searchParams.get("type") || "all"; // 'all' | 'video' | 'photo' | 'image'
		const page = parseInt(searchParams.get("page") || "1", 10);
		const perPage = Math.min(parseInt(searchParams.get("per_page") || "15", 10), 30);
		const orientation = searchParams.get("orientation"); // 'landscape' | 'portrait' | 'square'

		// Extract API key from Authorization header, query param, or server env
		const authHeader = request.headers.get("Authorization") || "";
		const customKey =
			authHeader.replace(/^Bearer\s+/i, "").trim() ||
			searchParams.get("apiKey")?.trim() ||
			DEFAULT_PEXELS_KEY;

		const headers: Record<string, string> = {
			"User-Agent": "OpenLVET-Studio/1.0",
		};

		if (customKey) {
			headers["Authorization"] = customKey;
		}

		const items: PexelsStockItem[] = [];

		// If no API key is provided and no server key is configured, return graceful fallback demo items
		if (!customKey) {
			return NextResponse.json({
				total: 0,
				page,
				perPage,
				items: [],
				hasMore: false,
				requiresApiKey: true,
				message: "请在插件配置中输入 Pexels API Key（免费申请），或配置环境变量 PEXELS_API_KEY。",
			});
		}

		const fetchVideos = type === "all" || type === "video";
		const fetchPhotos = type === "all" || type === "photo" || type === "image";

		const videoLimit = type === "all" ? Math.ceil(perPage / 2) : perPage;
		const photoLimit = type === "all" ? Math.floor(perPage / 2) : perPage;

		const promises: Promise<void>[] = [];

		// 1. Fetch Videos from Pexels
		if (fetchVideos) {
			const videoUrl = query
				? `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${videoLimit}${orientation ? `&orientation=${orientation}` : ""}`
				: `https://api.pexels.com/videos/popular?page=${page}&per_page=${videoLimit}`;

			promises.push(
				fetch(videoUrl, { headers })
					.then(async (res) => {
						if (!res.ok) {
							console.warn("Pexels video fetch error:", res.status, res.statusText);
							return;
						}
						const data = await res.json();
						if (data && Array.isArray(data.videos)) {
							for (const v of data.videos) {
								const files = (v.video_files || []).sort(
									(a: any, b: any) => (b.width || 0) - (a.width || 0),
								);
								const bestFile = files.find((f: any) => f.quality === "hd") || files[0];
								const sdFile = files.find((f: any) => f.quality === "sd") || bestFile;

								const is4k = (v.width && v.width >= 3840) || (bestFile?.width && bestFile.width >= 3840);
								const isHd = (v.width && v.width >= 1920) || (bestFile?.width && bestFile.width >= 1920);

								items.push({
									id: `pexels-vid-${v.id}`,
									title: query ? `${query} - Pexels 视频 #${v.id}` : `Pexels 精选视频 #${v.id}`,
									type: "video",
									badge: is4k ? "4K UHD" : isHd ? "1080P HD" : "HD Video",
									author: v.user?.name || "Pexels 创作者",
									authorUrl: v.user?.url || v.url,
									license: "Pexels License (免费商用)",
									thumbnail: v.image || (v.video_pictures && v.video_pictures[0]?.picture) || "",
									previewUrl: sdFile?.link || bestFile?.link || "",
									downloadUrl: bestFile?.link || sdFile?.link || "",
									duration: v.duration,
									width: v.width || bestFile?.width,
									height: v.height || bestFile?.height,
									aspectRatio: v.width && v.height ? v.width / v.height : 16 / 9,
									tags: [query, "video", "pexels", is4k ? "4k" : "hd"].filter(Boolean) as string[],
									engine: "pexels",
								});
							}
						}
					})
					.catch((err) => console.error("Pexels videos fetch error:", err)),
			);
		}

		// 2. Fetch Photos from Pexels
		if (fetchPhotos) {
			const photoUrl = query
				? `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${photoLimit}${orientation ? `&orientation=${orientation}` : ""}`
				: `https://api.pexels.com/v1/curated?page=${page}&per_page=${photoLimit}`;

			promises.push(
				fetch(photoUrl, { headers })
					.then(async (res) => {
						if (!res.ok) {
							console.warn("Pexels photo fetch error:", res.status, res.statusText);
							return;
						}
						const data = await res.json();
						if (data && Array.isArray(data.photos)) {
							for (const p of data.photos) {
								const src = p.src || {};
								items.push({
									id: `pexels-img-${p.id}`,
									title: p.alt || (query ? `${query} - Pexels 摄影 #${p.id}` : `Pexels 高清摄影 #${p.id}`),
									type: "image",
									badge: p.width >= 3000 ? "超高清摄影" : "HD Photo",
									author: p.photographer || "Pexels 摄影师",
									authorUrl: p.photographer_url || p.url,
									license: "Pexels License (免费商用)",
									thumbnail: src.medium || src.small || src.large,
									previewUrl: src.large || src.large2x || src.original,
									downloadUrl: src.original || src.large2x || src.large,
									width: p.width,
									height: p.height,
									aspectRatio: p.width && p.height ? p.width / p.height : 1,
									tags: [query, "photo", "pexels", p.alt].filter(Boolean) as string[],
									engine: "pexels",
								});
							}
						}
					})
					.catch((err) => console.error("Pexels photos fetch error:", err)),
			);
		}

		await Promise.all(promises);

		return NextResponse.json({
			total: items.length,
			page,
			perPage,
			items,
			hasMore: items.length >= perPage,
		});
	} catch (error) {
		console.error("Pexels API route error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Pexels API request failed" },
			{ status: 500 },
		);
	}
}
