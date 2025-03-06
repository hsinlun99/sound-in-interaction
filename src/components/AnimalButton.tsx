import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface AnimalButtonProps {
  imagePath: string;
  audioPaths: string[];
  audioContext: AudioContext;
  inactivityTimeout?: number; // Time in milliseconds before resetting to first audio
}

const AnimalButton: React.FC<AnimalButtonProps> = ({ 
  imagePath, 
  audioPaths, 
  audioContext,
  inactivityTimeout = 5000 // 5 secondes
}) => {
  const [audioBuffers, setAudioBuffers] = useState<AudioBuffer[]>([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(0);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isHoveringRef = useRef<boolean>(false);
  const timerIdRef = useRef<number | null>(null);
  const currentIndexRef = useRef<number>(0); // Track current index in a ref too

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
    };
  }, [audioPaths, audioContext, imagePath]);

  // When currentAudioIndex changes, update the ref
  useEffect(() => {
    currentIndexRef.current = currentAudioIndex;
  }, [currentAudioIndex]);

  // Function to stop currently playing audio
  const stopAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
      gainNodeRef.current = null;
    }
  };

  // Function to clear the inactivity timer
  const clearResetTimer = () => {
    console.log("Clearing reset timer");
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

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 1; // Full volume immediately

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.start(0);
      sourceRef.current = source;
      gainNodeRef.current = gainNode;

      console.log(`Playing audio ${index + 1} of ${audioBuffers.length}`);
      
      // Set up event listener for when audio ends
      source.onended = () => {
        // Only clear refs if we haven't already stopped this source
        if (sourceRef.current === source) {
          sourceRef.current = null;
          gainNodeRef.current = null;
          
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
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    stopAudio();
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
        border: "none", 
        padding: 0, 
        cursor: "pointer"
      }}
    >
      <Image src={imagePath} alt="Animal" width={100} height={100} priority />
    </button>
  );
};

export default AnimalButton;