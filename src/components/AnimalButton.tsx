import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

interface AnimalButtonProps {
  imagePath: string;
  audioPaths: string[];
  audioContext: AudioContext;
  audioColors: string[]; // Color array matching audio array exactly
  inactivityTimeout?: number;
  isFrozen?: boolean; // New prop to control timer functionality
}

const AnimalButton: React.FC<AnimalButtonProps> = ({ 
  imagePath, 
  audioPaths, 
  audioContext,
  audioColors,
  inactivityTimeout = 5000,
  isFrozen = false // Default to false
}) => {
  const [audioBuffers, setAudioBuffers] = useState<AudioBuffer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // New loading state
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [borderWidth, setBorderWidth] = useState<number>(0);
  const [buttonSize, setButtonSize] = useState<number>(110); // Base button size
  const [currentBorderColor, setCurrentBorderColor] = useState<string>(audioColors[0]);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isHoveringRef = useRef<boolean>(false);
  const timerIdRef = useRef<number | null>(null);
  const currentIndexRef = useRef<number>(0);

  // Define stopAudio with useCallback to avoid dependency issues
  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
      gainNodeRef.current = null;
      analyserRef.current = null;
    }
    
    // Cancel any ongoing animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Reset visual effects when audio stops
    setScale(1);
    setBorderWidth(0);
    setButtonSize(110); // Reset button size to default
    setCurrentBorderColor(audioColors[currentIndexRef.current]);
  }, [audioColors]);

  // Define clearResetTimer with useCallback
  const clearResetTimer = useCallback(() => {
    if (timerIdRef.current !== null) {
      window.clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Load all audio files
    const loadAudios = async () => {
      setIsLoading(true); // Set loading to true at the start
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
        setIsLoading(false); // Set loading to false once complete
      } catch (err) {
        console.error("Error loading audio files:", err);
        setIsLoading(false); // Also set loading to false on error
      }
    };

    loadAudios();
    
    return () => {
      stopAudio();
      clearResetTimer();
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioPaths, audioContext, imagePath, stopAudio, clearResetTimer]);

  // When currentAudioIndex changes, update the ref and border color
  useEffect(() => {
    currentIndexRef.current = currentAudioIndex;
    setCurrentBorderColor(audioColors[currentAudioIndex]);
  }, [currentAudioIndex, audioColors]);

  // Function to analyze audio volume and update visual effects
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !isHoveringRef.current) {
      setScale(1);
      setBorderWidth(0);
      setButtonSize(110); // Reset button size
      return;
    }

    // Create dataArray to receive frequency data
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume level
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedValue = average / 256; // Normalize to 0-1 range
    
    // Scale from 1 to 1.4 based on volume (more noticeable)
    const newScale = 1 + (normalizedValue * 0.4);
    setScale(newScale);
    
    // Adjust border width based on volume (0px to 8px)
    const newBorderWidth = Math.floor(normalizedValue * 8);
    setBorderWidth(newBorderWidth);
    
    // Adjust button size based on volume (110px to 130px)
    // Adding up to 20px to the base size depending on volume
    const newButtonSize = 110 + Math.floor(normalizedValue * 20);
    setButtonSize(newButtonSize);
    
    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, []);

  const playAudioWithIndex = useCallback((index: number) => {
    if (audioBuffers.length === 0) return;
    
    // Always stop current audio before playing new one
    stopAudio();

    try {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffers[index];

      // Create analyser node with more detailed FFT for better responsiveness
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128; // Smaller size for more responsive visualization
      analyser.smoothingTimeConstant = 0.5; // Adjust for smoother transitions (0.8 is default)
      analyserRef.current = analyser;

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 1; // Full volume immediately

      // Connect nodes: source -> analyser -> gain -> destination
      source.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.start(0);
      sourceRef.current = source;
      gainNodeRef.current = gainNode;

      console.log(`Playing audio ${index + 1} of ${audioBuffers.length}`);
      
      // Start the animation loop
      if (isHoveringRef.current) {
        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      }
      
      // Set up event listener for when audio ends
      source.onended = () => {
        // Only clear refs if we haven't already stopped this source
        if (sourceRef.current === source) {
          sourceRef.current = null;
          gainNodeRef.current = null;
          analyserRef.current = null;
          
          // Cancel animation frame
          if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          
          // Reset visual effects
          setScale(1);
          setBorderWidth(0);
          setButtonSize(110); // Reset button size
          setCurrentBorderColor(audioColors[currentIndexRef.current]);
          
          // If user is still hovering, play the hover audio again
          if (isHoveringRef.current) {
            playAudioWithIndex(currentIndexRef.current);
          }
        }
      };
    } catch (err) {
      console.error("Error playing audio:", err);
    }
  }, [audioBuffers, audioColors, audioContext, analyzeAudio, stopAudio]);

  
  // Function to start/restart the inactivity timer
  const startResetTimer = useCallback(() => {
    // Don't start the timer if frozen
    if (isFrozen) {
      console.log("Freeze active: not starting inactivity timer");
      return;
    }
    
    // Clear any existing timer first
    clearResetTimer();
    
    // Only start a timer if we're not at index 0
    if (currentIndexRef.current !== 0) {
      console.log(`Starting reset timer (${inactivityTimeout}ms)`);
      
      // Use window.setTimeout and store the numeric ID
      timerIdRef.current = window.setTimeout(() => {
        console.log("Inactivity timeout: Resetting to first audio");
        setCurrentAudioIndex(0);
        
        // If currently hovering, play the first audio
        if (isHoveringRef.current) {
          playAudioWithIndex(0);
        }
        
        timerIdRef.current = null;
      }, inactivityTimeout);
    }
  }, [clearResetTimer, inactivityTimeout, playAudioWithIndex, isFrozen]);

    // React to changes in the frozen state
    useEffect(() => {
      if (isFrozen) {
        // When frozen, clear any existing inactivity timer
        clearResetTimer();
        console.log("Freeze enabled: inactivity timer paused");
      } else if (currentIndexRef.current !== 0) {
        // When unfrozen, restart inactivity timer if not at default audio
        startResetTimer();
        console.log("Freeze disabled: inactivity timer resumed");
      }
    }, [isFrozen, clearResetTimer, startResetTimer]);
  

  // Function to play audio with specified index
  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    playAudioWithIndex(currentIndexRef.current);
    
    // Start animation if we have an analyser node
    if (analyserRef.current && animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  }, [playAudioWithIndex, analyzeAudio]);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    stopAudio();
    // Reset visual effects
    setScale(1);
    setBorderWidth(0);
    setButtonSize(110); // Reset button size
    setCurrentBorderColor(audioColors[currentIndexRef.current]);
  }, [audioColors, stopAudio]);

  const handleClick = useCallback(() => {
    // Calculate new index
    const newIndex = (currentAudioIndex + 1) % audioBuffers.length;
    console.log(`Clicking: changing index from ${currentAudioIndex} to ${newIndex}`);
    
    // Update state with new index
    setCurrentAudioIndex(newIndex);
    currentIndexRef.current = newIndex; // Update ref immediately too
    
    // Play the new audio (this will stop any currently playing audio)
    playAudioWithIndex(newIndex);
    
    // Restart the inactivity timer (if not frozen)
    if (!isFrozen) {
      startResetTimer();
    } else {
      console.log("Freeze active: not starting inactivity timer after click");
    }
  }, [audioBuffers.length, currentAudioIndex, playAudioWithIndex, startResetTimer, isFrozen]);

  // Loading indicator component
  const LoadingIndicator = () => (
    <div
      style={{
        width: "110px",
        height: "110px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "50%",
      }}
    >
      <div 
        style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(0, 0, 0, 0.1)",
          borderLeftColor: audioColors[0],
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Return loading indicator if files are still loading
  if (isLoading) {
    return <LoadingIndicator />;
  }

  // Only render the button once loading is complete
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
          transition: "transform 0.05s ease-out" // Fast transition for responsive feel
        }}
      >
        <Image 
          src={imagePath} 
          alt={`Animal button of ${imagePath}`} 
          width={100} 
          height={100} 
          priority
          style={{
            objectFit: "contain"
          }}
        />
      </div>
    </button>
  );
};

export default AnimalButton;