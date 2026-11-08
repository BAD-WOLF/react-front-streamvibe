import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {SessionStatus, type SessionValue} from '@shared/auth/sessionContext.ts';
import {useSession} from '@shared/auth/useSession.ts';
import {Loader} from '@shared/components/feedback/Loader.tsx';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {type AuthLocationState, paths} from '@shared/routing/paths.ts';
import {feedbackClasses} from '@shared/styles/ts/shared/FeedbackStyles.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {type Location, Navigate, Outlet, useLocation} from 'react-router-dom';

/**
 * Rotas 🔒 da API: sem sessão, vai para o login e volta depois.
 *
 * NOTA (nov/2026):
 * - espera a sessão ser recuperada pelo cookie (status "restoring") antes de
 *   decidir: quem já está logado não passa mais pelo login ao abrir a página;
 * - o endereço de volta vai no state da navegação (AuthLocationState), e não
 *   mais em ?next= na URL do login.
 */
export function ProtectedRoute(): ReactElement {
    const {t}: Translation = useTranslation();
    const {status}: SessionValue = useSession();
    const locale: Locale = useLocale();
    const location: Location = useLocation();

    if (status === SessionStatus.Restoring) {
        return (
            <div className={feedbackClasses.loaderPage}>
                <Loader label={t('Checking your session…')}/>
            </div>
        );
    }

    if (status === SessionStatus.Anonymous) {
        const state: AuthLocationState = {next: `${location.pathname}${location.search}`};
        return <Navigate to={paths.auth(locale)} state={state} replace/>;
    }

    return <Outlet/>;
}
