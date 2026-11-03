import {DEFAULT_LOCALE, isLocale, type Locale} from '@i18n/locales.ts';
import {useParams} from 'react-router-dom';

/** O idioma da URL (/:_locale/...). O LocaleLayout garante que ele é válido. */
export function useLocale(): Locale {
    const {_locale}: Readonly<Partial<{ _locale: string }>> = useParams<{ _locale: string }>();
    return isLocale(_locale) ? _locale : DEFAULT_LOCALE;
}
