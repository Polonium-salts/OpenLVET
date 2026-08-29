import { unzipSync, zipSync, strFromU8, strToU8 } from "fflate";
import type { InstalledPluginRecord, PluginManifest } from "../types";

export interface UnpackedPluginResult {
	manifest: PluginManifest;
	sourceCode: string;
	extraFiles?: Record<string, string>;
}

/**
 * Unpacks a plugin .zip archive and extracts the manifest and entry script.
 */
export function unpackPluginZip(
	zipData: Uint8Array | ArrayBuffer,
): UnpackedPluginResult {
	const u8Data = zipData instanceof Uint8Array ? zipData : new Uint8Array(zipData);
	const unzipped = unzipSync(u8Data);

	const fileNames = Object.keys(unzipped);
	if (fileNames.length === 0) {
		throw new Error("ZIP 压缩包为空");
	}

	// Look for plugin.json or manifest.json (either at root or inside top-level folder)
	const manifestEntry = fileNames.find(
		(name) =>
			name.endsWith("plugin.json") ||
			name.endsWith("manifest.json") ||
			name.endsWith("package.json"),
	);

	if (!manifestEntry) {
		throw new Error("未在压缩包中找到 plugin.json 或 manifest.json 插件配置文件");
	}

	const manifestContent = strFromU8(unzipped[manifestEntry]);
	let manifest: PluginManifest;
	try {
		manifest = JSON.parse(manifestContent);
	} catch {
		throw new Error("插件配置文件格式错误，无法解析为有效 JSON");
	}

	if (!manifest.id || !manifest.name) {
		throw new Error("插件配置缺少必要的 'id' 或 'name' 字段");
	}

	// Base path prefix where manifest was found
	const basePath = manifestEntry.includes("/")
		? manifestEntry.slice(0, manifestEntry.lastIndexOf("/") + 1)
		: "";

	// Look for entry JS file: index.js, main.js, plugin.js, or specified in manifest
	const potentialEntries = [
		manifest.sourceCode ? basePath + manifest.sourceCode : null,
		basePath + "index.js",
		basePath + "main.js",
		basePath + "plugin.js",
		basePath + "dist/index.js",
	].filter(Boolean) as string[];

	let entryFileName = potentialEntries.find((name) => unzipped[name]);

	// If no standard name found, look for any .js file in the same directory
	if (!entryFileName) {
		entryFileName = fileNames.find(
			(name) => name.startsWith(basePath) && name.endsWith(".js"),
		);
	}

	let sourceCode = "";
	if (entryFileName && unzipped[entryFileName]) {
		sourceCode = strFromU8(unzipped[entryFileName]);
	} else if (manifest.sourceCode) {
		sourceCode = manifest.sourceCode;
	} else {
		throw new Error("未在压缩包中找到插件主入口脚本 (如 index.js 或 main.js)");
	}

	// Gather extra text files & extract README if present
	const extraFiles: Record<string, string> = {};
	let readmeContent: string | undefined;

	for (const name of fileNames) {
		if (
			!name.endsWith("/") &&
			name !== manifestEntry &&
			name !== entryFileName
		) {
			try {
				const content = strFromU8(unzipped[name]);
				extraFiles[name] = content;
				const lower = name.toLowerCase();
				if (
					!readmeContent &&
					(lower.endsWith("readme.md") ||
						lower.endsWith("readme.markdown") ||
						lower.endsWith("readme.txt") ||
						lower.endsWith("doc.md") ||
						lower.endsWith("docs.md"))
				) {
					readmeContent = content;
				}
			} catch {
				// Binary or unreadable
			}
		}
	}

	manifest.sourceCode = sourceCode;
	if (readmeContent && !manifest.readme) {
		manifest.readme = readmeContent;
	}

	return {
		manifest,
		sourceCode,
		extraFiles,
	};
}

/**
 * Creates a downloadable .zip Uint8Array archive from plugin manifest and code.
 */
export function packPluginToZip(
	manifest: PluginManifest,
	sourceCode: string,
): Uint8Array {
	const manifestToSave = { ...manifest };
	delete manifestToSave.sourceCode;

	const files: Record<string, Uint8Array> = {
		"plugin.json": strToU8(JSON.stringify(manifestToSave, null, 2)),
		"index.js": strToU8(sourceCode),
		"README.md": strToU8(
			`# ${manifest.name} (v${manifest.version})\n\n${manifest.description}\n\n**Author:** ${manifest.author}\n`,
		),
	};

	return zipSync(files);
}
