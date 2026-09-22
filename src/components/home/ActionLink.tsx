import type { ReactNode } from "react";

import type { Action, ModuleId } from "./content";

type ActionLinkProps = {
    action: Action;
    onOpenModule: (id: ModuleId) => void;
    className?: string;
    children?: ReactNode;
};

/**
 * Renderiza a mesma ação como <button> (abre o painel de um
 * módulo) ou como <a> (navega para uma rota/página existente).
 * Assim cada seção da Home reutiliza o comportamento real da
 * plataforma, sem duplicar lógica.
 */
export default function ActionLink({
    action,
    onOpenModule,
    className,
    children,
}: ActionLinkProps) {
    if (action.kind === "module") {
        return (
            <button
                type="button"
                className={className}
                onClick={() => onOpenModule(action.id)}
            >
                {children ?? action.label}
            </button>
        );
    }

    return (
        <a
            href={action.href}
            className={className}
        >
            {children ?? action.label}
        </a>
    );
}
