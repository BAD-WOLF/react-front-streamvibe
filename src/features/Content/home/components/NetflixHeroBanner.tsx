import {ImageWithFallback} from '@layout/figma/ImageWithFallback.tsx';
import {
    netflixHeroBannerAnimations, netflixHeroBannerClasses, netflixHeroBannerConstants, netflixHeroBannerStyles,
    netflixHeroBannerTransitions
} from '@shared/styles/ts/home/NetflixHeroBannerStyles.ts';
import type {Movie} from '@shared/types/Movie.ts';
import {t} from 'i18next';
import {Info, Play, Volume2, VolumeX} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {type ReactElement, useEffect, useRef, useState} from 'react';

export function NetflixHeroBanner({movies}: { movies: Movie[]; }): ReactElement {
    const [currentIndex, setCurrentIndex]: [number, (value: (((prevState: number) => number) | number)) => void] = useState(0);
    const [isVideoPlaying, setIsVideoPlaying]: [boolean, (value: (((prevState: boolean) => boolean) | boolean)) => void] = useState(false);
    const [loadingProgress, setLoadingProgress]: [number, (value: (((prevState: number) => number) | number)) => void] = useState(0);
    const [isMuted, setIsMuted]: [boolean, (value: (((prevState: boolean) => boolean) | boolean)) => void] = useState(true);
    const [videoHasPlayed, setVideoHasPlayed]: [boolean, (value: (((prevState: boolean) => boolean) | boolean)) => void] = useState(false);
    const [isInViewport, setIsInViewport]: [boolean, (value: (((prevState: boolean) => boolean) | boolean)) => void] = useState(true);
    const [videoTimeElapsed, setVideoTimeElapsed]: [number, (value: (((prevState: number) => number) | number)) => void] = useState(0);

    const videoRef: React.RefObject<HTMLVideoElement | null> = useRef<HTMLVideoElement>(null);
    const bannerRef: React.RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
    const autoPlayTimeoutRef: React.RefObject<NodeJS.Timeout | null> = useRef<NodeJS.Timeout | null>(null);
    const bannerTimerRef: React.RefObject<NodeJS.Timeout | null> = useRef<NodeJS.Timeout | null>(null);
    const videoTimerRef: React.RefObject<NodeJS.Timeout | null> = useRef<NodeJS.Timeout | null>(null);

    const currentMovie: Movie = movies[currentIndex];
    const MAX_VIDEO_DURATION: number = netflixHeroBannerConstants.MAX_VIDEO_DURATION;
    const BANNER_DURATION: number = netflixHeroBannerConstants.BANNER_DURATION;

    // Intersection Observer para detectar quando o banner sai da viewport
    useEffect((): () => void => {
        const observer: IntersectionObserver = new IntersectionObserver(
            ([entry]): void => {
                setIsInViewport(entry.isIntersecting);
            },
            {
                threshold: 0.5, // 50% do banner precisa estar visível
            }
        );

        if (bannerRef.current) {
            observer.observe(bannerRef.current);
        }

        return (): void => {
            if (bannerRef.current) {
                observer.unobserve(bannerRef.current);
            }
        };
    }, []);

    // Pausar/retomar vídeo quando sai/entra da viewport
    useEffect((): void => {
        const video: HTMLVideoElement | null = videoRef.current;
        if (!video) return;

        if (isInViewport) {
            if (isVideoPlaying && videoTimeElapsed < MAX_VIDEO_DURATION) {
                video.play().catch((): void => {
                });
            }
        } else {
            if (isVideoPlaying) {
                video.pause();
            }
        }
    }, [isInViewport, isVideoPlaying, videoTimeElapsed]);

    // Timer do banner (sempre 20 segundos)
    useEffect((): () => void => {
        bannerTimerRef.current = setTimeout((): void => {
            setCurrentIndex((prev: number): number => (
                prev + 1
            ) % movies.length);
            setLoadingProgress(0);
            setIsVideoPlaying(false);
            setVideoHasPlayed(false);
            setVideoTimeElapsed(0);
        }, BANNER_DURATION);

        return (): void => {
            if (bannerTimerRef.current) {
                clearTimeout(bannerTimerRef.current);
            }
        };
    }, [currentIndex, movies.length]);

    // Progress bar do banner (20s sempre)
    useEffect((): () => void => {
        setLoadingProgress(0);
        const startTime: number = Date.now();

        const interval: NodeJS.Timeout = setInterval((): void => {
            const elapsed: number = Date.now() - startTime;
            const progress: number = (
                elapsed / BANNER_DURATION
            ) * 100;
            setLoadingProgress(Math.min(progress, 100));
        }, 100);

        return (): void => clearInterval(interval);
    }, [currentIndex]);

    // Auto-play vídeo após 3 segundos (apenas se não foi reproduzido ainda)
    useEffect((): void | (() => void) => {
        if (currentMovie.videoUrl && !videoHasPlayed) {
            autoPlayTimeoutRef.current = setTimeout((): void => {
                setIsVideoPlaying(true);
                setVideoHasPlayed(true);
            }, netflixHeroBannerConstants.AUTO_PLAY_DELAY);

            return (): void => {
                if (autoPlayTimeoutRef.current) {
                    clearTimeout(autoPlayTimeoutRef.current);
                }
            };
        }
    }, [currentIndex, currentMovie.videoUrl, videoHasPlayed]);

    // Controlar tempo do vídeo (máximo 15 segundos)
    useEffect((): void | (() => void) => {
        if (!isVideoPlaying || !isInViewport) return;

        const startTime: number = videoTimeElapsed;
        const startRealTime: number = Date.now();

        videoTimerRef.current = setInterval((): void => {
            const elapsed: number = startTime + (
                Date.now() - startRealTime
            ) / 1000;
            setVideoTimeElapsed(elapsed);

            if (elapsed >= MAX_VIDEO_DURATION) {
                setIsVideoPlaying(false);
                if (videoRef.current) {
                    videoRef.current.pause();
                }
                if (videoTimerRef.current) {
                    clearInterval(videoTimerRef.current);
                }
            }
        }, 100);

        return (): void => {
            if (videoTimerRef.current) {
                clearInterval(videoTimerRef.current);
            }
        };
    }, [isVideoPlaying, isInViewport, videoTimeElapsed]);

    // Play/pause vídeo
    useEffect((): void => {
        const video: HTMLVideoElement | null = videoRef.current;
        if (!video) return;

        if (isVideoPlaying && isInViewport && videoTimeElapsed < MAX_VIDEO_DURATION) {
            video.play().catch((): void => {
            });
        } else {
            video.pause();
        }
    }, [isVideoPlaying, isInViewport, videoTimeElapsed]);

    // Reset quando mudar de slide
    useEffect((): void => {
        const video: HTMLVideoElement | null = videoRef.current;
        if (video) {
            video.currentTime = 0;
        }
        setVideoTimeElapsed(0);
        setVideoHasPlayed(false);
    }, [currentIndex]);

    return (
        <div
            ref={bannerRef}
            className={netflixHeroBannerClasses.container}
            style={{marginBottom: netflixHeroBannerStyles.marginBottom}}
        >
            {/* Background - Poster/Video */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    className={netflixHeroBannerClasses.backgroundContainer}
                    initial={netflixHeroBannerAnimations.backgroundInitial}
                    animate={netflixHeroBannerAnimations.backgroundAnimate}
                    exit={netflixHeroBannerAnimations.backgroundExit}
                    transition={{duration: 1, ease: 'easeInOut'}}
                >
                    {/* Poster Image */}
                    <motion.div
                        className={netflixHeroBannerClasses.posterContainer}
                        animate={{opacity: isVideoPlaying ? 0 : netflixHeroBannerAnimations.posterAnimate.opacity}}
                        transition={netflixHeroBannerTransitions.poster}
                    >
                        <ImageWithFallback
                            src={currentMovie.poster_path}
                            alt={currentMovie.title}
                            className={netflixHeroBannerClasses.poster}
                        />
                    </motion.div>

                    {/* Video Layer */}
                    {currentMovie.videoUrl && (
                        <motion.video
                            ref={videoRef}
                            src={currentMovie.videoUrl}
                            muted={isMuted}
                            playsInline
                            className={netflixHeroBannerClasses.video}
                            initial={netflixHeroBannerAnimations.videoInitial}
                            animate={{
                                opacity: isVideoPlaying && videoTimeElapsed < MAX_VIDEO_DURATION ?
                                    netflixHeroBannerAnimations.videoAnimate.opacity :
                                    netflixHeroBannerAnimations.videoInitial.opacity
                            }}
                            transition={netflixHeroBannerTransitions.video}
                        />
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
            {isVideoPlaying && currentMovie.videoUrl && videoTimeElapsed < MAX_VIDEO_DURATION && (
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
                        className={netflixHeroBannerClasses.muteButton}
                        onClick={(): void => setIsMuted(!isMuted)}
                        whileHover={netflixHeroBannerAnimations.hover}
                        whileTap={netflixHeroBannerAnimations.tap}
                    >
                        {isMuted ? (
                            <VolumeX className="w-5 h-5 sm:w-6 sm:h-6"/>
                        ) : (
                            <Volume2 className="w-5 h-5 sm:w-6 sm:h-6"/>
                        )}
                    </motion.button>
                </motion.div>
            )}

            {/* Conteúdo */}
            <div className={netflixHeroBannerClasses.contentContainer}>
                <div className={netflixHeroBannerClasses.contentInner}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={netflixHeroBannerAnimations.contentInitial}
                            animate={netflixHeroBannerAnimations.contentAnimate}
                            exit={netflixHeroBannerAnimations.contentExit}
                            transition={{duration: 0.8, ease: 'easeOut'}}
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

                            {/* Descrição */}
                            <motion.p
                                className={netflixHeroBannerClasses.description}
                                style={{textShadow: netflixHeroBannerStyles.descriptionTextShadow}}
                                initial={netflixHeroBannerAnimations.descriptionInitial}
                                animate={netflixHeroBannerAnimations.descriptionAnimate}
                                transition={netflixHeroBannerTransitions.description}
                            >
                                {currentMovie.description}
                            </motion.p>

                            {/* Botões de Ação */}
                            <motion.div
                                className={netflixHeroBannerClasses.buttonsContainer}
                                initial={netflixHeroBannerAnimations.buttonsInitial}
                                animate={netflixHeroBannerAnimations.buttonsAnimate}
                                transition={netflixHeroBannerTransitions.buttons}
                            >
                                {/* Botão Assistir */}
                                <motion.button
                                    className={netflixHeroBannerClasses.playButton}
                                    whileHover={netflixHeroBannerAnimations.hover}
                                    whileTap={netflixHeroBannerAnimations.tap}
                                >
                                    <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current"/>
                                    <span className="text-xs sm:text-sm md:text-base font-semibold">{t(
                                        'Assistir')}</span>
                                </motion.button>

                                {/* Botão Mais Informações */}
                                <motion.button
                                    className={netflixHeroBannerClasses.infoButton}
                                    whileHover={netflixHeroBannerAnimations.hover}
                                    whileTap={netflixHeroBannerAnimations.tap}
                                >
                                    <Info className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"/>
                                    <span className="text-xs sm:text-sm md:text-base font-semibold">{t(
                                        'Mais informações')}</span>
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Progress Indicators - Dots */}
            <div className={netflixHeroBannerClasses.progressContainer}>
                {movies.map((_: Movie, index: number): ReactElement => (
                    <button
                        key={index}
                        onClick={(): void => {
                            if (index !== currentIndex) {
                                setCurrentIndex(index);
                                setIsVideoPlaying(false);
                                setLoadingProgress(0);
                                setVideoHasPlayed(false);
                                setVideoTimeElapsed(0);
                                if (videoRef.current) {
                                    videoRef.current.currentTime = 0;
                                }
                            }
                        }}
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
                <motion.div
                    className={netflixHeroBannerClasses.progressBar}
                    style={{width: `${loadingProgress}%`}}
                    transition={{duration: 0.1, ease: 'linear'}}
                />
            </div>

            {/* Fade to content transition - Gradiente mais suave */}
            <div
                className={netflixHeroBannerClasses.fadeTransition}
                style={{
                    background: netflixHeroBannerStyles.fadeTransitionBackground
                }}
            />
        </div>
    );
}
