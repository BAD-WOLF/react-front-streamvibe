// Function that calculates password strength
//
// NOTA (nov/2026): a mesma conta do Assert\PasswordStrength do Symfony, que a
// API usa no cadastro e na troca de senha (entropia sobre os bytes UTF-8). O
// antigo contador (8 caracteres, maiúscula, número, símbolo) aprovava senhas
// que a API recusa. Os níveis são um enum, como o AuthMode.
export enum PasswordStrength {
    VeryWeak = 0,
    Weak = 1,
    Medium = 2,
    Strong = 3,
    VeryStrong = 4,
}

export function calculatePasswordStrength(password: string): PasswordStrength {
    const bytes: Uint8Array = new TextEncoder().encode(password);
    const length: number = bytes.length;
    if (length === 0) return PasswordStrength.VeryWeak;

    const distinct: Set<number> = new Set<number>(bytes);
    const chars: number = distinct.size;
    let control: number = 0;
    let digit: number = 0;
    let upper: number = 0;
    let lower: number = 0;
    let symbol: number = 0;
    let other: number = 0;

    for (const chr of distinct) {
        if (chr < 32 || chr === 127) control = 33;
        else if (chr >= 48 && chr <= 57) digit = 10;
        else if (chr >= 65 && chr <= 90) upper = 26;
        else if (chr >= 97 && chr <= 122) lower = 26;
        else if (chr >= 128) other = 128;
        else symbol = 33;
    }

    const pool: number = lower + upper + digit + symbol + control + other;
    const entropy: number = chars * Math.log2(pool) + (length - chars) * Math.log2(chars);

    if (entropy >= 120) return PasswordStrength.VeryStrong;
    if (entropy >= 100) return PasswordStrength.Strong;
    if (entropy >= 80) return PasswordStrength.Medium;
    if (entropy >= 60) return PasswordStrength.Weak;
    return PasswordStrength.VeryWeak;
}
