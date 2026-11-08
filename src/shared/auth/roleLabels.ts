import type {Translation} from '@i18n/translation.ts';
import {Role} from '@shared/auth/roles.ts';

/**
 * O nome de um papel na tela.
 *
 * NOTA (nov/2026): criado com a hierarquia de papéis.
 */
export function roleLabel(t: Translation['t'], role: Role): string {
    switch (role) {
        case Role.User:
            return t('User');
        case Role.Dev:
            return t('Developer');
        case Role.Admin:
            return t('Administrator');
        case Role.Owner:
            return t('Owner');
    }
}
