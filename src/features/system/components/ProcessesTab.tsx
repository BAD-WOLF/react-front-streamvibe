import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {systemClasses} from '@shared/styles/ts/system/SystemStyles.ts';
import type {ProcessInfo, ProcessList} from '@shared/types/system/index.ts';
import {formatBytes, formatDateTime} from '@shared/utils/format.ts';
import {Missing, PanelPending, ReadAt, StatusFlag} from '@system/components/PanelParts.tsx';
import {type PanelData, type PanelTabProps, usePanelData} from '@system/hooks/usePanelData.ts';
import {listProcesses} from '@system/services/system.service.ts';
import {formatSeconds} from '@system/utils/systemFormat.ts';
import {processStateLabel, processStateTone} from '@system/utils/systemLabels.ts';
import {type ChangeEvent, type Dispatch, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';

const REFRESH_MS: number = 5_000;

type ProcessOrder = 'pid' | 'memory' | 'cpu';

const ORDERS: readonly ProcessOrder[] = ['pid', 'memory', 'cpu'];

function isProcessOrder(value: string): value is ProcessOrder {
    return (ORDERS as readonly string[]).includes(value);
}

function sortProcesses(processes: ProcessInfo[], order: ProcessOrder): ProcessInfo[] {
    const sorted: ProcessInfo[] = [...processes];
    switch (order) {
        case 'pid':
            return sorted;
        case 'memory':
            return sorted.sort((a: ProcessInfo, b: ProcessInfo): number => b.memory_bytes - a.memory_bytes);
        case 'cpu':
            return sorted.sort((a: ProcessInfo, b: ProcessInfo): number => b.cpu_seconds - a.cpu_seconds);
    }
}

/**
 * A aba Processos (GET /system/processes): os processos do contêiner, em
 * ordem de PID ou dos que mais usam memória ou CPU. Lida de novo a cada 5 s
 * com a atualização automática.
 *
 * NOTA (nov/2026): criado com o painel do sistema (ROLE_DEV).
 */
export function ProcessesTab(props: PanelTabProps): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const [order, setOrder]: [ProcessOrder, Dispatch<SetStateAction<ProcessOrder>>] = useState<ProcessOrder>('pid');
    const processes: PanelData<ProcessList> = usePanelData<ProcessList>(
        async (signal: AbortSignal): Promise<ProcessList> => (await listProcesses(locale, signal)).data,
        locale,
        REFRESH_MS,
        props,
    );

    if (processes.data === null) return <PanelPending data={processes}/>;

    const list: ProcessInfo[] = sortProcesses(processes.data.processes, order);

    return (
        <section className={systemClasses.card}>
            <div className={systemClasses.summary}>
                <div>
                    <h2 className={systemClasses.cardTitle}>{t('{{count}} processes', {count: list.length})}</h2>
                    <ReadAt data={processes}/>
                </div>
                <label className={systemClasses.field}>
                    <span className={systemClasses.label}>{t('Sort by')}</span>
                    <select
                        className={systemClasses.input}
                        value={order}
                        onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
                            if (isProcessOrder(event.target.value)) setOrder(event.target.value);
                        }}
                    >
                        <option value="pid">{t('PID order')}</option>
                        <option value="memory">{t('Most memory')}</option>
                        <option value="cpu">{t('Most CPU time')}</option>
                    </select>
                </label>
            </div>
            <ProcessTable processes={list} locale={locale}/>
            <p className={systemClasses.cardText}>{t('In Docker the container has its own PIDs: PID 1 is its main process, and the processes of the machine do not show up.')}</p>
        </section>
    );
}

function ProcessTable({processes, locale}: { processes: ProcessInfo[]; locale: Locale }): ReactElement {
    const {t}: Translation = useTranslation();

    return (
        <div className={systemClasses.tableWrapper}>
            <table className={`${systemClasses.table} min-w-[960px]`}>
                <thead className={systemClasses.tableHead}>
                    <tr>
                        <th className={systemClasses.tableHeadCell}>PID</th>
                        <th className={systemClasses.tableHeadCell}>{t('Parent')}</th>
                        <th className={systemClasses.tableHeadCell}>{t('User')}</th>
                        <th className={systemClasses.tableHeadCell}>{t('State')}</th>
                        <th className={`${systemClasses.tableHeadCell} text-right`}>{t('CPU time')}</th>
                        <th className={`${systemClasses.tableHeadCell} text-right`}>{t('Resident memory')}</th>
                        <th className={`${systemClasses.tableHeadCell} text-right`}>Threads</th>
                        <th className={systemClasses.tableHeadCell}>{t('Started')}</th>
                        <th className={systemClasses.tableHeadCell}>{t('Command')}</th>
                    </tr>
                </thead>
                <tbody>
                    {processes.map((process: ProcessInfo): ReactElement => (
                        <tr key={process.pid}>
                            <td className={systemClasses.numberCell}>{process.pid}</td>
                            <td className={systemClasses.numberCell}>{process.parent_pid}</td>
                            <td className={`${systemClasses.tableCell} whitespace-nowrap`}>{process.user}</td>
                            <td className={systemClasses.tableCell}>
                                <StatusFlag tone={processStateTone(process.state)}>{processStateLabel(t, process.state)}</StatusFlag>
                            </td>
                            <td className={systemClasses.numberCell}>{formatSeconds(process.cpu_seconds, locale)}</td>
                            <td className={systemClasses.numberCell}>{formatBytes(process.memory_bytes, locale)}</td>
                            <td className={systemClasses.numberCell}>{process.threads}</td>
                            <td className={`${systemClasses.tableCell} whitespace-nowrap`}>{formatDateTime(process.started_at, locale) ?? <Missing/>}</td>
                            <td className={`${systemClasses.tableCell} ${systemClasses.code}`}>{process.command}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
