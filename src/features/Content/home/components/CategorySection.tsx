import {MovieCard} from '@content/home/components/MovieCard.tsx';
import {
    categorySectionAnimations, categorySectionClasses, categorySectionStyles
} from '@shared/styles/ts/home/CategorySectionStyles.ts';
import {t} from 'i18next';
import {motion, useInView} from 'motion/react';
import {type MouseEvent, type ReactElement, type RefObject, type TouchEvent, useRef, useState} from 'react';

export function CategorySection({title, movieCount = 8}: {
    title: string;
    movieCount: number;
}): ReactElement {
    const scrollContainerRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
    const sectionRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
    const isInView: boolean = useInView(sectionRef, {once: true, margin: "-100px"});
    const [isDragging, setIsDragging]: [boolean, (value: (((prevState: boolean) => boolean) | boolean)) => void] = useState(false);
    const [startX, setStartX]: [number, (value: (((prevState: number) => number) | number)) => void] = useState(0);
    const [scrollLeft, setScrollLeft]: [number, (value: (((prevState: number) => number) | number)) => void] = useState(0);

    // Mouse events
    const handleMouseDown: (e: MouseEvent<HTMLDivElement>) => void = (e: MouseEvent<HTMLDivElement>): void => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
        scrollContainerRef.current.style.cursor = 'grabbing';
        scrollContainerRef.current.style.userSelect = 'none';
    };

    const handleMouseLeave: () => void = (): void => {
        setIsDragging(false);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.cursor = 'grab';
        }
    };

    const handleMouseUp: () => void = (): void => {
        setIsDragging(false);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.cursor = 'grab';
        }
    };

    const handleMouseMove: (e: MouseEvent<HTMLDivElement>) => void = (e: MouseEvent<HTMLDivElement>): void => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x: number = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk: number = (
            x - startX
        ) * 2; // Multiply by 2 for faster scrolling
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    // Touch events
    const handleTouchStart: (e: TouchEvent<HTMLDivElement>) => void = (e: TouchEvent<HTMLDivElement>): void => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleTouchMove: (e: TouchEvent<HTMLDivElement>) => void = (e: TouchEvent<HTMLDivElement>): void => {
        if (!isDragging || !scrollContainerRef.current) return;
        const x: number = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
        const walk: number = (
            x - startX
        ) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd: () => void = (): void => {
        setIsDragging(false);
    };

    return (
        <section ref={sectionRef} className={categorySectionClasses.section}>
            {/* Section Title - com padding lateral */}
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

            {/* Horizontal Scrolling Grid with Drag - com "peek" effect */}
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
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {Array.from({length: movieCount}, (_, i): ReactElement => (
                    <MovieCard key={i} title={`${t('Movie')} ${i + 1}`} index={i}/>
                ))}
            </div>
        </section>
    );
}