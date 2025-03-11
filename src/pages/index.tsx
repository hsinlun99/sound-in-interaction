// pages/index.tsx
import { useState, useEffect } from 'react';
import AudioSlider from '../components/AudioSlider';
import Head from 'next/head';
import { AudioContextProvider, AudioPoint } from '@/context/AudioContext';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  
  // 確保只在客戶端渲染
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const audioPoints: AudioPoint[] = [
    { id: '1', position: 10, audioSrc: '/audio/eagle-level-1.wav', name: '鋼琴' },
    { id: '2', position: 30, audioSrc: '/audio/eagle-level-2.wav', name: '小提琴' },
    { id: '3', position: 50, audioSrc: '/audio/eagle-level-3.wav', name: '鼓' },
    { id: '4', position: 70, audioSrc: '/audio/eagle-level-4.wav', name: '貝斯' },
    { id: '5', position: 90, audioSrc: '/audio/eagle-level-5.wav', name: '人聲' },
  ];

  const handleStartAudio = () => {
    // Create a fresh AudioContext each time
    setAudioStarted(true);
  };

  return (
    <div className="container mx-auto p-8">
      <Head>
        <title>音頻混合器</title>
      </Head>
      
      <h1 className="text-3xl font-bold mb-8 text-center">
        音頻混合器
      </h1>
      
      {mounted && !audioStarted ? (
        <div className="text-center p-10">
          <p className="mb-8">
            點擊下方按鈕啟動音頻系統
          </p>
          <button 
            onClick={handleStartAudio}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            啟動音頻
          </button>
        </div>
      ) : mounted && audioStarted ? (
        <AudioContextProvider audioPoints={audioPoints}>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <AudioSlider />
          </div>
        </AudioContextProvider>
      ) : (
        <p className="text-center">載入中...</p>
      )}
      
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>注意：音頻文件應放置在 public/audio 目錄下</p>
      </div>
    </div>
  );
}
