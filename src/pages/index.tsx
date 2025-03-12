import React, { useState } from "react";
import StartButton from "@/components/StartButton";
import InteractiveSlider from "@/components/InteractiveSlider";
import AnimalData from "../../public/data/animals-data.json";
import Image from "next/image";
import ModeToggler from "@/components/ModeToggler";
import AnimalFact from "@/components/AnimalFact";

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
    <div className="justify-between w-screen min-w-screen min-h-screen grid grid-cols-11">
      {!isAudioReady && (
        <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
          <StartButton onClick={handleStart} />
        </div>
      )}
      {isAudioReady && (
        <>
          <div className="col-span-2 flex items-start">
            <div className="grid grid-rows-3 gap-1 ml-4 mt-4">
              <button
                className={`row-span-1 p-2 rounded-full ${activeAnimal === "eagle" ? "bg-blue-500" : ""}`}
                onClick={() => handleAnimalClick("eagle")}
              >
                <Image src="/image/animal-eagle.svg" alt="eagle's icon" width={100} height={100} priority />
              </button>
              <button
                className={`row-span-1 p-2 rounded-full ${activeAnimal === "goose" ? "bg-blue-500" : ""}`}
                onClick={() => handleAnimalClick("goose")}
              >
                <Image src="/image/animal-goose.svg" alt="goose's icon" width={100} height={100} priority />
              </button>
              <button
                className={`row-span-1 p-2 rounded-full ${activeAnimal === "wolverine" ? "bg-blue-500" : ""}`}
                onClick={() => handleAnimalClick("wolverine")}
              >
                <Image src="/image/animal-wolverine.svg" alt="wolverine's icon" width={100} height={100} priority />
              </button>
            </div>
          </div>

          <div className="col-span-6 flex mx-auto items-center">
            <div className="w-full grid">
              {activeAnimal === "eagle" && (
                <>
                  <div className="row-span-3">
                    <AnimalFact animalId={eagle.id} facts={eagle.facts} />
                  </div>
                  <div className="row-span-8">
                    <InteractiveSlider years={eagle.years} audioContext={audioContext} yearAudios={eagle.yearAudios} healthLevels={eagle.healthLevels} population={eagle.population} yLabels={eagle.yLabels} isAnswerShown={isAnswerShown} />

                  </div>
                </>
              )}
              {activeAnimal === "goose" && (
                <>
                  <AnimalFact animalId={goose.id} facts={goose.facts} />
                  <InteractiveSlider years={goose.years} audioContext={audioContext} yearAudios={goose.yearAudios} healthLevels={goose.healthLevels} population={goose.population} yLabels={goose.yLabels} isAnswerShown={isAnswerShown} />
                </>
              )}
              {activeAnimal === "wolverine" && (
                <>
                  <AnimalFact animalId={wolverine.id} facts={wolverine.facts} />
                  <InteractiveSlider years={wolverine.years} audioContext={audioContext} yearAudios={wolverine.yearAudios} healthLevels={wolverine.healthLevels} population={wolverine.population} yLabels={wolverine.yLabels} isAnswerShown={isAnswerShown} />
                </>
              )}

            </div>
          </div>


          <div>
            <ModeToggler isAnswerShown={isAnswerShown} setIsAnswerShown={setIsAnswerShown} />
          </div>

        </>
      )}
    </div>
  );
}
