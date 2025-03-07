import { useState, useCallback, useRef, useEffect } from 'react';

interface UseAudioManagerProps {
  audioPaths: string[];
  audioContext: AudioContext;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  imagePath: string;
}

export const useAudioManager = ({
  audioPaths,
  audioContext,
  setIsLoading,
  imagePath
}: UseAudioManagerProps) => {
  const [audioBuffers, setAudioBuffers] = useState<AudioBuffer[]>([]);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
      gainNodeRef.current = null;
      analyserRef.current = null;
    }
  }, []);

  useEffect(() => {
    const loadAudios = async () => {
      setIsLoading(true);
      try {
        const buffers = await Promise.all(
          audioPaths.map(async (path) => {
            const res = await fetch(path);
            const arrayBuffer = await res.arrayBuffer();
            return await audioContext.decodeAudioData(arrayBuffer);
          })
        );
        setAudioBuffers(buffers);
        console.log(`Loaded ${buffers.length} audio files for ${imagePath}`);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading audio files:", err);
        setIsLoading(false);
      }
    };

    loadAudios();

    return () => {
      stopAudio();
    };
  }, [audioPaths, audioContext, imagePath, setIsLoading, stopAudio]);

  const playAudioWithIndex = useCallback((index: number) => {
    if (audioBuffers.length === 0) return;

    stopAudio();

    try {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffers[index];


      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 1;


      source.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.start(0);
      sourceRef.current = source;
      gainNodeRef.current = gainNode;

      console.log(`Playing audio ${index + 1} of ${audioBuffers.length}`);


      source.onended = () => {

        if (sourceRef.current === source) {
          sourceRef.current = null;
          gainNodeRef.current = null;
          analyserRef.current = null;
        }
      };
    } catch (err) {
      console.error("Error playing audio:", err);
    }

    return analyserRef.current;
  }, [audioBuffers, audioContext, stopAudio]);

  return {
    audioBuffers,
    playAudioWithIndex,
    stopAudio,
    analyserRef
  };
};