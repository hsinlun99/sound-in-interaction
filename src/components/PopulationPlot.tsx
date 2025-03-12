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
    <div className="relative w-full h-54 mb-10">
      <div className="relative h-48 grid grid-cols-12">

        {/* Y-axis title and labels */}
        <div className="col-span-1 h-full flex flex-col">
          {/* Y-axis title */}
          <div className="text-xs font-medium text-gray-700 mb-2">Population</div>

          {/* Y-axis labels */}
          <div className="flex-1 flex flex-col justify-between">
            {yLabels.map((label, index) => (
              <span key={index} className="text-xs text-gray-500">{label}</span>
            ))}
          </div>
        </div>
        {/* Grid lines */}
        <div className='col-span-11 w-full relative'>
          {/* Empty space to align with the y-axis title */}
          <div className="h-6"></div>
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
                  className={`w-4 h-4 ${healthLevels[idx] === 'level-1' ? 'bg-level-1' :
                    healthLevels[idx] === 'level-2' ? 'bg-level-2' :
                      healthLevels[idx] === 'level-3' ? 'bg-level-3' :
                        healthLevels[idx] === 'level-4' ? 'bg-level-4' :
                          healthLevels[idx] === 'level-5' ? 'bg-level-5' :
                            'bg-green-400'
                    } rounded-full`}
                  title={`Population: ${pop}`}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PopulationGraph;
