import React, { useState, useRef, useEffect, useCallback } from 'react';
import PlayButton from './PlayButton';

interface TimeLineProps {
  years: string[];
  yearAudios: string[];
  healthLevel: string[];
}

const TimeLine: React.FC<TimeLineProps> = ({ years, yearAudios, healthLevel }) => {
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [, setCurrentYearIndex] = useState(0);
  
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Calculate positions for tick marks
  const tickPositions = years.map((_, index) => {
    return (index / (years.length - 1)) * 100;
  });

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  // 監聽 isPlaying 狀態變化
useEffect(() => {
  console.log("isPlaying state changed:", isPlaying);
}, [isPlaying]);

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
// 修改 startPlayback 函數
const startPlayback = () => {
  if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
  
  // 開始於當前選定的年份
  let index = years.indexOf(selectedYear);
  if (index === -1) index = 0;
  
  const playNext = () => {
    if (index < years.length) {
      const year = years[index];
      setSelectedYear(year);
      setPosition(tickPositions[index]);
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
};

  // Stop playback
  const stopPlayback = () => {
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
  };

  // Toggle playback state
  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  // Handle slider thumb movement
  const handleSliderChange = useCallback((e: MouseEvent) => {
    if (!sliderRef.current) return;
    const sliderWidth = sliderRef.current.clientWidth;
    const clickPosition = e.clientX - sliderRef.current.getBoundingClientRect().left;
    const percentPosition = (clickPosition / sliderWidth) * 100;
    
    // 找到最近的刻度位置
    let closestIndex = 0;
    let closestDistance = Math.abs(tickPositions[0] - percentPosition);
    
    tickPositions.forEach((pos, index) => {
      const distance = Math.abs(pos - percentPosition);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    
    setPosition(tickPositions[closestIndex]);
    setSelectedYear(years[closestIndex]);
    setCurrentYearIndex(closestIndex);
    
    // 停止自動序列播放
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    
    // 播放選定年份的音頻 - playYearAudio 會設置 isPlaying 為 true
    playYearAudio(closestIndex);
    
  }, [tickPositions, years, playYearAudio]);
  
  // React click event handler
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleSliderChange(e.nativeEvent);
  };
  
  // Set dragging state on mouse down
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);
  
  // Handle drag-related event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleSliderChange(e);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleSliderChange]);
  
  return (
    <div className="grid grid-rows-3 min-h-screen w-full max-w-lg mx-auto">
      {/* Button section - top 2/3 */}
      <div className="row-span-2 flex items-center justify-center">
        <div className="grid grid-cols-12 w-full">
          <button 
            onClick={togglePlayback}
            className="col-start-4 col-span-6 flex items-center justify-center rounded-full focus:outline-none"
          >
            <PlayButton isPlaying={isPlaying} />
          </button>
        </div>
      </div>
      
      {/* Timeline section - bottom 1/3 */}
      <div className="flex flex-col justify-center px-6">
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
          {years.map((year, index) => (
            console.log(healthLevel[index]),
            <div key={year} className="absolute" style={{ left: `${tickPositions[index]}%`, top: 0 }}>
              <div className={`w-1 h-4 ${
              healthLevel[index] === 'level-1' ? 'bg-level-1' :
              healthLevel[index] === 'level-2' ? 'bg-level-2' :
              healthLevel[index] === 'level-3' ? 'bg-level-3' :
              healthLevel[index] === 'level-4' ? 'bg-level-4' :
              healthLevel[index] === 'level-5' ? 'bg-level-5' :
              'bg-gray-400'
            }`}></div>
              <div className="relative -left-3 mt-6 text-sm">{year}</div>
            </div>
          ))}
          
          {/* Thumb */}
          <div 
            className="absolute w-6 h-6 bg-blue-500 rounded-full -ml-3 top-2 cursor-pointer shadow-md hover:bg-blue-600 transition-colors"
            style={{ left: `${position}%` }}
            onMouseDown={handleMouseDown}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TimeLine;