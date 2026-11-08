import {AccountFlags} from '@admin/components/AccountFlags.tsx';
import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {RoleBadge} from '@shared/components/RoleBadge.tsx';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {paths} from '@shared/routing/paths.ts';
import {adminClasses} from '@shared/styles/ts/admin/AdminStyles.ts';
import type {AdminUserSummary} from '@shared/types/admin/index.ts';
import {formatDateTime} from '@shared/utils/format.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';

/**
 * Uma página de contas (GET /admin/users), cada uma levando ao detalhe.
 *
 * NOTA (nov/2026): criado com a administração de contas.
 */
export function UsersTable({users}: { users: AdminUserSummary[] }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();

    return (
        <div className={adminClasses.tableWrapper}>
            <table className={adminClasses.table}>
                <thead className={adminClasses.tableHead}>
                    <tr>
                        <th className={adminClasses.tableHeadCell}>{t('Email address')}</th>
                        <th className={adminClasses.tableHeadCell}>{t('Account role')}</th>
                        <th className={adminClasses.tableHeadCell}>{t('Status')}</th>
                        <th className={adminClasses.tableHeadCell}>{t('Created on')}</th>
                        <th className={adminClasses.tableHeadCell}>{t('Last login')}</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user: AdminUserSummary): ReactElement => (
                        <tr key={user.id}>
                            <td className={adminClasses.tableCell}>
                                <Link className={adminClasses.link} to={paths.adminUser(locale, user.id)}>{user.email}</Link>
                                <span className={`${adminClasses.muted} block text-xs`}>#{user.id}</span>
                            </td>
                            <td className={adminClasses.tableCell}><RoleBadge role={user.role}/></td>
                            <td className={adminClasses.tableCell}><AccountFlags verified={user.verified} blockedAt={user.blocked_at}/></td>
                            <td className={adminClasses.tableCell}>{formatDateTime(user.created_at, locale) ?? <span className={adminClasses.muted}>—</span>}</td>
                            <td className={adminClasses.tableCell}>{formatDateTime(user.last_login_at, locale) ?? <span className={adminClasses.muted}>{t('Never')}</span>}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
