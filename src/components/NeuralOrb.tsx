import { useMemo } from "react";
import { motion } from "framer-motion";

interface NeuralOrbProps {
  isActive: boolean;
  volume: number;
  frequency: number;
  isProcessing: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

interface NodePoint {
  x: number;
  y: number;
  size: number;
  delay: number;
}

const SIZE_MAP = {
  sm: 190,
  md: 250,
  lg: 330,
  xl: 410,
};

const NODE_COUNT = 18;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createNodes(): NodePoint[] {
  return Array.from({ length: NODE_COUNT }, (_, index) => {
    const angle = (Math.PI * 2 * index) / NODE_COUNT;
    const radius = 34 + ((index * 17) % 29);

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: 1.5 + ((index * 13) % 18) / 10,
      delay: index * 0.07,
    };
  });
}

function NeuralStructure({
  active,
  processing,
  volume,
  frequency,
}: {
  active: boolean;
  processing: boolean;
  volume: number;
  frequency: number;
}) {
  const nodes = useMemo(() => createNodes(), []);

  const intensity = active
    ? clamp(0.3 + volume * 1.4, 0.3, 1)
    : 0.18;

  const rotation = frequency * 0.018;

  return (
    <div
      className="aura-neural-structure"
      aria-hidden="true"
      style={
        {
          "--aura-structure-opacity": intensity,
          "--aura-structure-rotation": `${rotation}deg`,
        } as React.CSSProperties
      }
    >
      <div className="aura-structure-frame aura-structure-frame-one" />
      <div className="aura-structure-frame aura-structure-frame-two" />
      <div className="aura-structure-frame aura-structure-frame-three" />

      <svg
        className="aura-structure-lines"
        viewBox="-100 -100 200 200"
        preserveAspectRatio="none"
      >
        {nodes.map((node, index) => {
          const next = nodes[(index + 1) % nodes.length];

          return (
            <line
              key={`line-${index}`}
              x1={node.x}
              y1={node.y}
              x2={next.x}
              y2={next.y}
              pathLength="1"
              className="aura-structure-line"
              style={{
                animationDelay: `${node.delay}s`,
                opacity: active ? 0.42 : 0.18,
              }}
            />
          );
        })}

        {nodes
          .filter((_, index) => index % 3 === 0)
          .map((node, index) => (
            <line
              key={`inner-line-${index}`}
              x1={node.x}
              y1={node.y}
              x2={0}
              y2={0}
              pathLength="1"
              className="aura-structure-line aura-structure-line-inner"
              style={{
                opacity: active ? 0.26 : 0.1,
              }}
            />
          ))}
      </svg>

      {nodes.map((node, index) => (
        <motion.span
          key={`node-${index}`}
          className="aura-structure-node"
          style={{
            left: `calc(50% + ${node.x}px)`,
            top: `calc(50% + ${node.y}px)`,
            width: `${node.size}px`,
            height: `${node.size}px`,
          }}
          animate={
            active
              ? {
                  opacity: [0.25, 0.75, 0.25],
                  scale: [0.85, 1.18, 0.85],
                }
              : {
                  opacity: 0.22,
                  scale: 1,
                }
          }
          transition={{
            duration: processing ? 1.3 : 2.8,
            delay: node.delay,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function NeuralOrb({
  isActive,
  volume,
  frequency,
  isProcessing,
  size = "md",
}: NeuralOrbProps) {
  const dimension = SIZE_MAP[size];

  const normalizedVolume = clamp(volume, 0, 1);
  const normalizedFrequency = clamp(frequency / 1000, 0, 1);

  const activity = isActive
    ? clamp(
        0.45 +
          normalizedVolume * 0.45 +
          normalizedFrequency * 0.1,
        0.45,
        1,
      )
    : 0.32;

  const breathingDuration = isProcessing ? 1.6 : 3.8;

  const coreScale = isActive
    ? 1 + normalizedVolume * 0.045
    : 0.97;

  const glowOpacity = isActive
    ? clamp(0.2 + normalizedVolume * 0.35, 0.2, 0.55)
    : 0.16;

  return (
    <div
      className={`aura-neural-orb aura-neural-orb-${size} ${
        isActive ? "is-active" : ""
      } ${isProcessing ? "is-processing" : ""}`}
      style={
        {
          width: dimension,
          height: dimension,
          "--aura-activity": activity,
          "--aura-glow-opacity": glowOpacity,
          "--aura-frequency": `${normalizedFrequency * 360}deg`,
        } as React.CSSProperties
      }
    >
      <motion.div
        className="aura-orb-ambient"
        animate={{
          scale: isActive
            ? [1, 1.045 + normalizedVolume * 0.035, 1]
            : 1,
          opacity: isActive
            ? [0.5, 0.8, 0.5]
            : 0.42,
        }}
        transition={{
          duration: breathingDuration,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="aura-orb-aura"
        animate={{
          scale: isActive
            ? [1, 1.025 + normalizedVolume * 0.025, 1]
            : 1,
        }}
        transition={{
          duration: isProcessing ? 1.15 : 3,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      <div className="aura-orb-grid">
        <span className="aura-grid-line aura-grid-line-horizontal" />
        <span className="aura-grid-line aura-grid-line-vertical" />
        <span className="aura-grid-line aura-grid-line-diagonal-one" />
        <span className="aura-grid-line aura-grid-line-diagonal-two" />
      </div>

      <motion.div
        className="aura-orb-core"
        animate={{
          scale: coreScale,
          rotate: isActive ? normalizedFrequency * 2.5 : 0,
        }}
        transition={{
          scale: {
            duration: 0.45,
            ease: "easeOut",
          },
          rotate: {
            duration: 1.2,
            ease: "easeOut",
          },
        }}
      >
        <div className="aura-core-surface">
          <div className="aura-core-plane aura-core-plane-one" />
          <div className="aura-core-plane aura-core-plane-two" />
          <div className="aura-core-plane aura-core-plane-three" />

          <div className="aura-core-center">
            <motion.span
              className="aura-core-center-point"
              animate={
                isActive
                  ? {
                      scale: [0.85, 1.08, 0.85],
                      opacity: [0.55, 0.95, 0.55],
                    }
                  : {
                      scale: 0.9,
                      opacity: 0.5,
                    }
              }
              transition={{
                duration: isProcessing ? 1 : 2.8,
                repeat: isActive ? Infinity : 0,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="aura-core-reflection" />
        </div>
      </motion.div>

      <NeuralStructure
        active={isActive}
        processing={isProcessing}
        volume={normalizedVolume}
        frequency={frequency}
      />

      <div className="aura-orb-mark">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
