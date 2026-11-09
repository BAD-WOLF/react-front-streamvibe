import {type Locale, toLanguageTag} from '@i18n/locales.ts';
import {hasText} from '@shared/utils/guards.ts';

// NOTA (nov/2026): os números do painel do sistema na tela — durações,
// porcentagens, tempos e o ano-mês do suporte do Symfony — e o tom (cor) de
// um uso: até 70% ok, até 90% atenção, acima disso perigo.

export type UsageTone = 'ok' | 'warning' | 'danger';

const MINUTE: number = 60;
const HOUR: number = 60 * MINUTE;
const DAY: number = 24 * HOUR;

/** Tempo ligado: "3 d 4 h", "4 h 12 min", "12 min", "45 s" (as abreviações valem nos três idiomas). */
export function formatUptime(seconds: number): string {
    const days: number = Math.floor(seconds / DAY);
    const hours: number = Math.floor((seconds % DAY) / HOUR);
    const minutes: number = Math.floor((seconds % HOUR) / MINUTE);

    if (days > 0) return `${days} d ${hours} h`;
    if (hours > 0) return `${hours} h ${minutes} min`;
    if (minutes > 0) return `${minutes} min`;
    return `${Math.floor(seconds)} s`;
}

export function formatNumber(value: number, locale: Locale, maximumFractionDigits: number = 2): string {
    return new Intl.NumberFormat(toLanguageTag(locale), {maximumFractionDigits}).format(value);
}

/** 0.4123 → "41,2%". */
export function formatPercent(ratio: number, locale: Locale): string {
    return new Intl.NumberFormat(toLanguageTag(locale), {style: 'percent', maximumFractionDigits: 1}).format(ratio);
}

/** Segundos de CPU ou um limite de tempo: "12,5 s". */
export function formatSeconds(seconds: number, locale: Locale): string {
    return `${formatNumber(seconds, locale)} s`;
}

/** A latência de uma dependência: "0,84 ms", "182 ms". */
export function formatMilliseconds(milliseconds: number, locale: Locale): string {
    return `${formatNumber(milliseconds, locale, milliseconds < 10 ? 2 : 0)} ms`;
}

/** Hora com segundos (as linhas de log, "lido às"). */
export function formatTime(value: Date | string | null, locale: Locale): string | null {
    if (value === null || (typeof value === 'string' && !hasText(value))) return null;
    const date: Date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(toLanguageTag(locale), {timeStyle: 'medium'}).format(date);
}

/** Data e hora com segundos (as linhas de log). */
export function formatDateTimeWithSeconds(value: string | null, locale: Locale): string | null {
    if (!hasText(value)) return null;
    const date: Date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(toLanguageTag(locale), {dateStyle: 'short', timeStyle: 'medium'}).format(date);
}

/** "2028-11" (o ano-mês da API) → "novembro de 2028". */
export function formatYearMonth(yearMonth: string, locale: Locale): string {
    const date: Date = new Date(`${yearMonth}-01T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return yearMonth;
    return new Intl.DateTimeFormat(toLanguageTag(locale), {month: 'long', year: 'numeric', timeZone: 'UTC'}).format(date);
}

/** O mês "2028-11" já terminou (o suporte acabou). */
export function hasYearMonthPassed(yearMonth: string, now: Date = new Date()): boolean {
    const [year, month]: number[] = yearMonth.split('-').map(Number);
    if (year === undefined || month === undefined || Number.isNaN(year) || Number.isNaN(month)) return false;
    // o primeiro dia do mês seguinte
    return now.getTime() >= Date.UTC(year, month, 1);
}

export function usageTone(ratio: number): UsageTone {
    if (ratio >= 0.9) return 'danger';
    if (ratio >= 0.7) return 'warning';
    return 'ok';
}

/** used / total, entre 0 e 1 (total 0 = 0). */
export function ratioOf(used: number, total: number): number {
    if (total <= 0) return 0;
    return Math.min(Math.max(used / total, 0), 1);
}
