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
            <header
                className="site-header"
                style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    gap: "20px",
                    flexWrap: "nowrap",
                }}
            >
                {/* MARCA */}
                <a
                    href="#inicio"
                    className="brand-mark"
                    aria-label="EducaCube — início"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                    }}
                >
                    <img
                        src="/eduacubehomelogo.png"
                        alt=""
                        className="brand-glyph"
                        aria-hidden="true"
                        width={55}
                        height={55}
                        style={{
                            width: "55px",
                            height: "55px",
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

                {/* NAVEGAÇÃO */}
                <nav
                    className="site-nav"
                    aria-label="Navegação principal"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "28px",
                        flex: 1,
                        flexWrap: "nowrap",
                        whiteSpace: "nowrap",
                        minWidth: 0,
                    }}
                >
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                            }}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* AÇÕES */}
                <div
                    className="site-actions"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                    }}
                >
                    <a
                        href={ROUTES.login}
                        className="btn-ghost"
                        style={{
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                        }}
                    >
                        Área do Aluno
                    </a>

                    <a
                        href={ROUTES.aura}
                        className="btn-primary"
                        style={{
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                        }}
                    >
                        AURA AI
                    </a>
                </div>

                {/* MENU MOBILE */}
                <button
                    type="button"
                    className="nav-toggle"
                    aria-label={
                        menuOpen
                            ? "Fechar menu"
                            : "Abrir menu"
                    }
                    aria-expanded={menuOpen}
                    onClick={onToggleMenu}
                >
                    {menuOpen ? <IconClose /> : <IconMenu />}
                </button>
            </header>

            {/* MENU MOBILE */}
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
