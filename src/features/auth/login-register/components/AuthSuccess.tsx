// Component displayed after successful login

import type {ReactElement} from "react";
import {useTranslation} from "react-i18next";
import type {Translation} from '@i18n/translation.ts';

export default function AuthSuccess(): ReactElement {
    const {t}: Translation = useTranslation();

    return (
        <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-green-500">{t("Login successful!")}</h2>
            <p className="text-white/80 mt-4">{t("You will be redirected shortly...")}</p>
        </div>
    );
}
