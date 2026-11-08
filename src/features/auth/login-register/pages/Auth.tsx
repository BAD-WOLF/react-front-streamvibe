import AnimatedLogo from "@auth/login-register/components/AnimatedLogo.tsx";
import AuthForm from "@auth/login-register/components/AuthForm.tsx";
import AuthSuccess from "@auth/login-register/components/AuthSuccess.tsx";
import RegistrationPending from "@auth/login-register/components/RegistrationPending.tsx";
import SocialLoginButtons from "@auth/login-register/components/SocialLoginButtons.tsx";
import {AuthMode} from "@auth/login-register/types/AuthMode.ts";
import type {RegistrationResult} from "@auth/login-register/types/RegistrationResult.ts";
import type {Locale} from "@i18n/locales.ts";
import {useSession} from "@shared/auth/useSession.ts";
import {Loader} from "@shared/components/feedback/Loader.tsx";
import {useDocumentTitle} from "@shared/hooks/useDocumentTitle.ts";
import {useLocale} from "@shared/hooks/useLocale.ts";
import {type AuthLocationState, paths, readAuthLocationState} from "@shared/routing/paths.ts";
import {authClasses} from "@shared/styles/ts/login/AuthStyles.ts";
import {feedbackClasses} from "@shared/styles/ts/shared/FeedbackStyles.ts";
import {type Dispatch, type ReactElement, type SetStateAction, useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {type Location, Navigate, type NavigateFunction, type SetURLSearchParams, useLocation, useNavigate, useSearchParams} from "react-router-dom";
import type {Translation} from '@i18n/translation.ts';
import {SessionStatus, type SessionValue} from '@shared/auth/sessionContext.ts';

const REDIRECT_DELAY_MS: number = 1200;

/**
 * Só caminhos do próprio front: começa com "/", sem "//" e sem barra
 * invertida (que alguns navegadores leem como "/": "/\site" viraria
 * "//site", outro site).
 *
 * NOTA (nov/2026): o `next` agora vem do state da navegação (ProtectedRoute),
 * que um link de fora não consegue preencher; a conferência continua.
 */
function safeNext(next: string | undefined, locale: Locale): string {
    if (next === undefined || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return paths.home(locale);
    return next;
}

export default function AuthPage(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const navigate: NavigateFunction = useNavigate();
    const session: SessionValue = useSession();
    const location: Location = useLocation();
    const [searchParams]: [URLSearchParams, SetURLSearchParams] = useSearchParams();
    const received: AuthLocationState = readAuthLocationState(location.state);
    const [mode, setMode]: [AuthMode, Dispatch<SetStateAction<AuthMode>>] = useState<AuthMode>(searchParams.get("mode") === "register" ? AuthMode.Register : AuthMode.Login);
    const [email, setEmail]: [string, Dispatch<SetStateAction<string>>] = useState<string>(received.email ?? "");
    const [loggedIn, setLoggedIn]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const [registered, setRegistered]: [RegistrationResult | null, Dispatch<SetStateAction<RegistrationResult | null>>] = useState<RegistrationResult | null>(null);
    const next: string = safeNext(received.next, locale);
    useDocumentTitle(mode === AuthMode.Login ? t("Log in") : t("Register"));

    // NOTA (nov/2026): o redirecionamento usa o router (antes, window.location
    // recarregava a página inteira) e volta para onde a pessoa estava (o
    // `next` do state da navegação).
    useEffect((): (() => void) | undefined => {
        if (!loggedIn) return undefined;
        const timeout: ReturnType<typeof setTimeout> = setTimeout((): void => {
            void navigate(next, {replace: true});
        }, REDIRECT_DELAY_MS);
        return (): void => clearTimeout(timeout);
    }, [loggedIn, navigate, next]);

    const handleLoggedIn: () => void = useCallback((): void => setLoggedIn(true), []);
    const handleRegistered: (result: RegistrationResult) => void = useCallback((result: RegistrationResult): void => setRegistered(result), []);
    const backToLogin: (registeredEmail: string) => void = (registeredEmail: string): void => {
        setRegistered(null);
        setEmail(registeredEmail);
        setMode(AuthMode.Login);
    };

    // Ao abrir a página, a sessão ainda está sendo recuperada pelo cookie:
    // quem já está logado vai direto para o `next`, sem ver o formulário.
    if (session.status === SessionStatus.Restoring) {
        return (
            <div className={feedbackClasses.loaderPage}>
                <Loader label={t("Checking your session…")}/>
            </div>
        );
    }
    if (session.isAuthenticated && !loggedIn) return <Navigate to={next} replace/>;

    let content: ReactElement;
    if (loggedIn) {
        content = <AuthSuccess/>;
    } else if (registered !== null) {
        content = <RegistrationPending result={registered} onBackToLogin={backToLogin}/>;
    } else {
        content = (
            <>
                <AuthForm key={`${mode}-${email}`} onLoggedIn={handleLoggedIn} onRegistered={handleRegistered} locale={locale} mode={mode} initialEmail={email}/>
                <div className={authClasses.divider}/>
                <SocialLoginButtons/>
                <p className="text-sm text-center text-white/70 mt-4">
                    {mode === AuthMode.Login ? t("Doesn't have an account?") : t("Already have an account?")}{" "}
                    <button
                        type="button"
                        className={authClasses.link}
                        onClick={(): void => setMode(mode === AuthMode.Login ? AuthMode.Register : AuthMode.Login)}
                    >
                        {mode === AuthMode.Login ? t("Sign up") : t("Log in")}
                    </button>
                </p>
            </>
        );
    }

    return (
        <div className={authClasses.page}>
            <div className={authClasses.card}>
                <AnimatedLogo/>
                {content}
            </div>
        </div>
    );
}
