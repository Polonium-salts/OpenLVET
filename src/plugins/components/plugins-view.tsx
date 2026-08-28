"use client";

import { useState, useRef } from "react";
import { usePluginStore } from "../plugin-store";
import { pluginManager } from "../plugin-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	PuzzleIcon,
	Download01Icon,
	CodeIcon,
	Settings01Icon,
	Delete02Icon,
	Folder03Icon,
	FlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

export function PluginsView() {
	const [activeSubTab, setActiveSubTab] = useState<"installed" | "install">(
		"installed",
	);

	const installedPlugins = usePluginStore((s) => s.installedPlugins);
	const openPluginSettings = usePluginStore((s) => s.openPluginSettings);

	// Installer states
	const [gitUrlInput, setGitUrlInput] = useState("");
	const [isGitInstalling, setIsGitInstalling] = useState(false);
	const [urlInput, setUrlInput] = useState("");
	const [isUrlInstalling, setIsUrlInstalling] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleTogglePlugin = async (id: string) => {
		try {
			await pluginManager.togglePlugin(id);
		} catch (err) {
			toast.error("切换插件状态失败", {
				description: err instanceof Error ? err.message : String(err),
			});
		}
	};

	const handleUninstall = async (id: string) => {
		try {
			await pluginManager.uninstallPlugin(id);
		} catch (err) {
			toast.error("卸载失败", {
				description: err instanceof Error ? err.message : String(err),
			});
		}
	};

	const handleExportZip = (id: string, name: string) => {
		try {
			const zipBytes = pluginManager.exportPluginZip(id);
			const blob = new Blob([zipBytes as unknown as BlobPart], {
				type: "application/zip",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${id}-plugin.zip`;
			a.click();
			URL.revokeObjectURL(url);
			toast.success(`已成功导出插件压缩包: ${name}`);
		} catch (err) {
			toast.error("导出 ZIP 失败", {
				description: err instanceof Error ? err.message : String(err),
			});
		}
	};

	const handleZipFileUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const buffer = await file.arrayBuffer();
			await pluginManager.installFromZip(buffer);
			setActiveSubTab("installed");
		} catch (err) {
			toast.error("安装 ZIP 插件失败", {
				description: err instanceof Error ? err.message : "请检查文件格式",
			});
		} finally {
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const handleGitInstall = async () => {
		if (!gitUrlInput.trim()) {
			toast.info("请输入 Git / GitHub 仓库地址");
			return;
		}

		setIsGitInstalling(true);
		try {
			await pluginManager.installFromGit(gitUrlInput.trim());
			setGitUrlInput("");
			setActiveSubTab("installed");
		} catch (err) {
			toast.error("Git 安装失败", {
				description: err instanceof Error ? err.message : "请检查网络或仓库地址",
			});
		} finally {
			setIsGitInstalling(false);
		}
	};

	const handleUrlInstall = async () => {
		if (!urlInput.trim()) {
			toast.info("请输入插件脚本 URL");
			return;
		}

		setIsUrlInstalling(true);
		try {
			await pluginManager.installFromUrl(urlInput.trim());
			setUrlInput("");
			setActiveSubTab("installed");
		} catch (err) {
			toast.error("URL 安装失败", {
				description: err instanceof Error ? err.message : "请检查链接有效性",
			});
		} finally {
			setIsUrlInstalling(false);
		}
	};

	const installedList = Object.values(installedPlugins);

	return (
		<div className="flex size-full flex-col bg-background select-none overflow-hidden">
			{/* Top Header Section */}
			<div className="p-3 border-b border-border/40 space-y-2.5">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
							<HugeiconsIcon icon={PuzzleIcon} className="size-3.5" />
						</div>
						<h3 className="text-sm font-semibold text-foreground">
							模块化插件中心
						</h3>
					</div>

					<span className="text-[11px] text-muted-foreground font-mono">
						已启用 {installedList.filter((p) => p.enabled).length} 个
					</span>
				</div>

				{/* Sub Tabs Pill Navigation */}
				<div className="grid grid-cols-2 gap-1 p-1 bg-muted/40 rounded-lg border border-border/30 text-xs">
					<button
						type="button"
						onClick={() => setActiveSubTab("installed")}
						className={`py-1 rounded-md font-medium transition-all text-center truncate flex items-center justify-center gap-1 ${
							activeSubTab === "installed"
								? "bg-background text-foreground shadow-xs font-semibold"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<span>已安装</span>
						<span className="px-1 text-[10px] rounded-full bg-primary/15 text-primary font-mono">
							{installedList.length}
						</span>
					</button>
					<button
						type="button"
						onClick={() => setActiveSubTab("install")}
						className={`py-1 rounded-md font-medium transition-all text-center truncate flex items-center justify-center gap-1 ${
							activeSubTab === "install"
								? "bg-background text-foreground shadow-xs font-semibold"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<HugeiconsIcon icon={Download01Icon} className="size-3" />
						<span>安装扩展</span>
					</button>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 overflow-y-auto p-3 space-y-3">
				{/* 1. Installed Plugins */}
				{activeSubTab === "installed" && (
					<div className="space-y-2">
						{installedList.length === 0 ? (
							<div className="py-12 text-center text-xs text-muted-foreground">
								暂无已安装插件，可通过安装扩展添加。
							</div>
						) : (
							installedList.map((record) => {
								const { manifest, enabled, sourceType } = record;

								const sourceBadge = {
									builtin: { label: "官方", color: "bg-blue-500/10 text-blue-500" },
									zip: { label: "ZIP", color: "bg-emerald-500/10 text-emerald-500" },
									git: { label: "Git", color: "bg-purple-500/10 text-purple-500" },
									url: { label: "URL", color: "bg-amber-500/10 text-amber-500" },
									code: { label: "代码", color: "bg-cyan-500/10 text-cyan-500" },
									file: { label: "本地", color: "bg-zinc-500/10 text-zinc-500" },
								}[sourceType] || { label: "扩展", color: "bg-muted text-muted-foreground" };

								return (
									<div
										key={manifest.id}
										className="p-3 rounded-lg border bg-card hover:border-border transition-all space-y-2"
									>
										<div className="flex items-start justify-between">
											<div className="space-y-0.5">
												<div className="flex items-center gap-1.5">
													<h4 className="text-xs font-semibold text-foreground">
														{manifest.name}
													</h4>
													<span
														className={`text-[9px] px-1 py-0.2 rounded font-medium ${sourceBadge.color}`}
													>
														{sourceBadge.label}
													</span>
												</div>
												<p className="text-[11px] text-muted-foreground line-clamp-1">
													{manifest.description}
												</p>
											</div>
										</div>

										<div className="pt-2 border-t border-border/30 flex items-center justify-between">
											<div className="flex items-center gap-1">
												{manifest.configSchema && manifest.configSchema.length > 0 && (
													<Button
														variant="ghost"
														size="icon"
														onClick={() => openPluginSettings(manifest.id)}
														className="size-6 text-muted-foreground hover:text-foreground"
														title="配置参数"
													>
														<HugeiconsIcon icon={Settings01Icon} className="size-3.5" />
													</Button>
												)}

												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleExportZip(manifest.id, manifest.name)}
													className="size-6 text-muted-foreground hover:text-foreground"
													title="导出为 .zip 插件包"
												>
													<HugeiconsIcon icon={Download01Icon} className="size-3.5" />
												</Button>

												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleUninstall(manifest.id)}
													className="size-6 text-muted-foreground hover:text-destructive"
													title="卸载插件"
												>
													<HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
												</Button>
											</div>

											<Button
												size="sm"
												variant={enabled ? "outline" : "default"}
												onClick={() => handleTogglePlugin(manifest.id)}
												className="text-xs h-6 px-2.5"
											>
												{enabled ? "禁用" : "启用"}
											</Button>
										</div>
									</div>
								);
							})
						)}
					</div>
				)}

				{/* 2. Install Extensions */}
				{activeSubTab === "install" && (
					<div className="space-y-3.5">
						{/* ZIP Upload Dropzone */}
						<div className="p-3 rounded-lg border bg-card space-y-2">
							<div className="flex items-center gap-1.5">
								<HugeiconsIcon icon={Folder03Icon} className="size-3.5 text-emerald-500" />
								<h4 className="text-xs font-bold text-foreground">
									上传 ZIP 插件包
								</h4>
							</div>
							<p className="text-[11px] text-muted-foreground">
								包含 <code>plugin.json</code> 和主入口 <code>index.js</code> 的标准插件包。
							</p>

							<div
								onClick={() => fileInputRef.current?.click()}
								className="border border-dashed border-border/80 hover:border-emerald-500/60 rounded-md p-4 text-center cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all"
							>
								<HugeiconsIcon
									icon={Download01Icon}
									className="size-6 mx-auto text-muted-foreground mb-1"
								/>
								<p className="text-xs font-semibold text-foreground">
									点击上传或拖拽 .zip 文件
								</p>
								<input
									ref={fileInputRef}
									type="file"
									accept=".zip"
									onChange={handleZipFileUpload}
									className="hidden"
								/>
							</div>
						</div>

						{/* Git / GitHub Installer */}
						<div className="p-3 rounded-lg border bg-card space-y-2">
							<div className="flex items-center gap-1.5">
								<HugeiconsIcon icon={CodeIcon} className="size-3.5 text-purple-500" />
								<h4 className="text-xs font-bold text-foreground">
									Git / GitHub 仓库安装
								</h4>
							</div>
							<p className="text-[11px] text-muted-foreground">
								输入 GitHub 或 Gitee 仓库地址一键安装。
							</p>

							<div className="flex flex-col gap-1.5">
								<Input
									type="text"
									placeholder="https://github.com/user/plugin"
									value={gitUrlInput}
									onChange={(e) => setGitUrlInput(e.target.value)}
									className="h-7 text-xs font-mono"
								/>
								<Button
									onClick={handleGitInstall}
									disabled={isGitInstalling}
									className="text-xs h-7 w-full"
								>
									{isGitInstalling ? "拉取中..." : "从 Git 仓库拉取安装"}
								</Button>
							</div>
						</div>

						{/* URL Script Installer */}
						<div className="p-3 rounded-lg border bg-card space-y-2">
							<div className="flex items-center gap-1.5">
								<HugeiconsIcon icon={FlashIcon} className="size-3.5 text-amber-500" />
								<h4 className="text-xs font-bold text-foreground">
									URL 脚本链接安装
								</h4>
							</div>
							<div className="flex flex-col gap-1.5">
								<Input
									type="text"
									placeholder="https://cdn.example.com/plugin.js"
									value={urlInput}
									onChange={(e) => setUrlInput(e.target.value)}
									className="h-7 text-xs font-mono"
								/>
								<Button
									variant="outline"
									onClick={handleUrlInstall}
									disabled={isUrlInstalling}
									className="text-xs h-7 w-full"
								>
									{isUrlInstalling ? "下载中..." : "安装脚本链接"}
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
