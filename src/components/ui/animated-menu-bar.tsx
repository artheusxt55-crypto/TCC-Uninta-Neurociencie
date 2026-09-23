import React from "react";
import {
    Home,
    Layers3,
    Library,
    Map,
    Sparkles,
} from "lucide-react";

export type MenuItemKey =
    | "inicio"
    | "como-funciona"
    | "modulos"
    | "biblioteca"
    | "mapa";

interface AnimatedMenuBarProps {
    active?: MenuItemKey;
    onSelect?: (key: MenuItemKey) => void;
}

interface MenuItem {
    key: MenuItemKey;
    label: string;
    icon: React.ReactNode;
    href: string;
}

const MENU_ITEMS: MenuItem[] = [
    {
        key: "inicio",
        label: "Início",
        icon: <Home size={17} strokeWidth={1.7} />,
        href: "#inicio",
    },
    {
        key: "como-funciona",
        label: "Como funciona",
        icon: <Sparkles size={17} strokeWidth={1.7} />,
        href: "#como-funciona",
    },
    {
        key: "modulos",
        label: "Módulos",
        icon: <Layers3 size={17} strokeWidth={1.7} />,
        href: "#ferramentas",
    },
    {
        key: "biblioteca",
        label: "Biblioteca",
        icon: <Library size={17} strokeWidth={1.7} />,
        href: "/biblioteca",
    },
    {
        key: "mapa",
        label: "Mapa da aprendizagem",
        icon: <Map size={17} strokeWidth={1.7} />,
        href: "/atlas",
    },
];

interface MenuItemButtonProps {
    item: MenuItem;
    active: boolean;
    hovered: boolean;
    onHover: (key: MenuItemKey) => void;
    onLeave: () => void;
    onSelect?: (key: MenuItemKey) => void;
}

function MenuItemButton({
    item,
    active,
    hovered,
    onHover,
    onLeave,
    onSelect,
}: MenuItemButtonProps) {
    const expanded = active || hovered;

    const handleClick = (
        event: React.MouseEvent<HTMLAnchorElement>
    ) => {
        onSelect?.(item.key);

        if (item.href.startsWith("#")) {
            const target = document.querySelector(item.href);

            if (target) {
                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

                window.history.replaceState(
                    null,
                    "",
                    item.href
                );
            }
        }
    };

    return (
        <a
            href={item.href}
            className={[
                "educacube-menu-item",
                active ? "is-active" : "",
                hovered ? "is-hovered" : "",
                expanded ? "is-expanded" : "",
            ]
                .filter(Boolean)
                .join(" ")}
            aria-current={active ? "page" : undefined}
            onMouseEnter={() => onHover(item.key)}
            onMouseLeave={onLeave}
            onFocus={() => onHover(item.key)}
            onBlur={onLeave}
            onClick={handleClick}
        >
            <span className="educacube-menu-item__icon">
                {item.icon}
            </span>

            <span
                className={[
                    "educacube-menu-item__label",
                    expanded ? "is-visible" : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                {item.label}
            </span>
        </a>
    );
}

export function AnimatedMenuBar({
    active = "inicio",
    onSelect,
}: AnimatedMenuBarProps) {
    const [hoveredItem, setHoveredItem] =
        React.useState<MenuItemKey | null>(null);

    const [confirmedHover, setConfirmedHover] =
        React.useState<MenuItemKey | null>(null);

    const hoverTimer = React.useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    const leaveTimer = React.useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    const clearTimers = () => {
        if (hoverTimer.current) {
            clearTimeout(hoverTimer.current);
            hoverTimer.current = null;
        }

        if (leaveTimer.current) {
            clearTimeout(leaveTimer.current);
            leaveTimer.current = null;
        }
    };

    const handleHover = (key: MenuItemKey) => {
        clearTimers();

        /*
         * Se o usuário apenas atravessar o menu,
         * não abrimos cada item instantaneamente.
         *
         * O item só expande se o cursor permanecer
         * sobre ele.
         */
        setHoveredItem(key);

        hoverTimer.current = setTimeout(() => {
            setConfirmedHover(key);
        }, 260);
    };

    const handleLeave = () => {
        clearTimers();

        setHoveredItem(null);

        /*
         * Pequena tolerância antes de fechar.
         */
        leaveTimer.current = setTimeout(() => {
            setConfirmedHover(null);
        }, 180);
    };

    React.useEffect(() => {
        return () => {
            clearTimers();
        };
    }, []);

    return (
        <nav
            className="educacube-animated-menu"
            aria-label="Navegação principal"
            onMouseLeave={handleLeave}
        >
            {MENU_ITEMS.map((item) => (
                <MenuItemButton
                    key={item.key}
                    item={item}
                    active={active === item.key}
                    hovered={
                        hoveredItem === item.key &&
                        confirmedHover === item.key
                    }
                    onHover={handleHover}
                    onLeave={() => {
                        /*
                         * Não fechamos imediatamente ao mudar
                         * de um item para outro.
                         *
                         * O menu permanece estável até o cursor
                         * realmente sair da área do menu.
                         */
                    }}
                    onSelect={onSelect}
                />
            ))}
        </nav>
    );
}

export default AnimatedMenuBar;
