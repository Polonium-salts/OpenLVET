"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useSoundSearch } from "@/sounds/use-sound-search";
import { useSoundsStore } from "@/sounds/sounds-store";
import type { SavedSound, SoundEffect } from "@/sounds/types";
import { cn } from "@/utils/ui";
import {
	FavouriteIcon,
	FilterMailIcon,
	PauseIcon,
	PlayIcon,
	PlusSignIcon,
	MusicNote03Icon,
	Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { BUILTIN_MUSIC_TRACKS, type BuiltinSound } from "@/sounds/sounds-data";

export function SoundsView() {
	return (
		<div className="flex h-full flex-col bg-background">
			<Tabs defaultValue="music" className="flex h-full flex-col">
				<div className="px-3 pt-3 pb-0">
					<TabsList className="grid w-full grid-cols-3 bg-muted/60">
						<TabsTrigger value="music" className="text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-medium">
							🎵 音乐库
						</TabsTrigger>
						<TabsTrigger value="sound-effects" className="text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-medium">
							🔔 音效库
						</TabsTrigger>
						<TabsTrigger value="saved" className="text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-medium">
							❤️ 已收藏
						</TabsTrigger>
					</TabsList>
				</div>
				<Separator className="my-3" />
				<TabsContent
					value="music"
					className="mt-0 flex min-h-0 flex-1 flex-col p-4 pt-0"
				>
					<MusicLibraryView />
				</TabsContent>
				<TabsContent
					value="sound-effects"
					className="mt-0 flex min-h-0 flex-1 flex-col p-4 pt-0"
				>
					<SoundEffectsView />
				</TabsContent>
				<TabsContent
					value="saved"
					className="mt-0 flex min-h-0 flex-1 flex-col p-4 pt-0"
				>
					<SavedSoundsView />
				</TabsContent>
			</Tabs>
		</div>
	);
}

const MUSIC_CATEGORIES = [
	{ id: "all", label: "全部" },
	{ id: "vlog", label: "流行Vlog" },
	{ id: "piano", label: "治愈钢琴" },
	{ id: "lofi", label: "Lofi节奏" },
	{ id: "electronic", label: "科技电音" },
	{ id: "epic", label: "史诗交响" },
	{ id: "traditional", label: "国风古韵" },
	{ id: "jazz", label: "复古爵士" },
];

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function MusicLibraryView() {
	const [activeCategory, setActiveCategory] = useState("all");
	const [searchKeyword, setSearchKeyword] = useState("");
	const [playingId, setPlayingId] = useState<number | null>(null);
	const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

	const { addSoundToTimeline, isSoundSaved, toggleSavedSound } = useSoundsStore();

	const filteredMusic = useMemo(() => {
		let list = [...BUILTIN_MUSIC_TRACKS];
		if (activeCategory !== "all") {
			list = list.filter((m) => m.category === activeCategory);
		}
		if (searchKeyword.trim()) {
			const q = searchKeyword.toLowerCase().trim();
			list = list.filter(
				(m) =>
					m.name.toLowerCase().includes(q) ||
					m.description.toLowerCase().includes(q) ||
					(m.artist && m.artist.toLowerCase().includes(q)) ||
					m.tags.some((t) => t.toLowerCase().includes(q)),
			);
		}
		return list;
	}, [activeCategory, searchKeyword]);

	const handlePlayToggle = (track: BuiltinSound) => {
		if (playingId === track.id) {
			audioElement?.pause();
			setPlayingId(null);
			return;
		}

		if (audioElement) {
			audioElement.pause();
		}

		const audio = new Audio(track.previewUrl || track.downloadUrl);
		audio.play().catch(console.error);
		audio.onended = () => setPlayingId(null);
		setAudioElement(audio);
		setPlayingId(track.id);
	};

	useEffect(() => {
		return () => {
			if (audioElement) {
				audioElement.pause();
			}
		};
	}, [audioElement]);

	return (
		<div className="flex h-full flex-col gap-3">
			{/* Search Bar */}
			<div className="relative">
				<HugeiconsIcon
					icon={Search01Icon}
					className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
				/>
				<Input
					value={searchKeyword}
					onChange={(e) => setSearchKeyword(e.target.value)}
					placeholder="搜索配乐、情绪、曲风（如: 治愈、Vlog、科技）..."
					className="h-8.5 pl-9 pr-3 text-xs bg-muted/40"
				/>
			</div>

			{/* Category Filter Chips */}
			<div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
				{MUSIC_CATEGORIES.map((cat) => (
					<button
						key={cat.id}
						onClick={() => setActiveCategory(cat.id)}
						className={cn(
							"whitespace-nowrap px-2.5 py-1 rounded-full text-xs transition-colors shrink-0",
							activeCategory === cat.id
								? "bg-primary text-primary-foreground font-medium shadow-xs"
								: "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
						)}
					>
						{cat.label}
					</button>
				))}
			</div>

			{/* Music Tracks List */}
			<ScrollArea className="h-full flex-1 pr-2">
				<div className="flex flex-col gap-2.5 pb-4">
					{filteredMusic.map((track) => {
						const isPlaying = playingId === track.id;
						const isSaved = isSoundSaved({ soundId: track.id });
						const soundEffectItem: SoundEffect = {
							id: track.id,
							name: track.name,
							description: track.description,
							url: track.url,
							previewUrl: track.previewUrl,
							downloadUrl: track.downloadUrl,
							duration: track.duration,
							filesize: track.filesize,
							type: track.type,
							channels: track.channels,
							bitrate: track.bitrate,
							bitdepth: track.bitdepth,
							samplerate: track.samplerate,
							username: track.artist || track.username,
							tags: track.tags,
							license: track.license,
							created: track.created,
							downloads: track.downloads,
							rating: track.rating,
							ratingCount: track.ratingCount,
						};

						return (
							<div
								key={track.id}
								className={cn(
									"group relative flex items-center justify-between p-2.5 rounded-lg border transition-all",
									isPlaying
										? "border-primary/50 bg-primary/10 shadow-xs"
										: "border-border/50 bg-card/60 hover:bg-muted/50 hover:border-border",
								)}
							>
								{/* Left: Play button & Track Info */}
								<div
									className="flex min-w-0 flex-1 items-center gap-3 cursor-pointer"
									onClick={() => handlePlayToggle(track)}
								>
									{/* Disc / Play Icon */}
									<div
										className={cn(
											"relative flex size-10 shrink-0 items-center justify-center rounded-lg transition-all",
											isPlaying
												? "bg-primary text-primary-foreground shadow-md scale-105"
												: "bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400 group-hover:bg-primary/20",
										)}
									>
										{isPlaying ? (
											<HugeiconsIcon icon={PauseIcon} className="size-4 animate-pulse" />
										) : (
											<HugeiconsIcon icon={PlayIcon} className="size-4 ml-0.5" />
										)}
									</div>

									{/* Meta */}
									<div className="min-w-0 flex-1">
										<p className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
											{track.name}
										</p>
										<div className="flex items-center gap-2 mt-0.5">
											<span className="text-[11px] text-muted-foreground truncate">
												{track.artist || track.username}
											</span>
											<span className="text-[10px] text-muted-foreground/60">·</span>
											<span className="text-[10px] font-mono text-muted-foreground bg-muted/80 px-1.5 py-0.2 rounded">
												{formatTime(track.duration)}
											</span>
										</div>
									</div>
								</div>

								{/* Right Action buttons */}
								<div className="flex items-center gap-1.5 pl-2 shrink-0">
									<Button
										variant="ghost"
										size="icon"
										className="size-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
										onClick={async (e) => {
											e.stopPropagation();
											await addSoundToTimeline({ sound: soundEffectItem });
										}}
										title="添加配乐到时间线"
									>
										<HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className={cn(
											"size-7",
											isSaved
												? "text-red-500 hover:text-red-600"
												: "text-muted-foreground hover:text-foreground",
										)}
										onClick={(e) => {
											e.stopPropagation();
											toggleSavedSound({ soundEffect: soundEffectItem });
										}}
										title={isSaved ? "取消收藏" : "收藏配乐"}
									>
										<HugeiconsIcon
											icon={FavouriteIcon}
											className={cn("size-3.5", isSaved && "fill-current")}
										/>
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			</ScrollArea>
		</div>
	);
}

function SoundEffectsView() {
	const {
		topSoundEffects,
		isLoading,
		searchQuery,
		setSearchQuery,
		scrollPosition,
		setScrollPosition,
		loadSavedSounds,
		showCommercialOnly,
		toggleCommercialFilter,
		hasLoaded,
		setTopSoundEffects,
		setLoading,
		setError,
		setHasLoaded,
		setCurrentPage,
		setHasNextPage,
		setTotalCount,
	} = useSoundsStore();
	const {
		results: searchResults,
		isLoading: isSearching,
		loadMore,
		hasNextPage,
		isLoadingMore,
	} = useSoundSearch({
		query: searchQuery,
		commercialOnly: showCommercialOnly,
	});

	const [playingId, setPlayingId] = useState<number | null>(null);
	const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
		null,
	);

	const { scrollAreaRef, handleScroll } = useInfiniteScroll({
		onLoadMore: loadMore,
		hasMore: hasNextPage,
		isLoading: isLoadingMore || isSearching,
	});

	useEffect(() => {
		loadSavedSounds();
	}, [loadSavedSounds]);

	useEffect(() => {
		if (hasLoaded) {
			return;
		}

		let shouldIgnore = false;

		const fetchTopSounds = async () => {
			try {
				if (!shouldIgnore) {
					setLoading({ loading: true });
					setError({ error: null });
				}

				const response = await fetch(
					"/api/sounds/search?page_size=50&sort=downloads&type=effects",
				);

				if (!shouldIgnore) {
					if (!response.ok) {
						throw new Error(`Failed to fetch: ${response.status}`);
					}

					const data = await response.json();
					setTopSoundEffects({ sounds: data.results });
					setHasLoaded({ loaded: true });

					setCurrentPage({ page: 1 });
					setHasNextPage({ hasNext: !!data.next });
					setTotalCount({ count: data.count });
				}
			} catch (error) {
				if (!shouldIgnore) {
					console.error("Failed to fetch top sounds:", error);
					setError({
						error:
							error instanceof Error ? error.message : "Failed to load sounds",
					});
				}
			} finally {
				if (!shouldIgnore) {
					setLoading({ loading: false });
				}
			}
		};

		const timeoutId = setTimeout(fetchTopSounds, 100, {});

		return () => {
			shouldIgnore = true;
			clearTimeout(timeoutId);
		};
	}, [
		hasLoaded,
		setTopSoundEffects,
		setLoading,
		setError,
		setHasLoaded,
		setCurrentPage,
		setHasNextPage,
		setTotalCount,
	]);

	const playSound = ({ sound }: { sound: SoundEffect }) => {
		if (playingId === sound.id) {
			audioElement?.pause();
			setPlayingId(null);
			return;
		}

		if (audioElement) {
			audioElement.pause();
		}

		const previewUrl = sound.previewUrl || sound.downloadUrl;
		if (!previewUrl) return;

		const audio = new Audio(previewUrl);
		audio.play().catch(console.error);
		audio.onended = () => {
			setPlayingId(null);
		};
		setAudioElement(audio);
		setPlayingId(sound.id);
	};

	const soundsToDisplay = searchQuery ? searchResults : topSoundEffects;

	return (
		<div className="flex h-full flex-col gap-3">
			<div className="flex items-center gap-2">
				<div className="relative flex-1">
					<HugeiconsIcon
						icon={Search01Icon}
						className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
					/>
					<Input
						value={searchQuery}
						onChange={(e) => setSearchQuery({ query: e.target.value })}
						placeholder="搜索音效（如: 转场、按键、重低音、快门）..."
						className="h-8.5 pl-9 pr-3 text-xs bg-muted/40"
					/>
				</div>
			</div>

			<ScrollArea
				className="h-full flex-1 pr-2"
				ref={scrollAreaRef}
				onScrollCapture={handleScroll}
			>
				<div className="flex flex-col gap-2.5 pb-4">
					{soundsToDisplay.map((sound) => (
						<AudioItem
							key={sound.id}
							sound={sound}
							isPlaying={playingId === sound.id}
							onPlay={playSound}
						/>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}

function SavedSoundsView() {
	const { savedSounds, loadSavedSounds, clearSavedSounds } = useSoundsStore();
	const [playingId, setPlayingId] = useState<number | null>(null);
	const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
		null,
	);
	const [showClearDialog, setShowClearDialog] = useState(false);

	useEffect(() => {
		loadSavedSounds();
	}, [loadSavedSounds]);

	const convertToSoundEffect = ({
		savedSound,
	}: {
		savedSound: SavedSound;
	}): SoundEffect => ({
		id: savedSound.id,
		name: savedSound.name,
		description: savedSound.description,
		url: savedSound.url,
		previewUrl: savedSound.previewUrl,
		downloadUrl: savedSound.downloadUrl,
		duration: savedSound.duration,
		filesize: savedSound.filesize,
		type: savedSound.type,
		channels: savedSound.channels,
		bitrate: savedSound.bitrate,
		bitdepth: savedSound.bitdepth,
		samplerate: savedSound.samplerate,
		username: savedSound.username,
		tags: savedSound.tags,
		license: savedSound.license,
		created: savedSound.created,
		downloads: savedSound.downloads,
		rating: savedSound.rating,
		ratingCount: savedSound.ratingCount,
	});

	const playSound = ({ sound }: { sound: SoundEffect }) => {
		if (playingId === sound.id) {
			audioElement?.pause();
			setPlayingId(null);
			return;
		}

		if (audioElement) {
			audioElement.pause();
		}

		const previewUrl = sound.previewUrl || sound.downloadUrl;
		if (!previewUrl) return;

		const audio = new Audio(previewUrl);
		audio.play().catch(console.error);
		audio.onended = () => {
			setPlayingId(null);
		};
		setAudioElement(audio);
		setPlayingId(sound.id);
	};

	if (savedSounds.length === 0) {
		return (
			<div className="bg-background flex h-full flex-col items-center justify-center gap-3 p-4">
				<HugeiconsIcon
					icon={FavouriteIcon}
					className="text-muted-foreground size-10"
				/>
				<div className="flex flex-col gap-1 text-center">
					<p className="text-sm font-medium">暂无收藏音频</p>
					<p className="text-muted-foreground text-xs">
						点击音乐或音效右侧的爱心图标，即可保存到此列表
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col gap-3">
			<div className="flex items-center justify-between">
				<p className="text-muted-foreground text-xs">
					已收藏 {savedSounds.length} 个音频
				</p>
				<Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
					<DialogTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="text-muted-foreground hover:text-destructive text-xs h-7 px-2"
						>
							清空全部
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>清空所有收藏音频？</DialogTitle>
							<DialogDescription>
								此操作将永久移除您收藏的全部 {savedSounds.length} 个音频，无法撤销。
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button variant="ghost" onClick={() => setShowClearDialog(false)}>
								取消
							</Button>
							<Button
								variant="destructive"
								onClick={async (e) => {
									e.stopPropagation();
									await clearSavedSounds();
									setShowClearDialog(false);
								}}
							>
								确认清空
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<ScrollArea className="h-full flex-1 pr-2">
				<div className="flex flex-col gap-2.5 pb-4">
					{savedSounds.map((sound) => (
						<AudioItem
							key={sound.id}
							sound={convertToSoundEffect({ savedSound: sound })}
							isPlaying={playingId === sound.id}
							onPlay={playSound}
						/>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}

interface AudioItemProps {
	sound: SoundEffect;
	isPlaying: boolean;
	onPlay: ({ sound }: { sound: SoundEffect }) => void;
}

function AudioItem({ sound, isPlaying, onPlay }: AudioItemProps) {
	const { addSoundToTimeline, isSoundSaved, toggleSavedSound } =
		useSoundsStore();
	const isSaved = isSoundSaved({ soundId: sound.id });

	return (
		<div
			className={cn(
				"group relative flex items-center justify-between p-2 rounded-lg border transition-all",
				isPlaying
					? "border-primary/50 bg-primary/10 shadow-xs"
					: "border-border/40 bg-card/50 hover:bg-muted/50 hover:border-border",
			)}
		>
			<button
				type="button"
				className="flex min-w-0 flex-1 items-center gap-2.5 text-left cursor-pointer"
				onClick={() => onPlay({ sound })}
			>
				<div
					className={cn(
						"relative flex size-8.5 shrink-0 items-center justify-center rounded-md transition-all",
						isPlaying
							? "bg-primary text-primary-foreground shadow-sm"
							: "bg-muted text-foreground/80 group-hover:bg-primary/20 group-hover:text-primary",
					)}
				>
					{isPlaying ? (
						<HugeiconsIcon icon={PauseIcon} className="size-3.5 animate-pulse" />
					) : (
						<HugeiconsIcon icon={PlayIcon} className="size-3.5 ml-0.5" />
					)}
				</div>

				<div className="min-w-0 flex-1">
					<p className="truncate text-xs font-medium text-foreground group-hover:text-primary transition-colors">
						{sound.name}
					</p>
					<span className="text-[10px] text-muted-foreground block truncate">
						{sound.username} · {sound.duration.toFixed(1)}s
					</span>
				</div>
			</button>

			<div className="flex items-center gap-1 pl-2 shrink-0">
				<Button
					variant="ghost"
					size="icon"
					className="size-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
					onClick={async (e) => {
						e.stopPropagation();
						await addSoundToTimeline({ sound });
					}}
					title="添加到时间线"
				>
					<HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className={cn(
						"size-7",
						isSaved
							? "text-red-500 hover:text-red-600"
							: "text-muted-foreground hover:text-foreground",
					)}
					onClick={(e) => {
						e.stopPropagation();
						toggleSavedSound({ soundEffect: sound });
					}}
					title={isSaved ? "取消收藏" : "收藏音效"}
				>
					<HugeiconsIcon
						icon={FavouriteIcon}
						className={cn("size-3.5", isSaved && "fill-current")}
					/>
				</Button>
			</div>
		</div>
	);
}
