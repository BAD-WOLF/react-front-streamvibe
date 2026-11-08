import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {paths} from '@shared/routing/paths.ts';
import {adminClasses} from '@shared/styles/ts/admin/AdminStyles.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink} from 'react-router-dom';

/**
 * As telas da administração: as contas (a lista e o detalhe de cada uma) e o
 * log de auditoria.
 *
 * NOTA (nov/2026): criado com a administração de contas.
 */
export function AdminNav(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const linkClass: (state: { isActive: boolean }) => string =
        ({isActive}: { isActive: boolean }): string => (isActive ? adminClasses.navLinkActive : adminClasses.navLink);

    return (
        <nav className={adminClasses.nav} aria-label={t('Administration')}>
            <NavLink to={paths.adminUsers(locale)} className={linkClass}>{t('Accounts')}</NavLink>
            <NavLink to={paths.auditLog(locale)} className={linkClass}>{t('Audit log')}</NavLink>
        </nav>
    );
}
