import { motion } from "framer-motion";

interface NeuralOrbProps {
  volume: number;
  isProcessing: boolean;
}

export const NeuralOrb = ({ volume, isProcessing }: NeuralOrbProps) => {
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Glow externo */}
      <motion.div
        animate={{
          scale: isProcessing ? [1, 1.2, 1] : 1 + volume * 0.5,
          opacity: isProcessing ? [0.4, 0.8, 0.4] : 0.4 + volume * 0.6,
        }}
        transition={{ duration: isProcessing ? 1.5 : 0.2, repeat: Infinity }}
        className="absolute w-full h-full rounded-full bg-neural-red blur-3xl"
      />
      
      {/* Orbe Central */}
      <motion.div
        animate={{ scale: 1 + volume * 0.2 }}
        className="relative w-32 h-32 rounded-full bg-gradient-to-br from-neural-red to-neural-crimson shadow-[0_0_50px_rgba(255,0,0,0.5)] border border-white/20"
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)]" />
      </motion.div>

      {/* Anéis Orbitais */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{ rotate: 360 }}
          transition={{ duration: 10 / i, repeat: Infinity, ease: "linear" }}
          className="absolute border border-neural-red/30 rounded-full"
          style={{ width: `${100 + i * 40}%`, height: `${100 + i * 40}%` }}
        />
      ))}
    </div>
  );
};

export default NeuralOrb;
