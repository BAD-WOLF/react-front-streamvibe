import {useTrailer} from '@content/movies/hooks/useTrailer.ts';
import {embedUrl} from '@content/movies/utils/youtube.ts';
import {ImageWithFallback} from '@layout/figma/ImageWithFallback.tsx';
import {paths} from '@shared/routing/paths.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {
    netflixHeroBannerAnimations, netflixHeroBannerClasses, netflixHeroBannerConstants, netflixHeroBannerStyles,
    netflixHeroBannerTransitions
} from '@shared/styles/ts/home/NetflixHeroBannerStyles.ts';
import type {MovieListItem, MovieVideo} from '@shared/types/movie/index.ts';
import {Info, Play, Volume2, VolumeX} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {type Dispatch, type ReactElement, type RefObject, type SetStateAction, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import type {NonEmptyArray} from '@shared/utils/guards.ts';

type Phase = 'poster' | 'video' | 'ended';

/** Comando para o player do YouTube (o iframe usa enablejsapi=1). */
function sendPlayerCommand(frame: HTMLIFrameElement | null, command: string): void {
    frame?.contentWindow?.postMessage(JSON.stringify({event: 'command', func: command, args: []}), '*');
}

/**
 * NOTA (nov/2026): o banner mostra os filmes em alta de verdade (backdrop_url
 * da API) e, depois de alguns segundos, o trailer do filme
 * (GET /movies/{id}/videos) tocando mudo ao fundo. O TMDB só tem vídeos do
 * YouTube, então o <video> virou um iframe do YouTube, controlado por
 * postMessage (tocar, pausar e o som).
 */
export function NetflixHeroBanner({movies, onPlay}: {
    /** pelo menos um filme: o banner sempre tem o que mostrar */
    movies: NonEmptyArray<MovieListItem>;
    onPlay: (movie: MovieListItem, trailer: MovieVideo | null) => void;
}): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const [currentIndex, setCurrentIndex]: [number, Dispatch<SetStateAction<number>>] = useState<number>(0);
    const [phase, setPhase]: [Phase, Dispatch<SetStateAction<Phase>>] = useState<Phase>('poster');
    const [isMuted, setIsMuted]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(true);
    const [isInViewport, setIsInViewport]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(true);
    const [loadingProgress, setLoadingProgress]: [number, Dispatch<SetStateAction<number>>] = useState<number>(0);

    const bannerRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
    const frameRef: RefObject<HTMLIFrameElement | null> = useRef<HTMLIFrameElement>(null);

    const currentMovie: MovieListItem = movies[currentIndex % movies.length] ?? movies[0];
    const trailer: MovieVideo | null = useTrailer(currentMovie.id).data;
    const {MAX_VIDEO_DURATION, BANNER_DURATION, AUTO_PLAY_DELAY}: typeof netflixHeroBannerConstants = netflixHeroBannerConstants;

    // Intersection Observer para detectar quando o banner sai da viewport
    useEffect((): () => void => {
        const banner: HTMLDivElement | null = bannerRef.current;
        const observer: IntersectionObserver = new IntersectionObserver(
            ([entry]: IntersectionObserverEntry[]): void => {
                if (entry !== undefined) setIsInViewport(entry.isIntersecting);
            },
            {threshold: 0.5} // 50% do banner precisa estar visível
        );
        if (banner !== null) observer.observe(banner);
        return (): void => observer.disconnect();
    }, []);

    // Timer do banner (BANNER_DURATION) e a barra de progresso
    useEffect((): () => void => {
        setPhase('poster');
        setLoadingProgress(0);
        const startTime: number = Date.now();
        const interval: ReturnType<typeof setInterval> = setInterval((): void => {
            const progress: number = (Date.now() - startTime) / BANNER_DURATION * 100;
            if (progress >= 100) {
                setCurrentIndex((previous: number): number => (previous + 1) % movies.length);
            } else {
                setLoadingProgress(progress);
            }
        }, 100);
        return (): void => clearInterval(interval);
    }, [currentIndex, movies.length, BANNER_DURATION]);

    // Auto-play do trailer depois de AUTO_PLAY_DELAY (só com o banner visível)
    useEffect((): (() => void) | undefined => {
        if (trailer === null || phase !== 'poster' || !isInViewport) return undefined;
        const timeout: ReturnType<typeof setTimeout> = setTimeout((): void => setPhase('video'), AUTO_PLAY_DELAY);
        return (): void => clearTimeout(timeout);
    }, [trailer, phase, isInViewport, AUTO_PLAY_DELAY]);

    // O trailer toca no máximo MAX_VIDEO_DURATION segundos
    useEffect((): (() => void) | undefined => {
        if (phase !== 'video') return undefined;
        const timeout: ReturnType<typeof setTimeout> = setTimeout((): void => setPhase('ended'), MAX_VIDEO_DURATION * 1000);
        return (): void => clearTimeout(timeout);
    }, [phase, MAX_VIDEO_DURATION]);

    // Pausar/retomar o vídeo quando sai/entra da viewport
    useEffect((): void => {
        if (phase === 'video') sendPlayerCommand(frameRef.current, isInViewport ? 'playVideo' : 'pauseVideo');
    }, [isInViewport, phase]);

    useEffect((): void => {
        if (phase === 'video') sendPlayerCommand(frameRef.current, isMuted ? 'mute' : 'unMute');
    }, [isMuted, phase]);

    const isVideoPlaying: boolean = phase === 'video' && trailer !== null;

    return (
        <div ref={bannerRef} className={netflixHeroBannerClasses.container} style={{marginBottom: netflixHeroBannerStyles.marginBottom}}>
            {/* Background - Poster/Video */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMovie.id}
                    className={netflixHeroBannerClasses.backgroundContainer}
                    initial={netflixHeroBannerAnimations.backgroundInitial}
                    animate={netflixHeroBannerAnimations.backgroundAnimate}
                    exit={netflixHeroBannerAnimations.backgroundExit}
                    transition={netflixHeroBannerTransitions.background}
                >
                    {/* Poster Image */}
                    <motion.div
                        className={netflixHeroBannerClasses.posterContainer}
                        animate={{opacity: isVideoPlaying ? 0 : netflixHeroBannerAnimations.posterAnimate.opacity}}
                        transition={netflixHeroBannerTransitions.poster}
                    >
                        <ImageWithFallback
                            src={currentMovie.backdrop_url ?? currentMovie.poster_url ?? undefined}
                            alt={currentMovie.title}
                            className={netflixHeroBannerClasses.poster}
                        />
                    </motion.div>

                    {/* Video Layer */}
                    {isVideoPlaying && trailer !== null && (
                        <motion.div
                            className="absolute inset-0 overflow-hidden"
                            initial={netflixHeroBannerAnimations.videoInitial}
                            animate={netflixHeroBannerAnimations.videoAnimate}
                            transition={netflixHeroBannerTransitions.video}
                        >
                            <iframe
                                ref={frameRef}
                                className={netflixHeroBannerClasses.trailerFrame}
                                src={embedUrl(trailer, {
                                    autoplay: 1, mute: 1, controls: 0, loop: 1, playlist: trailer.key, playsinline: 1,
                                    rel: 0, modestbranding: 1, enablejsapi: 1, origin: window.location.origin,
                                })}
                                title={trailer.name}
                                allow="autoplay; encrypted-media"
                                tabIndex={-1}
                                onLoad={(): void => sendPlayerCommand(frameRef.current, isMuted ? 'mute' : 'unMute')}
                            />
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Gradientes de overlay - Otimizado para legibilidade */}
            <div className={netflixHeroBannerClasses.gradientOverlay1}/>
            <div className={netflixHeroBannerClasses.gradientOverlay2}/>
            <div className={netflixHeroBannerClasses.gradientOverlay3}/>

            {/* Overlay escuro adicional para mobile */}
            <div className={netflixHeroBannerClasses.mobileOverlay}/>

            {/* Video Playing Indicator & Mute Button */}
            {isVideoPlaying && (
                <motion.div
                    className={netflixHeroBannerClasses.videoControlsContainer}
                    initial={netflixHeroBannerAnimations.videoControlsInitial}
                    animate={netflixHeroBannerAnimations.videoControlsAnimate}
                    exit={netflixHeroBannerAnimations.videoControlsExit}
                    transition={netflixHeroBannerTransitions.videoControls}
                >
                    {/* Now Playing Badge */}
                    <motion.div
                        className={netflixHeroBannerClasses.nowPlayingBadge}
                        initial={netflixHeroBannerAnimations.nowPlayingInitial}
                        animate={netflixHeroBannerAnimations.nowPlayingAnimate}
                        transition={netflixHeroBannerTransitions.nowPlaying}
                    >
                        <div className={netflixHeroBannerClasses.nowPlayingDot}/>
                        <span className={netflixHeroBannerClasses.nowPlayingText}>{t('NOW PLAYING')}</span>
                    </motion.div>

                    {/* Mute/Unmute Button */}
                    <motion.button
                        type="button"
                        className={netflixHeroBannerClasses.muteButton}
                        onClick={(): void => setIsMuted(!isMuted)}
                        whileHover={netflixHeroBannerAnimations.hover}
                        whileTap={netflixHeroBannerAnimations.tap}
                        aria-label={isMuted ? t('Turn sound on') : t('Turn sound off')}
                    >
                        {isMuted ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6"/> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6"/>}
                    </motion.button>
                </motion.div>
            )}

            {/* Conteúdo */}
            <div className={netflixHeroBannerClasses.contentContainer}>
                <div className={netflixHeroBannerClasses.contentInner}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentMovie.id}
                            initial={netflixHeroBannerAnimations.contentInitial}
                            animate={netflixHeroBannerAnimations.contentAnimate}
                            exit={netflixHeroBannerAnimations.contentExit}
                            transition={netflixHeroBannerTransitions.content}
                            className={netflixHeroBannerClasses.contentWrapper}
                        >
                            {/* Título */}
                            <motion.h1
                                className={netflixHeroBannerClasses.title}
                                style={{textShadow: netflixHeroBannerStyles.titleTextShadow}}
                                initial={netflixHeroBannerAnimations.titleInitial}
                                animate={netflixHeroBannerAnimations.titleAnimate}
                                transition={netflixHeroBannerTransitions.title}
                            >
                                {currentMovie.title}
                            </motion.h1>

                            <div className={netflixHeroBannerClasses.meta}>
                                {currentMovie.vote_count > 0 && (
                                    <span className={netflixHeroBannerClasses.metaRating}>{currentMovie.rating_percentage}%</span>
                                )}
                                {currentMovie.release_year !== null && <span>{currentMovie.release_year}</span>}
                            </div>

                            {/* Descrição */}
                            <motion.p
                                className={netflixHeroBannerClasses.description}
                                style={{textShadow: netflixHeroBannerStyles.descriptionTextShadow}}
                                initial={netflixHeroBannerAnimations.descriptionInitial}
                                animate={netflixHeroBannerAnimations.descriptionAnimate}
                                transition={netflixHeroBannerTransitions.description}
                            >
                                {currentMovie.formatted_overview ?? currentMovie.overview}
                            </motion.p>

                            {/* Botões de Ação */}
                            <motion.div
                                className={netflixHeroBannerClasses.buttonsContainer}
                                initial={netflixHeroBannerAnimations.buttonsInitial}
                                animate={netflixHeroBannerAnimations.buttonsAnimate}
                                transition={netflixHeroBannerTransitions.buttons}
                            >
                                {/* Botão Assistir: o trailer em tela cheia, com som */}
                                <motion.button
                                    type="button"
                                    className={netflixHeroBannerClasses.playButton}
                                    whileHover={netflixHeroBannerAnimations.hover}
                                    whileTap={netflixHeroBannerAnimations.tap}
                                    onClick={(): void => {
                                        setPhase('ended');
                                        onPlay(currentMovie, trailer);
                                    }}
                                >
                                    <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current"/>
                                    <span className="text-xs sm:text-sm md:text-base font-semibold">{t('Watch trailer')}</span>
                                </motion.button>

                                {/* Botão Mais Informações */}
                                <motion.div whileHover={netflixHeroBannerAnimations.hover} whileTap={netflixHeroBannerAnimations.tap}>
                                    <Link to={paths.movie(locale, currentMovie.id)} className={netflixHeroBannerClasses.infoButton}>
                                        <Info className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"/>
                                        <span className="text-xs sm:text-sm md:text-base font-semibold">{t('More info')}</span>
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Progress Indicators - Dots */}
            <div className={netflixHeroBannerClasses.progressContainer}>
                {movies.map((movie: MovieListItem, index: number): ReactElement => (
                    <button
                        key={movie.id}
                        type="button"
                        onClick={(): void => setCurrentIndex(index)}
                        className={netflixHeroBannerClasses.progressButton}
                        aria-label={`${t('Go to slide')} ${index + 1}`}
                    >
                        {/* Background dot */}
                        <div className={netflixHeroBannerClasses.progressDot}/>

                        {/* Active indicator */}
                        {index === currentIndex && (
                            <motion.div
                                className={netflixHeroBannerClasses.progressActive}
                                initial={netflixHeroBannerAnimations.progressActiveInitial}
                                animate={netflixHeroBannerAnimations.progressActiveAnimate}
                                transition={netflixHeroBannerTransitions.progressActive}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Loading Progress Bar */}
            <div className={netflixHeroBannerClasses.progressBarContainer}>
                <div className={netflixHeroBannerClasses.progressBar} style={{width: `${loadingProgress}%`}}/>
            </div>

            {/* Fade to content transition - Gradiente mais suave */}
            <div className={netflixHeroBannerClasses.fadeTransition} style={{background: netflixHeroBannerStyles.fadeTransitionBackground}}/>
        </div>
    );
}
