import AnimatedLogo from "@auth/login-register/components/AnimatedLogo.tsx";
import AuthForm from "@auth/login-register/components/AuthForm.tsx";
import AuthSuccess from "@auth/login-register/components/AuthSuccess.tsx";
import RegistrationPending from "@auth/login-register/components/RegistrationPending.tsx";
import SocialLoginButtons from "@auth/login-register/components/SocialLoginButtons.tsx";
import {AuthMode} from "@auth/login-register/types/AuthMode.ts";
import type {RegistrationResult} from "@auth/login-register/types/RegistrationResult.ts";
import type {Locale} from "@i18n/locales.ts";
import {useSession} from "@shared/auth/useSession.ts";
import {useDocumentTitle} from "@shared/hooks/useDocumentTitle.ts";
import {useLocale} from "@shared/hooks/useLocale.ts";
import {paths} from "@shared/routing/paths.ts";
import {authClasses} from "@shared/styles/ts/login/AuthStyles.ts";
import {type Dispatch, type ReactElement, type SetStateAction, useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {Navigate, type NavigateFunction, type SetURLSearchParams, useNavigate, useSearchParams} from "react-router-dom";
import type {Translation} from '@i18n/translation.ts';
import type {SessionValue} from '@shared/auth/sessionContext.ts';

const REDIRECT_DELAY_MS: number = 1200;

/** Só endereços do próprio front (evita usar ?next= para mandar a pessoa a outro site). */
function safeNext(next: string | null, locale: Locale): string {
    return next !== null && next.startsWith("/") && !next.startsWith("//") ? next : paths.home(locale);
}

export default function AuthPage(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const navigate: NavigateFunction = useNavigate();
    const session: SessionValue = useSession();
    const [searchParams]: [URLSearchParams, SetURLSearchParams] = useSearchParams();
    const [mode, setMode]: [AuthMode, Dispatch<SetStateAction<AuthMode>>] = useState<AuthMode>(searchParams.get("mode") === "register" ? AuthMode.Register : AuthMode.Login);
    const [email, setEmail]: [string, Dispatch<SetStateAction<string>>] = useState<string>(searchParams.get("email") ?? "");
    const [loggedIn, setLoggedIn]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const [registered, setRegistered]: [RegistrationResult | null, Dispatch<SetStateAction<RegistrationResult | null>>] = useState<RegistrationResult | null>(null);
    const next: string = safeNext(searchParams.get("next"), locale);
    useDocumentTitle(mode === AuthMode.Login ? t("Log in") : t("Register"));

    // NOTA (nov/2026): o redirecionamento usa o router (antes, window.location
    // recarregava a página inteira) e volta para onde a pessoa estava (?next=).
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
