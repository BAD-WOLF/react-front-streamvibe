// Component for the image with floating animation

import type {ReactElement} from "react";
import {useTranslation} from "react-i18next";
import type {Translation} from '@i18n/translation.ts';

export default function AnimatedLogo(): ReactElement {
    const {t}: Translation = useTranslation();

    return (
        <div className="text-3xl font-extrabold text-white drop-shadow-lg tracking-wide animate-pulse">
            <img src="https://files.catbox.moe/txrqod.png" alt={t("Illustration")}/>
        </div>
    );
}
