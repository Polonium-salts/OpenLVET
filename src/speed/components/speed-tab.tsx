import { useRef } from "react";
import { useEditor } from "@/editor/use-editor";
import { NumberField } from "@/components/ui/number-field";
import { Switch } from "@/components/ui/switch";
import { HugeiconsIcon } from "@hugeicons/react";
import { DashboardSpeed02Icon } from "@hugeicons/core-free-icons";
import { buildConstantRetime } from "@/retime";
import {
	DEFAULT_RETIME_RATE,
	MIN_RETIME_RATE,
	MAX_RETIME_RATE,
	clampRetimeRate,
	canMaintainPitch,
} from "@/retime/rate";
import type { AudioElement, VideoElement } from "@/timeline";
import {
	Section,
	SectionContent,
	SectionField,
	SectionFields,
	SectionHeader,
	SectionTitle,
} from "@/components/section";
import { usePropertyDraft } from "@/components/editor/panels/properties/hooks/use-property-draft";
import {
	formatNumberForDisplay,
	getFractionDigitsForStep,
	snapToStep,
} from "@/utils/math";

const SPEED_STEP = 0.01;
const SPEED_FRACTION_DIGITS = getFractionDigitsForStep({ step: SPEED_STEP });

function rateToDisplay({ rate }: { rate: number }): string {
	return formatNumberForDisplay({
		value: rate,
		fractionDigits: SPEED_FRACTION_DIGITS,
	});
}

function parseSpeedInput({ input }: { input: string }): number | null {
	const parsed = parseFloat(input);
	if (Number.isNaN(parsed)) return null;
	return clampRetimeRate({
		rate: snapToStep({ value: parsed, step: SPEED_STEP }),
	});
}

function buildRetime({
	rate,
	maintainPitch,
}: {
	rate: number;
	maintainPitch: boolean;
}) {
	if (rate === DEFAULT_RETIME_RATE && !maintainPitch) return undefined;
	return buildConstantRetime({ rate, maintainPitch });
}

import { Slider } from "@/components/ui/slider";
import { cn } from "@/utils/ui";

const SPEED_PRESETS = [0.2, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 5.0];

export function SpeedTab({
	element,
	trackId,
}: {
	element: AudioElement | VideoElement;
	trackId: string;
}) {
	const editor = useEditor();
	const rate = clampRetimeRate({
		rate: element.retime?.rate ?? DEFAULT_RETIME_RATE,
	});
	const isPitchPreserveAvailable = canMaintainPitch({ rate });
	const maintainPitch = element.retime?.maintainPitch ?? false;
	const pendingRateRef = useRef(rate);
	const [isDraggingSlider, setIsDraggingSlider] = useState(false);
	const [sliderRate, setSliderRate] = useState(rate);

	useEffect(() => {
		if (!isDraggingSlider) {
			setSliderRate(rate);
		}
	}, [rate, isDraggingSlider]);

	const commitRetime = ({
		rate: nextRate,
		maintainPitch: nextMaintainPitch,
	}: {
		rate: number;
		maintainPitch: boolean;
	}) => {
		editor.timeline.updateElementRetime({
			trackId,
			elementId: element.id,
			retime: buildRetime({ rate: nextRate, maintainPitch: nextMaintainPitch }),
		});
	};

	const previewRate = (nextRate: number) => {
		const clamped = clampRetimeRate({ rate: snapToStep({ value: nextRate, step: SPEED_STEP }) });
		pendingRateRef.current = clamped;
		editor.timeline.previewElements({
			updates: [
				{
					trackId,
					elementId: element.id,
					updates: {
						retime: buildRetime({ rate: clamped, maintainPitch }),
					},
				},
			],
		});
	};

	const speedDraft = usePropertyDraft({
		displayValue: rateToDisplay({ rate }),
		parse: (input) => parseSpeedInput({ input }),
		onPreview: (nextRate) => {
			setSliderRate(nextRate);
			previewRate(nextRate);
		},
		onCommit: () => {
			setIsDraggingSlider(false);
			commitRetime({ rate: pendingRateRef.current, maintainPitch });
		},
	});

	return (
		<Section collapsible sectionKey={`${element.id}:speed`}>
			<SectionHeader>
				<SectionTitle>播放速度</SectionTitle>
			</SectionHeader>
			<SectionContent>
				<SectionFields>
					{/* Speed Slider & NumberField Row */}
					<div className="flex flex-col gap-2.5">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-muted-foreground">倍速调节</span>
							<div className="w-24">
								<NumberField
									icon={<HugeiconsIcon icon={DashboardSpeed02Icon} />}
									value={speedDraft.displayValue}
									suffix="x"
									scrubRanges={[
										{ from: 0.01, to: 1, pixelsPerUnit: 160 },
										{ from: 1, to: 5, pixelsPerUnit: 48 },
									]}
									scrubClamp={{ min: MIN_RETIME_RATE, max: MAX_RETIME_RATE }}
									onFocus={() => {
										pendingRateRef.current = rate;
										speedDraft.onFocus();
									}}
									onChange={speedDraft.onChange}
									onBlur={speedDraft.onBlur}
									onScrub={speedDraft.scrubTo}
									onScrubEnd={speedDraft.commitScrub}
									onReset={() => {
										setIsDraggingSlider(false);
										commitRetime({ rate: DEFAULT_RETIME_RATE, maintainPitch });
									}}
									isDefault={rate === DEFAULT_RETIME_RATE}
								/>
							</div>
						</div>

						{/* Continuous Speed Slider */}
						<div className="px-1 py-1">
							<Slider
								min={0.1}
								max={5.0}
								step={0.05}
								value={[Math.min(5.0, Math.max(0.1, isDraggingSlider ? sliderRate : rate))]}
								onValueChange={([val]) => {
									if (val !== undefined) {
										setIsDraggingSlider(true);
										setSliderRate(val);
										previewRate(val);
									}
								}}
								onValueCommit={([val]) => {
									setIsDraggingSlider(false);
									if (val !== undefined) {
										commitRetime({ rate: val, maintainPitch });
									}
								}}
								className="cursor-pointer"
							/>
						</div>

						{/* Quick Preset Buttons */}
						<div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
							{SPEED_PRESETS.map((preset) => {
								const isCurrent = Math.abs(rate - preset) < 0.01;
								return (
									<button
										key={preset}
										type="button"
										onClick={() => {
											setIsDraggingSlider(false);
											commitRetime({ rate: preset, maintainPitch });
										}}
										className={cn(
											"px-2 py-0.5 rounded text-[11px] font-medium transition-all shrink-0 border",
											isCurrent
												? "bg-primary text-primary-foreground border-primary shadow-xs"
												: "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted border-border/40",
										)}
									>
										{preset}x
									</button>
								);
							})}
						</div>
					</div>

					<div className="flex items-center justify-between pt-1 border-t border-border/20">
						<span className="text-sm">随变速调整音调</span>
						<Switch
							checked={!maintainPitch}
							disabled={!isPitchPreserveAvailable}
							onCheckedChange={(checked) =>
								commitRetime({ rate, maintainPitch: !checked })
							}
						/>
					</div>
				</SectionFields>
			</SectionContent>
		</Section>
	);
}
