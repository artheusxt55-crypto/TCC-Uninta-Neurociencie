import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NeuralOrbProps {
  isActive: boolean;
  volume: number;
  frequency: number;
  isProcessing: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  ring: number;
}

const COLORS = {
  blue: "rgba(59, 130, 246, 1)",
  purple: "rgba(139, 92, 246, 1)",
  cyan: "rgba(34, 211, 238, 1)",
  violet: "rgba(167, 139, 250, 1)",
  white: "rgba(255, 255, 255, 0.35)",
};

function StardustParticles({
  volume,
  isActive,
  isProcessing,
}: {
  volume: number;
  isActive: boolean;
  isProcessing: boolean;
}) {
  const particles = useMemo<Particle[]>(() => {
    const colors = [
      COLORS.blue,
      COLORS.purple,
      COLORS.cyan,
      COLORS.violet,
      COLORS.white,
    ];

    const result: Particle[] = [];
    let id = 0;

    for (let i = 0; i < 12; i++) {
      result.push({
        id: id++,
        angle:
          (i / 12) * Math.PI * 2 +
          Math.random() * 0.4,
        distance: 100 + Math.random() * 25,
        size: 1 + Math.random() * 1.5,
        color: colors[i % colors.length],
        ring: 0,
      });
    }

    for (let i = 0; i < 16; i++) {
      result.push({
        id: id++,
        angle:
          (i / 16) * Math.PI * 2 +
          Math.random() * 0.5,
        distance: 135 + Math.random() * 35,
        size: 1.5 + Math.random() * 2,
        color: colors[i % colors.length],
        ring: 1,
      });
    }

    for (let i = 0; i < 14; i++) {
      result.push({
        id: id++,
        angle:
          (i / 14) * Math.PI * 2 +
          Math.random() * 0.6,
        distance: 175 + Math.random() * 50,
        size: 2 + Math.random() * 3,
        color: colors[i % colors.length],
        ring: 2,
      });
    }

    return result;
  }, []);

  if (!isActive) return null;

  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        width: 500,
        height: 500,
        left: -160,
        top: -160,
      }}
    >
      {particles.map((particle) => {
        const jitter =
          volume *
          (particle.ring === 0
            ? 20
            : particle.ring === 1
              ? 35
              : 50);

        const processingExtra = isProcessing ? 20 : 0;

        const distance =
          particle.distance +
          jitter +
          processingExtra;

        const x =
          250 +
          Math.cos(particle.angle) * distance;

        const y =
          250 +
          Math.sin(particle.angle) * distance;

        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${
                4 + volume * 8
              }px ${particle.color}`,
              filter: `blur(${particle.ring}px)`,
              left: -particle.size / 2,
              top: -particle.size / 2,
            }}
            animate={{
              x,
              y,
              opacity:
                (particle.ring === 2
                  ? 0.15
                  : particle.ring === 1
                    ? 0.3
                    : 0.5) +
                volume * 0.4 +
                (isProcessing ? 0.15 : 0),

              scale:
                1 +
                volume *
                  (particle.ring === 0
                    ? 1.2
                    : 0.6),
            }}
            transition={{
              type: "spring",
              stiffness:
                30 + volume * 50,
              damping:
                6 + particle.ring * 2,
              mass:
                0.4 +
                particle.ring * 0.2,
            }}
          />
        );
      })}
    </div>
  );
}

function OrbitalRings({
  isActive,
  volume,
  isProcessing,
}: {
  isActive: boolean;
  volume: number;
  isProcessing: boolean;
}) {
  if (!isActive) return null;

  const rings = [
    {
      size: 260,
      tiltX: 65,
      tiltY: 15,
      duration: 10,
      opacity: 0.35,
      width: 1.2,
      color: COLORS.blue,
    },
    {
      size: 300,
      tiltX: 72,
      tiltY: -25,
      duration: 14,
      opacity: 0.25,
      width: 1,
      color: COLORS.purple,
    },
    {
      size: 340,
      tiltX: 58,
      tiltY: 40,
      duration: 18,
      opacity: 0.18,
      width: 0.8,
      color: COLORS.cyan,
    },
    {
      size: 220,
      tiltX: 80,
      tiltY: -10,
      duration: 8,
      opacity: 0.3,
      width: 1.5,
      color: COLORS.violet,
    },
  ];

  return (
    <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none">
      {rings.map((ring, index) => {
        const dynamicOpacity =
          ring.opacity +
          volume * 0.3 +
          (isProcessing ? 0.15 : 0);

        const speed =
          ring.duration - volume * 4;

        return (
          <motion.div
            key={index}
            className="absolute rounded-full"
            style={{
              width: ring.size,
              height: ring.size,
              border: `${ring.width}px solid ${ring.color.replace(
                "1)",
                `${dynamicOpacity})`
              )}`,
              boxShadow: `
                0 0 ${
                  6 + volume * 10
                }px ${ring.color},
                inset 0 0 ${
                  4 + volume * 6
                }px ${ring.color}
              `,
              transform: `
                rotateX(${ring.tiltX}deg)
                rotateY(${ring.tiltY}deg)
              `,
              opacity: dynamicOpacity,
            }}
            initial={{
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              opacity: dynamicOpacity,
              scale: 1 + volume * 0.08,
              rotate: [0, 360],
            }}
            exit={{
              opacity: 0,
              scale: 0.5,
            }}
            transition={{
              opacity: {
                type: "spring",
                stiffness: 60,
                damping: 15,
              },
              scale: {
                type: "spring",
                stiffness: 60,
                damping: 15,
              },
              rotate: {
                duration: Math.max(
                  speed,
                  4
                ),
                repeat: Infinity,
                ease: "linear",
              },
            }}
          />
        );
      })}
    </div>
  );
}

export default function NeuralOrb({
  isActive,
  volume,
  frequency,
  isProcessing,
  size = "lg",
}: NeuralOrbProps) {
  const scale = isActive
    ? 1 + volume * 0.6
    : 0;

  const glowIntensity = isActive
    ? 0.4 + volume * 0.6
    : 0;

  const gradientRotation =
    frequency * 360;

  const sizeMap = {
    sm: 0.4,
    md: 0.65,
    lg: 1,
    xl: 1.25,
  };

  const sizeScale = sizeMap[size];

  const blobPath = useMemo(() => {
    const points = 8;
    const slice =
      (Math.PI * 2) / points;

    return Array.from(
      { length: points },
      (_, index) => {
        const baseRadius = 50;

        const noise =
          Math.sin(
            index * 2.7 +
              frequency * 10
          ) *
            3 +
          Math.cos(index * 1.3) *
            2;

        const radius =
          baseRadius +
          noise +
          volume * 8;

        const angle =
          slice * index;

        return `${
          50 +
          radius *
            Math.cos(angle)
        }% ${
          50 +
          radius *
            Math.sin(angle)
        }%`;
      }
    ).join(", ");
  }, [volume, frequency]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="relative flex items-center justify-center"
          style={{
            transform: `scale(${sizeScale})`,
          }}
          initial={{
            scale: 0,
            opacity: 0,
          }}
          animate={{
            scale: sizeScale,
            opacity: 1,
          }}
          exit={{
            scale: 0,
            opacity: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 20,
          }}
        >
          {/* Glow externo */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 360,
              height: 360,
              background: `
                radial-gradient(
                  circle,
                  rgba(59,130,246,${
                    0.15 +
                    volume * 0.1
                  }) 0%,
                  rgba(139,92,246,${
                    0.08 +
                    volume * 0.05
                  }) 30%,
                  transparent 65%
                )
              `,
              filter: `blur(${
                50 + volume * 30
              }px)`,
            }}
            animate={{
              scale:
                volume < 0.08
                  ? [
                      scale * 1.8,
                      scale * 1.9,
                      scale * 1.8,
                    ]
                  : scale * 1.8,

              opacity:
                volume < 0.08
                  ? [
                      glowIntensity * 0.25,
                      glowIntensity * 0.4,
                      glowIntensity * 0.25,
                    ]
                  : glowIntensity *
                    0.25,
            }}
            transition={
              volume < 0.08
                ? {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                : {
                    type: "spring",
                    stiffness: 40,
                    damping: 20,
                  }
            }
          />

          {/* Glow intermediário */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 300,
              height: 300,
              background: `
                radial-gradient(
                  circle,
                  rgba(139,92,246,${
                    0.3 +
                    volume * 0.2
                  }) 0%,
                  rgba(59,130,246,${
                    0.15 +
                    volume * 0.1
                  }) 40%,
                  transparent 70%
                )
              `,
              filter: `blur(${
                35 + volume * 20
              }px)`,
            }}
            animate={{
              scale: scale * 1.5,
              opacity:
                glowIntensity * 0.4,
            }}
            transition={{
              type: "spring",
              stiffness: 60,
              damping: 18,
            }}
          />

          {/* Anel luminoso externo */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 240,
              height: 240,
              background: `
                conic-gradient(
                  from 0deg,
                  rgba(59,130,246,0.4) 0%,
                  rgba(34,211,238,0.25) 25%,
                  rgba(139,92,246,0.35) 50%,
                  rgba(167,139,250,0.2) 75%,
                  rgba(59,130,246,0.4) 100%
                )
              `,
              filter: `blur(${
                20 + volume * 12
              }px)`,
            }}
            animate={{
              scale: scale * 1.25,
              opacity:
                glowIntensity * 0.6,
              rotate: [0, 360],
            }}
            transition={{
              scale: {
                type: "spring",
                stiffness: 80,
                damping: 15,
              },
              rotate: {
                duration: 12,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          />

          {/* Anel interno */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              background: `
                conic-gradient(
                  from 180deg,
                  rgba(139,92,246,0.5) 0%,
                  rgba(59,130,246,0.4) 30%,
                  rgba(34,211,238,0.5) 60%,
                  rgba(139,92,246,0.5) 100%
                )
              `,
              filter: `blur(${
                12 + volume * 8
              }px)`,
            }}
            animate={{
              scale: scale * 1.05,
              opacity:
                glowIntensity * 0.8,
              rotate: [360, 0],
            }}
            transition={{
              scale: {
                type: "spring",
                stiffness: 100,
                damping: 12,
              },
              rotate: {
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          />

          {/* ORBE PRINCIPAL */}
          <motion.div
            className="relative z-10 rounded-full"
            style={{
              width: 180,
              height: 180,

              clipPath: `polygon(${blobPath})`,

              background: `
                conic-gradient(
                  from ${gradientRotation}deg,
                  rgba(59,130,246,1) 0%,
                  rgba(34,211,238,1) ${
                    20 + volume * 15
                  }%,
                  rgba(139,92,246,1) ${
                    45 + volume * 10
                  }%,
                  ${
                    isProcessing
                      ? "rgba(167,139,250,1)"
                      : "rgba(59,130,246,1)"
                  } ${
                    70 + volume * 10
                  }%,
                  rgba(59,130,246,1) 100%
                )
              `,

              filter: `blur(${
                1.5 + volume * 0.5
              }px)`,

              boxShadow: `
                0 0 ${
                  30 + volume * 30
                }px rgba(59,130,246,${
                  0.25 +
                  volume * 0.35
                }),
                0 0 ${
                  70 + volume * 40
                }px rgba(139,92,246,${
                  0.15 +
                  volume * 0.25
                })
              `,
            }}
            animate={{
              scale:
                volume < 0.08
                  ? [
                      scale,
                      scale * 1.07,
                      scale,
                    ]
                  : scale,

              rotate: [0, 360],
            }}
            transition={{
              scale:
                volume < 0.08
                  ? {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
                  : {
                      type: "spring",
                      stiffness: 150,
                      damping: 12,
                    },

              rotate: {
                duration:
                  20 -
                  volume * 12,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          />

          {/* Overlay fluido */}
          <motion.div
            className="absolute z-10 rounded-full"
            style={{
              width: 170,
              height: 170,

              mixBlendMode:
                "screen",

              clipPath: `polygon(${blobPath})`,

              background: `
                conic-gradient(
                  from 90deg,
                  rgba(34,211,238,0.8) 0%,
                  rgba(167,139,250,0.6) 33%,
                  rgba(139,92,246,0.7) 66%,
                  rgba(34,211,238,0.8) 100%
                )
              `,

              filter: `blur(${
                3 + volume * 2
              }px)`,
            }}
            animate={{
              scale: scale * 0.95,
              rotate: [360, 0],
              opacity:
                0.5 + volume * 0.3,
            }}
            transition={{
              scale: {
                type: "spring",
                stiffness: 150,
                damping: 12,
              },

              rotate: {
                duration: 14,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          />

          {/* Núcleo */}
          <motion.div
            className="absolute z-20 rounded-full"
            style={{
              width: 100,
              height: 100,

              background:
                "radial-gradient(circle, rgba(255,255,255,0.35), rgba(255,255,255,0.02) 60%, transparent 75%)",

              filter: "blur(25px)",
            }}
            animate={{
              scale: isProcessing
                ? 0.8
                : volume > 0.7
                  ? 0.5
                  : 0,

              opacity: isProcessing
                ? 0.6
                : volume > 0.7
                  ? volume * 0.4
                  : 0,
            }}
            transition={{
              duration: 0.15,
            }}
          />

          {/* Anéis orbitais */}
          <OrbitalRings
            isActive={isActive}
            volume={volume}
            isProcessing={
              isProcessing
            }
          />

          {/* Partículas */}
          <StardustParticles
            volume={volume}
            isActive={isActive}
            isProcessing={
              isProcessing
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
