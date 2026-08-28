import { Command, type CommandResult } from "@/commands/base-command";
import { EditorCore } from "@/core";
import type { SceneTracks, VideoTrack } from "@/timeline";
import type { TrackTransition } from "@/transitions/types";

export class UpdateTransitionCommand extends Command {
	private savedState: SceneTracks | null = null;
	private readonly trackId: string;
	private readonly transitionId: string;
	private readonly patch: Partial<TrackTransition>;

	constructor({
		trackId,
		transitionId,
		patch,
	}: {
		trackId: string;
		transitionId: string;
		patch: Partial<TrackTransition>;
	}) {
		super();
		this.trackId = trackId;
		this.transitionId = transitionId;
		this.patch = patch;
	}

	execute(): CommandResult | undefined {
		const editor = EditorCore.getInstance();
		this.savedState = editor.scenes.getActiveScene().tracks;

		const updateTrack = (track: VideoTrack): VideoTrack => {
			if (track.id !== this.trackId) return track;
			return {
				...track,
				transitions: (track.transitions ?? []).map((t) =>
					t.id === this.transitionId ? { ...t, ...this.patch } : t,
				),
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
}
