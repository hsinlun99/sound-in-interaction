import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface AnimalButtonProps {
  imagePath: string;
  audioPaths: string[];
  audioContext: AudioContext;
  audioColors: string[]; // Color array matching audio array exactly
  inactivityTimeout?: number;
}

const AnimalButton: React.FC<AnimalButtonProps> = ({ 
  imagePath, 
  audioPaths, 
  audioContext,
  audioColors,
  inactivityTimeout = 5000
}) => {
  const [audioBuffers, setAudioBuffers] = useState<AudioBuffer[]>([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [borderWidth, setBorderWidth] = useState<number>(0);
  const [currentBorderColor, setCurrentBorderColor] = useState<string>(audioColors[0]);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isHoveringRef = useRef<boolean>(false);
  const timerIdRef = useRef<number | null>(null);
  const currentIndexRef = useRef<number>(0);

  useEffect(() => {
    // Load all audio files
    const loadAudios = async () => {
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
      } catch (err) {
        console.error("Error loading audio files:", err);
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
  }, [audioPaths, audioContext, imagePath]);

  // When currentAudioIndex changes, update the ref and border color
  useEffect(() => {
    currentIndexRef.current = currentAudioIndex;
    setCurrentBorderColor(audioColors[currentAudioIndex]);
  }, [currentAudioIndex, audioColors]);

  // Function to adjust color brightness based on volume
  const adjustColorBrightness = (color: string, factor: number) => {
    // Convert hex to RGB
    let hex = color.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Adjust brightness (limited to valid RGB values)
    const adjustedR = Math.min(255, Math.max(0, Math.floor(r * factor)));
    const adjustedG = Math.min(255, Math.max(0, Math.floor(g * factor)));
    const adjustedB = Math.min(255, Math.max(0, Math.floor(b * factor)));
    
    // Convert back to hex
    return `#${adjustedR.toString(16).padStart(2, '0')}${adjustedG.toString(16).padStart(2, '0')}${adjustedB.toString(16).padStart(2, '0')}`;
  };

  // Function to analyze audio volume and update visual effects
  const analyzeAudio = () => {
    if (!analyserRef.current || !isHoveringRef.current) {
      setScale(1);
      setBorderWidth(0);
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
    
    // Make the color more vibrant based on volume
    // Higher volume = brighter/more saturated color
    const baseColor = audioColors[currentIndexRef.current];
    const brightnessMultiplier = 1 + (normalizedValue * 0.5); // from 1.0 to 1.5
    
    if (baseColor.startsWith('#')) {
      setCurrentBorderColor(adjustColorBrightness(baseColor, brightnessMultiplier));
    }
    
    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  // Function to stop currently playing audio
  const stopAudio = () => {
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
    setCurrentBorderColor(audioColors[currentIndexRef.current]);
  };

  // Function to clear the inactivity timer
  const clearResetTimer = () => {
    if (timerIdRef.current !== null) {
      window.clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  };

  // Function to start/restart the inactivity timer
  const startResetTimer = () => {
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
  };

  // Function to play audio with specified index
  const playAudioWithIndex = (index: number) => {
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
  };

  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    playAudioWithIndex(currentIndexRef.current);
    
    // Start animation if we have an analyser node
    if (analyserRef.current && animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    stopAudio();
    // Reset visual effects
    setScale(1);
    setBorderWidth(0);
    setCurrentBorderColor(audioColors[currentIndexRef.current]);
  };

  const handleClick = () => {
    // Calculate new index
    const newIndex = (currentAudioIndex + 1) % audioBuffers.length;
    console.log(`Clicking: changing index from ${currentAudioIndex} to ${newIndex}`);
    
    // Update state with new index
    setCurrentAudioIndex(newIndex);
    currentIndexRef.current = newIndex; // Update ref immediately too
    
    // Play the new audio (this will stop any currently playing audio)
    playAudioWithIndex(newIndex);
    
    // Restart the inactivity timer
    startResetTimer();
  };

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
        width: "110px",
        height: "110px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "50%",
        backgroundColor: audioColors[currentAudioIndex],
        transition: "background-color 0.3s ease",
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
          alt="Animal" 
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