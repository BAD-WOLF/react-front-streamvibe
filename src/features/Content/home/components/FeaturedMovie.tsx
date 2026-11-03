import {
    featuredMovieAnimations, featuredMovieClasses, featuredMovieTransitions
} from '@shared/styles/ts/home/FeaturedMovieStyles.ts';
import type {MovieListItem} from '@shared/types/movie/index.ts';
import {motion} from 'motion/react';
import {type Dispatch, type ReactElement, type SetStateAction, useState} from 'react';
import {Link} from 'react-router-dom';
import {hasText} from '@shared/utils/guards.ts';

// NOTA (nov/2026): o card de destaque passou a receber um filme da API. A
// camada de vídeo (mp4) saiu: o TMDB só tem vídeos do YouTube, que abrem no
// VideoModal da página do filme.
export function FeaturedMovie({movie, index, to}: { movie: MovieListItem; index: number; to: string }): ReactElement {
    const [isHovered, setIsHovered]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const image: string | null = movie.backdrop_url ?? movie.poster_url;

    return (
        <motion.div
            className={featuredMovieClasses.container}
            onMouseEnter={(): void => setIsHovered(true)}
            onMouseLeave={(): void => setIsHovered(false)}
            whileHover={featuredMovieAnimations.hover}
            whileTap={featuredMovieAnimations.tap}
            initial={featuredMovieAnimations.initial}
            animate={featuredMovieAnimations.animate}
            transition={{
                duration: featuredMovieTransitions.main.duration, delay: index * featuredMovieTransitions.main.delay
            }}
        >
            <Link to={to} className="block w-full h-full" aria-label={movie.title}>
                {/* Poster Layer */}
                {hasText(image) && (
                    <motion.img
                        src={image}
                        alt={movie.title}
                        className={featuredMovieClasses.poster}
                        initial={featuredMovieAnimations.posterInitial}
                        animate={{opacity: isHovered ? 1 : featuredMovieAnimations.posterInitial.opacity}}
                        transition={featuredMovieTransitions.poster}
                    />
                )}

                {/* Bottom Overlay with Text */}
                <div className={featuredMovieClasses.overlay}>
                    <h3 className={featuredMovieClasses.title}>{movie.title}</h3>
                    <p className={featuredMovieClasses.description}>{movie.formatted_overview ?? movie.overview}</p>
                </div>
            </Link>
        </motion.div>
    );
}
