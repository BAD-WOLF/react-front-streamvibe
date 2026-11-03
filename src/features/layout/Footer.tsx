import {ApiStatus} from '@layout/ApiStatus.tsx';
import type {Locale} from '@i18n/locales.ts';
import {apiDocsUrl} from '@shared/api/apiConfig.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {footerAnimations, footerClasses, footerStyles} from '@shared/styles/ts/layout/FooterStyles.ts';
import {motion} from 'motion/react';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';

type FooterLink = {
    label: string;
    href: string;
};

// NOTA (nov/2026): os links "#" (Privacy, Terms, Support, Contact, License)
// saíram: não havia páginas para eles. Ficaram os que levam a algum lugar.
export function Footer(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();

    const links: FooterLink[] = [
        {label: t('API documentation'), href: apiDocsUrl(locale)},
        {label: t('Backend on GitHub'), href: 'https://github.com/BAD-WOLF/StreamVibe'},
        {label: t('Frontend on GitHub'), href: 'https://github.com/BAD-WOLF/react-front-streamvibe'},
        {label: 'TMDB', href: 'https://www.themoviedb.org/'},
    ];

    return (
        <footer className={footerClasses.container}>
            <div className={footerClasses.innerContainer}>
                {/* Rotating Logo */}
                <div className={footerClasses.logoContainer}>
                    <motion.div
                        className={footerClasses.logoCircle}
                        style={{
                            boxShadow: footerStyles.logoShadow,
                            background: footerStyles.logoBackground,
                        }}
                        animate={footerAnimations.logoRotation}
                        transition={footerAnimations.logoTransition}
                    >
                        <span className={footerClasses.logoText}>SV</span>
                    </motion.div>
                </div>

                {/* Links */}
                <div className={footerClasses.linksContainer}>
                    {links.map((link: FooterLink): ReactElement => (
                        <motion.a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className={footerClasses.link}
                            whileTap={footerAnimations.linkTap}
                        >
                            {link.label}
                        </motion.a>
                    ))}
                </div>

                <ApiStatus/>
            </div>
        </footer>
    );
}
