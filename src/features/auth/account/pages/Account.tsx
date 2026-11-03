import PasswordResetCard from '@auth/account/components/PasswordResetCard.tsx';
import ResetRequestsCard from '@auth/account/components/ResetRequestsCard.tsx';
import SessionCard from '@auth/account/components/SessionCard.tsx';
import VerificationStatusCard from '@auth/account/components/VerificationStatusCard.tsx';
import {useSession} from '@shared/auth/useSession.ts';
import {useDocumentTitle} from '@shared/hooks/useDocumentTitle.ts';
import {accountClasses} from '@shared/styles/ts/account/AccountStyles.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';
import type {SessionValue} from '@shared/auth/sessionContext.ts';

/**
 * NOTA (nov/2026): a página da conta. A API não tem rota "quem sou eu":
 * o email e os papéis vêm do JWT, e o id da conta (pedido por
 * /reset-password/requests/{userId}) só é conhecido se o cadastro foi feito
 * neste navegador. Ver as pendências do backend no README.
 */
export default function Account(): ReactElement {
    const {t}: Translation = useTranslation();
    const session: SessionValue = useSession();
    useDocumentTitle(t('My account'));

    return (
        <div className={accountClasses.page}>
            <h1 className={accountClasses.title}>{t('My account')}</h1>
            <SessionCard/>
            <PasswordResetCard/>
            <ResetRequestsCard/>
            {session.user?.isAdmin === true && <VerificationStatusCard/>}
        </div>
    );
}
