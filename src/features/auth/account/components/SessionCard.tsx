import type {Locale} from '@i18n/locales.ts';
import {useSession} from '@shared/auth/useSession.ts';
import {RoleBadge} from '@shared/components/RoleBadge.tsx';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {paths} from '@shared/routing/paths.ts';
import {accountClasses} from '@shared/styles/ts/account/AccountStyles.ts';
import type {CurrentUserResponse} from '@shared/types/account/index.ts';
import {formatDateTime} from '@shared/utils/format.ts';
import {LogOut} from 'lucide-react';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {type NavigateFunction, useNavigate} from 'react-router-dom';
import type {Translation} from '@i18n/translation.ts';
import type {SessionValue} from '@shared/auth/sessionContext.ts';

/**
 * A conta e a sessão: email e papel (do JWT), o id e o email confirmado
 * (`account`, do GET /me, null enquanto carrega) e até quando vale o access
 * token.
 *
 * NOTA (nov/2026): o access token agora vale 15 minutos e fica só na
 * memória da aba; a sessão continua pelo cookie do refresh token, que é
 * trocado a cada renovação e dura 30 dias.
 *
 * NOTA (nov/2026, papéis): os papéis viraram o papel da conta (RoleBadge).
 */
export default function SessionCard({account}: { account: CurrentUserResponse | null }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const navigate: NavigateFunction = useNavigate();
    const session: SessionValue = useSession();

    const logout: () => void = (): void => {
        void session.endSession();
        void navigate(paths.auth(locale));
    };

    return (
        <section className={accountClasses.card}>
            <h2 className={accountClasses.cardTitle}>{t('Session')}</h2>
            <div className={accountClasses.facts}>
                <div>
                    <span className={accountClasses.factLabel}>{t('Email address')}</span>
                    {session.user?.email}
                </div>
                <div>
                    <span className={accountClasses.factLabel}>{t('Account role')}</span>
                    {session.user !== null && <RoleBadge role={session.user.role}/>}
                </div>
                <div>
                    <span className={accountClasses.factLabel}>{t('Account id')}</span>
                    {account?.id ?? '…'}
                </div>
                <div>
                    <span className={accountClasses.factLabel}>{t('Email confirmed')}</span>
                    {account === null ? '…' : account.verified ? t('Confirmed') : t('Not confirmed yet')}
                </div>
                <div>
                    <span className={accountClasses.factLabel}>{t('Access token valid until')}</span>
                    {formatDateTime(session.expiresAt?.toISOString(), locale)}
                </div>
            </div>
            <p className={accountClasses.cardText}>{t('The access token lasts 15 minutes and is renewed automatically while your session is open (up to 30 days without use).')}</p>
            <button type="button" className={accountClasses.secondaryButton} onClick={logout}>
                <LogOut className="w-4 h-4"/> {t('Log out')}
            </button>
        </section>
    );
}
