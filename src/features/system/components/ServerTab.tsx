import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {systemClasses} from '@shared/styles/ts/system/SystemStyles.ts';
import type {ContainerInfo, DiskInfo, HostInfo, MemoryInfo, ServerStatus} from '@shared/types/system/index.ts';
import {formatBytes} from '@shared/utils/format.ts';
import {Meter} from '@system/components/Meter.tsx';
import {Fact, Missing, PanelPending, ReadAt, StatusFlag} from '@system/components/PanelParts.tsx';
import {type PanelData, type PanelTabProps, usePanelData} from '@system/hooks/usePanelData.ts';
import {getServerStatus} from '@system/services/system.service.ts';
import {formatNumber, formatUptime, usageTone} from '@system/utils/systemFormat.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';

const REFRESH_MS: number = 5_000;

/**
 * A aba Servidor (GET /system/server): a máquina, a memória dela, o
 * contêiner (o cgroup) e os discos. Lida de novo a cada 5 s com a
 * atualização automática.
 *
 * NOTA (nov/2026): criado com o painel do sistema (ROLE_DEV).
 */
export function ServerTab(props: PanelTabProps): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const server: PanelData<ServerStatus> = usePanelData<ServerStatus>(
        async (signal: AbortSignal): Promise<ServerStatus> => (await getServerStatus(locale, signal)).data,
        locale,
        REFRESH_MS,
        props,
    );

    if (server.data === null) return <PanelPending data={server}/>;

    const {host, container, disks}: ServerStatus = server.data;

    return (
        <div className="space-y-6">
            <ReadAt data={server}/>
            <div className={systemClasses.grid}>
                <MachineCard host={host}/>
                <section className={systemClasses.card}>
                    <h2 className={systemClasses.cardTitle}>{t('Memory of the machine')}</h2>
                    {host.memory === null ? <p className={systemClasses.cardText}><Missing/></p> : <MemoryMeters memory={host.memory}/>}
                </section>
                <ContainerCard container={container}/>
                <section className={systemClasses.card}>
                    <h2 className={systemClasses.cardTitle}>{t('Disks')}</h2>
                    {disks.length === 0 ? <p className={systemClasses.cardText}>{t('No disk to show.')}</p> : <DiskList disks={disks}/>}
                    <p className={systemClasses.cardText}>{t('A Windows folder mounted by WSL usually shows up as 9p, and it is much slower.')}</p>
                </section>
            </div>
        </div>
    );
}

function MachineCard({host}: { host: HostInfo }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const load: [number, number, number] | null = host.load_average;

    return (
        <section className={systemClasses.card}>
            <h2 className={systemClasses.cardTitle}>{t('Machine')}</h2>
            <div className={systemClasses.facts}>
                <Fact label={t('Hostname')}>{host.hostname}</Fact>
                <Fact label={t('Operating system')}>{host.os ?? <Missing/>}</Fact>
                <Fact label={t('Kernel')}>{host.kernel}</Fact>
                <Fact label={t('Architecture')}>{host.architecture}</Fact>
                <Fact label={t('CPUs')}>{host.cpus ?? <Missing/>}</Fact>
                <Fact label={t('Uptime')}>{host.uptime_seconds !== null ? formatUptime(host.uptime_seconds) : <Missing/>}</Fact>
                <Fact label={t('Load average (1, 5 and 15 min)')}>
                    {load === null
                        ? <Missing/>
                        : (
                            <StatusFlag tone={host.cpus !== null ? usageTone(load[0] / host.cpus) : null}>
                                {load.map((value: number): string => formatNumber(value, locale)).join(' · ')}
                            </StatusFlag>
                        )}
                </Fact>
            </div>
        </section>
    );
}

function MemoryMeters({memory}: { memory: MemoryInfo }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const bytes: (value: number) => string = (value: number): string => formatBytes(value, locale) ?? '';

    return (
        <div className="space-y-4">
            <Meter label={t('In use')} used={memory.total_bytes - memory.available_bytes} total={memory.total_bytes} format={bytes}/>
            {memory.swap_total_bytes > 0
                ? <Meter label={t('Swap')} used={memory.swap_total_bytes - memory.swap_free_bytes} total={memory.swap_total_bytes} format={bytes}/>
                : <p className={systemClasses.cardText}>{t('No swap.')}</p>}
        </div>
    );
}

function ContainerCard({container}: { container: ContainerInfo | null }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const bytes: (value: number) => string = (value: number): string => formatBytes(value, locale) ?? '';
    const count: (value: number) => string = (value: number): string => formatNumber(value, locale, 0);

    return (
        <section className={systemClasses.card}>
            <div className={systemClasses.cardHeader}>
                <h2 className={systemClasses.cardTitle}>{t('Container')}</h2>
                {container !== null && <StatusFlag tone={null}>cgroup v{container.cgroup_version}</StatusFlag>}
            </div>
            {container === null
                ? <p className={systemClasses.cardText}>{t('No cgroup to read: the API is not in a container, or /sys/fs/cgroup is not mounted.')}</p>
                : (
                    <div className="space-y-4">
                        <Usage label={t('Memory of the container')} used={container.memory_usage_bytes} limit={container.memory_limit_bytes} format={bytes}/>
                        <Usage label={t('Process count')} used={container.processes} limit={container.processes_limit} format={count}/>
                        <Fact label={t('CPU limit')}>
                            {container.cpu_limit !== null ? t('{{value}} CPUs', {value: formatNumber(container.cpu_limit, locale)}) : t('No limit')}
                        </Fact>
                    </div>
                )}
        </section>
    );
}

/** Um uso do contêiner: o medidor contra o limite, ou só o uso quando não há limite. */
function Usage({label, used, limit, format}: { label: string; used: number | null; limit: number | null; format: (value: number) => string }): ReactElement {
    const {t}: Translation = useTranslation();

    if (used === null) return <Fact label={label}><Missing/></Fact>;
    if (limit === null) return <Fact label={label}>{t('{{used}} in use, no limit', {used: format(used)})}</Fact>;
    return <Meter label={label} used={used} total={limit} format={format}/>;
}

/** Cada disco: o ponto de montagem, o tipo e o medidor (uma lista, e não uma tabela, para caber no celular). */
function DiskList({disks}: { disks: DiskInfo[] }): ReactElement {
    const locale: Locale = useLocale();
    const bytes: (value: number) => string = (value: number): string => formatBytes(value, locale) ?? '';

    return (
        <ul className="space-y-4">
            {disks.map((disk: DiskInfo): ReactElement => (
                <li key={disk.mount_point} className="space-y-1.5">
                    <div className={systemClasses.cardHeader}>
                        <span className={systemClasses.code}>{disk.mount_point}</span>
                        <StatusFlag tone={null}>{disk.filesystem}</StatusFlag>
                    </div>
                    <Meter label={disk.mount_point} hideLabel used={disk.total_bytes - disk.free_bytes} total={disk.total_bytes} format={bytes}/>
                </li>
            ))}
        </ul>
    );
}
