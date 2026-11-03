import {SectionTitle} from '@content/components/SectionTitle.tsx';
import {MovieGrid} from '@content/components/MovieGrid.tsx';
import {CategorySection} from '@content/home/components/CategorySection.tsx';
import {CrewList} from '@content/movies/components/CrewList.tsx';
import {ImageSection} from '@content/movies/components/ImageSection.tsx';
import {MovieFacts} from '@content/movies/components/MovieFacts.tsx';
import {MovieHero} from '@content/movies/components/MovieHero.tsx';
import {PersonChip} from '@content/movies/components/PersonChip.tsx';
import {VideoModal} from '@content/movies/components/VideoModal.tsx';
import {VideoSection} from '@content/movies/components/VideoSection.tsx';
import {type PagedMovies, usePagedMovies} from '@content/movies/hooks/usePagedMovies.ts';
import {
    getMovieCredits, getMovieDetails, getMovieRecommendations, getMovieVideos, getSimilarMovies
} from '@content/movies/services/movie.service.ts';
import {movieToCard} from '@content/movies/utils/movieCards.ts';
import {pickTrailer} from '@content/movies/utils/youtube.ts';
import {NotFound} from '@app/NotFound.tsx';
import type {Locale} from '@i18n/locales.ts';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Loader} from '@shared/components/feedback/Loader.tsx';
import {type AsyncState, useAsync} from '@shared/hooks/useAsync.ts';
import {useDocumentTitle} from '@shared/hooks/useDocumentTitle.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {paths} from '@shared/routing/paths.ts';
import {movieDetailsClasses} from '@shared/styles/ts/movies/MovieDetailsStyles.ts';
import type {
    CastMember, MovieCreditsResponse, MovieDetailsResponse, MovieListItem, MovieListResponse, MovieVideo,
    MovieVideosResponse
} from '@shared/types/movie/index.ts';
import {type Dispatch, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import type {Translation} from '@i18n/translation.ts';
import type {MovieCardData} from '@content/types/MovieCardData.ts';
import {textOr} from '@shared/utils/guards.ts';

const MAX_ID: number = 999999999;
const CAST_SIZE: number = 20;

function hasVideos(videos: MovieVideosResponse): boolean {
    return videos.videos.length > 0;
}

/**
 * NOTA (nov/2026): a página do filme junta sete rotas da API: detalhes,
 * créditos, vídeos, imagens (no ImageSection), similares e recomendações
 * (com "carregar mais"). Elas carregam em paralelo; só a de detalhes é
 * obrigatória para a página aparecer.
 */
export function MovieDetails(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const {movieId: rawId}: Readonly<Partial<{ movieId: string }>> = useParams<{ movieId: string }>();
    const movieId: number = Number(rawId);
    const validId: boolean = Number.isInteger(movieId) && movieId >= 1 && movieId <= MAX_ID;
    const key: string | null = validId ? `${locale}|${movieId}` : null;
    const [playing, setPlaying]: [MovieVideo | null, Dispatch<SetStateAction<MovieVideo | null>>] = useState<MovieVideo | null>(null);

    const details: AsyncState<MovieDetailsResponse> = useAsync<MovieDetailsResponse>(
        async (signal: AbortSignal): Promise<MovieDetailsResponse> => (await getMovieDetails(locale, movieId, signal)).data, key
    );
    const credits: AsyncState<MovieCreditsResponse> = useAsync<MovieCreditsResponse>(
        async (signal: AbortSignal): Promise<MovieCreditsResponse> => (await getMovieCredits(locale, movieId, signal)).data, key
    );
    // vídeos no idioma da tela; sem nenhum nele, os do TMDB em inglês
    const videos: AsyncState<MovieVideosResponse> = useAsync<MovieVideosResponse>(async (signal: AbortSignal): Promise<MovieVideosResponse> => {
        const localized: MovieVideosResponse = (await getMovieVideos(locale, movieId, true, signal)).data;
        return hasVideos(localized) ? localized : (await getMovieVideos(locale, movieId, false, signal)).data;
    }, key);
    const similar: PagedMovies = usePagedMovies(
        async (page: number, signal?: AbortSignal): Promise<MovieListResponse> => (await getSimilarMovies(locale, movieId, page, signal)).data, key
    );
    const recommendations: PagedMovies = usePagedMovies(
        async (page: number, signal?: AbortSignal): Promise<MovieListResponse> => (await getMovieRecommendations(locale, movieId, page, signal)).data, key
    );

    useDocumentTitle(details.data?.title);

    if (!validId) return <NotFound/>;
    if (details.loading && details.data === null) return <div className="pt-28"><Loader/></div>;
    if (details.error !== null || details.data === null) return <div className="pt-28 px-4"><ErrorMessage error={details.error} onRetry={details.reload}/></div>;

    const movie: MovieDetailsResponse = details.data;
    const trailer: MovieVideo | null = videos.data !== null ? pickTrailer(videos.data) : null;
    const cast: CastMember[] = [...(credits.data?.cast ?? [])].sort((a: CastMember, b: CastMember): number => a.order - b.order).slice(0, CAST_SIZE);

    const related: (title: string, state: PagedMovies) => ReactElement = (title: string, state: PagedMovies): ReactElement => (
        <CategorySection
            title={title}
            cards={state.movies.map((item: MovieListItem): MovieCardData => movieToCard(item, locale))}
            loading={state.loading}
            error={state.error}
            onRetry={state.reload}
            hasMore={state.hasMore}
            loadingMore={state.loadingMore}
            onLoadMore={state.loadMore}
        />
    );

    return (
        <div className={movieDetailsClasses.page}>
            <MovieHero movie={movie} trailer={trailer} onPlay={setPlaying}/>

            <div className={movieDetailsClasses.body}>
                <section className={movieDetailsClasses.section}>
                    <SectionTitle title={t('About the movie')}/>
                    <MovieFacts movie={movie}/>
                </section>

                <section className={movieDetailsClasses.section}>
                    <SectionTitle title={t('Cast')}/>
                    {credits.loading && <Loader/>}
                    {credits.error !== null && <ErrorMessage error={credits.error} onRetry={credits.reload}/>}
                    {cast.length > 0 && (
                        <MovieGrid>
                            {cast.map((member: CastMember): ReactElement => (
                                <PersonChip key={member.credit_id} name={member.name} role={textOr(member.character, null)}
                                            profilePath={member.profile_path} to={paths.person(locale, member.id)}/>
                            ))}
                        </MovieGrid>
                    )}
                    {credits.data !== null && <CrewList crew={credits.data.crew}/>}
                </section>

                <section className={movieDetailsClasses.section}>
                    <SectionTitle title={t('Videos')}/>
                    {videos.loading && <Loader/>}
                    {videos.error !== null && <ErrorMessage error={videos.error} onRetry={videos.reload}/>}
                    {videos.data !== null && <VideoSection videos={videos.data}/>}
                </section>

                <section className={movieDetailsClasses.section}>
                    <SectionTitle title={t('Images')}/>
                    <ImageSection movieId={movie.id} title={movie.title}/>
                </section>
            </div>

            <div className="space-y-8 pt-12">
                {related(t('Recommended for you'), recommendations)}
                {related(t('Similar movies'), similar)}
            </div>

            {playing !== null && <VideoModal video={playing} onClose={(): void => setPlaying(null)}/>}
        </div>
    );
}
