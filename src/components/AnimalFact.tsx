interface AnimalFactProps {
  animalId: string;
  facts: string[];
  isAnswerShown: boolean;
}


const AnimalFact: React.FC<AnimalFactProps> = ({ animalId, facts, isAnswerShown }) => {
  if (!isAnswerShown) {
    return null;
  }
  let factTitle = "";
  switch (animalId) {
    case "eagle":
      factTitle = "Fact about Golden Eagle:";
      break;
    case "goose":
      factTitle = "Fact about Goose:";
      break;
    case "wolverine":
      factTitle = "Fact about Wolverine:";
      break;
    default:

      break;
  }
  return (
    <div className="fixed top-1/3 right-10 transform -translate-y-1/2 w-80 h-70 p-2 border border-transparent rounded-md overflow-y-auto break-words bg-white shadow">
      <h3 className="text-lg font-semibold mb-2">{factTitle}</h3>
      {facts[Math.floor(Math.random() * facts.length)]}
    </div>
  );
}

export default AnimalFact;
