import PasswordResetCard from '@auth/account/components/PasswordResetCard.tsx';
import ResetRequestsCard from '@auth/account/components/ResetRequestsCard.tsx';
import SessionCard from '@auth/account/components/SessionCard.tsx';
import VerificationStatusCard from '@auth/account/components/VerificationStatusCard.tsx';
import {getCurrentUser} from '@auth/account/services/account.service.ts';
import type {Locale} from '@i18n/locales.ts';
import {includesRole, Role} from '@shared/auth/roles.ts';
import {useSession} from '@shared/auth/useSession.ts';
import {type AsyncState, useAsync} from '@shared/hooks/useAsync.ts';
import {useDocumentTitle} from '@shared/hooks/useDocumentTitle.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {accountClasses} from '@shared/styles/ts/account/AccountStyles.ts';
import type {CurrentUserResponse} from '@shared/types/account/index.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';
import type {SessionValue} from '@shared/auth/sessionContext.ts';

/**
 * A página da conta.
 *
 * NOTA (nov/2026): os dados da conta (id e email confirmado) vêm do
 * GET /me, a rota nova da API. Antes o id só era conhecido se o cadastro
 * tivesse sido feito neste navegador (o front o guardava no localStorage).
 * O cartão dos pedidos de troca de senha remonta quando o id chega (key),
 * para já abrir com ele preenchido.
 */
export default function Account(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const session: SessionValue = useSession();
    const currentUser: AsyncState<CurrentUserResponse> = useAsync<CurrentUserResponse>(
        async (signal: AbortSignal): Promise<CurrentUserResponse> => (await getCurrentUser(locale, signal)).data,
        locale,
    );
    useDocumentTitle(t('My account'));

    return (
        <div className={accountClasses.page}>
            <h1 className={accountClasses.title}>{t('My account')}</h1>
            <SessionCard account={currentUser.data}/>
            <PasswordResetCard/>
            <ResetRequestsCard key={currentUser.data?.id ?? 'loading'} accountId={currentUser.data?.id ?? null}/>
            {session.user !== null && includesRole(session.user.role, Role.Admin) && <VerificationStatusCard/>}
        </div>
    );
}
