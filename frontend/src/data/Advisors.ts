export interface Advisor {
  id: number;
  name: string;
  description: string;
  image: string;
}

export const advisors: Advisor[] = [
  {
    id: 1,
    name: "Jesus Christ",
    description: "(6 BC - 33 AD) Known as the Messiah, He was a profound moral teacher, a symbol of existential hope, and a subject of metaphysical inquiry.",
    image: "/jesus_christ.webp",
  },
  {
    id: 2,
    name: "Plato",
    description: "(427-347 BC) Known as a classical Greek philosopher, student of Socrates, teacher of Aristotle, and one of the most influential figures in the history of Western philosophy.",
    image: "/plato.png",
  },
];
