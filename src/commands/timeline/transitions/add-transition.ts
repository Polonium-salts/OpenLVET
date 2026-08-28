import { Command, type CommandResult } from "@/commands/base-command";
import { EditorCore } from "@/core";
import type { SceneTracks, VideoTrack } from "@/timeline";
import type { TrackTransition } from "@/transitions/types";
import { mediaTimeFromSeconds, type MediaTime } from "@/wasm";
import { nanoid } from "nanoid";

export class AddTransitionCommand extends Command {
	private savedState: SceneTracks | null = null;
	private transitionId: string;
	private readonly trackId: string;
	private readonly fromElementId: string;
	private readonly toElementId: string;
	private readonly transitionType: string;
	private readonly duration: MediaTime;

	constructor({
		trackId,
		fromElementId,
		toElementId,
		type,
		duration = mediaTimeFromSeconds({ seconds: 1.0 }),
	}: {
		trackId: string;
		fromElementId: string;
		toElementId: string;
		type: string;
		duration?: MediaTime;
	}) {
		super();
		this.transitionId = nanoid();
		this.trackId = trackId;
		this.fromElementId = fromElementId;
		this.toElementId = toElementId;
		this.transitionType = type;
		this.duration = duration;
	}

	execute(): CommandResult | undefined {
		const editor = EditorCore.getInstance();
		this.savedState = editor.scenes.getActiveScene().tracks;

		const updateTrack = (track: VideoTrack): VideoTrack => {
			if (track.id !== this.trackId) return track;
			const currentTransitions = (track.transitions ?? []).filter(
				(t) =>
					!(
						t.fromElementId === this.fromElementId &&
						t.toElementId === this.toElementId
					),
			);
			const newTransition: TrackTransition = {
				id: this.transitionId,
				type: this.transitionType,
				duration: this.duration,
				fromElementId: this.fromElementId,
				toElementId: this.toElementId,
			};
			return {
				...track,
				transitions: [...currentTransitions, newTransition],
			};
		};

		const updatedTracks: SceneTracks = {
			...this.savedState,
			main: updateTrack(this.savedState.main),
			overlay: this.savedState.overlay.map((track) =>
				track.type === "video" ? updateTrack(track as VideoTrack) : track,
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

	getTransitionId(): string {
		return this.transitionId;
	}
}
