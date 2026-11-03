import {isLocale, type Locale, preferredLocale, rememberLocale, toLanguageTag} from '@i18n/locales.ts';
import {type ReactElement, useLayoutEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {type Location, Navigate, Outlet, useLocation, useParams} from 'react-router-dom';
import type {Translation} from '@i18n/translation.ts';

/**
 * NOTA (nov/2026): todo endereço começa pelo idioma (/pt_BR/..., /en/...,
 * /es/...), o mesmo prefixo das rotas da API. Um endereço sem idioma válido
 * (ex.: o link do email de troca de senha, /auth/repassword/{token}) ganha o
 * idioma preferido na frente. O idioma da URL vira o da interface.
 */
export function LocaleLayout(): ReactElement {
    const {_locale}: Readonly<Partial<{ _locale: string }>> = useParams<{ _locale: string }>();
    const location: Location = useLocation();
    const {i18n}: Translation = useTranslation();
    const locale: Locale | null = isLocale(_locale) ? _locale : null;

    useLayoutEffect((): void => {
        if (locale === null) return;
        rememberLocale(locale);
        document.documentElement.lang = toLanguageTag(locale);
        if (i18n.language !== locale) void i18n.changeLanguage(locale);
    }, [locale, i18n]);

    if (locale === null) return <Navigate to={`/${preferredLocale()}${location.pathname}${location.search}`} replace/>;

    return <Outlet/>;
}
