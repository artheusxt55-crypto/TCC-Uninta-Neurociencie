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

    window.gtag =
        window.gtag ||
        function (...args: any[]) {
            window.dataLayer.push(args);
        };
}

function configurarConsentimentoInicial() {
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

    // Libera o Analytics
    window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
    });

    // Já inicializado
    if (inicializado) {
        return;
    }

    // Já está carregando
    if (carregando) {
        return;
    }

    // Verifica se o script já existe
    const scriptExistente = document.querySelector(
        `script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`
    );

    if (scriptExistente) {
        inicializarGoogleAnalytics();
        return;
    }

    carregando = true;

    const script = document.createElement("script");

    script.async = true;

    script.src =
        `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

    script.onload = () => {
        carregando = false;

        inicializarGoogleAnalytics();
    };

    script.onerror = () => {
        carregando = false;

        console.error(
            "❌ Erro ao carregar Google Analytics."
        );
    };

    document.head.appendChild(script);

    console.log(
        "⏳ Carregando Google Analytics..."
    );
}

function inicializarGoogleAnalytics() {
    if (typeof window === "undefined") return;

    prepararGtag();

    if (inicializado) return;

    window.gtag("js", new Date());

    window.gtag("config", GA_MEASUREMENT_ID);

    inicializado = true;

    console.log(
        "📊 Google Analytics carregado com sucesso."
    );

    window.gtag("event", "analytics_teste", {
        origem: "educacube",
    });

    console.log(
        "📤 Evento analytics_teste enviado."
    );
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

    console.log(
        "🚫 Analytics recusado."
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
