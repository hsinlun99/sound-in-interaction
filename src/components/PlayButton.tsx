import { useEffect } from "react";

interface PlayButtonProps {
  isPlaying: boolean;
  selectedYearIndex: number;
  healthLevels: string[];
  isAnswerShown: boolean;
  volume: number;
}

const PlayButton: React.FC<PlayButtonProps> = ({ isPlaying, selectedYearIndex, healthLevels, isAnswerShown, volume }) => {

  const baseScale = 1.0;
  const maxScaleIncrease = 0.4;
  const scaledVolume = Math.pow(volume, 0.4);
  const scale = baseScale + (scaledVolume * maxScaleIncrease);

  const transformStyle = {
    transform: `scale(${scale})`,
    transition: 'transform 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Elastic bounce effect
    transformOrigin: 'center center',
    animation: volume > 0.05 ? `heartbeat ${0.6 - (volume * 0.2)}s ease-out infinite` : 'none',
  };

  useEffect(() => {
    // Create a dynamic style element for the keyframe animation
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes heartbeat {
        0% { transform: scale(${baseScale}); }
        15% { transform: scale(${baseScale + (scaledVolume * maxScaleIncrease * 1.2)}); }
        30% { transform: scale(${baseScale + (scaledVolume * maxScaleIncrease * 0.9)}); }
        45% { transform: scale(${baseScale + (scaledVolume * maxScaleIncrease * 1.1)}); }
        60% { transform: scale(${baseScale + (scaledVolume * maxScaleIncrease * 0.95)}); }
        100% { transform: scale(${baseScale}); }
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [volume, scaledVolume, baseScale, maxScaleIncrease]);

  // for debugging
  useEffect(() => {
    if (volume > 0.01) {
      console.log("Volume in button:", volume.toFixed(4), "Scale:", scale.toFixed(2));
    }
  }, [volume, scale]);

  if (isAnswerShown) {
    if (isPlaying) {
      return (
        <svg style={transformStyle} className={`${healthLevels[selectedYearIndex] === 'level-1' ? 'fill-level-1' :
          healthLevels[selectedYearIndex] === 'level-2' ? 'fill-level-2' :
            healthLevels[selectedYearIndex] === 'level-3' ? 'fill-level-3' :
              healthLevels[selectedYearIndex] === 'level-4' ? 'fill-level-4' :
                healthLevels[selectedYearIndex] === 'level-5' ? 'fill-level-5' :
                  'bg-gray-400'
          }`} width="298" height="245" viewBox="0 0 298 245" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_d_50_212)">
            <path d="M218.5 6C218.5 6 166.375 6 149 57.9231C131.625 6 79.5 6 79.5 6C41.275 6 10 37.1538 10 75.2308C10 146.192 149 231 149 231C149 231 288 144.462 288 75.2308C288 37.1538 256.725 6 218.5 6Z" />
          </g>
          <path d="M118 99.6C118 93.6591 118 90.6918 119.846 88.8459C121.692 87 124.659 87 130.6 87C136.541 87 139.508 87 141.354 88.8459C143.2 90.6918 143.2 93.6591 143.2 99.6V137.4C143.2 143.341 143.2 146.308 141.354 148.154C139.508 150 136.541 150 130.6 150C124.659 150 121.692 150 119.846 148.154C118 146.308 118 143.341 118 137.4V99.6ZM155.8 99.6C155.8 93.6591 155.8 90.6918 157.646 88.8459C159.492 87 162.459 87 168.4 87C174.341 87 177.308 87 179.154 88.8459C181 90.6918 181 93.6591 181 99.6V137.4C181 143.341 181 146.308 179.154 148.154C177.308 150 174.341 150 168.4 150C162.459 150 159.492 150 157.646 148.154C155.8 146.308 155.8 143.341 155.8 137.4V99.6Z" fill="black" />
          <defs>
            <filter id="filter0_d_50_212" x="0" y="0" width="298" height="245" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.37895 0 0 0 0 0.37895 0 0 0 0 0.37895 0 0 0 0.76 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_50_212" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_50_212" result="shape" />
            </filter>
          </defs>
        </svg>

      )

    } else {
      return (
        <svg width="298" height="245" viewBox="0 0 298 245" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_d_50_210)">
            <path d="M218.5 6C218.5 6 166.375 6 149 57.9231C131.625 6 79.5 6 79.5 6C41.275 6 10 37.1538 10 75.2308C10 146.192 149 231 149 231C149 231 288 144.462 288 75.2308C288 37.1538 256.725 6 218.5 6Z" fill="#757575" />
          </g>
          <path d="M183.81 110.265C185.378 111.108 186.689 112.366 187.603 113.905C188.517 115.444 189 117.205 189 119C189 120.795 188.517 122.556 187.603 124.095C186.689 125.634 185.378 126.892 183.81 127.735L142.001 150.725C135.269 154.431 127 149.613 127 141.994V96.0096C127 88.3868 135.269 83.5723 142.001 87.2715L183.81 110.265Z" fill="black" />
          <defs>
            <filter id="filter0_d_50_210" x="0" y="0" width="298" height="245" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.37895 0 0 0 0 0.37895 0 0 0 0 0.37895 0 0 0 0.76 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_50_210" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_50_210" result="shape" />
            </filter>
          </defs>
        </svg>
      )
    }
  } else {
    if (isPlaying) {
      return (
        <svg style={transformStyle} width="298" height="245" viewBox="0 0 298 245" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_d_50_212)">
            <path d="M218.5 6C218.5 6 166.375 6 149 57.9231C131.625 6 79.5 6 79.5 6C41.275 6 10 37.1538 10 75.2308C10 146.192 149 231 149 231C149 231 288 144.462 288 75.2308C288 37.1538 256.725 6 218.5 6Z" fill="#757575" />
          </g>
          <path d="M118 99.6C118 93.6591 118 90.6918 119.846 88.8459C121.692 87 124.659 87 130.6 87C136.541 87 139.508 87 141.354 88.8459C143.2 90.6918 143.2 93.6591 143.2 99.6V137.4C143.2 143.341 143.2 146.308 141.354 148.154C139.508 150 136.541 150 130.6 150C124.659 150 121.692 150 119.846 148.154C118 146.308 118 143.341 118 137.4V99.6ZM155.8 99.6C155.8 93.6591 155.8 90.6918 157.646 88.8459C159.492 87 162.459 87 168.4 87C174.341 87 177.308 87 179.154 88.8459C181 90.6918 181 93.6591 181 99.6V137.4C181 143.341 181 146.308 179.154 148.154C177.308 150 174.341 150 168.4 150C162.459 150 159.492 150 157.646 148.154C155.8 146.308 155.8 143.341 155.8 137.4V99.6Z" fill="black" />
          <defs>
            <filter id="filter0_d_50_212" x="0" y="0" width="298" height="245" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.37895 0 0 0 0 0.37895 0 0 0 0 0.37895 0 0 0 0.76 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_50_212" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_50_212" result="shape" />
            </filter>
          </defs>
        </svg>

      )

    } else {
      return (
        <svg width="298" height="245" viewBox="0 0 298 245" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_d_50_210)">
            <path d="M218.5 6C218.5 6 166.375 6 149 57.9231C131.625 6 79.5 6 79.5 6C41.275 6 10 37.1538 10 75.2308C10 146.192 149 231 149 231C149 231 288 144.462 288 75.2308C288 37.1538 256.725 6 218.5 6Z" fill="#757575" />
          </g>
          <path d="M183.81 110.265C185.378 111.108 186.689 112.366 187.603 113.905C188.517 115.444 189 117.205 189 119C189 120.795 188.517 122.556 187.603 124.095C186.689 125.634 185.378 126.892 183.81 127.735L142.001 150.725C135.269 154.431 127 149.613 127 141.994V96.0096C127 88.3868 135.269 83.5723 142.001 87.2715L183.81 110.265Z" fill="black" />
          <defs>
            <filter id="filter0_d_50_210" x="0" y="0" width="298" height="245" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.37895 0 0 0 0 0.37895 0 0 0 0 0.37895 0 0 0 0.76 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_50_210" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_50_210" result="shape" />
            </filter>
          </defs>
        </svg>
      )
    }
  }

};

export default PlayButton;