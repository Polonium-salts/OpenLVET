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
import { Checkbox } from "@/components/ui/checkbox";
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
	HelpCircleIcon,
	SparklesIcon,
	RotateLeft01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ReactMarkdownWrapper } from "@/components/ui/react-markdown-wrapper";
import type { PluginManifest } from "../types";

export function PluginSettingsDialog() {
	const activeSettingsPluginId = usePluginStore(
		(state) => state.activeSettingsPluginId,
	);
	const closePluginSettings = usePluginStore(
		(state) => state.closePluginSettings,
	);
	const installedPlugins = usePluginStore((state) => state.installedPlugins);

	const pluginRecord = activeSettingsPluginId
		? installedPlugins[activeSettingsPluginId]
		: null;
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

	if (!activeSettingsPluginId || !pluginRecord || !manifest) {
		return null;
	}

	const handleFieldChange = (key: string, value: unknown) => {
		const updated = { ...localConfig, [key]: value };
		setLocalConfig(updated);
		pluginManager.updatePluginConfig(activeSettingsPluginId, updated);
	};

	const handleReset = () => {
		const resetConfig = { ...(manifest.defaultConfig ?? {}) };
		setLocalConfig(resetConfig);
		pluginManager.updatePluginConfig(activeSettingsPluginId, resetConfig);
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
			<DialogContent className="sm:max-w-[580px] max-h-[85vh] flex flex-col p-0 overflow-hidden select-none bg-background/95 backdrop-blur-xl border-border/80 shadow-2xl rounded-2xl">
				{/* Dialog Header */}
				<div className="border-b border-border/60 px-6 py-4 bg-muted/20 space-y-3 pr-14 shrink-0">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2.5">
							<div className="size-8.5 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-xs">
								<HugeiconsIcon
									icon={hasConfig && activeTab === "config" ? Settings01Icon : Book02Icon}
									className="size-4"
								/>
							</div>
							<div>
								<DialogTitle className="text-base font-bold text-foreground">
									{manifest.name}
								</DialogTitle>
								<DialogDescription className="text-xs text-muted-foreground line-clamp-1">
									{manifest.description}
								</DialogDescription>
							</div>
						</div>

						{/* Sub Tabs Pill Navigation (when both config and docs available) */}
						{hasConfig && (
							<div className="flex items-center bg-muted/60 p-1 rounded-lg border text-xs">
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

				{/* Tab 1: Config Parameters */}
				{activeTab === "config" && hasConfig && (
					<div className="flex-1 overflow-y-auto p-6 space-y-4">
						{configSchema.map((field) => {
							const value = localConfig[field.key] ?? field.default;

							return (
								<div
									key={field.key}
									className="flex flex-col gap-1.5 p-3.5 rounded-xl border bg-card/60"
								>
									<div className="flex items-center justify-between">
										<label
											htmlFor={field.key}
											className="text-xs font-semibold text-foreground cursor-pointer"
										>
											{field.label}
										</label>
										{field.type === "boolean" && (
											<Checkbox
												id={field.key}
												checked={Boolean(value)}
												onCheckedChange={(checked) =>
													handleFieldChange(field.key, checked)
												}
											/>
										)}
									</div>

									{field.description && (
										<p className="text-[11px] text-muted-foreground">
											{field.description}
										</p>
									)}

									{/* String Field */}
									{field.type === "string" && (
										<Input
											id={field.key}
											type="text"
											value={String(value ?? "")}
											placeholder={field.placeholder}
											onChange={(e) =>
												handleFieldChange(field.key, e.target.value)
											}
											className="h-8 text-xs mt-1 bg-accent/20"
										/>
									)}

									{/* Number / Range Slider Field */}
									{field.type === "number" && (
										<div className="flex items-center gap-3 mt-1">
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
												className="flex-1 accent-primary h-1.5 bg-accent rounded-lg cursor-pointer"
											/>
											<span className="text-xs font-mono text-muted-foreground w-12 text-right">
												{value !== undefined ? String(value) : ""}
											</span>
										</div>
									)}

									{/* Select Field */}
									{field.type === "select" && (
										<Select
											value={String(value ?? "")}
											onValueChange={(val) =>
												handleFieldChange(field.key, val)
											}
										>
											<SelectTrigger className="h-8 text-xs mt-1 bg-accent/20">
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

									{/* Color Field */}
									{field.type === "color" && (
										<div className="flex items-center gap-2 mt-1">
											<input
												type="color"
												value={String(value ?? "#000000")}
												onChange={(e) =>
													handleFieldChange(field.key, e.target.value)
												}
												className="size-7 rounded cursor-pointer border border-border bg-transparent"
											/>
											<Input
												type="text"
												value={String(value ?? "#000000")}
												onChange={(e) =>
													handleFieldChange(field.key, e.target.value)
												}
												className="h-8 text-xs font-mono w-28 bg-accent/20"
											/>
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}

				{/* Tab 2: Markdown Documentation View */}
				{(activeTab === "docs" || !hasConfig) && (
					<div className="flex-1 overflow-y-auto p-6 text-xs leading-relaxed space-y-4">
						{!hasConfig && (
							<div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-foreground">
								<HugeiconsIcon icon={SparklesIcon} className="size-4 text-primary shrink-0" />
								<p className="text-[11px] text-muted-foreground">
									该插件为免配置即插即用型扩展，默认处于最佳预设状态。下方为插件详细文档与使用说明：
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

				{/* Dialog Footer */}
				<div className="border-t px-6 py-3.5 bg-muted/20 flex items-center justify-between">
					{hasConfig ? (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleReset}
							className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
						>
							<HugeiconsIcon icon={RotateLeft01Icon} className="size-3.5" />
							恢复默认设置
						</Button>
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
						className="text-xs px-5 h-8"
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
