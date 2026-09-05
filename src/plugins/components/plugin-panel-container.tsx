"use client";

import React, { type ReactNode } from "react";
import { usePluginStore } from "../plugin-store";
import { Settings01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { PluginManifest } from "../types";

export interface PluginPanelContainerProps {
	/**
	 * Manifest of the plugin (used for automatic settings linkage and metadata)
	 */
	plugin: PluginManifest;
	/**
	 * Display title for the panel header
	 */
	title?: string;
	/**
	 * Optional icon (emoji, Lucide icon or HugeiconsIcon)
	 */
	icon?: ReactNode;
	/**
	 * Optional badge text (e.g. "API CONNECTED", "BETA", or category name)
	 */
	badge?: ReactNode;
	/**
	 * Additional header action buttons (displayed before the gear icon)
	 */
	headerActions?: ReactNode;
	/**
	 * Optional fixed sub-header slot (e.g. search bars, filter chips, segmented controls)
	 */
	subHeader?: ReactNode;
	/**
	 * Main scrollable or structured content
	 */
	children: ReactNode;
	/**
	 * Additional CSS class names for the root container
	 */
	className?: string;
	/**
	 * Additional CSS class names for the body content container
	 */
	contentClassName?: string;
}

/**
 * Standardized host container for plugin runtime interfaces.
 * Provides unified design tokens, automatic header alignment, and auto-injected settings shortcut.
 */
export function PluginPanelContainer({
	plugin,
	title = plugin.name,
	icon,
	badge,
	headerActions,
	subHeader,
	children,
	className = "",
	contentClassName = "",
}: PluginPanelContainerProps) {
	const openPluginSettings = usePluginStore((s) => s.openPluginSettings);
	const hasConfig = Boolean(plugin.configSchema && plugin.configSchema.length > 0);

	return (
		<div
			className={`flex flex-col h-full bg-background select-none text-foreground font-sans overflow-hidden ${className}`}
		>
			{/* Unified Host Panel Header */}
			<header className="px-3.5 py-2.5 border-b border-border/50 flex items-center justify-between bg-card/30 shrink-0 backdrop-blur-sm gap-2">
				<div className="flex items-center gap-2 min-w-0 flex-1">
					{icon && <span className="text-base shrink-0 leading-none">{icon}</span>}
					<h3 className="text-xs font-bold truncate text-foreground tracking-tight">
						{title}
					</h3>
					{badge && (
						<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono font-medium shrink-0 leading-none">
							{badge}
						</span>
					)}
				</div>

				{/* Header Actions: Plugin extra actions + Auto-injected Settings gear */}
				<div className="flex items-center gap-1 shrink-0">
					{headerActions}

					{hasConfig && (
						<button
							type="button"
							title="打开插件参数设置"
							aria-label="打开插件参数设置"
							onClick={() => openPluginSettings(plugin.id)}
							className="size-7 rounded-lg hover:bg-accent/60 active:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						>
							<HugeiconsIcon icon={Settings01Icon} className="size-3.5" />
						</button>
					)}
				</div>
			</header>

			{/* Optional Sub-Header for Search / Filter Bars */}
			{subHeader && (
				<div className="border-b border-border/40 p-3 space-y-2.5 bg-card/20 shrink-0">
					{subHeader}
				</div>
			)}

			{/* Main Content Area */}
			<div
				className={`flex-1 min-h-0 overflow-y-auto ${contentClassName || "p-3 space-y-3"}`}
			>
				{children}
			</div>
		</div>
	);
}
