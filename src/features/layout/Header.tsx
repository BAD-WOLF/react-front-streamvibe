import {t} from 'i18next';
import {Search} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {type ReactElement, type RefObject, useEffect, useRef, useState} from 'react';
import {ImageWithFallback} from './figma/ImageWithFallback.tsx';
import {headerClasses, headerAnimations, headerTransitions} from '../../shared/styles/ts/layout/HeaderStyles.ts';

export function Header(): ReactElement {
    const [scrolled, setScrolled]: [boolean, (value: (((prevState: boolean) => boolean) | boolean)) => void] = useState(false);
    const [menuOpen, setMenuOpen]: [boolean, (value: (((prevState: boolean) => boolean) | boolean)) => void] = useState(false);
    const [isMobile, setIsMobile]: [boolean, (value: (((prevState: boolean) => boolean) | boolean)) => void] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen]: [boolean, (value: (((prevState: boolean) => boolean) | boolean)) => void] = useState(false);
    const menuRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
    const timeoutRef: RefObject<NodeJS.Timeout | null> = useRef<NodeJS.Timeout | null>(null);
    const searchInputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);

    useEffect((): () => void => {
        const handleScroll: () => void = (): void => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return (): void => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect((): () => void => {
        const checkMobile: () => void = (): void => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return (): void => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect((): () => void => {
        const handleClickOutside: (event: MouseEvent) => void = (event: MouseEvent): void => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
            // Fecha o search mobile se clicar fora
            if (mobileSearchOpen && searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
                const target: HTMLElement = event.target as HTMLElement;
                // Não fecha se clicar no botão de search
                if (!target.closest('button')) {
                    setMobileSearchOpen(false);
                }
            }
        };

        if (menuOpen && isMobile) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        if (mobileSearchOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return (): void => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen, isMobile, mobileSearchOpen]);

    const handleMouseEnter: () => void = (): void => {
        if (!isMobile) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setMenuOpen(true);
        }
    };

    const handleMouseLeave: () => void = (): void => {
        if (!isMobile) {
            timeoutRef.current = setTimeout((): void => {
                setMenuOpen(false);
            }, 200);
        }
    };

    const handleAvatarClick: () => void = (): void => {
        if (isMobile) {
            setMenuOpen(!menuOpen);
        }
    };

    // Menu items diferenciados por plataforma
    const desktopMenuItems: string[] = [
        t('Login'),
        t('Register'),
        t('About'),
        t('Contact')
    ];
    const mobileMenuItems: string[] = [
        t('Home'),
        t('Trending'),
        t('Categories'),
        t('My List'),
        ...desktopMenuItems
    ];
    const menuItems: string[] = isMobile ? mobileMenuItems : desktopMenuItems;

    // Auto-focus no input quando o search mobile abrir
    useEffect((): void => {
        if (mobileSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [mobileSearchOpen]);

    return (
        <motion.header
            className={headerClasses.container}
            animate={scrolled ? headerAnimations.scrolled : headerAnimations.notScrolled}
            transition={headerTransitions.headerTransition}
        >
            <div className={headerClasses.innerContainer}>
                <div className={headerClasses.mainFlex}>
                    {/* Logo */}
                    <motion.div
                        className={headerClasses.logoContainer}
                        animate={mobileSearchOpen && isMobile ? headerAnimations.logoHidden : headerAnimations.logoVisible}
                        transition={headerTransitions.logoTransition}
                    >
                        <ImageWithFallback
                            src="https://files.catbox.moe/txrqod.png"
                            alt={t('StreamVibe Logo')}
                            className={headerClasses.logoImage}
                        />
                    </motion.div>

                    {/* Desktop Navigation */}
                    <nav className={headerClasses.desktopNav}>
                        {[
                            t('Home'),
                            t('Trending'),
                            t('Categories'),
                            t('My List')
                        ].map((item: string): ReactElement => (
                            <motion.a
                                key={item}
                                href="#"
                                className={headerClasses.navLink}
                                whileHover={{scale: 1.05}}
                            >
                                {item}
                            </motion.a>
                        ))}
                    </nav>

                    {/* Search & Avatar */}
                    <div className={headerClasses.searchAvatarContainer}>
                        {/* Desktop Search */}
                        <motion.div
                            className={headerClasses.desktopSearchContainer}
                            whileFocus={{scale: 1.05}}
                            transition={headerTransitions.hoverTransition}
                        >
                            <Search className={headerClasses.searchIcon}/>
                            <input
                                type="text"
                                placeholder={t('Search movies, shows…')}
                                className={headerClasses.desktopSearchInput}
                            />
                        </motion.div>

                        {/* Mobile Search */}
                        <AnimatePresence>
                            {mobileSearchOpen && isMobile && (
                                <motion.div
                                    className={headerClasses.mobileSearchContainer}
                                    initial={{opacity: 0, scale: 0.95}}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0, scale: 0.95}}
                                    transition={headerTransitions.hoverTransition}
                                >
                                    <div className="relative">
                                        <Search className={headerClasses.searchIcon}/>
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            placeholder={t('Search movies, shows…')}
                                            className={headerClasses.mobileSearchInput}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Mobile Search Icon */}
                        <motion.button
                            className={headerClasses.mobileSearchButton}
                            whileTap={{scale: 0.95}}
                            onClick={(): void => setMobileSearchOpen(!mobileSearchOpen)}
                        >
                            <Search className={headerClasses.mobileSearchIcon}/>
                        </motion.button>

                        {/* Avatar with Menu */}
                        <div
                            className={headerClasses.avatarMenuContainer}
                            ref={menuRef}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <motion.div
                                className={headerClasses.avatar}
                                whileHover={{scale: 1.1, rotate: 360}}
                                transition={headerTransitions.avatarTransition}
                                onClick={handleAvatarClick}
                            >
                                <span className={headerClasses.avatarText}>SV</span>
                            </motion.div>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {menuOpen && (
                                    <motion.div
                                        className={headerClasses.dropdownMenu}
                                        initial={{opacity: 0, y: -10, scale: 0.95}}
                                        animate={{opacity: 1, y: 0, scale: 1}}
                                        exit={{opacity: 0, y: -10, scale: 0.95}}
                                        transition={{duration: 0.3, ease: "easeOut"}}
                                        style={{
                                            boxShadow: headerAnimations.dropdownShadow,
                                        }}
                                    >
                                        <div className={headerClasses.dropdownContent}>
                                            {menuItems.map((item: string): ReactElement => (
                                                <motion.a
                                                    key={item}
                                                    href="#"
                                                    className={headerClasses.dropdownItem}
                                                    whileHover={{x: 5}}
                                                    onClick={(): void => setMenuOpen(false)}
                                                >
                                                    {item}
                                                </motion.a>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
