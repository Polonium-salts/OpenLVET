import { create } from "zustand";
import type { TransitionCategory } from "./types";

interface TransitionsStore {
	selectedTransitionRef: {
		trackId: string;
		transitionId: string;
	} | null;
	setSelectedTransitionRef: (
		ref: { trackId: string; transitionId: string } | null,
	) => void;

	activeCategory: TransitionCategory | "all";
	setActiveCategory: (cat: TransitionCategory | "all") => void;

	searchQuery: string;
	setSearchQuery: (query: string) => void;
}

export const useTransitionsStore = create<TransitionsStore>((set) => ({
	selectedTransitionRef: null,
	setSelectedTransitionRef: (ref) => set({ selectedTransitionRef: ref }),

	activeCategory: "all",
	setActiveCategory: (activeCategory) => set({ activeCategory }),

	searchQuery: "",
	setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
