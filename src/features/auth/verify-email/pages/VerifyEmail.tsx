import AnimatedLogo from '@auth/login-register/components/AnimatedLogo.tsx';
import ResendVerificationForm from '@auth/verify-email/components/ResendVerificationForm.tsx';
import {validateVerificationLinkService, verifyEmailService} from '@auth/verify-email/services/verifyEmail.service.ts';
import type {Locale} from '@i18n/locales.ts';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {Loader} from '@shared/components/feedback/Loader.tsx';
import {Notice} from '@shared/components/feedback/Notice.tsx';
import {type AsyncState, useAsync} from '@shared/hooks/useAsync.ts';
import {useDocumentTitle} from '@shared/hooks/useDocumentTitle.ts';
import {useLocale} from '@shared/hooks/useLocale.ts';
import {paths} from '@shared/routing/paths.ts';
import {authClasses} from '@shared/styles/ts/login/AuthStyles.ts';
import type {ValidateEmailLinkResponse, VerifyEmailLinkParams, VerifyEmailResponse} from '@shared/types/auth/index.ts';
import {type Dispatch, type ReactElement, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Link, type NavigateFunction, type SetURLSearchParams, useNavigate, useSearchParams} from 'react-router-dom';
import type {Translation} from '@i18n/translation.ts';
import {hasText} from '@shared/utils/guards.ts';

function readLinkParams(searchParams: URLSearchParams): VerifyEmailLinkParams | null {
    const expires: string | null = searchParams.get('expires');
    const id: string | null = searchParams.get('id');
    const signature: string | null = searchParams.get('signature');
    const token: string | null = searchParams.get('token');
    return hasText(expires) && hasText(id) && hasText(signature) && hasText(token) ? {expires, id, signature, token} : null;
}

/**
 * NOTA (nov/2026): a página do link de confirmação. Ela confere o link
 * (GET /verify/email/validate, que não verifica nada) e, com o clique,
 * confirma o email (GET /verify/email). Os parâmetros vão exatamente como
 * chegaram, com o mesmo idioma: a assinatura cobre o link inteiro.
 * Pendência do backend: o email ainda aponta para a API; para cair aqui, o
 * link precisa apontar para {FRONT}/{locale}/auth/verify-email?expires&id&signature&token.
 */
export default function VerifyEmail(): ReactElement {
    const {t}: Translation = useTranslation();
    const locale: Locale = useLocale();
    const navigate: NavigateFunction = useNavigate();
    const [searchParams]: [URLSearchParams, SetURLSearchParams] = useSearchParams();
    const params: VerifyEmailLinkParams | null = readLinkParams(searchParams);
    const [verifying, setVerifying]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    const [verified, setVerified]: [VerifyEmailResponse | null, Dispatch<SetStateAction<VerifyEmailResponse | null>>] = useState<VerifyEmailResponse | null>(null);
    const [verifyError, setVerifyError]: [unknown, Dispatch<SetStateAction<unknown>>] = useState<unknown>(null);
    useDocumentTitle(t('Confirm your email'));

    const check: AsyncState<ValidateEmailLinkResponse> = useAsync<ValidateEmailLinkResponse>(
        async (signal: AbortSignal): Promise<ValidateEmailLinkResponse> => {
            // não acontece: sem os parâmetros, a chave é null e o useAsync não roda
            if (params === null) throw new Error('The confirmation link is incomplete.');
            return (await validateVerificationLinkService(locale, params, signal)).data;
        },
        params !== null ? `${locale}|${searchParams.toString()}` : null
    );

    const confirm: () => Promise<void> = async (): Promise<void> => {
        if (params === null) return;
        setVerifying(true);
        setVerifyError(null);
        try {
            setVerified((await verifyEmailService(locale, params)).data);
        } catch (error: unknown) {
            setVerifyError(error);
        } finally {
            setVerifying(false);
        }
    };

    const goToLogin: () => void = (): void => {
        void navigate(paths.auth(locale));
    };

    let content: ReactElement;
    if (params === null) {
        content = (
            <>
                <Notice tone="error">{t('This confirmation link is incomplete. Ask for a new one below.')}</Notice>
                <ResendVerificationForm onAlreadyVerified={goToLogin}/>
            </>
        );
    } else if (verified !== null || check.data?.already_verified === true) {
        content = (
            <>
                <Notice tone="success">
                    {verified !== null && !verified.already_verified ? t('Email confirmed! Your account is ready.') : t('This email was already confirmed.')}
                </Notice>
                <button type="button" className={authClasses.primaryButton} onClick={goToLogin}>{t('Log in')}</button>
            </>
        );
    } else if (check.loading) {
        content = <Loader label={t('Checking the link...')}/>;
    } else if (check.error !== null) {
        content = <ErrorMessage error={check.error} onRetry={check.reload}/>;
    } else if (check.data !== null && !check.data.valid) {
        content = (
            <>
                <Notice tone="warning">{t('This link is invalid or expired. Ask for a new one below.')}</Notice>
                <ResendVerificationForm onAlreadyVerified={goToLogin}/>
            </>
        );
    } else {
        content = (
            <>
                <p className={authClasses.text}>{t('The link is valid. Confirm your email to activate your account.')}</p>
                {verifyError !== null && <ErrorMessage error={verifyError}/>}
                <button type="button" className={authClasses.primaryButton} disabled={verifying} onClick={(): void => void confirm()}>
                    {verifying ? t('Confirming...') : t('Confirm my email')}
                </button>
            </>
        );
    }

    return (
        <div className={authClasses.page}>
            <div className={authClasses.card}>
                <AnimatedLogo/>
                <h1 className={authClasses.title}>{t('Confirm your email')}</h1>
                {content}
                <p className={authClasses.text}><Link className={authClasses.link} to={paths.auth(locale)}>{t('Back to login')}</Link></p>
            </div>
        </div>
    );
}
