import { useEffect } from "react";
import { useSoundsStore } from "@/sounds/sounds-store";

const soundQueryCache = new Map<string, { results: any[]; count: number; next: boolean }>();

export function useSoundSearch({
	query,
	commercialOnly,
}: {
	query: string;
	commercialOnly: boolean;
}) {
	const {
		searchResults,
		isSearching,
		searchError,
		lastSearchQuery,
		currentPage,
		hasNextPage,
		isLoadingMore,
		totalCount,
		setSearchResults,
		setSearching,
		setSearchError,
		setLastSearchQuery,
		setCurrentPage,
		setHasNextPage,
		setTotalCount,
		setLoadingMore,
		appendSearchResults,
		appendTopSounds,
		resetPagination,
	} = useSoundsStore();

	const loadMore = async () => {
		if (isLoadingMore || !hasNextPage) return;

		try {
			setLoadingMore({ loading: true });
			const nextPage = currentPage + 1;

			const searchParams = new URLSearchParams({
				page: nextPage.toString(),
				type: "effects",
			});

			if (query.trim()) {
				searchParams.set("q", query);
			}

			searchParams.set("commercial_only", commercialOnly.toString());
			const response = await fetch(
				`/api/sounds/search?${searchParams.toString()}`,
			);

			if (response.ok) {
				const data = await response.json();

				if (query.trim()) {
					appendSearchResults(data.results);
				} else {
					appendTopSounds(data.results);
				}

				setCurrentPage({ page: nextPage });
				setHasNextPage({ hasNext: !!data.next });
				setTotalCount(data.count);
			} else {
				setSearchError({ error: `Load more failed: ${response.status}` });
			}
		} catch (err) {
			setSearchError({
				error: err instanceof Error ? err.message : "Load more failed",
			});
		} finally {
			setLoadingMore({ loading: false });
		}
	};

	useEffect(() => {
		const trimmedQuery = query.trim();
		if (!trimmedQuery) {
			setSearchResults({ results: [] });
			setSearchError({ error: null });
			setLastSearchQuery({ query: "" });
			return;
		}

		if (trimmedQuery === lastSearchQuery && searchResults.length > 0) {
			return;
		}

		// Check cache for instant 0ms response
		if (soundQueryCache.has(trimmedQuery)) {
			const cached = soundQueryCache.get(trimmedQuery)!;
			setSearchResults({ results: cached.results });
			setLastSearchQuery({ query: trimmedQuery });
			setHasNextPage({ hasNext: cached.next });
			setTotalCount({ count: cached.count });
			setCurrentPage({ page: 1 });
			setSearching({ searching: false });
			return;
		}

		let ignore = false;
		const abortController = new AbortController();

		const timeoutId = setTimeout(async () => {
			try {
				setSearching({ searching: true });
				setSearchError({ error: null });
				resetPagination();

				const response = await fetch(
					`/api/sounds/search?q=${encodeURIComponent(trimmedQuery)}&type=effects&page=1`,
					{ signal: abortController.signal },
				);

				if (!ignore && response.ok) {
					const data = await response.json();
					soundQueryCache.set(trimmedQuery, {
						results: data.results,
						count: data.count,
						next: !!data.next,
					});
					setSearchResults({ results: data.results });
					setLastSearchQuery({ query: trimmedQuery });
					setHasNextPage({ hasNext: !!data.next });
					setTotalCount({ count: data.count });
					setCurrentPage({ page: 1 });
				}
			} catch (err) {
				if (!ignore && !(err instanceof Error && err.name === "AbortError")) {
					setSearchError({
						error: err instanceof Error ? err.message : "Search failed",
					});
				}
			} finally {
				if (!ignore) {
					setSearching({ searching: false });
				}
			}
		}, 120);

		return () => {
			clearTimeout(timeoutId);
			abortController.abort();
			ignore = true;
		};
	}, [
		query,
		lastSearchQuery,
		searchResults.length,
		setSearchResults,
		setSearching,
		setSearchError,
		setLastSearchQuery,
		setCurrentPage,
		setHasNextPage,
		setTotalCount,
		resetPagination,
	]);

	return {
		results: searchResults,
		isLoading: isSearching,
		error: searchError,
		loadMore,
		hasNextPage,
		isLoadingMore,
		totalCount,
	};
}
