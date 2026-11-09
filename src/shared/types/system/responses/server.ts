// NOTA (nov/2026): o painel do sistema (System, 🔒 ROLE_DEV). Bytes e
// segundos como números; null quando o servidor não informa (ou, nos
// limites, quando não há limite).

// data.host.memory of GET /{locale}/api/system/server
export type MemoryInfo = {
    total_bytes: number;
    /** O que ainda pode ser usado sem swap: o usado é total - available. */
    available_bytes: number;
    swap_total_bytes: number;
    swap_free_bytes: number;
};

// data.host of GET /{locale}/api/system/server
export type HostInfo = {
    hostname: string;
    /** O sistema do contêiner (o PRETTY_NAME do /etc/os-release). */
    os: string | null;
    kernel: string;
    architecture: string;
    cpus: number | null;
    uptime_seconds: number | null;
    /** A carga média de 1, 5 e 15 minutos. */
    load_average: [number, number, number] | null;
    memory: MemoryInfo | null;
};

// data.container of GET /{locale}/api/system/server
export type ContainerInfo = {
    cgroup_version: 1 | 2;
    /** null = sem limite. */
    memory_limit_bytes: number | null;
    memory_usage_bytes: number | null;
    /** Em CPUs (1.5 = uma CPU e meia); null = sem limite. */
    cpu_limit: number | null;
    /** null = sem limite. */
    processes_limit: number | null;
    processes: number | null;
};

// an item of data.disks of GET /{locale}/api/system/server
export type DiskInfo = {
    mount_point: string;
    /** O tipo da montagem: "overlay" é o disco do contêiner; uma pasta do Windows costuma ser "9p". */
    filesystem: string;
    total_bytes: number;
    free_bytes: number;
};

// data of GET /{locale}/api/system/server
export type ServerStatus = {
    host: HostInfo;
    /** null quando o cgroup não pode ser lido. */
    container: ContainerInfo | null;
    disks: DiskInfo[];
};
