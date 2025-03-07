import { useState, useCallback } from "react";
import Image from "next/image";

interface FreezeButtonProps {
  onFreezeChange: (isFrozen: boolean) => void;
}

const FreezeButton: React.FC<FreezeButtonProps> = ({ onFreezeChange }) => {
  const [isFrozen, setIsFrozen] = useState<boolean>(false);

  const handleClick = useCallback(() => {
    const newFrozenState = !isFrozen;
    setIsFrozen(newFrozenState);
    onFreezeChange(newFrozenState);
  }, [isFrozen, onFreezeChange]);

  return (
    <button
      onClick={handleClick}
      className="rounded-full transition-all duration-300"
      aria-label={isFrozen ? "Unfreeze animal sounds" : "Freeze animal sounds"}
      title={isFrozen ? "Unfreeze animal sounds" : "Freeze animal sounds"}
    >
      <Image
        src={isFrozen ? "/image/freeze-button-active.svg" : "/image/freeze-button.svg"}
        alt={isFrozen ? "Frozen state" : "Unfrozen state"}
        width={100}
        height={100}
        priority
        style={{
          objectFit: "contain",
          width: "70%",
          height: "auto"
        }}
      />
    </button>
  );
};

export default FreezeButton;