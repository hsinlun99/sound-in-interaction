import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

export interface AudioPoint {
  id: string;
  position: number; // 0 到 100 的位置百分比
  audioSrc: string;
  name: string;
}

interface AudioNode {
  source: MediaElementAudioSourceNode;
  gainNode: GainNode;
  audio: HTMLAudioElement;
  loaded: boolean;
}

interface AudioContextProviderProps {
  children: ReactNode;
  audioPoints: AudioPoint[];
}

interface AudioContextValue {
  isInitialized: boolean;
  updateVolumes: (cursorPosition: number, fadeTime?: number) => void;
  getVolume: (pointId: string) => number;
  play: () => void;
  pause: () => void;
  isPlaying: boolean;
  audioPoints: AudioPoint[];
  loadingProgress: number; // 0-100
  forceMaxVolume: () => void; // Add this
  resumeAudioContext: () => void; // Add this too
}

// 創建 Context
const AudioContextInstance = createContext<AudioContextValue | null>(null);

// Provider 組件
export const AudioContextProvider: React.FC<AudioContextProviderProps> = ({
  children,
  audioPoints
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<Map<string, AudioNode>>(new Map());
  const isUserInteractedRef = useRef(false);

  // 初始化 AudioContext
  const initializeAudioContext = () => {
    if (audioContextRef.current || typeof window === 'undefined') return;

    try {
      const context = new (window.AudioContext)();
      audioContextRef.current = context;

      let loadedCount = 0;
      const totalCount = audioPoints.length;

      // 為每個音頻點創建相關節點
      audioPoints.forEach(point => {
        const audio = new Audio();

        // 監聽加載事件
        audio.addEventListener('canplaythrough', () => {
          const node = audioNodesRef.current.get(point.id);
          if (node) {
            node.loaded = true;
            loadedCount++;
            setLoadingProgress(Math.floor((loadedCount / totalCount) * 100));

            // 當所有音頻都加載完成時
            if (loadedCount === totalCount) {
              setIsInitialized(true);

              // 如果用戶已交互，開始播放
              if (isUserInteractedRef.current) {
                playAllAudio();
              }
            }
          }
        }, { once: true });

        // 設置音頻源
        audio.src = point.audioSrc;
        audio.loop = true;
        audio.load(); // 開始加載

        // 創建各節點
        if (audioContextRef.current) {
          const source = audioContextRef.current.createMediaElementSource(audio);
          const gainNode = audioContextRef.current.createGain();

          // 連接節點: source -> gainNode -> destination
          source.connect(gainNode);
          gainNode.connect(audioContextRef.current.destination);

          // 初始音量設為 0
          gainNode.gain.value = 0;

          audioNodesRef.current.set(point.id, {
            source,
            gainNode,
            audio,
            loaded: false
          });
        }
      });
    } catch (error) {
      console.error("Failed to initialize AudioContext:", error);
    }
  };

  // 播放所有音頻
  const playAllAudio = () => {
    if (!audioContextRef.current) {
      console.error("AudioContext not initialized when trying to play");
      return;
    }

    console.log("AudioContext state:", audioContextRef.current.state);

    const promises: Promise<void>[] = [];

    audioNodesRef.current.forEach(({ audio, loaded, gainNode }, id) => {
      console.log(`Audio ${id}: loaded=${loaded}, paused=${audio.paused}, volume=${gainNode.gain.value}`);

      // Temporarily set all volumes to maximum for testing
      gainNode.gain.value = 1.0;

      if (loaded && audio.paused) {
        promises.push(
          audio.play()
            .then(() => console.log(`Audio ${id} playing successfully`))
            .catch(e => console.error(`Audio ${id} failed to play:`, e))
        );
      }
    });

    Promise.all(promises)
      .then(() => {
        console.log("All audio tracks playing");
        setIsPlaying(true);
      })
      .catch(e => console.error("Some audio failed to play:", e));
  };
  // 暫停所有音頻
  const pauseAllAudio = () => {
    audioNodesRef.current.forEach(({ audio }) => {
      if (!audio.paused) {
        audio.pause();
      }
    });

    setIsPlaying(false);
  };

  // 用戶交互處理
  const handleUserInteraction = () => {
    if (isUserInteractedRef.current) return;

    console.log("User interaction detected, resuming audio context");
    isUserInteractedRef.current = true;

    // Resume AudioContext if suspended
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        console.log("AudioContext resumed successfully");
      }).catch(err => {
        console.error("Failed to resume AudioContext:", err);
      });
    }

    // If already initialized, start playing
    if (isInitialized) {
      console.log("Audio initialized, attempting playback");
      playAllAudio();
    } else {
      console.log("Audio not yet initialized, waiting for initialization");
    }
  };



  // 設置用戶交互監聽
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 初始化 AudioContext
    initializeAudioContext();

    // 監聽用戶交互
    const interactionEvents = ['click', 'touchstart', 'keydown'];

    const handleInteraction = () => {
      handleUserInteraction();

      // 移除所有事件監聽器
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };

    interactionEvents.forEach(event => {
      document.addEventListener(event, handleInteraction);
    });

    // 清理函數
    return () => {
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });

      // 清理音頻資源
      if (audioContextRef.current) {
        audioNodesRef.current.forEach(({ audio, source, gainNode }) => {
          audio.pause();
          source.disconnect();
          gainNode.disconnect();
        });

        audioContextRef.current.close();
      }
    };
  }, []);

  // 更新音量
  const updateVolumes = (cursorPosition: number, fadeTime: number = 0.1) => {
    if (!audioContextRef.current || !isInitialized) return;

    console.log(`Updating volumes for cursor position: ${cursorPosition}`);

    audioPoints.forEach(point => {
      const node = audioNodesRef.current.get(point.id);
      if (!node) return;

      // Calculate distance
      const distance = Math.abs(cursorPosition - point.position);

      // Convert distance to volume (closer = louder)
      const maxRange = 50; // Increased from 30 to 50
      const volume = distance > maxRange ? 0 : 1 - (distance / maxRange);

      console.log(`Point ${point.id} (${point.name}): distance=${distance}, volume=${volume}`);

      // Smooth transition to new volume
      node.gainNode.gain.linearRampToValueAtTime(
        volume,
        audioContextRef.current!.currentTime + fadeTime
      );
    });
  };

  // 獲取指定音頻點的當前音量
  const getVolume = (pointId: string): number => {
    const node = audioNodesRef.current.get(pointId);
    if (!node) return 0;
    return node.gainNode.gain.value;
  };

  const forceMaxVolume = () => {
    if (!audioContextRef.current || !isInitialized) return;

    audioNodesRef.current.forEach((node, id) => {
      if (node.gainNode && audioContextRef.current) {
        node.gainNode.gain.setValueAtTime(1.0, audioContextRef.current.currentTime);
        console.log(`Set audio ${id} to max volume`);
      }
    });
  };

  const resumeAudioContext = () => {
    if (!audioContextRef.current) {
      console.error("No AudioContext to resume");
      return;
    }

    console.log("Current AudioContext state:", audioContextRef.current.state);

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
        .then(() => console.log("AudioContext resumed successfully"))
        .catch(err => console.error("Failed to resume AudioContext:", err));
    }
  };

  // 提供的 Context 值
  const contextValue: AudioContextValue = {
    isInitialized,
    updateVolumes,
    getVolume,
    play: playAllAudio,
    pause: pauseAllAudio,
    isPlaying,
    audioPoints,
    loadingProgress,
    forceMaxVolume, // Add this
    resumeAudioContext // Add this
  };

  return (
    <AudioContextInstance.Provider value={contextValue}>
      {children}

      <button
        onClick={resumeAudioContext}
        className="px-4 py-2 bg-purple-500 text-white rounded-full mb-4 ml-2"
      >
        Resume Audio Context
      </button>
    </AudioContextInstance.Provider>
  );
};

// 自定義 Hook 使用 Context
export const useAudioContext = () => {
  const context = useContext(AudioContextInstance);

  if (!context) {
    throw new Error('useAudioContext must be used within an AudioContextProvider');
  }

  return context;
};
