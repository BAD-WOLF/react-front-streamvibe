// noinspection TypeScriptExplicitMemberType

export const categorySectionClasses = {
    section: "py-0 section-container",
    title: "mb-2 text-[#F0F4F8] px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16",
    scrollContainer: "flex gap-4 md:gap-6 lg:gap-8 xl:gap-10 cursor-grab select-none overflow-x-auto overflow-y-hidden scrollbar-hide"
};

export const categorySectionStyles = {
    titleFontSize: 'clamp(1.75rem, 3.5vw, 3rem)',
    titleLetterSpacing: '0.05em',
    titleFilter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
    scrollPaddingLeft: 'clamp(1rem, 4vw, 4rem)',
    scrollPaddingRight: 'clamp(1rem, 4vw, 4rem)', // Padding consistente
    scrollPaddingBottom: '0',
    scrollPaddingTop: '0'
};

export const categorySectionAnimations = {
    titleInitial: { opacity: 0, x: -30 },
    titleAnimate: { opacity: 1, x: 0 }
};

export const categorySectionTransitions = {
    title: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
};
