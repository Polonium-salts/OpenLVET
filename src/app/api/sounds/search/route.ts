import { webEnv } from "@/env/web";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BUILTIN_SOUNDS, BUILTIN_MUSIC_TRACKS } from "@/sounds/sounds-data";

const searchParamsSchema = z.object({
	q: z.string().max(500, "Query too long").optional(),
	type: z.enum(["songs", "effects"]).default("effects"),
	page: z.coerce.number().int().min(1).max(1000).default(1),
	page_size: z.coerce.number().int().min(1).max(150).default(20),
	sort: z
		.enum(["downloads", "rating", "created", "score"])
		.default("downloads"),
	min_rating: z.coerce.number().min(0).max(5).default(3),
	commercial_only: z.coerce.boolean().default(true),
});

const freesoundResultSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string(),
	url: z.string().url(),
	previews: z
		.object({
			"preview-hq-mp3": z.string().url(),
			"preview-lq-mp3": z.string().url(),
			"preview-hq-ogg": z.string().url(),
			"preview-lq-ogg": z.string().url(),
		})
		.optional(),
	download: z.string().url().optional(),
	duration: z.number(),
	filesize: z.number(),
	type: z.string(),
	channels: z.number(),
	bitrate: z.number(),
	bitdepth: z.number(),
	samplerate: z.number(),
	username: z.string(),
	tags: z.array(z.string()),
	license: z.string(),
	created: z.string(),
	num_downloads: z.number().optional(),
	avg_rating: z.number().optional(),
	num_ratings: z.number().optional(),
});

const freesoundResponseSchema = z.object({
	count: z.number(),
	next: z.string().url().nullable(),
	previous: z.string().url().nullable(),
	results: z.array(freesoundResultSchema),
});

function transformFreesoundResult(
	result: z.infer<typeof freesoundResultSchema>,
) {
	return {
		id: result.id,
		name: result.name,
		description: result.description,
		url: result.url,
		previewUrl:
			result.previews?.["preview-hq-mp3"] ||
			result.previews?.["preview-lq-mp3"],
		downloadUrl: result.download,
		duration: result.duration,
		filesize: result.filesize,
		type: result.type,
		channels: result.channels,
		bitrate: result.bitrate,
		bitdepth: result.bitdepth,
		samplerate: result.samplerate,
		username: result.username,
		tags: result.tags,
		license: result.license,
		created: result.created,
		downloads: result.num_downloads || 0,
		rating: result.avg_rating || 0,
		ratingCount: result.num_ratings || 0,
	};
}

function searchBuiltinAudio({
	query,
	type,
	page,
	pageSize,
}: {
	query?: string;
	type: "effects" | "songs";
	page: number;
	pageSize: number;
}) {
	const rawList = type === "songs" ? BUILTIN_MUSIC_TRACKS : BUILTIN_SOUNDS;
	let results = [...rawList];

	if (query && query.trim()) {
		const qLower = query.toLowerCase().trim();
		const qWords = qLower.split(/\s+/).filter(Boolean);
		results = results.filter((sound) =>
			qWords.some(
				(w) =>
					sound.name.toLowerCase().includes(w) ||
					sound.description.toLowerCase().includes(w) ||
					(sound.artist && sound.artist.toLowerCase().includes(w)) ||
					(sound.category && sound.category.toLowerCase().includes(w)) ||
					sound.tags.some((t) => t.toLowerCase().includes(w)),
			),
		);
	}

	const total = results.length;
	const startIndex = (page - 1) * pageSize;
	const paged = results.slice(startIndex, startIndex + pageSize);

	return {
		count: total,
		next: startIndex + pageSize < total ? `page=${page + 1}` : null,
		previous: page > 1 ? `page=${page - 1}` : null,
		results: paged,
		query: query || "",
		type,
		page,
		pageSize,
		sort: "downloads",
		minRating: 3,
	};
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		const validationResult = searchParamsSchema.safeParse({
			q: searchParams.get("q") || undefined,
			type: searchParams.get("type") || undefined,
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
			page,
			page_size: pageSize,
		} = validationResult.data;

		// 1. For music / songs, return rich built-in music catalog
		if (type === "songs") {
			return NextResponse.json(
				searchBuiltinAudio({ query, type: "songs", page, pageSize }),
			);
		}

		// 2. For sound effects, if Freesound key is present, try Freesound
		const freesoundKey = webEnv.FREESOUND_API_KEY?.trim();
		const hasValidFreesoundKey =
			freesoundKey &&
			freesoundKey.length > 20 &&
			!freesoundKey.includes("test");

		if (hasValidFreesoundKey) {
			try {
				const baseUrl = "https://freesound.org/apiv2/search/text/";
				const params = new URLSearchParams({
					query: query || "",
					token: freesoundKey,
					page: page.toString(),
					page_size: pageSize.toString(),
					fields:
						"id,name,description,url,previews,download,duration,filesize,type,channels,bitrate,bitdepth,samplerate,username,tags,license,created,num_downloads,avg_rating,num_ratings",
				});

				const response = await fetch(`${baseUrl}?${params.toString()}`, {
					signal: AbortSignal.timeout(600),
				});

				if (response.ok) {
					const rawData = await response.json();
					const freesoundValidation =
						freesoundResponseSchema.safeParse(rawData);
					if (freesoundValidation.success) {
						const data = freesoundValidation.data;
						return NextResponse.json({
							count: data.count,
							next: data.next,
							previous: data.previous,
							results: data.results.map(transformFreesoundResult),
							query: query || "",
							type: "effects",
							page,
							pageSize,
							sort: "downloads",
							minRating: 3,
						});
					}
				}
			} catch (e) {
				console.warn("Freesound API failed, using instant built-in sounds");
			}
		}

		// Return instant built-in sound effects
		return NextResponse.json(
			searchBuiltinAudio({ query, type: "effects", page, pageSize }),
		);
	} catch (error) {
		console.error("Error searching sounds:", error);
		return NextResponse.json(
			searchBuiltinAudio({ type: "effects", page: 1, pageSize: 20 }),
		);
	}
}
