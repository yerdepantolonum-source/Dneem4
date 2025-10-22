import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/lib/stores/useGameStore';
import { GameEngine } from '@/lib/gameEngine/GameEngine';
import { GameUI } from '@/components/ui/GameUI';
import { MobileControls } from '@/components/ui/MobileControls';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { Button } from '@/components/ui/button';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const isMobile = useIsMobile();
  
  const { 
    gameState,
    controlMode,
    setControlMode,
    startGame,
    restartGame,
    setGameState
  } = useGameStore();

  const [showModeSelection, setShowModeSelection] = useState(false);

  useEffect(() => {
    if (canvasRef.current && gameState === 'playing' && controlMode) {
      const canvas = canvasRef.current;
      gameEngineRef.current = new GameEngine(canvas, controlMode === 'mobile');
      gameEngineRef.current.start();

      return () => {
        if (gameEngineRef.current) {
          gameEngineRef.current.stop();
        }
      };
    }
  }, [gameState, controlMode]);

  const handleStartGame = (mode: 'desktop' | 'mobile') => {
    setControlMode(mode);
    startGame();
  };

  const handleRestartGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.restart();
    }
    restartGame();
  };

  const handleBackToMenu = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.stop();
    }
    setGameState('menu');
    setShowModeSelection(false);
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black flex items-center justify-center p-4">
        <div className="text-center max-w-4xl">
          <div className="mb-8 text-8xl animate-pulse">🧟</div>
          <h1 className="text-7xl font-bold text-white mb-4 drop-shadow-2xl animate-in fade-in slide-in-from-top duration-700">
            Zombi Savunması
          </h1>
          <div className="h-1 w-64 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mb-6"></div>
          <p className="text-2xl text-gray-300 mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-150">
            Dalga dalga gelen zombilere karşı hayatta kal. Kaynak topla, yapılar inşa et ve savun!
          </p>
          
          {!showModeSelection ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
              <Button
                size="lg"
                onClick={() => setShowModeSelection(true)}
                className="px-12 py-6 text-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 font-bold shadow-2xl border-4 border-red-400/50 transform hover:scale-105 transition-all"
              >
                🎮 Oyuna Başla
              </Button>
              
              <div className="mt-8 p-6 bg-black/40 backdrop-blur-md rounded-lg border border-gray-700 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-white mb-3">🎯 Nasıl Oynanır</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-gray-300">
                  <div>
                    <p className="font-bold text-green-400">⚔️ Savaş:</p>
                    <p className="text-sm">Zombileri öldür ve dalgaları savuştur</p>
                  </div>
                  <div>
                    <p className="font-bold text-yellow-400">🌲 Kaynak Topla:</p>
                    <p className="text-sm">Odun, taş ve meyve topla</p>
                  </div>
                  <div>
                    <p className="font-bold text-blue-400">🏗️ İnşa Et:</p>
                    <p className="text-sm">Duvar, ev ve taret yap</p>
                  </div>
                  <div>
                    <p className="font-bold text-purple-400">🛡️ Savun:</p>
                    <p className="text-sm">Yapılarınla bölgeni koru</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
              <h2 className="text-4xl font-bold text-white mb-8">Kontrol Tipi Seç</h2>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  onClick={() => handleStartGame('desktop')}
                  className="group relative p-8 bg-gradient-to-br from-blue-900/80 to-blue-950/80 hover:from-blue-800/90 hover:to-blue-900/90 rounded-2xl border-4 border-blue-600/50 hover:border-blue-400 shadow-2xl transform hover:scale-105 transition-all backdrop-blur-sm"
                >
                  <div className="text-6xl mb-4">🖥️</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Bilgisayar</h3>
                  <p className="text-gray-300 text-sm">Klavye & Fare</p>
                  <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                </button>
                
                <button
                  onClick={() => handleStartGame('mobile')}
                  className="group relative p-8 bg-gradient-to-br from-green-900/80 to-green-950/80 hover:from-green-800/90 hover:to-green-900/90 rounded-2xl border-4 border-green-600/50 hover:border-green-400 shadow-2xl transform hover:scale-105 transition-all backdrop-blur-sm"
                >
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Mobil</h3>
                  <p className="text-gray-300 text-sm">Dokunmatik Kontrol</p>
                  <div className="absolute inset-0 bg-green-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                </button>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowModeSelection(false)}
                className="mt-8 text-white border-2 border-white/70 hover:bg-white hover:text-black font-bold px-8 py-3 text-lg"
              >
                ← Geri
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-900/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-gray-700 rounded-lg shadow-2xl bg-black"
          style={{ 
            maxWidth: '100vw', 
            maxHeight: '70vh', 
            imageRendering: 'pixelated'
          }}
        />
        
        <GameUI
          onRestart={handleRestartGame}
          onBackToMenu={handleBackToMenu}
        />
      </div>
      
      {controlMode === 'mobile' && (
        <MobileControls gameEngine={gameEngineRef.current} />
      )}
    </div>
  );
};

export default Game;
