import React, { useEffect, useState, useRef } from "react";

interface InteractiveSliderProps {
  audioContext: AudioContext | null;
  years: number[];
  yearAudios: string[]; // Array of audio file paths matching the years array
}

interface AudioSource {
  buffer: AudioBuffer | null;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode | null;
  isPlaying: boolean;
  year: number;
  audioPath: string;
}

const InteractiveSlider: React.FC<InteractiveSliderProps> = ({ years, audioContext, yearAudios }) => {
  const [position, setPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [, setAudioSources] = useState<AudioSource[]>([]);
  const audioSourcesRef = useRef<AudioSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate current year index
  const getYearIndex = (pos: number) => {
    const segmentCount = years.length - 1;
    const segmentSize = 100 / segmentCount;
    return Math.round(pos / segmentSize);
  };

  // Determine current year
  const currentIndex = getYearIndex(position);

  // Movement step size (smaller value for smoother movement)
  const moveStep = 3;

  // Handle moving to the left
  const handleMoveLeft = () => {
    if (position > 0) {
      setPosition(Math.max(0, position - moveStep));
    }
  };

  // Handle moving to the right
  const handleMoveRight = () => {
    if (position < 100) {
      setPosition(Math.min(100, position + moveStep));
    }
  };

  // Load audio files
  useEffect(() => {
    if (!audioContext) return;

    setIsLoading(true);

    const loadAudioFiles = async () => {
      const sources: AudioSource[] = [];

      for (let i = 0; i < years.length; i++) {
        const year = years[i];
        const audioPath = yearAudios[i];

        try {
          console.log(`Loading audio: ${audioPath}`);
          // Fetch audio file based on the path from yearAudios
          const response = await fetch(audioPath);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Create gain node
          const gainNode = audioContext.createGain();
          gainNode.connect(audioContext.destination);
          gainNode.gain.value = 0; // Start with volume at 0

          sources.push({
            buffer: audioBuffer,
            source: null,
            gainNode,
            isPlaying: false,
            year,
            audioPath
          });
          console.log(`Successfully loaded audio: ${audioPath}`);
        } catch (error) {
          console.error(`Error loading audio for year ${year} (${audioPath}):`, error);
          // Add empty placeholder for failed loads to maintain index alignment
          sources.push({
            buffer: null,
            source: null,
            gainNode: null,
            isPlaying: false,
            year,
            audioPath
          });
        }
      }

      setAudioSources(sources);
      audioSourcesRef.current = sources;
      setIsLoading(false);
    };

    loadAudioFiles();

    // Cleanup function
    return () => {
      stopAllAudio();
    };
  }, [audioContext, years, yearAudios]);

  // Play/pause all audio sources
  const togglePlayback = () => {
    if (!audioContext || isLoading) return;

    if (isPlaying) {
      stopAllAudio();
    } else {
      startAllAudio();
    }
    setIsPlaying(prev => !prev);
  };

  // Start playback of all audio sources
  const startAllAudio = () => {
    if (!audioContext) return;

    console.log("Starting all audio sources");

    // First, ensure all previous sources are stopped
    stopAllAudio();

    const updatedSources = audioSourcesRef.current.map(audioData => {
      if (!audioData.buffer || !audioContext) return audioData;

      // Create new source
      const source = audioContext.createBufferSource();
      source.buffer = audioData.buffer;

      // Connect to gain node
      if (audioData.gainNode) {
        // Ensure the gain node is reconnected to the destination
        audioData.gainNode.disconnect();
        audioData.gainNode.connect(audioContext.destination);
        source.connect(audioData.gainNode);

        // Set initial volume based on position
        const volume = calculateVolume(audioData.year, position);
        audioData.gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        console.log(`Set initial volume for ${audioData.audioPath}: ${volume}`);
      }

      // Start playback
      source.start(0);
      source.loop = true;

      console.log(`Started playback for ${audioData.audioPath}`);

      return {
        ...audioData,
        source,
        isPlaying: true
      };
    });

    setAudioSources(updatedSources);
    audioSourcesRef.current = updatedSources;
  };

  // Stop all audio sources
  const stopAllAudio = () => {
    console.log("Stopping all audio sources");

    const updatedSources = audioSourcesRef.current.map(audioData => {
      if (audioData.source && audioData.isPlaying) {
        try {
          audioData.source.stop(0);
          console.log(`Stopped playback for ${audioData.audioPath}`);
        } catch (error) {
          console.error(`Error stopping audio source: ${error}`);
        }
      }

      return {
        ...audioData,
        source: null,
        isPlaying: false
      };
    });

    setAudioSources(updatedSources);
    audioSourcesRef.current = updatedSources;
  };

  // Function to calculate volume based on distance from the thumb
  const calculateVolume = (yearPosition: number, thumbPosition: number) => {
    // Convert years to positions on the slider (0-100%)
    const yearIndex = years.indexOf(yearPosition);
    const yearPositionPercent = (yearIndex / (years.length - 1)) * 100;

    // Calculate distance (0-100 scale)
    const distance = Math.abs(yearPositionPercent - thumbPosition);

    // Maximum distance at which audio can be heard
    const maxAudibleDistance = 25; // 25% of slider width

    if (distance > maxAudibleDistance) {
      return 0; // No volume if too far
    }

    // Linear falloff: 1 at the position, 0 at maxAudibleDistance
    const volume = 1 - (distance / maxAudibleDistance);

    // Debug
    if (thumbPosition === yearPositionPercent) {
      console.log(`At exact position for year ${yearPosition}: volume = ${volume}`);
    }

    return volume;
  };

  // Update volumes based on thumb position
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateVolumes = (thumbPosition: number) => {
    if (!audioContext || !isPlaying) return;

    console.log(`Updating volumes for position: ${thumbPosition}`);

    audioSourcesRef.current.forEach((audioData) => {
      if (audioData.gainNode && audioData.isPlaying) {
        const volume = calculateVolume(audioData.year, thumbPosition);

        // Apply volume with immediate change for debugging
        audioData.gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        console.log(`Updated volume for ${audioData.audioPath}: ${volume}`);
      }
    });
  };

  // Update volumes whenever the position changes
  useEffect(() => {
    updateVolumes(position);

    // For debugging
    console.log("audio context", audioContext?.state);
    console.log("Current year:", years[currentIndex]);
    console.log("Current audio:", yearAudios[currentIndex]);
    console.log("Is playing:", isPlaying);
  }, [position, currentIndex, years, yearAudios, audioContext, isPlaying, updateVolumes]);

  return (
    <>
      <div className="flex flex-col items-center w-full mx-auto p-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayback}
          disabled={isLoading}
          className={`px-4 py-2 mb-4 text-white rounded ${isLoading ? 'bg-gray-400' : isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
        >
          {isLoading ? "Loading audio..." : isPlaying ? "Pause" : "Play"}
        </button>

        {/* Slider track */}
        <div className="relative w-full h-2 bg-gray-200 rounded-full mb-2">
          {/* Slider thumb */}
          <div
            className="absolute w-6 h-6 bg-blue-500 rounded-full -ml-3 -mt-2 cursor-pointer shadow-md hover:bg-blue-600 transition-colors"
            style={{ left: `${position}%` }}
          ></div>
        </div>

        {/* Year labels */}
        <div className="relative w-full flex justify-between">
          {years.map((year, index) => {
            // Calculate position percentage for each label
            return (
              <div
                key={year}
                className={`text-sm ${index === currentIndex ? 'text-blue-500 font-bold' : 'text-gray-500'}`}
              >
                {year}
              </div>
            );
          })}
        </div>

        {/* Control buttons */}
        <div className="flex justify-between w-full mt-4">
          <button
            onClick={handleMoveLeft}
            disabled={position <= 0}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            ← Move Left
          </button>
          <button
            onClick={handleMoveRight}
            disabled={position >= 100}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Move Right →
          </button>
        </div>

        {/* Debug info */}
        <div className="mt-6 text-xs text-gray-500 w-full">
          <div>Current position: {position}%</div>
          <div>Current year: {years[currentIndex]} ({currentIndex})</div>
          <div>Audio file: {yearAudios[currentIndex]}</div>
          <div>Audio state: {isPlaying ? "Playing" : "Paused"}</div>
          <div>Audio context state: {audioContext?.state}</div>
        </div>
      </div>
    </>
  );
};

export default InteractiveSlider;
