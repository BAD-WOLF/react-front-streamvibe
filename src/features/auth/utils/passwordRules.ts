import {calculatePasswordStrength, PasswordStrength} from '@auth/utils/passwordStrength.service.ts';
import type {TFunction} from 'i18next';

// NOTA (nov/2026): as regras do NewPassword da API (cadastro e troca de
// senha): de 12 a 4096 caracteres e força pelo menos média. A checagem de
// senha vazada (haveibeenpwned) só a API faz; o erro dela aparece na tela.
export const MIN_PASSWORD_LENGTH: number = 12;
export const MAX_PASSWORD_LENGTH: number = 4096;
export const MAX_EMAIL_LENGTH: number = 180;

const EMAIL_PATTERN: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string, t: TFunction): string | null {
    const trimmed: string = email.trim();
    if (trimmed === '') return t('Email is required.');
    if (trimmed.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(trimmed)) return t('Invalid email format.');
    return null;
}

export function validateNewPassword(password: string, t: TFunction): string | null {
    if (password === '') return t('Password is required.');
    if (password.length < MIN_PASSWORD_LENGTH) return t('Password must be at least {{count}} characters long.', {count: MIN_PASSWORD_LENGTH});
    if (password.length > MAX_PASSWORD_LENGTH) return t('Password cannot be longer than {{count}} characters.', {count: MAX_PASSWORD_LENGTH});
    if (calculatePasswordStrength(password) < PasswordStrength.Medium) {
        return t('Password is too weak: make it longer or mix upper and lower case letters, numbers and symbols.');
    }
    return null;
}
