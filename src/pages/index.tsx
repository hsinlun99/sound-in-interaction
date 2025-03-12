import React, { useState } from "react";
import StartButton from "@/components/StartButton";
import InteractiveSlider from "@/components/InteractiveSlider";
import AnimalData from "../../public/data/animals-data.json";

export default function Home() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isAudioReady, setIsAudioReady] = useState<boolean>(false);

  const eagle = AnimalData[0];


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
            <div className="col-span-2 flex items-center">
              <div className="grid grid-rows-3">
                <div>
                  <button>eagle</button>
                </div>
                <div>
                  <button>eagle</button>
                </div>
                <div>
                  <button>eagle</button>
                </div>
              </div>
            </div>

            <div className="col-span-8 grid grid-row-6 mx-auto items-center min-w-6/12">
              <div className="row-span-2 flex items-center justify-center">
                <button>play/pause</button>

              </div>
              <div className="w-full">
                <InteractiveSlider years={eagle.years} audioContext={audioContext} yearAudios={eagle.yearAudios} />
              </div>
            </div>


            <div className="col-span-2 flex items-center">
              <button>eagle</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}