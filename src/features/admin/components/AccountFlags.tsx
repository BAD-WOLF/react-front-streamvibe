import type {Translation} from '@i18n/translation.ts';
import {adminClasses} from '@shared/styles/ts/admin/AdminStyles.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';

/**
 * O estado de uma conta: email confirmado ou não, e bloqueada.
 *
 * NOTA (nov/2026): criado com a administração de contas.
 */
export function AccountFlags({verified, blockedAt}: { verified: boolean; blockedAt: string | null }): ReactElement {
    const {t}: Translation = useTranslation();

    return (
        <span className={adminClasses.flags}>
            <span className={`${adminClasses.flag} ${verified ? adminClasses.flagTones.ok : adminClasses.flagTones.warning}`}>
                {verified ? t('Confirmed') : t('Not confirmed yet')}
            </span>
            {blockedAt !== null && <span className={`${adminClasses.flag} ${adminClasses.flagTones.danger}`}>{t('Blocked')}</span>}
        </span>
    );
}
