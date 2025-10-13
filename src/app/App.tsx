import "@shared/styles/globals.scss";
import "@shared/styles/tailwind.css";
import {type ReactElement, StrictMode} from "react";
import AppRoutes from "./AppRoutes.tsx";
import '@i18n/i18n';

export default function App(): ReactElement {
    return (
        <main className='h-lvh w-full'>
            <StrictMode>
                <AppRoutes/>
            </StrictMode>
        </main>
    );
}