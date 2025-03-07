import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LoadingIndicator } from "./LoadingIndicator";
import { useAudioManager } from "./hooks/useAudioManager";
import { useInactivityTimer } from "./hooks/useInactivityTimer";
import { useAudioAnalyzer } from "./hooks/useAudioAnalyzer";
import { AnimalButtonProps } from "./types";

export const AnimalButton: React.FC<AnimalButtonProps> = ({ 
  imagePath, 
  audioPaths, 
  audioContext,
  audioColors,
  inactivityTimeout = 5000,
  isFrozen = false
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(0);
  const [currentBorderColor, setCurrentBorderColor] = useState<string>(audioColors[0]);
  const isHoveringRef = useRef<boolean>(false);
  const currentIndexRef = useRef<number>(0);
  const currentAnalyserRef = useRef<AnalyserNode | undefined>(undefined);

  const { 
    audioBuffers, 
    playAudioWithIndex, 
    stopAudio
  } = useAudioManager({
    audioPaths, 
    audioContext, 
    setIsLoading,
    imagePath
  });

  const {
    scale,
    borderWidth,
    buttonSize,
    startAnalyzing,
    stopAnalyzing,
    setAnalyser
  } = useAudioAnalyzer({
    audioContext,
    isHoveringRef
  });

  const { startResetTimer, clearResetTimer } = useInactivityTimer({
    currentIndexRef,
    inactivityTimeout,
    isFrozen,
    setCurrentAudioIndex,
    playAudioWithIndex,
    isHoveringRef
  });

  useEffect(() => {
    currentIndexRef.current = currentAudioIndex;
    setCurrentBorderColor(audioColors[currentAudioIndex]);
  }, [currentAudioIndex, audioColors]);

  useEffect(() => {
    if (isFrozen) {
      clearResetTimer();
      console.log("Freeze enabled: inactivity timer paused");
    } else if (currentIndexRef.current !== 0) {
      startResetTimer();
      console.log("Freeze disabled: inactivity timer resumed");
    }
  }, [isFrozen, clearResetTimer, startResetTimer]);

  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    const analyser = playAudioWithIndex(currentIndexRef.current);
    if (analyser) {
      currentAnalyserRef.current = analyser;
      setAnalyser(analyser);
      startAnalyzing();
    }
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    stopAudio();
    currentAnalyserRef.current = undefined;
    stopAnalyzing();
    setCurrentBorderColor(audioColors[currentIndexRef.current]);
  };

  const handleClick = () => {
    const newIndex = (currentAudioIndex + 1) % audioBuffers.length;
    console.log(`Clicking: changing index from ${currentAudioIndex} to ${newIndex}`);
    
    setCurrentAudioIndex(newIndex);
    currentIndexRef.current = newIndex;
    
    const analyser = playAudioWithIndex(newIndex);
    if (analyser && isHoveringRef.current) {
      currentAnalyserRef.current = analyser;
      setAnalyser(analyser);
      startAnalyzing();
    }
    
    if (!isFrozen) {
      startResetTimer();
    } else {
      console.log("Freeze active: not starting inactivity timer after click");
    }
  };

  if (isLoading) {
    return <LoadingIndicator color={audioColors[0]} />;
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        background: "none", 
        border: `${borderWidth}px solid ${currentBorderColor}`, 
        padding: 0, 
        cursor: "pointer",
        position: "relative",
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "50%",
        backgroundColor: audioColors[currentAudioIndex],
        transition: "background-color 0.3s ease, width 0.05s ease-out, height 0.05s ease-out",
        boxShadow: isHoveringRef.current ? `0 0 ${borderWidth * 2}px ${currentBorderColor}` : "none"
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100px",
          height: "100px",
          transform: `scale(${scale})`,
          transition: "transform 0.05s ease-out"
        }}
      >
        <Image 
          src={imagePath} 
          alt={`Animal button of ${imagePath}`} 
          width={100} 
          height={100} 
          priority
          style={{ objectFit: "contain" }}
        />
      </div>
    </button>
  );
};