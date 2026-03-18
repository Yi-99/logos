export interface Philosopher {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  quote: string;
  dates: string;
  location: string;
  image: string;
  imageClassic?: string;
	metaphysicsCategory?: string;
	sortOrder: number;
}