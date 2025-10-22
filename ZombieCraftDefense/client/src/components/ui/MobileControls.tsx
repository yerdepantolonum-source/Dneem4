import React, { useRef, useCallback, useState } from 'react';
import { Button } from './button';
import { GameEngine } from '@/lib/gameEngine/GameEngine';

interface MobileControlsProps {
  gameEngine: GameEngine | null;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ gameEngine }) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [joystickOffset, setJoystickOffset] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const joystickCenter = useRef({ x: 0, y: 0 });
  const touchId = useRef<number | null>(null);

  const handleJoystickStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!gameEngine || !joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    touchId.current = touch.identifier;
    
    setIsJoystickActive(true);
    joystickCenter.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    handleJoystickMove(touch.clientX, touch.clientY);
  }, [gameEngine]);

  const handleJoystickMove = useCallback((clientX: number, clientY: number) => {
    if (!gameEngine || !isJoystickActive) return;

    const dx = clientX - joystickCenter.current.x;
    const dy = clientY - joystickCenter.current.y;
    const distance = Math.hypot(dx, dy);
    const maxDistance = 40;

    // Clamp to max distance
    const clampedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(dy, dx);
    
    const offsetX = Math.cos(angle) * clampedDistance;
    const offsetY = Math.sin(angle) * clampedDistance;
    
    setJoystickOffset({ x: offsetX, y: offsetY });

    // Normalize to -1 to 1 range for movement
    const normalizedX = dx / maxDistance;
    const normalizedY = dy / maxDistance;

    gameEngine.getInputManager().setMobileMovement({ 
      x: normalizedX, 
      y: normalizedY 
    });

    // Update aim direction based on joystick direction
    if (Math.abs(normalizedX) > 0.1 || Math.abs(normalizedY) > 0.1) {
      const player = gameEngine.getPlayer();
      const aimDistance = 200;
      const aimPosition = {
        x: player.position.x + normalizedX * aimDistance,
        y: player.position.y + normalizedY * aimDistance
      };
      gameEngine.getInputManager().setMobileAimPosition(aimPosition);
    }
  }, [gameEngine, isJoystickActive]);

  const handleJoystickTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!isJoystickActive) return;
    
    // Find the touch that started the joystick
    const touch = Array.from(e.touches).find(t => t.identifier === touchId.current);
    if (touch) {
      handleJoystickMove(touch.clientX, touch.clientY);
    }
  }, [handleJoystickMove, isJoystickActive]);

  const handleJoystickEnd = useCallback(() => {
    if (!gameEngine) return;

    setIsJoystickActive(false);
    setJoystickOffset({ x: 0, y: 0 });
    touchId.current = null;
    gameEngine.getInputManager().setMobileMovement({ x: 0, y: 0 });
  }, [gameEngine]);

  const handleShoot = useCallback(() => {
    if (!gameEngine) return;
    gameEngine.getInputManager().setMobileShooting(true);
    setTimeout(() => {
      if (gameEngine) {
        gameEngine.getInputManager().setMobileShooting(false);
      }
    }, 100);
  }, [gameEngine]);

  const handleBuild = useCallback((buildingType: string) => {
    if (!gameEngine) return;
    gameEngine.getInputManager().setMobileBuilding(buildingType);
  }, [gameEngine]);

  const handleGather = useCallback(() => {
    if (!gameEngine) return;
    gameEngine.getInputManager().setMobileGathering(true);
    setTimeout(() => {
      if (gameEngine) {
        gameEngine.getInputManager().setMobileGathering(false);
      }
    }, 100);
  }, [gameEngine]);

  if (!gameEngine) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Movement Joystick - Bottom Left */}
      <div className="absolute bottom-8 left-8 flex flex-col items-center gap-2 pointer-events-auto">
        <div
          ref={joystickRef}
          className="w-32 h-32 bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-full border-4 border-gray-600/80 shadow-2xl flex items-center justify-center relative backdrop-blur-sm"
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
        >
          {/* Joystick background ring */}
          <div className="absolute inset-2 border-2 border-gray-700/50 rounded-full" />
          
          {/* Center dot */}
          <div className="absolute w-2 h-2 bg-white/30 rounded-full" />
          
          {/* Movable stick */}
          <div 
            className={`absolute w-12 h-12 rounded-full transition-all duration-75 shadow-xl ${
              isJoystickActive 
                ? 'bg-gradient-to-br from-blue-400 to-blue-600 scale-110' 
                : 'bg-gradient-to-br from-gray-600 to-gray-700'
            }`}
            style={{
              transform: `translate(${joystickOffset.x}px, ${joystickOffset.y}px)`,
              border: '3px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="absolute inset-1 bg-white/20 rounded-full" />
          </div>
        </div>
        <div className="text-white text-sm font-bold bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
          MOVE
        </div>
      </div>

      {/* Action Buttons - Bottom Right */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-3 pointer-events-auto">
        {/* Building buttons */}
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            onTouchStart={() => handleBuild('turret')}
            className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold shadow-xl border-2 border-blue-400/50 w-12 h-12 p-0"
          >
            <span className="text-lg">🗼</span>
          </Button>
          <Button
            size="sm"
            onTouchStart={() => handleBuild('house')}
            className="bg-gradient-to-br from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-bold shadow-xl border-2 border-green-400/50 w-12 h-12 p-0"
          >
            <span className="text-lg">🏠</span>
          </Button>
          <Button
            size="sm"
            onTouchStart={() => handleBuild('wall')}
            className="bg-gradient-to-br from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900 text-white font-bold shadow-xl border-2 border-yellow-400/50 w-12 h-12 p-0"
          >
            <span className="text-lg">🧱</span>
          </Button>
        </div>
        
        {/* Gather and Shoot buttons */}
        <div className="flex gap-3 justify-end items-center">
          <Button
            size="sm"
            onTouchStart={handleGather}
            className="bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold shadow-xl border-2 border-purple-400/50 w-14 h-14 p-0"
          >
            <span className="text-xl">🎁</span>
          </Button>
          <Button
            size="lg"
            onTouchStart={handleShoot}
            className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold shadow-2xl border-4 border-red-400/50 w-20 h-20 rounded-full flex items-center justify-center p-0 active:scale-95 transition-transform"
          >
            <span className="text-3xl">🎯</span>
          </Button>
        </div>
        
        <div className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full text-center backdrop-blur-sm">
          ACTIONS
        </div>
      </div>
    </div>
  );
};
