import Image from "next/image";
import { useState } from "react";
import AnimalButton from "@/components/AnimalButton";
import StartButton from "@/components/StartButton";

export default function Home() {

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

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
          <div className="absolute top-[50%] left-[50%]">
            <StartButton onClick={handleStart} />
          </div>
        )}

        {audioContext && (
          <>
            <div className="absolute top-[20%] left-[40%]">
              <AnimalButton imagePath="/image/animal-eagle.svg" audioPath="/audio/outfoxing.mp3" audioContext={audioContext} />
            </div>
            <div className="absolute top-[50%] left-[45%]">
              <AnimalButton imagePath="/image/animal-goose.svg" audioPath="/audio/outfoxing.mp3" audioContext={audioContext} />
            </div>
            <div className="absolute top-[60%] left-[10%]">
              <AnimalButton imagePath="/image/animal-wolverine.svg" audioPath="/audio/outfoxing.mp3" audioContext={audioContext} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
