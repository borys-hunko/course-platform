const words = ["Alice", "Borys", "Anna", "Vlad1"];

export const generateWords = () => {
  return words[Date.now() % words.length];
};
