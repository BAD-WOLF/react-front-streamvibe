import {
    blockUser, changeUserRole, deleteUser, resendUserVerification, revokeUserSessions, unblockUser, verifyUser
} from '@admin/services/adminUsers.service.ts';
import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {roleLabel} from '@shared/auth/roleLabels.ts';
import {isRole, type Role} from '@shared/auth/roles.ts';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Notice} from '@shared/components/feedback/Notice.tsx';
import {Modal} from '@shared/components/Modal.tsx';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {adminClasses} from '@shared/styles/ts/admin/AdminStyles.ts';
import type {
    BlockUserResponse, ChangeUserRoleResponse, DeleteUserResponse, ResendUserVerificationResponse, RevokeUserSessionsResponse,
    UnblockUserResponse, UserDetailsResponse, VerifyUserResponse
} from '@shared/types/admin/index.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';
import {Ban, LogOut, MailCheck, MailPlus, ShieldCheck, Trash2, Unlock} from 'lucide-react';
import {type ChangeEvent, type Dispatch, type FormEvent, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';

const MAX_REASON_LENGTH: number = 255;

/**
 * As ações sobre uma conta, só as que valem para o estado dela e para quem
 * está logado (can_manage, assignable_roles do detalhe): confirmar o email,
 * reenviar a confirmação, bloquear (com o motivo) ou desbloquear, mudar o
 * papel, encerrar as sessões e excluir (com confirmação).
 *
 * Depois de cada ação, `onChanged` recebe a mensagem para a tela (quem usa
 * recarrega o detalhe); a exclusão chama `onDeleted`. Um erro da API (ex.:
 * 409 se outro admin mudou a conta no meio) aparece aqui.
 *
 * NOTA (nov/2026): criado com a administração de contas.
 */
export function UserActions({user, onChanged, onDeleted}: {
    user: UserDetailsResponse;
    onChanged: (message: string) => void;
    onDeleted: (email: string) => void;
}): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const [busy, setBusy]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const [error, setError]: [unknown, Dispatch<SetStateAction<unknown>>] = useState<unknown>(null);
    const [reason, setReason]: [string, Dispatch<SetStateAction<string>>] = useState<string>('');
    const [role, setRole]: [Role, Dispatch<SetStateAction<Role>>] = useState<Role>(user.role);
    const [confirmingDelete, setConfirmingDelete]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);

    if (!user.can_manage) {
        return (
            <Notice tone="info">
                {t('You can see this account, but not change it: it is your own, or its role is not below yours.')}
            </Notice>
        );
    }

    /** Roda uma ação; `success` monta a mensagem a partir da resposta. */
    const run: <T>(action: () => Promise<T>, success: (result: T) => void) => Promise<void> =
        async <T, >(action: () => Promise<T>, success: (result: T) => void): Promise<void> => {
            setBusy(true);
            setError(null);
            try {
                success(await action());
            } catch (caught: unknown) {
                setError(caught);
            } finally {
                setBusy(false);
            }
        };

    const block: (event: FormEvent<HTMLFormElement>) => void = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        void run(
            (): Promise<ApiResult<BlockUserResponse>> => blockUser(locale, user.id, {reason: reason.trim()}),
            ({data}: ApiResult<BlockUserResponse>): void => {
                setReason('');
                onChanged(t('The account is blocked; sessions ended: {{count}}.', {count: data.revoked_sessions}));
            },
        );
    };
    const changeRole: (event: FormEvent<HTMLFormElement>) => void = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        void run(
            (): Promise<ApiResult<ChangeUserRoleResponse>> => changeUserRole(locale, user.id, {role}),
            ({data}: ApiResult<ChangeUserRoleResponse>): void => onChanged(t('The role is now {{role}}.', {role: roleLabel(t, data.role)})),
        );
    };
    const remove: () => void = (): void => {
        void run(
            (): Promise<ApiResult<DeleteUserResponse>> => deleteUser(locale, user.id),
            (): void => {
                setConfirmingDelete(false);
                onDeleted(user.email);
            },
        );
    };

    return (
        <section className={adminClasses.card}>
            <h2 className={adminClasses.cardTitle}>{t('Actions')}</h2>
            {error !== null && <ErrorMessage error={error}/>}
            <div className={adminClasses.actions}>
                {!user.verified && (
                    <div className={adminClasses.action}>
                        <h3 className={adminClasses.actionTitle}>{t('Email confirmation')}</h3>
                        <p className={adminClasses.cardText}>{t('The account cannot log in until the email is confirmed.')}</p>
                        <div className={adminClasses.actionRow}>
                            <button
                                type="button"
                                className={adminClasses.button}
                                disabled={busy}
                                onClick={(): void => void run(
                                    (): Promise<ApiResult<VerifyUserResponse>> => verifyUser(locale, user.id),
                                    (): void => onChanged(t('The email of the account is confirmed.')),
                                )}
                            >
                                <MailCheck className="w-4 h-4"/> {t('Confirm the email')}
                            </button>
                            <button
                                type="button"
                                className={adminClasses.secondaryButton}
                                disabled={busy}
                                onClick={(): void => void run(
                                    (): Promise<ApiResult<ResendUserVerificationResponse>> => resendUserVerification(locale, user.id),
                                    (): void => onChanged(t('The confirmation email was sent again.')),
                                )}
                            >
                                <MailPlus className="w-4 h-4"/> {t('Send the confirmation email again')}
                            </button>
                        </div>
                    </div>
                )}

                {user.blocked_at === null
                    ? (
                        <form className={adminClasses.action} onSubmit={block}>
                            <h3 className={adminClasses.actionTitle}>{t('Block the account')}</h3>
                            <label className={adminClasses.field}>
                                <span className={adminClasses.label}>{t('Block reason')}</span>
                                <textarea
                                    className={adminClasses.textarea}
                                    value={reason}
                                    maxLength={MAX_REASON_LENGTH}
                                    required
                                    placeholder={t('Other admins read it; it stays in the audit log.')}
                                    onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => setReason(event.target.value)}
                                />
                            </label>
                            <button type="submit" className={adminClasses.dangerButton} disabled={busy || reason.trim() === ''}>
                                <Ban className="w-4 h-4"/> {t('Block the account')}
                            </button>
                        </form>
                    )
                    : (
                        <div className={adminClasses.action}>
                            <h3 className={adminClasses.actionTitle}>{t('Unblock the account')}</h3>
                            <p className={adminClasses.cardText}>{t('The account can log in again; the block reason stays in the audit log.')}</p>
                            <button
                                type="button"
                                className={adminClasses.button}
                                disabled={busy}
                                onClick={(): void => void run(
                                    (): Promise<ApiResult<UnblockUserResponse>> => unblockUser(locale, user.id),
                                    (): void => onChanged(t('The account is unblocked.')),
                                )}
                            >
                                <Unlock className="w-4 h-4"/> {t('Unblock the account')}
                            </button>
                        </div>
                    )}

                <form className={adminClasses.action} onSubmit={changeRole}>
                    <h3 className={adminClasses.actionTitle}>{t('Change role')}</h3>
                    <label className={adminClasses.field}>
                        <span className={adminClasses.label}>{t('Account role')}</span>
                        <select
                            className={adminClasses.input}
                            value={role}
                            onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
                                const value: string = event.target.value;
                                if (isRole(value)) setRole(value);
                            }}
                        >
                            {user.assignable_roles.map((assignable: Role): ReactElement => <option key={assignable} value={assignable}>{roleLabel(t, assignable)}</option>)}
                        </select>
                    </label>
                    <button type="submit" className={adminClasses.button} disabled={busy || role === user.role}>
                        <ShieldCheck className="w-4 h-4"/> {t('Change role')}
                    </button>
                </form>

                <div className={adminClasses.action}>
                    <h3 className={adminClasses.actionTitle}>{t('End all sessions')}</h3>
                    <p className={adminClasses.cardText}>{t('Every browser of the account needs a new login within 15 minutes.')}</p>
                    <button
                        type="button"
                        className={adminClasses.secondaryButton}
                        disabled={busy}
                        onClick={(): void => void run(
                            (): Promise<ApiResult<RevokeUserSessionsResponse>> => revokeUserSessions(locale, user.id),
                            ({data}: ApiResult<RevokeUserSessionsResponse>): void => onChanged(t('Sessions ended: {{count}}.', {count: data.revoked_sessions})),
                        )}
                    >
                        <LogOut className="w-4 h-4"/> {t('End all sessions')}
                    </button>
                </div>

                <div className={adminClasses.action}>
                    <h3 className={adminClasses.actionTitle}>{t('Delete the account')}</h3>
                    <p className={adminClasses.cardText}>{t('The account, its password reset requests and its sessions are deleted. The audit log keeps its entries.')}</p>
                    <button type="button" className={adminClasses.dangerButton} disabled={busy} onClick={(): void => setConfirmingDelete(true)}>
                        <Trash2 className="w-4 h-4"/> {t('Delete the account')}
                    </button>
                </div>
            </div>

            {confirmingDelete && (
                <Modal title={t('Delete {{email}}?', {email: user.email})} onClose={(): void => setConfirmingDelete(false)}>
                    <div className={adminClasses.confirm}>
                        <p>{t('This cannot be undone.')}</p>
                        {error !== null && <ErrorMessage error={error}/>}
                        <div className={adminClasses.confirmActions}>
                            <button type="button" className={adminClasses.secondaryButton} onClick={(): void => setConfirmingDelete(false)}>{t('Cancel')}</button>
                            <button type="button" className={adminClasses.dangerButton} disabled={busy} onClick={remove}>
                                <Trash2 className="w-4 h-4"/> {t('Delete the account')}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </section>
    );
}
