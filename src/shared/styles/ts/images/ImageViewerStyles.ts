// noinspection TypeScriptExplicitMemberType

export const imageGalleryClasses = {
    grid: "grid gap-3",
    gridColumns: {
        poster: "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8",
        profile: "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8",
        backdrop: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        still: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        logo: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    },
    item: "group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[#5B21B6]",
    itemLogo: "flex items-center justify-center p-4 bg-white/80",
    image: "w-full h-full object-cover transition duration-300 group-hover:scale-105",
    imageLogo: "max-h-20 w-auto object-contain",
    language: "absolute top-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] uppercase text-white/80",
    more: "mt-3 text-sm text-cyan-300 hover:text-cyan-200 underline cursor-pointer",
};

export const imageViewerClasses = {
    layout: "grid gap-4 lg:grid-cols-[1fr_280px]",
    stage: "relative flex min-h-[40vh] items-center justify-center rounded-xl bg-black/60 p-2",
    stageImage: "max-h-[70vh] w-auto max-w-full object-contain",
    nav: "absolute top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition cursor-pointer disabled:opacity-30",
    navPrev: "left-2",
    navNext: "right-2",
    counter: "absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white/80",
    side: "space-y-4 text-sm",
    label: "block text-xs uppercase tracking-wide text-white/50 mb-1",
    select: "w-full rounded-md border border-white/20 bg-[#0E1B2E] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]",
    checkboxRow: "flex items-center gap-2 text-white/80",
    range: "w-full accent-[#5B21B6]",
    facts: "space-y-1 text-white/70 break-all",
    actions: "flex flex-col gap-2",
    actionButton: "inline-flex items-center justify-center gap-2 rounded-md bg-white/10 px-3 py-2 text-white hover:bg-white/20 transition disabled:opacity-50 cursor-pointer",
    actionLink: "inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 transition",
    hint: "text-xs text-white/50",
};
