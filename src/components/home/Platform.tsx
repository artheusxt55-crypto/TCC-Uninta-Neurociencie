import { AUDIENCE, STAGES } from "./content";

/** Seção 02 — O que é o EducaCube, para quem, e o ciclo pedagógico. */
export default function Platform() {
    return (
        <section
            className="section platform"
            id="plataforma"
            aria-labelledby="platform-title"
        >
            <div className="wrap">
                <div className="platform__intro">
                    <h2
                        id="platform-title"
                        className="h-section"
                        data-reveal
                    >
                        O que é o EducaCube?
                    </h2>

                    <div
                        className="platform__text"
                        data-reveal
                    >
                        <p className="lead-serif">
                            O EducaCube é uma plataforma educacional
                            que organiza, em um só ambiente, as etapas
                            do trabalho pedagógico: observar a
                            aprendizagem, planejar, buscar fundamento,
                            intervir e acompanhar.
                        </p>

                        <p className="body-muted">
                            Não é uma coleção de ferramentas soltas.
                            Cada módulo continua o trabalho do
                            anterior, e todos partem da mesma base
                            curricular. A plataforma nasce de um
                            laboratório de pesquisa da UNINTA e da
                            prática docente.
                        </p>
                    </div>
                </div>

                <div
                    className="audience"
                    data-reveal
                >
                    <h3 className="h-sub audience__title">
                        Para quem foi criado
                    </h3>

                    <ul className="audience__list">
                        {AUDIENCE.map((item) => (
                            <li
                                key={item.title}
                                className="audience__item"
                            >
                                <strong>{item.title}</strong>

                                <span>{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div
                    className="cycle"
                    data-reveal
                >
                    <h3 className="h-sub cycle__title">
                        O trabalho pedagógico, em um só percurso
                    </h3>

                    <ol className="cycle__track">
                        {STAGES.map((stage) => (
                            <li
                                key={stage.id}
                                className="cycle__item"
                            >
                                <span className="cycle__noun">
                                    {stage.noun}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
