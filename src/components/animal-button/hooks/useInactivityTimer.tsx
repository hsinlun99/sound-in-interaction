import { useCallback, useRef, RefObject } from 'react';

interface UseInactivityTimerProps {
  currentIndexRef: RefObject<number> & {current: number};
  inactivityTimeout: number;
  isFrozen: boolean;
  setCurrentAudioIndex: React.Dispatch<React.SetStateAction<number>>;
  playAudioWithIndex: (index: number) => AnalyserNode | null | undefined | void;
  isHoveringRef: RefObject<boolean>;
}

export const useInactivityTimer = ({
  currentIndexRef,
  inactivityTimeout,
  isFrozen,
  setCurrentAudioIndex,
  playAudioWithIndex,
  isHoveringRef
}: UseInactivityTimerProps) => {
  const timerIdRef = useRef<number | null>(null);

  const clearResetTimer = useCallback(() => {
    if (timerIdRef.current !== null) {
      window.clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);


  const startResetTimer = useCallback(() => {

    if (isFrozen) {
      console.log("Freeze active: not starting inactivity timer");
      return;
    }

    clearResetTimer();


    if (currentIndexRef.current !== 0) {
      console.log(`Starting reset timer (${inactivityTimeout}ms)`);

      timerIdRef.current = window.setTimeout(() => {
        console.log("Inactivity timeout: Resetting to first audio");
        setCurrentAudioIndex(0);


        if (isHoveringRef.current) {
          playAudioWithIndex(0);
        }

        timerIdRef.current = null;
      }, inactivityTimeout);
    }
  }, [clearResetTimer, inactivityTimeout, playAudioWithIndex, isFrozen, setCurrentAudioIndex, currentIndexRef, isHoveringRef]);

  return {
    startResetTimer,
    clearResetTimer
  };
};