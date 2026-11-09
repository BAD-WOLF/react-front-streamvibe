// NOTA (nov/2026): os processos do contêiner no painel do sistema (🔒 ROLE_DEV).

/** O estado do processo (a letra do /proc/<pid>/stat, por extenso). */
export type ProcessState = 'running' | 'sleeping' | 'waiting' | 'stopped' | 'zombie' | 'idle' | 'dead' | 'unknown';

// an item of data.processes of GET /{locale}/api/system/processes
export type ProcessInfo = {
    pid: number;
    parent_pid: number;
    name: string;
    /** A linha de comando com os segredos trocados por "***"; sem ela (zumbi), o nome entre colchetes. */
    command: string;
    state: ProcessState;
    /** O nome do usuário ou, sem ele, o uid. */
    user: string;
    /** A memória residente (RSS). */
    memory_bytes: number;
    /** O tempo de CPU desde que o processo começou. */
    cpu_seconds: number;
    threads: number;
    started_at: string | null;
};

// data of GET /{locale}/api/system/processes
export type ProcessList = {
    /** Em ordem de PID. */
    processes: ProcessInfo[];
};
