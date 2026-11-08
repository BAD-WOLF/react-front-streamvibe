// NOTA (nov/2026): os papéis de uma conta, em hierarquia — cada um tem tudo o
// do anterior: ROLE_USER < ROLE_DEV < ROLE_ADMIN < ROLE_OWNER. Espelho do
// App\Domain\User\ValueObject\Role da API (e do role_hierarchy do
// security.yaml dela): a ordem e os nomes são os mesmos.
//
// - ROLE_USER: toda conta (catálogo, a própria conta);
// - ROLE_DEV: + o painel do sistema;
// - ROLE_ADMIN: + a administração das contas e o log de auditoria;
// - ROLE_OWNER: + as configurações e as chaves; o único que mexe em outros
//   admins e owners.
export enum Role {
    User = 'ROLE_USER',
    Dev = 'ROLE_DEV',
    Admin = 'ROLE_ADMIN',
    Owner = 'ROLE_OWNER',
}

/** Do mais baixo ao mais alto: a posição é o nível. */
export const ROLES: readonly Role[] = [Role.User, Role.Dev, Role.Admin, Role.Owner];

const ROLE_NAMES: readonly string[] = ROLES;

export function isRole(value: unknown): value is Role {
    return typeof value === 'string' && ROLE_NAMES.includes(value);
}

/** `role` tem tudo o que `required` tem (é igual ou acima dele). */
export function includesRole(role: Role, required: Role): boolean {
    return ROLES.indexOf(role) >= ROLES.indexOf(required);
}

/**
 * O papel mais alto de uma lista de nomes (o claim `roles` do JWT, que traz o
 * papel da conta e ROLE_USER). Nomes fora da hierarquia ficam de fora; sem
 * nenhum, ROLE_USER.
 */
export function highestRoleOf(names: readonly string[]): Role {
    return names.filter(isRole).reduce(
        (highest: Role, role: Role): Role => (includesRole(role, highest) ? role : highest),
        Role.User,
    );
}
