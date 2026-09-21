import { useEffect, useState } from "react";

import {
    aceitarAnalytics,
    recusarAnalytics,
} from "../lib/analytics";

export type CookieChoice = "aceito" | "recusado";

const STORAGE_KEY = "educacube_cookie_consent";

/**
 * Consentimento de cookies e analytics.
 * Mesma regra que existia em App.tsx: sem escolha prévia, o banner
 * aparece e o analytics permanece recusado.
 */
export function useCookieConsent() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consentimento = localStorage.getItem(STORAGE_KEY);

        if (!consentimento) {
            setShowBanner(true);
            recusarAnalytics();
            return;
        }

        if (consentimento === "aceito") {
            aceitarAnalytics();
        } else {
            recusarAnalytics();
        }
    }, []);

    const saveChoice = (escolha: CookieChoice) => {
        localStorage.setItem(STORAGE_KEY, escolha);

        document.cookie =
            `${STORAGE_KEY}=${escolha}; ` +
            `Max-Age=31536000; ` +
            `Path=/; ` +
            `SameSite=Lax`;

        if (escolha === "aceito") {
            aceitarAnalytics();
        } else {
            recusarAnalytics();
        }

        setShowBanner(false);
    };

    const openSettings = () => {
        window.location.href = "/cookies.html";
    };

    return { showBanner, saveChoice, openSettings };
}
