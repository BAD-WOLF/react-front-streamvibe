import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {Notice} from '@shared/components/feedback/Notice.tsx';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {systemClasses} from '@shared/styles/ts/system/SystemStyles.ts';
import type {DatabaseStatus, DependenciesStatus, ExternalServiceStatus} from '@shared/types/system/index.ts';
import {formatBytes} from '@shared/utils/format.ts';
import {Fact, Missing, PanelPending, ReadAt, StatusFlag} from '@system/components/PanelParts.tsx';
import {type PanelData, type PanelTabProps, usePanelData} from '@system/hooks/usePanelData.ts';
import {getDependenciesStatus} from '@system/services/system.service.ts';
import {formatMilliseconds, formatNumber} from '@system/utils/systemFormat.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';

/** Cada leitura vai ao TMDB: com a atualização automática, a cada 30 s. */
const REFRESH_MS: number = 30_000;

/**
 * A aba Dependências (GET /system/dependencies): o banco de dados (latência,
 * versão, tamanho, conexões, migrations) e o TMDB, conferidos na hora.
 *
 * NOTA (nov/2026): criado com o painel do sistema (ROLE_DEV).
 */
export function DependenciesTab(props: PanelTabProps): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const dependencies: PanelData<DependenciesStatus> = usePanelData<DependenciesStatus>(
        async (signal: AbortSignal): Promise<DependenciesStatus> => (await getDependenciesStatus(locale, signal)).data,
        locale,
        REFRESH_MS,
        props,
    );

    if (dependencies.data === null) return <PanelPending data={dependencies}/>;

    return (
        <div className="space-y-6">
            <ReadAt data={dependencies}/>
            <p className={systemClasses.cardText}>{t('Checked on the spot: SELECT 1 on the database and GET /3/authentication on TMDB (up to 5 s).')}</p>
            <div className={systemClasses.grid}>
                <DatabaseCard database={dependencies.data.database}/>
                <TmdbCard tmdb={dependencies.data.tmdb}/>
            </div>
        </div>
    );
}

function DatabaseCard({database}: { database: DatabaseStatus }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const migrations: DatabaseStatus['migrations'] = database.migrations;
    const current: string | null = migrations === null ? null : migrations.current;

    return (
        <section className={systemClasses.card}>
            <div className={systemClasses.cardHeader}>
                <h2 className={systemClasses.cardTitle}>{t('Database')}</h2>
                <StatusFlag tone={database.reachable ? 'ok' : 'danger'}>{database.reachable ? t('Answering') : t('Down')}</StatusFlag>
            </div>
            {database.error !== null && <Notice tone="error">{database.error}</Notice>}
            {database.reachable && (
                <div className={systemClasses.facts}>
                    <Fact label={t('Latency')}>{database.latency_ms !== null ? formatMilliseconds(database.latency_ms, locale) : <Missing/>}</Fact>
                    <Fact label={t('Version')}>{database.version ?? <Missing/>}</Fact>
                    <Fact label={t('Size')}>{database.size_bytes !== null ? formatBytes(database.size_bytes, locale) : <Missing/>}</Fact>
                    <Fact label={t('Open connections')}>{database.connections !== null ? formatNumber(database.connections, locale, 0) : <Missing/>}</Fact>
                    <Fact label={t('Migrations')}>
                        {migrations === null
                            ? <Missing/>
                            : (
                                <span className={systemClasses.flags}>
                                    <StatusFlag tone="ok">{t('Executed: {{executed}}', {executed: migrations.executed})}</StatusFlag>
                                    <StatusFlag tone={migrations.pending > 0 ? 'warning' : null}>{t('Pending: {{pending}}', {pending: migrations.pending})}</StatusFlag>
                                </span>
                            )}
                    </Fact>
                    <Fact label={t('Last migration')}>
                        {migrations === null
                            ? <Missing/>
                            : current !== null
                                ? <span className={systemClasses.code}>{current}</span>
                                : <span className={systemClasses.muted}>{t('None ran yet')}</span>}
                    </Fact>
                </div>
            )}
        </section>
    );
}

function TmdbCard({tmdb}: { tmdb: ExternalServiceStatus }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const ok: boolean = tmdb.reachable && tmdb.status_code !== null && tmdb.status_code >= 200 && tmdb.status_code < 300;

    return (
        <section className={systemClasses.card}>
            <div className={systemClasses.cardHeader}>
                <h2 className={systemClasses.cardTitle}>TMDB</h2>
                {ok && <StatusFlag tone="ok">{t('Answering')}</StatusFlag>}
                {!ok && tmdb.reachable && <StatusFlag tone="warning">{t('Answered HTTP {{status}}', {status: tmdb.status_code ?? '?'})}</StatusFlag>}
                {!tmdb.reachable && <StatusFlag tone="danger">{t('Down')}</StatusFlag>}
            </div>
            {tmdb.error !== null && <Notice tone={tmdb.reachable ? 'warning' : 'error'}>{tmdb.error}</Notice>}
            {tmdb.reachable && (
                <div className={systemClasses.facts}>
                    <Fact label={t('Latency')}>{tmdb.latency_ms !== null ? formatMilliseconds(tmdb.latency_ms, locale) : <Missing/>}</Fact>
                    <Fact label={t('HTTP status')}>{tmdb.status_code ?? <Missing/>}</Fact>
                </div>
            )}
        </section>
    );
}
