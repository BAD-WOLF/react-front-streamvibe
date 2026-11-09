import type {LogLevel} from '@shared/types/system/logLevel.ts';

// NOTA (nov/2026): os logs da API no painel do sistema (🔒 ROLE_DEV).

// an item of data.files of GET /{locale}/api/system/logs (and data.file of GET .../logs/{file})
export type LogFileSummary = {
    name: string;
    size_bytes: number;
    modified_at: string;
};

// data of GET /{locale}/api/system/logs
export type LogFileList = {
    /** A pasta dos logs no servidor. */
    directory: string;
    /** Do alterado por último ao mais antigo. */
    files: LogFileSummary[];
};

// an item of data.entries of GET /{locale}/api/system/logs/{file}
export type LogEntry = {
    /** ISO 8601 com milissegundos; null numa linha fora do formato do Monolog. */
    datetime: string | null;
    channel: string | null;
    level: LogLevel | null;
    /** O texto (com o contexto JSON no fim), segredos como "***", até 4.000 caracteres. */
    message: string;
};

// data of GET /{locale}/api/system/logs/{file}
export type LogFileContent = {
    file: LogFileSummary;
    /** Da linha mais nova para a mais antiga. */
    entries: LogEntry[];
    scanned_lines: number;
    /** O arquivo foi lido até a primeira linha (false = há linhas mais antigas que não foram lidas). */
    complete: boolean;
};
