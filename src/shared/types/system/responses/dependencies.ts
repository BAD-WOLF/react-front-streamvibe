// NOTA (nov/2026): as dependências da API, conferidas na hora pelo painel do
// sistema (🔒 ROLE_DEV). As mensagens de erro chegam com os segredos trocados
// por "***".

// data.database.migrations of GET /{locale}/api/system/dependencies
export type MigrationStatus = {
    executed: number;
    /** As da pasta migrations/ que ainda não rodaram neste banco. */
    pending: number;
    /** A última que rodou; null = nenhuma. */
    current: string | null;
};

// data.database of GET /{locale}/api/system/dependencies
export type DatabaseStatus = {
    reachable: boolean;
    latency_ms: number | null;
    error: string | null;
    version: string | null;
    /** Só no PostgreSQL. */
    size_bytes: number | null;
    connections: number | null;
    migrations: MigrationStatus | null;
};

// data.tmdb of GET /{locale}/api/system/dependencies
export type ExternalServiceStatus = {
    /** O serviço respondeu (com qualquer status HTTP). */
    reachable: boolean;
    latency_ms: number | null;
    /** 200 = tudo certo; no TMDB, 401 = TMDB_TOKEN recusado. */
    status_code: number | null;
    error: string | null;
};

// data of GET /{locale}/api/system/dependencies
export type DependenciesStatus = {
    database: DatabaseStatus;
    tmdb: ExternalServiceStatus;
};
