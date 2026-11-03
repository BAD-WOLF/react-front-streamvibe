// noinspection TypeScriptExplicitMemberType

export const categorySectionClasses = {
    section: "py-0 section-container",
    header: "flex flex-wrap items-end justify-between gap-3 px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 mb-2",
    title: "text-[#F0F4F8]",
    headerActions: "flex items-center gap-3 pb-2",
    seeAll: "text-sm text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline",
    scrollContainer: "flex gap-4 md:gap-6 lg:gap-8 xl:gap-10 cursor-grab select-none overflow-x-auto overflow-y-hidden scrollbar-hide",
    loadMore: "flex-shrink-0 self-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white hover:bg-white/20 transition cursor-pointer disabled:opacity-50",
    message: "px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16"
};

export const categorySectionStyles = {
    titleFontSize: 'clamp(1.75rem, 3.5vw, 3rem)',
    titleLetterSpacing: '0.05em',
    titleFilter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
    scrollPaddingLeft: 'clamp(1rem, 4vw, 4rem)',
    scrollPaddingRight: 'clamp(1rem, 4vw, 4rem)', // Padding consistente
    scrollPaddingBottom: '1.5rem',
    scrollPaddingTop: '1.5rem'
};

export const categorySectionAnimations = {
    titleInitial: { opacity: 0, x: -30 },
    titleAnimate: { opacity: 1, x: 0 }
};

export const categorySectionTransitions = {
    title: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
};
