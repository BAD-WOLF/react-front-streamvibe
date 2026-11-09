import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {type TabItem, Tabs} from '@shared/components/Tabs.tsx';
import {useDocumentTitle} from '@shared/hooks/useDocumentTitle.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {paths} from '@shared/routing/paths.ts';
import {systemClasses} from '@shared/styles/ts/system/SystemStyles.ts';
import {SYSTEM_TABS, type SystemQuery, SystemTab} from '@shared/types/system/index.ts';
import {DependenciesTab} from '@system/components/DependenciesTab.tsx';
import {LogsTab} from '@system/components/LogsTab.tsx';
import {ProcessesTab} from '@system/components/ProcessesTab.tsx';
import {RuntimeTab} from '@system/components/RuntimeTab.tsx';
import {ServerTab} from '@system/components/ServerTab.tsx';
import type {PanelTabProps} from '@system/hooks/usePanelData.ts';
import {systemTabLabel} from '@system/utils/systemLabels.ts';
import {readSystemQuery, type ResolvedSystemQuery} from '@system/utils/systemQuery.ts';
import {RotateCw} from 'lucide-react';
import {type ChangeEvent, type Dispatch, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {type NavigateFunction, type SetURLSearchParams, useNavigate, useSearchParams} from 'react-router-dom';

/**
 * O painel do sistema (ROLE_DEV e acima): o servidor, o runtime, as
 * dependências, os processos e os logs da API, cada um numa aba, lidos na
 * hora. A aba e os filtros dos logs ficam na URL. Com a atualização
 * automática, Servidor e Processos são lidos de novo a cada 5 s e
 * Dependências a cada 30 s (cada leitura vai ao TMDB); Runtime e Logs só
 * com o "Atualizar agora".
 *
 * NOTA (nov/2026): criado com o painel do sistema (ROLE_DEV).
 */
export default function SystemPanel(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const navigate: NavigateFunction = useNavigate();
    const [searchParams]: [URLSearchParams, SetURLSearchParams] = useSearchParams();
    const query: ResolvedSystemQuery = readSystemQuery(searchParams);
    const [auto, setAuto]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(true);
    const [tick, setTick]: [number, Dispatch<SetStateAction<number>>] = useState<number>(0);
    useDocumentTitle(t('System'));

    const goTo: (next: SystemQuery) => void = (next: SystemQuery): void => {
        void navigate(paths.system(locale, next));
    };
    const tabs: TabItem<SystemTab>[] = SYSTEM_TABS.map((tab: SystemTab): TabItem<SystemTab> => ({id: tab, label: systemTabLabel(t, tab)}));
    const panel: PanelTabProps = {auto, tick};

    return (
        <div className={systemClasses.page}>
            <div className={systemClasses.header}>
                <div>
                    <h1 className={systemClasses.title}>{t('System')}</h1>
                    <p className={systemClasses.subtitle}>{t('The server, PHP, the dependencies, the processes and the logs of the API, read on the spot.')}</p>
                </div>
                <div className={systemClasses.controls}>
                    <label className={systemClasses.toggle} title={t('Every 5 s for the server and the processes, every 30 s for the dependencies.')}>
                        <input
                            type="checkbox"
                            className={systemClasses.checkbox}
                            checked={auto}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => setAuto(event.target.checked)}
                        />
                        {t('Automatic refresh')}
                    </label>
                    <button type="button" className={systemClasses.secondaryButton} onClick={(): void => setTick((value: number): number => value + 1)}>
                        <RotateCw className="w-4 h-4" aria-hidden="true"/> {t('Refresh now')}
                    </button>
                </div>
            </div>

            <Tabs tabs={tabs} active={query.tab} onChange={(tab: SystemTab): void => goTo({tab})}/>

            <div role="tabpanel" aria-label={systemTabLabel(t, query.tab)}>
                {query.tab === SystemTab.Server && <ServerTab {...panel}/>}
                {query.tab === SystemTab.Runtime && <RuntimeTab {...panel}/>}
                {query.tab === SystemTab.Dependencies && <DependenciesTab {...panel}/>}
                {query.tab === SystemTab.Processes && <ProcessesTab {...panel}/>}
                {query.tab === SystemTab.Logs && <LogsTab {...panel} query={query} onChange={goTo}/>}
            </div>
        </div>
    );
}
