interface StartButtonProps {
  onClick: () => void;
}

const StartButton: React.FC<StartButtonProps> = ({ onClick }) => {
  return (
    <button
      className="absolute top-[10%] left-[50%] transform -translate-x-1/2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg"
      onClick={onClick}
    >
      Start
    </button>
  );
};

export default StartButton;
