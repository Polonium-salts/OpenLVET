import { stickersRegistry } from "../registry";
import type { StickerProvider } from "@/stickers/types";
import { logosProvider } from "./logos";
import { shapesProvider } from "./shapes";
import {
	bilibiliBaseProvider,
	bilibiliTrendingProvider,
	bilibiliYellowFaceProvider,
	bilibiliGirlsProvider,
	bilibiliMoePetProvider,
	bilibiliGameProvider,
	bilibiliVupProvider,
	bilibiliAnimeProvider,
	bilibiliMemeProvider,
} from "./bilibili";

const defaultProviders: StickerProvider[] = [
	bilibiliBaseProvider,
	bilibiliTrendingProvider,
	bilibiliYellowFaceProvider,
	bilibiliGirlsProvider,
	bilibiliMoePetProvider,
	bilibiliGameProvider,
	bilibiliVupProvider,
	bilibiliAnimeProvider,
	bilibiliMemeProvider,
	shapesProvider,
	logosProvider,
];

export function registerDefaultStickerProviders({
	providersToRegister = defaultProviders,
}: {
	providersToRegister?: StickerProvider[];
} = {}): void {
	for (const provider of providersToRegister) {
		if (stickersRegistry.has(provider.id)) {
			continue;
		}
		stickersRegistry.register({
			key: provider.id,
			definition: provider,
		});
	}
}
