import { buildStickerId, parseStickerId } from "../sticker-id";
import type {
	StickerBrowseResult,
	StickerItem,
	StickerProvider,
	StickerSearchResult,
} from "../types";
import {
	BUILTIN_STICKERS,
	getBuiltinStickerById,
	getBuiltinStickerDataUrl,
	getBuiltinStickersByCategory,
	type BuiltinStickerDef,
} from "./builtin-data";

function toStickerItem(
	providerId: string,
	sticker: BuiltinStickerDef,
): StickerItem {
	return {
		id: buildStickerId({
			providerId,
			providerValue: sticker.id,
		}),
		provider: providerId,
		name: sticker.name,
		previewUrl: getBuiltinStickerDataUrl(sticker),
		metadata: {
			category: sticker.category,
			keywords: sticker.keywords,
		},
	};
}

export function createCategoryStickerProvider(
	categoryId: "trending" | "variety" | "arrows" | "emojis" | "sparkles" | "vlog" | "cta",
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
			const list = getBuiltinStickersByCategory(categoryId);
			const filtered = normalizedQuery
				? list.filter(
						(s) =>
							s.name.toLowerCase().includes(normalizedQuery) ||
							s.keywords.some((k) => k.toLowerCase().includes(normalizedQuery)),
					)
				: list;

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
			const list = getBuiltinStickersByCategory(categoryId);
			const limit = options?.limit ?? list.length;
			const paged = list.slice(0, limit);

			return {
				sections: [
					{
						id: categoryId,
						items: paged.map((s) => toStickerItem(categoryId, s)),
						hasMore: paged.length < list.length,
						layout: "grid",
					},
				],
			};
		},
		resolveUrl({ stickerId }: { stickerId: string }): string {
			const { providerValue } = parseStickerId({ stickerId });
			const found = getBuiltinStickerById(providerValue);
			if (found) {
				return getBuiltinStickerDataUrl(found);
			}
			return "";
		},
	};
}

export const trendingStickersProvider = createCategoryStickerProvider("trending");
export const varietyStickersProvider = createCategoryStickerProvider("variety");
export const arrowsStickersProvider = createCategoryStickerProvider("arrows");
export const emojisStickersProvider = createCategoryStickerProvider("emojis");
export const sparklesStickersProvider = createCategoryStickerProvider("sparkles");
export const vlogStickersProvider = createCategoryStickerProvider("vlog");
export const ctaStickersProvider = createCategoryStickerProvider("cta");
