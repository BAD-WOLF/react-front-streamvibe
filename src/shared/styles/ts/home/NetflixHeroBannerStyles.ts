// noinspection TypeScriptExplicitMemberType

export const netflixHeroBannerClasses = {
    container: "relative w-full h-[85vh] sm:h-[90vh] md:h-[92vh] min-h-[500px] overflow-hidden",
    backgroundContainer: "absolute inset-0",
    posterContainer: "absolute inset-0",
    video: "absolute inset-0 w-full h-full object-cover",
    poster: "w-full h-full object-cover",
    
    // Overlays
    gradientOverlay1: "absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent",
    gradientOverlay2: "absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent",
    gradientOverlay3: "absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90",
    mobileOverlay: "absolute inset-0 bg-black/20 md:bg-transparent",
    
    // Video Controls
    videoControlsContainer: "absolute top-20 sm:top-24 md:top-28 right-4 sm:right-6 md:right-8 z-30 flex items-center gap-2 sm:gap-3",
    nowPlayingBadge: "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/30",
    nowPlayingDot: "w-2 h-2 rounded-full bg-red-500 animate-pulse",
    nowPlayingText: "text-white text-xs font-medium",
    muteButton: "w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/60 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 hover:border-white transition-all duration-300",
    
    // Content
    contentContainer: "absolute inset-0 flex items-end pb-20 sm:pb-24 md:pb-28 lg:pb-32",
    contentInner: "max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8",
    contentWrapper: "max-w-2xl",
    title: "text-white mb-3 sm:mb-4 md:mb-6 text-2xl sm:text-3xl md:text-5xl lg:text-6xl drop-shadow-2xl",
    description: "text-white/95 mb-5 sm:mb-6 md:mb-8 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-md md:max-w-xl drop-shadow-lg",
    
    // Buttons
    buttonsContainer: "flex flex-wrap gap-3 md:gap-4",
    playButton: "flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-white text-black rounded-md hover:bg-white/90 transition-all duration-300 shadow-xl",
    infoButton: "flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-white/20 text-white rounded-md hover:bg-white/30 backdrop-blur-sm transition-all duration-300 border border-white/40 shadow-xl",
    
    // Progress Indicators
    progressContainer: "absolute bottom-14 sm:bottom-16 md:bottom-20 right-4 sm:right-6 md:right-8 flex gap-2 z-20",
    progressButton: "group relative p-1",
    progressDot: "w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-white/30 transition-all duration-300 group-hover:bg-white/60",
    progressActive: "absolute inset-1 rounded-full bg-white shadow-lg shadow-white/50",
    
    // Progress Bar
    progressBarContainer: "absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-white/10 z-20",
    progressBar: "h-full bg-gradient-to-r from-[#5B21B6] via-[#9B111E] to-[#5B21B6] shadow-lg shadow-[#5B21B6]/50",
    
    // Fade Transition
    fadeTransition: "absolute bottom-0 left-0 right-0 h-20 sm:h-24 md:h-28 pointer-events-none z-10"
};

export const netflixHeroBannerStyles = {
    marginBottom: '0',
    titleTextShadow: '2px 2px 8px rgba(0,0,0,0.8)',
    descriptionTextShadow: '1px 1px 4px rgba(0,0,0,0.8)',
    fadeTransitionBackground: 'linear-gradient(to top, #0E7490 0%, rgba(14, 116, 144, 0.8) 30%, transparent 100%)'
};

export const netflixHeroBannerAnimations = {
    backgroundInitial: { opacity: 0 },
    backgroundAnimate: { opacity: 1 },
    backgroundExit: { opacity: 0 },
    posterAnimate: { opacity: 1 },
    videoInitial: { opacity: 0 },
    videoAnimate: { opacity: 1 },
    videoControlsInitial: { opacity: 0, y: -10 },
    videoControlsAnimate: { opacity: 1, y: 0 },
    videoControlsExit: { opacity: 0, y: -10 },
    nowPlayingInitial: { opacity: 0, x: 20 },
    nowPlayingAnimate: { opacity: 1, x: 0 },
    contentInitial: { opacity: 0, y: 50 },
    contentAnimate: { opacity: 1, y: 0 },
    contentExit: { opacity: 0, y: -30 },
    titleInitial: { opacity: 0, x: -30 },
    titleAnimate: { opacity: 1, x: 0 },
    descriptionInitial: { opacity: 0, x: -30 },
    descriptionAnimate: { opacity: 1, x: 0 },
    buttonsInitial: { opacity: 0, y: 20 },
    buttonsAnimate: { opacity: 1, y: 0 },
    progressActiveInitial: { scale: 0 },
    progressActiveAnimate: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 }
};

export const netflixHeroBannerTransitions = {
    background: { duration: 1, ease: 'easeInOut' as const },
    poster: { duration: 0.7 },
    video: { duration: 0.7 },
    videoControls: { duration: 0.5 },
    nowPlaying: { delay: 0.2 },
    content: { duration: 0.8, ease: 'easeOut' as const },
    title: { duration: 0.8, delay: 0.2 },
    description: { duration: 0.8, delay: 0.4 },
    buttons: { duration: 0.8, delay: 0.6 },
    progressActive: { duration: 0.3 },
    progressBar: { duration: 0.1, ease: 'linear' as const }
};

export const netflixHeroBannerConstants = {
    MAX_VIDEO_DURATION: 60, // 60 segundos
    BANNER_DURATION: 80000, // 80 segundos (20 segundos)
    AUTO_PLAY_DELAY: 3000 // 3 segundos
};
