import type {UseRepasswordReturn} from '@auth/repassword/types/UseRepasswordReturn.ts';
import ResendVerificationForm from '@auth/verify-email/components/ResendVerificationForm.tsx';
import {ApiAction, ApiErrorType, isApiError} from '@shared/api/ApiError.ts';
import {ErrorMessage} from '@shared/components/feedback/ErrorMessage.tsx';
import {authClasses} from '@shared/styles/ts/login/AuthStyles.ts';
import type {ChangeEvent, ReactElement} from "react";
import {useTranslation} from "react-i18next";
import type {Translation} from '@i18n/translation.ts';

export default function EmailRequestForm({
    email, errors, apiError, isLoading, setEmail, handleRequest,
}: Pick<UseRepasswordReturn, "email" | "errors" | "apiError" | "isLoading" | "setEmail" | "handleRequest">): ReactElement {
    const {t}: Translation = useTranslation();
    // 403 com action_required "email_verification": a conta ainda não confirmou o email
    const needsVerification: boolean = isApiError(apiError)
        && (apiError.actionRequired === ApiAction.EmailVerification || apiError.type === ApiErrorType.UserNotVerified);

    return (
        <div className={authClasses.stack}>
            <form onSubmit={handleRequest} className={authClasses.stack} noValidate>
                <p className={authClasses.text}>{t("Type the email of your account and we will send you a link to set a new password.")}</p>
                <input
                    type="email"
                    placeholder={t("Your email")}
                    aria-label={t("Your email")}
                    autoComplete="email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>): void => setEmail(e.target.value)}
                    disabled={isLoading}
                    className={authClasses.emailInput}
                />
                {errors.email !== undefined && <p className={authClasses.fieldError}>{errors.email}</p>}
                {apiError !== null && <ErrorMessage error={apiError}/>}
                <button type="submit" disabled={isLoading} className={authClasses.primaryButton}>
                    {isLoading ? t("Sending...") : t("Send password reset email")}
                </button>
            </form>

            {needsVerification && <ResendVerificationForm initialEmail={email} lockEmail/>}
        </div>
    );
}
