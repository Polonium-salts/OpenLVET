import { buildStickerId, parseStickerId } from "../sticker-id";
import type {
	StickerBrowseResult,
	StickerItem,
	StickerProvider,
	StickerSearchResult,
} from "../types";

export interface BilibiliStickerItemDto {
	id: string;
	name: string;
	previewUrl: string;
	packageName: string;
	packageId: number;
	category: string;
	keywords: string[];
}

let clientCache: BilibiliStickerItemDto[] | null = null;
let clientFetchPromise: Promise<BilibiliStickerItemDto[]> | null = null;

async function getAllBilibiliStickers(): Promise<BilibiliStickerItemDto[]> {
	if (clientCache) return clientCache;
	if (clientFetchPromise) return clientFetchPromise;

	clientFetchPromise = (async () => {
		try {
			const res = await fetch("/api/stickers/bilibili?limit=500");
			const data = await res.json();
			clientCache = (data.items as BilibiliStickerItemDto[]) || [];
			return clientCache;
		} catch (e) {
			console.error("Failed to load Bilibili stickers:", e);
			return [];
		} finally {
			clientFetchPromise = null;
		}
	})();

	return clientFetchPromise;
}

function toStickerItem(providerId: string, item: BilibiliStickerItemDto): StickerItem {
	return {
		id: buildStickerId({
			providerId: "bilibili",
			providerValue: encodeURIComponent(item.previewUrl),
		}),
		provider: "bilibili",
		name: item.name,
		previewUrl: item.previewUrl,
		metadata: {
			category: item.category,
			packageName: item.packageName,
			packageId: item.packageId,
			keywords: item.keywords,
		},
	};
}

export function createBilibiliCategoryStickerProvider(
	categoryId: "trending" | "yellow_face" | "bili_girls" | "moe_pet" | "anime" | "meme",
): StickerProvider {
	return {
		id: categoryId,
		async search({
			query,
			options,
		}: {
			query: string;
			options?: { limit?: number };
		}): Promise<StickerSearchResult> {
			const normalizedQuery = query.trim().toLowerCase();
			const list = await getAllBilibiliStickers();

			let filtered = list;
			if (categoryId === "trending") {
				filtered = list.filter((s) => [1, 2, 5, 6, 9, 25, 53].includes(s.packageId));
			} else {
				filtered = list.filter((s) => s.category === categoryId);
			}

			if (normalizedQuery) {
				filtered = filtered.filter(
					(s) =>
						s.name.toLowerCase().includes(normalizedQuery) ||
						s.packageName.toLowerCase().includes(normalizedQuery) ||
						s.keywords.some((k) => k.toLowerCase().includes(normalizedQuery)),
				);
			}

			const limit = options?.limit ?? filtered.length;
			const paged = filtered.slice(0, limit);

			return {
				items: paged.map((s) => toStickerItem(categoryId, s)),
				total: filtered.length,
				hasMore: paged.length < filtered.length,
			};
		},
		async browse({
			options,
		}: {
			options?: { page?: number; limit?: number };
		}): Promise<StickerBrowseResult> {
			const list = await getAllBilibiliStickers();

			let filtered = list;
			if (categoryId === "trending") {
				filtered = list.filter((s) => [1, 2, 5, 6, 9, 25, 53].includes(s.packageId));
			} else {
				filtered = list.filter((s) => s.category === categoryId);
			}

			const limit = options?.limit ?? filtered.length;
			const paged = filtered.slice(0, limit);

			return {
				sections: [
					{
						id: categoryId,
						items: paged.map((s) => toStickerItem(categoryId, s)),
						hasMore: paged.length < filtered.length,
						layout: "grid",
					},
				],
			};
		},
		resolveUrl({ stickerId }: { stickerId: string }): string {
			const { providerValue } = parseStickerId({ stickerId });
			return decodeURIComponent(providerValue);
		},
	};
}

export const bilibiliTrendingProvider = createBilibiliCategoryStickerProvider("trending");
export const bilibiliYellowFaceProvider = createBilibiliCategoryStickerProvider("yellow_face");
export const bilibiliGirlsProvider = createBilibiliCategoryStickerProvider("bili_girls");
export const bilibiliMoePetProvider = createBilibiliCategoryStickerProvider("moe_pet");
export const bilibiliAnimeProvider = createBilibiliCategoryStickerProvider("anime");
export const bilibiliMemeProvider = createBilibiliCategoryStickerProvider("meme");

export const bilibiliBaseProvider: StickerProvider = {
	id: "bilibili",
	async search({ query, options }) {
		const normalizedQuery = query.trim().toLowerCase();
		const list = await getAllBilibiliStickers();
		const filtered = normalizedQuery
			? list.filter(
					(s) =>
						s.name.toLowerCase().includes(normalizedQuery) ||
						s.packageName.toLowerCase().includes(normalizedQuery) ||
						s.keywords.some((k) => k.toLowerCase().includes(normalizedQuery)),
				)
			: list;

		const limit = options?.limit ?? filtered.length;
		const paged = filtered.slice(0, limit);

		return {
			items: paged.map((s) => toStickerItem("bilibili", s)),
			total: filtered.length,
			hasMore: paged.length < filtered.length,
		};
	},
	async browse({ options }) {
		const list = await getAllBilibiliStickers();
		const limit = options?.limit ?? list.length;
		const paged = list.slice(0, limit);

		return {
			sections: [
				{
					id: "bilibili",
					items: paged.map((s) => toStickerItem("bilibili", s)),
					hasMore: paged.length < list.length,
					layout: "grid",
				},
			],
		};
	},
	resolveUrl({ stickerId }) {
		const { providerValue } = parseStickerId({ stickerId });
		return decodeURIComponent(providerValue);
	},
};
