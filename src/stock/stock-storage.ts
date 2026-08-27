import { IndexedDBAdapter } from "@/services/storage/indexeddb-adapter";
import { OPFSAdapter } from "@/services/storage/opfs-adapter";
import type { StockItem, StockMetadata } from "./types";

class StockStorageService {
	private metadataAdapter: IndexedDBAdapter<StockMetadata>;
	private filesAdapter: OPFSAdapter;
	private fallbackFilesAdapter: IndexedDBAdapter<{ file: File }>;
	private isOPFSSupported: boolean;

	constructor() {
		this.metadataAdapter = new IndexedDBAdapter<StockMetadata>({
			dbName: "video-editor-stock-metadata",
			storeName: "stock-metadata",
			version: 1,
		});

		this.isOPFSSupported = OPFSAdapter.isSupported();
		this.filesAdapter = new OPFSAdapter("stock-files");
		this.fallbackFilesAdapter = new IndexedDBAdapter<{ file: File }>({
			dbName: "video-editor-stock-files-fallback",
			storeName: "stock-files",
			version: 1,
		});
	}

	async saveFile({ id, file }: { id: string; file: File }): Promise<void> {
		if (this.isOPFSSupported) {
			try {
				await this.filesAdapter.set({ key: id, value: file });
				return;
			} catch (err) {
				console.warn("OPFS write failed, falling back to IndexedDB for stock file:", err);
			}
		}
		await this.fallbackFilesAdapter.set({
			key: id,
			value: { file },
		});
	}

	async loadFile({ id }: { id: string }): Promise<File | null> {
		if (this.isOPFSSupported) {
			try {
				const file = await this.filesAdapter.get(id);
				if (file) return file;
			} catch {
				// Fallback to IndexedDB
			}
		}
		const fallback = await this.fallbackFilesAdapter.get(id);
		return fallback?.file ?? null;
	}

	async removeFile({ id }: { id: string }): Promise<void> {
		if (this.isOPFSSupported) {
			try {
				await this.filesAdapter.remove(id);
			} catch {
				// Ignore
			}
		}
		try {
			await this.fallbackFilesAdapter.remove(id);
		} catch {
			// Ignore
		}
	}

	async saveStockItem(item: StockItem): Promise<void> {
		const metadata: StockMetadata = {
			id: item.id,
			name: item.name,
			type: item.type,
			tags: item.tags,
			thumbnailUrl: item.thumbnailUrl,
			duration: item.duration,
			width: item.width,
			height: item.height,
			fps: item.fps,
			hasAudio: item.hasAudio,
			size: item.size,
			isFavorite: item.isFavorite,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
		};

		await Promise.all([
			this.saveFile({ id: item.id, file: item.file }),
			this.metadataAdapter.set({ key: item.id, value: metadata }),
		]);
	}

	async loadStockItem(id: string): Promise<StockItem | null> {
		const [metadata, file] = await Promise.all([
			this.metadataAdapter.get(id),
			this.loadFile({ id }),
		]);

		if (!metadata || !file) return null;

		let url: string;
		if (metadata.type === "image" && (!file.type || file.type === "")) {
			try {
				const text = await file.text();
				if (text.trim().startsWith("<svg")) {
					const svgBlob = new Blob([text], { type: "image/svg+xml" });
					url = URL.createObjectURL(svgBlob);
				} else {
					url = URL.createObjectURL(file);
				}
			} catch {
				url = URL.createObjectURL(file);
			}
		} else {
			url = URL.createObjectURL(file);
		}

		return {
			...metadata,
			file,
			url,
		};
	}

	async loadAllStockItems(): Promise<StockItem[]> {
		const allMetadata = await this.metadataAdapter.getAll();
		const items: StockItem[] = [];

		for (const metadata of allMetadata) {
			if (!metadata?.id) continue;
			const item = await this.loadStockItem(metadata.id);
			if (item) {
				items.push(item);
			}
		}

		return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}

	async deleteStockItem(id: string): Promise<void> {
		await Promise.all([
			this.removeFile({ id }),
			this.metadataAdapter.remove(id),
		]);
	}

	async updateStockMetadata(id: string, updates: Partial<StockMetadata>): Promise<void> {
		const existing = await this.metadataAdapter.get(id);
		if (!existing) return;

		const updated: StockMetadata = {
			...existing,
			...updates,
			updatedAt: new Date().toISOString(),
		};

		await this.metadataAdapter.set({ key: id, value: updated });
	}
}

export const stockStorage = new StockStorageService();
