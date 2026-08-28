"use client";

import { usePluginStore } from "../plugin-store";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { PuzzleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function PluginHeaderButton() {
	const openPluginCenter = usePluginStore((s) => s.openPluginCenter);
	const installedPlugins = usePluginStore((s) => s.installedPlugins);

	const activeCount = Object.values(installedPlugins).filter(
		(p) => p.enabled,
	).length;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => openPluginCenter("installed")}
					className="h-8 px-2.5 text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/60 border border-transparent hover:border-border/40 transition-all rounded-md"
				>
					<HugeiconsIcon icon={PuzzleIcon} className="size-4 text-primary" />
					<span className="font-medium">插件</span>
					{activeCount > 0 && (
						<span className="ml-0.5 size-4 rounded-full bg-primary/20 text-primary text-[10px] font-mono font-bold flex items-center justify-center">
							{activeCount}
						</span>
					)}
				</Button>
			</TooltipTrigger>
			<TooltipContent side="bottom" className="text-xs">
				打开插件中心 (已启用 {activeCount} 个插件)
			</TooltipContent>
		</Tooltip>
	);
}

import type { PluginHeaderItemDefinition, PluginManifest } from "../types";

function DynamicHeaderItemRenderer({
	item,
	manifest,
}: {
	item: PluginHeaderItemDefinition;
	manifest: PluginManifest;
}) {
	return <>{item.render({ plugin: manifest })}</>;
}

export function DynamicPluginHeaderItems({
	position = "left",
}: {
	position?: "left" | "right";
}) {
	const dynamicHeaderItems = usePluginStore((s) => s.dynamicHeaderItems);
	const installedPlugins = usePluginStore((s) => s.installedPlugins);

	const items = dynamicHeaderItems.filter(
		(item) => (item.position ?? "left") === position,
	);

	if (items.length === 0) return null;

	return (
		<div className="flex items-center gap-1.5">
			{items.map((item) => {
				const pluginManifest =
					Object.values(installedPlugins).find((p) => p.enabled)
						?.manifest ?? {
						id: "unknown",
						name: "Plugin",
						version: "1.0.0",
						description: "",
						author: "",
						category: "custom" as const,
					};

				return (
					<div key={item.id} className="flex items-center">
						<DynamicHeaderItemRenderer
							item={item}
							manifest={pluginManifest}
						/>
					</div>
				);
			})}
		</div>
	);
}
