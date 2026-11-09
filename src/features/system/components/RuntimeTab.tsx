import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {systemClasses} from '@shared/styles/ts/system/SystemStyles.ts';
import type {OpcacheInfo, PhpInfo, RuntimeStatus, SymfonyInfo} from '@shared/types/system/index.ts';
import {formatBytes} from '@shared/utils/format.ts';
import {Meter} from '@system/components/Meter.tsx';
import {Chips, Fact, Missing, PanelPending, ReadAt, StatusFlag} from '@system/components/PanelParts.tsx';
import {type PanelData, type PanelTabProps, usePanelData} from '@system/hooks/usePanelData.ts';
import {getRuntimeStatus} from '@system/services/system.service.ts';
import {formatNumber, formatPercent, formatSeconds, formatYearMonth, hasYearMonthPassed} from '@system/utils/systemFormat.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';

/**
 * A aba Runtime (GET /system/runtime): o PHP (versão, limites do php.ini,
 * extensões), o OPcache e o Symfony (versão, suporte, ambiente, bundles).
 * Muda só com um deploy: sem atualização automática.
 *
 * NOTA (nov/2026): criado com o painel do sistema (ROLE_DEV).
 */
export function RuntimeTab(props: PanelTabProps): ReactElement {
    const locale: Locale = useLocale();
    const runtime: PanelData<RuntimeStatus> = usePanelData<RuntimeStatus>(
        async (signal: AbortSignal): Promise<RuntimeStatus> => (await getRuntimeStatus(locale, signal)).data,
        locale,
        null,
        props,
    );

    if (runtime.data === null) return <PanelPending data={runtime}/>;

    return (
        <div className="space-y-6">
            <ReadAt data={runtime}/>
            <div className={systemClasses.grid}>
                <PhpCard php={runtime.data.php}/>
                <OpcacheCard opcache={runtime.data.opcache}/>
                <SymfonyCard symfony={runtime.data.symfony}/>
            </div>
        </div>
    );
}

function PhpCard({php}: { php: PhpInfo }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const bytesOrNoLimit: (value: number | null) => string = (value: number | null): string =>
        value === null ? t('No limit') : formatBytes(value, locale) ?? '';

    return (
        <section className={systemClasses.card}>
            <h2 className={systemClasses.cardTitle}>PHP</h2>
            <div className={systemClasses.facts}>
                <Fact label={t('Version')}>{php.version}</Fact>
                <Fact label="SAPI">{php.sapi}</Fact>
                <Fact label="php.ini" code>{php.ini_file !== null ? <span className={systemClasses.code}>{php.ini_file}</span> : t('None (default values)')}</Fact>
                <Fact label={t('Time zone')}>{php.timezone}</Fact>
                <Fact label="memory_limit" code>{bytesOrNoLimit(php.memory_limit_bytes)}</Fact>
                <Fact label="max_execution_time" code>
                    {php.max_execution_time_seconds !== null ? formatSeconds(php.max_execution_time_seconds, locale) : t('No limit')}
                </Fact>
                <Fact label="upload_max_filesize" code>{php.upload_max_filesize_bytes !== null ? formatBytes(php.upload_max_filesize_bytes, locale) : <Missing/>}</Fact>
                <Fact label="post_max_size" code>{bytesOrNoLimit(php.post_max_size_bytes)}</Fact>
            </div>
            <h3 className={systemClasses.label}>{t('Extensions ({{total}})', {total: php.extensions.length})}</h3>
            <Chips items={php.extensions}/>
        </section>
    );
}

function OpcacheCard({opcache}: { opcache: OpcacheInfo | null }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();

    return (
        <section className={systemClasses.card}>
            <div className={systemClasses.cardHeader}>
                <h2 className={systemClasses.cardTitle}>OPcache</h2>
                <span className={systemClasses.flags}>
                    {opcache === null && <StatusFlag tone="warning">{t('Not installed')}</StatusFlag>}
                    {opcache !== null && <StatusFlag tone={opcache.enabled ? 'ok' : 'warning'}>{opcache.enabled ? t('Enabled') : t('Disabled')}</StatusFlag>}
                    {opcache !== null && opcache.enabled && <StatusFlag tone={null}>JIT: {opcache.jit ? t('Enabled') : t('Disabled')}</StatusFlag>}
                </span>
            </div>
            {opcache === null && (
                <p className={systemClasses.cardText}>
                    {t('The OPcache extension is not in the PHP of this container (the development image, docker/Dockerfile.minimal, does not install it).')}
                </p>
            )}
            {opcache !== null && !opcache.enabled && (
                <p className={systemClasses.cardText}>{t('OPcache is installed but off (opcache.enable, or opcache.enable_cli in a server that runs on the CLI).')}</p>
            )}
            {opcache !== null && opcache.enabled && <OpcacheNumbers opcache={opcache} locale={locale}/>}
        </section>
    );
}

function OpcacheNumbers({opcache, locale}: { opcache: OpcacheInfo; locale: Locale }): ReactElement {
    const {t}: Translation = useTranslation();
    const used: number = opcache.memory_used_bytes ?? 0;
    const total: number = used + (opcache.memory_free_bytes ?? 0) + (opcache.memory_wasted_bytes ?? 0);
    const hits: number = opcache.hits ?? 0;
    const lookups: number = hits + (opcache.misses ?? 0);

    return (
        <div className="space-y-4">
            <Meter label={t('Memory of the cache')} used={used} total={total} format={(value: number): string => formatBytes(value, locale) ?? ''}/>
            <div className={systemClasses.facts}>
                <Fact label={t('Hit rate')}>{lookups > 0 ? formatPercent(hits / lookups, locale) : <Missing/>}</Fact>
                <Fact label={t('Cached scripts')}>{opcache.cached_scripts !== null ? formatNumber(opcache.cached_scripts, locale, 0) : <Missing/>}</Fact>
                <Fact label={t('Wasted memory')}>{opcache.memory_wasted_bytes !== null ? formatBytes(opcache.memory_wasted_bytes, locale) : <Missing/>}</Fact>
            </div>
        </div>
    );
}

function SymfonyCard({symfony}: { symfony: SymfonyInfo }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const until: (yearMonth: string) => ReactElement = (yearMonth: string): ReactElement => (
        <span className={systemClasses.flags}>
            {formatYearMonth(yearMonth, locale)}
            {hasYearMonthPassed(yearMonth) && <StatusFlag tone="danger">{t('No longer supported')}</StatusFlag>}
        </span>
    );

    return (
        <section className={`${systemClasses.card} lg:col-span-2`}>
            <h2 className={systemClasses.cardTitle}>Symfony</h2>
            <div className={`${systemClasses.facts} lg:grid-cols-3`}>
                <Fact label={t('Version')}>{symfony.version}</Fact>
                <Fact label={t('Environment')}>{symfony.environment}</Fact>
                <Fact label="Debug">
                    <StatusFlag tone={symfony.debug ? 'warning' : 'ok'}>{symfony.debug ? t('Enabled') : t('Disabled')}</StatusFlag>
                </Fact>
                <Fact label={t('Bug fixes until')}>{until(symfony.end_of_maintenance)}</Fact>
                <Fact label={t('Security fixes until')}>{until(symfony.end_of_life)}</Fact>
            </div>
            <h3 className={systemClasses.label}>{t('Bundles ({{total}})', {total: symfony.bundles.length})}</h3>
            <Chips items={symfony.bundles}/>
        </section>
    );
}
