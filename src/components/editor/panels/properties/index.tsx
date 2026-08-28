"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditor } from "@/editor/use-editor";
import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { usePropertiesStore } from "./stores/properties-store";
import { getPropertiesConfig } from "./registry";
import { cn } from "@/utils/ui";
import { EmptyView } from "./empty-view";
import { useTransitionsStore } from "@/transitions/transitions-store";
import { TransitionPropertiesTab } from "@/transitions/components/transition-properties-tab";
import { usePluginStore } from "@/plugins/plugin-store";
import type {
	PluginPropertiesTabDefinition,
	PluginManifest,
} from "@/plugins/types";
import type { PropertiesTabDef } from "./registry";

function DynamicPropertiesTabRenderer({
	tab,
	element,
	trackId,
	manifest,
}: {
	tab: PluginPropertiesTabDefinition;
	element: any;
	trackId: string;
	manifest: PluginManifest;
}) {
	return <>{tab.render({ element, trackId, plugin: manifest })}</>;
}

export function PropertiesPanel() {
	const editor = useEditor();
	useEditor((e) => e.scenes.getActiveSceneOrNull());
	useEditor((e) => e.media.getAssets());
	const { selectedElements } = useElementSelection();
	const { activeTabPerType, setActiveTab } = usePropertiesStore();
	const { selectedTransitionRef } = useTransitionsStore();
	const dynamicPropertiesTabs = usePluginStore((s) => s.dynamicPropertiesTabs);
	const installedPlugins = usePluginStore((s) => s.installedPlugins);

	if (selectedTransitionRef && selectedElements.length === 0) {
		return (
			<div className="panel bg-background flex h-full overflow-hidden rounded-sm border">
				<ScrollArea className="flex-1 scrollbar-hidden">
					<TransitionPropertiesTab />
				</ScrollArea>
			</div>
		);
	}

	if (selectedElements.length === 0) {
		return (
			<div className="panel bg-background flex h-full flex-col items-center justify-center overflow-hidden rounded-sm border">
				<EmptyView />
			</div>
		);
	}

	if (selectedElements.length > 1) {
		return (
			<div className="panel bg-background flex h-full flex-col items-center justify-center overflow-hidden rounded-sm border">
				<p className="text-muted-foreground text-sm">
					{selectedElements.length} elements selected.0
				</p>
			</div>
		);
	}

	const mediaAssets = editor.media.getAssets();

	const elementsWithTracks = editor.timeline.getElementsWithTracks({
		elements: selectedElements,
	});
	const elementWithTrack = elementsWithTracks[0];

	if (!elementWithTrack) return null;

	const { element, track } = elementWithTrack;
	const config = getPropertiesConfig({ element, mediaAssets });

	const dynamicTabsForElement: PropertiesTabDef[] = dynamicPropertiesTabs
		.filter((t) => !t.elementTypes || t.elementTypes.includes(element.type))
		.map((t) => {
			const dummyManifest =
				Object.values(installedPlugins).find((p) => p.enabled)?.manifest ?? {
					id: "plugin",
					name: "Plugin",
					version: "1.0.0",
					description: "",
					author: "",
					category: "custom" as const,
				};

			return {
				id: t.id,
				label: t.label,
				icon:
					typeof t.icon === "string" ? (
						<span className="text-xs leading-none">{t.icon}</span>
					) : (
						(t.icon ?? <span className="text-xs leading-none">🧩</span>)
					),
				content: ({ trackId }) => (
					<DynamicPropertiesTabRenderer
						key={t.id}
						tab={t}
						element={element}
						trackId={trackId}
						manifest={dummyManifest}
					/>
				),
			};
		});

	const visibleTabs = [...config.tabs, ...dynamicTabsForElement];

	const storedTabId = activeTabPerType[element.type];
	const isStoredTabVisible = visibleTabs.some((t) => t.id === storedTabId);
	const activeTabId = isStoredTabVisible ? storedTabId : config.defaultTab;
	const activeTab =
		visibleTabs.find((t) => t.id === activeTabId) ?? visibleTabs[0];

	if (!activeTab) return null;

	return (
		<div className="panel bg-background flex h-full overflow-hidden rounded-sm border">
			<TooltipProvider delayDuration={0}>
				<div className="flex shrink-0 flex-col gap-0.5 border-r p-1 scrollbar-hidden overflow-y-auto">
					{visibleTabs.map((tab) => (
						<Tooltip key={tab.id}>
							<TooltipTrigger asChild>
								<Button
									variant={tab.id === activeTab.id ? "secondary" : "ghost"}
									size="icon"
									onClick={() =>
										setActiveTab({
											elementType: element.type,
											tabId: tab.id,
										})
									}
									aria-label={tab.label}
									className={cn(
										"shrink-0",
										"h-8 w-8",
										tab.id !== activeTab.id && "text-muted-foreground",
									)}
								>
									{tab.icon}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="right">{tab.label}</TooltipContent>
						</Tooltip>
					))}
				</div>
			</TooltipProvider>
			<ScrollArea className="flex-1 scrollbar-hidden">
				{activeTab.content({ trackId: track.id })}
			</ScrollArea>
		</div>
	);
}
