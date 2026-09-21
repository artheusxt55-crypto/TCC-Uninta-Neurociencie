import { useCallback, useEffect, useState } from "react";

import { usePerformanceMode } from "../hooks/usePerformanceMode";
import { useCookieConsent } from "../hooks/useCookieConsent";
import { useReveal } from "../hooks/useReveal";

import type { ModuleId } from "../components/home/content";

import HomeBackground from "../components/home/HomeBackground";
import SiteHeader from "../components/home/SiteHeader";
import Hero from "../components/home/Hero";
import Platform from "../components/home/Platform";
import Problem from "../components/home/Problem";
import Journey from "../components/home/Journey";
import Modules from "../components/home/Modules";
import Aura from "../components/home/Aura";
import Knowledge from "../components/home/Knowledge";
import Ecosystem from "../components/home/Ecosystem";
import KnowledgeMotion from "../components/home/KnowledgeMotion";
import Closing from "../components/home/Closing";
import SiteFooter from "../components/home/SiteFooter";
import ToolPanels from "../components/home/ToolPanels";
import CookieBanner from "../components/home/CookieBanner";

/* =========================================================
 * HOME — APRESENTAÇÃO INTERATIVA DO EDUCACUBE
 *
 * Narrativa (cada seção responde a uma pergunta):
 *   01 Hero            — o que é, em uma frase
 *   02 Plataforma      — o que é, para quem
 *   03 Problema        — por que existe
 *   04 Jornada         — como funciona
 *   05 Módulos         — quais ferramentas existem
 *   06 AURA            — qual o papel da IA
 *   07 Conhecimento    — BNCC, biblioteca e referências
 *   08 Ecossistema     — como tudo se conecta
 *   09 Encerramento
 * ========================================================= */

export default function LabPage() {
    const performanceMode = usePerformanceMode();
    const isFull = performanceMode === "full";

    const [activeModule, setActiveModule] = useState<ModuleId | null>(
        null
    );

    const [menuOpen, setMenuOpen] = useState(false);

    const cookies = useCookieConsent();

    useReveal(isFull);

    const openModule = useCallback((id: ModuleId) => {
        setActiveModule(id);
    }, []);

    const closeModule = useCallback(() => {
        setActiveModule(null);
    }, []);

    /* Tecla ESC fecha painel e menu */

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setActiveModule(null);
                setMenuOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () =>
            document.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <>
            <SiteHeader
                menuOpen={menuOpen}
                onToggleMenu={() => setMenuOpen((value) => !value)}
                onCloseMenu={() => setMenuOpen(false)}
            />

            <HomeBackground />

            <main className="main-container">
                <Hero isFull={isFull} />

                <Platform />

                <Problem />

                <Journey onOpenModule={openModule} />

                <Modules onOpenModule={openModule} />

                <Aura />

                <Knowledge onOpenModule={openModule} />

                <Ecosystem onOpenModule={openModule} />

                {isFull && <KnowledgeMotion />}

                <Closing />
            </main>

            <SiteFooter />

            <div
                className={`overlay ${activeModule ? "active" : ""}`}
                onClick={closeModule}
            />

            <ToolPanels
                activeModule={activeModule}
                onClose={closeModule}
            />

            {cookies.showBanner && (
                <CookieBanner
                    onChoose={cookies.saveChoice}
                    onConfigure={cookies.openSettings}
                />
            )}
        </>
    );
}
