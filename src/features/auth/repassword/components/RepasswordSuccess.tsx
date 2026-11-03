import {Notice} from '@shared/components/feedback/Notice.tsx';
import type {ReactElement} from "react";
import {useTranslation} from "react-i18next";
import type {Translation} from '@i18n/translation.ts';

export default function RepasswordSuccess(): ReactElement {
    const {t}: Translation = useTranslation();

    return (
        <div className="text-center py-6 space-y-4">
            <h2 className="text-2xl font-bold text-green-500">{t("Your password has been successfully changed!")}</h2>
            <p className="text-white/80">{t("You can now log in with your new password.")}</p>
            <Notice tone="info">{t("For your safety, every session of your account was closed; log in again on each device.")}</Notice>
        </div>
    );
}
