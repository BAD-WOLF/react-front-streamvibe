import {Forbidden} from '@app/Forbidden.tsx';
import {includesRole, type Role} from '@shared/auth/roles.ts';
import type {SessionValue} from '@shared/auth/sessionContext.ts';
import {useSession} from '@shared/auth/useSession.ts';
import type {ReactElement} from 'react';
import {Outlet} from 'react-router-dom';

/**
 * Rotas de um papel (ex.: a administração, ROLE_ADMIN): fica sob o
 * ProtectedRoute, que já garantiu a sessão; um papel abaixo vê o 403. O papel
 * vem do JWT (SessionUser.role) e inclui os de baixo (includesRole). A API
 * confere de novo em cada chamada — isto só evita a tela que não vai
 * funcionar.
 *
 * NOTA (nov/2026): criado com a hierarquia de papéis.
 */
export function RoleRoute({role}: { role: Role }): ReactElement {
    const {user}: SessionValue = useSession();

    if (user === null || !includesRole(user.role, role)) return <Forbidden/>;

    return <Outlet/>;
}
