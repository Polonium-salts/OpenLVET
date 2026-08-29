import type { TransitionDefinition } from "./types";
import { TRANSITION_DEFINITIONS } from "./definitions";

export class TransitionsRegistry {
	private definitions = new Map<string, TransitionDefinition>();
	private listeners = new Set<() => void>();

	constructor() {
		this.initDefaults();
	}

	subscribe(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private notify(): void {
		this.listeners.forEach((l) => {
			try {
				l();
			} catch (e) {
				console.error("Error in TransitionsRegistry listener:", e);
			}
		});
	}

	private initDefaults(): void {
		if (Array.isArray(TRANSITION_DEFINITIONS)) {
			for (const def of TRANSITION_DEFINITIONS) {
				if (!this.definitions.has(def.id)) {
					this.definitions.set(def.id, {
						...def,
						isPlugin: false,
						sourceType: "builtin",
					});
				}
			}
		}
	}

	register(definition: TransitionDefinition): void {
		const enriched: TransitionDefinition = {
			...definition,
			isPlugin: definition.isPlugin ?? true,
			sourceType: definition.sourceType ?? (definition.isPlugin === false ? "builtin" : "plugin"),
		};
		this.definitions.set(definition.id, enriched);
		this.notify();
	}

	unregister(id: string): void {
		this.definitions.delete(id);
		this.notify();
	}

	has(id: string): boolean {
		if (this.definitions.size === 0) {
			this.initDefaults();
		}
		return this.definitions.has(id);
	}

	get(id: string): TransitionDefinition | undefined {
		if (this.definitions.size === 0) {
			this.initDefaults();
		}
		const def = this.definitions.get(id);
		if (!def) {
			const found = TRANSITION_DEFINITIONS.find((d) => d.id === id);
			if (found) {
				this.definitions.set(id, found);
				return found;
			}
			return undefined;
		}
		return def;
	}

	getAll(): TransitionDefinition[] {
		if (this.definitions.size === 0) {
			this.initDefaults();
		}
		return Array.from(this.definitions.values());
	}
}

export const transitionsRegistry = new TransitionsRegistry();
