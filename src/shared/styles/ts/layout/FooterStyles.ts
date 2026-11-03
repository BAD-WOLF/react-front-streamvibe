// noinspection TypeScriptExplicitMemberType

import type {TargetAndTransition, Transition} from 'motion/react';

export const footerClasses = {
    container: "bg-[#0E7490]/10 border-t border-[#3D3D3D]/60 py-4 md:py-6 px-4 md:px-6",
    innerContainer: "max-w-7xl mx-auto",

    // Logo
    logoContainer: "flex justify-center mb-2 md:mb-4",
    logoCircle: "w-12 h-12 md:w-16 md:h-16 rounded-full border-2 md:border-4 border-[#9B111E] flex items-center justify-center",
    logoText: "text-white text-sm md:text-base",

    // Links
    linksContainer: "flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-10",
    link: "text-[#F0F4F8]/70 hover:text-white transition-colors duration-300 text-sm md:text-base",

    // API status (GET /health)
    status: "mt-4 flex items-center justify-center gap-2 text-xs text-[#F0F4F8]/60",
    statusDot: "inline-block w-2 h-2 rounded-full",
    statusOnline: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    statusOffline: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]",
    statusChecking: "bg-amber-300 animate-pulse"
};

export const footerStyles = {
    logoShadow: '0 0 20px rgba(91, 33, 182, 0.6)',
    logoBackground: 'linear-gradient(135deg, #5B21B6 0%, #9B111E 100%)'
};

// NOTA (nov/2026): com o isolatedDeclarations, o tipo de um export precisa
// sair do próprio código; o `Infinity` (uma variável global) não dá, então o
// objeto ganhou os tipos do motion (e o `as const` do ease ficou sobrando).
export const footerAnimations: {
    logoRotation: TargetAndTransition;
    logoTransition: Transition;
    linkTap: TargetAndTransition;
} = {
    logoRotation: {
        rotate: 360
    },
    logoTransition: {
        duration: 25,
        repeat: Infinity,
        ease: 'linear'
    },
    linkTap: {
        scale: 0.95
    }
};
