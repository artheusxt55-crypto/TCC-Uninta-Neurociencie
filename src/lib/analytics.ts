const GA_MEASUREMENT_ID = "G-3ZRNDZFYER";

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

let analyticsInicializado = false;

function criarGtag() {
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];

    if (!window.gtag) {
        window.gtag = function (...args: any[]) {
            window.dataLayer.push(args);
        };
    }
}

export function inicializarAnalytics() {
    if (typeof window === "undefined") return;

    if (analyticsInicializado) return;

    criarGtag();

    const scriptExistente = document.querySelector(
        `script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`
    );

    if (!scriptExistente) {
        const script = document.createElement("script");

        script.async = true;

        script.src =
            `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

        document.head.appendChild(script);
    }

    window.gtag("js", new Date());

    window.gtag(
        "config",
        GA_MEASUREMENT_ID,
        {
            anonymize_ip: true,
        }
    );

    analyticsInicializado = true;

    console.log("📊 Google Analytics inicializado.");
}

export function aceitarAnalytics() {
    if (typeof window === "undefined") return;

    criarGtag();

    inicializarAnalytics();

    window.gtag(
        "consent",
        "update",
        {
            analytics_storage: "granted",
            ad_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
        }
    );

    console.log("🍪 Analytics autorizado.");
}

export function recusarAnalytics() {
    if (typeof window === "undefined") return;

    criarGtag();

    window.gtag(
        "consent",
        "update",
        {
            analytics_storage: "denied",
            ad_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
        }
    );

    console.log("🚫 Analytics recusado.");
}

export function registrarEvento(
    nome: string,
    parametros?: Record<string, any>
) {
    if (typeof window === "undefined") return;

    if (!analyticsInicializado) return;

    window.gtag(
        "event",
        nome,
        parametros || {}
    );
}
