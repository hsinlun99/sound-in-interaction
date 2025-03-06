import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface AnimalButtonProps {
  imagePath: string;
  audioPaths: string[];
  audioContext: AudioContext;
}

const AnimalButton: React.FC<AnimalButtonProps> = ({ imagePath, audioPaths, audioContext }) => {
  const [audioBuffers, setAudioBuffers] = useState<AudioBuffer[]>([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(0);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isHoveringRef = useRef<boolean>(false);

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
    };
  }, [audioPaths, audioContext, imagePath]);

  // Function to stop currently playing audio
  const stopAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
      gainNodeRef.current = null;
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
            playAudioWithIndex(currentAudioIndex);
          }
        }
      };
    } catch (err) {
      console.error("Error playing audio:", err);
    }
  };

  const playCurrentAudio = () => {
    playAudioWithIndex(currentAudioIndex);
  };

  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    playCurrentAudio();
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    stopAudio();
  };

  const handleClick = () => {
    // Calculate new index
    const newIndex = (currentAudioIndex + 1) % audioBuffers.length;
    
    // Update state with new index
    setCurrentAudioIndex(newIndex);
    
    // Play the new audio (this will stop any currently playing audio)
    playAudioWithIndex(newIndex);
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