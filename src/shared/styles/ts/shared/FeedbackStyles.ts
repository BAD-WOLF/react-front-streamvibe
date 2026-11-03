// noinspection TypeScriptExplicitMemberType

export const feedbackClasses = {
    loaderContainer: "flex flex-col items-center justify-center gap-3 py-12 text-white/70",
    loaderSpinner: "w-10 h-10 rounded-full border-4 border-white/15 border-t-[#5B21B6] animate-spin",
    loaderInline: "inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin align-middle",
    errorContainer: "mx-auto my-4 w-full max-w-2xl rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100",
    errorList: "mt-2 list-disc pl-5 space-y-1 text-red-100/90",
    errorRetry: "mt-3 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-white hover:bg-white/20 transition cursor-pointer",
    emptyContainer: "py-12 text-center text-white/60",
    notice: "rounded-xl border p-4 text-sm leading-relaxed",
    noticeTones: {
        info: "border-sky-400/40 bg-sky-400/10 text-sky-50",
        success: "border-emerald-400/40 bg-emerald-400/10 text-emerald-50",
        warning: "border-amber-400/40 bg-amber-400/10 text-amber-50",
        error: "border-red-500/40 bg-red-500/10 text-red-50",
    },
};

export const paginationClasses = {
    container: "flex items-center justify-center gap-3 py-8 text-white/80",
    button: "inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
    label: "text-sm",
};

export const modalClasses = {
    backdrop: "fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-6",
    panel: "relative w-full max-h-[95vh] overflow-y-auto rounded-2xl border border-[#5B21B6]/40 bg-[#0B1626] text-white shadow-2xl",
    panelNormal: "max-w-3xl",
    panelWide: "max-w-6xl",
    header: "sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-[#0B1626]/95 px-4 py-3 backdrop-blur",
    title: "text-base sm:text-lg font-semibold truncate",
    close: "rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer",
    body: "p-4",
};

export const tabsClasses = {
    list: "flex flex-wrap gap-2 mb-4",
    tab: "rounded-full border px-4 py-1.5 text-sm transition cursor-pointer",
    tabActive: "border-[#5B21B6] bg-[#5B21B6]/40 text-white",
    tabInactive: "border-white/15 bg-white/5 text-white/70 hover:text-white hover:bg-white/10",
    count: "ml-1 text-xs text-white/50",
};
