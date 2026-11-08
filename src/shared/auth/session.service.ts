import type {Locale} from '@i18n/locales.ts';
import {absoluteUrl, localizedPath} from '@shared/api/apiConfig.ts';
import {clearAccessToken, readAccessToken, storeAccessToken} from '@shared/auth/accessToken.ts';
import {announce, hasSessionHint, rememberSession, SessionSignal} from '@shared/auth/crossTab.ts';
import type {RefreshTokenResponse} from '@shared/types/auth/index.ts';

// NOTA (nov/2026): a renovação e o logout da sessão, que agora vive num
// cookie HttpOnly da API (o refresh token). As duas chamadas vão com
// credentials: 'include', para o navegador mandar o cookie e aceitar o novo,
// e sem o header Authorization: o logout com um JWT vencido no header seria
// recusado (401) antes de acontecer.
//
// O refresh token é de uso único: cada renovação troca o cookie. Duas abas
// renovando ao mesmo tempo mandariam o mesmo cookie, e a segunda receberia
// 401 (o token dela já foi trocado pela primeira). A Web Locks API faz uma
// aba esperar a outra; a segunda já sai com o cookie novo.

const SESSION_LOCK: string = 'streamvibe-session';

let refreshing: Promise<string | null> | null = null;

// Muda a cada login e logout desta aba: uma renovação que começou antes não
// pode reabrir uma sessão encerrada no meio dela.
let generation: number = 0;

/**
 * Roda `task` com a trava da sessão (uma aba por vez); sem a Web Locks API,
 * roda direto. A trava fica presa até a promessa de `task` terminar. O
 * TypeScript tipa o retorno do request() como Promise<any>: o valor é o de
 * `task`, por isso o `as T`.
 */
async function withSessionLock<T>(task: () => Promise<T>): Promise<T> {
    if (!('locks' in navigator)) return task();
    const result: unknown = await navigator.locks.request(SESSION_LOCK, task);
    return result as T;
}

async function requestRefresh(locale: Locale): Promise<string | null> {
    const startedAt: number = generation;
    let response: Response;
    try {
        response = await fetch(absoluteUrl(localizedPath(locale, '/token/refresh')), {
            method: 'POST',
            credentials: 'include',
            headers: {Accept: 'application/json'},
        });
    } catch {
        return null; // sem rede: a sessão continua, e a chamada que pediu a renovação falha com erro de rede
    }

    if (startedAt !== generation) return null; // login ou logout durante a renovação: vale o que veio depois

    // 401: sem cookie, cookie vencido, já usado ou revogado (o logout e a troca
    // de senha revogam). Outro erro (API fora do ar) não encerra a sessão.
    if (response.status === 401) {
        clearAccessToken();
        rememberSession(false);
        return null;
    }
    if (!response.ok) return null;

    const body: RefreshTokenResponse = await response.json() as RefreshTokenResponse;
    storeAccessToken(body.token);
    rememberSession(true);
    return body.token;
}

/**
 * Pede outro access token ao refresh token do cookie. As chamadas que chegam
 * durante uma renovação esperam a mesma; null quando a sessão acabou (ou a
 * API não respondeu).
 */
export function refreshAccessToken(locale: Locale): Promise<string | null> {
    refreshing ??= withSessionLock((): Promise<string | null> => requestRefresh(locale)).finally((): void => {
        refreshing = null;
    });
    return refreshing;
}

/**
 * Ao abrir a página: recupera a sessão pelo cookie. true quando há sessão.
 * Sem a marca de sessão (crossTab.ts), nem chama a API.
 */
export async function restoreSession(locale: Locale): Promise<boolean> {
    if (readAccessToken() !== null) return true;
    if (!hasSessionHint()) return false;
    return await refreshAccessToken(locale) !== null;
}

/** Depois do login: o access token fica nesta aba, e as outras pedem o delas. */
export function startSession(accessToken: string): void {
    generation++;
    storeAccessToken(accessToken);
    rememberSession(true);
    announce(SessionSignal.Login);
}

/**
 * Logout: esta aba e as outras esquecem o access token na hora, e a API apaga
 * o refresh token e o cookie. Com a trava da sessão, um logout nunca cruza
 * com a renovação de outra aba (que deixaria um cookie novo para trás).
 */
export async function endSession(locale: Locale): Promise<void> {
    generation++;
    clearAccessToken();
    rememberSession(false);
    announce(SessionSignal.Logout);

    await withSessionLock(async (): Promise<void> => {
        try {
            // keepalive: o pedido continua mesmo se a aba fechar ou mudar de
            // página logo depois do clique em "sair".
            await fetch(absoluteUrl(localizedPath(locale, '/logout')), {
                method: 'POST',
                credentials: 'include',
                headers: {Accept: 'application/json'},
                keepalive: true,
            });
        } catch {
            // sem rede: o cookie só deixa de valer quando vencer, ou no próximo login (que o troca)
        }
    });
}

/** Outra aba saiu: esta esquece o access token (o cookie já foi apagado por ela). */
export function forgetSession(): void {
    generation++;
    clearAccessToken();
}
