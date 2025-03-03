import { useEffect, useState } from "react";

const AudioPlayer = () => {
  const [, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const context = new AudioContext();
      const audio = new Audio("/audio/outfoxing.mp3");

      audio.play();
      console.log("add audio context", context);

      setAudioContext(context);
    }
  }, []);

  return (
    <div>AudioPlayer</div>
  );
};

export default AudioPlayer;