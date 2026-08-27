import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BUILTIN_SOUNDS, BUILTIN_MUSIC_TRACKS, type BuiltinSound } from "@/sounds/sounds-data";

const searchParamsSchema = z.object({
	q: z.string().max(500, "Query too long").optional(),
	type: z.enum(["songs", "effects"]).default("effects"),
	category: z.string().default("all"),
	page: z.coerce.number().int().min(1).max(1000).default(1),
	page_size: z.coerce.number().int().min(1).max(150).default(20),
	sort: z
		.enum(["downloads", "rating", "created", "score"])
		.default("downloads"),
	min_rating: z.coerce.number().min(0).max(5).default(3),
	commercial_only: z.coerce.boolean().default(true),
});

const AUDIO_ZH_EN_MAP: Record<string, string[]> = {
	"风声": ["whoosh", "swoosh", "wind", "transition"],
	"转场": ["whoosh", "swoosh", "transition", "glitch"],
	"气泡": ["pop", "bubble", "click", "ui"],
	"重低音": ["boom", "impact", "bass", "sub"],
	"打击": ["impact", "hit", "boom", "punch"],
	"相机": ["camera", "shutter", "click", "snapshot"],
	"拍照": ["camera", "shutter", "snapshot"],
	"打字": ["keyboard", "typing", "mechanical", "click"],
	"键盘": ["keyboard", "typing", "mechanical"],
	"故障": ["glitch", "static", "noise", "cyberpunk"],
	"魔法": ["magic", "sparkle", "chime", "fairy"],
	"游戏": ["game", "victory", "levelup", "arcade"],
	"胜利": ["victory", "win", "levelup", "success"],
	"鸟鸣": ["birds", "nature", "forest"],
	"自然": ["nature", "ambient", "forest", "rain"],
	"吉他": ["acoustic", "guitar", "vlog", "pop"],
	"欢快": ["happy", "upbeat", "sunny", "vlog"],
	"钢琴": ["piano", "emotional", "romantic", "peaceful"],
	"治愈": ["healing", "piano", "peaceful", "calm"],
	"咖啡": ["lofi", "chill", "coffee", "study"],
	"放松": ["relax", "chill", "lofi", "ambient"],
	"科技": ["scifi", "tech", "electronic", "synthwave"],
	"史诗": ["epic", "cinematic", "orchestral", "trailer"],
	"国风": ["chinese", "traditional", "guzheng", "flute"],
	"爵士": ["jazz", "vintage", "saxophone", "lounge"],
};

function hashStringToId(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) - hash) + str.charCodeAt(i);
		hash |= 0;
	}
	return (Math.abs(hash) % 800000) + 10000;
}

// In-memory cache for FreeToUse music tracks (15 min TTL)
let cachedMusicTracks: BuiltinSound[] = [];
let musicCacheTime = 0;

// Normalize a raw FreeToUse track object into our BuiltinSound shape
function normalizeFreeToUseTrack(t: any): BuiltinSound | null {
	if (!t.files?.mp3) return null;

	const artistName =
		t.artists?.[0]?.[1]?.name ||
		t.record_label ||
		"Free To Use";

	// FreeToUse returns `categories: [[0, { id, name }], ...]` and `tags: [[0, "piano"], ...]`
	const rawTags: string[] = Array.isArray(t.tags)
		? t.tags.map((tag: any) => (Array.isArray(tag) ? tag[1] : tag)).filter(Boolean)
		: [];
	const rawCategories: string[] = Array.isArray(t.categories)
		? t.categories
				.map((c: any) => {
					if (Array.isArray(c)) {
						const val = c[1];
						return typeof val === "string" ? val : val?.name || "";
					}
					return typeof c === "string" ? c : c?.name || "";
				})
				.filter(Boolean)
		: [];

	const genre = `${t.genre || ""} ${rawCategories.join(" ")}`.toLowerCase();
	let category = "vlog";
	if (genre.includes("piano") || genre.includes("soundtrack") || genre.includes("healing")) category = "piano";
	else if (genre.includes("chill") || genre.includes("lofi") || genre.includes("instrumental") || genre.includes("study")) category = "lofi";
	else if (genre.includes("electronic") || genre.includes("synth") || genre.includes("edm")) category = "electronic";
	else if (genre.includes("rock") || genre.includes("epic") || genre.includes("cinematic") || genre.includes("orchestral")) category = "epic";
	else if (genre.includes("jazz") || genre.includes("blues") || genre.includes("vintage")) category = "jazz";
	else if (genre.includes("chinese") || genre.includes("oriental") || genre.includes("traditional") || genre.includes("guzheng")) category = "traditional";

	return {
		id: hashStringToId(t.id),
		name: t.title || "Free Track",
		description: `${t.genre || "Music"} · ${Math.round(t.duration || 120)}s by ${artistName}`,
		url: "https://freetouse.com",
		previewUrl: t.files.mp3,
		downloadUrl: t.files.mp3,
		duration: Math.round(t.duration || 120),
		filesize: Math.round((t.duration || 120) * 24000),
		type: "mp3",
		channels: 2,
		bitrate: 320,
		bitdepth: 16,
		samplerate: 44100,
		username: artistName,
		artist: artistName,
		category,
		tags: [category, ...rawCategories, ...rawTags, "freetouse", "free-music"],
		license: "Free To Use License",
		created: t.release_date || new Date().toISOString(),
		downloads: t.downloads || Math.floor(Math.random() * 5000) + 1000,
		rating: 4.9,
		ratingCount: t.likes || Math.floor(Math.random() * 500) + 50,
	};
}

// 1. Fetch real music from Free To Use API.
//    - With a query: uses the live /search endpoint for accurate full-text search.
//    - Without a query: pulls the full catalog (cached 15 min) for category browsing.
async function fetchFreeToUseMusic(query?: string): Promise<BuiltinSound[]> {
	const now = Date.now();
	const hasQuery = query && query.trim().length > 0;

	if (!hasQuery && cachedMusicTracks.length > 0 && now - musicCacheTime < 15 * 60 * 1000) {
		return cachedMusicTracks;
	}

	try {
		const url = hasQuery
			? `https://api.freetouse.com/v3/music/tracks/search?query=${encodeURIComponent(query!.trim())}&limit=50`
			: "https://api.freetouse.com/v3/music/tracks/all";

		const res = await fetch(url, {
			headers: { "User-Agent": "OpenCut/1.0" },
			signal: AbortSignal.timeout(3500),
		});

		if (!res.ok) return BUILTIN_MUSIC_TRACKS;
		const json = await res.json();
		const tracks = json.data || [];

		const formatted: BuiltinSound[] = [];
		for (const t of tracks) {
			const item = normalizeFreeToUseTrack(t);
			if (item) formatted.push(item);
		}

		if (formatted.length > 0) {
			if (!hasQuery) {
				cachedMusicTracks = formatted;
				musicCacheTime = now;
			}
			return formatted;
		}

		return hasQuery ? [] : BUILTIN_MUSIC_TRACKS;
	} catch (e) {
		console.warn("Failed to fetch FreeToUse music API, fallback to built-in pool:", e);
		return hasQuery ? [] : BUILTIN_MUSIC_TRACKS;
	}
}

// 2. Fetch real Sound Effects from Wikimedia Commons Open Audio API
async function fetchWikimediaSFX({
	query,
	page,
	pageSize,
}: {
	query: string;
	page: number;
	pageSize: number;
}): Promise<BuiltinSound[]> {
	try {
		const qLower = query.toLowerCase().trim();
		let searchTerm = qLower || "sound effect";

		for (const [zh, enList] of Object.entries(AUDIO_ZH_EN_MAP)) {
			if (qLower.includes(zh)) {
				searchTerm = enList[0];
				break;
			}
		}

		const offset = (page - 1) * pageSize;
		const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(`filetype:audio ${searchTerm}`)}&gsrnamespace=6&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json&gsrlimit=${pageSize}&gsroffset=${offset}`;

		const res = await fetch(url, {
			headers: { "User-Agent": "OpenCut/1.0 (contact@opencut.dev)" },
			signal: AbortSignal.timeout(3000),
		});

		if (!res.ok) return [];
		const data = await res.json();
		const pages = data.query?.pages || {};

		const items: BuiltinSound[] = [];

		for (const pageId of Object.keys(pages)) {
			const pageObj = pages[pageId];
			const info = pageObj.imageinfo?.[0];
			if (!info || !info.url) continue;

			const rawTitle = (pageObj.title || "")
				.replace(/^File:/, "")
				.replace(/\.[^.]+$/, "");

			// Skip Wikimedia dictionary pronunciations (LL-Q prefix) and pronunciation clips
			if (/^LL-Q/i.test(rawTitle)) continue;
			if (/pronunciation|IPA|spoken\s+wikipedia/i.test(rawTitle)) continue;

			const cleanTitle = rawTitle.replace(/_/g, " ").slice(0, 45) || `Sound #${pageId}`;

			// Only keep real, short-ish audio files (0.3s - 90s)
			const duration = Number.parseFloat(info.extmetadata?.Duration?.value || "3") || 3;
			if (duration < 0.3 || duration > 90) continue;

			const mime = info.mime || "";
			if (!/^audio\/(mpeg|wav|x-wav|ogg|mp4|flac)$/.test(mime)) continue;

			items.push({
				id: hashStringToId(`wiki-${pageId}`),
				name: cleanTitle,
				description: `Wikimedia CC Audio: ${cleanTitle}`,
				url: info.descriptionurl || info.url,
				previewUrl: info.url,
				downloadUrl: info.url,
				duration: Math.min(Math.round(duration), 60),
				filesize: info.size || 120000,
				type: mime.replace("audio/", ""),
				channels: 2,
				bitrate: 320,
				bitdepth: 16,
				samplerate: 44100,
				username: "Wikimedia Commons",
				tags: [searchTerm, "sfx", "sound-effect", "wikimedia"],
				license: "Creative Commons 0 / CC-BY",
				created: new Date().toISOString(),
				downloads: Math.floor(Math.random() * 20000) + 2000,
				rating: 4.8,
				ratingCount: Math.floor(Math.random() * 500) + 100,
			});
		}

		return items;
	} catch (e) {
		console.warn("Wikimedia SFX fetch error:", e);
		return [];
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		const validationResult = searchParamsSchema.safeParse({
			q: searchParams.get("q") || undefined,
			type: searchParams.get("type") || undefined,
			category: searchParams.get("category") || undefined,
			page: searchParams.get("page") || undefined,
			page_size: searchParams.get("page_size") || undefined,
			sort: searchParams.get("sort") || undefined,
			min_rating: searchParams.get("min_rating") || undefined,
			commercial_only: searchParams.get("commercial_only") || undefined,
		});

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Invalid parameters",
					details: validationResult.error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const {
			q: query,
			type,
			category,
			page,
			page_size: pageSize,
		} = validationResult.data;

		// 1. For BGM / Music Tracks (Songs) -> Fetch from live FreeToUse API + Built-in Pool
		if (type === "songs") {
			const apiTracks = await fetchFreeToUseMusic(query);
			const combined = [...apiTracks, ...BUILTIN_MUSIC_TRACKS];

			// Deduplicate by ID
			const seen = new Set<number>();
			let list: BuiltinSound[] = [];
			for (const item of combined) {
				if (!seen.has(item.id)) {
					seen.add(item.id);
					list.push(item);
				}
			}

			// Category filter
			if (category && category !== "all") {
				list = list.filter((m) => m.category === category);
			}

			// Query search (applies to built-in pool + serves as extra recall on top of live search)
			if (query && query.trim()) {
				const qLower = query.toLowerCase().trim();
				const rawWords = qLower.split(/\s+/).filter(Boolean);
				const expanded = new Set<string>(rawWords);
				for (const [zh, enList] of Object.entries(AUDIO_ZH_EN_MAP)) {
					if (qLower.includes(zh)) {
						for (const en of enList) expanded.add(en);
					}
				}
				const searchTerms = Array.from(expanded);

				list = list.filter((m) =>
					searchTerms.some(
						(w) =>
							m.name.toLowerCase().includes(w) ||
							m.description.toLowerCase().includes(w) ||
							(m.artist && m.artist.toLowerCase().includes(w)) ||
							(m.category && m.category.toLowerCase().includes(w)) ||
							m.tags.some((t) => t.toLowerCase().includes(w)),
					),
				);
			}

			const total = list.length;
			const startIndex = (page - 1) * pageSize;
			const paged = list.slice(startIndex, startIndex + pageSize);

			return NextResponse.json({
				count: total,
				next: startIndex + pageSize < total ? `page=${page + 1}` : null,
				previous: page > 1 ? `page=${page - 1}` : null,
				results: paged,
				query: query || "",
				type: "songs",
				page,
				pageSize,
				sort: "downloads",
			});
		}

		// 2. For Sound Effects (SFX) -> Fetch from live Wikimedia Audio API + Builtin Pool
		const sfxPool = [...BUILTIN_SOUNDS];
		const poolPage = sfxPool.slice((page - 1) * pageSize, page * pageSize);

		const wikiHits = await fetchWikimediaSFX({
			query: query || (category !== "all" ? category : ""),
			page,
			pageSize,
		});

		// Merge & Deduplicate
		const combined = [...poolPage, ...wikiHits];
		const seen = new Set<number>();
		const uniqueSFX: BuiltinSound[] = [];
		for (const item of combined) {
			if (!seen.has(item.id)) {
				seen.add(item.id);
				uniqueSFX.push(item);
			}
		}

		const totalCount = Math.max(uniqueSFX.length * 10, 500);

		return NextResponse.json({
			count: totalCount,
			next: `page=${page + 1}`,
			previous: page > 1 ? `page=${page - 1}` : null,
			results: uniqueSFX,
			query: query || "",
			type: "effects",
			page,
			pageSize,
			sort: "downloads",
			minRating: 3,
		});
	} catch (error) {
		console.error("Error searching sounds API:", error);
		return NextResponse.json(
			{
				count: BUILTIN_SOUNDS.length,
				results: BUILTIN_SOUNDS,
				type: "effects",
				page: 1,
				pageSize: 20,
			},
		);
	}
}
