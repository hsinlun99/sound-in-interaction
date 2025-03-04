import Image from "next/image";
import { useEffect, useState } from "react";
import AnimalButton from "@/components/AnimalButton";

export default function Home() {

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const context = new AudioContext();
      setAudioContext(context);
    }
  }, []);

  if (!audioContext) {
    return <div>Loading...</div>;
  }

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
        />
        <div className="absolute top-[20%] left-[40%]">
          <AnimalButton imagePath="/image/animal-eagle.svg" audioPath="/audio/outfoxing.mp3" audioContext={audioContext} />
        </div>
        <div className="absolute top-[50%] left-[45%]">
          <AnimalButton imagePath="/image/animal-goose.svg" audioPath="/audio/outfoxing.mp3" audioContext={audioContext} />
        </div>
        <div className="absolute top-[60%] left-[10%]">
          <AnimalButton imagePath="/image/animal-wolverine.svg" audioPath="/audio/outfoxing.mp3" audioContext={audioContext} />
        </div>
      </div>
    </div>
  );
}
