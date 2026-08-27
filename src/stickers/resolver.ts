import { stickersRegistry } from "./registry";
import { parseStickerId } from "./sticker-id";
import { registerDefaultStickerProviders } from "./providers";
import type { StickerResolveOptions } from "@/stickers/types";

export function resolveStickerId({
	stickerId,
	options,
}: {
	stickerId: string;
	options?: StickerResolveOptions;
}): string {
	registerDefaultStickerProviders();

	try {
		const parsedStickerId = parseStickerId({ stickerId });
		if (stickersRegistry.has(parsedStickerId.providerId)) {
			return stickersRegistry.get(parsedStickerId.providerId).resolveUrl({
				stickerId,
				options,
			});
		}
		if (parsedStickerId.providerId === "bilibili") {
			return decodeURIComponent(parsedStickerId.providerValue);
		}
	} catch {
		if (
			stickerId.startsWith("http://") ||
			stickerId.startsWith("https://") ||
			stickerId.startsWith("data:")
		) {
			return stickerId;
		}
	}
	return "";
}
