import {AdminNav} from '@admin/components/AdminNav.tsx';
import {AuditLogTable} from '@admin/components/AuditLogTable.tsx';
import {UserActions} from '@admin/components/UserActions.tsx';
import {UserFacts} from '@admin/components/UserFacts.tsx';
import {listAuditLog} from '@admin/services/auditLog.service.ts';
import {getUserDetails} from '@admin/services/adminUsers.service.ts';
import {NotFound} from '@app/NotFound.tsx';
import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {EmptyState} from '@shared/components/feedback/EmptyState.tsx';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Loader} from '@shared/components/feedback/Loader.tsx';
import {Notice} from '@shared/components/feedback/Notice.tsx';
import {type AsyncState, useAsync} from '@shared/hooks/useAsync.ts';
import {useDocumentTitle} from '@shared/hooks/useDocumentTitle.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {type AdminUsersLocationState, paths} from '@shared/routing/paths.ts';
import {adminClasses} from '@shared/styles/ts/admin/AdminStyles.ts';
import type {AuditLogResponse, UserDetailsResponse} from '@shared/types/admin/index.ts';
import {type Dispatch, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Link, type NavigateFunction, useNavigate, useParams} from 'react-router-dom';

const MAX_ID_DIGITS: RegExp = /^\d{1,9}$/;

/**
 * Uma conta (GET /admin/users/{userId}): tudo o que a API sabe dela, as
 * ações que quem está logado pode fazer e o histórico (a primeira página do
 * log de auditoria da conta; o resto no log, filtrado por ela).
 *
 * Depois de cada ação o detalhe e o histórico são lidos de novo, e a
 * mensagem da ação aparece em cima.
 *
 * NOTA (nov/2026): criado com a administração de contas.
 */
export default function AdminUserDetails(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const navigate: NavigateFunction = useNavigate();
    const {userId}: Readonly<Partial<{ userId: string }>> = useParams<{ userId: string }>();
    const [message, setMessage]: [string | null, Dispatch<SetStateAction<string | null>>] = useState<string | null>(null);
    const id: number | null = userId !== undefined && MAX_ID_DIGITS.test(userId) && Number(userId) > 0 ? Number(userId) : null;

    const details: AsyncState<UserDetailsResponse> = useAsync<UserDetailsResponse>(
        async (signal: AbortSignal): Promise<UserDetailsResponse> => (await getUserDetails(locale, id ?? 0, signal)).data,
        id !== null ? `${locale}|${id}` : null,
    );
    const history: AsyncState<AuditLogResponse> = useAsync<AuditLogResponse>(
        async (signal: AbortSignal): Promise<AuditLogResponse> => (await listAuditLog(locale, {user_id: id ?? 0}, signal)).data,
        id !== null ? `${locale}|${id}` : null,
    );
    useDocumentTitle(details.data?.email ?? t('Account details'));

    if (id === null) return <NotFound/>;

    const changed: (text: string) => void = (text: string): void => {
        setMessage(text);
        details.reload();
        history.reload();
    };
    const deleted: (email: string) => void = (email: string): void => {
        const state: AdminUsersLocationState = {deleted: email};
        void navigate(paths.adminUsers(locale), {state});
    };

    return (
        <div className={adminClasses.page}>
            <div className={adminClasses.header}>
                <div>
                    <h1 className={adminClasses.title}>{details.data?.email ?? t('Account details')}</h1>
                    <p className={adminClasses.subtitle}>
                        <Link className={adminClasses.link} to={paths.adminUsers(locale)}>{t('Back to the accounts')}</Link>
                    </p>
                </div>
                <AdminNav/>
            </div>

            {message !== null && <Notice tone="success">{message}</Notice>}
            {details.loading && details.data === null && <Loader/>}
            {details.error !== null && <ErrorMessage error={details.error} onRetry={details.reload}/>}

            {details.data !== null && (
                <>
                    <UserFacts user={details.data}/>
                    <UserActions user={details.data} onChanged={changed} onDeleted={deleted}/>
                </>
            )}

            <section className={adminClasses.card}>
                <div className={adminClasses.header}>
                    <h2 className={adminClasses.cardTitle}>{t('History')}</h2>
                    <Link className={adminClasses.link} to={paths.auditLog(locale, {user_id: id})}>{t('See it all in the audit log')}</Link>
                </div>
                {history.loading && history.data === null && <Loader/>}
                {history.error !== null && <ErrorMessage error={history.error} onRetry={history.reload}/>}
                {history.data !== null && (history.data.entries.length === 0
                    ? <EmptyState>{t('Nothing was done to this account yet.')}</EmptyState>
                    : <AuditLogTable entries={history.data.entries}/>)}
            </section>
        </div>
    );
}
