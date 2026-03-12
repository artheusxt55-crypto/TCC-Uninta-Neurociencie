import { useRef, useState } from "react";

export function useAudioAnalyzer() {
  const [state, setState] = useState({ isActive: false, volume: 0, isProcessing: false });
  const audioContextRef = useRef<AudioContext | null>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      ctx.createMediaStreamSource(stream).connect(analyser);
      audioContextRef.current = ctx;
      setState(s => ({ ...s, isActive: true }));

      const update = () => {
        if (!audioContextRef.current) return;
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b) / data.length;
        setState(s => ({ ...s, volume: avg / 128 }));
        requestAnimationFrame(update);
      };
      update();
    } catch (err) {
      console.error("Erro no microfone", err);
    }
  };

  const stop = () => {
    audioContextRef.current?.close();
    audioContextRef.current = null;
    setState({ isActive: false, volume: 0, isProcessing: false });
  };

  return { ...state, start, stop };
}
