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
      } catch (err) {
        console.error("Error loading audio files:", err);
      }
    };

    loadAudios();
  }, [audioPaths, audioContext]);


  const playAudio = () => {
    // Stop current audio if playing
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
      gainNodeRef.current = null;
    }

    // Return if no audio buffers loaded yet
    if (audioBuffers.length === 0) return;

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers[currentAudioIndex];

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start();
    sourceRef.current = source;
    gainNodeRef.current = gainNode;

    // Set up event listener for when audio ends
    source.onended = () => {
      sourceRef.current = null;
      gainNodeRef.current = null;
    };
  };

  const handleMouseEnter = () => {
    if (!sourceRef.current || !gainNodeRef.current) {
      playAudio();
    } else {
      gainNodeRef.current.gain.setTargetAtTime(1, audioContext.currentTime, 0.1);
    }
  };

  const handleMouseLeave = () => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(0, audioContext.currentTime, 0.1);
    }
  };

  const handleClick = () => {
    // Cycle to next audio in the list
    setCurrentAudioIndex((prevIndex) => (prevIndex + 1) % audioBuffers.length);

    // Stop current audio if playing
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
      gainNodeRef.current = null;
    }

    // Play the new audio if mouse is still over button
    setTimeout(playAudio, 10);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
    >
      <Image src={imagePath} alt={`Animal button of ${imagePath}`} width={100} height={100} priority />
    </button>
  );
};

export default AnimalButton;