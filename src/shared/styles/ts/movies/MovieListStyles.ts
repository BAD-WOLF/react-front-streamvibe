// noinspection TypeScriptExplicitMemberType

export const movieListClasses = {
    page: "max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 pt-24 pb-8 text-white",
    header: "flex flex-wrap items-end justify-between gap-4 mb-6",
    title: "text-3xl md:text-4xl font-black text-[#F0F4F8] drop-shadow-xl",
    subtitle: "text-sm text-white/60",
    featured: "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8",
    grid: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6",
    tabs: "flex flex-wrap gap-2 mb-6",
    tab: "rounded-full border px-4 py-1.5 text-sm transition",
    tabActive: "border-[#5B21B6] bg-[#5B21B6]/40 text-white",
    tabInactive: "border-white/15 bg-white/5 text-white/70 hover:text-white hover:bg-white/10",
};

export const movieSearchClasses = {
    form: "rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 mb-6 space-y-4",
    queryRow: "flex flex-col sm:flex-row gap-3",
    queryInput: "flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]",
    submit: "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#5B21B6] to-[#9B111E] px-6 py-3 font-semibold text-white hover:opacity-90 transition cursor-pointer",
    filtersToggle: "text-sm text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline cursor-pointer",
    filters: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
    field: "flex flex-col gap-1 text-sm",
    label: "text-white/70",
    input: "rounded-md border border-white/20 bg-[#0E1B2E] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]",
    checkbox: "flex items-center gap-2 text-sm text-white/80 sm:pt-6",
    fieldError: "text-xs text-red-300",
    summary: "mb-4 text-sm text-white/60",
};
