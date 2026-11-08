import {auditActionLabel, auditDetailLines} from '@admin/utils/auditLabels.ts';
import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {paths} from '@shared/routing/paths.ts';
import {adminClasses} from '@shared/styles/ts/admin/AdminStyles.ts';
import type {AuditLogAccount, AuditLogEntry} from '@shared/types/admin/index.ts';
import {formatDateTime} from '@shared/utils/format.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';

/**
 * Entradas do log de auditoria: quando, o quê, quem fez (o console quando não
 * há conta), a conta afetada (o link leva ao detalhe; uma conta excluída
 * responde "não encontrada") e os detalhes.
 *
 * NOTA (nov/2026): criado com a administração de contas.
 */
export function AuditLogTable({entries}: { entries: AuditLogEntry[] }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const account: (value: AuditLogAccount | null, fallback: string) => ReactElement =
        (value: AuditLogAccount | null, fallback: string): ReactElement => (value === null
            ? <span className={adminClasses.muted}>{fallback}</span>
            : <Link className={adminClasses.link} to={paths.adminUser(locale, value.id)}>{value.email}</Link>);

    return (
        <div className={adminClasses.tableWrapper}>
            <table className={adminClasses.table}>
                <thead className={adminClasses.tableHead}>
                    <tr>
                        <th className={adminClasses.tableHeadCell}>{t('When')}</th>
                        <th className={adminClasses.tableHeadCell}>{t('Action')}</th>
                        <th className={adminClasses.tableHeadCell}>{t('Done by')}</th>
                        <th className={adminClasses.tableHeadCell}>{t('Affected account')}</th>
                        <th className={adminClasses.tableHeadCell}>{t('What changed')}</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry: AuditLogEntry): ReactElement => (
                        <tr key={entry.id}>
                            <td className={adminClasses.tableCell}>{formatDateTime(entry.occurred_at, locale)}</td>
                            <td className={adminClasses.tableCell}>{auditActionLabel(t, entry.action)}</td>
                            <td className={adminClasses.tableCell}>{account(entry.actor, t('Console (server)'))}</td>
                            <td className={adminClasses.tableCell}>{account(entry.target, '—')}</td>
                            <td className={adminClasses.tableCell}>
                                <ul className={adminClasses.details}>
                                    {auditDetailLines(t, entry.details).map((line: string): ReactElement => <li key={line}>{line}</li>)}
                                </ul>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
