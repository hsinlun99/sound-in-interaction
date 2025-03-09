import TimeLine from "@/components/TimeLine";
import Image from "next/image";
import React, { useState } from "react";
import AnimalData from "../../public/data/animals-data.json"

export default function Home() {
  // State to track which animal tab is active
  const [activeAnimal, setActiveAnimal] = useState("eagle");

  // Handler for button clicks
  const handleAnimalClick = (animal: React.SetStateAction<string>) => {
    setActiveAnimal(animal);
  };

  const eagle = AnimalData[0];
  const goose = AnimalData[1];
  const wolverine = AnimalData[2];

  return (
    <div className="grid grid-rows-3 min-h-screen">
      {/* Main area (top 2/3) */}
      <div className="grid row-span-2 grid-cols-12">
        {/* Left sidebar with tabs (1/12 width) */}
        <div className="col-span-1 flex flex-col items-center">
          <button 
            className={`p-2 ${activeAnimal === "eagle" ? "bg-gray-200" : ""}`}
            onClick={() => handleAnimalClick("eagle")}
          >
            <Image src="/image/animal-eagle.svg" alt="eagle's icon" width={100} height={100} />
          </button>
          <button 
            className={`p-2 ${activeAnimal === "goose" ? "bg-gray-200" : ""}`}
            onClick={() => handleAnimalClick("goose")}
          >
            <Image src="/image/animal-goose.svg" alt="goose's icon" width={100} height={100} />
          </button>
          <button 
            className={`p-2 ${activeAnimal === "wolverine" ? "bg-gray-200" : ""}`}
            onClick={() => handleAnimalClick("wolverine")}
          >
            <Image src="/image/animal-wolverine.svg" alt="wolverine's icon" width={100} height={100} />
          </button>
        </div>

        <div className="col-span-11 flex items-center justify-center">
          <Image
            className="w-auto h-auto max-w-full max-h-full"
            src="/image/player-play.svg"
            alt="player"
            width={0}
            height={0}
            sizes="100vw"
            priority
          />
        </div>
      </div>

      <div className="grid row-span-1 grid-rows-12">
        {/* Content for animals - only show the active one */}
        {activeAnimal === "eagle" && (
          <div className="row-span-full">
            <TimeLine years={eagle.years} />
          </div>
        )}
        
        {activeAnimal === "goose" && (
          <div className="row-span-full">
            <TimeLine years={goose.years} />
          </div>
        )}
        
        {activeAnimal === "wolverine" && (
          <div className="row-span-full">
            <TimeLine years={wolverine.years} />
            {/* Additional wolverine content */}
          </div>
        )}
      </div>
    </div>
  );
}