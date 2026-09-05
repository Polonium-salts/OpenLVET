"use client";

import React, { useState, Component, type ErrorInfo } from "react";
import { type StaticTab, useAssetsPanelStore } from "@/components/editor/panels/assets/assets-panel-store";
import { usePluginStore } from "@/plugins/plugin-store";
import { pluginManager } from "@/plugins/plugin-manager";
import { TabBar } from "./tabbar";
import { MediaView } from "./views/assets";
import { StockView } from "@/stock/components/assets-view";
import { SettingsView } from "./views/settings";
import { TextView } from "@/text/components/assets-view";
import { StickersView } from "@/stickers/components/assets-view";
import { EffectsView } from "@/effects/components/assets-view";
import { TransitionsView } from "@/transitions/components/assets-view";
import { PluginsView } from "@/plugins/components/plugins-view";
import { Button } from "@/components/ui/button";

import type { PluginManifest } from "@/plugins/types";

// Ensure global window.React is available for dynamic plugins in Next.js browser environment
if (typeof window !== "undefined") {
	(window as unknown as { React: typeof React }).React = React;
}

interface DynamicTabRendererProps {
	render: (props: { plugin: PluginManifest }) => React.ReactNode;
	manifest: PluginManifest;
	tabId: string;
	tabLabel?: string;
	tabIcon?: React.ReactNode;
}

interface DynamicTabErrorBoundaryProps {
	manifest: PluginManifest;
	tabLabel?: string;
	tabIcon?: React.ReactNode;
	children: React.ReactNode;
}

interface DynamicTabErrorBoundaryState {
	hasError: boolean;
	errorMessage: string;
}

class DynamicTabErrorBoundary extends Component<
	DynamicTabErrorBoundaryProps,
	DynamicTabErrorBoundaryState
> {
	constructor(props: DynamicTabErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, errorMessage: "" };
	}

	static getDerivedStateFromError(error: Error): DynamicTabErrorBoundaryState {
		return { hasError: true, errorMessage: error.message || String(error) };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Plugin dynamic tab render error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<DynamicTabFallback
					manifest={this.props.manifest}
					tabLabel={this.props.tabLabel}
					tabIcon={this.props.tabIcon}
					errorMessage={this.state.errorMessage}
					onRetry={() => this.setState({ hasError: false, errorMessage: "" })}
				/>
			);
		}
		return this.props.children;
	}
}

function DynamicTabFallback({
	manifest,
	tabLabel,
	tabIcon,
	errorMessage,
	onRetry,
}: {
	manifest: PluginManifest;
	tabLabel?: string;
	tabIcon?: React.ReactNode;
	errorMessage?: string;
	onRetry?: () => void;
}) {
	const openPluginSettings = usePluginStore((s) => s.openPluginSettings);

	return (
		<div className="flex flex-col h-full bg-background select-none text-foreground font-sans">
			<header className="px-3.5 py-2.5 border-b border-border/50 flex items-center justify-between bg-card/30 shrink-0">
				<div className="flex items-center gap-2 min-w-0">
					{tabIcon && <span className="text-base shrink-0">{tabIcon}</span>}
					<h3 className="text-xs font-bold truncate text-foreground">
						{tabLabel || manifest.name}
					</h3>
				</div>
				<button
					type="button"
					title="打开插件参数设置"
					onClick={() => openPluginSettings(manifest.id)}
					className="size-7 rounded-lg hover:bg-accent/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
				>
					⚙️
				</button>
			</header>
			<div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
				<span className="text-3xl opacity-60">
					{errorMessage ? "⚠️" : "🧩"}
				</span>
				<div className="space-y-1 max-w-[240px]">
					<h4 className="text-xs font-semibold text-foreground">
						{errorMessage ? "插件界面加载异常" : "插件正在就绪中"}
					</h4>
					<p className="text-[11px] text-muted-foreground leading-relaxed">
						{errorMessage
							? errorMessage
							: "如果插件面板未自动渲染，可点击下方按钮直接打开配置参数或重新加载。"}
					</p>
				</div>
				<div className="flex items-center gap-2 pt-1">
					{onRetry && (
						<Button
							size="sm"
							variant="outline"
							onClick={onRetry}
							className="text-xs h-7 px-2.5"
						>
							🔄 重新加载
						</Button>
					)}
					<Button
						size="sm"
						onClick={() => openPluginSettings(manifest.id)}
						className="text-xs h-7 px-2.5"
					>
						⚙️ 打开设置
					</Button>
				</div>
			</div>
		</div>
	);
}

function DynamicTabRenderer({
	render,
	manifest,
	tabLabel,
	tabIcon,
}: DynamicTabRendererProps) {
	const [reloadKey, setReloadKey] = useState(0);

	if (typeof window !== "undefined") {
		(window as unknown as { React: typeof React }).React = React;
	}

	let renderedContent: React.ReactNode = null;
	let renderFailed = false;
	let failureReason = "";

	try {
		renderedContent = render({ plugin: manifest });
	} catch (err) {
		renderFailed = true;
		failureReason = err instanceof Error ? err.message : String(err);
	}

	if (renderFailed) {
		return (
			<DynamicTabFallback
				manifest={manifest}
				tabLabel={tabLabel}
				tabIcon={tabIcon}
				errorMessage={failureReason}
				onRetry={() => setReloadKey((k) => k + 1)}
			/>
		);
	}

	if (!renderedContent) {
		return (
			<DynamicTabFallback
				manifest={manifest}
				tabLabel={tabLabel}
				tabIcon={tabIcon}
				onRetry={() => setReloadKey((k) => k + 1)}
			/>
		);
	}

	return (
		<DynamicTabErrorBoundary
			key={reloadKey}
			manifest={manifest}
			tabLabel={tabLabel}
			tabIcon={tabIcon}
		>
			<React.Fragment key={reloadKey}>{renderedContent}</React.Fragment>
		</DynamicTabErrorBoundary>
	);
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
			const candidateId = foundDynTab.pluginId || foundDynTab.id;
			const targetManifest =
				(foundDynTab.pluginId
					? installedPlugins[foundDynTab.pluginId]?.manifest
					: null) ??
				installedPlugins[foundDynTab.id]?.manifest ??
				Object.values(installedPlugins).find(
					(p) =>
						p.manifest.id === candidateId ||
						candidateId.startsWith(p.manifest.id) ||
						p.manifest.id.startsWith(candidateId),
				)?.manifest ??
				pluginManager.getPluginRecord(candidateId)?.manifest ?? {
					id: candidateId,
					name: foundDynTab.label || candidateId,
					version: "1.0.0",
					description: "",
					author: "",
					category: "custom" as const,
				};
			currentView = (
				<DynamicTabRenderer
					key={foundDynTab.id}
					render={foundDynTab.render}
					manifest={targetManifest}
					tabId={foundDynTab.id}
					tabLabel={foundDynTab.label}
					tabIcon={foundDynTab.icon}
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
