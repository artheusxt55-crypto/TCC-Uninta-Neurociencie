import { IconCookie } from "./icons";
import { ROUTES } from "./content";
import type { CookieChoice } from "../../hooks/useCookieConsent";

type CookieBannerProps = {
    onChoose: (choice: CookieChoice) => void;
    onConfigure: () => void;
};

export default function CookieBanner({
    onChoose,
    onConfigure,
}: CookieBannerProps) {
    return (
        <div
            className="cookie-banner"
            role="dialog"
            aria-label="Aviso de cookies"
        >
            <div className="cookie-content">
                <div className="cookie-icon">
                    <IconCookie />
                </div>

                <div className="cookie-text">
                    <h3>Cookies e privacidade</h3>

                    <p>
                        O EducaCube utiliza cookies e tecnologias
                        semelhantes para manter funcionalidades da
                        plataforma, autenticação, preferências e,
                        caso autorizado, estatísticas de uso.
                    </p>

                    <div className="cookie-links">
                        <a
                            href={ROUTES.privacidade}
                            className="cookie-link"
                        >
                            Política de Privacidade
                        </a>

                        <a
                            href={ROUTES.cookies}
                            className="cookie-link"
                        >
                            Política de Cookies
                        </a>
                    </div>
                </div>

                <div className="cookie-actions">
                    <button
                        type="button"
                        className="cookie-btn"
                        onClick={() => onChoose("recusado")}
                    >
                        Recusar
                    </button>

                    <button
                        type="button"
                        className="cookie-btn"
                        onClick={onConfigure}
                    >
                        Configurar
                    </button>

                    <button
                        type="button"
                        className="cookie-btn cookie-btn-accept"
                        onClick={() => onChoose("aceito")}
                    >
                        Aceitar
                    </button>
                </div>
            </div>
        </div>
    );
}
