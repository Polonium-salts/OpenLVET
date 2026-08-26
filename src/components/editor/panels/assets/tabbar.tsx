"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/ui";
import {
	TAB_KEYS,
	tabs,
	useAssetsPanelStore,
} from "@/components/editor/panels/assets/assets-panel-store";

export function TabBar() {
	const { activeTab, setActiveTab } = useAssetsPanelStore();
	const [showTopFade, setShowTopFade] = useState(false);
	const [showBottomFade, setShowBottomFade] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	const checkScrollPosition = useCallback(() => {
		const element = scrollRef.current;
		if (!element) return;

		const { scrollTop, scrollHeight, clientHeight } = element;
		setShowTopFade(scrollTop > 0);
		setShowBottomFade(scrollTop < scrollHeight - clientHeight - 1);
	}, []);

	useEffect(() => {
		const element = scrollRef.current;
		if (!element) return;

		checkScrollPosition();
		element.addEventListener("scroll", checkScrollPosition);

		const resizeObserver = new ResizeObserver(checkScrollPosition);
		resizeObserver.observe(element);

		return () => {
			element.removeEventListener("scroll", checkScrollPosition);
			resizeObserver.disconnect();
		};
	}, [checkScrollPosition]);

	return (
		<div className="relative flex w-[58px] shrink-0 bg-background/95 border-r border-border/40 select-none">
			<div
				ref={scrollRef}
				className="scrollbar-hidden relative flex size-full py-2 px-1 flex-col items-center justify-start gap-1.5 overflow-y-auto"
			>
				{TAB_KEYS.map((tabKey) => {
					const tab = tabs[tabKey];
					const isActive = activeTab === tabKey;
					return (
						<button
							key={tabKey}
							type="button"
							aria-label={tab.label}
							onClick={() => setActiveTab(tabKey)}
							className={cn(
								"group relative flex w-full flex-col items-center justify-center gap-1 rounded-md py-2 px-1 text-center transition-all duration-150",
								isActive
									? "bg-accent/80 text-primary font-medium shadow-xs"
									: "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
							)}
						>
							{isActive && (
								<div className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
							)}
							<div
								className={cn(
									"flex size-5 items-center justify-center transition-transform group-hover:scale-105",
									isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
								)}
							>
								<tab.icon />
							</div>
							<span
								className={cn(
									"text-[11px] leading-tight tracking-tight",
									isActive ? "text-primary font-semibold" : "text-muted-foreground group-hover:text-foreground",
								)}
							>
								{tab.label}
							</span>
						</button>
					);
				})}
			</div>

			<FadeOverlay direction="top" show={showTopFade} />
			<FadeOverlay direction="bottom" show={showBottomFade} />
		</div>
	);
}

function FadeOverlay({
	direction,
	show,
}: {
	direction: "top" | "bottom";
	show: boolean;
}) {
	return (
		<div
			className={cn(
				"pointer-events-none absolute right-0 left-0 h-6",
				direction === "top" && show
					? "from-background top-0 bg-linear-to-b to-transparent"
					: "from-background bottom-0 bg-linear-to-t to-transparent",
			)}
		/>
	);
}
