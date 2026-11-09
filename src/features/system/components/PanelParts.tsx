import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Loader} from '@shared/components/feedback/Loader.tsx';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {feedbackClasses} from '@shared/styles/ts/shared/FeedbackStyles.ts';
import {systemClasses} from '@shared/styles/ts/system/SystemStyles.ts';
import type {PanelData} from '@system/hooks/usePanelData.ts';
import {formatTime, type UsageTone} from '@system/utils/systemFormat.ts';
import type {ReactElement, ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

// NOTA (nov/2026): as peças que as abas do painel do sistema repetem: um dado
// com rótulo, um selo colorido, a lista de nomes (extensões, bundles), a hora
// da leitura e a espera/erro antes da primeira resposta.

/** Um dado com rótulo; `code` mostra o rótulo como está (o nome de uma diretiva do php.ini). */
export function Fact({label, code = false, children}: { label: string; code?: boolean | undefined; children: ReactNode }): ReactElement {
    return (
        <div className={systemClasses.fact}>
            <span className={`${systemClasses.label} block ${code ? 'font-mono normal-case' : ''}`}>{label}</span>
            <div className={systemClasses.factValue}>{children}</div>
        </div>
    );
}

export function StatusFlag({tone, children}: { tone: UsageTone | null; children: ReactNode }): ReactElement {
    return <span className={`${systemClasses.flag} ${systemClasses.flagTones[tone ?? 'neutral']}`}>{children}</span>;
}

export function Chips({items}: { items: string[] }): ReactElement {
    return (
        <ul className={systemClasses.chips}>
            {items.map((item: string): ReactElement => <li key={item} className={systemClasses.chip}>{item}</li>)}
        </ul>
    );
}

/** O "—" de um dado que o servidor não informou. */
export function Missing(): ReactElement {
    return <span className={systemClasses.muted}>—</span>;
}

/** "Lido às 14:50:01", com o indicador enquanto uma leitura nova está a caminho. */
export function ReadAt({data}: { data: PanelData<unknown> }): ReactElement | null {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const time: string | null = formatTime(data.readAt, locale);

    if (time === null) return null;

    return (
        <p className={systemClasses.readAt} aria-live="polite">
            {t('Read at {{time}}', {time})} {data.loading && <span className={feedbackClasses.loaderInline} aria-hidden="true"/>}
        </p>
    );
}

/** Antes da primeira resposta: a espera, ou o erro com "tentar de novo". */
export function PanelPending({data}: { data: PanelData<unknown> }): ReactElement {
    return data.error !== null ? <ErrorMessage error={data.error} onRetry={data.reload}/> : <Loader/>;
}
