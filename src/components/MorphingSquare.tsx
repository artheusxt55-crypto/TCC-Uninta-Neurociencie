import { motion, type HTMLMotionProps } from "motion/react";

export interface MorphingSquareProps
  extends Omit<HTMLMotionProps<"div">, "children"> {
  size?: number;
}

export default function MorphingSquare({
  size = 16,
  className = "",
  ...props
}: MorphingSquareProps) {
  return (
    <motion.div
      className={`aura-morphing-square ${className}`.trim()}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
      }}
      animate={{
        borderRadius: ["6%", "50%", "6%"],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      aria-hidden="true"
      {...props}
    />
  );
}
