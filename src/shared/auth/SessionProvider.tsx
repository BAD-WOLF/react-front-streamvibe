import {SessionContext, type SessionUser, type SessionValue} from '@shared/auth/sessionContext.ts';
import {clearTokens, decodeClaims, type JwtClaims, onTokensChange, readTokens, saveTokens, type SessionTokens} from '@shared/auth/tokenStorage.ts';
import {type Dispatch, type ReactElement, type ReactNode, type SetStateAction, useEffect, useMemo, useState} from 'react';

type SessionSnapshot = {
    user: SessionUser | null;
    expiresAt: Date | null;
};

function readSnapshot(): SessionSnapshot {
    const tokens: SessionTokens | null = readTokens();
    const claims: JwtClaims | null = tokens !== null ? decodeClaims(tokens.token) : null;
    if (claims === null) return {user: null, expiresAt: null};

    return {
        user: {email: claims.username, roles: claims.roles, isAdmin: claims.roles.includes('ROLE_ADMIN')},
        expiresAt: new Date(claims.exp * 1000),
    };
}

export function SessionProvider({children}: { children: ReactNode }): ReactElement {
    const [snapshot, setSnapshot]: [SessionSnapshot, Dispatch<SetStateAction<SessionSnapshot>>] = useState<SessionSnapshot>(readSnapshot);

    useEffect((): () => void => onTokensChange((): void => setSnapshot(readSnapshot())), []);

    const value: SessionValue = useMemo((): SessionValue => ({
        ...snapshot,
        isAuthenticated: snapshot.user !== null,
        startSession: saveTokens,
        endSession: clearTokens,
    }), [snapshot]);

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
