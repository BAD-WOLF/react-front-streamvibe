import {type Locale, toLanguageTag} from '@i18n/locales.ts';
import {hasText} from '@shared/utils/guards.ts';

const DATE_ONLY: RegExp = /^\d{4}-\d{2}-\d{2}$/;

/** "2026-01-31" (TMDB) ou ISO 8601 (API) → data por extenso no idioma da tela. */
export function formatDate(value: string | null | undefined, locale: Locale): string | null {
    if (!hasText(value)) return null;
    const dateOnly: boolean = DATE_ONLY.test(value);
    const date: Date = new Date(dateOnly ? `${value}T00:00:00Z` : value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(toLanguageTag(locale), {
        dateStyle: 'long',
        ...(dateOnly ? {timeZone: 'UTC'} : {}),
    }).format(date);
}

/** ISO 8601 da API → data e hora locais. */
export function formatDateTime(value: string | null | undefined, locale: Locale): string | null {
    if (!hasText(value)) return null;
    const date: Date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(toLanguageTag(locale), {dateStyle: 'medium', timeStyle: 'short'}).format(date);
}

/** Orçamento e bilheteria do TMDB vêm em dólares; 0 significa "não informado". */
export function formatMoney(amount: number | null | undefined, locale: Locale): string | null {
    if (amount === null || amount === undefined || amount === 0 || Number.isNaN(amount)) return null;
    return new Intl.NumberFormat(toLanguageTag(locale), {style: 'currency', currency: 'USD', maximumFractionDigits: 0}).format(amount);
}

export function formatBytes(bytes: number | null | undefined, locale: Locale): string | null {
    if (bytes === null || bytes === undefined) return null;
    const units: string[] = ['B', 'KB', 'MB', 'GB'];
    let value: number = bytes;
    let unit: number = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }
    return `${new Intl.NumberFormat(toLanguageTag(locale), {maximumFractionDigits: 1}).format(value)} ${units[unit] ?? ''}`;
}

/** Iniciais para o avatar (o email da conta). */
export function initialsOf(text: string): string {
    const name: string = text.split('@')[0] ?? '';
    const parts: string[] = name.split(/[._\-\s]+/).filter((part: string): boolean => part !== '');
    const first: string | undefined = parts[0];
    const second: string | undefined = parts[1];
    const initials: string = first !== undefined && second !== undefined ? `${first.charAt(0)}${second.charAt(0)}` : name.slice(0, 2);
    const upper: string = initials.toUpperCase();
    return upper !== '' ? upper : 'SV';
}
