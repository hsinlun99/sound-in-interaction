interface AnimalFactProps {
  facts: string[];
  isAnswerShown: boolean;
}


const AnimalFact: React.FC<AnimalFactProps> = ({ facts, isAnswerShown }) => {
  if (!isAnswerShown) {
    return null;
  }
  return (
    <div className="fixed top-1/3 right-10 transform -translate-y-1/2 w-80 h-60 p-2 border border-transparent rounded-md overflow-y-auto break-words bg-white shadow">
      {facts[Math.floor(Math.random() * facts.length)]}
    </div>
  );
}

export default AnimalFact;
