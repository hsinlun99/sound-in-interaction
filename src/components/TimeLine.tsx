import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface TimeLineProps {
  years: string[];
  yearAudios: string[];
}

const TimeLine: React.FC<TimeLineProps> = ({ years, yearAudios }) => {
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

  // Play audio file for the current year
  const playYearAudio = useCallback((yearIndex: number) => {
    // Check if we have a corresponding audio file
    if (yearIndex >= 0 && yearIndex < yearAudios.length) {
      const audioPath = yearAudios[yearIndex];
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Create a new audio element
      const audio = new Audio(audioPath);
      audioRef.current = audio;
      
      // Set isPlaying to true when audio starts playing
      setIsPlaying(true);
      
      // Play the audio
      audio.play().catch(error => {
        console.error("Error playing audio:", error);
        setIsPlaying(false); // Reset playing state if there's an error
      });
      
      // When audio ends, update isPlaying state
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
  }, [yearAudios]);

  // Start automatic playback of all years
  const startPlayback = () => {
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    
    // Start from current selected year
    let index = years.indexOf(selectedYear);
    if (index === -1) index = 0;
    
    const playNext = () => {
      if (!isPlaying) return;
      
      if (index < years.length) {
        const year = years[index];
        setSelectedYear(year);
        setPosition(tickPositions[index]);
        setCurrentYearIndex(index);
        
        // Just play the audio without setting isPlaying again
        // since we're already in playback mode
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        
        // if (yearIndex >= 0 && yearIndex < yearAudios.length) {
        //   const audio = new Audio(yearAudios[index]);
        //   audioRef.current = audio;
        //   audio.play().catch(error => {
        //     console.error("Error playing audio:", error);
        //   });
        // }
        
        index++;
        // Set delay for next year
        playbackTimerRef.current = setTimeout(playNext, 1000);
      } else {
        // Playback complete, stop playing
        setIsPlaying(false);
      }
    };
    
    setIsPlaying(true);
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
    
    // Find the closest tick position
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
    
    // Stop auto sequence playback
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    
    // Play audio for the selected year - this will set isPlaying to true
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
            <Image
              className="w-full h-auto object-contain"
              src={isPlaying ? "/image/player-pause.svg" : "/image/player-play.svg"}
              alt={isPlaying ? "Pause" : "Play"}
              width={0}
              height={0}
              sizes="100vh"
              priority
            />
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
            <div key={year} className="absolute" style={{ left: `${tickPositions[index]}%`, top: 0 }}>
              <div className="w-1 h-4 bg-gray-500 relative left-0"></div>
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