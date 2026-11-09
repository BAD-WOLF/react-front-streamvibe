import type {Locale} from '@i18n/locales.ts';
import {apiRequest} from '@shared/api/httpClient.ts';
import type {ApiResult} from '@shared/types/api/envelope.ts';
import type {
    DependenciesStatus, LogFileContent, LogFileList, LogQuery, ProcessList, RuntimeStatus, ServerStatus
} from '@shared/types/system/index.ts';

// NOTA (nov/2026): o painel do sistema da API (/{locale}/api/system, 🔒
// ROLE_DEV e acima). Tudo é lido na hora em que a API recebe o pedido; nada
// é guardado. Os textos que vêm de fora (linhas de comando, logs, erros)
// chegam com os segredos trocados por "***".

const system: string = '/system';

/** The machine, the container (cgroup) and the disks. */
export async function getServerStatus(locale: Locale, signal?: AbortSignal): Promise<ApiResult<ServerStatus>> {
    return apiRequest<ServerStatus>(locale, `${system}/server`, {auth: true, signal});
}

/** PHP, OPcache and Symfony. */
export async function getRuntimeStatus(locale: Locale, signal?: AbortSignal): Promise<ApiResult<RuntimeStatus>> {
    return apiRequest<RuntimeStatus>(locale, `${system}/runtime`, {auth: true, signal});
}

/** The database and TMDB, checked now (always 200: a dependency that is down comes with reachable false). */
export async function getDependenciesStatus(locale: Locale, signal?: AbortSignal): Promise<ApiResult<DependenciesStatus>> {
    return apiRequest<DependenciesStatus>(locale, `${system}/dependencies`, {auth: true, signal});
}

/** The processes of the container, by PID. */
export async function listProcesses(locale: Locale, signal?: AbortSignal): Promise<ApiResult<ProcessList>> {
    return apiRequest<ProcessList>(locale, `${system}/processes`, {auth: true, signal});
}

/** The log files of the API, most recently modified first. */
export async function listLogFiles(locale: Locale, signal?: AbortSignal): Promise<ApiResult<LogFileList>> {
    return apiRequest<LogFileList>(locale, `${system}/logs`, {auth: true, signal});
}

/** The last lines of a log file that pass the filters, newest first (404 when the file is gone). */
export async function readLogFile(locale: Locale, file: string, query: LogQuery, signal?: AbortSignal): Promise<ApiResult<LogFileContent>> {
    return apiRequest<LogFileContent>(locale, `${system}/logs/${encodeURIComponent(file)}`, {
        auth: true,
        query: {level: query.level, search: query.search, limit: query.limit},
        signal,
    });
}
