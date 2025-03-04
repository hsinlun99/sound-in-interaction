import { useEffect, useState } from "react";
import Image from "next/image";

interface AnimalButtonProps {
  imagePath: string;
  audioPath: string;
  audioContext: AudioContext;
}

const AnimalButton: React.FC<AnimalButtonProps> = ({ imagePath, audioPath, audioContext }) => {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  useEffect(() => {
    fetch(audioPath)
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
      .then((buffer) => setAudioBuffer(buffer))
      .catch((err) => console.error("Error loading audio:", err));
  }, [audioPath, audioContext]);

  const playAudio = () => {
    if (!audioBuffer) return;

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  };

  return (
    <button onClick={playAudio} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
      <Image src={imagePath} alt="Animal" width={100} height={100} priority />
    </button>
  );
};

export default AnimalButton;