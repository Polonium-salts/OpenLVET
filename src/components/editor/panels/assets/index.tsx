"use client";

import { type StaticTab, useAssetsPanelStore } from "@/components/editor/panels/assets/assets-panel-store";
import { usePluginStore } from "@/plugins/plugin-store";
import { TabBar } from "./tabbar";
import { MediaView } from "./views/assets";
import { StockView } from "@/stock/components/assets-view";
import { SettingsView } from "./views/settings";
import { TextView } from "@/text/components/assets-view";
import { StickersView } from "@/stickers/components/assets-view";
import { EffectsView } from "@/effects/components/assets-view";
import { TransitionsView } from "@/transitions/components/assets-view";
import { PluginsView } from "@/plugins/components/plugins-view";

import type { PluginManifest } from "@/plugins/types";

function DynamicTabRenderer({
	render,
	manifest,
}: {
	render: (props: { plugin: PluginManifest }) => React.ReactNode;
	manifest: PluginManifest;
}) {
	return <>{render({ plugin: manifest })}</>;
}

export function AssetsPanel() {
	const { activeTab } = useAssetsPanelStore();
	const dynamicTabs = usePluginStore((state) => state.dynamicTabs);
	const installedPlugins = usePluginStore((state) => state.installedPlugins);

	const staticViewMap: Record<StaticTab, React.ReactNode> = {
		media: <MediaView />,
		stock: <StockView />,
		text: <TextView />,
		stickers: <StickersView />,
		effects: <EffectsView />,
		transitions: <TransitionsView />,
		plugins: <PluginsView />,
		settings: <SettingsView />,
	};

	let currentView: React.ReactNode = null;
	if (activeTab in staticViewMap) {
		currentView = staticViewMap[activeTab as StaticTab];
	} else {
		const foundDynTab = dynamicTabs.find((t) => t.id === activeTab);
		if (foundDynTab) {
			const dummyManifest = Object.values(installedPlugins).find(
				(p) => p.enabled,
			)?.manifest ?? {
				id: "plugin",
				name: "Plugin",
				version: "1.0.0",
				description: "",
				author: "",
				category: "custom" as const,
			};
			currentView = (
				<DynamicTabRenderer
					key={foundDynTab.id}
					render={foundDynTab.render}
					manifest={dummyManifest}
				/>
			);
		} else {
			currentView = <MediaView />;
		}
	}

	return (
		<div className="panel bg-background flex h-full rounded-md border overflow-hidden shadow-xs">
			<TabBar />
			<div className="flex-1 overflow-hidden">{currentView}</div>
		</div>
	);
}
