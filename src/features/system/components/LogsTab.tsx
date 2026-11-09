import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {EmptyState} from '@shared/components/feedback/EmptyState.tsx';
import {Notice} from '@shared/components/feedback/Notice.tsx';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {systemClasses} from '@shared/styles/ts/system/SystemStyles.ts';
import type {LogEntry, LogFileContent, LogFileList, LogFileSummary, SystemQuery} from '@shared/types/system/index.ts';
import {LogFilterForm} from '@system/components/LogFilterForm.tsx';
import {Missing, PanelPending, ReadAt, StatusFlag} from '@system/components/PanelParts.tsx';
import {type PanelData, type PanelTabProps, usePanelData} from '@system/hooks/usePanelData.ts';
import {listLogFiles, readLogFile} from '@system/services/system.service.ts';
import {formatDateTimeWithSeconds} from '@system/utils/systemFormat.ts';
import {logLevelTone} from '@system/utils/systemLabels.ts';
import type {ResolvedSystemQuery} from '@system/utils/systemQuery.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';

/**
 * A aba Logs (GET /system/logs e /system/logs/{file}): os arquivos de log
 * da API e as últimas linhas do escolhido, da mais nova para a mais antiga,
 * com o nível mínimo, a busca e o número de linhas na URL. Sem atualização
 * automática: as linhas não mudam de lugar enquanto alguém lê (o "Atualizar
 * agora" lê de novo).
 *
 * NOTA (nov/2026): criado com o painel do sistema (ROLE_DEV).
 */
export function LogsTab({query, onChange, ...props}: PanelTabProps & {
    query: ResolvedSystemQuery;
    onChange: (query: SystemQuery) => void;
}): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const files: PanelData<LogFileList> = usePanelData<LogFileList>(
        async (signal: AbortSignal): Promise<LogFileList> => (await listLogFiles(locale, signal)).data,
        locale,
        null,
        props,
    );

    if (files.data === null) return <PanelPending data={files}/>;

    const first: LogFileSummary | undefined = files.data.files[0];

    if (first === undefined) {
        return (
            <section className={systemClasses.card}>
                <EmptyState>{t('No log file in {{directory}}.', {directory: files.data.directory})}</EmptyState>
            </section>
        );
    }

    const file: string = query.file ?? first.name;

    return (
        <div className="space-y-6">
            <section className={systemClasses.card}>
                <LogFilterForm key={JSON.stringify(query)} files={files.data.files} file={file} query={query} onChange={onChange}/>
                <p className={systemClasses.cardText}>{t('Secrets come as ***, also in the search.')}</p>
            </section>
            <LogLines file={file} query={query} {...props}/>
        </div>
    );
}

function LogLines({file, query, ...props}: PanelTabProps & { file: string; query: ResolvedSystemQuery }): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const content: PanelData<LogFileContent> = usePanelData<LogFileContent>(
        async (signal: AbortSignal): Promise<LogFileContent> =>
            (await readLogFile(locale, file, {level: query.level, search: query.search, limit: query.limit}, signal)).data,
        `${locale}|${file}|${query.level ?? ''}|${query.search ?? ''}|${query.limit}`,
        null,
        props,
    );

    if (content.data === null) return <PanelPending data={content}/>;

    const {entries, scanned_lines: scanned, complete}: LogFileContent = content.data;

    return (
        <section className={systemClasses.card}>
            <div className={systemClasses.summary}>
                <p>{t('Lines shown: {{shown}}. Lines read: {{scanned}}.', {shown: entries.length, scanned})}</p>
                <ReadAt data={content}/>
            </div>
            {!complete && <Notice tone="info">{t('There are older lines that were not read: show more lines or narrow the filter.')}</Notice>}
            {entries.length === 0 ? <EmptyState>{t('No line matches these filters.')}</EmptyState> : <LogList entries={entries} locale={locale}/>}
        </section>
    );
}

/** As linhas, da mais nova para a mais antiga: o nível, a data e o canal em cima, a mensagem embaixo. */
function LogList({entries, locale}: { entries: LogEntry[]; locale: Locale }): ReactElement {
    const {t}: Translation = useTranslation();

    return (
        <ol className={systemClasses.logList} aria-label={t('Log lines')}>
            {/* linhas de log não têm id: a posição (a partir da mais nova) é a chave */}
            {entries.map((entry: LogEntry, index: number): ReactElement => (
                <li key={index} className={systemClasses.logEntry}>
                    <div className={systemClasses.logMeta}>
                        {entry.level !== null ? <StatusFlag tone={logLevelTone(entry.level)}>{entry.level.toUpperCase()}</StatusFlag> : <Missing/>}
                        {entry.datetime !== null && <time dateTime={entry.datetime}>{formatDateTimeWithSeconds(entry.datetime, locale)}</time>}
                        {entry.channel !== null && <span>{entry.channel}</span>}
                    </div>
                    <p className={systemClasses.code}>{entry.message}</p>
                </li>
            ))}
        </ol>
    );
}
