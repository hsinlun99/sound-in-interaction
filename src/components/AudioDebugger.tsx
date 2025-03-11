// components/AudioDebugger.tsx
import { useEffect, useState } from 'react';
import { useAudioContext } from '@/context/AudioContext';

const AudioDebugger = () => {
  const {
    isInitialized,
    audioPoints,
    loadingProgress,
    isPlaying
  } = useAudioContext();

  const [fileStatuses, setFileStatuses] = useState<Record<string, string>>({});

  // Check if audio files are accessible
  useEffect(() => {
    const checkFiles = async () => {
      const statuses: Record<string, string> = {};

      for (const point of audioPoints) {
        try {
          const response = await fetch(point.audioSrc, { method: 'HEAD' });
          statuses[point.id] = response.ok ?
            `Found (${response.status})` :
            `Error (${response.status})`;
        } catch (error) {
          statuses[point.id] = `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
      }

      setFileStatuses(statuses);
    };

    checkFiles();
  }, [audioPoints]);

  const testDirectPlayback = (src: string) => {
    const audio = new Audio(src);
    audio.volume = 0.5;
    audio.play()
      .then(() => console.log(`Direct playback of ${src} successful`))
      .catch(err => console.error(`Direct playback of ${src} failed:`, err));
  };

  return (
    <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Audio Debugging Info</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium">System Status:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>AudioContext Initialized: <span className={isInitialized ? "text-green-600" : "text-red-600"}>{isInitialized ? "Yes" : "No"}</span></li>
            <li>Loading Progress: <span>{loadingProgress}%</span></li>
            <li>Playback State: <span className={isPlaying ? "text-green-600" : "text-yellow-600"}>{isPlaying ? "Playing" : "Paused"}</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium">Audio File Status:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {audioPoints.map(point => (
              <li key={point.id}>
                {point.name} ({point.audioSrc}): {' '}
                <span className={fileStatuses[point.id]?.includes('Error') ? "text-red-600" : "text-green-600"}>
                  {fileStatuses[point.id] || 'Checking...'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4">
        <button
          className="px-3 py-1 bg-green-500 text-white rounded"
          onClick={() => testDirectPlayback(audioPoints[0].audioSrc)}
        >
          Test Direct Audio
        </button>
        <h4 className="font-medium">Troubleshooting Steps:</h4>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Verify audio files exist in the public/audio directory</li>
          <li>Check browser console for errors</li>
          <li>Try interacting with the page (click anywhere) to trigger audio context</li>
          <li>Ensure browser permissions for audio are enabled</li>
          <li>Test with different audio file formats (mp3 instead of wav)</li>
        </ol>
      </div>
    </div>
  );
};

export default AudioDebugger;
