```css
/* ==========================================================================
   NEURO-EDUCA · UNINTA
   Laboratório de Pesquisa e Práticas Pedagógicas

   Direção de design
   ------------------
   Sala de leitura noturna, guardada pela coruja de Atena.

   Linguagem visual:
   - Ouro envelhecido
   - Violeta profundo
   - Tinta noturna
   - Pergaminho
   - Fraunces + IBM Plex
   - Cortes diagonais de ficha catalográfica
   - Medalhão da coruja
   - Grade arquitetônica
   - Textura analógica
   ========================================================================== */


/* ==========================================================================
   FONTES
   ========================================================================== */

@import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap");


/* ==========================================================================
   DESIGN TOKENS
   ========================================================================== */

:root {

  /* ------------------------------------------------------------------------
     CORES — FUNDO
     ------------------------------------------------------------------------ */

  --ink: #0b0a13;
  --surface: #17141f;
  --surface-raised: #1d1929;


  /* ------------------------------------------------------------------------
     CORES — TEXTO
     ------------------------------------------------------------------------ */

  --paper: #ede6d6;
  --paper-dim: #a89c89;
  --paper-faint: #6f6759;


  /* ------------------------------------------------------------------------
     CORES — OURO
     ------------------------------------------------------------------------ */

  --gold: #c7a468;
  --gold-bright: #e6c992;
  --gold-dim: #8a7248;


  /* ------------------------------------------------------------------------
     CORES — VIOLETA
     ------------------------------------------------------------------------ */

  --violet: #6b5490;
  --violet-soft: #443463;


  /* ------------------------------------------------------------------------
     BORDAS / SOMBRAS
     ------------------------------------------------------------------------ */

  --line: rgba(199, 164, 104, 0.16);
  --line-bright: rgba(199, 164, 104, 0.4);

  --shadow-deep: rgba(4, 3, 8, 0.65);


  /* ------------------------------------------------------------------------
     TIPOGRAFIA
     ------------------------------------------------------------------------ */

  --font-display:
    "Fraunces",
    "Iowan Old Style",
    ui-serif,
    Georgia,
    serif;

  --font-body:
    "IBM Plex Sans",
    -apple-system,
    "Segoe UI",
    sans-serif;

  --font-mono:
    "IBM Plex Mono",
    ui-monospace,
    "SFMono-Regular",
    monospace;


  /* ------------------------------------------------------------------------
     FORMA
     ------------------------------------------------------------------------ */

  --cut: 14px;


  /* ------------------------------------------------------------------------
     ANIMAÇÃO
     ------------------------------------------------------------------------ */

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}


/* ==========================================================================
   BASE
   ========================================================================== */

* {
  box-sizing: border-box;
}

html {
  color-scheme: dark;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;

  background: var(--ink);
  color: var(--paper);

  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.5;

  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}


/* ==========================================================================
   ELEMENTOS BASE
   ========================================================================== */

h1,
h2,
h3,
h4 {
  margin: 0;

  font-family: var(--font-display);
  font-weight: 500;

  color: var(--paper);

  letter-spacing: -0.01em;
}

p {
  margin: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
  cursor: pointer;
}


/* ==========================================================================
   CORTE DIAGONAL — ASSINATURA VISUAL
   ========================================================================== */

.card,
.tool-card,
.tool-panel,
.btn-neuro,
.result-box,
.tool-card--field,
.tool-card--static {
  clip-path: polygon(
    var(--cut) 0%,
    100% 0%,
    100% calc(100% - var(--cut)),
    calc(100% - var(--cut)) 100%,
    0% 100%,
    0% var(--cut)
  );
}


/* ==========================================================================
   ACESSIBILIDADE — FOCO
   ========================================================================== */

:focus-visible {
  outline: 2px solid var(--gold-bright);
  outline-offset: 3px;
}


/* ==========================================================================
   CAMADAS DE FUNDO
   ========================================================================== */

.video-background {
  position: fixed;
  inset: 0;

  z-index: 0;

  overflow: hidden;

  background: var(--ink);
}

.bg-video {
  position: absolute;
  inset: 0;

  width: 100%;
  height: 100%;

  object-fit: cover;

  opacity: 0;

  transform: scale(1.04);

  transition:
    opacity 1.1s var(--ease-out),
    transform 6s linear;

  filter:
    saturate(0.75)
    brightness(0.55)
    contrast(1.05);
}

.bg-video.active {
  opacity: 1;
  transform: scale(1);
}


/* ==========================================================================
   OVERLAY DO VÍDEO
   ========================================================================== */

.video-overlay {
  position: fixed;
  inset: 0;

  z-index: 1;

  pointer-events: none;

  background:
    linear-gradient(
      180deg,
      rgba(11, 10, 19, 0.55) 0%,
      rgba(11, 10, 19, 0.82) 60%,
      var(--ink) 100%
    ),
    linear-gradient(
      90deg,
      var(--ink) 0%,
      rgba(11, 10, 19, 0.35) 22%,
      rgba(11, 10, 19, 0.35) 78%,
      var(--ink) 100%
    );
}


/* ==========================================================================
   HALO AMBIENTE
   ========================================================================== */

.ambient-glow {
  position: fixed;
  inset: 0;

  z-index: 1;

  pointer-events: none;

  background:
    radial-gradient(
      760px 520px at 82% 18%,
      rgba(107, 84, 144, 0.32),
      transparent 70%
    ),
    radial-gradient(
      600px 480px at 8% 88%,
      rgba(199, 164, 104, 0.14),
      transparent 72%
    );

  mix-blend-mode: screen;
}


/* ==========================================================================
   GRADE ARQUITETÔNICA
   ========================================================================== */

.architectural-grid {
  position: fixed;
  inset: 0;

  z-index: 1;

  pointer-events: none;

  opacity: 0.5;

  background-image:
    linear-gradient(
      var(--line) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      var(--line) 1px,
      transparent 1px
    );

  background-size: 88px 88px;

  mask-image:
    radial-gradient(
      circle at 50% 40%,
      black,
      transparent 78%
    );
}


/* ==========================================================================
   TEXTURA / GRAIN
   ========================================================================== */

.grain {
  position: fixed;
  inset: 0;

  z-index: 3;

  pointer-events: none;

  opacity: 0.05;

  mix-blend-mode: overlay;

  background-image: url(
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"
  );
}


/* ==========================================================================
   LINHA LATERAL
   ========================================================================== */

.side-line {
  position: fixed;

  z-index: 4;

  left: 28px;
  top: 0;
  bottom: 0;

  width: 1px;

  display: none;

  background:
    linear-gradient(
      180deg,
      transparent 0%,
      var(--line-bright) 18%,
      var(--line-bright) 82%,
      transparent 100%
    );
}

.side-line span {
  position: absolute;

  top: 50%;
  left: 50%;

  transform:
    translate(-50%, -50%)
    rotate(-90deg);

  white-space: nowrap;

  padding: 4px 10px;

  background: var(--ink);

  color: var(--paper-faint);

  font-family: var(--font-mono);
  font-size: 10px;

  letter-spacing: 0.32em;

  text-transform: uppercase;
}

@media (min-width: 1200px) {

  .side-line {
    display: block;
  }

}


/* ==========================================================================
   PARTÍCULAS THREE.JS
   ========================================================================== */

#particles-layer {
  position: fixed;
  inset: 0;

  z-index: 1;

  pointer-events: none;
}


/* ==========================================================================
   BOTÃO FIXO — ÁREA DO ALUNO
   ========================================================================== */

.btn-aluno-fixo {
  position: fixed;

  z-index: 20;

  top: 24px;
  right: 28px;

  padding: 10px 20px;

  border: 1px solid var(--line-bright);

  background: rgba(23, 20, 31, 0.6);

  backdrop-filter: blur(10px);

  color: var(--gold-bright);

  font-family: var(--font-mono);
  font-size: 12px;

  letter-spacing: 0.14em;

  text-transform: uppercase;

  transition:
    border-color 0.25s var(--ease-out),
    background 0.25s var(--ease-out),
    transform 0.25s var(--ease-out);
}

.btn-aluno-fixo:hover {
  border-color: var(--gold);

  background: rgba(199, 164, 104, 0.1);

  transform: translateY(-1px);
}


/* ==========================================================================
   LAYOUT PRINCIPAL
   ========================================================================== */

.main-container {
  position: relative;

  z-index: 2;

  display: grid;

  grid-template-columns:
    minmax(320px, 460px)
    1fr;

  align-items: center;

  gap: clamp(28px, 5vw, 72px);

  min-height: 100vh;

  padding:
    clamp(88px, 10vh, 120px)
    clamp(24px, 6vw, 96px)
    64px
    calc(clamp(24px, 6vw, 96px) + 20px);
}

@media (min-width: 1200px) {

  .main-container {
    padding-left:
      calc(clamp(24px, 6vw, 96px) + 60px);
  }

}


/* ==========================================================================
   MARCADOR INSTITUCIONAL
   ========================================================================== */

.institution-marker {
  grid-column: 1 / -1;

  display: flex;

  align-items: center;

  gap: 10px;

  margin-bottom: 4px;

  color: var(--paper-faint);

  font-family: var(--font-mono);
  font-size: 11px;

  letter-spacing: 0.24em;

  text-transform: uppercase;
}

.institution-marker span {
  width: 6px;
  height: 6px;

  flex-shrink: 0;

  background: var(--gold);

  transform: rotate(45deg);
}


/* ==========================================================================
   CARTÃO PRINCIPAL
   ========================================================================== */

.card {
  position: relative;

  display: flex;

  flex-direction: column;

  gap: 14px;

  padding: clamp(28px, 3vw, 40px);

  background:
    linear-gradient(
      165deg,
      var(--surface-raised) 0%,
      var(--surface) 100%
    );

  border: 1px solid var(--line);

  box-shadow:
    0 40px 80px -30px var(--shadow-deep);
}


/* ==========================================================================
   MARCA
   ========================================================================== */

.brand {
  display: flex;

  align-items: center;

  gap: 10px;

  margin-bottom: 2px;
}

.brand-icon {
  position: relative;

  width: 20px;
  height: 20px;

  flex-shrink: 0;

  background:
    linear-gradient(
      135deg,
      var(--gold-bright),
      var(--gold-dim)
    );

  transform: rotate(45deg);
}

.brand-icon::after {
  content: "";

  position: absolute;

  inset: 5px;

  background: var(--surface);
}

.brand span {
  color: var(--paper-dim);

  font-family: var(--font-mono);
  font-size: 12px;

  letter-spacing: 0.18em;

  text-transform: uppercase;
}


/* ==========================================================================
   STATUS DO SISTEMA
   ========================================================================== */

.system-status {
  position: absolute;

  top: clamp(28px, 3vw, 40px);
  right: clamp(28px, 3vw, 40px);

  display: flex;

  align-items: center;

  gap: 7px;

  color: var(--paper-dim);

  font-family: var(--font-mono);
  font-size: 11px;

  letter-spacing: 0.08em;
}

.system-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: var(--gold-bright);

  box-shadow:
    0 0 0 0 rgba(230, 201, 146, 0.55);

  animation:
    pulse-dot 2.4s ease-out infinite;
}

@keyframes pulse-dot {

  0% {
    box-shadow:
      0 0 0 0
      rgba(230, 201, 146, 0.5);
  }

  75% {
    box-shadow:
      0 0 0 8px
      rgba(230, 201, 146, 0);
  }

  100% {
    box-shadow:
      0 0 0 0
      rgba(230, 201, 146, 0);
  }

}


/* ==========================================================================
   AVATAR 3D
   ========================================================================== */

.avatar-3d {
  width: 96px;
  height: 96px;

  margin: 4px 0 8px;

  overflow: hidden;

  border: 1px solid var(--line-bright);

  border-radius: 50%;

  background:
    radial-gradient(
      circle at 35% 30%,
      var(--violet-soft),
      var(--ink) 75%
    );
}

.avatar-3d spline-viewer {
  display: block;

  width: 100%;
  height: 100%;
}


/* ==========================================================================
   TÍTULO
   ========================================================================== */

.card h2 {
  font-size: clamp(28px, 3vw, 36px);

  line-height: 1.08;
}


/* ==========================================================================
   SUBTÍTULO
   ========================================================================== */

.subtitle {
  max-width: 46ch;

  margin-bottom: 6px;

  color: var(--paper-dim);

  font-size: 14.5px;

  line-height: 1.65;
}


/* ==========================================================================
   CAMPOS
   ========================================================================== */

.field-label {
  margin-top: 6px;

  color: var(--gold);

  font-family: var(--font-mono);
  font-size: 10.5px;

  letter-spacing: 0.16em;

  text-transform: uppercase;
}

.field-error {
  margin-top: -6px;

  color: #d98a76;

  font-family: var(--font-mono);
  font-size: 11.5px;
}


/* ==========================================================================
   INPUTS
   ========================================================================== */

input,
select,
textarea {
  width: 100%;

  padding: 9px 2px;

  background: transparent;

  border: none;

  border-bottom: 1px solid var(--line-bright);

  color: var(--paper);

  font-family: var(--font-body);
  font-size: 15px;

  transition:
    border-color 0.2s var(--ease-out),
    background 0.2s var(--ease-out);
}

textarea {
  min-height: 84px;

  resize: vertical;

  line-height: 1.55;
}

input::placeholder,
textarea::placeholder {
  color: var(--paper-faint);
}

input:hover,
select:hover,
textarea:hover {
  border-bottom-color: var(--gold-dim);
}

input:focus,
select:focus,
textarea:focus {
  outline: none;

  border-bottom-color: var(--gold-bright);

  background:
    rgba(199, 164, 104, 0.05);
}


/* ==========================================================================
   SELECT
   ========================================================================== */

select {
  appearance: none;

  background-image:
    linear-gradient(
      45deg,
      transparent 50%,
      var(--gold) 50%
    ),
    linear-gradient(
      135deg,
      var(--gold) 50%,
      transparent 50%
    );

  background-position:
    calc(100% - 14px) 16px,
    calc(100% - 8px) 16px;

  background-size: 6px 6px;

  background-repeat: no-repeat;
}


/* ==========================================================================
   BOTÃO PRINCIPAL
   ========================================================================== */

.btn-neuro {
  margin-top: 8px;

  padding: 13px 22px;

  border: 1px solid var(--gold);

  background: var(--gold);

  color: var(--ink);

  font-family: var(--font-mono);
  font-size: 12.5px;
  font-weight: 500;

  letter-spacing: 0.1em;

  text-align: center;

  text-transform: uppercase;

  transition:
    background 0.25s var(--ease-out),
    color 0.25s var(--ease-out),
    transform 0.2s var(--ease-out);
}

.btn-neuro:hover {
  background: var(--gold-bright);

  border-color: var(--gold-bright);

  transform: translateY(-1px);
}

.btn-neuro:active {
  transform: translateY(0);
}


/* ==========================================================================
   LINKS — BIBLIOTECA / ATLAS
   ========================================================================== */

.btn-library,
.btn-atlas {
  display: flex;

  align-items: center;

  gap: 8px;

  width: fit-content;

  padding: 4px 0;

  border-bottom: 1px solid transparent;

  color: var(--paper-dim);

  font-family: var(--font-mono);
  font-size: 12px;

  letter-spacing: 0.08em;

  transition:
    color 0.2s var(--ease-out),
    border-color 0.2s var(--ease-out);
}

.btn-library::before,
.btn-atlas::before {
  content: "→";

  color: var(--gold);

  transition:
    transform 0.2s var(--ease-out);
}

.btn-library:hover,
.btn-atlas:hover {
  color: var(--paper);

  border-color: var(--line-bright);
}

.btn-library:hover::before,
.btn-atlas:hover::before {
  transform: translateX(3px);
}


/* ==========================================================================
   MÓDULOS
   ========================================================================== */

.tool-grid {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 10px;

  margin-top: 16px;
}

.tool-grid--fields {
  margin-top: 4px;
}


/* ==========================================================================
   CARD DOS MÓDULOS
   ========================================================================== */

.tool-card {
  position: relative;

  display: flex;

  flex-direction: column;

  gap: 4px;

  overflow: hidden;

  padding: 16px 14px 14px;

  background: var(--surface);

  border: 1px solid var(--line);

  text-align: left;

  transition:
    border-color 0.25s var(--ease-out),
    background 0.25s var(--ease-out),
    transform 0.25s var(--ease-out);
}

.tool-card:hover,
.tool-card:focus-visible {
  background: var(--surface-raised);

  border-color: var(--line-bright);

  transform: translateY(-2px);
}


/* ==========================================================================
   MARCA ROMANA DOS MÓDULOS
   ========================================================================== */

.tool-card-mark {
  position: absolute;

  right: 4px;
  bottom: -14px;

  color: var(--paper);

  font-family: var(--font-display);
  font-size: 64px;
  font-weight: 500;

  line-height: 1;

  opacity: 0.06;

  pointer-events: none;
}

.tool-card h4 {
  color: var(--paper);

  font-size: 14.5px;
}

.tool-card p {
  color: var(--paper-dim);

  font-size: 12.5px;

  line-height: 1.5;
}


/* ==========================================================================
   CARDS ESTÁTICOS
   ========================================================================== */

.tool-card--field,
.tool-card--static {
  padding: 14px;

  background: var(--surface);

  border: 1px solid var(--line);
}

.tool-card--static h4 {
  margin-bottom: 4px;

  font-size: 13.5px;
}

.tool-card--static p {
  color: var(--paper-dim);

  font-size: 12px;
}


/* ==========================================================================
   VIEWPORT DA CORUJA — MEDALHÃO
   ========================================================================== */

#owl-viewport {
  position: relative;

  width: 100%;

  aspect-ratio: 1 / 1;

  max-width: 560px;
  max-height: 560px;

  margin: 0 auto;

  justify-self: center;
}


/* ==========================================================================
   CANVAS THREE.JS
   ========================================================================== */

#owl-viewport canvas {
  position: absolute;

  inset: 0;

  width: 100% !important;
  height: 100% !important;
}


/* ==========================================================================
   FRAME DA CORUJA
   ========================================================================== */

.owl-frame {
  position: absolute;

  inset: 6%;

  z-index: 2;

  pointer-events: none;
}

.owl-corner {
  position: absolute;

  width: 26px;
  height: 26px;

  border: 1px solid var(--gold);

  opacity: 0.6;
}

.owl-corner--tl {
  top: 0;
  left: 0;

  border-right: none;
  border-bottom: none;
}

.owl-corner--tr {
  top: 0;
  right: 0;

  border-left: none;
  border-bottom: none;
}

.owl-corner--bl {
  bottom: 0;
  left: 0;

  border-right: none;
  border-top: none;
}

.owl-corner--br {
  right: 0;
  bottom: 0;

  border-left: none;
  border-top: none;
}


/* ==========================================================================
   ANEL DA CORUJA
   ========================================================================== */

.owl-ring {
  position: absolute;

  inset: 0;

  width: 100%;
  height: 100%;

  animation:
    rotate-ring 70s linear infinite;
}

.owl-ring text {
  fill: var(--gold);

  font-family: var(--font-mono);
  font-size: 10.5px;

  letter-spacing: 0.05em;

  opacity: 0.55;
}

@keyframes rotate-ring {

  to {
    transform: rotate(360deg);
  }

}


/* ==========================================================================
   STATUS DA CORUJA
   ========================================================================== */

.owl-status {
  position: absolute;

  top: 50%;
  left: 50%;

  transform:
    translate(-50%, -50%);

  color: var(--paper-faint);

  font-family: var(--font-mono);
  font-size: 11px;

  letter-spacing: 0.1em;

  text-transform: uppercase;

  white-space: nowrap;
}

.owl-status--error {
  color: #d98a76;
}


/* ==========================================================================
   IDENTIFICAÇÃO DA CORUJA
   ========================================================================== */

.owl-label {
  position: absolute;

  left: 50%;
  bottom: 2%;

  z-index: 2;

  display: flex;

  flex-direction: column;

  gap: 3px;

  transform:
    translateX(-50%);

  text-align: center;

  color: var(--paper-faint);

  font-family: var(--font-mono);
  font-size: 10.5px;

  letter-spacing: 0.14em;

  text-transform: uppercase;
}

.owl-label strong {
  color: var(--gold-bright);

  font-family: var(--font-display);

  font-size: 16px;

  font-style: italic;

  font-weight: 500;

  letter-spacing: 0;

  text-transform: none;
}


/* ==========================================================================
   OVERLAY
   ========================================================================== */

.overlay {
  position: fixed;
  inset: 0;

  z-index: 30;

  background:
    rgba(6, 5, 11, 0.6);

  backdrop-filter: blur(4px);

  opacity: 0;

  visibility: hidden;

  transition:
    opacity 0.3s var(--ease-out);
}

.overlay.active {
  opacity: 1;

  visibility: visible;
}


/* ==========================================================================
   PAINEL LATERAL
   ========================================================================== */

.tool-panel {
  position: fixed;

  z-index: 31;

  top: 0;
  right: 0;

  width: min(460px, 100%);
  height: 100%;

  display: flex;

  flex-direction: column;

  gap: 12px;

  overflow-y: auto;

  padding: 32px 30px 40px;

  background:
    linear-gradient(
      180deg,
      var(--surface-raised) 0%,
      var(--surface) 100%
    );

  border-left: 1px solid var(--line-bright);

  box-shadow:
    -40px 0 80px -30px var(--shadow-deep);

  transform: translateX(100%);

  transition:
    transform 0.4s var(--ease-out);
}

.tool-panel.active {
  transform: translateX(0);
}


/* ==========================================================================
   CABEÇALHO DO PAINEL
   ========================================================================== */

.tool-header {
  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 16px;

  margin-bottom: 6px;

  padding-bottom: 18px;

  border-bottom: 1px solid var(--line);
}

.ai-badge {
  display: inline-block;

  margin-bottom: 10px;

  padding: 3px 9px;

  color: var(--gold);

  border: 1px solid var(--line-bright);

  font-family: var(--font-mono);
  font-size: 10.5px;

  letter-spacing: 0.16em;

  text-transform: uppercase;
}

.tool-header h3 {
  margin-bottom: 6px;

  font-size: 21px;
}

.tool-header p {
  max-width: 36ch;

  color: var(--paper-dim);

  font-size: 13px;

  line-height: 1.5;
}


/* ==========================================================================
   BOTÃO FECHAR
   ========================================================================== */

.close-tool {
  display: flex;

  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  width: 32px;
  height: 32px;

  border: 1px solid var(--line-bright);

  background: transparent;

  color: var(--paper-dim);

  font-size: 18px;

  line-height: 1;

  transition:
    border-color 0.2s var(--ease-out),
    color 0.2s var(--ease-out),
    transform 0.2s var(--ease-out);
}

.close-tool:hover {
  border-color: var(--gold);

  color: var(--gold-bright);

  transform: rotate(90deg);
}


/* ==========================================================================
   RESULTADO DA IA
   ========================================================================== */

.result-box {
  margin-top: 8px;

  padding: 16px;

  background:
    rgba(199, 164, 104, 0.06);

  border-left: 2px solid var(--gold);

  animation:
    fade-up 0.4s var(--ease-out);
}

.result-box strong {
  display: block;

  margin-bottom: 6px;

  color: var(--gold);

  font-family: var(--font-mono);
  font-size: 10.5px;

  letter-spacing: 0.14em;

  text-transform: uppercase;
}

.result-box p {
  color: var(--paper-dim);

  font-size: 13.5px;

  line-height: 1.6;
}

@keyframes fade-up {

  from {
    opacity: 0;

    transform:
      translateY(6px);
  }

  to {
    opacity: 1;

    transform:
      translateY(0);
  }

}


/* ==========================================================================
   RESPONSIVO — TABLET
   ========================================================================== */

@media (max-width: 920px) {

  .main-container {
    grid-template-columns: 1fr;

    padding-top: 96px;
  }

  #owl-viewport {
    max-width: 420px;
    max-height: 420px;
  }

}


/* ==========================================================================
   RESPONSIVO — CELULAR
   ========================================================================== */

@media (max-width: 560px) {

  .main-container {
    grid-template-columns: 1fr;

    padding:
      80px
      18px
      60px;
  }

  .system-status {
    position: static;

    margin-bottom: 6px;
  }

  .tool-grid {
    grid-template-columns: 1fr 1fr;
  }

  .tool-panel {
    width: 100%;

    padding:
      26px
      20px
      32px;
  }

  .btn-aluno-fixo {
    top: 16px;
    right: 16px;

    padding: 8px 14px;

    font-size: 11px;
  }

}


/* ==========================================================================
   ACESSIBILIDADE — MOVIMENTO REDUZIDO
   ========================================================================== */

@media (prefers-reduced-motion: reduce) {

  .bg-video,
  .btn-aluno-fixo,
  .tool-card,
  .btn-neuro,
  .close-tool,
  .tool-panel,
  .overlay,
  .result-box,
  .owl-ring,
  .system-dot {
    transition: none !important;

    animation: none !important;
  }

  .system-dot {
    box-shadow: none;
  }

}
```
