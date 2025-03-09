import Image from "next/image";
import React, { useState } from "react";

export default function Home() {
  // State to track which animal tab is active
  const [activeAnimal, setActiveAnimal] = useState("eagle");

  // Handler for button clicks
  const handleAnimalClick = (animal: React.SetStateAction<string>) => {
    setActiveAnimal(animal);
  };

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

      <div className="row-span-1 p-6">
        {/* Content for animals - only show the active one */}
        {activeAnimal === "eagle" && (
          <div>
            <h2 className="text-2xl font-bold">Eagle</h2>
            <p>Eagles are large birds of prey known for their keen eyesight and powerful flight.</p>
            {/* Additional eagle content */}
          </div>
        )}
        
        {activeAnimal === "goose" && (
          <div>
            <h2 className="text-2xl font-bold">Goose</h2>
            <p>Geese are waterfowl belonging to the family Anatidae. They are known for their migration patterns and distinctive honking.</p>
            {/* Additional goose content */}
          </div>
        )}
        
        {activeAnimal === "wolverine" && (
          <div>
            <h2 className="text-2xl font-bold">Wolverine</h2>
            <p>Wolverines are powerful and ferocious mammals that resemble small bears but are actually the largest member of the weasel family.</p>
            {/* Additional wolverine content */}
          </div>
        )}
      </div>
    </div>
  );
}