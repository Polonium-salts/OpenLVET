"use client";

import { useState, useRef, useMemo } from "react";
import { usePluginStore } from "../plugin-store";
import { pluginManager } from "../plugin-manager";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	PuzzleIcon,
	Download01Icon,
	CodeIcon,
	Settings01Icon,
	Delete02Icon,
	Folder03Icon,
	FlashIcon,
	Search01Icon,
	Cancel01Icon,
	SparklesIcon,
	InformationCircleIcon,
	Upload01Icon,
	SourceCodeIcon,
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

	// Search and filter states
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");

	// Installer states
	const [gitUrlInput, setGitUrlInput] = useState("");
	const [isGitInstalling, setIsGitInstalling] = useState(false);
	const [urlInput, setUrlInput] = useState("");
	const [isUrlInstalling, setIsUrlInstalling] = useState(false);
	const [isDraggingOver, setIsDraggingOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleTogglePlugin = async (id: string) => {
		try {
			await pluginManager.togglePlugin(id);
			const isNowEnabled = !installedPlugins[id]?.enabled;
			toast.success(
				isNowEnabled ? "已成功启用插件" : "已停用插件",
			);
		} catch (err) {
			toast.error("切换插件状态失败", {
				description: err instanceof Error ? err.message : String(err),
			});
		}
	};

	const handleUninstall = async (id: string, name: string) => {
		try {
			await pluginManager.uninstallPlugin(id);
			toast.success(`已卸载插件: ${name}`);
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
			toast.success("ZIP 插件安装成功！");
			openPluginCenter("installed");
		} catch (err) {
			toast.error("安装 ZIP 插件失败", {
				description: err instanceof Error ? err.message : "请检查文件格式是否有效",
			});
		} finally {
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const handleDropZip = async (e: React.DragEvent) => {
		e.preventDefault();
		setIsDraggingOver(false);
		const file = e.dataTransfer.files?.[0];
		if (!file) return;
		if (!file.name.endsWith(".zip")) {
			toast.error("请拖入 .zip 格式的插件压缩包");
			return;
		}

		try {
			const buffer = await file.arrayBuffer();
			await pluginManager.installFromZip(buffer);
			toast.success("ZIP 插件安装成功！");
			openPluginCenter("installed");
		} catch (err) {
			toast.error("安装 ZIP 插件失败", {
				description: err instanceof Error ? err.message : "请检查压缩包内容",
			});
		}
	};

	const handleGitInstall = async (targetUrl?: string) => {
		const urlToUse = (targetUrl || gitUrlInput).trim();
		if (!urlToUse) {
			toast.info("请输入 Git / GitHub 仓库地址");
			return;
		}

		setIsGitInstalling(true);
		try {
			await pluginManager.installFromGit(urlToUse);
			setGitUrlInput("");
			toast.success("Git 仓库插件拉取并安装成功！");
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
			toast.success("远程脚本插件安装成功！");
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
	const activeCount = installedList.filter((p) => p.enabled).length;

	// Filtered list
	const filteredList = useMemo(() => {
		return installedList.filter((plugin) => {
			const manifest = plugin.manifest;
			const matchesQuery =
				searchQuery === "" ||
				manifest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				manifest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				manifest.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				manifest.id.toLowerCase().includes(searchQuery.toLowerCase());

			if (!matchesQuery) return false;

			if (selectedCategory === "all") return true;
			if (selectedCategory === "enabled") return plugin.enabled;
			if (selectedCategory === "disabled") return !plugin.enabled;
			if (selectedCategory === "builtin") return plugin.sourceType === "builtin";
			if (selectedCategory === "external") return plugin.sourceType !== "builtin";
			if (selectedCategory === "visuals") return manifest.category === "visuals";
			if (selectedCategory === "tools") return manifest.category === "tools";

			return true;
		});
	}, [installedList, searchQuery, selectedCategory]);

	return (
		<Dialog
			open={isPluginCenterOpen}
			onOpenChange={(open) => {
				if (!open) closePluginCenter();
			}}
		>
			<DialogContent className="sm:max-w-[800px] h-[85vh] max-h-[720px] flex flex-col p-0 overflow-hidden select-none bg-background/95 backdrop-blur-xl border-border/80 shadow-2xl rounded-2xl">
				{/* Dialog Header */}
				<div className="flex items-center justify-between border-b border-border/60 px-6 py-4 bg-muted/20 pr-16 shrink-0">
					<div className="flex items-center gap-3">
						<div className="size-9 rounded-xl bg-muted flex items-center justify-center text-foreground border border-border/70 shadow-xs">
							<HugeiconsIcon icon={PuzzleIcon} className="size-5 text-foreground" />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<DialogTitle className="text-base font-bold text-foreground tracking-tight">
									OpenLVET 插件中心
								</DialogTitle>
								<span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
									Hub
								</span>
							</div>
							<DialogDescription className="text-xs text-muted-foreground mt-0.5">
								扩展全局功能、滤镜调色、画幅 HUD、素材库与自动化工作流
							</DialogDescription>
						</div>
					</div>

					{/* Navigation Tabs with clean spacing away from Close button */}
					<div className="flex items-center bg-muted/70 p-1 rounded-xl border border-border/60 text-xs shadow-inner">
						<button
							type="button"
							onClick={() => openPluginCenter("installed")}
							className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
								pluginCenterTab === "installed"
									? "bg-background text-foreground shadow-xs font-semibold"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							<span>已安装</span>
							<span
								className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
									activeCount > 0
										? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold"
										: "bg-muted text-muted-foreground"
								}`}
							>
								{installedList.length}
							</span>
						</button>
						<button
							type="button"
							onClick={() => openPluginCenter("install")}
							className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
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
					<div className="flex-1 flex flex-col min-h-0">
						{/* Search & Filter Toolbar */}
						<div className="px-6 py-3 border-b border-border/50 bg-muted/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
							{/* Search input */}
							<div className="relative w-64 max-w-full">
								<HugeiconsIcon
									icon={Search01Icon}
									className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									type="text"
									placeholder="搜索已安装插件名称或简介..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="h-8 pl-8 pr-7 text-xs bg-background/80 border-border/70 rounded-lg focus-visible:ring-1"
								/>
								{searchQuery && (
									<button
										type="button"
										onClick={() => setSearchQuery("")}
										className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
									>
										<HugeiconsIcon icon={Cancel01Icon} className="size-3" />
									</button>
								)}
							</div>

							{/* Category Filters */}
							<div className="flex items-center gap-1 overflow-x-auto text-[11px]">
								{[
									{ id: "all", label: "全部" },
									{ id: "enabled", label: `启用中 (${activeCount})` },
									{ id: "builtin", label: "内置" },
									{ id: "external", label: "扩展" },
								].map((cat) => (
									<button
										key={cat.id}
										type="button"
										onClick={() => setSelectedCategory(cat.id)}
										className={`px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap ${
											selectedCategory === cat.id
												? "bg-primary text-primary-foreground font-semibold shadow-xs"
												: "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
										}`}
									>
										{cat.label}
									</button>
								))}
							</div>
						</div>

						{/* Plugin List Content Area */}
						<div className="flex-1 overflow-y-auto p-6 space-y-3">
							{installedList.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
									<div className="size-14 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center text-muted-foreground">
										<HugeiconsIcon icon={PuzzleIcon} className="size-7" />
									</div>
									<div>
										<h4 className="text-sm font-semibold text-foreground">暂无已安装插件</h4>
										<p className="text-xs text-muted-foreground mt-1 max-w-sm">
											您可以前往“安装扩展”标签页，导入 ZIP 插件包或通过 GitHub 仓库一键安装。
										</p>
									</div>
									<Button
										size="sm"
										onClick={() => openPluginCenter("install")}
										className="mt-2 text-xs gap-1.5"
									>
										<HugeiconsIcon icon={Download01Icon} className="size-3.5" />
										<span>去安装第一个插件</span>
									</Button>
								</div>
							) : filteredList.length === 0 ? (
								<div className="py-16 text-center text-xs text-muted-foreground space-y-2">
									<p>没有找到与“{searchQuery}”匹配的插件</p>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											setSearchQuery("");
											setSelectedCategory("all");
										}}
										className="text-xs text-primary hover:underline"
									>
										清除搜索与筛选条件
									</Button>
								</div>
							) : (
								filteredList.map((record) => {
									const { manifest, enabled, sourceType } = record;

									const sourceBadge = {
										builtin: {
											label: "官方内置",
											color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
											icon: SparklesIcon,
										},
										zip: {
											label: "ZIP 导入",
											color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
											icon: Folder03Icon,
										},
										git: {
											label: "Git 仓库",
											color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
											icon: CodeIcon,
										},
										url: {
											label: "URL 链接",
											color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
											icon: FlashIcon,
										},
										code: {
											label: "代码开发",
											color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
											icon: SourceCodeIcon,
										},
										file: {
											label: "本地文件",
											color: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
											icon: Folder03Icon,
										},
									}[sourceType] || {
										label: "扩展",
										color: "bg-muted text-muted-foreground border-border",
										icon: PuzzleIcon,
									};

									const categoryLabel = {
										visuals: "视觉与特效",
										tools: "快捷工具",
										audio: "音频增强",
										workflow: "工作流程",
										ai: "AI 助手",
										custom: "自定义扩展",
									}[manifest.category] || "插件模块";

									const hasConfig =
										manifest.configSchema &&
										manifest.configSchema.length > 0;

									return (
										<div
											key={manifest.id}
											className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-4.5 rounded-xl border transition-all duration-200 gap-4 ${
												enabled
													? "bg-card/70 border-border/80 hover:border-primary/40 hover:bg-card/90 hover:shadow-md"
													: "bg-muted/15 border-border/40 opacity-75 hover:opacity-100"
											}`}
										>
											{/* Left Section: Icon & Info */}
											<div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
												{/* Icon with Status Dot */}
												<div className="relative shrink-0">
													<div
														className={`size-11 rounded-xl flex items-center justify-center border transition-colors ${
															enabled
																? "bg-primary/10 border-primary/25 text-primary shadow-xs"
																: "bg-muted/40 border-border text-muted-foreground"
														}`}
													>
														<HugeiconsIcon icon={PuzzleIcon} className="size-5" />
													</div>
													{/* Glowing Status Dot */}
													<span
														className={`absolute -top-1 -right-1 size-3 rounded-full border-2 border-background transition-all ${
															enabled
																? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
																: "bg-zinc-400"
														}`}
														title={enabled ? "插件已激活" : "插件已停用"}
													/>
												</div>

												{/* Text Details */}
												<div className="space-y-1.5 flex-1 min-w-0">
													<div className="flex flex-wrap items-center gap-2">
														<h4 className="text-sm font-semibold text-foreground tracking-tight truncate max-w-[280px]">
															{manifest.name}
														</h4>
														<span
															className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium border flex items-center gap-1 ${sourceBadge.color}`}
														>
															<HugeiconsIcon
																icon={sourceBadge.icon}
																className="size-2.5"
															/>
															<span>{sourceBadge.label}</span>
														</span>
														<span className="text-[10px] px-1.5 py-0.2 rounded-md font-medium bg-muted/60 text-muted-foreground border border-border/50">
															{categoryLabel}
														</span>
														<span className="text-[11px] font-mono text-muted-foreground/80">
															v{manifest.version}
														</span>
													</div>

													<p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
														{manifest.description || "暂无插件描述信息"}
													</p>

													{/* Meta footer row */}
													<div className="flex items-center gap-3 text-[11px] text-muted-foreground/80 pt-0.5">
														{manifest.author && (
															<span className="flex items-center gap-1">
																<span>作者:</span>
																<span className="font-medium text-foreground/80">
																	{manifest.author}
																</span>
															</span>
														)}
														{hasConfig && (
															<span className="text-primary/90 flex items-center gap-0.5">
																<HugeiconsIcon
																	icon={Settings01Icon}
																	className="size-3"
																/>
																<span>支持参数配置</span>
															</span>
														)}
													</div>
												</div>
											</div>

											{/* Right Section: Action Controls */}
											<div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
												{/* Action buttons cluster */}
												<div className="flex items-center bg-muted/40 p-0.5 rounded-lg border border-border/50">
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																onClick={() => openPluginSettings(manifest.id)}
																className="size-7.5 text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-md transition-colors"
															>
																<HugeiconsIcon
																	icon={Settings01Icon}
																	className="size-3.5"
																/>
															</Button>
														</TooltipTrigger>
														<TooltipContent side="top" className="text-xs">
															{hasConfig ? "配置参数与文档" : "查看插件文档"}
														</TooltipContent>
													</Tooltip>

													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																onClick={() =>
																	handleExportZip(
																		manifest.id,
																		manifest.name,
																	)
																}
																className="size-7.5 text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-md transition-colors"
															>
																<HugeiconsIcon
																	icon={Download01Icon}
																	className="size-3.5"
																/>
															</Button>
														</TooltipTrigger>
														<TooltipContent side="top" className="text-xs">
															导出为 .zip 插件包
														</TooltipContent>
													</Tooltip>

													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																onClick={() =>
																	handleUninstall(
																		manifest.id,
																		manifest.name,
																	)
																}
																className="size-7.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
															>
																<HugeiconsIcon
																	icon={Delete02Icon}
																	className="size-3.5"
																/>
															</Button>
														</TooltipTrigger>
														<TooltipContent side="top" className="text-xs">
															卸载此插件
														</TooltipContent>
													</Tooltip>
												</div>

												{/* Toggle Switch */}
												<div className="flex items-center gap-2 pl-1">
													<span
														className={`text-xs font-medium ${
															enabled
																? "text-emerald-600 dark:text-emerald-400 font-semibold"
																: "text-muted-foreground"
														}`}
													>
														{enabled ? "已启用" : "已禁用"}
													</span>
													<Switch
														checked={enabled}
														onCheckedChange={() =>
															handleTogglePlugin(manifest.id)
														}
													/>
												</div>
											</div>
										</div>
									);
								})
							)}
						</div>
					</div>
				)}

				{/* Tab 2: Install from ZIP / Git / URL */}
				{pluginCenterTab === "install" && (
					<div className="flex-1 overflow-y-auto p-6 space-y-5">
						{/* Header Hint Box */}
						<div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3">
							<div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
								<HugeiconsIcon icon={InformationCircleIcon} className="size-4" />
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed">
								OpenLVET 支持全开放模块化架构。您可以随时安装社区制作的转场特效、素材源接口、UI 工具栏挂件与自动化处理脚本。
							</p>
						</div>

						{/* Method 1: ZIP Upload Dropzone */}
						<div className="p-4.5 rounded-xl border border-border/70 bg-card/60 space-y-3 hover:border-border transition-all">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2.5">
									<div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
										<HugeiconsIcon icon={Folder03Icon} className="size-4" />
									</div>
									<div>
										<h4 className="text-xs font-bold text-foreground">
											本地导入：上传 .ZIP 插件包
										</h4>
										<p className="text-[11px] text-muted-foreground">
											支持标准 OpenLVET 格式（包含 plugin.json 与 index.js）
										</p>
									</div>
								</div>
								<span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
									即时加载
								</span>
							</div>

							<div
								onClick={() => fileInputRef.current?.click()}
								onDragOver={(e) => {
									e.preventDefault();
									setIsDraggingOver(true);
								}}
								onDragLeave={() => setIsDraggingOver(false)}
								onDrop={handleDropZip}
								className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
									isDraggingOver
										? "border-emerald-500 bg-emerald-500/10 scale-[0.99]"
										: "border-border/80 hover:border-emerald-500/60 bg-muted/20 hover:bg-muted/40"
								}`}
							>
								<div className="size-11 rounded-xl bg-background/80 border border-border/60 mx-auto flex items-center justify-center mb-2.5 text-muted-foreground shadow-xs group-hover:text-foreground">
									<HugeiconsIcon
										icon={Upload01Icon}
										className="size-5 text-emerald-600 dark:text-emerald-400"
									/>
								</div>
								<p className="text-xs font-semibold text-foreground">
									点击选择文件 或 将 .zip 插件包拖放至此处
								</p>
								<p className="text-[11px] text-muted-foreground mt-1">
									前端将在本地沙箱即时解析并激活扩展，无需经过后端服务器
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
						<div className="p-4.5 rounded-xl border border-border/70 bg-card/60 space-y-3 hover:border-border transition-all">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2.5">
									<div className="size-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
										<HugeiconsIcon icon={CodeIcon} className="size-4" />
									</div>
									<div>
										<h4 className="text-xs font-bold text-foreground">
											开源拉取：Git / GitHub 仓库地址
										</h4>
										<p className="text-[11px] text-muted-foreground">
											输入开源插件仓库 URL，系统将自动检索分支内容并安装
										</p>
									</div>
								</div>
								<span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20">
									云端同步
								</span>
							</div>

							<div className="flex items-center gap-2">
								<Input
									type="text"
									placeholder="https://github.com/username/openlvet-plugin-name"
									value={gitUrlInput}
									onChange={(e) => setGitUrlInput(e.target.value)}
									className="h-9 text-xs flex-1 font-mono bg-background/80 border-border/70"
								/>
								<Button
									onClick={() => handleGitInstall()}
									disabled={isGitInstalling}
									className="text-xs h-9 px-4 bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
								>
									{isGitInstalling ? (
										<span>拉取安装中...</span>
									) : (
										<>
											<HugeiconsIcon icon={Download01Icon} className="size-3.5" />
											<span>一键拉取安装</span>
										</>
									)}
								</Button>
							</div>
						</div>

						{/* Method 3: Remote Script URL */}
						<div className="p-4.5 rounded-xl border border-border/70 bg-card/60 space-y-3 hover:border-border transition-all">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2.5">
									<div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
										<HugeiconsIcon icon={FlashIcon} className="size-4" />
									</div>
									<div>
										<h4 className="text-xs font-bold text-foreground">
											极速加载：远程 JS / CDN 脚本
										</h4>
										<p className="text-[11px] text-muted-foreground">
											直接从 CDN 或服务器 URL 加载独立的 JavaScript 插件代码
										</p>
									</div>
								</div>
								<span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
									单文件
								</span>
							</div>

							<div className="flex items-center gap-2">
								<Input
									type="text"
									placeholder="https://cdn.example.com/openlvet-plugin.js"
									value={urlInput}
									onChange={(e) => setUrlInput(e.target.value)}
									className="h-9 text-xs flex-1 font-mono bg-background/80 border-border/70"
								/>
								<Button
									variant="outline"
									onClick={handleUrlInstall}
									disabled={isUrlInstalling}
									className="text-xs h-9 px-4 gap-1.5"
								>
									{isUrlInstalling ? "加载中..." : "加载并安装"}
								</Button>
							</div>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
