import React from 'react';
import { Button } from './button';
import { Card } from './card';
import { useGameStore } from '@/lib/stores/useGameStore';

interface GameUIProps {
  onRestart: () => void;
  onBackToMenu: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({ onRestart, onBackToMenu }) => {
  const { gameState, wave, score } = useGameStore();

  if (gameState === 'playing') {
    return (
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
        <Card className="p-4 bg-gradient-to-br from-gray-900/95 to-black/95 text-white border-2 border-gray-700 shadow-2xl backdrop-blur-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-lg font-bold">
              <span className="text-yellow-400">⚔️</span>
              <span>Dalga {wave}</span>
            </div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <span className="text-green-400">🏆</span>
              <span>{score}</span>
            </div>
          </div>
        </Card>
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToMenu}
          className="text-white border-2 border-white/70 hover:bg-white hover:text-black font-bold shadow-xl backdrop-blur-sm bg-black/50"
        >
          ← Menü
        </Button>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-50 animate-in fade-in duration-500">
        <Card className="p-10 text-center bg-gradient-to-br from-red-900/95 to-red-950/95 border-4 border-red-600 shadow-2xl max-w-md">
          <div className="mb-6 text-6xl animate-bounce">💀</div>
          <h2 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            OYUN BİTTİ
          </h2>
          <p className="text-gray-300 text-xl mb-2">Şu dalgaya kadar hayatta kaldınız</p>
          <p className="text-yellow-400 text-3xl font-bold mb-8">Dalga {wave}</p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={onRestart}
              size="lg"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-xl border-2 border-red-400/50 px-8"
            >
              🔄 Tekrar Dene
            </Button>
            <Button
              variant="outline"
              onClick={onBackToMenu}
              size="lg"
              className="text-white border-2 border-white hover:bg-white hover:text-black font-bold shadow-xl px-8"
            >
              🏠 Menü
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'victory') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-50 animate-in fade-in duration-500">
        <Card className="p-10 text-center bg-gradient-to-br from-green-900/95 to-green-950/95 border-4 border-green-600 shadow-2xl max-w-md">
          <div className="mb-6 text-6xl animate-bounce">🎉</div>
          <h2 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            ZAFER!
          </h2>
          <p className="text-gray-300 text-xl mb-2">Tüm dalgaları geçtiniz!</p>
          <p className="text-yellow-400 text-3xl font-bold mb-8">{wave} Dalga</p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={onRestart}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-xl border-2 border-green-400/50 px-8"
            >
              🎮 Tekrar Oyna
            </Button>
            <Button
              variant="outline"
              onClick={onBackToMenu}
              size="lg"
              className="text-white border-2 border-white hover:bg-white hover:text-black font-bold shadow-xl px-8"
            >
              🏠 Menü
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};
