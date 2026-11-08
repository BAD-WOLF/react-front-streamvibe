import type {Translation} from '@i18n/translation.ts';
import {roleLabel} from '@shared/auth/roleLabels.ts';
import type {Role} from '@shared/auth/roles.ts';
import {roleBadgeClasses} from '@shared/styles/ts/shared/RoleBadgeStyles.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';

/**
 * O papel de uma conta, com uma cor por nível (a conta e a administração).
 *
 * NOTA (nov/2026): criado com a hierarquia de papéis.
 */
export function RoleBadge({role}: { role: Role }): ReactElement {
    const {t}: Translation = useTranslation();

    return <span className={`${roleBadgeClasses.badge} ${roleBadgeClasses.tones[role]}`}>{roleLabel(t, role)}</span>;
}
