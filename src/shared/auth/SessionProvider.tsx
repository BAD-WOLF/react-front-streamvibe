import {preferredLocale} from '@i18n/locales.ts';
import {decodeClaims, type JwtClaims, onAccessTokenChange, readAccessToken} from '@shared/auth/accessToken.ts';
import {forgetLegacyStorage, onSessionSignal, SessionSignal} from '@shared/auth/crossTab.ts';
import {highestRoleOf} from '@shared/auth/roles.ts';
import {endSession, forgetSession, refreshAccessToken, restoreSession, startSession} from '@shared/auth/session.service.ts';
import {SessionContext, SessionStatus, type SessionUser, type SessionValue} from '@shared/auth/sessionContext.ts';
import {type Dispatch, type ReactElement, type ReactNode, type SetStateAction, useEffect, useMemo, useState} from 'react';

type SessionSnapshot = {
    user: SessionUser | null;
    expiresAt: Date | null;
};

function readSnapshot(): SessionSnapshot {
    const token: string | null = readAccessToken();
    const claims: JwtClaims | null = token !== null ? decodeClaims(token) : null;
    if (claims === null) return {user: null, expiresAt: null};

    return {
        user: {email: claims.username, role: highestRoleOf(claims.roles)},
        expiresAt: new Date(claims.exp * 1000),
    };
}

/**
 * NOTA (nov/2026): a sessão vive no cookie HttpOnly do refresh token, e o
 * access token, só na memória da aba. Ao montar, o provider apaga o que a
 * versão anterior guardava no localStorage e recupera a sessão pelo cookie
 * (status "restoring" até a API responder). Ele também ouve as outras abas:
 * um logout lá encerra a sessão aqui, e um login lá renova a daqui com o
 * cookie novo.
 *
 * A renovação e o logout usam o idioma preferido no caminho da API: são
 * rotas com {locale}, mas o resultado não depende dele, e o provider fica
 * fora do router.
 */
export function SessionProvider({children}: { children: ReactNode }): ReactElement {
    const [snapshot, setSnapshot]: [SessionSnapshot, Dispatch<SetStateAction<SessionSnapshot>>] = useState<SessionSnapshot>(readSnapshot);
    const [restoring, setRestoring]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(true);

    useEffect((): () => void => onAccessTokenChange((): void => setSnapshot(readSnapshot())), []);

    useEffect((): () => void => {
        let active: boolean = true;
        forgetLegacyStorage();
        void restoreSession(preferredLocale()).finally((): void => {
            if (active) setRestoring(false);
        });
        return (): void => {
            active = false;
        };
    }, []);

    useEffect((): () => void => onSessionSignal((signal: SessionSignal): void => {
        switch (signal) {
            case SessionSignal.Logout:
                forgetSession();
                break;
            case SessionSignal.Login:
                void refreshAccessToken(preferredLocale());
                break;
        }
    }), []);

    const value: SessionValue = useMemo((): SessionValue => {
        let status: SessionStatus = SessionStatus.Anonymous;
        if (snapshot.user !== null) status = SessionStatus.Authenticated;
        else if (restoring) status = SessionStatus.Restoring;

        return {
            ...snapshot,
            status,
            isAuthenticated: snapshot.user !== null,
            startSession,
            endSession: (): Promise<void> => endSession(preferredLocale()),
        };
    }, [snapshot, restoring]);

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
