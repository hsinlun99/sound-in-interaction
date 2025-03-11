// components/AudioSlider.tsx
import { useRef, useState, useEffect } from 'react';
import { useAudioContext } from '@/context/AudioContext';

interface AudioSliderProps {
  width?: number;
}

const AudioSlider = ({ width = 800 }: AudioSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // 使用 Context
  const {
    isInitialized,
    updateVolumes,
    getVolume,
    play,
    pause,
    isPlaying,
    audioPoints,
    loadingProgress,
    forceMaxVolume
  } = useAudioContext();

  // 當游標位置變化時更新音量
  useEffect(() => {
    updateVolumes(cursorPosition);
  }, [cursorPosition, updateVolumes]);

  // 處理拖曳邏輯
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;

    // 限制在 0-100 範圍內
    setCursorPosition(Math.max(0, Math.min(100, position)));
  };

  // 確保拖曳結束時釋放鼠標
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // 顯示音量調試信息
  const getVolumeDebugInfo = (pointId: string) => {
    if (!isInitialized) return "未初始化";
    return getVolume(pointId).toFixed(2);
  };

  // 播放/暫停控制
  const togglePlayback = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };


  // 如果正在加載，顯示進度條
  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center w-full gap-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">
          加載音頻資源... {loadingProgress}%
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full gap-6">
      <div
        ref={sliderRef}
        className="relative h-10 bg-gray-200 rounded-full w-full max-w-4xl cursor-pointer"
        style={{ width: `${width}px` }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {/* 音頻點 */}
        {audioPoints.map((point) => (
          <div
            key={point.id}
            className="absolute top-0 w-4 h-4 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{
              left: `${point.position}%`,
              top: '50%',
              zIndex: 10
            }}
          >
            <span className="absolute -top-6 text-xs whitespace-nowrap">
              {point.name} ({getVolumeDebugInfo(point.id)})
            </span>
          </div>
        ))}

        {/* 游標 */}
        <div
          className="absolute top-1/2 w-6 h-6 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${cursorPosition}%` }}
        />
      </div>

      <div className="text-center">
        <button
          onClick={togglePlayback}
          className="px-4 py-2 bg-blue-500 text-white rounded-full mb-4 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {isPlaying ? '暫停' : '播放'}
        </button>
        <p>拖曳紅色游標來混合不同的音頻</p>
        <p className="text-sm text-gray-600 mt-2">游標位置: {cursorPosition.toFixed(1)}%</p>
        <button
          onClick={forceMaxVolume}
          className="px-4 py-2 bg-red-500 text-white rounded-full mb-4 ml-2"
        >
          Force Max Volume
        </button>
      </div>
    </div>
  );
};

export default AudioSlider;
