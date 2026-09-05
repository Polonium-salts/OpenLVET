"use client";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Settings01Icon,
	Book02Icon,
	SparklesIcon,
	RotateLeft01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { ReactMarkdownWrapper } from "@/components/ui/react-markdown-wrapper";
import type { PluginConfigFieldSchema, PluginManifest } from "../types";

export function PluginSettingsDialog() {
	const activeSettingsPluginId = usePluginStore(
		(state) => state.activeSettingsPluginId,
	);
	const closePluginSettings = usePluginStore(
		(state) => state.closePluginSettings,
	);
	const installedPlugins = usePluginStore((state) => state.installedPlugins);

	const pluginRecord = useMemo(() => {
		if (!activeSettingsPluginId) return null;
		if (installedPlugins[activeSettingsPluginId]) {
			return installedPlugins[activeSettingsPluginId];
		}
		const found = Object.values(installedPlugins).find(
			(p) =>
				p.manifest.id.toLowerCase() === activeSettingsPluginId.toLowerCase(),
		);
		if (found) return found;

		// Fallback to pluginManager.getPluginRecord
		try {
			const pmRecord = pluginManager.getPluginRecord(activeSettingsPluginId);
			if (pmRecord) return pmRecord;
		} catch {}

		return null;
	}, [activeSettingsPluginId, installedPlugins]);

	const manifest = pluginRecord?.manifest;
	const configSchema = manifest?.configSchema ?? [];
	const hasConfig = configSchema.length > 0;

	// If no configSchema, default to "docs", otherwise default to "config"
	const [activeTab, setActiveTab] = useState<"config" | "docs">("config");
	const [localConfig, setLocalConfig] = useState<Record<string, unknown>>({});

	useEffect(() => {
		if (pluginRecord && manifest) {
			setLocalConfig({
				...(manifest.defaultConfig ?? {}),
				...(pluginRecord.config ?? {}),
			});
			setActiveTab(hasConfig ? "config" : "docs");
		}
	}, [pluginRecord, manifest, hasConfig]);

	// Auto-group fields into cards based on optional group key
	const groupedSections = useMemo(() => {
		if (!hasConfig) return [];
		const map: Record<string, PluginConfigFieldSchema[]> = {};
		for (const field of configSchema) {
			const groupName = field.group || "基础配置";
			if (!map[groupName]) {
				map[groupName] = [];
			}
			map[groupName].push(field);
		}
		return Object.entries(map).map(([name, fields]) => ({
			name,
			fields,
		}));
	}, [configSchema, hasConfig]);

	if (!activeSettingsPluginId) {
		return null;
	}

	if (!pluginRecord || !manifest) {
		return (
			<Dialog
				open={!!activeSettingsPluginId}
				onOpenChange={(open) => {
					if (!open) closePluginSettings();
				}}
			>
				<DialogContent className="sm:max-w-[420px] p-6 text-center select-none bg-background/95 backdrop-blur-xl border-border/80 shadow-2xl rounded-2xl space-y-4">
					<div className="size-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto text-xl">
						⚠️
					</div>
					<div className="space-y-1">
						<DialogTitle className="text-base font-bold text-foreground">
							未找到插件配置
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							无法加载插件 &quot;{activeSettingsPluginId}&quot; 的设置信息。该插件可能已被卸载或尚未完全加载。
						</DialogDescription>
					</div>
					<div className="flex items-center justify-center gap-2 pt-2">
						<Button
							variant="outline"
							size="sm"
							onClick={closePluginSettings}
							className="text-xs px-4"
						>
							关闭
						</Button>
						<Button
							size="sm"
							onClick={() => {
								closePluginSettings();
								usePluginStore.getState().openPluginCenter("installed");
							}}
							className="text-xs px-4"
						>
							前往插件中心
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	const handleFieldChange = (key: string, value: unknown) => {
		const updated = { ...localConfig, [key]: value };
		setLocalConfig(updated);
		const targetId = manifest.id || activeSettingsPluginId;
		pluginManager.updatePluginConfig(targetId, updated);
	};

	const handleReset = () => {
		const resetConfig = { ...(manifest.defaultConfig ?? {}) };
		setLocalConfig(resetConfig);
		const targetId = manifest.id || activeSettingsPluginId;
		pluginManager.updatePluginConfig(targetId, resetConfig);
		toast.success("已恢复插件默认配置");
	};

	const readmeContent =
		manifest.readme ||
		pluginRecord.readme ||
		generateFallbackReadme(manifest);

	return (
		<Dialog
			open={!!activeSettingsPluginId}
			onOpenChange={(open) => {
				if (!open) closePluginSettings();
			}}
		>
			<DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col p-0 overflow-hidden select-none bg-background/95 backdrop-blur-xl border-border/80 shadow-2xl rounded-2xl">
				{/* Dialog Header */}
				<div className="border-b border-border/60 px-6 py-4 bg-muted/20 space-y-3 pr-14 shrink-0">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3 min-w-0">
							<div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-xs shrink-0">
								<HugeiconsIcon
									icon={hasConfig && activeTab === "config" ? Settings01Icon : Book02Icon}
									className="size-4"
								/>
							</div>
							<div className="min-w-0">
								<DialogTitle className="text-sm font-bold text-foreground truncate">
									{manifest.name}
								</DialogTitle>
								<DialogDescription className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
									{manifest.description || "暂无描述信息"}
								</DialogDescription>
							</div>
						</div>

						{/* Sub Tabs Pill Navigation (when both config and docs available) */}
						{hasConfig && (
							<div className="flex items-center bg-muted/60 p-1 rounded-lg border text-xs shrink-0">
								<button
									type="button"
									onClick={() => setActiveTab("config")}
									className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
										activeTab === "config"
											? "bg-background text-foreground shadow-xs font-semibold"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									<HugeiconsIcon icon={Settings01Icon} className="size-3.5" />
									<span>参数配置</span>
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("docs")}
									className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
										activeTab === "docs"
											? "bg-background text-foreground shadow-xs font-semibold"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									<HugeiconsIcon icon={Book02Icon} className="size-3.5" />
									<span>说明文档</span>
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Tab 1: Config Parameters - Unified Schema-driven Auto-Layout */}
				{activeTab === "config" && hasConfig && (
					<div className="flex-1 overflow-y-auto p-6 space-y-5">
						{groupedSections.map((section) => (
							<div key={section.name} className="space-y-2">
								{groupedSections.length > 1 && (
									<h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
										{section.name}
									</h4>
								)}
								<div className="rounded-xl border border-border/60 bg-card/40 divide-y divide-border/40 overflow-hidden shadow-xs backdrop-blur-sm">
									{section.fields.map((field) => {
										const value = localConfig[field.key] ?? field.default;

										// Full-width stacked layout for textarea
										if (field.type === "textarea") {
											return (
												<div key={field.key} className="p-3.5 space-y-2">
													<div className="space-y-0.5">
														<label
															htmlFor={field.key}
															className="text-xs font-semibold text-foreground cursor-pointer"
														>
															{field.label}
														</label>
														{field.description && (
															<p className="text-[11px] text-muted-foreground leading-normal">
																{field.description}
															</p>
														)}
													</div>
													<Textarea
														id={field.key}
														value={String(value ?? "")}
														placeholder={field.placeholder}
														onChange={(e) =>
															handleFieldChange(field.key, e.target.value)
														}
														className="min-h-[72px] text-xs bg-accent/20 border-border/50 resize-y"
													/>
												</div>
											);
										}

										// Two-column auto-aligned row layout
										return (
											<div
												key={field.key}
												className="flex items-center justify-between p-3.5 gap-4 hover:bg-accent/10 transition-colors"
											>
												{/* Left Column: Label + Helper Description */}
												<div className="space-y-0.5 min-w-0 flex-1 pr-2">
													<label
														htmlFor={field.key}
														className="text-xs font-semibold text-foreground cursor-pointer block truncate"
													>
														{field.label}
													</label>
													{field.description && (
														<p className="text-[11px] text-muted-foreground leading-relaxed">
															{field.description}
														</p>
													)}
												</div>

												{/* Right Column: Auto-aligned Controlled Component */}
												<div className="shrink-0 flex items-center justify-end">
													{/* Boolean Switch */}
													{field.type === "boolean" && (
														<Switch
															id={field.key}
															checked={Boolean(value)}
															onCheckedChange={(checked) =>
																handleFieldChange(field.key, checked)
															}
														/>
													)}

													{/* Text String Input */}
													{field.type === "string" && (
														<Input
															id={field.key}
															type="text"
															value={String(value ?? "")}
															placeholder={field.placeholder}
															onChange={(e) =>
																handleFieldChange(field.key, e.target.value)
															}
															className="h-8 text-xs w-[190px] bg-accent/20 border-border/50 focus-visible:bg-accent/40 transition-colors"
														/>
													)}

													{/* Number Slider with Numeric Indicator */}
													{field.type === "number" && (
														<div className="flex items-center gap-2.5 w-[190px]">
															<input
																id={field.key}
																type="range"
																min={field.min ?? 0}
																max={field.max ?? 100}
																step={field.step ?? 1}
																value={Number(value ?? 0)}
																onChange={(e) =>
																	handleFieldChange(
																		field.key,
																		parseFloat(e.target.value),
																	)
																}
																className="flex-1 accent-primary h-1.5 bg-accent/60 rounded-lg cursor-pointer"
															/>
															<span className="text-[11px] font-mono font-medium text-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/40 text-right min-w-[34px]">
																{value !== undefined ? String(value) : ""}
															</span>
														</div>
													)}

													{/* Select Dropdown */}
													{field.type === "select" && (
														<Select
															value={String(value ?? "")}
															onValueChange={(val) =>
																handleFieldChange(field.key, val)
															}
														>
															<SelectTrigger className="h-8 text-xs w-[190px] bg-accent/20 border-border/50">
																<SelectValue placeholder="请选择" />
															</SelectTrigger>
															<SelectContent>
																{field.options?.map((opt) => (
																	<SelectItem
																		key={String(opt.value)}
																		value={String(opt.value)}
																		className="text-xs"
																	>
																		{opt.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													)}

													{/* Color Picker with Hex Indicator */}
													{field.type === "color" && (
														<div className="flex items-center gap-1.5">
															<input
																type="color"
																value={String(value ?? "#000000")}
																onChange={(e) =>
																	handleFieldChange(field.key, e.target.value)
																}
																className="size-7 rounded-md cursor-pointer border border-border/60 bg-transparent p-0.5 shrink-0"
															/>
															<Input
																type="text"
																value={String(value ?? "#000000")}
																onChange={(e) =>
																	handleFieldChange(field.key, e.target.value)
																}
																className="h-8 text-xs font-mono w-24 bg-accent/20 border-border/50 uppercase text-center"
															/>
														</div>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						))}
					</div>
				)}

				{/* Tab 2: Markdown Documentation View */}
				{(activeTab === "docs" || !hasConfig) && (
					<div className="flex-1 overflow-y-auto p-6 text-xs leading-relaxed space-y-4">
						{!hasConfig && (
							<div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/20 text-foreground">
								<HugeiconsIcon icon={SparklesIcon} className="size-4 text-primary shrink-0" />
								<p className="text-[11px] text-muted-foreground leading-normal">
									该插件为即插即用型扩展，默认处于最佳预设状态。下方为插件详细文档与使用说明：
								</p>
							</div>
						)}

						<div className="prose prose-sm dark:prose-invert max-w-none text-foreground text-xs space-y-3">
							<ReactMarkdownWrapper>
								{readmeContent}
							</ReactMarkdownWrapper>
						</div>
					</div>
				)}

				{/* Dialog Footer - Standardized Action Bar & Status Feedback */}
				<div className="border-t px-6 py-3 bg-muted/20 flex items-center justify-between shrink-0">
					{hasConfig ? (
						<div className="flex items-center gap-3">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleReset}
								className="text-xs gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2.5"
							>
								<HugeiconsIcon icon={RotateLeft01Icon} className="size-3.5" />
								恢复默认设置
							</Button>
							<div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
								<span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
								<span>自动保存生效</span>
							</div>
						</div>
					) : (
						<div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
							<span>版本 v{manifest.version}</span>
							<span>•</span>
							<span>{manifest.author}</span>
						</div>
					)}

					<Button
						size="sm"
						onClick={closePluginSettings}
						className="text-xs px-5 h-8 font-medium shadow-xs"
					>
						完成
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

/**
 * Automatically generates a clean, structured Markdown documentation when README is not provided.
 */
function generateFallbackReadme(manifest: PluginManifest): string {
	const categoryLabels: Record<string, string> = {
		visuals: "视觉效果与着色器 (Visuals & Shaders)",
		tools: "实用工具与效率 (Tools & Utilities)",
		audio: "音频与音效增强 (Audio)",
		workflow: "自动化工作流 (Workflow)",
		ai: "AI 智能工具 (AI Tools)",
		custom: "自定义扩展 (Custom)",
	};

	const category = categoryLabels[manifest.category] || manifest.category;
	const tagBadges =
		manifest.tags && manifest.tags.length > 0
			? manifest.tags.map((t) => `\`#${t}\``).join(" ")
			: "`#插件扩展`";

	return `# ${manifest.name}

> ${manifest.description || "无详细描述信息。"}

### 📌 插件基本信息

- **唯一标识 (ID)**: \`${manifest.id}\`
- **版本号 (Version)**: \`v${manifest.version || "1.0.0"}\`
- **开发者 (Author)**: \`${manifest.author || "社区开发者"}\`
- **插件分类 (Category)**: ${category}
- **标签属性 (Tags)**: ${tagBadges}

---

### ✨ 功能特性与使用说明

本插件已成功加载并由 OpenLVET 插件系统统一托管运行。

1. **即插即用体验**：该插件无需用户额外手动配置参数，启用后将自动在对应工作区（如左侧资产面板、时间线工具栏、着色器滤镜库或转场库）中提供相应扩展功能。
2. **状态与生命周期**：您可以在「插件中心」中随时启用、禁用或彻底卸载本插件。
3. **导出分发**：在已安装插件列表中点击下载图标，可随时导出标准 \`.zip\` 插件包以便备份或跨设备分发。
`;
}
