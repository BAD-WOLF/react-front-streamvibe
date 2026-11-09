import {DEFAULT_LOG_LIMIT, isLogLevel, isSystemTab, LOG_LIMITS, type LogLevel, type SystemQuery, SystemTab} from '@shared/types/system/index.ts';

// NOTA (nov/2026): a aba e os filtros dos logs ficam na URL (paths.system):
// o painel pode ser recarregado e compartilhado como está. Aqui eles são lidos
// de volta, valor a valor; um valor que a API recusaria vira o padrão.

/** O mesmo formato que a API aceita para o nome do arquivo. */
const LOG_FILE_NAME: RegExp = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

const MAX_SEARCH_LENGTH: number = 200;

/** A query da URL do painel, já conferida; o que falta (ou não vale) fica com o padrão. Serve de volta ao paths.system. */
export type ResolvedSystemQuery = SystemQuery & {
    tab: SystemTab;
    file: string | undefined;
    level: LogLevel | undefined;
    search: string | undefined;
    limit: number;
};

export function readSystemQuery(params: URLSearchParams): ResolvedSystemQuery {
    const tab: string | null = params.get('tab');
    const file: string = params.get('file') ?? '';
    const level: string | null = params.get('level');
    const search: string = (params.get('search') ?? '').trim();
    const limit: number = Number(params.get('limit'));

    return {
        tab: isSystemTab(tab) ? tab : SystemTab.Server,
        file: LOG_FILE_NAME.test(file) ? file : undefined,
        level: isLogLevel(level) ? level : undefined,
        search: search !== '' && search.length <= MAX_SEARCH_LENGTH ? search : undefined,
        limit: LOG_LIMITS.includes(limit) ? limit : DEFAULT_LOG_LIMIT,
    };
}
