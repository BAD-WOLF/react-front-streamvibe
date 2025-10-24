import {t} from 'i18next';
import {motion} from 'motion/react';
import type {ReactElement} from 'react'
import {footerClasses, footerStyles, footerAnimations} from '../../shared/styles/ts/layout/FooterStyles.ts';

export function Footer(): ReactElement {
    const links: string[] = [
        t('Privacy'),
        t('Terms'),
        t('Support'),
        t('Contact'),
        t('License'),
        t('API')
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
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                    >
                        <span className={footerClasses.logoText}>SV</span>
                    </motion.div>
                </div>

                {/* Links */}
                <div className={footerClasses.linksContainer}>
                    {links.map((link: string): ReactElement => (
                        <motion.a
                            key={link}
                            href="#"
                            className={footerClasses.link}
                            whileTap={footerAnimations.linkTap}
                        >
                            {link}
                        </motion.a>
                    ))}
                </div>
            </div>
        </footer>
    );
}
