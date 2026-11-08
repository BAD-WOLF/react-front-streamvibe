// noinspection TypeScriptExplicitMemberType

// NOTA (nov/2026): criado com a hierarquia de papéis. Uma cor por papel,
// do mais discreto (ROLE_USER) ao mais forte (ROLE_OWNER).
export const roleBadgeClasses = {
    badge: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
    tones: {
        ROLE_USER: "bg-white/10 text-white/80",
        ROLE_DEV: "bg-sky-500/30 text-sky-50",
        ROLE_ADMIN: "bg-[#5B21B6]/60 text-white",
        ROLE_OWNER: "bg-gradient-to-r from-[#5B21B6] to-[#9B111E] text-white",
    },
};
