import {type Context, createContext} from 'react';

// NOTA (nov/2026): a sessão agora começa "restoring": ao abrir a página, o
// access token (só em memória) ainda não existe e é pedido ao cookie do
// refresh token. As rotas 🔒 esperam esse passo, em vez de mandar para o
// login quem já está logado.
export enum SessionStatus {
    Restoring = 'restoring',
    Authenticated = 'authenticated',
    Anonymous = 'anonymous',
}

export type SessionUser = {
    /** O `username` do JWT, que é o email da conta. */
    email: string;
    roles: string[];
    isAdmin: boolean;
};

export type SessionValue = {
    status: SessionStatus;
    user: SessionUser | null;
    isAuthenticated: boolean;
    /** Quando o JWT atual vence (a sessão renova sozinha). */
    expiresAt: Date | null;
    /** Depois do login: o access token fica nesta aba, e as outras abas pedem o delas. */
    startSession: (accessToken: string) => void;
    /** Logout: esta aba e as outras esquecem o access token, e a API apaga o cookie. */
    endSession: () => Promise<void>;
};

export const SessionContext: Context<SessionValue | null> = createContext<SessionValue | null>(null);
