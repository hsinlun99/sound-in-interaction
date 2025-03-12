import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimalFactProps {
  animalId: string;
  facts: string[];
}

const AnimalFact: React.FC<AnimalFactProps> = ({ animalId, facts }) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentFactIndex((currentFactIndex + 1) % facts.length);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [currentFactIndex, facts.length]);

  return (
    <div className="flex flex-col items-center w-full mx-auto p-4 max-w-6xl">
      <div className="h-50 w-180 p-2 border border-transparent rounded-md overflow-hidden bg-white shadow">
        <h3 className="text-lg font-semibold mb-2">{`Facts about ${animalId}`}</h3>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFactIndex}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {facts[currentFactIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AnimalFact;
