
const GA_MEASUREMENT_ID = "G-3ZRNDZFYER";

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

let analyticsInicializado = false;
let scriptCarregando = false;
let consentConfigurado = false;

/**
 * Prepara o dataLayer e uma função gtag temporária.
 * Essa função é substituída/assumida pelo Google quando o gtag.js carregar.
 */
function prepararGtag() {
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];

    if (!window.gtag) {
        window.gtag = function (...args: any[]) {
            window.dataLayer.push(args);
        };
    }
}

/**
 * Define o consentimento padrão como negado.
 *
 * Isso acontece antes do carregamento do Google Analytics.
 */
function definirConsentimentoPadraoNegado() {
    if (typeof window === "undefined") return;

    prepararGtag();

    if (consentConfigurado) return;

    window.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        wait_for_update: 500,
    });

    consentConfigurado = true;
}

/**
 * Inicializa o Google Analytics somente depois que o usuário aceitar.
 */
export function aceitarAnalytics() {
    if (typeof window === "undefined") return;

    prepararGtag();
    definirConsentimentoPadraoNegado();

    // Libera o armazenamento de Analytics.
    window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
    });

    // Se já inicializou, não cria outro script.
    if (analyticsInicializado) {
        return;
    }

    // Se o script já está carregando, não cria outro.
    if (scriptCarregando) {
        return;
    }

    const scriptExistente = document.querySelector(
        `script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`
    ) as HTMLScriptElement | null;

    // Se o script já existe, consideramos que o Google já foi solicitado.
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

    /**
     * Só consideramos o Analytics carregado quando
     * o navegador confirma que o script do Google carregou.
     */
    script.onload = () => {
        scriptCarregando = false;
        analyticsInicializado = true;

        window.gtag("js", new Date());

        window.gtag("config", GA_MEASUREMENT_ID, {
            anonymize_ip: true,
        });

        console.log("📊 Google Analytics carregado com sucesso.");
    };

    /**
     * Se o Google não conseguir carregar, não fingimos
     * que o Analytics foi inicializado.
     */
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

/**
 * Recusa o Analytics.
 */
export function recusarAnalytics() {
    if (typeof window === "undefined") return;

    prepararGtag();
    definirConsentimentoPadraoNegado();

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

    window.gtag(
        "event",
        nome,
        parametros || {}
    );
}

