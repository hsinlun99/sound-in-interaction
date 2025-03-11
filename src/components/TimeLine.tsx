import React, { useState, useRef, useEffect, useCallback } from 'react';
import PlayButton from './PlayButton';
import AnimalFact from './AnimalFact';

interface TimeLineProps {
  years: number[];
  yearAudios: string[];
  healthLevels: string[];
  population: number[];
  yLabels: number[];
  facts: string[];
  animalId: string;
}

const TimeLine: React.FC<TimeLineProps> = ({ years, yearAudios, healthLevels, population, yLabels, facts, animalId }) => {
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentYearIndex, setCurrentYearIndex] = useState(0);
  const [isAnswerShown, setIsAnswerShown] = useState(false);

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset selected year when years array changes
  useEffect(() => {
    // If the currently selectedYear isn't in the new years array, reset to the first year
    if (!years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  // Calculate the current position based on the selected year
  const calculatePosition = useCallback((year: number) => {
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const yearRange = maxYear - minYear;
    return yearRange > 0
      ? ((year - minYear) / yearRange) * 100
      : 50; // Default to middle if all years are the same
  }, [years]);

  // Play audio file for the current year with looping
  const playYearAudio = useCallback((yearIndex: number) => {
    // 檢查是否有對應的音頻文件
    if (yearIndex >= 0 && yearIndex < yearAudios.length) {
      const audioPath = yearAudios[yearIndex];

      // 停止當前播放的音頻
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // 創建新的音頻元素
      const audio = new Audio(audioPath);
      audioRef.current = audio;

      // Always enable looping
      audio.loop = true;

      // 明確設置 isPlaying 為 true - 這會影響播放按鈕的顯示
      setIsPlaying(true);

      // 播放音頻
      audio.play().catch(error => {
        console.error("Error playing audio:", error);
        setIsPlaying(false); // 如果出錯，重置播放狀態
      });
    }
  }, [yearAudios]);

  // Toggle playback state - now just starts or stops the current year's audio
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      // Stop playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    } else {
      // Play the current year's audio with looping
      const index = years.indexOf(selectedYear);
      if (index !== -1) {
        playYearAudio(index);
      }
    }
  }, [isPlaying, playYearAudio, selectedYear, years]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Handle slider thumb movement
  const handleSliderChange = useCallback((e: MouseEvent) => {
    if (!sliderRef.current) return;
    const sliderWidth = sliderRef.current.clientWidth;
    const clickPosition = e.clientX - sliderRef.current.getBoundingClientRect().left;
    const percentPosition = (clickPosition / sliderWidth) * 100;

    // Calculate the min and max years
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const yearRange = maxYear - minYear;

    // Convert click position to a year value
    const clickedYear = minYear + (yearRange * (percentPosition / 100));

    // Find the closest year in the years array
    let closestYear = years[0];
    let minDistance = Math.abs(closestYear - clickedYear);

    years.forEach((year) => {
      const distance = Math.abs(year - clickedYear);
      if (distance < minDistance) {
        minDistance = distance;
        closestYear = year;
      }
    });

    const closestIndex = years.indexOf(closestYear);

    setSelectedYear(closestYear);
    setCurrentYearIndex(closestIndex);

    // If already playing, start playing the new year's audio
    if (isPlaying) {
      playYearAudio(closestIndex);
    }

  }, [years, playYearAudio, isPlaying]);

  // React click event handler
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handleSliderChange(e.nativeEvent);
  }, [handleSliderChange]);

  // Calculate max and min population for scaling
  const maxPopulation = Math.max(...population);
  const minPopulation = Math.min(...population);

  // Function to calculate vertical position based on population value
  const calculateVerticalPosition = (popValue: number) => {
    // If all values are the same, position in the middle
    if (maxPopulation === minPopulation) return 50;

    // Calculate percentage from bottom (0%) to top (100%)
    // Normalize the population value between min and max
    return ((popValue - minPopulation) / (maxPopulation - minPopulation)) * 100;
  };

  return (
    <div className="grid grid-rows-5 h-screen w-full max-w-full mx-auto overflow-hidden">
      {/* Button section - top 3/5 */}

      <div className="absolute top-4 right-4 flex items-center gap-2">
        {/* off */}
        <span className="text-sm font-medium text-gray-400">OFF</span>

        {/* Toggle Button */}
        <button
          onClick={() => setIsAnswerShown(prev => !prev)}
          className={`w-14 h-8 rounded-full ${isAnswerShown ? 'bg-[#5F75D7]' : 'bg-[#636363]'
            } flex items-center px-1 transition-colors duration-200`}
        >
          <div
            className={`w-6 h-6 bg-white rounded-full shadow-md transform ${isAnswerShown ? 'translate-x-6' : 'translate-x-0'
              } transition-transform duration-200`}
          />
        </button>
        {/* on */}
        <span className="text-sm font-medium text-gray-400">ON</span>
      </div>

      <AnimalFact facts={facts} isAnswerShown={isAnswerShown} animalId={animalId} />

      <div className="row-span-2 flex items-center justify-center">
        <div className="grid grid-cols-12 w-full max-w-xl mx-auto">
          <button
            onClick={togglePlayback}
            className="col-start-4 col-span-6 flex items-center justify-center rounded-full focus:outline-none"
          >
            <PlayButton isPlaying={isPlaying} selectedYearIndex={currentYearIndex} healthLevels={healthLevels} isAnswerShown={isAnswerShown} />
          </button>
        </div>
      </div>
      
      <div className="row-span-1 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-12 h-2/3">
          {/* Y-axis title */}
          <div className="col-span-1 flex flex-col justify-end h-full">
              <div className="flex items-center h-1">
                <span className="text-sm">Population</span>
              </div>
          </div>

          <div className="col-span-11 relative">
          </div>
        </div>
      </div>

      {/* Timeline section - bottom 2/5 */}
      <div className="row-span-2 flex flex-col justify-start px-4">
        {/* Increased max-width for wider timeline */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-12 h-2/3">
          {/* Y-axis labels column */}
          <div className="col-span-1 flex flex-col justify-between h-full">
            {yLabels.slice().reverse().map((label, index) => (
              <div key={index} className="flex items-center h-1">
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>

          {/* Main grid area */}
          <div className="col-span-11 relative">
            {/* Grid lines */}
            <div className="flex flex-col justify-between h-full w-full">
              {yLabels.map((_, index) => (
                <div key={index} className="h-1 w-full bg-gray-200 rounded-full"></div>
              ))}
            </div>

            {/* Population points with vertical positioning based on value */}
            {isAnswerShown && years.map((year, idx) => {
              // Calculate horizontal position based on the year
              const xPosition = calculatePosition(year);

              // Calculate vertical position (0% = bottom, 100% = top)
              const verticalPercentage = calculateVerticalPosition(population[idx]);

              return (
                <div
                  key={`pop-${year}`}
                  className="absolute"
                  style={{
                    left: `${xPosition}%`,
                    bottom: `${verticalPercentage}%`, // Position vertically based on value
                    transform: 'translate(-50%, 50%)' // Center the point
                  }}
                >
                  <div
                    className={`w-4 h-4 ${healthLevels[idx] === 'level-1' ? 'bg-level-1' :
                      healthLevels[idx] === 'level-2' ? 'bg-level-2' :
                        healthLevels[idx] === 'level-3' ? 'bg-level-3' :
                          healthLevels[idx] === 'level-4' ? 'bg-level-4' :
                            healthLevels[idx] === 'level-5' ? 'bg-level-5' :
                              'bg-green-400'
                      } rounded-full`}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Separate the slider from the grid lines */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-12 mt-12">
          <div className="col-span-1"></div>
          <div className="col-span-11">
            <div
              className="relative h-20 w-full"
              ref={sliderRef}
              onClick={handleClick}
            >
              {/* Track */}
              <div className="absolute h-2 w-full bg-gray-300 rounded-full"></div>

              {/* Tick marks and labels */}
              {years.map((year) => {
                // Calculate position based on the year value relative to min and max years
                const position = calculatePosition(year);

                return (
                  <div
                    key={year}
                    className="absolute"
                    style={{ left: `calc(${position}% - 8px)`, top: -4 }}
                  >
                    <div className={`w-4 h-4 bg-gray-500 rounded-full`}></div>
                    <div className="relative -left-3 mt-6 text-sm">{year}</div>
                  </div>
                );
              })}

              {/* Thumb - calculate position dynamically */}
              <div
                className="absolute w-6 h-6 bg-blue-500 rounded-full -ml-3 -mt-2 cursor-pointer shadow-md hover:bg-blue-600 transition-colors"
                style={{ left: `${calculatePosition(selectedYear)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeLine;