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
			const resolved = stickersRegistry.get(parsedStickerId.providerId).resolveUrl({
				stickerId,
				options,
			});
			if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
				return `/api/stickers/proxy?url=${encodeURIComponent(resolved)}`;
			}
			return resolved;
		}
		if (parsedStickerId.providerId === "bilibili") {
			const raw = decodeURIComponent(parsedStickerId.providerValue);
			if (raw.startsWith("/api/stickers/proxy") || raw.startsWith("data:")) {
				return raw;
			}
			return `/api/stickers/proxy?url=${encodeURIComponent(raw)}`;
		}
	} catch {
		if (
			stickerId.startsWith("http://") ||
			stickerId.startsWith("https://")
		) {
			return `/api/stickers/proxy?url=${encodeURIComponent(stickerId)}`;
		}
		if (stickerId.startsWith("data:") || stickerId.startsWith("/")) {
			return stickerId;
		}
	}
	return "";
}
