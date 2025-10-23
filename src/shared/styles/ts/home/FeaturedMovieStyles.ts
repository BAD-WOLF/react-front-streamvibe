// noinspection TypeScriptExplicitMemberType

export const featuredMovieClasses = {
    container: "relative rounded-2xl md:rounded-3xl overflow-hidden border border-[#5B21B6]/40 shadow-2xl h-[320px] sm:h-[400px] md:h-[450px] lg:h-[480px]",
    video: "absolute inset-0 w-full h-full object-cover",
    poster: "absolute inset-0 w-full h-full object-cover",
    overlay: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4 sm:p-5 md:p-6",
    title: "text-white mb-1 sm:mb-2 text-lg sm:text-xl md:text-2xl font-bold",
    description: "text-white/70 text-xs sm:text-sm leading-relaxed line-clamp-2 md:line-clamp-3"
};

export const featuredMovieAnimations = {
    hover: { scale: 1.05 },
    tap: { scale: 0.98 },
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    posterInitial: { opacity: 0.9 },
    posterHovered: { opacity: 0 },
    videoInitial: { opacity: 0 },
    videoHovered: { opacity: 1 }
};

export const featuredMovieTransitions = {
    main: { duration: 0.6, delay: 0.15 }, // index * 0.15
    video: { duration: 0.7 },
    poster: { duration: 0.5 }
};
