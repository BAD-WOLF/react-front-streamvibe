import {MovieCard} from '@content/home/components/MovieCard.tsx';
import type {MovieCardData} from '@content/types/MovieCardData.ts';
import {EmptyState} from '@shared/components/feedback/EmptyState.tsx';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {
    categorySectionAnimations, categorySectionClasses, categorySectionStyles
} from '@shared/styles/ts/home/CategorySectionStyles.ts';
import {movieCardStyles} from '@shared/styles/ts/home/MovieCardStyles.ts';
import {motion, useInView} from 'motion/react';
import {type Dispatch, type MouseEvent, type ReactElement, type ReactNode, type RefObject, type SetStateAction, type TouchEvent, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import type {Translation} from '@i18n/translation.ts';
import {hasText} from '@shared/utils/guards.ts';

const PLACEHOLDER_COUNT: number = 8;
const DRAG_THRESHOLD: number = 5;

export function CategorySection({
    title, cards, loading = false, error = null, onRetry, actions, seeAllTo, hasMore = false, loadingMore = false, onLoadMore,
}: {
    title: string;
    cards: MovieCardData[];
    loading?: boolean | undefined;
    error?: unknown;
    onRetry?: (() => void) | undefined;
    actions?: ReactNode;
    seeAllTo?: string | undefined;
    hasMore?: boolean | undefined;
    loadingMore?: boolean | undefined;
    onLoadMore?: (() => void) | undefined;
}): ReactElement {
    const {t}: Translation = useTranslation();
    const scrollContainerRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
    const sectionRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
    const isInView: boolean = useInView(sectionRef, {once: true, margin: "-100px"});
    const [isDragging, setIsDragging]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const [startX, setStartX]: [number, Dispatch<SetStateAction<number>>] = useState<number>(0);
    const [scrollLeft, setScrollLeft]: [number, Dispatch<SetStateAction<number>>] = useState<number>(0);
    // NOTA (nov/2026): os cards agora são links; um arraste não pode virar clique.
    const draggedRef: RefObject<boolean> = useRef<boolean>(false);

    const beginDrag: (pageX: number) => void = (pageX: number): void => {
        const container: HTMLDivElement | null = scrollContainerRef.current;
        if (container === null) return;
        setIsDragging(true);
        draggedRef.current = false;
        setStartX(pageX - container.offsetLeft);
        setScrollLeft(container.scrollLeft);
    };

    const moveDrag: (pageX: number) => void = (pageX: number): void => {
        const container: HTMLDivElement | null = scrollContainerRef.current;
        if (!isDragging || container === null) return;
        const walk: number = (pageX - container.offsetLeft - startX) * 2; // Multiply by 2 for faster scrolling
        if (Math.abs(walk) > DRAG_THRESHOLD) draggedRef.current = true;
        container.scrollLeft = scrollLeft - walk;
    };

    const endDrag: () => void = (): void => {
        setIsDragging(false);
        if (scrollContainerRef.current !== null) scrollContainerRef.current.style.cursor = 'grab';
    };

    // Mouse events
    const handleMouseDown: (e: MouseEvent<HTMLDivElement>) => void = (e: MouseEvent<HTMLDivElement>): void => {
        beginDrag(e.pageX);
        if (scrollContainerRef.current !== null) scrollContainerRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove: (e: MouseEvent<HTMLDivElement>) => void = (e: MouseEvent<HTMLDivElement>): void => {
        if (!isDragging) return;
        e.preventDefault();
        moveDrag(e.pageX);
    };

    // Touch events (o primeiro dedo na tela)
    const handleTouchStart: (e: TouchEvent<HTMLDivElement>) => void = (e: TouchEvent<HTMLDivElement>): void => {
        const pageX: number | undefined = e.touches[0]?.pageX;
        if (pageX !== undefined) beginDrag(pageX);
    };
    const handleTouchMove: (e: TouchEvent<HTMLDivElement>) => void = (e: TouchEvent<HTMLDivElement>): void => {
        const pageX: number | undefined = e.touches[0]?.pageX;
        if (pageX !== undefined) moveDrag(pageX);
    };

    const handleClickCapture: (e: MouseEvent<HTMLDivElement>) => void = (e: MouseEvent<HTMLDivElement>): void => {
        if (!draggedRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        draggedRef.current = false;
    };

    const showPlaceholders: boolean = loading && cards.length === 0;

    return (
        <section ref={sectionRef} className={categorySectionClasses.section}>
            <div className={categorySectionClasses.header}>
                <motion.h2
                    className={categorySectionClasses.title}
                    style={{
                        fontSize: categorySectionStyles.titleFontSize,
                        letterSpacing: categorySectionStyles.titleLetterSpacing,
                        filter: categorySectionStyles.titleFilter,
                    }}
                    initial={categorySectionAnimations.titleInitial}
                    animate={isInView ? categorySectionAnimations.titleAnimate : categorySectionAnimations.titleInitial}
                    transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1]}}
                >
                    {title}
                </motion.h2>
                <div className={categorySectionClasses.headerActions}>
                    {actions}
                    {hasText(seeAllTo) && <Link className={categorySectionClasses.seeAll} to={seeAllTo}>{t('See all')}</Link>}
                </div>
            </div>

            {error !== null && error !== undefined && (
                <div className={categorySectionClasses.message}><ErrorMessage error={error} onRetry={onRetry}/></div>
            )}
            {!loading && error === null && cards.length === 0 && (
                <div className={categorySectionClasses.message}><EmptyState>{t('Nothing here yet.')}</EmptyState></div>
            )}

            {(showPlaceholders || cards.length > 0) && (
                // Horizontal Scrolling Grid with Drag - com "peek" effect
                <div
                    ref={scrollContainerRef}
                    className={categorySectionClasses.scrollContainer}
                    style={{
                        paddingLeft: categorySectionStyles.scrollPaddingLeft,
                        paddingRight: categorySectionStyles.scrollPaddingRight,
                        paddingBottom: categorySectionStyles.scrollPaddingBottom,
                        paddingTop: categorySectionStyles.scrollPaddingTop,
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={endDrag}
                    onMouseUp={endDrag}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={endDrag}
                    onClickCapture={handleClickCapture}
                >
                    {showPlaceholders
                        ? Array.from({length: PLACEHOLDER_COUNT}, (_: unknown, i: number): ReactElement => (
                            <MovieCard key={i} index={i} card={{key: `placeholder-${i}`, title: t('Loading...'), imageUrl: null, year: null, rating: null}}/>
                        ))
                        : cards.map((card: MovieCardData, i: number): ReactElement => <MovieCard key={card.key} card={card} index={i}/>)}

                    {hasMore && onLoadMore !== undefined && (
                        <button
                            type="button"
                            className={categorySectionClasses.loadMore}
                            style={{minWidth: movieCardStyles.minWidth}}
                            disabled={loadingMore}
                            onClick={onLoadMore}
                        >
                            {loadingMore ? t('Loading...') : t('Load more')}
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}
