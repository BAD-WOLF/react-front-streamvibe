// NOTA (nov/2026): com o strict-boolean-expressions, nada de "if (texto)" ou
// "{valor && ...}" com string, número ou null: a condição é sempre um boolean.
// Estes testes deixam a intenção explícita onde ela se repete.

/** true para uma string com conteúdo (nem null, nem undefined, nem ""). */
export function hasText(value: string | null | undefined): value is string {
    return value !== null && value !== undefined && value !== '';
}

/** true para qualquer valor que não seja null nem undefined. */
export function isPresent<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

/** Uma lista com pelo menos um item: o primeiro (items[0]) nunca é undefined. */
export type NonEmptyArray<T> = [T, ...T[]];

export function isNonEmpty<T>(items: T[]): items is NonEmptyArray<T> {
    return items.length > 0;
}

/** O texto, quando tem algum; senão o `fallback` (o antigo `texto || fallback`). */
export function textOr<T>(value: string | null | undefined, fallback: T): string | T {
    return hasText(value) ? value : fallback;
}
