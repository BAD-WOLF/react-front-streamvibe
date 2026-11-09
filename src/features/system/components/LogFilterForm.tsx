import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {systemClasses} from '@shared/styles/ts/system/SystemStyles.ts';
import {isLogLevel, LOG_LEVELS, LOG_LIMITS, type LogFileSummary, type LogLevel, type SystemQuery} from '@shared/types/system/index.ts';
import {formatBytes} from '@shared/utils/format.ts';
import {formatTime} from '@system/utils/systemFormat.ts';
import type {ResolvedSystemQuery} from '@system/utils/systemQuery.ts';
import {type ChangeEvent, type Dispatch, type FormEvent, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';

const ALL: string = 'all';

/**
 * Os filtros dos logs: o arquivo, o nível mínimo e o número de linhas (na
 * hora) e a busca (ao enviar). Quem usa remonta o componente quando a URL
 * muda (key).
 *
 * NOTA (nov/2026): criado com o painel do sistema (ROLE_DEV).
 */
export function LogFilterForm({files, file, query, onChange}: {
    files: LogFileSummary[];
    /** O arquivo mostrado (o da URL ou, sem ele, o alterado por último). */
    file: string;
    query: ResolvedSystemQuery;
    onChange: (query: SystemQuery) => void;
}): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const [search, setSearch]: [string, Dispatch<SetStateAction<string>>] = useState<string>(query.search ?? '');

    const submit: (event: FormEvent<HTMLFormElement>) => void = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const text: string = search.trim();
        onChange({...query, file, search: text !== '' ? text : undefined});
    };
    const changeLevel: (event: ChangeEvent<HTMLSelectElement>) => void = (event: ChangeEvent<HTMLSelectElement>): void => {
        const value: string = event.target.value;
        onChange({...query, file, level: isLogLevel(value) ? value : undefined});
    };

    return (
        <form className={systemClasses.filters} onSubmit={submit}>
            <label className={systemClasses.field}>
                <span className={systemClasses.label}>{t('Log file')}</span>
                <select
                    className={systemClasses.input}
                    value={file}
                    onChange={(event: ChangeEvent<HTMLSelectElement>): void => onChange({...query, file: event.target.value})}
                >
                    {files.map((item: LogFileSummary): ReactElement => (
                        <option key={item.name} value={item.name}>
                            {item.name} · {formatBytes(item.size_bytes, locale)} · {formatTime(item.modified_at, locale)}
                        </option>
                    ))}
                </select>
            </label>
            <label className={systemClasses.field}>
                <span className={systemClasses.label}>{t('Minimum level')}</span>
                <select className={systemClasses.input} value={query.level ?? ALL} onChange={changeLevel}>
                    <option value={ALL}>{t('All levels')}</option>
                    {LOG_LEVELS.map((level: LogLevel): ReactElement => <option key={level} value={level}>{level.toUpperCase()}</option>)}
                </select>
            </label>
            <label className={systemClasses.field}>
                <span className={systemClasses.label}>{t('Search in the message')}</span>
                <input
                    className={systemClasses.input}
                    type="search"
                    maxLength={200}
                    value={search}
                    onChange={(event: ChangeEvent<HTMLInputElement>): void => setSearch(event.target.value)}
                />
            </label>
            <label className={systemClasses.field}>
                <span className={systemClasses.label}>{t('How many lines')}</span>
                <select
                    className={systemClasses.input}
                    value={query.limit}
                    onChange={(event: ChangeEvent<HTMLSelectElement>): void => onChange({...query, file, limit: Number(event.target.value)})}
                >
                    {LOG_LIMITS.map((limit: number): ReactElement => <option key={limit} value={limit}>{limit}</option>)}
                </select>
            </label>
            <button type="submit" className={systemClasses.button}>{t('Apply')}</button>
        </form>
    );
}
