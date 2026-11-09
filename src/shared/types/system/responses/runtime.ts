// NOTA (nov/2026): o runtime da API no painel do sistema (🔒 ROLE_DEV).

// data.php of GET /{locale}/api/system/runtime
export type PhpInfo = {
    version: string;
    sapi: string;
    /** O php.ini carregado; null = sem php.ini (só os valores padrão). */
    ini_file: string | null;
    /** Os limites do php.ini em bytes e segundos; null = sem limite. */
    memory_limit_bytes: number | null;
    max_execution_time_seconds: number | null;
    upload_max_filesize_bytes: number | null;
    post_max_size_bytes: number | null;
    timezone: string;
    extensions: string[];
};

// data.opcache of GET /{locale}/api/system/runtime
export type OpcacheInfo = {
    enabled: boolean;
    jit: boolean;
    /** Os números vêm null com o OPcache desligado. */
    memory_used_bytes: number | null;
    memory_free_bytes: number | null;
    memory_wasted_bytes: number | null;
    cached_scripts: number | null;
    hits: number | null;
    misses: number | null;
};

// data.symfony of GET /{locale}/api/system/runtime
export type SymfonyInfo = {
    version: string;
    environment: string;
    debug: boolean;
    /** Ano-mês ("2028-11"): até quando a versão recebe correções de bugs. */
    end_of_maintenance: string;
    /** Ano-mês: até quando recebe correções de segurança. */
    end_of_life: string;
    bundles: string[];
};

// data of GET /{locale}/api/system/runtime
export type RuntimeStatus = {
    php: PhpInfo;
    /** null = a extensão não está instalada. */
    opcache: OpcacheInfo | null;
    symfony: SymfonyInfo;
};
