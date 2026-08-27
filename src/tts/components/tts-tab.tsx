"use client";

import { useEffect, useMemo, useState } from "react";
import type { TextElement } from "@/timeline";
import { useEditor } from "@/editor/use-editor";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { TTS_VOICES, VOICE_CATEGORIES } from "@/tts/voices";
import type { TTSProsody, TTSVoice, VoiceCategory } from "@/tts/types";
import {
	generateSpeechAudio,
	insertSpeechToTimeline,
	playSpeechPreview,
	stopSpeechPreview,
} from "@/tts/tts-service";
import { toast } from "sonner";
import { cn } from "@/utils/ui";
import {
	AudioWave01Icon,
	HeadphonesIcon,
	Mic01Icon,
	PauseIcon,
	PlayIcon,
	PlusSignIcon,
	VoiceIcon,
	Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	Section,
	SectionContent,
	SectionHeader,
	SectionTitle,
} from "@/components/section";

export function TtsTab({
	element,
	trackId,
}: {
	element: TextElement;
	trackId: string;
}) {
	const editor = useEditor();

	const [selectedCategory, setSelectedCategory] = useState<VoiceCategory>("hot");
	const [selectedVoiceId, setSelectedVoiceId] = useState<string>("zh-CN-XiaoxiaoNeural");
	const initialContent = typeof element.params.content === "string" ? element.params.content : String(element.params.content || "");
	const [customText, setCustomText] = useState<string>(initialContent);
	const [syncDuration, setSyncDuration] = useState<boolean>(true);

	const [prosody, setProsody] = useState<TTSProsody>({
		rate: 1.0,
		pitch: 0,
		volume: 100,
	});

	const [isPlayingSample, setIsPlayingSample] = useState<string | null>(null);
	const [isPreviewingCustom, setIsPreviewingCustom] = useState<boolean>(false);
	const [isGenerating, setIsGenerating] = useState<boolean>(false);

	// Sync custom text if element.params.content changes
	useEffect(() => {
		if (element.params.content !== undefined) {
			const str = typeof element.params.content === "string" ? element.params.content : String(element.params.content || "");
			setCustomText(str);
		}
	}, [element.params.content]);

	// Cleanup audio preview on unmount
	useEffect(() => {
		return () => {
			stopSpeechPreview();
		};
	}, []);

	const selectedVoice = useMemo(() => {
		return (
			TTS_VOICES.find((v) => v.id === selectedVoiceId) ||
			TTS_VOICES[0]
		);
	}, [selectedVoiceId]);

	const filteredVoices = useMemo(() => {
		return TTS_VOICES.filter((v) => v.category === selectedCategory);
	}, [selectedCategory]);

	// Play voice demo sample
	const handlePlaySample = async (voice: TTSVoice, e: React.MouseEvent) => {
		e.stopPropagation();

		if (isPlayingSample === voice.id) {
			stopSpeechPreview();
			setIsPlayingSample(null);
			return;
		}

		stopSpeechPreview();
		setIsPlayingSample(voice.id);

		try {
			const sample = voice.sampleText || `你好，我是${voice.name}，很高兴为您配音。`;
			const { blob } = await generateSpeechAudio({
				text: sample,
				voice,
				prosody: { rate: 1.0, pitch: 0, volume: 100 },
			});

			await playSpeechPreview({
				blob,
				onEnded: () => {
					setIsPlayingSample(null);
				},
			});
		} catch (error) {
			console.error("Failed to play sample:", error);
			toast.error("音色试听失败");
			setIsPlayingSample(null);
		}
	};

	// Preview current text with selected prosody
	const handlePreviewCustomText = async () => {
		const text = customText.trim();
		if (!text) {
			toast.error("朗读文本内容不能为空");
			return;
		}

		if (isPreviewingCustom) {
			stopSpeechPreview();
			setIsPreviewingCustom(false);
			return;
		}

		stopSpeechPreview();
		setIsPreviewingCustom(true);
		const toastId = toast.loading(`正在合成「${selectedVoice.name}」试听语音...`);

		try {
			const { blob } = await generateSpeechAudio({
				text,
				voice: selectedVoice,
				prosody,
			});

			toast.dismiss(toastId);

			await playSpeechPreview({
				blob,
				onEnded: () => {
					setIsPreviewingCustom(false);
				},
			});
		} catch (error) {
			console.error("Preview custom text error:", error);
			toast.error(error instanceof Error ? error.message : "试听合成失败", { id: toastId });
			setIsPreviewingCustom(false);
		}
	};

	// Generate and insert into timeline
	const handleInsertToTimeline = async () => {
		const text = customText.trim();
		if (!text) {
			toast.error("朗读文本内容不能为空");
			return;
		}

		setIsGenerating(true);
		stopSpeechPreview();
		setIsPreviewingCustom(false);

		// If user edited text in box, also update element.params.content
		if (customText !== String(element.params.content || "")) {
			editor.timeline.updateElements({
				updates: [
					{
						trackId,
						elementId: element.id,
						patch: {
							params: {
								...element.params,
								content: customText,
							},
						},
					},
				],
			});
		}

		await insertSpeechToTimeline({
			editor,
			textElement: {
				...element,
				params: {
					...element.params,
					content: customText,
				},
			},
			voice: selectedVoice,
			prosody,
			syncDuration,
		});

		setIsGenerating(false);
	};

	return (
		<div className="flex flex-col gap-3 p-3 text-xs">
			{/* Top Header Banner */}
			<div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/10 border border-primary/20">
				<div className="flex items-center gap-2">
					<div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
						<HugeiconsIcon icon={Mic01Icon} className="size-4.5" />
					</div>
					<div className="flex flex-col">
						<span className="font-semibold text-xs text-foreground">微软 Edge 语音朗读</span>
						<span className="text-[10px] text-muted-foreground">神经网络高保真 · 实时语音合成</span>
					</div>
				</div>
				<span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
					免 Key 免费使用
				</span>
			</div>

			{/* Section: Text Content Preview & Quick Edit */}
			<Section>
				<SectionHeader>
					<SectionTitle className="text-xs flex items-center gap-1.5">
						<HugeiconsIcon icon={VoiceIcon} className="size-3.5 text-primary" />
						朗读文本内容
					</SectionTitle>
				</SectionHeader>
				<SectionContent className="pt-2">
					<textarea
						value={customText}
						onChange={(e) => setCustomText(e.target.value)}
						placeholder="输入需要朗读的文本内容..."
						rows={3}
						className="w-full resize-none rounded-md border border-input bg-background/50 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
					/>
					<div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
						<span>字数: {customText.length} 字</span>
						<button
							onClick={() => setCustomText(String(element.params.content || ""))}
							className="hover:text-primary transition-colors underline"
						>
							重置为当前字幕
						</button>
					</div>
				</SectionContent>
			</Section>

			{/* Section: Voice Selection */}
			<Section>
				<SectionHeader>
					<SectionTitle className="text-xs flex items-center gap-1.5">
						<HugeiconsIcon icon={HeadphonesIcon} className="size-3.5 text-primary" />
						音色选择 ({selectedVoice.name})
					</SectionTitle>
				</SectionHeader>
				<SectionContent className="pt-2 flex flex-col gap-2">
					{/* Category Tabs */}
					<div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
						{VOICE_CATEGORIES.map((cat) => (
							<button
								key={cat.id}
								onClick={() => setSelectedCategory(cat.id)}
								className={cn(
									"px-2 py-1 rounded-md text-[11px] whitespace-nowrap transition-all border",
									selectedCategory === cat.id
										? "bg-primary text-primary-foreground border-primary font-medium shadow-xs"
										: "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground",
								)}
							>
								{cat.label}
							</button>
						))}
					</div>

					{/* Voices Grid */}
					<div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
						{filteredVoices.map((voice) => {
							const isSelected = voice.id === selectedVoiceId;
							const isPlaying = isPlayingSample === voice.id;

							return (
								<div
									key={voice.id}
									onClick={() => setSelectedVoiceId(voice.id)}
									className={cn(
										"group relative flex flex-col justify-between p-2 rounded-lg border cursor-pointer transition-all",
										isSelected
											? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/40"
											: "bg-card border-border/50 hover:border-primary/40 hover:bg-muted/30",
									)}
								>
									<div className="flex items-start justify-between gap-1">
										<div className="flex items-center gap-1.5 min-w-0">
											<div
												className={cn(
													"size-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
													voice.gender === "Female"
														? "bg-pink-500/15 text-pink-500"
														: "bg-blue-500/15 text-blue-500",
												)}
											>
												{voice.name.slice(0, 1)}
											</div>
											<span className="font-semibold text-xs truncate text-foreground">
												{voice.name}
											</span>
										</div>

										<button
											onClick={(e) => handlePlaySample(voice, e)}
											className={cn(
												"size-5 rounded-full flex items-center justify-center transition-colors shrink-0",
												isPlaying
													? "bg-primary text-primary-foreground animate-pulse"
													: "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary",
											)}
											title="试听音色"
										>
											<HugeiconsIcon
												icon={isPlaying ? PauseIcon : PlayIcon}
												className="size-3"
											/>
										</button>
									</div>

									<p className="text-[10px] text-muted-foreground mt-1 line-clamp-1 leading-tight">
										{voice.description}
									</p>

									<div className="flex items-center gap-1 mt-1.5 flex-wrap">
										{voice.tags.slice(0, 2).map((t) => (
											<span
												key={t}
												className="text-[9px] px-1 py-0.2 rounded bg-muted/70 text-muted-foreground"
											>
												{t}
											</span>
										))}
									</div>
								</div>
							);
						})}
					</div>
				</SectionContent>
			</Section>

			{/* Section: Prosody Controls */}
			<Section>
				<SectionHeader>
					<SectionTitle className="text-xs flex items-center gap-1.5">
						<HugeiconsIcon icon={AudioWave01Icon} className="size-3.5 text-primary" />
						语速与音调调节
					</SectionTitle>
				</SectionHeader>
				<SectionContent className="pt-2 flex flex-col gap-3">
					{/* Rate (Speed) */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">语速 (Speed)</span>
							<span className="font-mono font-medium text-primary">
								{prosody.rate.toFixed(2)}x
							</span>
						</div>
						<Slider
							value={[prosody.rate]}
							min={0.5}
							max={2.0}
							step={0.05}
							onValueChange={([val]) => setProsody((p) => ({ ...p, rate: val }))}
						/>
						<div className="flex justify-between text-[9px] text-muted-foreground">
							<span>0.5x 较慢</span>
							<span>1.0x 正常</span>
							<span>2.0x 较快</span>
						</div>
					</div>

					{/* Pitch */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">音调 (Pitch)</span>
							<span className="font-mono font-medium text-primary">
								{prosody.pitch >= 0 ? `+${prosody.pitch}` : prosody.pitch}Hz
							</span>
						</div>
						<Slider
							value={[prosody.pitch]}
							min={-50}
							max={50}
							step={1}
							onValueChange={([val]) => setProsody((p) => ({ ...p, pitch: val }))}
						/>
						<div className="flex justify-between text-[9px] text-muted-foreground">
							<span>-50Hz 低沉</span>
							<span>0Hz 正常</span>
							<span>+50Hz 高亢</span>
						</div>
					</div>

					{/* Volume */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">音量 (Volume)</span>
							<span className="font-mono font-medium text-primary">
								{prosody.volume}%
							</span>
						</div>
						<Slider
							value={[prosody.volume]}
							min={0}
							max={100}
							step={1}
							onValueChange={([val]) => setProsody((p) => ({ ...p, volume: val }))}
						/>
					</div>

					{/* Sync Duration Switch */}
					<div className="flex items-center justify-between pt-2 border-t border-border/40">
						<div className="flex flex-col">
							<span className="text-xs font-medium text-foreground">自动同步文本时长</span>
							<span className="text-[10px] text-muted-foreground">
								生成后自动调整文本轨道时长与音频对齐
							</span>
						</div>
						<Switch
							checked={syncDuration}
							onCheckedChange={setSyncDuration}
						/>
					</div>
				</SectionContent>
			</Section>

			{/* Bottom Actions */}
			<div className="flex items-center gap-2 pt-1">
				<Button
					variant="outline"
					size="sm"
					className="flex-1 text-xs gap-1.5"
					onClick={handlePreviewCustomText}
					disabled={isGenerating || !customText.trim()}
				>
					<HugeiconsIcon
						icon={isPreviewingCustom ? PauseIcon : PlayIcon}
						className="size-3.5 text-primary"
					/>
					{isPreviewingCustom ? "停止试听" : "试听朗读"}
				</Button>

				<Button
					size="sm"
					className="flex-1 text-xs gap-1.5 shadow-sm"
					onClick={handleInsertToTimeline}
					disabled={isGenerating || !customText.trim()}
				>
					{isGenerating ? (
						<>
							<HugeiconsIcon icon={Loading03Icon} className="size-3.5 animate-spin" />
							合成中...
						</>
					) : (
						<>
							<HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
							生成并插入时间线
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
