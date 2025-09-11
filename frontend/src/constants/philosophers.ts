import { Philosopher } from '@/types';

export const philosophers: Philosopher[] = [
  {
    id: 'socrates',
    name: 'Socrates',
    subtitle: 'Father of Western Philosophy',
    description: 'Known for the Socratic method',
		quote: '“I know that I know nothing.”',
    dates: '469-399 BC',
    school: 'Classical Greek',
    image: '/socrates-real.jpg'
  },
  {
    id: 'plato',
    name: 'Plato',
    subtitle: '',
    description: 'Founded the Academy in Athens and wrote philosophical dialogues',
		quote: '“We are what we think. All that we are arises with our thoughts. With our thoughts, we make the world.”',
    dates: '428-348 BC',
    school: 'Platonism',
    image: '/plato-real.jpg',
    imageClassic: '/plato-athens.jpg',
  },
  {
    id: 'aristotle',
    name: 'Aristotle',
    subtitle: 'The Philosopher',
    description: 'Student of Plato and tutor to Alexander the Great, father of logic',
		quote: '“We are what we repeatedly do. Excellence, then, is not an act, but a habit.”',
    dates: '384-322 BC',
    school: 'Aristotelian',
    image: '/aristotle-real.jpg',
    imageClassic: '/aristotle-athens.webp',
  },
  {
    id: 'confucius',
    name: 'Confucius',
    subtitle: 'Greatest Chinese Philosopher',
    description: 'Emphasized morality, justice, kindness, and sincerity',
		quote: '“The more man meditates upon good thoughts, the better will be his world and the world at large.”',
    dates: '551-479 BC',
    school: 'Confucianism',
    image: '/confucius-real.jpg'
  },
  {
    id: 'buddha',
    name: 'Buddha',
    subtitle: 'The Enlightened One',
    description: 'Founded Buddhism and taught the path to enlightenment',
		quote: '“The world is but a mass of shadows,”',
    dates: '563-483 BC',
    school: 'Buddhism',
    image: '/buddha-handsome.png'
  },
  {
    id: 'jesus',
    name: 'Jesus',
    subtitle: 'The Messiah',
    description: 'Founder of Christianity, Savior of Mankind',
		quote: '“For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.”',
    dates: '0-33 AD',
    school: 'Christianity',
    image: '/jesus.jpg'
  },
  {
		id: 'descartes',
    name: 'René Descartes',
    subtitle: 'The Father of Modern Philosophy',
    description: 'Father of Modern Philosophy, Known for the Cogito, ergo sum',
		quote: '“I think, therefore I am.”',
    dates: '1596-1650',
    school: 'Cartesianism',
    image: '/descartes-real.jpg'
  },
  {
		id: 'nietzsche',
    name: 'Friedrich Nietzsche',
    subtitle: 'Anti-Christ',
    description: 'Challenged traditional values and proclaimed the death of God',
		quote: '“He who has a why to live can bear almost any how.”',
    dates: '1844-1900',
    school: 'Existentialism',
    image: '/nietzsche.jpg'
  },
	{
		id: 'jean-paul',
		name: 'Jean-Paul Sartre',
		subtitle: 'The Existentialist',
		description: 'Known for the concept of "existentialism"',
		quote: '“Man is condemned to be free; because once thrown into the world, he is responsible for everything he does. It is up to you to give [life] a meaning.',
		dates: '1905-1980',
		school: 'Existentialism',
		image: '/jean-paul-sartre.jpg'
	},
];

export const getPhilosopherById = (id: string): Philosopher | undefined => {
  return philosophers.find(philosopher => philosopher.id === id);
};

export const getPhilosopherInfo = (id: string | undefined): Philosopher | undefined => {
	if (id === undefined) return undefined;

  const philosopher = getPhilosopherById(id);
  if (philosopher) return philosopher;
};

// {
// 	id: 'thomas-aquinas',
// 	name: 'Thomas Aquinas',
// 	subtitle: 'The Angelic Doctor',
// 	description: 'The Angelic Doctor, Known for the Summa Theologica',
// 	dates: '1225-1274',
// 	school: 'Thomism',
// 	image: '/thomas-aquinas-real.jpg',
// 	imageClassic: '/thomas-aquinas.jpg'
// },