import { unpackPluginZip, type UnpackedPluginResult } from "./zip-installer";
import type { PluginManifest } from "../types";

export interface GitRepoInfo {
	provider: "github" | "gitee" | "gitlab" | "generic";
	owner: string;
	repo: string;
	branch: string;
	rawBaseUrl: string;
	zipUrl: string;
}

export function parseGitUrl(inputUrl: string): GitRepoInfo | null {
	let cleanUrl = inputUrl.trim();
	if (!cleanUrl) return null;

	// Remove trailing .git and slashes
	cleanUrl = cleanUrl.replace(/\.git$/, "").replace(/\/$/, "");

	// GitHub match: https://github.com/owner/repo or github.com/owner/repo
	const githubRegex =
		/(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?/;
	const ghMatch = cleanUrl.match(githubRegex);
	if (ghMatch) {
		const owner = ghMatch[1];
		const repo = ghMatch[2];
		const branch = ghMatch[3] || "main";
		return {
			provider: "github",
			owner,
			repo,
			branch,
			rawBaseUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`,
			zipUrl: `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`,
		};
	}

	// Gitee match: https://gitee.com/owner/repo
	const giteeRegex =
		/(?:https?:\/\/)?(?:www\.)?gitee\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?/;
	const giteeMatch = cleanUrl.match(giteeRegex);
	if (giteeMatch) {
		const owner = giteeMatch[1];
		const repo = giteeMatch[2];
		const branch = giteeMatch[3] || "master";
		return {
			provider: "gitee",
			owner,
			repo,
			branch,
			rawBaseUrl: `https://gitee.com/${owner}/${repo}/raw/${branch}`,
			zipUrl: `https://gitee.com/${owner}/${repo}/repository/archive/${branch}.zip`,
		};
	}

	return null;
}

/**
 * Downloads and parses a plugin from a Git / GitHub / Gitee repository URL.
 */
export async function installPluginFromGit(
	gitUrl: string,
): Promise<UnpackedPluginResult> {
	const info = parseGitUrl(gitUrl);
	if (!info) {
		throw new Error(
			"无法识别的 Git 仓库格式。支持格式示例：https://github.com/username/plugin-repo",
		);
	}

	// First strategy: Try fetching raw plugin.json and index.js
	const candidateBranches = [info.branch, "main", "master"];
	let manifestData: PluginManifest | null = null;
	let sourceCode: string | null = null;
	let usedBranch = info.branch;

	for (const branch of Array.from(new Set(candidateBranches))) {
		const rawBase =
			info.provider === "github"
				? `https://raw.githubusercontent.com/${info.owner}/${info.repo}/${branch}`
				: `https://gitee.com/${info.owner}/${info.repo}/raw/${branch}`;

		try {
			// Try plugin.json, then manifest.json
			let manifestRes = await fetch(`${rawBase}/plugin.json`);
			if (!manifestRes.ok) {
				manifestRes = await fetch(`${rawBase}/manifest.json`);
			}

			if (manifestRes.ok) {
				const json = await manifestRes.json();
				manifestData = json;
				usedBranch = branch;

				// Try index.js, then main.js
				let codeRes = await fetch(`${rawBase}/index.js`);
				if (!codeRes.ok) {
					codeRes = await fetch(`${rawBase}/main.js`);
				}
				if (codeRes.ok) {
					sourceCode = await codeRes.text();
				}

				// Try README.md
				try {
					const readmeRes = await fetch(`${rawBase}/README.md`);
					if (readmeRes.ok && manifestData) {
						manifestData.readme = await readmeRes.text();
					}
				} catch {}

				break;
			}
		} catch {
			// Try next branch or fallback to zip download
		}
	}

	if (manifestData && sourceCode) {
		manifestData.gitUrl = gitUrl;
		manifestData.sourceCode = sourceCode;
		return {
			manifest: manifestData,
			sourceCode,
		};
	}

	// Second strategy: Download zip archive of repository and unpack
	try {
		const zipDownloadUrl =
			info.provider === "github"
				? `https://github.com/${info.owner}/${info.repo}/archive/refs/heads/${usedBranch}.zip`
				: `https://gitee.com/${info.owner}/${info.repo}/repository/archive/${usedBranch}.zip`;

		const res = await fetch(zipDownloadUrl);
		if (!res.ok) {
			throw new Error(`下载仓库压缩包失败: HTTP ${res.status}`);
		}
		const buffer = await res.arrayBuffer();
		const result = unpackPluginZip(buffer);
		result.manifest.gitUrl = gitUrl;
		return result;
	} catch (err) {
		throw new Error(
			`从 Git 仓库拉取插件失败: ${err instanceof Error ? err.message : "请检查仓库公开权限或网络连接"}`,
		);
	}
}
