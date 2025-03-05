import Image from "next/image";
import { useEffect, useState } from "react";
import AnimalButton from "@/components/AnimalButton";
import StartButton from "@/components/StartButton";

interface Animal {
  id: string;
  position: {
    top: string;
    left: string;
  };
  image: string;
  audioFiles: string[];
}

export default function Home() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);

  useEffect(() => {
    // Fetch animal data
    fetch("/data/animals-data.json")
      .then(res => res.json())
      .then(data => setAnimals(data))
      .catch(err => console.error("Error loading animal data:", err));
  }, []);

  const handleStart = () => {
    if (!audioContext) {
      const context = new AudioContext();
      setAudioContext(context);

      context.resume().then(() => {
        console.log("AudioContext is resumed and ready");
      });
    }
  };

  return (
    <div className="h-screen flex items-center justify-center overflow-hidden">
      <div className="relative h-screen p-5">
        <Image
          className="w-auto h-full object-contain"
          src={"/image/map.svg"}
          alt="sweden map"
          width={0}
          height={0}
          sizes="100vh"
          priority
        />

        {!audioContext && (
          <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
            <StartButton onClick={handleStart} />
          </div>
        )}

        {audioContext && animals.length > 0 && (
          <>
            {animals.map((animal) => (
              <div 
                key={animal.id} 
                className="absolute" 
                style={{ top: animal.position.top, left: animal.position.left }}
              >
                <AnimalButton 
                  imagePath={animal.image} 
                  audioPaths={animal.audioFiles} 
                  audioContext={audioContext} 
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}