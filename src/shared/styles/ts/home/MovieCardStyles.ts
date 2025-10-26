// noinspection TypeScriptExplicitMemberType

export const movieCardClasses = {
    container: "relative flex-shrink-0 rounded-lg md:rounded-xl lg:rounded-2xl overflow-hidden border border-[#9B111E]/40 cursor-pointer movie-card-responsive",
    backgroundOverlay: "absolute inset-0",
    content: "relative h-full flex items-center justify-center px-2 md:px-4 lg:px-6",
    title: "text-white/80 text-center",
    hoverOverlay: "absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center px-2 md:px-4 lg:px-6",
    hoverText: "text-white text-center"
};

export const movieCardStyles = {
    minWidth: '160px',
    width: 'clamp(160px, 20vw, 400px)',
    height: 'clamp(240px, 30vw, 600px)',
    background: '#1E3A5F',
    boxShadow: '0 0 20px rgba(91, 33, 182, 0.5)',
    margin: '0',
    padding: '0',
    backgroundOverlay: 'linear-gradient(135deg, rgba(91, 33, 182, 0.4) 0%, rgba(155, 17, 30, 0.2) 100%)',
    titleFontSize: 'clamp(0.875rem, 1.5vw, 1.25rem)',
    hoverTextFontSize: 'clamp(0.875rem, 1.5vw, 1.25rem)'
};

export const movieCardAnimations = {
    hover: { scale: 1.1, rotate: -1 },
    tap: { scale: 0.95 },
    initial: { opacity: 0, y: 60, scale: 0.9, filter: 'blur(10px)' },
    animate: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        filter: 'blur(0px)'
    },
    notInView: { 
        opacity: 0, 
        y: 60, 
        scale: 0.9,
        filter: 'blur(10px)'
    }
};

export const movieCardTransitions = {
    main: { 
        duration: 0.7, 
        delay: 0.08, // index * 0.08
        ease: [0.22, 1, 0.36, 1] as const // Cubic bezier suave
    },
    hover: { duration: 0.3 }
};
