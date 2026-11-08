// NOTA (nov/2026): o que as abas do StreamVibe contam umas às outras sobre a
// sessão, já que o access token de cada uma fica só na memória dela.
// - Os avisos (BroadcastChannel, só entre abas da mesma origem): "logout",
//   uma aba saiu e as outras esquecem o access token; "login", uma aba
//   entrou e as outras pedem um access token com o cookie novo.
// - A marca "este navegador tem sessão" (localStorage, sem nenhum token):
//   sem ela, quem nunca entrou não faz a renovação ao abrir a página, que só
//   responderia 401.

export enum SessionSignal {
    Login = 'login',
    Logout = 'logout',
}

const CHANNEL_NAME: string = 'streamvibe-session';

const HINT_KEY: string = 'streamvibe.session';

// As chaves da versão anterior, que guardava os tokens no localStorage.
const LEGACY_KEYS: readonly string[] = ['token', 'refresh_token', 'known_user_ids'];

const SIGNALS: readonly string[] = Object.values(SessionSignal);

let channel: BroadcastChannel | null = null;

function isSessionSignal(value: unknown): value is SessionSignal {
    return typeof value === 'string' && SIGNALS.includes(value);
}

/** O canal entre as abas; null num navegador sem BroadcastChannel. */
function sessionChannel(): BroadcastChannel | null {
    if (channel === null && 'BroadcastChannel' in window) channel = new BroadcastChannel(CHANNEL_NAME);
    return channel;
}

/** Conta às outras abas (não a esta) que a sessão mudou. */
export function announce(signal: SessionSignal): void {
    sessionChannel()?.postMessage(signal);
}

/** Recebe os avisos das outras abas. */
export function onSessionSignal(listener: (signal: SessionSignal) => void): () => void {
    const current: BroadcastChannel | null = sessionChannel();
    if (current === null) return (): void => undefined;

    const handler: (event: MessageEvent<unknown>) => void = (event: MessageEvent<unknown>): void => {
        if (isSessionSignal(event.data)) listener(event.data);
    };
    current.addEventListener('message', handler);
    return (): void => {
        current.removeEventListener('message', handler);
    };
}

/** false quando este navegador certamente não tem sessão; sem storage, true (vale tentar). */
export function hasSessionHint(): boolean {
    try {
        return localStorage.getItem(HINT_KEY) === '1';
    } catch {
        return true;
    }
}

export function rememberSession(active: boolean): void {
    try {
        if (active) localStorage.setItem(HINT_KEY, '1');
        else localStorage.removeItem(HINT_KEY);
    } catch {
        // storage indisponível: hasSessionHint() responde true, e a página sempre tenta renovar
    }
}

/** Apaga o que a versão anterior deixou no localStorage: os tokens e os ids. */
export function forgetLegacyStorage(): void {
    try {
        LEGACY_KEYS.forEach((key: string): void => localStorage.removeItem(key));
    } catch {
        // storage indisponível: não há o que apagar
    }
}
