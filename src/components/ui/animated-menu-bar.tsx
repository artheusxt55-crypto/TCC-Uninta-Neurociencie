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
    onSelect?: (key: MenuItemKey) => void;
}

function MenuItemButton({
    item,
    active,
    onSelect,
}: MenuItemButtonProps) {
    const [hovered, setHovered] = React.useState(false);

    const enterTimer = React.useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    const leaveTimer = React.useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    const expanded = active || hovered;

    const clearTimers = () => {
        if (enterTimer.current) {
            clearTimeout(enterTimer.current);
            enterTimer.current = null;
        }

        if (leaveTimer.current) {
            clearTimeout(leaveTimer.current);
            leaveTimer.current = null;
        }
    };

    const handleMouseEnter = () => {
        clearTimers();

        /*
         * Pequeno atraso antes de abrir.
         * Isso impede que o menu reaja a
         * movimentos acidentais do mouse.
         */
        enterTimer.current = setTimeout(() => {
            setHovered(true);
        }, 180);
    };

    const handleMouseLeave = () => {
        clearTimers();

        /*
         * O fechamento também espera um pouco.
         * Isso cria uma sensação mais estável.
         */
        leaveTimer.current = setTimeout(() => {
            setHovered(false);
        }, 140);
    };

    const handleFocus = () => {
        clearTimers();
        setHovered(true);
    };

    const handleBlur = () => {
        clearTimers();
        setHovered(false);
    };

    React.useEffect(() => {
        return () => {
            clearTimers();
        };
    }, []);

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
                expanded ? "is-expanded" : "",
            ]
                .filter(Boolean)
                .join(" ")}
            aria-current={active ? "page" : undefined}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
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
    return (
        <nav
            className="educacube-animated-menu"
            aria-label="Navegação principal"
        >
            {MENU_ITEMS.map((item) => (
                <MenuItemButton
                    key={item.key}
                    item={item}
                    active={active === item.key}
                    onSelect={onSelect}
                />
            ))}
        </nav>
    );
}

export default AnimatedMenuBar;
