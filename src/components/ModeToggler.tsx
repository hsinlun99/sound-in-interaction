interface ModeTogglerProps {
  isAnswerShown: boolean;
  setIsAnswerShown: React.Dispatch<React.SetStateAction<boolean>>;
}

const ModeToggler: React.FC<ModeTogglerProps> = ({ isAnswerShown, setIsAnswerShown }) => {

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      {/* off */}
      <span className="text-sm font-medium text-gray-400">OFF</span>

      {/* Toggle Button */}
      <button
        onClick={() => setIsAnswerShown(prev => !prev)}
        className={`w-14 h-8 rounded-full ${isAnswerShown ? 'bg-[#5F75D7]' : 'bg-[#636363]'
          } flex items-center px-1 transition-colors duration-200`}
      >
        <div
          className={`w-6 h-6 bg-white rounded-full shadow-md transform ${isAnswerShown ? 'translate-x-6' : 'translate-x-0'
            } transition-transform duration-200`}
        />
      </button>
      {/* on */}
      <span className="text-sm font-medium text-gray-400">ON</span>
    </div>
  )
}

export default ModeToggler
