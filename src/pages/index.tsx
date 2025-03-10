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
    <div className="grid min-h-screen">

      {/* Left sidebar with tabs (1/12 width) */}
      <div className="absolute top-10 left-10 flex flex-col items-center gap-2">
        <button
          className={`row-span-1 p-2 ${activeAnimal === "eagle" ? "bg-gray-200" : ""}`}
          onClick={() => handleAnimalClick("eagle")}
        >
          <Image src="/image/animal-eagle.svg" alt="eagle's icon" width={100} height={100} />
        </button>
        <button
          className={`row-span-1 p-2 ${activeAnimal === "goose" ? "bg-gray-200" : ""}`}
          onClick={() => handleAnimalClick("goose")}
        >
          <Image src="/image/animal-goose.svg" alt="goose's icon" width={100} height={100} />
        </button>
        <button
          className={`row-span-1 p-2 ${activeAnimal === "wolverine" ? "bg-gray-200" : ""}`}
          onClick={() => handleAnimalClick("wolverine")}
        >
          <Image src="/image/animal-wolverine.svg" alt="wolverine's icon" width={100} height={100} />
        </button>
      </div>


      <div className="grid row-span-full grid-rows-12">
        {/* Content for animals - only show the active one */}
        {activeAnimal === "eagle" && (
          <div className="row-span-full">
            <TimeLine years={eagle.years} yearAudios={eagle.yearAudios} />
          </div>
        )}

        {activeAnimal === "goose" && (
          <div className="row-span-full">
            <TimeLine years={goose.years} yearAudios={goose.yearAudios} />
          </div>
        )}

        {activeAnimal === "wolverine" && (
          <div className="row-span-full">
            <TimeLine years={wolverine.years} yearAudios={wolverine.yearAudios} />
            {/* Additional wolverine content */}
          </div>
        )}
      </div>
    </div>
  );
}