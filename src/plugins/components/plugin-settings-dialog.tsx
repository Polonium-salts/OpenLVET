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
import { Settings01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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

	const [localConfig, setLocalConfig] = useState<Record<string, unknown>>({});

	useEffect(() => {
		if (pluginRecord) {
			setLocalConfig({
				...(manifest?.defaultConfig ?? {}),
				...(pluginRecord.config ?? {}),
			});
		}
	}, [pluginRecord, manifest]);

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

	return (
		<Dialog
			open={!!activeSettingsPluginId}
			onOpenChange={(open) => {
				if (!open) closePluginSettings();
			}}
		>
			<DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col p-6 overflow-hidden">
				<DialogHeader className="border-b pb-4">
					<DialogTitle className="flex items-center gap-2 text-base font-semibold">
						<HugeiconsIcon icon={Settings01Icon} className="size-5 text-primary" />
						<span>{manifest.name} - 配置项</span>
					</DialogTitle>
					<DialogDescription className="text-xs text-muted-foreground mt-1">
						{manifest.description}
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
					{configSchema.length === 0 ? (
						<div className="py-8 text-center text-xs text-muted-foreground">
							该插件无需额外配置，已是最佳预设状态。
						</div>
					) : (
						configSchema.map((field) => {
							const value = localConfig[field.key] ?? field.default;

							return (
								<div
									key={field.key}
									className="flex flex-col gap-1.5 p-3 rounded-lg border bg-card/60"
								>
									<div className="flex items-center justify-between">
										<label
											htmlFor={field.key}
											className="text-xs font-semibold text-foreground"
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
											className="h-8 text-xs mt-1"
										/>
									)}

									{/* Number / Slider Field */}
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
											<SelectTrigger className="h-8 text-xs mt-1">
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
												className="size-7 rounded cursor-pointer border border-border"
											/>
											<Input
												type="text"
												value={String(value ?? "#000000")}
												onChange={(e) =>
													handleFieldChange(field.key, e.target.value)
												}
												className="h-8 text-xs font-mono w-28"
											/>
										</div>
									)}
								</div>
							);
						})
					)}
				</div>

				<div className="border-t pt-4 flex items-center justify-between">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleReset}
						className="text-xs text-muted-foreground hover:text-foreground"
					>
						恢复默认设置
					</Button>
					<Button
						size="sm"
						onClick={closePluginSettings}
						className="text-xs px-4"
					>
						完成
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
