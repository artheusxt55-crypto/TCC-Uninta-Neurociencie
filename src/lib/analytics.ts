const GA_MEASUREMENT_ID = "G-3ZRNDZFYER";

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

let analyticsInicializado = false;

/**
 * Garante que o gtag e o dataLayer existam.
 *
 * O gtag.js já é carregado pelo index.html.
 * Esta função apenas garante que podemos chamar gtag().
 */
function prepararGtag() {
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];

    if (typeof window.gtag !== "function") {
        window.gtag = function (...args: any[]) {
            window.dataLayer.push(args);
        };
    }
}

/**
 * Define o consentimento inicial como negado.
 */
export function recusarAnalytics() {
    if (typeof window === "undefined") return;

    prepararGtag();

    window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
    });

    console.log("🚫 Analytics recusado.");
}

/**
 * Ativa o Google Analytics depois que o usuário aceita os cookies.
 */
export function aceitarAnalytics() {
    if (typeof window === "undefined") return;

    prepararGtag();

    // Libera o armazenamento do Analytics.
    window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
    });

    // Evita inicializar duas vezes.
    if (analyticsInicializado) {
        console.log("📊 Analytics já estava inicializado.");
        return;
    }

    /*
     * O gtag.js já foi carregado pelo index.html.
     * Agora configuramos o GA4.
     */
    window.gtag("config", GA_MEASUREMENT_ID, {
        send_page_view: true,
        anonymize_ip: true,
    });

    analyticsInicializado = true;

    console.log(
        "📊 Google Analytics inicializado:",
        GA_MEASUREMENT_ID
    );

    /*
     * Evento de teste.
     * Pode ser removido depois que confirmarmos
     * que o Analytics está funcionando.
     */
    window.gtag("event", "analytics_teste", {
        origem: "educacube",
    });

    console.log("📤 analytics_teste enviado.");
}

/**
 * Registra eventos personalizados.
 */
export function registrarEvento(
    nome: string,
    parametros?: Record<string, any>
) {
    if (typeof window === "undefined") return;

    if (!analyticsInicializado) {
        console.warn(
            "⚠️ Evento não enviado porque o Analytics ainda não foi aceito/inicializado:",
            nome
        );

        return;
    }

    window.gtag(
        "event",
        nome,
        parametros || {}
    );

    console.log(
        "📤 Evento enviado:",
        nome
    );
}
