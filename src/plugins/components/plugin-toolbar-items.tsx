"use client";

import { usePluginStore } from "../plugin-store";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PluginToolbarItemDefinition, PluginManifest } from "../types";

function DynamicToolbarItemRenderer({
	item,
	manifest,
}: {
	item: PluginToolbarItemDefinition;
	manifest: PluginManifest;
}) {
	if (typeof item.render === "function") {
		return <>{item.render({ plugin: manifest })}</>;
	}

	const content = (
		<Button
			variant="ghost"
			size="sm"
			onClick={item.onClick}
			className="h-7 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-md"
		>
			{item.icon && (
				typeof item.icon === "string" ? (
					<span className="text-xs">{item.icon}</span>
				) : (
					item.icon
				)
			)}
			{item.label && <span className="font-medium text-xs">{item.label}</span>}
		</Button>
	);

	if (item.tooltip) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>{content}</TooltipTrigger>
				<TooltipContent side="top" className="text-xs">
					{item.tooltip}
				</TooltipContent>
			</Tooltip>
		);
	}

	return content;
}

export function DynamicPluginToolbarItems() {
	const dynamicToolbarItems = usePluginStore((s) => s.dynamicToolbarItems);
	const installedPlugins = usePluginStore((s) => s.installedPlugins);

	if (dynamicToolbarItems.length === 0) return null;

	return (
		<>
			<div className="bg-border mx-1 h-6 w-px" />
			<div className="flex items-center gap-1">
				{dynamicToolbarItems.map((item) => {
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
							<DynamicToolbarItemRenderer
								item={item}
								manifest={pluginManifest}
							/>
						</div>
					);
				})}
			</div>
		</>
	);
}
