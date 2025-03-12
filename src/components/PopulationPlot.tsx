import React from 'react';

interface PopulationGraphProps {
  population: number[];
  yLabels: number[];
  healthLevels: string[];
}

const PopulationGraph: React.FC<PopulationGraphProps> = ({ population, yLabels, healthLevels }) => {
  
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
    <div className="relative w-full p-4 mb-10 bg-gray-50 rounded-lg h-64">
      <h3 className="text-lg font-medium mb-4">Population Distribution</h3>
      
      <div className="relative h-48">
        {/* Grid lines */}
        <div className="flex flex-col justify-between h-full w-full">
          {yLabels.map((_, index) => (
            <div key={index} className="h-1 w-full bg-gray-200 rounded-full"></div>
          ))}
        </div>
        
        {/* Population points with continuous vertical positioning and evenly spaced horizontally */}
        {population.map((pop, idx) => {
          // Calculate horizontal position by dividing the width evenly
          const horizontalSpacing = 100 / (population.length - 1 || 1);
          const xPosition = idx * horizontalSpacing;
          
          // Calculate vertical position (0% = bottom, 100% = top)
          const verticalPercentage = calculateVerticalPosition(pop);
          
          return (
            <div
              key={`pop-${idx}`}
              className="absolute"
              style={{
                left: `${xPosition}%`,
                bottom: `${verticalPercentage}%`,
                transform: 'translate(-50%, 50%)' // Center the point
              }}
            >
              <div
                className={`w-4 h-4 ${
                  healthLevels[idx] === 'level-1' ? 'bg-red-500' :
                  healthLevels[idx] === 'level-2' ? 'bg-orange-500' :
                  healthLevels[idx] === 'level-3' ? 'bg-yellow-500' :
                  healthLevels[idx] === 'level-4' ? 'bg-blue-500' :
                  healthLevels[idx] === 'level-5' ? 'bg-green-500' :
                  'bg-green-400'
                } rounded-full`}
                title={`Population: ${pop}`}
              ></div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between mt-4 text-xs text-gray-500">
        <div>Min: {minPopulation}</div>
        <div>Max: {maxPopulation}</div>
      </div>
    </div>
  );
};

export default PopulationGraph;
