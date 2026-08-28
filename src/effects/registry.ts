import type { EffectDefinition } from "@/effects/types";
import { defaultEffects } from "./definitions";

export class EffectsRegistry {
	private definitions = new Map<string, EffectDefinition>();
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
				console.error("Error in EffectsRegistry listener:", e);
			}
		});
	}

	private initDefaults(): void {
		if (Array.isArray(defaultEffects)) {
			for (const def of defaultEffects) {
				if (!this.definitions.has(def.type)) {
					this.definitions.set(def.type, def);
				}
			}
		}
	}

	register({
		key,
		definition,
	}: {
		key: string;
		definition: EffectDefinition;
	}): void {
		this.definitions.set(key, definition);
		this.notify();
	}

	unregister(key: string): void {
		this.definitions.delete(key);
		this.notify();
	}

	has(key: string): boolean {
		if (this.definitions.size === 0) {
			this.initDefaults();
		}
		return this.definitions.has(key);
	}

	get(key: string): EffectDefinition {
		if (this.definitions.size === 0) {
			this.initDefaults();
		}
		const def = this.definitions.get(key);
		if (!def) {
			const found = defaultEffects?.find((d) => d.type === key);
			if (found) {
				this.definitions.set(key, found);
				return found;
			}
			throw new Error(`Unknown effect: ${key}`);
		}
		return def;
	}

	getAll(): EffectDefinition[] {
		if (this.definitions.size === 0) {
			this.initDefaults();
		}
		return Array.from(this.definitions.values());
	}
}

export const effectsRegistry = new EffectsRegistry();
