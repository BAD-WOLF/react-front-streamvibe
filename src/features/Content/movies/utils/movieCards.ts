import type {MovieCardData} from '@content/types/MovieCardData.ts';
import type {Locale} from '@i18n/locales.ts';
import {paths} from '@shared/routing/paths.ts';
import type {MovieListItem} from '@shared/types/movie/index.ts';
import type {MovieCastCredit, MovieCrewCredit, TvCastCredit, TvCrewCredit} from '@shared/types/person/index.ts';
import {textOr} from '@shared/utils/guards.ts';

function ratingOf(percentage: number, votes: number): number | null {
    return votes > 0 ? percentage : null;
}

/** Remove repetidos (o TMDB às vezes repete um filme entre páginas). */
export function uniqueById<T extends { id: number }>(items: T[]): T[] {
    const seen: Set<number> = new Set<number>();
    return items.filter((item: T): boolean => !seen.has(item.id) && Boolean(seen.add(item.id)));
}

export function movieToCard(movie: MovieListItem, locale: Locale): MovieCardData {
    return {
        key: `movie-${movie.id}`,
        title: movie.title,
        imageUrl: movie.poster_url ?? movie.thumbnail_url,
        year: movie.release_year,
        rating: ratingOf(movie.rating_percentage, movie.vote_count),
        to: paths.movie(locale, movie.id),
    };
}

export function movieCastToCard(credit: MovieCastCredit, locale: Locale): MovieCardData {
    return {
        key: `cast-${credit.credit_id}`,
        title: credit.title,
        imageUrl: credit.poster_url,
        year: credit.release_year,
        rating: ratingOf(credit.rating_percentage, credit.vote_count),
        subtitle: textOr(credit.character, null),
        to: paths.movie(locale, credit.id),
    };
}

export function movieCrewToCard(credit: MovieCrewCredit, locale: Locale): MovieCardData {
    return {
        key: `crew-${credit.credit_id}`,
        title: credit.title,
        imageUrl: credit.poster_url,
        year: credit.release_year,
        rating: ratingOf(credit.rating_percentage, credit.vote_count),
        subtitle: credit.job,
        to: paths.movie(locale, credit.id),
    };
}

// NOTA (nov/2026): a API não tem rota de detalhes de série; os créditos de TV
// aparecem sem link.
export function tvCastToCard(credit: TvCastCredit, episodesLabel: string): MovieCardData {
    return {
        key: `tv-cast-${credit.credit_id}`,
        title: credit.name,
        imageUrl: credit.poster_url,
        year: credit.first_air_year,
        rating: ratingOf(credit.rating_percentage, credit.vote_count),
        subtitle: textOr([credit.character, credit.episode_count > 0 ? `${credit.episode_count} ${episodesLabel}` : null].filter(Boolean).join(' · '), null),
    };
}

export function tvCrewToCard(credit: TvCrewCredit, episodesLabel: string): MovieCardData {
    return {
        key: `tv-crew-${credit.credit_id}`,
        title: credit.name,
        imageUrl: credit.poster_url,
        year: credit.first_air_year,
        rating: ratingOf(credit.rating_percentage, credit.vote_count),
        subtitle: textOr([credit.job, credit.episode_count > 0 ? `${credit.episode_count} ${episodesLabel}` : null].filter(Boolean).join(' · '), null),
    };
}
