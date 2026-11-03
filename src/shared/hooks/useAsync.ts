import {type Dispatch, type RefObject, type SetStateAction, useCallback, useEffect, useRef, useState} from 'react';

/** O trabalho assíncrono do useAsync; recebe o signal para poder ser cancelado. */
export type AsyncTask<T> = (signal: AbortSignal) => Promise<T>;

export type AsyncState<T> = {
    data: T | null;
    error: unknown;
    loading: boolean;
    reload: () => void;
};

type Snapshot<T> = Omit<AsyncState<T>, 'reload'>;

/**
 * Roda `task` sempre que `key` muda (e em reload()), cancelando a execução
 * anterior. `key` null não roda nada (ex.: falta um parâmetro).
 */
export function useAsync<T>(task: AsyncTask<T>, key: string | null): AsyncState<T> {
    const taskRef: RefObject<AsyncTask<T>> = useRef<AsyncTask<T>>(task);
    const lastKeyRef: RefObject<string | null> = useRef<string | null>(null);
    const [nonce, setNonce]: [number, Dispatch<SetStateAction<number>>] = useState<number>(0);
    const [snapshot, setSnapshot]: [Snapshot<T>, Dispatch<SetStateAction<Snapshot<T>>>] = useState<Snapshot<T>>({data: null, error: null, loading: key !== null});

    useEffect((): void => {
        taskRef.current = task;
    });

    useEffect((): (() => void) | undefined => {
        if (key === null) {
            lastKeyRef.current = null;
            setSnapshot({data: null, error: null, loading: false});
            return undefined;
        }

        const keyChanged: boolean = lastKeyRef.current !== key;
        lastKeyRef.current = key;
        setSnapshot((previous: Snapshot<T>): Snapshot<T> => ({data: keyChanged ? null : previous.data, error: null, loading: true}));

        const controller: AbortController = new AbortController();
        taskRef.current(controller.signal).then(
            (data: T): void => {
                if (!controller.signal.aborted) setSnapshot({data, error: null, loading: false});
            },
            (error: unknown): void => {
                if (!controller.signal.aborted) setSnapshot({data: null, error, loading: false});
            }
        );

        return (): void => controller.abort();
    }, [key, nonce]);

    const reload: () => void = useCallback((): void => setNonce((value: number): number => value + 1), []);

    return {...snapshot, reload};
}
