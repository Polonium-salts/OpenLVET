"use client";

import { useState, useRef } from "react";
import { usePluginStore } from "../plugin-store";
import { pluginManager } from "../plugin-manager";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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

export function PluginCenterDialog() {
	const isPluginCenterOpen = usePluginStore((s) => s.isPluginCenterOpen);
	const pluginCenterTab = usePluginStore((s) => s.pluginCenterTab);
	const openPluginCenter = usePluginStore((s) => s.openPluginCenter);
	const closePluginCenter = usePluginStore((s) => s.closePluginCenter);
	const openPluginSettings = usePluginStore((s) => s.openPluginSettings);
	const installedPlugins = usePluginStore((s) => s.installedPlugins);

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
			openPluginCenter("installed");
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
			openPluginCenter("installed");
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
			openPluginCenter("installed");
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
		<Dialog
			open={isPluginCenterOpen}
			onOpenChange={(open) => {
				if (!open) closePluginCenter();
			}}
		>
			<DialogContent className="sm:max-w-[760px] h-[85vh] max-h-[700px] flex flex-col p-0 overflow-hidden select-none">
				{/* Dialog Header */}
				<div className="flex items-center justify-between border-b px-6 py-4 bg-muted/20">
					<div className="flex items-center gap-2.5">
						<div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
							<HugeiconsIcon icon={PuzzleIcon} className="size-4" />
						</div>
						<div>
							<DialogTitle className="text-base font-bold text-foreground">
								OpenLVET 模块化插件中心
							</DialogTitle>
							<DialogDescription className="text-xs text-muted-foreground">
								扩展全局功能、滤镜调色、画幅 HUD、快捷操作与自动化工作流
							</DialogDescription>
						</div>
					</div>

					{/* Navigation Tabs */}
					<div className="flex items-center bg-muted/60 p-1 rounded-lg border text-xs">
						<button
							type="button"
							onClick={() => openPluginCenter("installed")}
							className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
								pluginCenterTab === "installed"
									? "bg-background text-foreground shadow-xs font-semibold"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							<span>已安装</span>
							<span className="px-1.5 py-0.2 rounded-full bg-primary/15 text-primary text-[10px] font-mono">
								{installedList.length}
							</span>
						</button>
						<button
							type="button"
							onClick={() => openPluginCenter("install")}
							className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
								pluginCenterTab === "install"
									? "bg-background text-foreground shadow-xs font-semibold"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							<HugeiconsIcon icon={Download01Icon} className="size-3.5" />
							<span>安装扩展</span>
						</button>
					</div>
				</div>

				{/* Tab 1: Installed Plugins */}
				{pluginCenterTab === "installed" && (
					<div className="flex-1 overflow-y-auto p-6 space-y-3">
						{installedList.length === 0 ? (
							<div className="py-16 text-center text-xs text-muted-foreground">
								暂无已安装插件，可通过安装扩展添加。
							</div>
						) : (
							installedList.map((record) => {
								const { manifest, enabled, sourceType } = record;

								const sourceBadge = {
									builtin: { label: "官方内置", color: "bg-blue-500/10 text-blue-500" },
									zip: { label: "ZIP 导入", color: "bg-emerald-500/10 text-emerald-500" },
									git: { label: "Git 仓库", color: "bg-purple-500/10 text-purple-500" },
									url: { label: "URL 链接", color: "bg-amber-500/10 text-amber-500" },
									code: { label: "代码开发", color: "bg-cyan-500/10 text-cyan-500" },
									file: { label: "本地文件", color: "bg-zinc-500/10 text-zinc-500" },
								}[sourceType] || { label: "扩展", color: "bg-muted text-muted-foreground" };

								return (
									<div
										key={manifest.id}
										className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-border transition-all"
									>
										<div className="flex items-center gap-3.5">
											<div
												className={`size-10 rounded-lg flex items-center justify-center border ${
													enabled
														? "bg-primary/10 border-primary/20 text-primary"
														: "bg-muted/40 border-border text-muted-foreground"
												}`}
											>
												<HugeiconsIcon icon={PuzzleIcon} className="size-5" />
											</div>

											<div className="space-y-0.5">
												<div className="flex items-center gap-2">
													<h4 className="text-sm font-semibold text-foreground">
														{manifest.name}
													</h4>
													<span
														className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${sourceBadge.color}`}
													>
														{sourceBadge.label}
													</span>
													<span className="text-[11px] font-mono text-muted-foreground">
														v{manifest.version}
													</span>
												</div>
												<p className="text-xs text-muted-foreground line-clamp-1 max-w-[420px]">
													{manifest.description}
												</p>
											</div>
										</div>

										<div className="flex items-center gap-2">
											{manifest.configSchema && manifest.configSchema.length > 0 && (
												<Button
													variant="ghost"
													size="icon"
													onClick={() => openPluginSettings(manifest.id)}
													className="size-8 text-muted-foreground hover:text-foreground"
													title="设置参数"
												>
													<HugeiconsIcon icon={Settings01Icon} className="size-4" />
												</Button>
											)}

											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleExportZip(manifest.id, manifest.name)}
												className="size-8 text-muted-foreground hover:text-foreground"
												title="导出为 .zip 插件包"
											>
												<HugeiconsIcon icon={Download01Icon} className="size-4" />
											</Button>

											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleUninstall(manifest.id)}
												className="size-8 text-muted-foreground hover:text-destructive"
												title="卸载插件"
											>
												<HugeiconsIcon icon={Delete02Icon} className="size-4" />
											</Button>

											<Button
												size="sm"
												variant={enabled ? "outline" : "default"}
												onClick={() => handleTogglePlugin(manifest.id)}
												className="text-xs h-8 px-3 ml-1"
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

				{/* Tab 2: Install from ZIP / Git / URL */}
				{pluginCenterTab === "install" && (
					<div className="flex-1 overflow-y-auto p-6 space-y-6">
						{/* Method 1: ZIP Upload */}
						<div className="p-4 rounded-xl border bg-card space-y-3">
							<div className="flex items-center gap-2">
								<div className="size-6 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
									<HugeiconsIcon icon={Folder03Icon} className="size-3.5" />
								</div>
								<h4 className="text-sm font-bold text-foreground">
									方法一：上传 ZIP 插件压缩包
								</h4>
							</div>
							<p className="text-xs text-muted-foreground">
								支持上传包含 <code>plugin.json</code> 和主入口 <code>index.js</code> 的标准 <code>.zip</code> 插件包。浏览器将即时在内存中解压并安装。
							</p>

							<div
								onClick={() => fileInputRef.current?.click()}
								className="border-2 border-dashed border-border/80 hover:border-emerald-500/60 rounded-lg p-6 text-center cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all"
							>
								<HugeiconsIcon
									icon={Download01Icon}
									className="size-8 mx-auto text-muted-foreground mb-2"
								/>
								<p className="text-xs font-semibold text-foreground">
									点击选择文件 或 将 .zip 插件包拖拽至此处
								</p>
								<p className="text-[11px] text-muted-foreground mt-1">
									支持标准 OpenLVET / OpenCut 模块化插件包
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

						{/* Method 2: Git / GitHub URL */}
						<div className="p-4 rounded-xl border bg-card space-y-3">
							<div className="flex items-center gap-2">
								<div className="size-6 rounded bg-purple-500/10 text-purple-500 flex items-center justify-center">
									<HugeiconsIcon icon={CodeIcon} className="size-3.5" />
								</div>
								<h4 className="text-sm font-bold text-foreground">
									方法二：通过 Git / GitHub 仓库安装
								</h4>
							</div>
							<p className="text-xs text-muted-foreground">
								输入开源插件的 GitHub 或 Gitee 仓库地址，系统将自动抓取 <code>plugin.json</code> 与源码并安装。
							</p>

							<div className="flex items-center gap-2">
								<Input
									type="text"
									placeholder="https://github.com/username/plugin-repo"
									value={gitUrlInput}
									onChange={(e) => setGitUrlInput(e.target.value)}
									className="h-9 text-xs flex-1 font-mono"
								/>
								<Button
									onClick={handleGitInstall}
									disabled={isGitInstalling}
									className="text-xs h-9 px-4"
								>
									{isGitInstalling ? "拉取安装中..." : "一键拉取安装"}
								</Button>
							</div>
						</div>

						{/* Method 3: Remote Script URL */}
						<div className="p-4 rounded-xl border bg-card space-y-3">
							<div className="flex items-center gap-2">
								<div className="size-6 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center">
									<HugeiconsIcon icon={FlashIcon} className="size-3.5" />
								</div>
								<h4 className="text-sm font-bold text-foreground">
									方法三：通过 URL 脚本链接安装
								</h4>
							</div>
							<div className="flex items-center gap-2">
								<Input
									type="text"
									placeholder="https://cdn.example.com/my-plugin.js"
									value={urlInput}
									onChange={(e) => setUrlInput(e.target.value)}
									className="h-9 text-xs flex-1 font-mono"
								/>
								<Button
									variant="outline"
									onClick={handleUrlInstall}
									disabled={isUrlInstalling}
									className="text-xs h-9 px-4"
								>
									{isUrlInstalling ? "下载中..." : "安装脚本"}
								</Button>
							</div>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
