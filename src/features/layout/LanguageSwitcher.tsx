import {type Locale, LOCALE_LABELS, rememberLocale, SUPPORTED_LOCALES} from '@i18n/locales.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {switchLocalePath} from '@shared/routing/paths.ts';
import {headerClasses} from '@shared/styles/ts/layout/HeaderStyles.ts';
import type {ChangeEvent, ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {type Location, type NavigateFunction, useLocation, useNavigate} from 'react-router-dom';
import type {Translation} from '@i18n/translation.ts';

/** Troca o idioma da URL: muda a interface e o idioma do conteúdo que a API pede ao TMDB. */
export function LanguageSwitcher(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const location: Location = useLocation();
    const navigate: NavigateFunction = useNavigate();

    const handleChange: (event: ChangeEvent<HTMLSelectElement>) => void = (event: ChangeEvent<HTMLSelectElement>): void => {
        const next: Locale = event.target.value as Locale;
        rememberLocale(next);
        // NOTA (nov/2026): o state vai junto (o `next` e o email do login moram nele).
        const state: unknown = location.state;
        void navigate(switchLocalePath(location.pathname, location.search, next), {state});
    };

    return (
        <select className={headerClasses.languageSelect} value={locale} onChange={handleChange} aria-label={t('Language')}>
            {SUPPORTED_LOCALES.map((option: Locale): ReactElement => (
                <option key={option} value={option} className={headerClasses.languageOption}>{LOCALE_LABELS[option]}</option>
            ))}
        </select>
    );
}
