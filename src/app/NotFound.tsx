import type {Locale} from '@i18n/locales.ts';
import {useDocumentTitle} from '@shared/hooks/useDocumentTitle.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {paths} from '@shared/routing/paths.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import type {Translation} from '@i18n/translation.ts';

export function NotFound(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    useDocumentTitle(t('Page not found'));

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 pt-24 text-center text-white">
            <p className="text-6xl font-black text-[#F0F4F8]/80">404</p>
            <p className="text-white/70">{t('This page does not exist.')}</p>
            <Link to={paths.home(locale)} className="rounded-full bg-[#5B21B6] px-5 py-2 text-white hover:opacity-90">{t('Go to the home page')}</Link>
        </div>
    );
}
