import {getMovieVideos} from '@content/movies/services/movie.service.ts';
import {pickTrailer} from '@content/movies/utils/youtube.ts';
import type {Locale} from '@i18n/locales.ts';
import {type AsyncState, useAsync} from '@shared/hooks/useAsync.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import type {MovieVideo} from '@shared/types/movie/index.ts';

/**
 * O trailer de um filme no idioma da tela; sem nenhum nele, o do TMDB em
 * inglês (a rota de vídeos sem `language`).
 */
export function useTrailer(movieId: number | null): AsyncState<MovieVideo | null> {
    const locale: Locale = useLocale();

    return useAsync<MovieVideo | null>(async (signal: AbortSignal): Promise<MovieVideo | null> => {
        if (movieId === null) return null;
        const localized: MovieVideo | null = pickTrailer((await getMovieVideos(locale, movieId, true, signal)).data);
        if (localized !== null) return localized;
        return pickTrailer((await getMovieVideos(locale, movieId, false, signal)).data);
    }, movieId === null ? null : `${locale}|${movieId}`);
}
