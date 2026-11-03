import {hasText} from '@shared/utils/guards.ts';

// NOTA (nov/2026): o login devolve {token, refresh_token}. O JWT vale 1 hora
// e traz só username (o email), roles, iat e exp; o refresh token vale 30
// dias. As chaves do localStorage são as que o front já usava.
const TOKEN_KEY: string = 'token';
const REFRESH_TOKEN_KEY: string = 'refresh_token';
const USER_IDS_KEY: string = 'known_user_ids';

export type SessionTokens = {
    token: string;
    refreshToken: string;
};

export type JwtClaims = {
    username: string;
    roles: string[];
    iat: number;
    exp: number;
};

const listeners: Set<() => void> = new Set<() => void>();

function notify(): void {
    listeners.forEach((listener: () => void): void => listener());
}

/** Avisa quando os tokens mudam (login, refresh, logout ou outra aba). */
export function onTokensChange(listener: () => void): () => void {
    listeners.add(listener);
    return (): void => {
        listeners.delete(listener);
    };
}

window.addEventListener('storage', (event: StorageEvent): void => {
    if (event.key === null || event.key === TOKEN_KEY || event.key === REFRESH_TOKEN_KEY) notify();
});

export function readTokens(): SessionTokens | null {
    try {
        const token: string | null = localStorage.getItem(TOKEN_KEY);
        const refreshToken: string | null = localStorage.getItem(REFRESH_TOKEN_KEY);
        return hasText(token) && hasText(refreshToken) ? {token, refreshToken} : null;
    } catch {
        return null;
    }
}

export function saveTokens(tokens: SessionTokens): void {
    try {
        localStorage.setItem(TOKEN_KEY, tokens.token);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } finally {
        notify();
    }
}

export function clearTokens(): void {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    } finally {
        notify();
    }
}

export function decodeClaims(token: string): JwtClaims | null {
    try {
        const payload: string = token.split('.')[1] ?? '';
        const base64: string = payload.replace(/-/g, '+').replace(/_/g, '/');
        const padded: string = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
        const bytes: Uint8Array = Uint8Array.from(atob(padded), (char: string): number => char.charCodeAt(0));
        const claims: Partial<JwtClaims> = JSON.parse(new TextDecoder().decode(bytes)) as Partial<JwtClaims>;

        if (typeof claims.username !== 'string' || typeof claims.exp !== 'number') return null;

        return {
            username: claims.username,
            roles: Array.isArray(claims.roles) ? claims.roles : [],
            iat: claims.iat ?? 0,
            exp: claims.exp,
        };
    } catch {
        return null;
    }
}

/** true quando o JWT vence nos próximos `skewSeconds` segundos. */
export function isTokenExpired(claims: JwtClaims, skewSeconds: number = 30): boolean {
    return claims.exp * 1000 <= Date.now() + skewSeconds * 1000;
}

function readUserIds(): Record<string, number> {
    try {
        const raw: string | null = localStorage.getItem(USER_IDS_KEY);
        const parsed: unknown = hasText(raw) ? JSON.parse(raw) : {};
        return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, number> : {};
    } catch {
        return {};
    }
}

// NOTA (nov/2026): a API não informa o id de quem está logado (o JWT não traz
// o id). O front guarda o user_id que o cadastro devolve, por email, para
// usar nas rotas que pedem {userId} (status da verificação e pedidos de
// troca de senha). Ver a pendência no README.
export function rememberUserId(email: string, userId: number): void {
    try {
        localStorage.setItem(USER_IDS_KEY, JSON.stringify({...readUserIds(), [email.toLowerCase()]: userId}));
    } catch {
        // storage indisponível: o id só não fica guardado
    }
}

export function knownUserId(email: string): number | null {
    return readUserIds()[email.toLowerCase()] ?? null;
}
