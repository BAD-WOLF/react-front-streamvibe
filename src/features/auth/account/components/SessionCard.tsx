import type {Locale} from '@i18n/locales.ts';
import {useSession} from '@shared/auth/useSession.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {paths} from '@shared/routing/paths.ts';
import {accountClasses} from '@shared/styles/ts/account/AccountStyles.ts';
import {formatDateTime} from '@shared/utils/format.ts';
import {LogOut} from 'lucide-react';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {type NavigateFunction, useNavigate} from 'react-router-dom';
import type {Translation} from '@i18n/translation.ts';
import type {SessionValue} from '@shared/auth/sessionContext.ts';

/** O que o JWT diz sobre a sessão: email (username), papéis e validade. */
export default function SessionCard(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const navigate: NavigateFunction = useNavigate();
    const session: SessionValue = useSession();

    const logout: () => void = (): void => {
        session.endSession();
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
                    <span className={accountClasses.factLabel}>{t('Roles')}</span>
                    {session.user?.roles.join(', ')} {session.user?.isAdmin === true && <span className={accountClasses.badge}>admin</span>}
                </div>
                <div>
                    <span className={accountClasses.factLabel}>{t('Access token valid until')}</span>
                    {formatDateTime(session.expiresAt?.toISOString(), locale)}
                </div>
            </div>
            <p className={accountClasses.cardText}>{t('The access token lasts one hour and is renewed automatically while your session is open (up to 30 days).')}</p>
            <button type="button" className={accountClasses.secondaryButton} onClick={logout}>
                <LogOut className="w-4 h-4"/> {t('Log out')}
            </button>
        </section>
    );
}
