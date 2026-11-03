import {MovieCard} from '@content/home/components/MovieCard.tsx';
import type {MovieCardData} from '@content/types/MovieCardData.ts';
import {EmptyState} from '@shared/components/feedback/EmptyState.tsx';
import {movieListClasses} from '@shared/styles/ts/movies/MovieListStyles.ts';
import type {ReactElement, ReactNode} from 'react';

export function MoviePosterGrid({cards, empty}: { cards: MovieCardData[]; empty: ReactNode }): ReactElement {
    if (cards.length === 0) return <EmptyState>{empty}</EmptyState>;

    return (
        <div className={movieListClasses.grid}>
            {cards.map((card: MovieCardData, index: number): ReactElement => <MovieCard key={card.key} card={card} index={index} fluid/>)}
        </div>
    );
}
