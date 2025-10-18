import "@shared/styles/globals.scss";
import "@shared/styles/tailwind.css";
import {i18nReady} from '@i18n/i18n.js'
import {type Dispatch, type ReactElement, type SetStateAction, StrictMode, useEffect, useState} from "react";
import AppRoutes from "./AppRoutes.tsx";

export default function App(): ReactElement | null {
    const [ready, setReady]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
    useEffect((): void => {
        i18nReady.then((): void => setReady(true));
    }, []);

    if (!ready) return null;

    return (
        <main className='h-lvh w-full'>
            <StrictMode>
                <AppRoutes/>
            </StrictMode>
        </main>
    );
}