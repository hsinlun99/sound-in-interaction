import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
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
  borderColors: string[];
}

export default function Home() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isAudioReady, setIsAudioReady] = useState<boolean>(false);
  const [loadedAnimals, setLoadedAnimals] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    // Fetch animal data
    fetch("/data/animals-data.json")
      .then(res => res.json())
      .then(data => setAnimals(data))
      .catch(err => console.error("Error loading animal data:", err));
  }, []);

  const handleStart = async () => {
    if (!audioContext) {
      try {
        const context = new AudioContext();
        setAudioContext(context);
        
        // Ensure audio context is fully resumed before continuing
        await context.resume();
        console.log("AudioContext is resumed and ready");
        setIsAudioReady(true);
      } catch (err) {
        console.error("Error initializing audio context:", err);
      }
    }
  };

  // Use useCallback to prevent function recreation on each render
  const handleAudioLoaded = useCallback((animalId: string) => {
    setLoadedAnimals(prev => {
      // Only update if this animal hasn't been marked as loaded yet
      if (!prev[animalId]) {
        console.log(`Animal ${animalId} audio fully loaded`);
        return {
          ...prev,
          [animalId]: true
        };
      }
      return prev;
    });
  }, []);

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

        {!isAudioReady && (
          <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
            <StartButton onClick={handleStart} />
          </div>
        )}

        {isAudioReady && audioContext && animals.length > 0 && (
          <>
            {animals.map((animal) => (
              <React.Fragment key={animal.id}>
                {/* Only render the AudioLoader if this animal's audio isn't loaded yet */}
                {!loadedAnimals[animal.id] && (
                  <AudioLoader
                    animalId={animal.id}
                    audioPaths={animal.audioFiles}
                    audioContext={audioContext}
                    onLoaded={handleAudioLoaded}
                  />
                )}
                
                {/* Only show the AnimalButton if this animal's audio is loaded */}
                {loadedAnimals[animal.id] && (
                  <div 
                    className="absolute" 
                    style={{ top: animal.position.top, left: animal.position.left }}
                  >
                    <AnimalButton 
                      imagePath={animal.image} 
                      audioPaths={animal.audioFiles} 
                      audioContext={audioContext} 
                      audioColors={animal.borderColors}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// Component to preload audio and signal when it's done
interface AudioLoaderProps {
  animalId: string;
  audioPaths: string[];
  audioContext: AudioContext;
  onLoaded: (animalId: string) => void;
}

const AudioLoader: React.FC<AudioLoaderProps> = ({ animalId, audioPaths, audioContext, onLoaded }) => {
  // Use a ref to track if we've already called onLoaded
  const hasCalledOnLoaded = React.useRef(false);
  
  useEffect(() => {
    if (hasCalledOnLoaded.current) return;
    
    const loadAudios = async () => {
      try {
        // Load all audio files for this animal
        await Promise.all(
          audioPaths.map(async (path) => {
            const res = await fetch(path);
            const arrayBuffer = await res.arrayBuffer();
            return await audioContext.decodeAudioData(arrayBuffer);
          })
        );
        
        // Only call onLoaded once
        if (!hasCalledOnLoaded.current) {
          hasCalledOnLoaded.current = true;
          onLoaded(animalId);
        }
      } catch (err) {
        console.error(`Error loading audio for ${animalId}:`, err);
      }
    };

    loadAudios();
  }, [animalId, audioPaths, audioContext, onLoaded]);

  // This component doesn't render anything
  return null;
};
