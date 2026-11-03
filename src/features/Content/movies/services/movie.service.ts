import {type Locale, toLanguageTag} from '@i18n/locales.ts';
import {apiRequest} from '@shared/api/httpClient.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';
import type {
    MovieCreditsResponse, MovieDetailsResponse, MovieImagesResponse, MovieListResponse, MovieSearchFilters,
    MovieVideosResponse, RelatedMoviesResponse, TrendingMoviesResponse, TrendingTimeWindow
} from '@shared/types/movie/index.ts';

// NOTA (nov/2026): todas as rotas de filmes são 🔒 (JWT). O `language` vai
// sempre no idioma da tela (pt_BR → pt-BR), para o TMDB responder traduzido.
const MAX_PAGE: number = 500;

function pageOf(page: number): number {
    return Math.min(Math.max(1, Math.trunc(page)), MAX_PAGE);
}

/** GET /{locale}/api/movies/popular */
export async function getPopularMovies(locale: Locale, page: number = 1, signal?: AbortSignal): Promise<ApiResult<MovieListResponse>> {
    return apiRequest<MovieListResponse>(locale, '/movies/popular', {auth: true, signal, query: {page: pageOf(page), language: toLanguageTag(locale)}});
}

/** GET /{locale}/api/movies/top-rated */
export async function getTopRatedMovies(locale: Locale, page: number = 1, signal?: AbortSignal): Promise<ApiResult<MovieListResponse>> {
    return apiRequest<MovieListResponse>(locale, '/movies/top-rated', {auth: true, signal, query: {page: pageOf(page), language: toLanguageTag(locale)}});
}

/** GET /{locale}/api/movies/now-playing */
export async function getNowPlayingMovies(locale: Locale, page: number = 1, signal?: AbortSignal): Promise<ApiResult<MovieListResponse>> {
    return apiRequest<MovieListResponse>(locale, '/movies/now-playing', {auth: true, signal, query: {page: pageOf(page), language: toLanguageTag(locale)}});
}

/** GET /{locale}/api/movies/trending/{timeWindow} */
export async function getTrendingMovies(locale: Locale, timeWindow: TrendingTimeWindow, page: number = 1, signal?: AbortSignal): Promise<ApiResult<TrendingMoviesResponse>> {
    return apiRequest<TrendingMoviesResponse>(locale, `/movies/trending/${timeWindow}`, {auth: true, signal, query: {page: pageOf(page), language: toLanguageTag(locale)}});
}

/** GET /{locale}/api/movies/search/{query}/{page} (query: 1 to 255 characters) */
export async function searchMovies(locale: Locale, query: string, page: number = 1, filters: MovieSearchFilters = {}, signal?: AbortSignal): Promise<ApiResult<MovieListResponse>> {
    return apiRequest<MovieListResponse>(locale, `/movies/search/${encodeURIComponent(query.trim())}/${pageOf(page)}`, {
        auth: true,
        signal,
        query: {
            language: toLanguageTag(locale),
            include_adult: filters.includeAdult === true ? true : undefined,
            region: filters.region,
            year: filters.year,
            primary_release_year: filters.primaryReleaseYear,
        },
    });
}

/** GET /{locale}/api/movies/{movieId} */
export async function getMovieDetails(locale: Locale, movieId: number, signal?: AbortSignal): Promise<ApiResult<MovieDetailsResponse>> {
    return apiRequest<MovieDetailsResponse>(locale, `/movies/${movieId}`, {auth: true, signal, query: {language: toLanguageTag(locale)}});
}

/** GET /{locale}/api/movies/{movieId}/credits */
export async function getMovieCredits(locale: Locale, movieId: number, signal?: AbortSignal): Promise<ApiResult<MovieCreditsResponse>> {
    return apiRequest<MovieCreditsResponse>(locale, `/movies/${movieId}/credits`, {auth: true, signal, query: {language: toLanguageTag(locale)}});
}

/**
 * GET /{locale}/api/movies/{movieId}/images. With `onlyLocale`, TMDB returns
 * only the images tagged with the screen's language; without it, all of them.
 */
export async function getMovieImages(locale: Locale, movieId: number, onlyLocale: boolean = false, signal?: AbortSignal): Promise<ApiResult<MovieImagesResponse>> {
    return apiRequest<MovieImagesResponse>(locale, `/movies/${movieId}/images`, {auth: true, signal, query: {language: onlyLocale ? toLanguageTag(locale) : undefined}});
}

/**
 * GET /{locale}/api/movies/{movieId}/videos. With `localized`, only the videos
 * in the screen's language; without it, TMDB uses en-US.
 */
export async function getMovieVideos(locale: Locale, movieId: number, localized: boolean = true, signal?: AbortSignal): Promise<ApiResult<MovieVideosResponse>> {
    return apiRequest<MovieVideosResponse>(locale, `/movies/${movieId}/videos`, {auth: true, signal, query: {language: localized ? toLanguageTag(locale) : undefined}});
}

/** GET /{locale}/api/movies/{movieId}/similar */
export async function getSimilarMovies(locale: Locale, movieId: number, page: number = 1, signal?: AbortSignal): Promise<ApiResult<RelatedMoviesResponse>> {
    return apiRequest<RelatedMoviesResponse>(locale, `/movies/${movieId}/similar`, {auth: true, signal, query: {page: pageOf(page), language: toLanguageTag(locale)}});
}

/** GET /{locale}/api/movies/{movieId}/recommendations */
export async function getMovieRecommendations(locale: Locale, movieId: number, page: number = 1, signal?: AbortSignal): Promise<ApiResult<RelatedMoviesResponse>> {
    return apiRequest<RelatedMoviesResponse>(locale, `/movies/${movieId}/recommendations`, {auth: true, signal, query: {page: pageOf(page), language: toLanguageTag(locale)}});
}
