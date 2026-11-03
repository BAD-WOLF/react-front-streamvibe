// noinspection TypeScriptExplicitMemberType

// O visual das telas de conta (login, cadastro, verificação, troca de senha).
export const authClasses = {
    page: "min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E3A5F] via-[#111827] to-[#000] px-6 py-10 text-white",
    card: "max-w-md w-full space-y-6 bg-white/5 backdrop-blur-md p-8 rounded-xl shadow-xl border border-white/10",
    title: "text-2xl font-bold text-center",
    text: "text-sm text-white/80 text-center leading-relaxed",
    divider: "my-4 border-t border-white/10",
    link: "text-cyan-400 underline hover:text-cyan-300 cursor-pointer",
    linkRow: "flex flex-wrap justify-between gap-2 text-sm",
    checkbox: "flex items-start gap-2 text-sm text-white/80 mb-4",
    checkboxInput: "mt-1 accent-[#5B21B6]",
    fieldError: "text-red-400 text-sm -mt-2 mb-4",
    primaryButton: "w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-br from-[#667EEA] to-[#764BA2] hover:opacity-90 transition disabled:opacity-60 cursor-pointer",
    secondaryButton: "w-full py-3 rounded-lg font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition disabled:opacity-60 cursor-pointer",
    dangerButton: "w-full py-2 rounded-lg text-sm text-red-200 hover:text-white hover:bg-red-500/20 border border-red-400/30 transition disabled:opacity-60 cursor-pointer",
    emailInput: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-transparent text-white outline-none focus:border-indigo-500",
    stack: "space-y-4",
};
