import { Command, type CommandResult } from "@/commands/base-command";
import { EditorCore } from "@/core";
import type { SceneTracks, VideoTrack } from "@/timeline";

export class RemoveTransitionCommand extends Command {
	private savedState: SceneTracks | null = null;
	private readonly trackId: string;
	private readonly transitionId: string;

	constructor({
		trackId,
		transitionId,
	}: {
		trackId: string;
		transitionId: string;
	}) {
		super();
		this.trackId = trackId;
		this.transitionId = transitionId;
	}

	execute(): CommandResult | undefined {
		const editor = EditorCore.getInstance();
		this.savedState = editor.scenes.getActiveScene().tracks;

		const updateTrack = (track: VideoTrack): VideoTrack => {
			if (track.id !== this.trackId) return track;
			return {
				...track,
				transitions: (track.transitions ?? []).filter(
					(t) => t.id !== this.transitionId,
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
