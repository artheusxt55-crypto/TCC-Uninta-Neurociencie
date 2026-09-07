const GA_MEASUREMENT_ID = "G-3ZRNDZFYER";

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

let inicializado = false;
let carregando = false;

function prepararGtag() {
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];

    if (typeof window.gtag !== "function") {
        window.gtag = function (...args: any[]) {
            window.dataLayer.push(args);
        };
    }
}

export function recusarAnalytics() {
    if (typeof window === "undefined") return;

    prepararGtag();

    window.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
    });

    window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
    });

    console.log("🚫 Analytics recusado.");
}

export function aceitarAnalytics() {
    if (typeof window === "undefined") return;

    prepararGtag();

    // 1. LIBERA O ANALYTICS
    window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
    });

    // 2. Não inicializa duas vezes
    if (inicializado || carregando) {
        return;
    }

    // 3. Se o Google já estiver na página, usa ele
    const existente = document.querySelector(
        'script[src*="googletagmanager.com/gtag/js"]'
    );

    if (existente) {
        finalizarInicializacao();
        return;
    }

    // 4. Carrega o gtag.js
    carregando = true;

    const script = document.createElement("script");

    script.async = true;

    script.src =
        `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

    script.onload = () => {
        carregando = false;
        finalizarInicializacao();
    };

    script.onerror = () => {
        carregando = false;

        console.error(
            "❌ Google Analytics não conseguiu carregar."
        );
    };

    document.head.appendChild(script);

    console.log("⏳ Carregando Google Analytics...");
}

function finalizarInicializacao() {
    if (typeof window === "undefined") return;

    prepararGtag();

    if (inicializado) return;

    // Inicializa o Google
    window.gtag("js", new Date());

    window.gtag("config", GA_MEASUREMENT_ID, {
        send_page_view: true,
    });

    inicializado = true;

    console.log(
        "📊 Google Analytics inicializado:",
        GA_MEASUREMENT_ID
    );

    // Teste real
    window.gtag("event", "analytics_teste", {
        origem: "educacube",
    });

    console.log(
        "📤 analytics_teste enviado para o gtag."
    );
}

export function registrarEvento(
    nome: string,
    parametros?: Record<string, any>
) {
    if (typeof window === "undefined") return;

    if (!inicializado) {
        console.warn(
            "⚠️ Analytics ainda não inicializado:",
            nome
        );
        return;
    }

    window.gtag("event", nome, parametros || {});

    console.log("📤 Evento enviado:", nome);
}
