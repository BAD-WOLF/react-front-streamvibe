import type {Locale} from '@i18n/locales.ts';
import {LanguageSwitcher} from '@layout/LanguageSwitcher.tsx';
import {ImageWithFallback} from '@layout/figma/ImageWithFallback.tsx';
import {useSession} from '@shared/auth/useSession.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {paths} from '@shared/routing/paths.ts';
import {headerAnimations, headerClasses, headerTransitions} from '@shared/styles/ts/layout/HeaderStyles.ts';
import {initialsOf} from '@shared/utils/format.ts';
import {Search} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {
    type ChangeEvent, type Dispatch, type FormEvent, type ReactElement, type RefObject, type SetStateAction, useEffect, useRef, useState
} from 'react';
import {useTranslation} from 'react-i18next';
import {Link, type NavigateFunction, NavLink, useNavigate} from 'react-router-dom';
import type {Translation} from '@i18n/translation.ts';
import type {SessionValue} from '@shared/auth/sessionContext.ts';
import {hasText} from '@shared/utils/guards.ts';

type MenuItem = {
    label: string;
    to?: string | undefined;
    onClick?: (() => void) | undefined;
};

// NOTA (nov/2026): os itens do menu passaram a levar às páginas de verdade.
// "Categories" e "My List" saíram (a API não tem gêneros nem lista do
// usuário); "About" e "Contact" também (não havia páginas para eles).
export function Header(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const navigate: NavigateFunction = useNavigate();
    const session: SessionValue = useSession();
    const [scrolled, setScrolled]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const [menuOpen, setMenuOpen]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const [isMobile, setIsMobile]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const [mobileSearchOpen, setMobileSearchOpen]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const [query, setQuery]: [string, Dispatch<SetStateAction<string>>] = useState<string>('');
    const menuRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
    const timeoutRef: RefObject<ReturnType<typeof setTimeout> | null> = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchInputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);

    useEffect((): () => void => {
        const handleScroll: () => void = (): void => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return (): void => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect((): () => void => {
        const checkMobile: () => void = (): void => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return (): void => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect((): () => void => {
        const handleClickOutside: (event: MouseEvent) => void = (event: MouseEvent): void => {
            if (menuRef.current !== null && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
            // Fecha o search mobile se clicar fora (menos no botão de search)
            if (mobileSearchOpen && searchInputRef.current !== null && !searchInputRef.current.contains(event.target as Node)) {
                if ((event.target as HTMLElement).closest('button') === null) setMobileSearchOpen(false);
            }
        };

        if ((menuOpen && isMobile) || mobileSearchOpen) document.addEventListener('mousedown', handleClickOutside);
        return (): void => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen, isMobile, mobileSearchOpen]);

    // Auto-focus no input quando o search mobile abrir
    useEffect((): void => {
        if (mobileSearchOpen) searchInputRef.current?.focus();
    }, [mobileSearchOpen]);

    const handleMouseEnter: () => void = (): void => {
        if (isMobile) return;
        if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
        setMenuOpen(true);
    };

    const handleMouseLeave: () => void = (): void => {
        if (isMobile) return;
        timeoutRef.current = setTimeout((): void => setMenuOpen(false), 200);
    };

    const handleSearch: (event: FormEvent<HTMLFormElement>) => void = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (query.trim() === '') return;
        setMobileSearchOpen(false);
        void navigate(paths.search(locale, query));
    };

    const navItems: MenuItem[] = [
        {label: t('Home'), to: paths.home(locale)},
        {label: t('Trending movies'), to: paths.movieList(locale, 'trending')},
        {label: t('Popular'), to: paths.movieList(locale, 'popular')},
        {label: t('Top Rated'), to: paths.movieList(locale, 'top-rated')},
        {label: t('Now Playing'), to: paths.movieList(locale, 'now-playing')},
    ];
    const accountItems: MenuItem[] = session.isAuthenticated
        ? [
            {label: t('My account'), to: paths.account(locale)},
            {label: t('Log out'), onClick: (): void => {
                // NOTA (nov/2026): o endSession() esquece o token na hora (aqui e
                // nas outras abas) e só depois espera a API apagar o cookie.
                void session.endSession();
                void navigate(paths.auth(locale));
            }},
        ]
        : [
            {label: t('Log in'), to: paths.auth(locale)},
            {label: t('Register'), to: paths.auth(locale, {mode: 'register'})},
        ];
    const menuItems: MenuItem[] = isMobile ? [...navItems, ...accountItems] : accountItems;

    const searchInput: (className: string, ref?: RefObject<HTMLInputElement | null>) => ReactElement =
        (className: string, ref?: RefObject<HTMLInputElement | null>): ReactElement => (
            <form onSubmit={handleSearch} role="search" className="relative">
                <Search className={headerClasses.searchIcon}/>
                <input
                    ref={ref}
                    type="search"
                    value={query}
                    onChange={(event: ChangeEvent<HTMLInputElement>): void => setQuery(event.target.value)}
                    placeholder={t('Search movies...')}
                    aria-label={t('Search movies...')}
                    className={className}
                />
            </form>
        );

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
                        <Link to={paths.home(locale)}>
                            <ImageWithFallback src="https://files.catbox.moe/txrqod.png" alt={t('StreamVibe Logo')} className={headerClasses.logoImage}/>
                        </Link>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <nav className={headerClasses.desktopNav}>
                        {navItems.map((item: MenuItem): ReactElement => (
                            <motion.div key={item.label} whileHover={{scale: 1.05}}>
                                <NavLink
                                    to={item.to ?? '#'}
                                    className={({isActive}: { isActive: boolean }): string => `${headerClasses.navLink} ${isActive ? headerClasses.navLinkActive : ''}`}
                                >
                                    {item.label}
                                </NavLink>
                            </motion.div>
                        ))}
                    </nav>

                    {/* Search, Language & Avatar */}
                    <div className={headerClasses.searchAvatarContainer}>
                        {/* Desktop Search */}
                        <div className={headerClasses.desktopSearchContainer}>{searchInput(headerClasses.desktopSearchInput)}</div>

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
                                    {searchInput(headerClasses.mobileSearchInput, searchInputRef)}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Mobile Search Icon */}
                        <motion.button
                            type="button"
                            className={headerClasses.mobileSearchButton}
                            whileTap={{scale: 0.95}}
                            onClick={(): void => setMobileSearchOpen(!mobileSearchOpen)}
                            aria-label={t('Search movies...')}
                        >
                            <Search className={headerClasses.mobileSearchIcon}/>
                        </motion.button>

                        <LanguageSwitcher/>

                        {/* Avatar with Menu */}
                        <div className={headerClasses.avatarMenuContainer} ref={menuRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                            <motion.button
                                type="button"
                                className={headerClasses.avatar}
                                whileHover={{scale: 1.1, rotate: 360}}
                                transition={headerTransitions.avatarTransition}
                                onClick={(): void => setMenuOpen(!menuOpen)}
                                aria-label={t('Menu')}
                                aria-expanded={menuOpen}
                            >
                                <span className={headerClasses.avatarText}>{session.user !== null ? initialsOf(session.user.email) : 'SV'}</span>
                            </motion.button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {menuOpen && (
                                    <motion.div
                                        className={headerClasses.dropdownMenu}
                                        initial={{opacity: 0, y: -10, scale: 0.95}}
                                        animate={{opacity: 1, y: 0, scale: 1}}
                                        exit={{opacity: 0, y: -10, scale: 0.95}}
                                        transition={headerTransitions.dropdownTransition}
                                        style={{boxShadow: headerAnimations.dropdownShadow}}
                                    >
                                        <div className={headerClasses.dropdownContent}>
                                            {session.user !== null && <p className={headerClasses.dropdownHeader}>{session.user.email}</p>}
                                            {menuItems.map((item: MenuItem): ReactElement => (
                                                <motion.div key={item.label} whileHover={{x: 5}}>
                                                    {hasText(item.to) ? (
                                                        <Link to={item.to} className={headerClasses.dropdownItem} onClick={(): void => setMenuOpen(false)}>
                                                            {item.label}
                                                        </Link>
                                                    ) : (
                                                        <button type="button" className={headerClasses.dropdownItem} onClick={(): void => {
                                                            setMenuOpen(false);
                                                            item.onClick?.();
                                                        }}>
                                                            {item.label}
                                                        </button>
                                                    )}
                                                </motion.div>
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
