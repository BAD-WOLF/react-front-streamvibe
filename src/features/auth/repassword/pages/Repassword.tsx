import AnimatedLogo from "@auth/login-register/components/AnimatedLogo.tsx";
import EmailRequestForm from "@auth/repassword/components/EmailRequestForm.tsx";
import RepasswordSuccess from "@auth/repassword/components/RepasswordSuccess.tsx";
import RequestResult from "@auth/repassword/components/RequestResult.tsx";
import ResetPasswordForm from "@auth/repassword/components/ResetPasswordForm.tsx";
import TokenProblem from "@auth/repassword/components/TokenProblem.tsx";
import {useRepassword} from "@auth/repassword/hooks/useRepassword.ts";
import {RepasswordMode} from "@auth/repassword/types/RepasswordMode.ts";
import type {UseRepasswordReturn} from '@auth/repassword/types/UseRepasswordReturn.ts';
import type {Locale} from "@i18n/locales.ts";
import {ErrorMessage} from "@shared/components/feedback/ErrorMessage.tsx";
import {Loader} from "@shared/components/feedback/Loader.tsx";
import {useDocumentTitle} from "@shared/hooks/useDocumentTitle.ts";
import {useLocale} from "@shared/hooks/useLocale.ts";
import {paths, readAuthLocationState} from "@shared/routing/paths.ts";
import {authClasses} from "@shared/styles/ts/login/AuthStyles.ts";
import type {ReactElement} from "react";
import {useTranslation} from "react-i18next";
import {Link, type Location, type NavigateFunction, useLocation, useNavigate, useParams} from "react-router-dom";
import type {Translation} from '@i18n/translation.ts';
import {hasText} from '@shared/utils/guards.ts';

// NOTA (nov/2026): o link do email chega como {FRONT}/auth/repassword/{token}
// (o LocaleLayout põe o idioma na frente). O idioma vinha de um parâmetro
// `locale` que a rota não tinha (ela se chama `_locale`): a troca de senha
// sempre usava pt_BR. Agora vem do useLocale().
// O email já digitado no login chega no state da navegação, e não mais em
// ?email= na URL.
export default function Repassword(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const navigate: NavigateFunction = useNavigate();
    const {token}: Readonly<Partial<{ token: string }>> = useParams<{ token: string }>();
    const location: Location = useLocation();
    const state: UseRepasswordReturn = useRepassword(locale, token, readAuthLocationState(location.state).email ?? "");
    useDocumentTitle(t("Reset password"));

    const requestNew: () => void = (): void => {
        if (hasText(token)) void navigate(paths.repassword(locale), {replace: true});
        state.setMode(RepasswordMode.Request);
    };

    let content: ReactElement;
    switch (state.mode) {
        case RepasswordMode.Request:
            content = <EmailRequestForm {...state}/>;
            break;
        case RepasswordMode.Requested:
            content = state.requestResult !== null ? <RequestResult result={state.requestResult} email={state.email} locale={locale}/> : <Loader/>;
            break;
        case RepasswordMode.Checking:
            content = state.apiError !== null
                ? <ErrorMessage error={state.apiError} onRetry={state.retryCheck}/>
                : <Loader label={t("Validating token…")}/>;
            break;
        case RepasswordMode.Reset:
            content = <ResetPasswordForm locale={locale} {...state}/>;
            break;
        case RepasswordMode.Done:
            content = (
                <>
                    <RepasswordSuccess/>
                    <Link className={authClasses.primaryButton + " block text-center"} to={paths.auth(locale)}>{t("Log in")}</Link>
                </>
            );
            break;
        case RepasswordMode.Cancelled:
        case RepasswordMode.Invalid:
        case RepasswordMode.Expired:
            content = <TokenProblem mode={state.mode} onRequestNew={requestNew}/>;
            break;
    }

    return (
        <div className={authClasses.page}>
            <div className={authClasses.card}>
                <AnimatedLogo/>
                <h1 className={authClasses.title}>{t("Reset password")}</h1>
                {content}
                <p className={authClasses.text}><Link className={authClasses.link} to={paths.auth(locale)}>{t("Back to login")}</Link></p>
            </div>
        </div>
    );
}
