import {FeaturedMovie} from '@content/home/components/FeaturedMovie.tsx';
import {MoviePosterGrid} from '@content/movies/components/MoviePosterGrid.tsx';
import {TimeWindowToggle} from '@content/movies/components/TimeWindowToggle.tsx';
import {
    getNowPlayingMovies, getPopularMovies, getTopRatedMovies, getTrendingMovies
} from '@content/movies/services/movie.service.ts';
import {movieToCard, uniqueById} from '@content/movies/utils/movieCards.ts';
import type {Locale} from '@i18n/locales.ts';
import {NotFound} from '@app/NotFound.tsx';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Loader} from '@shared/components/feedback/Loader.tsx';
import {Pagination} from '@shared/components/Pagination.tsx';
import {type AsyncState, useAsync} from '@shared/hooks/useAsync.ts';
import {useDocumentTitle} from '@shared/hooks/useDocumentTitle.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {type MovieListQuery, pageFromQuery, paths} from '@shared/routing/paths.ts';
import {movieListClasses} from '@shared/styles/ts/movies/MovieListStyles.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';
import type {MovieListItem, MovieListName, MovieListResponse, TrendingTimeWindow} from '@shared/types/movie/index.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {Link, type NavigateFunction, type SetURLSearchParams, useNavigate, useParams, useSearchParams} from 'react-router-dom';
import type {Translation} from '@i18n/translation.ts';
import type {MovieCardData} from '@content/types/MovieCardData.ts';

const LISTS: MovieListName[] = ['trending', 'popular', 'top-rated', 'now-playing'];
const FEATURED_COUNT: number = 3;

function isListName(value: string | undefined): value is MovieListName {
    return LISTS.includes(value as MovieListName);
}

function loadList(locale: Locale, list: MovieListName, timeWindow: TrendingTimeWindow, page: number, signal: AbortSignal): Promise<ApiResult<MovieListResponse>> {
    switch (list) {
        case 'trending':
            return getTrendingMovies(locale, timeWindow, page, signal);
        case 'popular':
            return getPopularMovies(locale, page, signal);
        case 'top-rated':
            return getTopRatedMovies(locale, page, signal);
        case 'now-playing':
            return getNowPlayingMovies(locale, page, signal);
    }
}

export function MovieList(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const navigate: NavigateFunction = useNavigate();
    const {list}: Readonly<Partial<{ list: string }>> = useParams<{ list: string }>();
    const [searchParams]: [URLSearchParams, SetURLSearchParams] = useSearchParams();

    const listName: MovieListName | null = isListName(list) ? list : null;
    const timeWindow: TrendingTimeWindow = searchParams.get('window') === 'week' ? 'week' : 'day';
    const page: number = pageFromQuery(searchParams.get('page'));

    const titles: Record<MovieListName, string> = {
        'trending': t('Trending Now'),
        'popular': t('Popular'),
        'top-rated': t('Top Rated'),
        'now-playing': t('Now Playing'),
    };
    useDocumentTitle(listName !== null ? titles[listName] : null);

    const result: AsyncState<MovieListResponse> = useAsync<MovieListResponse>(
        async (signal: AbortSignal): Promise<MovieListResponse> => (await loadList(locale, listName ?? 'popular', timeWindow, page, signal)).data,
        listName !== null ? `${locale}|${listName}|${timeWindow}|${page}` : null
    );

    if (listName === null) return <NotFound/>;

    const movies: MovieListItem[] = uniqueById(result.data?.movies ?? []);
    const featured: MovieListItem[] = page === 1 ? movies.filter((movie: MovieListItem): boolean => movie.backdrop_url !== null).slice(0, FEATURED_COUNT) : [];
    const rest: MovieListItem[] = movies.filter((movie: MovieListItem): boolean => !featured.includes(movie));

    const goTo: (target: MovieListQuery) => void = (target: MovieListQuery): void => {
        void navigate(paths.movieList(locale, listName, {window: listName === 'trending' ? (target.window ?? timeWindow) : undefined, page: target.page}));
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    return (
        <div className={movieListClasses.page}>
            <div className={movieListClasses.header}>
                <div>
                    <h1 className={movieListClasses.title}>{titles[listName]}</h1>
                    {result.data !== null && (
                        <p className={movieListClasses.subtitle}>{t('{{count}} movies', {count: result.data.total_results})}</p>
                    )}
                </div>
                {listName === 'trending' && <TimeWindowToggle value={timeWindow} onChange={(value: TrendingTimeWindow): void => goTo({window: value})}/>}
            </div>

            <nav className={movieListClasses.tabs}>
                {LISTS.map((name: MovieListName): ReactElement => (
                    <Link
                        key={name}
                        to={paths.movieList(locale, name)}
                        className={`${movieListClasses.tab} ${name === listName ? movieListClasses.tabActive : movieListClasses.tabInactive}`}
                    >
                        {titles[name]}
                    </Link>
                ))}
            </nav>

            {result.loading && <Loader/>}
            {result.error !== null && <ErrorMessage error={result.error} onRetry={result.reload}/>}

            {result.data !== null && !result.loading && (
                <>
                    {featured.length > 0 && (
                        <div className={movieListClasses.featured}>
                            {featured.map((movie: MovieListItem, index: number): ReactElement => (
                                <FeaturedMovie key={movie.id} movie={movie} index={index} to={paths.movie(locale, movie.id)}/>
                            ))}
                        </div>
                    )}
                    <MoviePosterGrid
                        cards={rest.map((movie: MovieListItem): MovieCardData => movieToCard(movie, locale))}
                        empty={t('No movies found.')}
                    />
                    <Pagination page={page} totalPages={result.data.total_pages} onChange={(next: number): void => goTo({page: next})}/>
                </>
            )}
        </div>
    );
}
