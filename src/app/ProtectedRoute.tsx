import type {Locale} from '@i18n/locales.ts';
import type {SessionValue} from '@shared/auth/sessionContext.ts';
import {useSession} from '@shared/auth/useSession.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {paths} from '@shared/routing/paths.ts';
import type {ReactElement} from 'react';
import {type Location, Navigate, Outlet, useLocation} from 'react-router-dom';

/** Rotas 🔒 da API: sem sessão, vai para o login e volta depois (?next=). */
export function ProtectedRoute(): ReactElement {
    const {isAuthenticated}: SessionValue = useSession();
    const locale: Locale = useLocale();
    const location: Location = useLocation();

    if (!isAuthenticated) return <Navigate to={paths.auth(locale, {next: `${location.pathname}${location.search}`})} replace/>;

    return <Outlet/>;
}
