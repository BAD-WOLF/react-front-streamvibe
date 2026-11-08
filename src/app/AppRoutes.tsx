import AdminUserDetails from "@admin/pages/AdminUserDetails.tsx";
import AdminUsers from "@admin/pages/AdminUsers.tsx";
import AuditLog from "@admin/pages/AuditLog.tsx";
import {LocaleLayout} from "@app/LocaleLayout.tsx";
import {NotFound} from "@app/NotFound.tsx";
import {ProtectedRoute} from "@app/ProtectedRoute.tsx";
import {RoleRoute} from "@app/RoleRoute.tsx";
import Account from "@auth/account/pages/Account.tsx";
import Auth from "@auth/login-register/pages/Auth.tsx";
import Repassword from '@auth/repassword/pages/Repassword.tsx';
import VerifyEmail from "@auth/verify-email/pages/VerifyEmail.tsx";
import {Home} from "@content/home/pages/Home.tsx";
import {MovieDetails} from "@content/movies/pages/MovieDetails.tsx";
import {MovieList} from "@content/movies/pages/MovieList.tsx";
import {MovieSearch} from "@content/movies/pages/MovieSearch.tsx";
import {PersonDetails} from "@content/person/pages/PersonDetails.tsx";
import {preferredLocale} from "@i18n/locales.ts";
import {ContentLayout} from "@layout/ContentLayout.tsx";
import {Role} from "@shared/auth/roles.ts";
import type {ReactElement} from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";

// NOTA (nov/2026): o idioma deixou de ser opcional (/:_locale?): toda rota
// fica sob /:_locale, e o LocaleLayout completa os endereços sem idioma.
// As páginas de conteúdo usam rotas 🔒 da API, então pedem login.
// NOTA (nov/2026, papéis): a administração (contas e log de auditoria) fica
// sob o RoleRoute de ROLE_ADMIN; um papel abaixo vê o 403.
export default function AppRoutes(): ReactElement {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to={`/${preferredLocale()}/home`} replace/>}/>
                <Route path="/:_locale" element={<LocaleLayout/>}>
                    <Route index element={<Navigate to="home" replace/>}/>
                    <Route path="auth" element={<Auth/>}/>
                    <Route path="auth/verify-email" element={<VerifyEmail/>}/>
                    <Route path="auth/repassword/:token?" element={<Repassword/>}/>

                    <Route element={<ProtectedRoute/>}>
                        <Route element={<ContentLayout/>}>
                            <Route path="home" element={<Home/>}/>
                            <Route path="movies/list/:list" element={<MovieList/>}/>
                            <Route path="movies/search" element={<MovieSearch/>}/>
                            <Route path="movies/:movieId" element={<MovieDetails/>}/>
                            <Route path="person/:personId" element={<PersonDetails/>}/>
                            <Route path="account" element={<Account/>}/>
                            <Route element={<RoleRoute role={Role.Admin}/>}>
                                <Route path="admin/users" element={<AdminUsers/>}/>
                                <Route path="admin/users/:userId" element={<AdminUserDetails/>}/>
                                <Route path="admin/audit-log" element={<AuditLog/>}/>
                            </Route>
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFound/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
