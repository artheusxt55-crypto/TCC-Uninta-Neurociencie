import { IconClose, IconMenu } from "./icons";
import { ROUTES } from "./content";

type SiteHeaderProps = {
    menuOpen: boolean;
    onToggleMenu: () => void;
    onCloseMenu: () => void;
};

const NAV_LINKS = [
    { href: "#inicio", label: "Início" },
    { href: "#como-funciona", label: "Como funciona" },
    { href: "#ferramentas", label: "Módulos" },
    { href: ROUTES.biblioteca, label: "Biblioteca" },
    { href: ROUTES.atlas, label: "Mapa da aprendizagem" },
] as const;

export default function SiteHeader({
    menuOpen,
    onToggleMenu,
    onCloseMenu,
}: SiteHeaderProps) {
    return (
        <>
            <header className="site-header">
                <a
                    href="#inicio"
                    className="brand-mark"
                    aria-label="EducaCube — início"
                >
                    <img
                        src="/eduacubehomelogo.png"
                        alt=""
                        className="brand-glyph"
                        aria-hidden="true"
                        width={46}
                        height={46}
                        style={{
                            width: "46px",
                            height: "46px",
                            objectFit: "contain",
                            flexShrink: 0,
                        }}
                    />

                    <span className="brand-name">
                        Educa
                        <span className="brand-name__cube">
                            Cube
                        </span>
                    </span>

                    <span className="brand-affiliation">
                        UNINTA — Laboratório de Pesquisa
                    </span>
                </a>

                <nav
                    className="site-nav"
                    aria-label="Navegação principal"
                >
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="site-actions">
                    <a
                        href={ROUTES.login}
                        className="btn-ghost"
                    >
                        Área do Aluno
                    </a>

                    <a
                        href={ROUTES.aura}
                        className="btn-primary"
                    >
                        AURA AI
                    </a>
                </div>

                <button
                    type="button"
                    className="nav-toggle"
                    aria-label={
                        menuOpen ? "Fechar menu" : "Abrir menu"
                    }
                    aria-expanded={menuOpen}
                    onClick={onToggleMenu}
                >
                    {menuOpen ? <IconClose /> : <IconMenu />}
                </button>
            </header>

            {menuOpen && (
                <div className="mobile-menu">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={onCloseMenu}
                        >
                            {link.label}
                        </a>
                    ))}

                    <a href={ROUTES.login}>
                        Área do Aluno
                    </a>

                    <a href={ROUTES.aura}>
                        AURA AI
                    </a>
                </div>
            )}
        </>
    );
}
