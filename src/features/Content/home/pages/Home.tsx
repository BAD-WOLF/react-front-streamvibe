import {CategorySection} from '@content/home/components/CategorySection.tsx';
import {NetflixHeroBanner} from '@content/home/components/NetflixHeroBanner.tsx';
import {TimeWindowToggle} from '@content/movies/components/TimeWindowToggle.tsx';
import {VideoModal} from '@content/movies/components/VideoModal.tsx';
import {
    getNowPlayingMovies, getPopularMovies, getTopRatedMovies, getTrendingMovies
} from '@content/movies/services/movie.service.ts';
import {movieToCard} from '@content/movies/utils/movieCards.ts';
import type {MovieCardData} from '@content/types/MovieCardData.ts';
import type {Locale} from '@i18n/locales.ts';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Loader} from '@shared/components/feedback/Loader.tsx';
import {type AsyncState, type AsyncTask, useAsync} from '@shared/hooks/useAsync.ts';
import {useDocumentTitle} from '@shared/hooks/useDocumentTitle.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {paths} from '@shared/routing/paths.ts';
import {homeClasses} from '@shared/styles/ts/home/HomeStyles.ts';
import type {MovieListItem, MovieListResponse, MovieVideo, TrendingTimeWindow} from '@shared/types/movie/index.ts';
import {type Dispatch, type FC, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {type NavigateFunction, useNavigate} from 'react-router-dom';
import type {Translation} from '@i18n/translation.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';
import {isNonEmpty} from '@shared/utils/guards.ts';

const HERO_SIZE: number = 5;

// NOTA (nov/2026): a Home deixou a lista fixa (movieList.service.ts, com
// imagens do Unsplash) e passou a usar as listas da API: em alta (dia e
// semana), populares, mais bem avaliados e em cartaz. As seções de gênero
// saíram: a API ainda não tem rota de gêneros (veja "Decisões e Pendências").
export const Home: FC = (): ReactElement => {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const navigate: NavigateFunction = useNavigate();
    const [timeWindow, setTimeWindow]: [TrendingTimeWindow, Dispatch<SetStateAction<TrendingTimeWindow>>] = useState<TrendingTimeWindow>('day');
    const [playing, setPlaying]: [MovieVideo | null, Dispatch<SetStateAction<MovieVideo | null>>] = useState<MovieVideo | null>(null);
    useDocumentTitle(t('Home'));

    const list: (load: AsyncTask<ApiResult<MovieListResponse>>) => AsyncTask<MovieListResponse> =
        (load: AsyncTask<ApiResult<MovieListResponse>>): AsyncTask<MovieListResponse> =>
            async (signal: AbortSignal): Promise<MovieListResponse> => (await load(signal)).data;

    const trendingDay: AsyncState<MovieListResponse> = useAsync(list((signal: AbortSignal): Promise<ApiResult<MovieListResponse>> => getTrendingMovies(locale, 'day', 1, signal)), `${locale}|trending|day`);
    const trendingWeek: AsyncState<MovieListResponse> = useAsync(list((signal: AbortSignal): Promise<ApiResult<MovieListResponse>> => getTrendingMovies(locale, 'week', 1, signal)), timeWindow === 'week' ? `${locale}|trending|week` : null);
    const popular: AsyncState<MovieListResponse> = useAsync(list((signal: AbortSignal): Promise<ApiResult<MovieListResponse>> => getPopularMovies(locale, 1, signal)), `${locale}|popular`);
    const topRated: AsyncState<MovieListResponse> = useAsync(list((signal: AbortSignal): Promise<ApiResult<MovieListResponse>> => getTopRatedMovies(locale, 1, signal)), `${locale}|top-rated`);
    const nowPlaying: AsyncState<MovieListResponse> = useAsync(list((signal: AbortSignal): Promise<ApiResult<MovieListResponse>> => getNowPlayingMovies(locale, 1, signal)), `${locale}|now-playing`);

    const trending: AsyncState<MovieListResponse> = timeWindow === 'day' ? trendingDay : trendingWeek;
    const heroMovies: MovieListItem[] = (trendingDay.data?.movies ?? [])
        .filter((movie: MovieListItem): boolean => movie.backdrop_url !== null)
        .slice(0, HERO_SIZE);

    const handlePlay: (movie: MovieListItem, trailer: MovieVideo | null) => void = (movie: MovieListItem, trailer: MovieVideo | null): void => {
        if (trailer !== null) setPlaying(trailer);
        else void navigate(paths.movie(locale, movie.id));
    };

    const section: (title: string, state: AsyncState<MovieListResponse>, seeAllTo: string, actions?: ReactElement) => ReactElement =
        (title: string, state: AsyncState<MovieListResponse>, seeAllTo: string, actions?: ReactElement): ReactElement => (
            <CategorySection
                title={title}
                cards={(state.data?.movies ?? []).map((movie: MovieListItem): MovieCardData => movieToCard(movie, locale))}
                loading={state.loading}
                error={state.error}
                onRetry={state.reload}
                seeAllTo={seeAllTo}
                actions={actions}
            />
        );

    return (
        <div className={homeClasses.container}>
            {/* Netflix-Style Hero Banner */}
            {isNonEmpty(heroMovies) ? (
                <NetflixHeroBanner movies={heroMovies} onPlay={handlePlay}/>
            ) : (
                <div className={homeClasses.heroPlaceholder}>
                    {trendingDay.error !== null ? <ErrorMessage error={trendingDay.error} onRetry={trendingDay.reload}/> : <Loader/>}
                </div>
            )}

            {/* Category Sections */}
            <div className={homeClasses.categorySection}>
                {section(t('Trending Now'), trending, paths.movieList(locale, 'trending', {window: timeWindow}),
                    <TimeWindowToggle value={timeWindow} onChange={setTimeWindow}/>)}
                {section(t('Popular'), popular, paths.movieList(locale, 'popular'))}
                {section(t('Top Rated'), topRated, paths.movieList(locale, 'top-rated'))}
                {section(t('Now Playing'), nowPlaying, paths.movieList(locale, 'now-playing'))}
            </div>

            {playing !== null && <VideoModal video={playing} onClose={(): void => setPlaying(null)}/>}
        </div>
    );
};
