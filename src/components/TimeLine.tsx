import React, { useState, useRef, useEffect, useCallback } from 'react';
import PlayButton from './PlayButton';

interface TimeLineProps {
  years: number[];
  yearAudios: string[];
  healthLevels: string[];
}

const TimeLine: React.FC<TimeLineProps> = ({ years, yearAudios, healthLevels }) => {
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentYearIndex, setCurrentYearIndex] = useState(0);

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
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

  // Play audio file for the current year
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

      // 明確設置 isPlaying 為 true - 這會影響播放按鈕的顯示
      setIsPlaying(true);

      // 播放音頻
      audio.play().catch(error => {
        console.error("Error playing audio:", error);
        setIsPlaying(false); // 如果出錯，重置播放狀態
      });

      // 當音頻結束時，更新 isPlaying 狀態
      audio.onended = () => {
        setIsPlaying(false); // 重要：音頻結束時更新狀態
      };
    }
  }, [yearAudios]);

  // Start automatic playback of all years
  const startPlayback = useCallback(() => {
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);

    // 開始於當前選定的年份
    let index = years.indexOf(selectedYear);
    if (index === -1) index = 0;

    const playNext = () => {
      if (index < years.length) {
        const year = years[index];
        setSelectedYear(year);
        setCurrentYearIndex(index);

        // 播放當前索引的音頻
        playYearAudio(index);

        index++;
        // 設置下一年的延遲
        playbackTimerRef.current = setTimeout(playNext, 3000); // 增加延遲讓音頻有時間播放完畢
      } else {
        // 播放完成，停止播放
        setIsPlaying(false);
      }
    };

    setIsPlaying(true);
    // 立即播放第一個
    playNext();
  }, [years, selectedYear, playYearAudio]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }

    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsPlaying(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  // Toggle playback state
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }, [isPlaying, startPlayback, stopPlayback]);

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

    // 停止自動序列播放
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }

    // 播放選定年份的音頻 - playYearAudio 會設置 isPlaying 為 true
    playYearAudio(closestIndex);

  }, [years, playYearAudio]);

  // React click event handler
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handleSliderChange(e.nativeEvent);
  }, [handleSliderChange]);

  return (
    <div className="grid grid-rows-3 min-h-screen min-w-screen w-full max-w-lg mx-auto">
      {/* Button section - top 2/3 */}
      <div className="row-span-2 flex items-center justify-center">
        <div className="grid grid-cols-12 w-full">
          <button
            onClick={togglePlayback}
            className="col-start-4 col-span-6 flex items-center justify-center rounded-full focus:outline-none"
          >
            <PlayButton isPlaying={isPlaying} selectedYearIndex={currentYearIndex} healthLevels={healthLevels} />
          </button>
        </div>
      </div>

      {/* Timeline section - bottom 1/3 - now takes 7/12 of the width and is centered */}
      <div className="row-span-1 flex flex-col justify-center">
        <div className="mx-auto w-10/12">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold">Year: {selectedYear}</h2>
          </div>

          <div
            className="relative h-10"
            ref={sliderRef}
            onClick={handleClick}
          >
            {/* Track */}
            <div className="absolute h-2 w-full bg-gray-300 rounded-full top-4"></div>

            {/* Tick marks and labels */}
            {years.map((year) => {
              // Calculate position based on the year value relative to min and max years
              const position = calculatePosition(year);

              return (
                <div
                  key={year}
                  className="absolute"
                  style={{ left: `calc(${position}% - 8px)`, top: 12 }}
                >
                  <div className={`w-4 h-4 bg-gray-500 rounded-full`}></div>
                  <div className="relative -left-3 mt-6 text-sm">{year}</div>
                </div>
              );
            })}

            {/* Thumb - calculate position dynamically */}
            <div
              className="absolute w-6 h-6 bg-blue-500 rounded-full -ml-3 top-2 cursor-pointer shadow-md hover:bg-blue-600 transition-colors"
              style={{ left: `${calculatePosition(selectedYear)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeLine;