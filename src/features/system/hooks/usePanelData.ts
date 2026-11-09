import {type AsyncState, type AsyncTask, useAsync} from '@shared/hooks/useAsync.ts';
import {type Dispatch, type RefObject, type SetStateAction, useEffect, useRef, useState} from 'react';

/** O que o painel passa para cada aba. */
export type PanelTabProps = {
    /** A atualização automática está ligada. */
    auto: boolean;
    /** Muda a cada "Atualizar agora". */
    tick: number;
};

export type PanelData<T> = AsyncState<T> & {
    /** Quando chegou a última resposta. */
    readAt: Date | null;
};

/**
 * Os dados de uma aba do painel do sistema: o useAsync de sempre, lido de
 * novo a cada `intervalMs` (com a atualização automática ligada e a aba do
 * navegador visível; null = só à mão) e a cada "Atualizar agora". Ao ler de
 * novo, os dados anteriores ficam na tela até a resposta chegar.
 *
 * NOTA (nov/2026): criado com o painel do sistema (ROLE_DEV).
 */
export function usePanelData<T>(task: AsyncTask<T>, key: string, intervalMs: number | null, {auto, tick}: PanelTabProps): PanelData<T> {
    const result: AsyncState<T> = useAsync<T>(task, key);
    const reload: () => void = result.reload;
    const [readAt, setReadAt]: [Date | null, Dispatch<SetStateAction<Date | null>>] = useState<Date | null>(null);
    const mountedTick: RefObject<number> = useRef<number>(tick);

    useEffect((): void => {
        if (result.data !== null) setReadAt(new Date());
    }, [result.data]);

    useEffect((): void => {
        if (tick !== mountedTick.current) reload();
    }, [tick, reload]);

    useEffect((): (() => void) | undefined => {
        if (!auto || intervalMs === null) return undefined;

        const timer: number = window.setInterval((): void => {
            if (document.visibilityState === 'visible') reload();
        }, intervalMs);

        return (): void => window.clearInterval(timer);
    }, [auto, intervalMs, reload]);

    return {...result, readAt};
}
