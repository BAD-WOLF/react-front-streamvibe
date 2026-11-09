import type {Translation} from '@i18n/translation.ts';
import {LogLevel, type ProcessState, SystemTab} from '@shared/types/system/index.ts';
import type {UsageTone} from '@system/utils/systemFormat.ts';

// NOTA (nov/2026): os textos do painel do sistema para os valores técnicos
// que a API manda (o nome da aba, o estado do processo) e o tom (cor) de um
// estado e de um nível de log.

export function systemTabLabel(t: Translation['t'], tab: SystemTab): string {
    switch (tab) {
        case SystemTab.Server:
            return t('Server');
        case SystemTab.Runtime:
            return t('PHP and Symfony');
        case SystemTab.Dependencies:
            return t('Dependencies');
        case SystemTab.Processes:
            return t('Processes');
        case SystemTab.Logs:
            return t('Logs');
    }
}

export function processStateLabel(t: Translation['t'], state: ProcessState): string {
    switch (state) {
        case 'running':
            return t('Running');
        case 'sleeping':
            return t('Sleeping');
        case 'waiting':
            return t('Waiting for the disk');
        case 'stopped':
            return t('Stopped');
        case 'zombie':
            return t('Zombie');
        case 'idle':
            return t('Idle');
        case 'dead':
            return t('Dead');
        case 'unknown':
            return t('Unknown');
    }
}

export function processStateTone(state: ProcessState): UsageTone {
    switch (state) {
        case 'running':
        case 'sleeping':
        case 'idle':
            return 'ok';
        case 'waiting':
        case 'stopped':
        case 'unknown':
            return 'warning';
        case 'zombie':
        case 'dead':
            return 'danger';
    }
}

/** O tom de um nível de log: até info sem destaque, warning atenção, error para cima perigo. */
export function logLevelTone(level: LogLevel | null): UsageTone | null {
    switch (level) {
        case null:
        case LogLevel.Debug:
        case LogLevel.Info:
            return null;
        case LogLevel.Notice:
            return 'ok';
        case LogLevel.Warning:
            return 'warning';
        case LogLevel.Error:
        case LogLevel.Critical:
        case LogLevel.Alert:
        case LogLevel.Emergency:
            return 'danger';
    }
}
