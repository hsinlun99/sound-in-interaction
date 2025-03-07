import { useState, useCallback, useRef, RefObject } from 'react';

interface UseAudioAnalyzerProps {
  audioContext: AudioContext;
  isHoveringRef: RefObject<boolean>;
}

export const useAudioAnalyzer = ({ 
  isHoveringRef
}: UseAudioAnalyzerProps) => {
  const [scale, setScale] = useState<number>(1);
  const [borderWidth, setBorderWidth] = useState<number>(0);
  const [buttonSize, setButtonSize] = useState<number>(110);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);


  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !isHoveringRef.current) {
      setScale(1);
      setBorderWidth(0);
      setButtonSize(110);
      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    

    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedValue = average / 256;
    
    const newScale = 1 + (normalizedValue * 0.4);
    setScale(newScale);
    
    const newBorderWidth = Math.floor(normalizedValue * 8);
    setBorderWidth(newBorderWidth);
    

    const newButtonSize = 110 + Math.floor(normalizedValue * 20);
    setButtonSize(newButtonSize);
    

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [isHoveringRef]);

  const startAnalyzing = useCallback(() => {
    if (analyserRef.current && animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  }, [analyzeAudio]);

  const stopAnalyzing = useCallback(() => {

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setScale(1);
    setBorderWidth(0);
    setButtonSize(110); 
  }, []);

  const setAnalyser = useCallback((analyser: AnalyserNode | null) => {
    analyserRef.current = analyser;
  }, []);

  return {
    scale,
    borderWidth,
    buttonSize,
    startAnalyzing,
    stopAnalyzing,
    setAnalyser,
    analyserRef
  };
};