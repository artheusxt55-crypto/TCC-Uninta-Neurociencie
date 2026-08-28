```tsx
import "./styles/neuro-edu.css";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type VideoIndex = 0 | 1 | 2;

type ModuleName =
  | "diagnostico"
  | "bncc"
  | "planejamento"
  | "intervencao"
  | null;

type Resultados = {
  diagnostico?: string;
  bncc?: string;
  planejamento?: string;
  intervencao?: string;
};

const ANOS = Array.from({ length: 9 }, (_, i) => `${i + 1}º Ano`);

function App() {
  const brainViewportRef = useRef<HTMLDivElement | null>(null);
  const videosRef = useRef<(HTMLVideoElement | null)[]>([]);
  const transitioningRef = useRef(false);
  const transitionTimeoutRef = useRef<number | null>(null);
  const currentVideoRef = useRef<VideoIndex>(0);

  const [currentVideo, setCurrentVideo] = useState<VideoIndex>(0);
  const [activeModule, setActiveModule] = useState<ModuleName>(null);

  const [idInput, setIdInput] = useState("");
  const [diagDescricao, setDiagDescricao] = useState("");
  const [buscaBNCC, setBuscaBNCC] = useState("");
  const [temaPlano, setTemaPlano] = useState("");
  const [objetivoPlano, setObjetivoPlano] = useState("");
  const [necessidadeIntervencao, setNecessidadeIntervencao] = useState("");
  const [contextoIntervencao, setContextoIntervencao] = useState("");

  const [resultado, setResultado] = useState<Resultados>({});
  const [accessError, setAccessError] = useState(false);

  const [modelStatus, setModelStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");

  useEffect(() => {
    currentVideoRef.current = currentVideo;
  }, [currentVideo]);

  useEffect(() => {
    const videos = videosRef.current.filter(
      (video): video is HTMLVideoElement => video !== null
    );

    if (!videos.length) return;

    videos.forEach((video, index) => {
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.loop = index === 2;
    });

    const firstVideo = videos[0];

    firstVideo.currentTime = 0;
    firstVideo.classList.add("active");

    firstVideo.play().catch(() => {
      console.warn("O navegador bloqueou o autoplay.");
    });

    const cleanups: Array<() => void> = [];

    videos.forEach((video, index) => {
      if (index === 2) return;

      const handleEnded = () => {
        if (index !== currentVideoRef.current) return;
        if (transitioningRef.current) return;

        const nextIndex = (index + 1) as VideoIndex;
        const nextVideo = videos[nextIndex];

        if (!nextVideo) return;

        transitioningRef.current = true;
        nextVideo.currentTime = 0;

        nextVideo
          .play()
          .then(() => {
            nextVideo.classList.add("active");

            transitionTimeoutRef.current = window.setTimeout(() => {
              video.classList.remove("active");
              video.pause();
              video.currentTime = 0;

              setCurrentVideo(nextIndex);

              transitioningRef.current = false;
            }, 1400);
          })
          .catch(() => {
            transitioningRef.current = false;
          });
      };

      video.addEventListener("ended", handleEnded);

      cleanups.push(() => {
        video.removeEventListener("ended", handleEnded);
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());

      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModule();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const container = brainViewportRef.current;

    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scene = new THREE.Scene();

    scene.fog = new THREE.FogExp2(0x090614, 0.045);

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(
      35,
      width / height,
      0.1,
      1000
    );

    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setSize(width, height);

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // ILUMINAÇÃO

    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      0.8
    );

    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(
      0xffffff,
      1.8
    );

    mainLight.position.set(5, 5, 10);

    scene.add(mainLight);

    const goldLight = new THREE.PointLight(
      0xc4a265,
      0.9
    );

    goldLight.position.set(-5, -2, 5);

    scene.add(goldLight);

    // PARTÍCULAS

    const partGeo = new THREE.BufferGeometry();

    const partCount = 700;

    const positions = new Float32Array(
      partCount * 3
    );

    for (let i = 0; i < partCount * 3; i++) {
      positions[i] =
        (Math.random() - 0.5) * 15;
    }

    partGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    const partMat = new THREE.PointsMaterial({
      size: 0.022,
      color: 0xc4a265,
      transparent: true,
      opacity: 0.28,
    });

    const particles = new THREE.Points(
      partGeo,
      partMat
    );

    scene.add(particles);

    // MODELO 3D

    let brain: THREE.Object3D | null = null;

    let targetX = 0;
    let targetY = 0;

    let entradaInicio: number | null = null;

    let entradaFinalizada = false;

    const modelURL =
      "https://kczzuvkuubeqdokjihrm.supabase.co/storage/v1/object/public/modelos%203d/Corujafinal.glb";

    const loader = new GLTFLoader();

    loader.load(
      modelURL,

      (gltf) => {
        brain = gltf.scene;

        brain.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
          }
        });

        brain.scale.set(
          0.01,
          0.01,
          0.01
        );

        brain.position.set(
          0,
          -0.8,
          0
        );

        brain.rotation.set(
          0,
          -0.35,
          0
        );

        scene.add(brain);

        entradaInicio = performance.now();

        entradaFinalizada = false;

        setModelStatus("ready");
      },

      undefined,

      (error) => {
        console.error(
          "Erro ao carregar Corujafinal.glb:",
          error
        );

        setModelStatus("error");
      }
    );

    // MOUSE / PARALAXE

    const handleMouseMove = (
      event: MouseEvent
    ) => {
      if (prefersReducedMotion) return;

      const mouseX =
        event.clientX /
          window.innerWidth -
        0.5;

      const mouseY =
        event.clientY /
          window.innerHeight -
        0.5;

      targetX = mouseX * 0.16;
      targetY = mouseY * 0.1;
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    // ANIMAÇÃO

    let animationFrame = 0;

    const animate = (now: number) => {
      animationFrame =
        requestAnimationFrame(
          animate
        );

      if (!prefersReducedMotion) {
        particles.rotation.y +=
          0.0007;

        particles.rotation.x +=
          0.0001;
      }

      if (
        brain &&
        !entradaFinalizada &&
        entradaInicio !== null
      ) {
        const duracao = 1700;

        const tempo =
          now - entradaInicio;

        const progresso = Math.min(
          tempo / duracao,
          1
        );

        const ease =
          1 -
          Math.pow(
            1 - progresso,
            4
          );

        const escala =
          1.45 * ease;

        brain.scale.set(
          escala,
          escala,
          escala
        );

        brain.position.y =
          -0.8 + 0.8 * ease;

        brain.rotation.y =
          -0.35 + 0.35 * ease;

        brain.rotation.z =
          Math.sin(
            progresso * Math.PI
          ) * 0.035;

        if (progresso >= 1) {
          entradaFinalizada = true;

          entradaInicio = null;

          brain.position.y = 0;
        }
      }

      if (
        brain &&
        entradaFinalizada
      ) {
        brain.position.y =
          prefersReducedMotion
            ? 0
            : Math.sin(
                now * 0.0014
              ) * 0.045;

        brain.rotation.y +=
          0.035 *
          (targetX -
            brain.rotation.y);

        brain.rotation.x +=
          0.025 *
          (targetY -
            brain.rotation.x);

        brain.rotation.z =
          prefersReducedMotion
            ? 0
            : Math.sin(
                now * 0.0009
              ) * 0.025;
      }

      renderer.render(
        scene,
        camera
      );
    };

    animationFrame =
      requestAnimationFrame(
        animate
      );

    // RESPONSIVIDADE

    const handleResize = () => {
      const newWidth =
        container.clientWidth;

      const newHeight =
        container.clientHeight;

      if (
        newWidth <= 0 ||
        newHeight <= 0
      ) {
        return;
      }

      camera.aspect =
        newWidth /
        newHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        newWidth,
        newHeight
      );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      if (
        renderer.domElement
          .parentNode === container
      ) {
        container.removeChild(
          renderer.domElement
        );
      }

      renderer.dispose();

      partGeo.dispose();

      partMat.dispose();

      scene.clear();
    };
  }, []);

  const openModule = (
    name: Exclude<
      ModuleName,
      null
    >
  ) => {
    setActiveModule(name);
  };

  const closeModule = () => {
    setActiveModule(null);
  };

  const executarDiagnostico =
    () => {
      if (
        !diagDescricao.trim()
      ) {
        alert(
          "Descreva a necessidade observada."
        );

        return;
      }

      setResultado(
        (prev) => ({
          ...prev,

          diagnostico:
            "A interface está funcionando. A integração com a IA ainda precisa ser conectada ao backend.",
        })
      );
    };

  const consultarBNCC = () => {
    if (
      !buscaBNCC.trim()
    ) {
      alert(
        "Digite algo para pesquisar."
      );

      return;
    }

    setResultado(
      (prev) => ({
        ...prev,

        bncc:
          "A interface de consulta está funcionando. A base BNCC ainda precisa ser conectada.",
      })
    );
  };

  const gerarPlano = () => {
    if (
      !temaPlano.trim() ||
      !objetivoPlano.trim()
    ) {
      alert(
        "Informe o tema e o objetivo."
      );

      return;
    }

    setResultado(
      (prev) => ({
        ...prev,

        planejamento:
          "O formulário está funcionando. A geração automática ainda precisa da integração com a IA.",
      })
    );
  };

  const gerarIntervencao =
    () => {
      if (
        !necessidadeIntervencao.trim()
      ) {
        alert(
          "Informe a necessidade identificada."
        );

        return;
      }

      setResultado(
        (prev) => ({
          ...prev,

          intervencao:
            "O módulo está funcionando. A geração da estratégia ainda precisa da integração com a IA.",
        })
      );
    };

  const validarAcesso = () => {
    const valor =
      idInput
        .trim()
        .toUpperCase();

    if (
      valor === "MATH001" ||
      valor.startsWith("PAC")
    ) {
      window.location.href =
        "/aluno.html";

      return;
    }

    setAccessError(true);
  };

  return (
    <>
      {/* VÍDEOS DE FUNDO */}

      <div
        className="video-background"
        aria-hidden="true"
      >
        <video
          ref={(el) => {
            videosRef.current[0] =
              el;
          }}
          className={`bg-video ${
            currentVideo === 0
              ? "active"
              : ""
          }`}
          src="/athenaslivro.mp4"
          muted
          playsInline
          preload="auto"
        />

        <video
          ref={(el) => {
            videosRef.current[1] =
              el;
          }}
          className={`bg-video ${
            currentVideo === 1
              ? "active"
              : ""
          }`}
          src="/maos%20mexendo.mp4"
          muted
          playsInline
          preload="auto"
        />

        <video
          ref={(el) => {
            videosRef.current[2] =
              el;
          }}
          className={`bg-video ${
            currentVideo === 2
              ? "active"
              : ""
          }`}
          src="/cubo.mp4"
          muted
          playsInline
          preload="auto"
          loop
        />
      </div>

      <div
        className="video-overlay"
        aria-hidden="true"
      />

      <div
        className="video-purple-glow"
        aria-hidden="true"
      />

      <div
        className="architectural-grid"
        aria-hidden="true"
      />

      <div
        className="side-line"
        aria-hidden="true"
      >
        <span>
          Laboratório Pedagógico
        </span>
      </div>

      <div
        className="grain"
        aria-hidden="true"
      />

      {/* ÁREA DO ALUNO */}

      <a
        href="/aluno.html"
        className="btn-aluno-fixo"
      >
        Área do Aluno
      </a>

      {/* CONTEÚDO PRINCIPAL */}

      <main className="main-container">

        <div className="institution-marker">
          <span />

          Laboratório de Pesquisa
          e Práticas Pedagógicas
        </div>

        <section className="card">

          <div className="brand">
            <div
              className="brand-icon"
              aria-hidden="true"
            />

            <span>
              Neuro-Educa · UNINTA
            </span>
          </div>

          <div className="system-status">
            <span className="system-dot" />

            Laboratório aberto
          </div>

          <div className="avatar-3d">
            <spline-viewer
              url="/genkub_greeting_robot.spline"
            />
          </div>

          <h2>
            Laboratório Pedagógico
          </h2>

          <p className="subtitle">
            Um espaço de trabalho
            para diagnóstico,
            planejamento, consulta
            curricular e intervenção —
            construído a partir da
            prática docente, não no
            lugar dela.
          </p>

          <label
            className="field-label"
            htmlFor="idInput"
          >
            Identificação
          </label>

          <input
            type="text"
            id="idInput"
            value={idInput}
            onChange={(event) => {
              setIdInput(
                event.target.value
              );

              if (accessError) {
                setAccessError(false);
              }
            }}
            placeholder="Digite seu ID de acesso"
            autoComplete="off"
            aria-invalid={accessError}
            aria-describedby={
              accessError
                ? "idInput-erro"
                : undefined
            }
          />

          {accessError && (
            <p
              id="idInput-erro"
              className="field-error"
              role="alert"
            >
              ID de acesso inválido.
              Verifique e tente
              novamente.
            </p>
          )}

          <button
            type="button"
            className="btn-neuro"
            onClick={validarAcesso}
          >
            Entrar no laboratório
          </button>

          <a
            href="/biblioteca.html"
            className="btn-library"
          >
            Biblioteca digital
          </a>

          <a
            href="/atlas.html"
            className="btn-atlas"
          >
            Explorar o mapa da
            aprendizagem
          </a>

          {/* MÓDULOS */}

          <div className="tool-grid">

            <button
              type="button"
              className="tool-card"
              onClick={() =>
                openModule(
                  "diagnostico"
                )
              }
            >
              <span
                className="tool-card-mark"
                aria-hidden="true"
              >
                I
              </span>

              <h4>
                Diagnóstico
              </h4>

              <p>
                Leitura do processo
                de aprendizagem.
              </p>
            </button>

            <button
              type="button"
              className="tool-card"
              onClick={() =>
                openModule("bncc")
              }
            >
              <span
                className="tool-card-mark"
                aria-hidden="true"
              >
                II
              </span>

              <h4>BNCC</h4>

              <p>
                Consulta à base
                curricular.
              </p>
            </button>

            <button
              type="button"
              className="tool-card"
              onClick={() =>
                openModule(
                  "planejamento"
                )
              }
            >
              <span
                className="tool-card-mark"
                aria-hidden="true"
              >
                III
              </span>

              <h4>
                Planejamento
              </h4>

              <p>
                Construção de planos
                de aula.
              </p>
            </button>

            <button
              type="button"
              className="tool-card"
              onClick={() =>
                openModule(
                  "intervencao"
                )
              }
            >
              <span
                className="tool-card-mark"
                aria-hidden="true"
              >
                IV
              </span>

              <h4>
                Intervenção
              </h4>

              <p>
                Estratégias
                pedagógicas dirigidas.
              </p>
            </button>

          </div>
        </section>

        {/* CORUJA 3D */}

        <section
          id="brain-viewport"
          ref={brainViewportRef}
          data-status={modelStatus}
        >
          <div className="brain-frame">

            <span className="brain-corner brain-corner--tl" />
            <span className="brain-corner brain-corner--tr" />
            <span className="brain-corner brain-corner--bl" />
            <span className="brain-corner brain-corner--br" />

            <svg
              className="brain-ring"
              viewBox="0 0 400 400"
              aria-hidden="true"
            >
              <defs>

                <path
                  id="brainRingPath"
                  d="M 200,200 m -170,0 a 170,170 0 1,1 340,0 a 170,170 0 1,1 -340,0"
                />

              </defs>

              <text>

                <textPath
                  href="#brainRingPath"
                  startOffset="0%"
                >
                  NEURO-EDUCA · LABORATÓRIO PEDAGÓGICO · UNINTA · SABEDORIA APLICADA ·
                </textPath>

              </text>
            </svg>

            {modelStatus ===
              "loading" && (
              <p className="brain-status">
                Preparando a
                guardiã…
              </p>
            )}

            {modelStatus ===
              "error" && (
              <p className="brain-status brain-status--error">
                Não foi possível
                carregar o modelo
                3D.
              </p>
            )}

          </div>

          <div className="brain-label">
            Guardiã do laboratório

            <strong>
              A coruja de Atena
            </strong>
          </div>
        </section>

      </main>

      {/* OVERLAY */}

      <div
        className={`overlay ${
          activeModule
            ? "active"
            : ""
        }`}
        onClick={closeModule}
        aria-hidden="true"
      />

      {/* DIAGNÓSTICO */}

      <ModulePanel
        id="diagnostico"
        badge="Módulo I"
        title="Diagnóstico da Aprendizagem"
        description="Estrutura preparada para leitura pedagógica assistida."
        isActive={
          activeModule ===
          "diagnostico"
        }
        onClose={closeModule}
      >

        <div className="tool-grid tool-grid--fields">

          <div className="tool-card tool-card--field">

            <label
              className="field-label"
              htmlFor="diag-ano"
            >
              Ano / série
            </label>

            <select
              id="diag-ano"
              defaultValue={ANOS[0]}
            >
              {ANOS.map(
                (ano) => (
                  <option
                    key={ano}
                  >
                    {ano}
                  </option>
                )
              )}
            </select>

          </div>

          <div className="tool-card tool-card--field">

            <label
              className="field-label"
              htmlFor="diag-componente"
            >
              Componente
            </label>

            <select
              id="diag-componente"
              defaultValue="Língua Portuguesa"
            >
              <option>
                Língua Portuguesa
              </option>

              <option>
                Matemática
              </option>

              <option>
                Ciências
              </option>

              <option>
                História
              </option>

              <option>
                Geografia
              </option>
            </select>

          </div>

        </div>

        <label
          className="field-label"
          htmlFor="diag-descricao"
        >
          Habilidade / necessidade
          observada
        </label>

        <textarea
          id="diag-descricao"
          value={diagDescricao}
          onChange={(event) =>
            setDiagDescricao(
              event.target.value
            )
          }
          placeholder="Descreva o que foi observado no processo de aprendizagem..."
        />

        <button
          type="button"
          className="btn-neuro"
          onClick={
            executarDiagnostico
          }
        >
          Analisar
        </button>

        {resultado.diagnostico && (
          <div className="result-box">
            <strong>
              Leitura pedagógica
            </strong>

            <p>
              {resultado.diagnostico}
            </p>
          </div>
        )}

      </ModulePanel>

      {/* BNCC */}

      <ModulePanel
        id="bncc"
        badge="Módulo II"
        title="Consulta Curricular"
        description="Pesquisa de habilidades e organização curricular."
        isActive={
          activeModule ===
          "bncc"
        }
        onClose={closeModule}
      >

        <label
          className="field-label"
          htmlFor="bncc-busca"
        >
          Habilidade ou palavra-chave
        </label>

        <input
          type="text"
          id="bncc-busca"
          value={buscaBNCC}
          onChange={(event) =>
            setBuscaBNCC(
              event.target.value
            )
          }
          placeholder="Ex.: interpretação de texto, frações..."
        />

        <div className="tool-grid">

          <div className="tool-card tool-card--static">
            <h4>
              Habilidades
            </h4>

            <p>
              Consulta estruturada
              de habilidades e
              competências
              curriculares.
            </p>
          </div>

          <div className="tool-card tool-card--static">
            <h4>
              Contexto pedagógico
            </h4>

            <p>
              Use a habilidade
              selecionada como
              referência para suas
              análises.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="btn-neuro"
          onClick={
            consultarBNCC
          }
        >
          Consultar
        </button>

        {resultado.bncc && (
          <div className="result-box">

            <strong>
              Resultado
            </strong>

            <p>
              {resultado.bncc}
            </p>

          </div>
        )}

      </ModulePanel>

      {/* PLANEJAMENTO */}

      <ModulePanel
        id="planejamento"
        badge="Módulo III"
        title="Planejamento Pedagógico"
        description="Estruture objetivos e estratégias para sua prática."
        isActive={
          activeModule ===
          "planejamento"
        }
        onClose={closeModule}
      >

        <label
          className="field-label"
          htmlFor="plano-tema"
        >
          Tema
        </label>

        <input
          id="plano-tema"
          value={temaPlano}
          onChange={(event) =>
            setTemaPlano(
              event.target.value
            )
          }
          placeholder="Ex.: interpretação textual"
        />

        <label
          className="field-label"
          htmlFor="plano-ano"
        >
          Ano / série
        </label>

        <select
          id="plano-ano"
          defaultValue={ANOS[0]}
        >
          {ANOS.map(
            (ano) => (
              <option key={ano}>
                {ano}
              </option>
            )
          )}
        </select>

        <label
          className="field-label"
          htmlFor="plano-objetivo"
        >
          Objetivo
        </label>

        <textarea
          id="plano-objetivo"
          value={objetivoPlano}
          onChange={(event) =>
            setObjetivoPlano(
              event.target.value
            )
          }
          placeholder="O que o aluno deverá desenvolver?"
        />

        <button
          type="button"
          className="btn-neuro"
          onClick={
            gerarPlano
          }
        >
          Gerar planejamento
        </button>

        {resultado.planejamento && (
          <div className="result-box">

            <strong>
              Planejamento
            </strong>

            <p>
              {resultado.planejamento}
            </p>

          </div>
        )}

      </ModulePanel>

      {/* INTERVENÇÃO */}

      <ModulePanel
        id="intervencao"
        badge="Módulo IV"
        title="Intervenção Pedagógica"
        description="Transforme evidências de aprendizagem em estratégias."
        isActive={
          activeModule ===
          "intervencao"
        }
        onClose={closeModule}
      >

        <label
          className="field-label"
          htmlFor="interv-necessidade"
        >
          Necessidade identificada
        </label>

        <textarea
          id="interv-necessidade"
          value={
            necessidadeIntervencao
          }
          onChange={(event) =>
            setNecessidadeIntervencao(
              event.target.value
            )
          }
          placeholder="Descreva a dificuldade ou necessidade observada..."
        />

        <label
          className="field-label"
          htmlFor="interv-contexto"
        >
          Contexto
        </label>

        <textarea
          id="interv-contexto"
          value={
            contextoIntervencao
          }
          onChange={(event) =>
            setContextoIntervencao(
              event.target.value
            )
          }
          placeholder="Informe o contexto da turma ou do estudante..."
        />

        <button
          type="button"
          className="btn-neuro"
          onClick={
            gerarIntervencao
          }
        >
          Propor intervenção
        </button>

        {resultado.intervencao && (
          <div className="result-box">

            <strong>
              Proposta pedagógica
            </strong>

            <p>
              {resultado.intervencao}
            </p>

          </div>
        )}

      </ModulePanel>
    </>
  );
}

function ModulePanel({
  id,
  badge,
  title,
  description,
  isActive,
  onClose,
  children,
}: {
  id: string;
  badge: string;
  title: string;
  description: string;
  isActive: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`tool-panel ${
        isActive
          ? "active"
          : ""
      }`}
      role="dialog"
      aria-modal={isActive}
      aria-hidden={!isActive}
      aria-labelledby={`${id}-title`}
    >
      <div className="tool-header">

        <div>

          <span className="ai-badge">
            {badge}
          </span>

          <h3
            id={`${id}-title`}
          >
            {title}
          </h3>

          <p>
            {description}
          </p>

        </div>

        <button
          type="button"
          className="close-tool"
          onClick={onClose}
          aria-label="Fechar módulo"
        >
          ×
        </button>

      </div>

      {children}

    </div>
  );
}

export default App;
```
