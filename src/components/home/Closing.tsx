import { ROUTES } from "./content";

/** Seção 09 — Encerramento. */
export default function Closing() {
    return (
        <section
            className="section closing"
            id="encerramento"
            aria-labelledby="closing-title"
        >
            <div className="wrap closing__inner">
                <h2
                    id="closing-title"
                    className="closing__statement"
                    data-reveal
                >
                    Uma plataforma para transformar conhecimento em
                    prática pedagógica.
                </h2>

                <div
                    className="closing__actions"
                    data-reveal
                >
                    <a
                        href={ROUTES.login}
                        className="btn-solid"
                    >
                        Entrar na plataforma
                    </a>

                    <a
                        href="#ferramentas"
                        className="btn-ghost btn-ghost--lg"
                    >
                        Ver os módulos
                    </a>
                </div>
            </div>
        </section>
    );
}
