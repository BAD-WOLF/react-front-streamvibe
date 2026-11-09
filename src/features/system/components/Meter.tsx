import type {Locale} from '@i18n/locales.ts';
import type {Translation} from '@i18n/translation.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {systemClasses} from '@shared/styles/ts/system/SystemStyles.ts';
import {formatPercent, ratioOf, usageTone} from '@system/utils/systemFormat.ts';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';

/**
 * Um uso (memória, disco, processos): "6,2 GB de 15,5 GB (40%)" e a barra,
 * verde até 70%, âmbar até 90% e vermelha acima. `hideLabel` deixa o rótulo
 * só para leitores de tela (numa tabela, a coluna já diz o que é).
 *
 * NOTA (nov/2026): criado com o painel do sistema (ROLE_DEV).
 */
export function Meter({label, used, total, format, hideLabel = false}: {
    label: string;
    used: number;
    total: number;
    format: (value: number) => string;
    hideLabel?: boolean | undefined;
}): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const ratio: number = ratioOf(used, total);
    const percent: string = formatPercent(ratio, locale);

    return (
        <div className={systemClasses.meter}>
            <div className={systemClasses.meterText}>
                <span className={hideLabel ? 'sr-only' : systemClasses.label}>{label}</span>
                <span>{t('{{used}} of {{total}}', {used: format(used), total: format(total)})} ({percent})</span>
            </div>
            <div
                className={systemClasses.meterTrack}
                role="meter"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(ratio * 100)}
                aria-valuetext={percent}
            >
                <div className={`${systemClasses.meterFill} ${systemClasses.meterTones[usageTone(ratio)]}`} style={{width: `${ratio * 100}%`}}/>
            </div>
        </div>
    );
}
