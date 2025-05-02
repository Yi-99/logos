export interface Advisor {
  id: number;
  name: string;
  description: string;
  image: string;
  image_description: string;
}

export const advisors: Advisor[] = [
  {
    id: 1,
    name: "Jesus Christ",
    description: "(6 BC - 33 AD) Known as the Messiah, He was a profound moral teacher, a symbol of existential hope, and a subject of metaphysical inquiry.",
    image: "/jesus_christ.webp",
    image_description: "image of Jesus Christ"
  },
  {
    id: 2,
    name: "Plato",
    description: "(427-347 BC) Known as a classical Greek philosopher, he was a student of Socrates, teacher of Aristotle, and one of the most influential figures in the history of Western philosophy.",
    image: "/plato.png",
    image_description: "image of Plato"
  },
  {
    id: 3,
    name: "Muhammad",
    description: "(570-632 AD) Known as the last prophet and founder of Islam, His teachings and the Qur'an contain significant ethical, metaphysical, and epistemological insights that have deeply influenced Islamic philosophy.",
    image: "/muhammad.png",
    image_description: "image of Muhammad"
  },
  {
    id: 4,
    name: "Aristotle",
    description: "(384-322 BC) He was known as a Greek philosopher, scientist, and one of the most influential thinkers in Western philosophy. He was a student of Plato and teacher to Alexander the Great.",
    image: "/aristotle.png",
    image_description: "image of Aristotle"
  },
];
