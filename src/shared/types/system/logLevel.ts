// NOTA (nov/2026): os níveis de log do PSR-3, do menos ao mais grave — espelho
// do App\Application\System\Shared\LogLevel da API (os mesmos valores, na
// mesma ordem). O painel filtra as linhas por um nível mínimo.
export enum LogLevel {
    Debug = 'debug',
    Info = 'info',
    Notice = 'notice',
    Warning = 'warning',
    Error = 'error',
    Critical = 'critical',
    Alert = 'alert',
    Emergency = 'emergency',
}

/** Do menos ao mais grave: a posição é a gravidade. */
export const LOG_LEVELS: readonly LogLevel[] = Object.values(LogLevel);

const LEVEL_NAMES: readonly string[] = LOG_LEVELS;

export function isLogLevel(value: unknown): value is LogLevel {
    return typeof value === 'string' && LEVEL_NAMES.includes(value);
}
