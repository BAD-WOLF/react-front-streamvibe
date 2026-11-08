import {getUserResetRequests} from '@auth/repassword/services/repassword.service.ts';
import type {Locale} from '@i18n/locales.ts';
import {includesRole, Role} from '@shared/auth/roles.ts';
import {useSession} from '@shared/auth/useSession.ts';
import {EmptyState} from '@shared/components/feedback/EmptyState.tsx';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Loader} from '@shared/components/feedback/Loader.tsx';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {accountClasses} from '@shared/styles/ts/account/AccountStyles.ts';
import type {ResetRequestSummary, UserResetRequestsResponse} from '@shared/types/auth/index.ts';
import {formatDateTime} from '@shared/utils/format.ts';
import {type ChangeEvent, type Dispatch, type FormEvent, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import type {Translation} from '@i18n/translation.ts';
import type {SessionValue} from '@shared/auth/sessionContext.ts';

/**
 * Pedidos de troca de senha ativos de uma conta
 * (GET /reset-password/requests/{userId}, 🔒): o dono vê os dele, e
 * ROLE_ADMIN vê os de qualquer conta (403 nos outros casos).
 *
 * NOTA (nov/2026): o campo abre com o id da própria conta (`accountId`, do
 * GET /me), e não mais com o id guardado no cadastro feito neste navegador.
 */
export default function ResetRequestsCard({accountId}: { accountId: number | null }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const session: SessionValue = useSession();
    const [userId, setUserId]: [string, Dispatch<SetStateAction<string>>] = useState<string>(accountId !== null ? String(accountId) : '');
    const [result, setResult]: [UserResetRequestsResponse | null, Dispatch<SetStateAction<UserResetRequestsResponse | null>>] = useState<UserResetRequestsResponse | null>(null);
    const [error, setError]: [unknown, Dispatch<SetStateAction<unknown>>] = useState<unknown>(null);
    const [loading, setLoading]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);

    const load: (event: FormEvent<HTMLFormElement>) => Promise<void> = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        const id: number = Number(userId);
        if (!Number.isInteger(id) || id < 1) {
            setError(new Error(t('Type a valid account id (a positive whole number).')));
            return;
        }
        setLoading(true);
        setError(null);
        try {
            setResult((await getUserResetRequests(locale, id)).data);
        } catch (caught: unknown) {
            setResult(null);
            setError(caught);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={accountClasses.card}>
            <h2 className={accountClasses.cardTitle}>{t('Active password reset requests')}</h2>
            <p className={accountClasses.cardText}>
                {session.user !== null && includesRole(session.user.role, Role.Admin)
                    ? t('As an administrator, you can look up the requests of any account by its id.')
                    : t('You can look up the requests of your own account.')}
            </p>

            <form className={accountClasses.row} onSubmit={(event: FormEvent<HTMLFormElement>): void => void load(event)}>
                <label className={accountClasses.field}>
                    <span className={accountClasses.factLabel}>{t('Account id')}</span>
                    <input
                        className={accountClasses.input}
                        type="number"
                        min={1}
                        value={userId}
                        onChange={(event: ChangeEvent<HTMLInputElement>): void => setUserId(event.target.value)}
                    />
                </label>
                <button type="submit" className={accountClasses.button} disabled={loading}>{t('Look up')}</button>
            </form>

            {loading && <Loader/>}
            {error !== null && <ErrorMessage error={error}/>}
            {result !== null && !loading && (
                result.active_requests.length === 0 ? (
                    <EmptyState>{t('No active requests for account {{id}}.', {id: result.user_id})}</EmptyState>
                ) : (
                    <table className={accountClasses.table}>
                        <thead className={accountClasses.tableHead}>
                            <tr>
                                <th>#</th>
                                <th>{t('Requested at')}</th>
                                <th>{t('Expires at')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.active_requests.map((request: ResetRequestSummary): ReactElement => (
                                <tr key={request.id}>
                                    <td className={accountClasses.tableCell}>{request.id}</td>
                                    <td className={accountClasses.tableCell}>{formatDateTime(request.created_at, locale)}</td>
                                    <td className={accountClasses.tableCell}>{formatDateTime(request.expires_at, locale)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            )}
        </section>
    );
}
