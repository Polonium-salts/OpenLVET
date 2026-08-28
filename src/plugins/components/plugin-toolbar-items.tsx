"use client";

import { usePluginStore } from "../plugin-store";
import type { PluginToolbarItemDefinition, PluginManifest } from "../types";

function DynamicToolbarItemRenderer({
	item,
	manifest,
}: {
	item: PluginToolbarItemDefinition;
	manifest: PluginManifest;
}) {
	return <>{item.render({ plugin: manifest })}</>;
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
