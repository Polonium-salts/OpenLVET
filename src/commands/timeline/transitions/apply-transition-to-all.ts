import { Command, type CommandResult } from "@/commands/base-command";
import { EditorCore } from "@/core";
import type { SceneTracks, VideoTrack } from "@/timeline";
import type { TrackTransition } from "@/transitions/types";
import { mediaTimeFromSeconds, type MediaTime } from "@/wasm";
import { nanoid } from "nanoid";

export class ApplyTransitionToAllCommand extends Command {
	private savedState: SceneTracks | null = null;
	private readonly transitionType: string;
	private readonly duration: MediaTime;

	constructor({
		type,
		duration = mediaTimeFromSeconds({ seconds: 1.0 }),
	}: {
		type: string;
		duration?: MediaTime;
	}) {
		super();
		this.transitionType = type;
		this.duration = duration;
	}

	execute(): CommandResult | undefined {
		const editor = EditorCore.getInstance();
		this.savedState = editor.scenes.getActiveScene().tracks;

		const applyToTrack = (track: VideoTrack): VideoTrack => {
			const elements = track.elements
				.slice()
				.sort((a, b) => a.startTime - b.startTime);

			const newTransitions: TrackTransition[] = [];

			for (let i = 0; i < elements.length - 1; i++) {
				const current = elements[i];
				const next = elements[i + 1];
				// If adjacent or almost adjacent (within 0.1s)
				if (current && next) {
					newTransitions.push({
						id: nanoid(),
						type: this.transitionType,
						duration: this.duration,
						fromElementId: current.id,
						toElementId: next.id,
					});
				}
			}

			return {
				...track,
				transitions: newTransitions,
			};
		};

		const updatedTracks: SceneTracks = {
			...this.savedState,
			main: applyToTrack(this.savedState.main),
			overlay: this.savedState.overlay.map((track) =>
				track.type === "video" ? applyToTrack(track as VideoTrack) : track,
			),
		};

		editor.timeline.updateTracks(updatedTracks);
		return undefined;
	}

	undo(): void {
		if (this.savedState) {
			const editor = EditorCore.getInstance();
			editor.timeline.updateTracks(this.savedState);
		}
	}
}
