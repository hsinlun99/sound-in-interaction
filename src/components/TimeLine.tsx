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
      
      // Play the audio
      audio.play().catch(error => {
        console.error("Error playing audio:", error);
      });
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
        playYearAudio(index);
        
        index++;
        // Set delay for next year
        playbackTimerRef.current = setTimeout(playNext, 1000);
      } else {
        // Playback complete, stop playing
        setIsPlaying(false);
      }
    };
    
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
  };

  // Toggle playback state
  const togglePlayback = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    if (newPlayingState) {
      // Start playback
      startPlayback();
    } else {
      // Stop playback
      stopPlayback();
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
    
    // If manually adjusting, stop auto playback
    if (isPlaying) {
      setIsPlaying(false);
      stopPlayback();
    }
    
    // Play audio for the selected year
    playYearAudio(closestIndex);
  }, [tickPositions, years, isPlaying, playYearAudio]);
  
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
    <div className="w-full max-w-lg mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Year: {selectedYear}</h2>
        <button 
          onClick={togglePlayback}
          className="flex items-center justify-center w-10 h-10 rounded-full focus:outline-none"
        >
          <Image
            className="w-6 h-6"
            src={isPlaying ? "/image/player-pause.svg" : "/image/player-play.svg"}
            alt={isPlaying ? "Pause" : "Play"}
            width={24}
            height={24}
          />
        </button>
      </div>
      
      <div 
        className="relative h-10 mt-4"
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
  );
};

export default TimeLine;