import { IconCube } from "./icons";
import { ROUTES } from "./content";

const FOOTER_LINKS = [
    { href: ROUTES.biblioteca, label: "Biblioteca digital" },
    { href: ROUTES.atlas, label: "Mapa da aprendizagem" },
    { href: ROUTES.aura, label: "AURA AI" },
    { href: ROUTES.login, label: "Área do Aluno" },
] as const;

const LEGAL_LINKS = [
    { href: ROUTES.privacidade, label: "Política de Privacidade" },
    { href: ROUTES.cookies, label: "Política de Cookies" },
] as const;

export default function SiteFooter() {
    return (
        <footer className="site-footer">
            <div className="wrap site-footer__grid">
                <div className="site-footer__brand">
                    <p className="site-footer__name">
                        <IconCube className="brand-glyph" />

                        <span>
                            Educa
                            <span className="brand-name__cube">
                                Cube
                            </span>
                        </span>
                    </p>

                    <p className="site-footer__affiliation">
                        UNINTA — Laboratório de Pesquisa
                    </p>
                </div>

                <nav
                    className="site-footer__nav"
                    aria-label="Plataforma"
                >
                    {FOOTER_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <nav
                    className="site-footer__nav"
                    aria-label="Informações legais"
                >
                    {LEGAL_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>
            </div>
        </footer>
    );
}
