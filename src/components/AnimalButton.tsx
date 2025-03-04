import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface AnimalButtonProps {
  imagePath: string;
  audioPath: string;
  audioContext: AudioContext;
}

const AnimalButton: React.FC<AnimalButtonProps> = ({ imagePath, audioPath, audioContext }) => {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    fetch(audioPath)
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
      .then((buffer) => setAudioBuffer(buffer))
      .catch((err) => console.error("Error loading audio:", err));
  }, [audioPath, audioContext]);

  const playAudio = () => {
    if (!audioBuffer || sourceRef.current) return;

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start();
    sourceRef.current = source;
    gainNodeRef.current = gainNode;
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

  return (
    <button
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
    >
      <Image src={imagePath} alt="Animal" width={100} height={100} priority />
    </button>
  );
};

export default AnimalButton;