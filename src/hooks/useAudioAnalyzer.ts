import { useCallback, useEffect, useRef, useState } from "react";

interface AudioAnalyzerState {
  isActive: boolean;
  isProcessing: boolean;
  volume: number;
  frequency: number;
}

interface AudioAnalyzerReturn extends AudioAnalyzerState {
  start: () => Promise<void>;
  stop: () => void;
}

export function useAudioAnalyzer(): AudioAnalyzerReturn {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [volume, setVolume] = useState(0);
  const [frequency, setFrequency] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const start = useCallback(async () => {
    try {
      if (isActive) return;

      setIsProcessing(true);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Seu navegador não suporta acesso ao microfone."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error(
          "Seu navegador não suporta análise de áudio."
        );
      }

      const audioContext = new AudioContextClass();

      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const analyser =
        audioContext.createAnalyser();

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      analyserRef.current = analyser;

      const source =
        audioContext.createMediaStreamSource(
          stream
        );

      source.connect(analyser);

      setIsActive(true);
      setIsProcessing(false);

      const dataArray = new Uint8Array(
        analyser.frequencyBinCount
      );

      const analyze = () => {
        if (!analyserRef.current) return;

        analyser.getByteFrequencyData(
          dataArray
        );

        let sum = 0;

        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }

        const average =
          sum / dataArray.length;

        const normalizedVolume = Math.min(
          average / 128,
          1
        );

        let weightedFrequency = 0;
        let totalEnergy = 0;

        for (
          let i = 0;
          i < dataArray.length;
          i++
        ) {
          const energy = dataArray[i];

          weightedFrequency +=
            i * energy;

          totalEnergy += energy;
        }

        const normalizedFrequency =
          totalEnergy > 0
            ? Math.min(
                weightedFrequency /
                  totalEnergy /
                  dataArray.length,
                1
              )
            : 0;

        setVolume(normalizedVolume);
        setFrequency(
          normalizedFrequency
        );

        animationFrameRef.current =
          requestAnimationFrame(analyze);
      };

      analyze();
    } catch (error) {
      console.error(
        "Erro ao iniciar analisador de áudio:",
        error
      );

      setIsActive(false);
      setIsProcessing(false);

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        streamRef.current = null;
      }

      if (audioContextRef.current) {
        await audioContextRef.current
          .close()
          .catch(() => {});

        audioContextRef.current = null;
      }
    }
  }, [isActive]);

  const stop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(
        animationFrameRef.current
      );

      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current
        .close()
        .catch(() => {});

      audioContextRef.current = null;
    }

    analyserRef.current = null;

    setIsActive(false);
    setIsProcessing(false);
    setVolume(0);
    setFrequency(0);
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }

      if (audioContextRef.current) {
        audioContextRef.current
          .close()
          .catch(() => {});
      }
    };
  }, []);

  return {
    isActive,
    isProcessing,
    volume,
    frequency,
    start,
    stop,
  };
}
