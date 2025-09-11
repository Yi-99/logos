import { createContext } from 'react';
import { Philosopher } from '@/types';

interface PhilosopherContextType {
  philosopher: Philosopher | null;
  setPhilosopher: (philosopher: Philosopher) => void;
}

export const PhilosopherContext = createContext<PhilosopherContextType>({
  philosopher: null,
  setPhilosopher: () => {},
});