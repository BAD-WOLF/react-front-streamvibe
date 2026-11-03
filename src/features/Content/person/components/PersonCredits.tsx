import {MoviePosterGrid} from '@content/movies/components/MoviePosterGrid.tsx';
import {
    movieCastToCard, movieCrewToCard, tvCastToCard, tvCrewToCard
} from '@content/movies/utils/movieCards.ts';
import type {MovieCardData} from '@content/types/MovieCardData.ts';
import type {Locale} from '@i18n/locales.ts';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Loader} from '@shared/components/feedback/Loader.tsx';
import {type TabItem, Tabs} from '@shared/components/Tabs.tsx';
import type {AsyncState} from '@shared/hooks/useAsync.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import type {
    MovieCastCredit, MovieCrewCredit, PersonMovieCreditsResponse, PersonTvCreditsResponse, TvCastCredit, TvCrewCredit
} from '@shared/types/person/index.ts';
import {type Dispatch, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';

type CreditTab = 'movie-cast' | 'movie-crew' | 'tv-cast' | 'tv-crew';

type Dated = { popularity: number; release_date?: string | null; first_air_date?: string | null };

/** Mais recentes primeiro; sem data, pela popularidade. */
function byDate<T extends Dated>(items: T[]): T[] {
    return [...items].sort((a: T, b: T): number => {
        const dateA: string = a.release_date ?? a.first_air_date ?? '';
        const dateB: string = b.release_date ?? b.first_air_date ?? '';
        const byRelease: number = dateB.localeCompare(dateA);
        return byRelease !== 0 ? byRelease : b.popularity - a.popularity;
    });
}

/** Filmes (GET /person/{id}/movie/credits) e séries (GET /person/{id}/tv/credits), como elenco e como equipe. */
export function PersonCredits({movies, tv}: {
    movies: AsyncState<PersonMovieCreditsResponse>;
    tv: AsyncState<PersonTvCreditsResponse>;
}): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const [active, setActive]: [CreditTab, Dispatch<SetStateAction<CreditTab>>] = useState<CreditTab>('movie-cast');
    const episodes: string = t('episodes');

    const tabs: TabItem<CreditTab>[] = [
        {id: 'movie-cast', label: t('Movies (acting)'), count: movies.data?.cast.length},
        {id: 'movie-crew', label: t('Movies (crew)'), count: movies.data?.crew.length},
        {id: 'tv-cast', label: t('TV (acting)'), count: tv.data?.cast.length},
        {id: 'tv-crew', label: t('TV (crew)'), count: tv.data?.crew.length},
    ];

    const state: AsyncState<unknown> = active.startsWith('movie') ? movies : tv;
    const cards: MovieCardData[] = {
        'movie-cast': byDate(movies.data?.cast ?? []).map((credit: MovieCastCredit): MovieCardData => movieCastToCard(credit, locale)),
        'movie-crew': byDate(movies.data?.crew ?? []).map((credit: MovieCrewCredit): MovieCardData => movieCrewToCard(credit, locale)),
        'tv-cast': byDate(tv.data?.cast ?? []).map((credit: TvCastCredit): MovieCardData => tvCastToCard(credit, episodes)),
        'tv-crew': byDate(tv.data?.crew ?? []).map((credit: TvCrewCredit): MovieCardData => tvCrewToCard(credit, episodes)),
    }[active];

    return (
        <>
            <Tabs tabs={tabs} active={active} onChange={setActive}/>
            {state.loading && <Loader/>}
            {state.error !== null && <ErrorMessage error={state.error} onRetry={state.reload}/>}
            {!state.loading && state.error === null && <MoviePosterGrid cards={cards} empty={t('No credits here.')}/>}
        </>
    );
}
