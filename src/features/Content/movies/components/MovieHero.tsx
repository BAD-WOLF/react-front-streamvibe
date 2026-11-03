import {ImageWithFallback} from '@layout/figma/ImageWithFallback.tsx';
import {movieDetailsClasses} from '@shared/styles/ts/movies/MovieDetailsStyles.ts';
import type {Genre, MovieDetailsResponse, MovieVideo} from '@shared/types/movie/index.ts';
import {ExternalLink, Play} from 'lucide-react';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';
import {hasText} from '@shared/utils/guards.ts';

export function MovieHero({movie, trailer, onPlay}: {
    movie: MovieDetailsResponse;
    trailer: MovieVideo | null;
    onPlay: (video: MovieVideo) => void;
}): ReactElement {
    const {t}: Translation = useTranslation();

    return (
        <section className={movieDetailsClasses.hero}>
            {hasText(movie.backdrop_url) && <img className={movieDetailsClasses.heroBackdrop} src={movie.backdrop_url} alt=""/>}
            <div className={movieDetailsClasses.heroShade}/>
            <div className={movieDetailsClasses.heroShadeSide}/>

            <div className={movieDetailsClasses.heroContent}>
                {hasText(movie.poster_url) && (
                    <ImageWithFallback className={movieDetailsClasses.poster} src={movie.poster_url} alt={movie.title}/>
                )}

                <div className={movieDetailsClasses.info}>
                    <h1 className={movieDetailsClasses.title}>{movie.title}</h1>
                    {movie.original_title !== movie.title && <p className={movieDetailsClasses.originalTitle}>{movie.original_title}</p>}
                    {hasText(movie.tagline) && <p className={movieDetailsClasses.tagline}>{movie.tagline}</p>}

                    <div className={movieDetailsClasses.meta}>
                        {movie.vote_count > 0 && (
                            <span className={movieDetailsClasses.rating} title={t('{{count}} votes', {count: movie.vote_count})}>
                                {movie.rating_percentage}%
                            </span>
                        )}
                        {movie.release_year !== null && <span>{movie.release_year}</span>}
                        {hasText(movie.formatted_runtime) && <span>{movie.formatted_runtime}</span>}
                        {movie.adult && <span>18+</span>}
                    </div>

                    {movie.genres.length > 0 && (
                        <div className={movieDetailsClasses.genres}>
                            {movie.genres.map((genre: Genre): ReactElement => <span key={genre.id} className={movieDetailsClasses.genre}>{genre.name}</span>)}
                        </div>
                    )}

                    {movie.overview !== '' && <p className={movieDetailsClasses.overview}>{movie.overview}</p>}

                    <div className={movieDetailsClasses.actions}>
                        {trailer !== null && (
                            <button type="button" className={movieDetailsClasses.primaryButton} onClick={(): void => onPlay(trailer)}>
                                <Play className="w-5 h-5 fill-current"/> {t('Watch trailer')}
                            </button>
                        )}
                        {hasText(movie.homepage) && (
                            <a className={movieDetailsClasses.secondaryButton} href={movie.homepage} target="_blank" rel="noreferrer">
                                <ExternalLink className="w-4 h-4"/> {t('Official site')}
                            </a>
                        )}
                        {hasText(movie.imdb_id) && (
                            <a className={movieDetailsClasses.secondaryButton} href={`https://www.imdb.com/title/${movie.imdb_id}/`} target="_blank" rel="noreferrer">
                                <ExternalLink className="w-4 h-4"/> IMDb
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
