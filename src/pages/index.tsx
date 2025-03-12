import React, { useState } from "react";
import StartButton from "@/components/StartButton";
import InteractiveSlider from "@/components/InteractiveSlider";
import AnimalData from "../../public/data/animals-data.json";
import Image from "next/image";
import ModeToggler from "@/components/ModeToggler";

export default function Home() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isAudioReady, setIsAudioReady] = useState<boolean>(false);
  const [activeAnimal, setActiveAnimal] = useState("eagle");

  const [isAnswerShown, setIsAnswerShown] = useState(false);

  const handleAnimalClick = (animal: React.SetStateAction<string>) => {
    setActiveAnimal(animal);
  };

  const eagle = AnimalData[0];
  const goose = AnimalData[1];
  const wolverine = AnimalData[2];

  const handleStart = async () => {
    if (!audioContext) {
      try {
        const context = new AudioContext();
        setAudioContext(context);

        // Ensure audio context is fully resumed before continuing
        await context.resume().then(() => {
          console.log("AudioContext is resumed and ready");
        })

        setIsAudioReady(true);
      } catch (err) {
        console.error("Error initializing audio context:", err);
      }
    }
  };
  return (
    <>
      {!isAudioReady && (
        <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
          <StartButton onClick={handleStart} />
        </div>
      )}
      {isAudioReady && (
        <>
          <div className="justify-between flex w-screen min-w-full min-h-screen">
            <div className="col-span-2 flex items-start">
              <div className="grid grid-rows-3">
                <button
                  className={`row-span-1 p-2 rounded-full ${activeAnimal === "eagle" ? "bg-gray-200" : ""}`}
                  onClick={() => handleAnimalClick("eagle")}
                >
                  <Image src="/image/animal-eagle.svg" alt="eagle's icon" width={100} height={100} priority />
                </button>
                <button
                  className={`row-span-1 p-2 rounded-full ${activeAnimal === "goose" ? "bg-gray-200" : ""}`}
                  onClick={() => handleAnimalClick("goose")}
                >
                  <Image src="/image/animal-goose.svg" alt="goose's icon" width={100} height={100} priority />
                </button>
                <button
                  className={`row-span-1 p-2 rounded-full ${activeAnimal === "wolverine" ? "bg-gray-200" : ""}`}
                  onClick={() => handleAnimalClick("wolverine")}
                >
                  <Image src="/image/animal-wolverine.svg" alt="wolverine's icon" width={100} height={100} priority />
                </button>
              </div>
            </div>

            <div className="col-span-6 flex mx-auto items-center min-w-8/12">
              <div className="w-full">
                {activeAnimal === "eagle" && (
                  <InteractiveSlider years={eagle.years} audioContext={audioContext} yearAudios={eagle.yearAudios} healthLevels={eagle.healthLevels} population={eagle.population} yLabels={eagle.yLabels} isAnswerShown={isAnswerShown} />
                )}
                {activeAnimal === "goose" && (
                  <InteractiveSlider years={goose.years} audioContext={audioContext} yearAudios={goose.yearAudios} healthLevels={goose.healthLevels} population={goose.population} yLabels={goose.yLabels} isAnswerShown={isAnswerShown} />
                )}
                {activeAnimal === "wolverine" && (
                  <InteractiveSlider years={wolverine.years} audioContext={audioContext} yearAudios={wolverine.yearAudios} healthLevels={wolverine.healthLevels} population={wolverine.population} yLabels={wolverine.yLabels} isAnswerShown={isAnswerShown} />
                )}
                
              </div>
            </div>


            <div className="col-span-2 flex items-center">
              <ModeToggler isAnswerShown={isAnswerShown} setIsAnswerShown={setIsAnswerShown} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
