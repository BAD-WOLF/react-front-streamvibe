import {AdminNav} from '@admin/components/AdminNav.tsx';
import {UserFilters} from '@admin/components/UserFilters.tsx';
import {UsersTable} from '@admin/components/UsersTable.tsx';
import {listUsers} from '@admin/services/adminUsers.service.ts';
import {readUserListFilters} from '@admin/utils/adminFilters.ts';
import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {EmptyState} from '@shared/components/feedback/EmptyState.tsx';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Loader} from '@shared/components/feedback/Loader.tsx';
import {Notice} from '@shared/components/feedback/Notice.tsx';
import {Pagination} from '@shared/components/Pagination.tsx';
import {type AsyncState, useAsync} from '@shared/hooks/useAsync.ts';
import {useDocumentTitle} from '@shared/hooks/useDocumentTitle.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {paths, readAdminUsersLocationState} from '@shared/routing/paths.ts';
import {adminClasses} from '@shared/styles/ts/admin/AdminStyles.ts';
import type {UserListFilters, UserListResponse} from '@shared/types/admin/index.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {type Location, type NavigateFunction, type SetURLSearchParams, useLocation, useNavigate, useSearchParams} from 'react-router-dom';

/**
 * A lista de contas (GET /admin/users): os filtros e a página ficam na URL,
 * cada conta leva ao detalhe.
 *
 * NOTA (nov/2026): criado com a administração de contas.
 */
export default function AdminUsers(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const navigate: NavigateFunction = useNavigate();
    const location: Location = useLocation();
    const [searchParams]: [URLSearchParams, SetURLSearchParams] = useSearchParams();
    const filters: UserListFilters = readUserListFilters(searchParams);
    const deleted: string | undefined = readAdminUsersLocationState(location.state).deleted;
    useDocumentTitle(t('Accounts'));

    const result: AsyncState<UserListResponse> = useAsync<UserListResponse>(
        async (signal: AbortSignal): Promise<UserListResponse> => (await listUsers(locale, filters, signal)).data,
        `${locale}|${searchParams.toString()}`,
    );

    const goTo: (next: UserListFilters) => void = (next: UserListFilters): void => {
        void navigate(paths.adminUsers(locale, next));
    };

    return (
        <div className={adminClasses.page}>
            <div className={adminClasses.header}>
                <div>
                    <h1 className={adminClasses.title}>{t('Accounts')}</h1>
                    {result.data !== null && <p className={adminClasses.subtitle}>{t('{{count}} accounts found', {count: result.data.total_results})}</p>}
                </div>
                <AdminNav/>
            </div>

            {deleted !== undefined && <Notice tone="success">{t('The account {{email}} was deleted.', {email: deleted})}</Notice>}

            <section className={adminClasses.card}>
                <UserFilters key={searchParams.toString()} filters={filters} onChange={(next: UserListFilters): void => goTo({...next, page: 1})}/>
            </section>

            {result.loading && <Loader/>}
            {result.error !== null && <ErrorMessage error={result.error} onRetry={result.reload}/>}
            {result.data !== null && (
                <section className={adminClasses.card}>
                    {result.data.users.length === 0
                        ? <EmptyState>{t('No account matches these filters.')}</EmptyState>
                        : <UsersTable users={result.data.users}/>}
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
