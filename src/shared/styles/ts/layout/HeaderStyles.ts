// noinspection TypeScriptExplicitMemberType

export const headerClasses = {
    container: "fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4",
    innerContainer: "max-w-7xl mx-auto",
    mainFlex: "flex items-center justify-between",

    // Logo
    logoContainer: "flex items-center gap-2",
    logoImage: "h-8 md:h-10 w-auto",

    // Desktop Navigation
    desktopNav: "hidden lg:flex items-center gap-6 xl:gap-8",
    navLink: "text-gray-300 transition-colors duration-300 hover:text-white text-sm xl:text-base",

    // Search & Avatar Container
    searchAvatarContainer: "flex items-center gap-2 md:gap-4 flex-1 md:flex-initial justify-end",

    // Desktop Search
    desktopSearchContainer: "relative hidden md:block",
    searchIcon: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400",
    desktopSearchInput: "pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B21B6] w-40 lg:w-48 xl:w-64",

    // Mobile Search
    mobileSearchContainer: "absolute left-4 right-16 md:hidden",
    mobileSearchInput: "w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B21B6] backdrop-blur-xl",

    // Mobile Search Button
    mobileSearchButton: "md:hidden p-2 text-gray-300 hover:text-white relative z-10",
    mobileSearchIcon: "w-5 h-5",

    // Avatar & Menu
    avatarMenuContainer: "relative z-10",
    avatar: "w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#5B21B6] to-[#9B111E] flex items-center justify-center cursor-pointer flex-shrink-0",
    avatarText: "text-white text-sm md:text-base",

    // Dropdown Menu
    dropdownMenu: "absolute right-0 mt-2 w-56 bg-[#1E3A5F]/95 backdrop-blur-xl border border-[#5B21B6]/40 rounded-2xl shadow-2xl overflow-hidden",
    dropdownContent: "py-2",
    dropdownItem: "block px-5 py-3 text-gray-300 hover:text-white hover:bg-[#5B21B6]/20 transition-all duration-300"
};

export const headerAnimations = {
    scrolled: {
        backgroundColor: 'rgba(20, 20, 20, 0.8)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
    },
    notScrolled: {
        backgroundColor: 'rgba(0, 0, 0, 0)',
        backdropFilter: 'blur(0px)',
        boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)'
    },
    logoHidden: {
        opacity: 0,
        width: 0
    },
    logoVisible: {
        opacity: 1,
        width: 'auto'
    },
    dropdownShadow: '0 0 30px rgba(91, 33, 182, 0.4), 0 20px 25px -5px rgba(0, 0, 0, 0.5)'
};

export const headerTransitions = {
    headerTransition: {duration: 0.5},
    logoTransition: {duration: 0.3},
    dropdownTransition: {duration: 0.3, ease: "easeOut" as const},
    hoverTransition: {duration: 0.3},
    avatarTransition: {duration: 0.8}
};
