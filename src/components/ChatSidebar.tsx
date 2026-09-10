/* =========================================================
   AURA — CHAT SIDEBAR
   EducaCube / Premium Neural Interface
   ========================================================= */

.aura-sidebar-desktop-inner {
  position: relative;
  width: var(--aura-sidebar-width, 284px);
  min-width: var(--aura-sidebar-width, 284px);
  height: 100%;
  z-index: 20;
}

.aura-sidebar {
  position: relative;
  display: flex;
  flex-direction: column;

  width: 100%;
  height: 100%;
  min-height: 100%;

  overflow: hidden;

  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(124, 58, 237, 0.09),
      transparent 34%
    ),
    linear-gradient(
      145deg,
      rgba(9, 7, 13, 0.99),
      rgba(5, 4, 8, 1)
    );

  border-right: 1px solid rgba(167, 139, 250, 0.09);
}

/* =========================================================
   HEADER
   ========================================================= */

.aura-sidebar-header {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 72px;
  padding: 0 20px;

  border-bottom: 1px solid rgba(167, 139, 250, 0.07);
}

.aura-sidebar-brand {
  display: flex;
  align-items: center;
  gap: 11px;

  min-width: 0;
}

.aura-sidebar-logo {
  position: relative;

  display: grid;
  place-items: center;

  width: 34px;
  height: 34px;
  flex: 0 0 34px;

  border: 1px solid rgba(167, 139, 250, 0.18);
  border-radius: 10px;

  color: var(--aura-violet-light, #a78bfa);

  background:
    radial-gradient(
      circle at 35% 25%,
      rgba(167, 139, 250, 0.15),
      transparent 58%
    ),
    rgba(14, 10, 21, 0.9);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.025),
    0 0 20px rgba(124, 58, 237, 0.06);
}

.aura-sidebar-logo::after {
  content: "";

  position: absolute;
  inset: 5px;

  border-radius: 7px;

  border: 1px solid rgba(139, 92, 246, 0.08);

  pointer-events: none;
}

.aura-sidebar-brand-text {
  display: flex;
  flex-direction: column;
  justify-content: center;

  min-width: 0;
  line-height: 1;
}

.aura-sidebar-brand-name {
  color: rgba(255, 255, 255, 0.94);

  font-family:
    "Space Grotesk",
    "DM Sans",
    sans-serif;

  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.aura-sidebar-brand-context {
  margin-top: 5px;

  color: rgba(196, 181, 253, 0.46);

  font-family:
    "DM Sans",
    sans-serif;

  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.aura-sidebar-close {
  display: grid;
  place-items: center;

  width: 34px;
  height: 34px;

  padding: 0;

  color: rgba(255, 255, 255, 0.55);

  background: transparent;

  border: 1px solid transparent;
  border-radius: 9px;

  cursor: pointer;

  transition:
    color 180ms ease,
    background 180ms ease,
    border-color 180ms ease;
}

.aura-sidebar-close:hover {
  color: rgba(255, 255, 255, 0.9);

  background: rgba(139, 92, 246, 0.08);

  border-color: rgba(167, 139, 250, 0.12);
}

.aura-sidebar-close:focus-visible {
  outline: 2px solid rgba(167, 139, 250, 0.55);
  outline-offset: 2px;
}

/* =========================================================
   CONTENT
   ========================================================= */

.aura-sidebar-content {
  flex: 1;

  min-height: 0;

  padding: 18px 12px 14px;

  overflow-y: auto;
  overflow-x: hidden;

  scrollbar-width: thin;
  scrollbar-color:
    rgba(139, 92, 246, 0.18)
    transparent;
}

.aura-sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.aura-sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.aura-sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.18);
  border-radius: 999px;
}

/* =========================================================
   NEW CONVERSATION
   ========================================================= */

.aura-new-conversation {
  position: relative;

  display: flex;
  align-items: center;
  gap: 10px;

  width: 100%;
  height: 44px;

  padding: 0 10px;

  color: rgba(255, 255, 255, 0.82);

  font-family:
    "DM Sans",
    sans-serif;

  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.01em;

  background:
    linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.13),
      rgba(91, 33, 182, 0.06)
    );

  border: 1px solid rgba(167, 139, 250, 0.13);
  border-radius: 11px;

  cursor: pointer;

  transition:
    color 180ms ease,
    background 180ms ease,
    border-color 180ms ease,
    transform 180ms ease,
    box-shadow 180ms ease;
}

.aura-new-conversation:hover {
  color: #ffffff;

  background:
    linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.19),
      rgba(91, 33, 182, 0.09)
    );

  border-color: rgba(167, 139, 250, 0.22);

  box-shadow:
    0 8px 28px rgba(91, 33, 182, 0.09);
}

.aura-new-conversation:active {
  transform: translateY(1px);
}

.aura-new-conversation:focus-visible {
  outline: 2px solid rgba(167, 139, 250, 0.55);
  outline-offset: 2px;
}

.aura-new-conversation-icon {
  display: grid;
  place-items: center;

  width: 26px;
  height: 26px;
  flex: 0 0 26px;

  color: var(--aura-violet-light, #a78bfa);

  background: rgba(139, 92, 246, 0.11);

  border: 1px solid rgba(167, 139, 250, 0.1);
  border-radius: 7px;
}

.aura-new-conversation-key {
  display: grid;
  place-items: center;

  width: 21px;
  height: 21px;

  margin-left: auto;

  color: rgba(196, 181, 253, 0.4);

  font-size: 9px;
  font-weight: 600;

  background: rgba(255, 255, 255, 0.025);

  border: 1px solid rgba(255, 255, 255, 0.055);
  border-radius: 6px;
}

/* =========================================================
   SECTION
   ========================================================= */

.aura-sidebar-section {
  margin-top: 25px;
}

.aura-sidebar-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 9px 9px;

  color: rgba(255, 255, 255, 0.36);

  font-family:
    "DM Sans",
    sans-serif;

  font-size: 9px;
  font-weight: 650;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.aura-sidebar-count {
  display: grid;
  place-items: center;

  min-width: 20px;
  height: 18px;

  padding: 0 6px;

  color: rgba(196, 181, 253, 0.5);

  font-size: 9px;
  letter-spacing: 0;

  background: rgba(139, 92, 246, 0.07);

  border: 1px solid rgba(167, 139, 250, 0.08);
  border-radius: 5px;
}

/* =========================================================
   EMPTY STATE
   ========================================================= */

.aura-empty-conversations {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 36px 18px 24px;

  text-align: center;
}

.aura-empty-icon {
  display: grid;
  place-items: center;

  width: 40px;
  height: 40px;

  margin-bottom: 13px;

  color: rgba(167, 139, 250, 0.45);

  background:
    radial-gradient(
      circle,
      rgba(139, 92, 246, 0.1),
      rgba(139, 92, 246, 0.025)
    );

  border: 1px solid rgba(167, 139, 250, 0.09);
  border-radius: 11px;
}

.aura-empty-title {
  color: rgba(255, 255, 255, 0.6);

  font-family:
    "DM Sans",
    sans-serif;

  font-size: 11px;
  font-weight: 600;
}

.aura-empty-description {
  max-width: 170px;

  margin-top: 6px;

  color: rgba(255, 255, 255, 0.28);

  font-family:
    "DM Sans",
    sans-serif;

  font-size: 10px;
  line-height: 1.55;
}

/* =========================================================
   CONVERSATION LIST
   ========================================================= */

.aura-conversation-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.aura-conversation {
  position: relative;

  display: flex;
  align-items: center;
  gap: 10px;

  width: 100%;
  min-height: 54px;

  padding: 8px 9px;

  color: rgba(255, 255, 255, 0.56);

  text-align: left;

  background: transparent;

  border: 1px solid transparent;
  border-radius: 10px;

  cursor: pointer;

  transition:
    color 180ms ease,
    background 180ms ease,
    border-color 180ms ease;
}

.aura-conversation:hover {
  color: rgba(255, 255, 255, 0.82);

  background: rgba(139, 92, 246, 0.045);

  border-color: rgba(167, 139, 250, 0.06);
}

.aura-conversation:focus-visible {
  outline: 2px solid rgba(167, 139, 250, 0.48);
  outline-offset: 1px;
}

.aura-conversation-active {
  color: rgba(255, 255, 255, 0.9);

  background:
    linear-gradient(
      90deg,
      rgba(139, 92, 246, 0.105),
      rgba(139, 92, 246, 0.035)
    );

  border-color: rgba(167, 139, 250, 0.09);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.018);
}

.aura-conversation-active:hover {
  background:
    linear-gradient(
      90deg,
      rgba(139, 92, 246, 0.13),
      rgba(139, 92, 246, 0.045)
    );

  border-color: rgba(167, 139, 250, 0.12);
}

/* Active violet rail */

.aura-active-line {
  position: absolute;

  top: 9px;
  bottom: 9px;
  left: -1px;

  width: 2px;

  background:
    linear-gradient(
      180deg,
      transparent,
      rgba(167, 139, 250, 0.95) 25%,
      rgba(124, 58, 237, 0.95) 75%,
      transparent
    );

  border-radius: 0 999px 999px 0;

  box-shadow:
    0 0 12px rgba(139, 92, 246, 0.35);
}

/* =========================================================
   CONVERSATION ICON
   ========================================================= */

.aura-conversation-icon {
  display: grid;
  place-items: center;

  width: 28px;
  height: 28px;
  flex: 0 0 28px;

  color: rgba(255, 255, 255, 0.28);

  background: rgba(255, 255, 255, 0.018);

  border: 1px solid rgba(255, 255, 255, 0.045);
  border-radius: 8px;

  transition:
    color 180ms ease,
    background 180ms ease,
    border-color 180ms ease;
}

.aura-conversation:hover .aura-conversation-icon {
  color: rgba(196, 181, 253, 0.6);

  background: rgba(139, 92, 246, 0.06);

  border-color: rgba(167, 139, 250, 0.08);
}

.aura-conversation-icon-active {
  color: var(--aura-violet-light, #a78bfa);

  background:
    radial-gradient(
      circle at center,
      rgba(139, 92, 246, 0.15),
      rgba(139, 92, 246, 0.055)
    );

  border-color: rgba(167, 139, 250, 0.12);
}

/* =========================================================
   CONVERSATION CONTENT
   ========================================================= */

.aura-conversation-content {
  display: flex;
  flex-direction: column;

  min-width: 0;
  flex: 1;
}

.aura-conversation-title {
  display: block;

  width: 100%;

  overflow: hidden;

  color: rgba(255, 255, 255, 0.52);

  font-family:
    "DM Sans",
    sans-serif;

  font-size: 11px;
  font-weight: 500;

  line-height: 1.35;

  white-space: nowrap;
  text-overflow: ellipsis;

  transition: color 180ms ease;
}

.aura-conversation-title-active {
  color: rgba(255, 255, 255, 0.88);

  font-weight: 600;
}

.aura-conversation-meta {
  display: flex;
  align-items: center;
  gap: 4px;

  margin-top: 4px;

  color: rgba(255, 255, 255, 0.23);

  font-family:
    "DM Sans",
    sans-serif;

  font-size: 8px;
  font-weight: 500;

  line-height: 1;

  white-space: nowrap;
}

.aura-conversation-active .aura-conversation-meta {
  color: rgba(196, 181, 253, 0.38);
}

.aura-meta-dot {
  color: rgba(167, 139, 250, 0.25);
}

/* =========================================================
   FOOTER
   ========================================================= */

.aura-sidebar-footer {
  position: relative;

  padding: 14px 18px 17px;

  border-top: 1px solid rgba(167, 139, 250, 0.065);

  background:
    linear-gradient(
      180deg,
      rgba(5, 4, 8, 0.2),
      rgba(10, 7, 15, 0.72)
    );
}

.aura-system-status {
  display: flex;
  align-items: center;
  gap: 10px;

  min-height: 38px;
}

.aura-system-status-dot {
  position: relative;

  width: 6px;
  height: 6px;
  flex: 0 0 6px;

  background: #a78bfa;

  border-radius: 50%;

  box-shadow:
    0 0 0 3px rgba(139, 92, 246, 0.08),
    0 0 12px rgba(139, 92, 246, 0.38);

  animation: aura-sidebar-pulse 3s ease-in-out infinite;
}

.aura-system-status-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.aura-system-status-text {
  color: rgba(255, 255, 255, 0.46);

  font-family:
    "DM Sans",
    sans-serif;

  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.aura-system-status-subtext {
  margin-top: 4px;

  color: rgba(196, 181, 253, 0.28);

  font-family:
    "DM Sans",
    sans-serif;

  font-size: 8px;
  font-weight: 500;
  letter-spacing: 0.04em;
}

/* =========================================================
   MOBILE OVERLAY
   ========================================================= */

.aura-mobile-overlay {
  position: fixed;
  inset: 0;

  z-index: 100;

  pointer-events: none;
}

.aura-mobile-backdrop {
  position: absolute;
  inset: 0;

  width: 100%;
  height: 100%;

  padding: 0;

  background: rgba(0, 0, 0, 0.68);

  border: 0;

  cursor: pointer;

  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);

  pointer-events: auto;
}

.aura-mobile-sidebar {
  position: absolute;

  top: 0;
  bottom: 0;
  left: 0;

  width: min(
    86vw,
    320px
  );

  height: 100%;

  transform: translateX(0);

  box-shadow:
    20px 0 70px rgba(0, 0, 0, 0.5),
    0 0 45px rgba(91, 33, 182, 0.08);

  pointer-events: auto;

  animation: aura-sidebar-slide-in 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.aura-mobile-sidebar .aura-sidebar {
  border-right: 1px solid rgba(167, 139, 250, 0.13);
}

/* =========================================================
   ANIMATIONS
   ========================================================= */

@keyframes aura-sidebar-pulse {
  0%,
  100% {
    opacity: 0.65;
    transform: scale(0.9);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes aura-sidebar-slide-in {
  from {
    opacity: 0.7;
    transform: translateX(-18px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* =========================================================
   TABLET
   ========================================================= */

@media (max-width: 1024px) {
  .aura-sidebar-desktop-inner {
    width: 260px;
    min-width: 260px;
  }

  .aura-sidebar-header {
    padding: 0 17px;
  }

  .aura-sidebar-content {
    padding-left: 10px;
    padding-right: 10px;
  }

  .aura-sidebar-footer {
    padding-left: 15px;
    padding-right: 15px;
  }
}

/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 768px) {
  .aura-sidebar-desktop-inner {
    display: none;
  }

  .aura-mobile-sidebar {
    width: min(
      88vw,
      330px
    );
  }

  .aura-sidebar-header {
    min-height: 68px;
  }

  .aura-sidebar-content {
    padding-top: 16px;
  }

  .aura-new-conversation {
    height: 46px;
  }

  .aura-conversation {
    min-height: 56px;
  }

  .aura-sidebar-footer {
    padding-bottom: calc(
      17px + env(safe-area-inset-bottom)
    );
  }
}

/* =========================================================
   SMALL MOBILE
   ========================================================= */

@media (max-width: 420px) {
  .aura-mobile-sidebar {
    width: 88vw;
  }

  .aura-sidebar-header {
    padding-left: 16px;
    padding-right: 16px;
  }

  .aura-sidebar-content {
    padding-left: 10px;
    padding-right: 10px;
  }

  .aura-sidebar-footer {
    padding-left: 15px;
    padding-right: 15px;
  }
}

/* =========================================================
   REDUCED MOTION
   ========================================================= */

@media (prefers-reduced-motion: reduce) {
  .aura-new-conversation,
  .aura-conversation,
  .aura-conversation-icon,
  .aura-conversation-title,
  .aura-sidebar-close {
    transition: none;
  }

  .aura-system-status-dot,
  .aura-mobile-sidebar {
    animation: none;
  }
}
