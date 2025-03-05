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
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
    };
  }, [audioPaths, audioContext, imagePath]);

  const playAudio = () => {
    if (audioBuffers.length === 0) return;
    
    // Stop current audio if playing
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }

    try {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffers[currentAudioIndex];

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 1; // Full volume immediately

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.start(0);
      sourceRef.current = source;
      gainNodeRef.current = gainNode;

      console.log(`Playing audio ${currentAudioIndex + 1} of ${audioBuffers.length}`);
      
      // Set up event listener for when audio ends
      source.onended = () => {
        sourceRef.current = null;
        gainNodeRef.current = null;
      };
    } catch (err) {
      console.error("Error playing audio:", err);
    }
  };

  const handleMouseEnter = () => {
    playAudio();
  };

  const handleMouseLeave = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
      gainNodeRef.current = null;
    }
  };

  const handleClick = () => {
    setCurrentAudioIndex((prevIndex) => (prevIndex + 1) % audioBuffers.length);
    
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    
    playAudio();
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