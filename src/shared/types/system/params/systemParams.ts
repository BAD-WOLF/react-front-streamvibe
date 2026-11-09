import type {LogLevel} from '@shared/types/system/logLevel.ts';

// NOTA (nov/2026): a aba do painel do sistema e os filtros dos logs (query
// string da URL do front; os filtros vão também para a API).

export enum SystemTab {
    Server = 'server',
    Runtime = 'runtime',
    Dependencies = 'dependencies',
    Processes = 'processes',
    Logs = 'logs',
}

export const SYSTEM_TABS: readonly SystemTab[] = Object.values(SystemTab);

const TAB_NAMES: readonly string[] = SYSTEM_TABS;

export function isSystemTab(value: unknown): value is SystemTab {
    return typeof value === 'string' && TAB_NAMES.includes(value);
}

/** Quantas linhas de log o painel pede (a API aceita de 1 a 1000). */
export const LOG_LIMITS: readonly number[] = [100, 200, 500, 1000];

export const DEFAULT_LOG_LIMIT: number = 200;

// query of GET /{locale}/api/system/logs/{file} (o arquivo vai no caminho)
export type LogQuery = {
    level?: LogLevel | undefined;
    /** Só as linhas cuja mensagem contém este texto (sem diferenciar maiúsculas). */
    search?: string | undefined;
    limit?: number | undefined;
};

// the query of /{locale}/system in the front
export type SystemQuery = LogQuery & {
    tab?: SystemTab | undefined;
    /** O arquivo de log; sem ele, o alterado por último. */
    file?: string | undefined;
};
