import {
    featuredMovieAnimations, featuredMovieClasses, featuredMovieTransitions
} from '@shared/styles/ts/home/FeaturedMovieStyles.ts';
import type {Movie} from '@shared/types/Movie.ts';
import {motion} from 'motion/react';
import {type ReactElement, useState} from 'react';

export function FeaturedMovie({title, description, poster_path, videoUrl, index}: Movie): ReactElement {
    const [isHovered, setIsHovered]: [boolean, (value: (((prevState: boolean) => boolean) | boolean)) => void] = useState(false);

    return (
        <motion.div
            className={featuredMovieClasses.container}
            onMouseEnter={(): void => setIsHovered(true)}
            onMouseLeave={(): void => setIsHovered(false)}
            onTouchStart={(): void => setIsHovered(true)}
            onTouchEnd={(): void => setIsHovered(false)}
            whileHover={featuredMovieAnimations.hover}
            whileTap={featuredMovieAnimations.tap}
            initial={featuredMovieAnimations.initial}
            animate={featuredMovieAnimations.animate}
            transition={{
                duration: featuredMovieTransitions.main.duration, delay: index * featuredMovieTransitions.main.delay
            }}
        >
            {/* Video Layer */}
            {videoUrl && (
                <motion.video
                    src={videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={featuredMovieClasses.video}
                    initial={featuredMovieAnimations.videoInitial}
                    animate={{
                        opacity: isHovered ? featuredMovieAnimations.videoHovered.opacity :
                            featuredMovieAnimations.videoInitial.opacity
                    }}
                    transition={featuredMovieTransitions.video}
                />
            )}

            {/* Poster Layer */}
            <motion.img
                src={poster_path}
                alt={title}
                className={featuredMovieClasses.poster}
                initial={featuredMovieAnimations.posterInitial}
                animate={{
                    opacity: isHovered ? featuredMovieAnimations.posterHovered.opacity :
                        featuredMovieAnimations.posterInitial.opacity
                }}
                transition={featuredMovieTransitions.poster}
            />

            {/* Bottom Overlay with Text */}
            <div className={featuredMovieClasses.overlay}>
                <h3 className={featuredMovieClasses.title}>{title}</h3>
                <p className={featuredMovieClasses.description}>{description}</p>
            </div>
        </motion.div>
    );
}
