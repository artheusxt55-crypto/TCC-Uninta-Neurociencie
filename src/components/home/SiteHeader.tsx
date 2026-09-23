import { useEffect, useState } from "react";
import { IconClose, IconMenu } from "./icons";
import { ROUTES } from "./content";
import AnimatedMenuBar, {
    type MenuItemKey,
} from "../ui/animated-menu-bar";

type SiteHeaderProps = {
    menuOpen: boolean;
    onToggleMenu: () => void;
    onCloseMenu: () => void;
};

const MOBILE_NAV_LINKS = [
    { href: "#inicio", label: "Início" },
    { href: "#como-funciona", label: "Como funciona" },
    { href: "#ferramentas", label: "Módulos" },
    { href: ROUTES.biblioteca, label: "Biblioteca" },
    { href: ROUTES.atlas, label: "Mapa da aprendizagem" },
] as const;

function getCurrentMenuItem(): MenuItemKey {
    const hash = window.location.hash;

    switch (hash) {
        case "#como-funciona":
            return "como-funciona";

        case "#ferramentas":
            return "modulos";

        default:
            return "inicio";
    }
}

export default function SiteHeader({
    menuOpen,
    onToggleMenu,
    onCloseMenu,
}: SiteHeaderProps) {
    const [activeMenu, setActiveMenu] =
        useState<MenuItemKey>("inicio");

    useEffect(() => {
        const handleHashChange = () => {
            setActiveMenu(getCurrentMenuItem());
        };

        handleHashChange();

        window.addEventListener(
            "hashchange",
            handleHashChange
        );

        return () => {
            window.removeEventListener(
                "hashchange",
                handleHashChange
            );
        };
    }, []);

    const handleMenuSelect = (key: MenuItemKey) => {
        setActiveMenu(key);
    };

    const handleMobileLinkClick = (
        href: string
    ) => {
        if (href === "#inicio") {
            setActiveMenu("inicio");
        }

        if (href === "#como-funciona") {
            setActiveMenu("como-funciona");
        }

        if (href === "#ferramentas") {
            setActiveMenu("modulos");
        }

        onCloseMenu();
    };

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

                <AnimatedMenuBar
                    active={activeMenu}
                    onSelect={handleMenuSelect}
                />

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
                        menuOpen
                            ? "Fechar menu"
                            : "Abrir menu"
                    }
                    aria-expanded={menuOpen}
                    onClick={onToggleMenu}
                >
                    {menuOpen ? (
                        <IconClose />
                    ) : (
                        <IconMenu />
                    )}
                </button>
            </header>

            {menuOpen && (
                <div className="mobile-menu">
                    {MOBILE_NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={() =>
                                handleMobileLinkClick(
                                    link.href
                                )
                            }
                        >
                            {link.label}
                        </a>
                    ))}

                    <a
                        href={ROUTES.login}
                        onClick={onCloseMenu}
                    >
                        Área do Aluno
                    </a>

                    <a
                        href={ROUTES.aura}
                        onClick={onCloseMenu}
                    >
                        AURA AI
                    </a>
                </div>
            )}
        </>
    );
}
