import { useEffect, useState } from "react";

interface InteractiveSliderProps {
  audioContext: AudioContext | null;
  years: number[];
}

const InteractiveSlider: React.FC<InteractiveSliderProps> = ({ years, audioContext }) => {
  const [position, setPosition] = useState(0);

  // 計算當前年份索引
  const getYearIndex = (pos: number) => {
    const segmentCount = years.length - 1;
    const segmentSize = 100 / segmentCount;
    return Math.round(pos / segmentSize);
  };


  // 確定當前年份
  const currentIndex = getYearIndex(position);

  // 小幅度移動的步長 (較小的值使移動更平滑)
  const moveStep = 3;

  // 處理移動到左側的函數
  const handleMoveLeft = () => {
    if (position > 0) {
      setPosition(Math.max(0, position - moveStep));
    }
  };

  // 處理移動到右側的函數
  const handleMoveRight = () => {
    if (position < 100) {
      setPosition(Math.min(100, position + moveStep));
    }
  };

  // for debugging
  useEffect(() => {
    console.log("Current year:", years[currentIndex]);
  }, [currentIndex, years])


  return (
    <>
      <div className="flex flex-col items-center w-full mx-auto p-4">
        {/* 滑塊軌道 */}
        <div className="relative w-full h-2 bg-gray-200 rounded-full mb-2">
          {/* 滑塊拇指 */}
          <div
            className="absolute w-6 h-6 bg-blue-500 rounded-full -ml-3 -mt-2 cursor-pointer shadow-md hover:bg-blue-600 transition-colors"
            style={{ left: `${position}%` }}
          ></div>
        </div>

        {/* 標籤容器 */}
        <div className="relative w-full flex justify-between">
          {years.map((year, index) => {
            // 計算每個標籤的位置百分比
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

        {/* 控制按鈕區域 */}
        <div className="flex justify-between w-full mb-2">
          <button
            onClick={handleMoveLeft}
            disabled={position <= 0}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            ← 向左移動
          </button>
          <button
            onClick={handleMoveRight}
            disabled={position >= 100}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            向右移動 →
          </button>
        </div>
      </div>
    </>
  );
};

export default InteractiveSlider;
