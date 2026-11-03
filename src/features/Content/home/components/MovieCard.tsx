import type {MovieCardData} from '@content/types/MovieCardData.ts';
import {
    movieCardAnimations, movieCardClasses, movieCardStyles, movieCardTransitions
} from '@shared/styles/ts/home/MovieCardStyles.ts';
import {motion, type MotionStyle, useInView} from 'motion/react';
import {type Dispatch, type ReactElement, type ReactNode, type RefObject, type SetStateAction, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import type {Translation} from '@i18n/translation.ts';
import {hasText} from '@shared/utils/guards.ts';

export function MovieCard({card, index, fluid = false}: {
    card: MovieCardData;
    index: number;
    /** true: fills the grid cell (lists); false: fixed width (horizontal rows) */
    fluid?: boolean | undefined;
}): ReactElement {
    const {t}: Translation = useTranslation();
    const [isHovered, setIsHovered]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const cardRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
    const isInView: boolean = useInView(cardRef, {once: true, margin: "-50px"});

    const size: MotionStyle = fluid
        ? {width: movieCardStyles.fluidWidth, aspectRatio: movieCardStyles.fluidAspectRatio}
        : {minWidth: movieCardStyles.minWidth, width: movieCardStyles.width, height: movieCardStyles.height};
    const meta: string = [card.year, card.subtitle].filter(Boolean).join(' · ');

    const content: ReactNode = (
        <>
            <div className={movieCardClasses.backgroundOverlay} style={{background: movieCardStyles.backgroundOverlay}}/>

            {hasText(card.imageUrl) ? (
                <img className={movieCardClasses.poster} src={card.imageUrl} alt={card.title} loading="lazy" draggable={false}/>
            ) : (
                <div className={movieCardClasses.content}>
                    <p className={movieCardClasses.title} style={{fontSize: movieCardStyles.titleFontSize}}>{card.title}</p>
                </div>
            )}

            {card.rating !== null && <span className={movieCardClasses.rating}>{card.rating}%</span>}

            <div className={movieCardClasses.caption}>
                <p className={movieCardClasses.captionTitle}>{card.title}</p>
                {meta !== '' && <p className={movieCardClasses.captionMeta}>{meta}</p>}
            </div>

            {hasText(card.to) && (
                <motion.div
                    className={movieCardClasses.hoverOverlay}
                    initial={{opacity: 0}}
                    animate={{opacity: isHovered ? 1 : 0}}
                    transition={movieCardTransitions.hover}
                >
                    <span className={movieCardClasses.hoverText} style={{fontSize: movieCardStyles.hoverTextFontSize}}>{t('View Details')}</span>
                </motion.div>
            )}
        </>
    );

    return (
        <motion.div
            ref={cardRef}
            className={movieCardClasses.container}
            style={{
                ...size,
                background: movieCardStyles.background,
                boxShadow: movieCardStyles.boxShadow,
                margin: movieCardStyles.margin,
                padding: movieCardStyles.padding,
            }}
            onMouseEnter={(): void => setIsHovered(true)}
            onMouseLeave={(): void => setIsHovered(false)}
            whileHover={movieCardAnimations.hover}
            whileTap={movieCardAnimations.tap}
            initial={movieCardAnimations.initial}
            animate={isInView ? movieCardAnimations.animate : movieCardAnimations.notInView}
            transition={{
                duration: movieCardTransitions.main.duration,
                delay: Math.min(index, 12) * movieCardTransitions.main.delay,
                ease: movieCardTransitions.main.ease
            }}
        >
            {hasText(card.to) ? (
                <Link to={card.to} className={movieCardClasses.link} draggable={false} aria-label={card.title}>{content}</Link>
            ) : content}
        </motion.div>
    );
}
