import React, { useState, useRef, useEffect, useCallback } from 'react';

interface TimeLineProps {
  years: string[];
}

const TimeLine: React.FC<TimeLineProps> = ({ years }) => {
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [position, setPosition] = useState(0);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  
  // Calculate positions for tick marks
  const tickPositions = years.map((_, index) => {
    return (index / (years.length - 1)) * 100;
  });
  
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
  }, [tickPositions, years]);
  
  // React click event handler
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleSliderChange(e.nativeEvent);
  };
  
  // Handle dragging
  const handleMouseDown = () => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleSliderChange(e);
  }, [handleSliderChange]);
  
  const handleMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);
  
  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  return (
    <div className="w-full max-w-lg mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Year Selector</h2>
        <p className="text-xl mt-2">Selected Year: {selectedYear}</p>
      </div>
      
      <div 
        className="relative h-10 mt-8"
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