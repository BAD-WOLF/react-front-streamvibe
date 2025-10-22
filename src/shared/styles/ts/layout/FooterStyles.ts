// noinspection TypeScriptExplicitMemberType

export const footerClasses = {
    container: "bg-[#0E7490]/10 border-t border-[#3D3D3D]/60 py-8 md:py-12 px-4 md:px-6",
    innerContainer: "max-w-7xl mx-auto",

    // Logo
    logoContainer: "flex justify-center mb-6 md:mb-8",
    logoCircle: "w-12 h-12 md:w-16 md:h-16 rounded-full border-2 md:border-4 border-[#9B111E] flex items-center justify-center",
    logoText: "text-white text-sm md:text-base",

    // Links
    linksContainer: "flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-10",
    link: "text-[#F0F4F8]/70 hover:text-white transition-colors duration-300 text-sm md:text-base"
};

export const footerStyles = {
    logoShadow: '0 0 20px rgba(91, 33, 182, 0.6)',
    logoBackground: 'linear-gradient(135deg, #5B21B6 0%, #9B111E 100%)'
};

export const footerAnimations = {
    logoRotation: {
        rotate: 360
    },
    logoTransition: {
        duration: 25,
        repeat: Infinity,
        ease: 'linear' as const
    },
    linkTap: {
        scale: 0.95
    }
};
