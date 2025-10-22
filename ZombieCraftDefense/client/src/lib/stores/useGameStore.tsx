import { create } from 'zustand';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'victory';
export type ControlMode = 'desktop' | 'mobile' | null;

interface GameStore {
  gameState: GameState;
  controlMode: ControlMode;
  wave: number;
  score: number;
  
  // Actions
  setGameState: (state: GameState) => void;
  setControlMode: (mode: ControlMode) => void;
  setWave: (wave: number) => void;
  setScore: (score: number) => void;
  startGame: () => void;
  restartGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'menu',
  controlMode: null,
  wave: 1,
  score: 0,
  
  setGameState: (state) => set({ gameState: state }),
  setControlMode: (mode) => set({ controlMode: mode }),
  setWave: (wave) => set({ wave }),
  setScore: (score) => set({ score }),
  
  startGame: () => set({ 
    gameState: 'playing',
    wave: 1,
    score: 0
  }),
  
  restartGame: () => set({ 
    gameState: 'playing',
    wave: 1,
    score: 0
  }),
}));
