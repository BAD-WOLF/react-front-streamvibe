import {uniqueById} from '@content/movies/utils/movieCards.ts';
import {type AsyncState, useAsync} from '@shared/hooks/useAsync.ts';
import type {MovieListItem, MovieListResponse} from '@shared/types/movie/index.ts';
import {type Dispatch, type SetStateAction, useState} from 'react';

export type PagedMovies = {
    movies: MovieListItem[];
    loading: boolean;
    error: unknown;
    reload: () => void;
    hasMore: boolean;
    loadingMore: boolean;
    loadMore: () => void;
};

type Extra = {
    key: string | null;
    movies: MovieListItem[];
    last: MovieListResponse | null;
    error: unknown;
};

/** Uma lista paginada que cresce com "carregar mais" (next_page da API). */
export function usePagedMovies(fetchPage: (page: number, signal?: AbortSignal) => Promise<MovieListResponse>, key: string | null): PagedMovies {
    const first: AsyncState<MovieListResponse> = useAsync<MovieListResponse>((signal: AbortSignal): Promise<MovieListResponse> => fetchPage(1, signal), key);
    const [extra, setExtra]: [Extra, Dispatch<SetStateAction<Extra>>] = useState<Extra>({key: null, movies: [], last: null, error: null});
    const [loadingMore, setLoadingMore]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);

    const current: Extra = extra.key === key ? extra : {key, movies: [], last: null, error: null};
    const last: MovieListResponse | null = current.last ?? first.data;
    const nextPage: number | null = last !== null && last.has_next && last.next_page !== null && last.next_page <= 500 ? last.next_page : null;

    const loadMore: () => void = (): void => {
        if (nextPage === null || loadingMore) return;
        setLoadingMore(true);
        fetchPage(nextPage)
            .then((page: MovieListResponse): void => setExtra({key, movies: [...current.movies, ...page.movies], last: page, error: null}))
            .catch((error: unknown): void => setExtra({...current, error}))
            .finally((): void => setLoadingMore(false));
    };

    return {
        movies: uniqueById([...(first.data?.movies ?? []), ...current.movies]),
        loading: first.loading,
        error: first.error ?? current.error,
        reload: first.reload,
        hasMore: nextPage !== null,
        loadingMore,
        loadMore,
    };
}
