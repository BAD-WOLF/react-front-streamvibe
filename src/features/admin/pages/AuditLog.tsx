import {AdminNav} from '@admin/components/AdminNav.tsx';
import {AuditLogFilterForm} from '@admin/components/AuditLogFilterForm.tsx';
import {AuditLogTable} from '@admin/components/AuditLogTable.tsx';
import {listAuditLog} from '@admin/services/auditLog.service.ts';
import {readAuditLogFilters} from '@admin/utils/adminFilters.ts';
import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {EmptyState} from '@shared/components/feedback/EmptyState.tsx';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Loader} from '@shared/components/feedback/Loader.tsx';
import {Pagination} from '@shared/components/Pagination.tsx';
import {type AsyncState, useAsync} from '@shared/hooks/useAsync.ts';
import {useDocumentTitle} from '@shared/hooks/useDocumentTitle.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {paths} from '@shared/routing/paths.ts';
import {adminClasses} from '@shared/styles/ts/admin/AdminStyles.ts';
import type {AuditLogFilters, AuditLogResponse} from '@shared/types/admin/index.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {type NavigateFunction, type SetURLSearchParams, useNavigate, useSearchParams} from 'react-router-dom';

/**
 * O log de auditoria (GET /admin/audit-log): o que foi feito em qual conta,
 * por quem e quando — da entrada mais nova para a mais antiga, com os
 * filtros na URL.
 *
 * NOTA (nov/2026): criado com a administração de contas.
 */
export default function AuditLog(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const navigate: NavigateFunction = useNavigate();
    const [searchParams]: [URLSearchParams, SetURLSearchParams] = useSearchParams();
    const filters: AuditLogFilters = readAuditLogFilters(searchParams);
    useDocumentTitle(t('Audit log'));

    const result: AsyncState<AuditLogResponse> = useAsync<AuditLogResponse>(
        async (signal: AbortSignal): Promise<AuditLogResponse> => (await listAuditLog(locale, filters, signal)).data,
        `${locale}|${searchParams.toString()}`,
    );

    const goTo: (next: AuditLogFilters) => void = (next: AuditLogFilters): void => {
        void navigate(paths.auditLog(locale, next));
    };

    return (
        <div className={adminClasses.page}>
            <div className={adminClasses.header}>
                <div>
                    <h1 className={adminClasses.title}>{t('Audit log')}</h1>
                    <p className={adminClasses.subtitle}>{t('What was done to the accounts, by whom and when.')}</p>
                </div>
                <AdminNav/>
            </div>

            <section className={adminClasses.card}>
                <AuditLogFilterForm key={searchParams.toString()} filters={filters} onChange={(next: AuditLogFilters): void => goTo({...next, page: 1})}/>
            </section>

            {result.loading && <Loader/>}
            {result.error !== null && <ErrorMessage error={result.error} onRetry={result.reload}/>}
            {result.data !== null && (
                <section className={adminClasses.card}>
                    {result.data.entries.length === 0
                        ? <EmptyState>{t('No entry matches these filters.')}</EmptyState>
                        : <AuditLogTable entries={result.data.entries}/>}
                    <Pagination
                        page={result.data.current_page}
                        totalPages={result.data.total_pages}
                        maxPage={Number.POSITIVE_INFINITY}
                        onChange={(page: number): void => goTo({...filters, page})}
                    />
                </section>
            )}
        </div>
    );
}
