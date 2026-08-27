import React, { useState } from "react";
import {
    ArrowRight,
    Brain,
    GraduationCap,
    UserRound,
} from "lucide-react";

const profiles = [
    {
        id: "professor",
        label: "Professor",
        icon: GraduationCap,
    },
    {
        id: "aluno",
        label: "Aluno",
        icon: UserRound,
    },
];

const marqueeItems = [
    "BNCC",
    "Neurociência aplicada",
    "Diagnóstico pedagógico",
    "Inteligência Artificial",
    "Planejamento pedagógico",
    "Intervenção pedagógica",
    "Mapa da aprendizagem",
    "Biblioteca digital",
];

const allItems = [...marqueeItems, ...marqueeItems];

export default function AccessHero() {
    const [profile, setProfile] = useState(profiles[0]);

    return (
        <section className="access-hero">

            <div className="access-container">

                <div className="access-grid">

                    {/* ESQUERDA */}

                    <div className="access-content">

                        <div className="access-badge">
                            🧠 INTELIGÊNCIA ARTIFICIAL ·
                            NEUROCIÊNCIA · BNCC
                        </div>

                        <h1>
                            Aqui Você{" "}
                            <span>
                                Aprende e Ensina.
                            </span>
                        </h1>

                        <p className="access-description">
                            O Neuro-EDU é uma plataforma
                            pedagógica inteligente que apoia
                            professores e alunos no diagnóstico,
                            planejamento e intervenção com base
                            na BNCC e na neurociência.
                        </p>

                        {/* PERFIL */}

                        <div className="profile-selector">

                            {profiles.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() =>
                                            setProfile(item)
                                        }
                                        className={
                                            profile.id === item.id
                                                ? "profile-button active"
                                                : "profile-button"
                                        }
                                    >
                                        <Icon size={15} />

                                        {item.label}
                                    </button>
                                );
                            })}

                        </div>

                        {/* TECNOLOGIAS */}

                        <div className="access-features">

                            <Brain size={16} />

                            <span>
                                <strong>
                                    IA pedagógica
                                </strong>{" "}
                                ·{" "}
                                <strong>
                                    Neurociência aplicada
                                </strong>{" "}
                                ·{" "}
                                <strong>
                                    Baseado na BNCC
                                </strong>
                            </span>

                        </div>

                        {/* MARQUEE */}

                        <div className="marquee-wrapper">

                            <div className="marquee-track">

                                {allItems.map(
                                    (item, index) => (
                                        <span
                                            key={index}
                                        >
                                            {item}
                                        </span>
                                    )
                                )}

                            </div>

                        </div>

                    </div>

                    {/* DIREITA */}

                    <div className="access-visual">

                        <div className="access-shape" />

                        <div className="access-card">

                            <div className="access-card-header">

                                <span className="card-icon">
                                    <Brain size={18} />
                                </span>

                                <h2>
                                    Acessar plataforma
                                </h2>

                            </div>

                            <p className="card-subtitle">
                                Entrar como{" "}
                                <strong>
                                    {profile.label}
                                </strong>
                            </p>

                            <div className="fake-input">
                                Usuário / E-mail
                            </div>

                            <div className="fake-input">
                                Senha
                            </div>

                            <button className="access-button">
                                Entrar

                                <ArrowRight
                                    size={18}
                                />
                            </button>

                            <div className="access-divider">
                                <span>ou</span>
                            </div>

                            <button className="register-button">
                                Criar conta
                            </button>

                        </div>

                        <div className="access-caption">
                            Acesso ao Neuro-EDU
                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}
