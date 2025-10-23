import {
    movieCardAnimations, movieCardClasses, movieCardStyles, movieCardTransitions
} from '@shared/styles/ts/home/MovieCardStyles.ts';
import {motion, useInView} from 'motion/react';
import {type ReactElement, type RefObject, useRef, useState} from 'react';

export function MovieCard({title, index}: {
    title: string;
    index: number;
}): ReactElement {
    const [isHovered, setIsHovered]: [boolean, (value: (((prevState: boolean) => boolean) | boolean)) => void] = useState(false);
    const cardRef: RefObject<null> = useRef(null);
    const isInView: boolean = useInView(cardRef, {once: true, margin: "-50px"});

    return (
        <motion.div
            ref={cardRef}
            className={movieCardClasses.container}
            style={{
                minWidth: movieCardStyles.minWidth,
                width: movieCardStyles.width,
                height: movieCardStyles.height,
                background: movieCardStyles.background,
                boxShadow: movieCardStyles.boxShadow,
                margin: movieCardStyles.margin,
                padding: movieCardStyles.padding,
            }}
            onMouseEnter={(): void => setIsHovered(true)}
            onMouseLeave={(): void => setIsHovered(false)}
            onTouchStart={(): void => setIsHovered(true)}
            onTouchEnd={(): void => setIsHovered(false)}
            whileHover={movieCardAnimations.hover}
            whileTap={movieCardAnimations.tap}
            initial={movieCardAnimations.initial}
            animate={isInView ? movieCardAnimations.animate : movieCardAnimations.notInView}
            transition={{
                duration: movieCardTransitions.main.duration,
                delay: index * movieCardTransitions.main.delay,
                ease: [0.22, 1, 0.36, 1]
            }}
        >
            {/* Card Background Gradient */}
            <div
                className={movieCardClasses.backgroundOverlay}
                style={{
                    background: movieCardStyles.backgroundOverlay,
                }}
            />

            {/* Content */}
            <div className={movieCardClasses.content}>
                <p className={movieCardClasses.title} style={{fontSize: movieCardStyles.titleFontSize}}>{title}</p>
            </div>

            {/* Hover Overlay */}
            <motion.div
                className={movieCardClasses.hoverOverlay}
                initial={{opacity: 0}}
                animate={{opacity: isHovered ? 1 : 0}}
                transition={movieCardTransitions.hover}
            >
                <span className={movieCardClasses.hoverText} style={{fontSize: movieCardStyles.hoverTextFontSize}}>View Details</span>
            </motion.div>
        </motion.div>
    );
}
  