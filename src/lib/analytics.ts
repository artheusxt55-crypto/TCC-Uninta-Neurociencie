const GA_MEASUREMENT_ID = "G-3ZRNDZFYER";

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
        [key: `ga-disable-${string}`]: boolean | undefined;
    }
}

let analyticsInicializado = false;
let scriptCarregando = false;

function prepararGtag() {
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];

    if (!window.gtag) {
        window.gtag = function (...args: any[]) {
            window.dataLayer.push(args);
        };
    }
}

function definirConsentimentoNegado() {
    prepararGtag();

    window.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        wait_for_update: 500,
    });
}

export function aceitarAnalytics() {
    if (typeof window === "undefined") return;

    prepararGtag();

    // Remove bloqueio explícito do GA, caso exista.
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;

    // Libera Analytics.
    window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
    });

    if (analyticsInicializado || scriptCarregando) {
        return;
    }

    const scriptExistente = document.querySelector(
        `script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`
    );

    if (scriptExistente) {
        analyticsInicializado = true;

        window.gtag("js", new Date());

        window.gtag("config", GA_MEASUREMENT_ID, {
            anonymize_ip: true,
        });

        console.log("📊 Google Analytics já estava carregado.");

        return;
    }

    scriptCarregando = true;

    const script = document.createElement("script");

    script.async = true;

    script.src =
        `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

    script.onload = () => {
        scriptCarregando = false;
        analyticsInicializado = true;

        window.gtag("js", new Date());

        window.gtag("config", GA_MEASUREMENT_ID, {
            anonymize_ip: true,
        });

        console.log("📊 Google Analytics carregado com sucesso.");

        // Evento manual para confirmar que os hits estão funcionando.
        window.gtag("event", "analytics_teste", {
            origem: "educacube",
        });

        console.log("📤 Evento analytics_teste enviado.");
    };

    script.onerror = () => {
        scriptCarregando = false;
        analyticsInicializado = false;

        console.error(
            "❌ Não foi possível carregar o Google Analytics."
        );
    };

    document.head.appendChild(script);

    console.log("⏳ Carregando Google Analytics...");
}

export function recusarAnalytics() {
    if (typeof window === "undefined") return;

    prepararGtag();

    window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;

    definirConsentimentoNegado();

    window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
    });

    console.log("🚫 Analytics recusado.");
}

export function registrarEvento(
    nome: string,
    parametros?: Record<string, any>
) {
    if (typeof window === "undefined") return;

    if (!analyticsInicializado) {
        console.warn(
            "⚠️ Evento não enviado porque o Google Analytics ainda não foi inicializado:",
            nome
        );

        return;
    }

    window.gtag("event", nome, parametros || {});

    console.log("📤 Evento enviado:", nome);
}
