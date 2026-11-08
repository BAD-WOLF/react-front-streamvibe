import {AccountFlags} from '@admin/components/AccountFlags.tsx';
import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {RoleBadge} from '@shared/components/RoleBadge.tsx';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {adminClasses} from '@shared/styles/ts/admin/AdminStyles.ts';
import type {UserDetailsResponse} from '@shared/types/admin/index.ts';
import type {ResetRequestSummary} from '@shared/types/auth/index.ts';
import {formatDateTime} from '@shared/utils/format.ts';
import type {ReactElement, ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

function Fact({label, children}: { label: string; children: ReactNode }): ReactElement {
    return (
        <div className={adminClasses.fact}>
            <span className={`${adminClasses.label} block`}>{label}</span>
            <div>{children}</div>
        </div>
    );
}

/**
 * Tudo o que a API sabe da conta (GET /admin/users/{userId}): os dados, o
 * estado, as sessões ativas e os pedidos de troca de senha ainda válidos.
 *
 * NOTA (nov/2026): criado com a administração de contas.
 */
export function UserFacts({user}: { user: UserDetailsResponse }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const none: ReactElement = <span className={adminClasses.muted}>—</span>;

    return (
        <section className={adminClasses.card}>
            <h2 className={adminClasses.cardTitle}>{t('Account details')}</h2>
            <div className={adminClasses.facts}>
                <Fact label={t('Account id')}>{user.id}</Fact>
                <Fact label={t('Email address')}>{user.email}</Fact>
                <Fact label={t('Account role')}><RoleBadge role={user.role}/></Fact>
                <Fact label={t('Status')}><AccountFlags verified={user.verified} blockedAt={user.blocked_at}/></Fact>
                <Fact label={t('Created on')}>{formatDateTime(user.created_at, locale) ?? none}</Fact>
                <Fact label={t('Last login')}>{formatDateTime(user.last_login_at, locale) ?? <span className={adminClasses.muted}>{t('Never')}</span>}</Fact>
                <Fact label={t('Active sessions')}>{user.active_sessions}</Fact>
                {user.blocked_at !== null && (
                    <>
                        <Fact label={t('Block date')}>{formatDateTime(user.blocked_at, locale)}</Fact>
                        <Fact label={t('Block reason')}>{user.blocked_reason ?? none}</Fact>
                    </>
                )}
            </div>
            <div className="space-y-2">
                <h3 className={adminClasses.actionTitle}>{t('Active password reset requests')}</h3>
                {user.password_reset_requests.length === 0
                    ? <p className={adminClasses.cardText}>{t('None.')}</p>
                    : (
                        <ul className={adminClasses.details}>
                            {user.password_reset_requests.map((request: ResetRequestSummary): ReactElement => (
                                <li key={request.id}>
                                    {t('Requested on {{requested}}, valid until {{expires}}', {
                                        requested: formatDateTime(request.created_at, locale),
                                        expires: formatDateTime(request.expires_at, locale),
                                    })}
                                </li>
                            ))}
                        </ul>
                    )}
            </div>
        </section>
    );
}
