import React, { useEffect, useState, useRef, useCallback } from "react";
import PlayButton from "./PlayButton";
import PopulationGraph from "./PopulationGraph";

interface InteractiveSliderProps {
  audioContext: AudioContext | null;
  years: number[];
  yearAudios: string[]; // Array of audio file paths matching the years array
  healthLevels: string[];
  population: number[];
  yLabels: number[];
  isAnswerShown: boolean;
}

interface AudioSource {
  buffer: AudioBuffer | null;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode | null;
  isPlaying: boolean;
  year: number;
  audioPath: string;
  analyser?: AnalyserNode; // Add analyser node for volume detection
  volume?: number; // Store current volume
}

const InteractiveSlider: React.FC<InteractiveSliderProps> = ({ years, audioContext, yearAudios, healthLevels, population, yLabels, isAnswerShown }) => {
  const [position, setPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [, setAudioSources] = useState<AudioSource[]>([]);
  const audioSourcesRef = useRef<AudioSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVolume, setCurrentVolume] = useState(0); // Track the current volume
  const animationFrameRef = useRef<number | null>(null); // For animation frame

  // Calculate current year index
  const getYearIndex = useCallback(
    (pos: number) => {
      const segmentCount = years.length - 1;
      const segmentSize = 100 / segmentCount;
      return Math.round(pos / segmentSize);
    },
    [years]
  );

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

  const handleYearClick = (index: number) => {
    // 計算目標位置 - 確保精確匹配年份的位置
    const exactPosition = (index / (years.length - 1)) * 100;
    setPosition(exactPosition);

    // 如果正在播放，要更新音量
    if (isPlaying && audioContext) {
      // 使用setTimeout確保React的狀態已更新
      setTimeout(() => {
        updateVolumes(exactPosition);
      }, 10);
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

          // Create analyser node
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256; // Smaller FFT size for better performance
          analyser.smoothingTimeConstant = 0.5;
          gainNode.connect(analyser);

          sources.push({
            buffer: audioBuffer,
            source: null,
            gainNode,
            analyser,
            isPlaying: false,
            year,
            audioPath,
            volume: 0
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
            audioPath,
            volume: 0
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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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

        // Connect the analyser if it exists
        if (audioData.analyser) {
          audioData.gainNode.disconnect();
          audioData.gainNode.connect(audioContext.destination);
          audioData.gainNode.connect(audioData.analyser);
          source.connect(audioData.gainNode);
        }



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

    // Start the audio analysis loop
    startAudioAnalysis();
  };

  // Stop all audio sources
  const stopAllAudio = () => {
    console.log("Stopping all audio sources");

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

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
        isPlaying: false,
        volume: 0
      };
    });

    setAudioSources(updatedSources);
    audioSourcesRef.current = updatedSources;
    setCurrentVolume(0); // Reset volume when stopped
  };

  // Function to analyze audio data and update volume levels
  const analyzeAudio = useCallback(() => {
    if (!isPlaying || !audioContext) return;

    // Get the current index to find the closest audio source
    const currentYearIndex = getYearIndex(position);
    const currentYearValue = years[currentYearIndex];

    // 找出当前播放的音频源并计算其实际音量
    let maxVolume = 0;
    let dataAvailable = false;

    audioSourcesRef.current.forEach((audioData) => {
      if (!audioData.analyser || !audioData.isPlaying) return;

      // 获取频率数据
      const dataArray = new Uint8Array(audioData.analyser.frequencyBinCount);
      audioData.analyser.getByteFrequencyData(dataArray);

      // 计算平均音量
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avgVolume = sum / dataArray.length / 255; // 标准化到 0-1

      // 如果这是当前年份的音频，考虑其音量作为UI显示
      if (audioData.year === currentYearValue) {
        maxVolume = Math.max(maxVolume, avgVolume);
        dataAvailable = true;
      }
    });

    // 只有在有数据时才更新音量
    if (dataAvailable) {
      // 增强音量效果
      const enhancedVolume = Math.pow(maxVolume, 0.5);

      // 平滑过渡
      setCurrentVolume(prevVolume => {
        return prevVolume * 0.7 + enhancedVolume * 0.3; // 增加新值的权重
      });
    }

    // 继续分析循环
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [isPlaying, audioContext, getYearIndex, position, years]);

  // Start the audio analysis loop
  const startAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [analyzeAudio]);

  // Function to calculate volume based on distance from the thumb
  const calculateVolume = useCallback((yearPosition: number, thumbPosition: number) => {
    // 計算所有音頻源到當前位置的距離
    const distances = years.map(year => {
      const yearIndex = years.indexOf(year);
      const yearPositionPercent = (yearIndex / (years.length - 1)) * 100;
      return {
        year,
        distance: Math.abs(yearPositionPercent - thumbPosition)
      };
    });

    // 按距離排序
    distances.sort((a, b) => a.distance - b.distance);

    // 如果當前年份不是最接近的兩個之一，音量為0
    const isInTopTwo = distances.slice(0, 2).some(item => item.year === yearPosition);
    if (!isInTopTwo) return 0;

    // 轉換年份到滑塊上的位置(0-100%)
    const yearIndex = years.indexOf(yearPosition);
    const yearPositionPercent = (yearIndex / (years.length - 1)) * 100;

    // 計算距離(0-100刻度)
    const distance = Math.abs(yearPositionPercent - thumbPosition);

    // 可聽見音頻的最大距離
    const maxAudibleDistance = 25; // 滑塊寬度的25%

    if (distance > maxAudibleDistance) {
      return 0; // 如果太遠則沒有音量
    }

    // 線性衰減：在位置上為1，在maxAudibleDistance處為0
    const volume = 1 - (distance / maxAudibleDistance);

    return volume;
  }, [years]);

  // Update volumes based on thumb position
  const updateVolumes = useCallback((thumbPosition: number) => {
    if (!audioContext || !isPlaying) return;

    console.log(`Updating volumes for position: ${thumbPosition}`);

    // 檢查滑塊是否正好在某個年份位置上
    const exactYearMatch = years.findIndex(year => {
      const yearIndex = years.indexOf(year);
      const yearPositionPercent = (yearIndex / (years.length - 1)) * 100;
      // 使用一個小的容差值來判斷是否在確切位置（例如1%以內）
      return Math.abs(yearPositionPercent - thumbPosition) < 1;
    });

    const updatedSources = audioSourcesRef.current.map((audioData) => {
      if (audioData.gainNode && audioData.isPlaying) {
        let volume = 0;

        // 如果滑塊精確位於某個年份位置，僅播放該年份的聲音
        if (exactYearMatch !== -1) {
          const exactYear = years[exactYearMatch];
          volume = audioData.year === exactYear ? 1 : 0;
        } else {
          // 否則使用正常的音量計算
          volume = calculateVolume(audioData.year, thumbPosition);
        }

        // 立即應用音量變化
        audioData.gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        console.log(`Updated volume for ${audioData.audioPath}: ${volume}`);

        return {
          ...audioData,
          volume
        };
      }
      return audioData;
    });

    audioSourcesRef.current = updatedSources;
  }, [audioContext, isPlaying, calculateVolume, years]);

  // Update volumes whenever the position changes
  useEffect(() => {
    updateVolumes(position);
  }, [position, updateVolumes]);

  // Debug effects to monitor values
  useEffect(() => {
    if (isPlaying) {
      startAudioAnalysis();
      // console.log(`Current volume: ${currentVolume.toFixed(4)}`);
    }
  }, [currentVolume, isPlaying, startAudioAnalysis]);

  return (
    <div className="flex flex-col items-center w-full mx-auto p-4 max-w-6xl">
      {/* Play/Pause Button */}
      <div className="mb-30">
        {isLoading ? (
          <div className="text-gray-500">Loading audios...</div>
        ) : (
          <button
            onClick={togglePlayback}
            disabled={isLoading}
            className="focus:outline-none"
          >
            <PlayButton
              isPlaying={isPlaying}
              selectedYearIndex={currentIndex}
              healthLevels={healthLevels}
              isAnswerShown={isAnswerShown}
              volume={currentVolume} // Pass the current volume to PlayButton
            />
          </button>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-12 w-full">
        {/* Population graph */}
        <div className="col-span-12">
          <PopulationGraph
            population={population}
            healthLevels={healthLevels}
            yLabels={yLabels}
            isAnswerShown={isAnswerShown}
          />
        </div>

        {/* Left margin (for alignment with PopulationGraph) */}
        <div className="col-span-1"></div>

        {/* Right content area */}
        <div className="col-span-11">
          {/* Slider track - aligned with grid */}
          <div className="relative w-full h-2 bg-gray-200 rounded-full mb-2">
            {/* Tick marks for each year */}
            {years.map((_, index) => {
              const tickPosition = (index / (years.length - 1)) * 100;
              return (
                <div
                  key={index}
                  className="absolute w-1 h-3 bg-gray-400 -mt-0.5 transform -translate-x-1/2"
                  style={{ left: `${tickPosition}%` }}
                ></div>
              );
            })}
            {/* Slider thumb */}
            <div
              className="absolute w-6 h-6 bg-blue-500 rounded-full -ml-3 -mt-2 cursor-pointer shadow-md hover:bg-blue-600 transition-colors z-10"
              style={{ left: `${position}%` }}
            ></div>
          </div>

          {/* Year labels */}
          <div className="relative w-full flex justify-between mb-4">
            {years.map((year, index) => (
              <div
                key={year}
                className={`text-sm ${index === currentIndex ? 'text-blue-500 font-bold' : 'text-gray-500'}`}
                onClick={() => handleYearClick(index)}
              >
                {year}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex justify-between w-full mt-2">
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

      {/* Debug info - uncomment for debugging */}
      {/* <div className="mt-6 text-xs text-gray-500 w-full">
        <div>Current position: {position}%</div>
        <div>Current year: {years[currentIndex]} ({currentIndex})</div>
        <div>Audio file: {yearAudios[currentIndex]}</div>
        <div>Audio state: {isPlaying ? "Playing" : "Paused"}</div>
        <div>Audio context state: {audioContext?.state}</div>
        <div>Current volume: {(currentVolume * 100).toFixed(2)}%</div>
      </div> */}
    </div>
  );
};

export default InteractiveSlider;
