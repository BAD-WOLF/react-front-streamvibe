import type {SessionTokens} from '@shared/auth/tokenStorage.ts';
import {type Context, createContext} from 'react';

export type SessionUser = {
    /** O `username` do JWT, que é o email da conta. */
    email: string;
    roles: string[];
    isAdmin: boolean;
};

export type SessionValue = {
    user: SessionUser | null;
    isAuthenticated: boolean;
    /** Quando o JWT atual vence (o refresh token renova sozinho). */
    expiresAt: Date | null;
    startSession: (tokens: SessionTokens) => void;
    endSession: () => void;
};

export const SessionContext: Context<SessionValue | null> = createContext<SessionValue | null>(null);
