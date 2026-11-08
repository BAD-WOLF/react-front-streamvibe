// NOTA (nov/2026): o access token (JWT) fica só na memória desta aba. Antes,
// ele e o refresh token iam para o localStorage, onde qualquer script da
// página (um XSS, uma dependência comprometida) conseguia lê-los. Agora o
// refresh token é um cookie HttpOnly da API, que o JavaScript não lê, e o
// access token, que vale 15 minutos, é pedido de novo quando a página abre e
// quando vence (session.service.ts). Substitui o tokenStorage.ts.

/** O que o JWT da API traz: username (o email), papéis, emissão e validade. */
export type JwtClaims = {
    username: string;
    roles: string[];
    iat: number;
    exp: number;
};

let accessToken: string | null = null;

const listeners: Set<() => void> = new Set<() => void>();

function notify(): void {
    listeners.forEach((listener: () => void): void => listener());
}

/** O access token desta aba, ou null sem sessão. */
export function readAccessToken(): string | null {
    return accessToken;
}

export function storeAccessToken(token: string): void {
    if (token === accessToken) return;
    accessToken = token;
    notify();
}

export function clearAccessToken(): void {
    if (accessToken === null) return;
    accessToken = null;
    notify();
}

/** Avisa quando o access token desta aba muda (login, renovação ou logout). */
export function onAccessTokenChange(listener: () => void): () => void {
    listeners.add(listener);
    return (): void => {
        listeners.delete(listener);
    };
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
