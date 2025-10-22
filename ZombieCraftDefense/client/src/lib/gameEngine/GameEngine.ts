import { Player } from './Player';
import { Zombie } from './Zombie';
import { Bullet } from './Bullet';
import { ResourceNode } from './ResourceNode';
import { Building } from './Building';
import { WaveManager } from './WaveManager';
import { Renderer } from './Renderer';
import { InputManager } from './InputManager';
import { CollisionSystem } from './CollisionSystem';
import { AudioManager } from './AudioManager';

export interface Vector2 {
  x: number;
  y: number;
}

export interface GameState {
  player: Player;
  zombies: Zombie[];
  bullets: Bullet[];
  resourceNodes: ResourceNode[];
  buildings: Building[];
  particles: any[];
  resources: {
    wood: number;
    stone: number;
  };
  isWaveActive: boolean;
  waveCountdown: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private waveManager: WaveManager;
  private renderer: Renderer;
  private inputManager: InputManager;
  private collisionSystem: CollisionSystem;
  private audioManager: AudioManager;
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private isMobile: boolean;

  constructor(canvas: HTMLCanvasElement, isMobile: boolean = false) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.isMobile = isMobile;
    
    // Initialize game state
    this.gameState = {
      player: new Player(400, 300),
      zombies: [],
      bullets: [],
      resourceNodes: this.generateResourceNodes(),
      buildings: [],
      particles: [],
      resources: {
        wood: 50,
        stone: 30
      },
      isWaveActive: false,
      waveCountdown: 30
    };

    // Initialize systems
    this.waveManager = new WaveManager();
    this.renderer = new Renderer(this.ctx);
    this.inputManager = new InputManager(canvas, isMobile);
    this.collisionSystem = new CollisionSystem();
    this.audioManager = new AudioManager();
  }

  private generateResourceNodes(): ResourceNode[] {
    const nodes: ResourceNode[] = [];
    const positions = [
      { x: 100, y: 100, type: 'wood' as const },
      { x: 700, y: 100, type: 'stone' as const },
      { x: 100, y: 500, type: 'wood' as const },
      { x: 700, y: 500, type: 'stone' as const },
      { x: 200, y: 200, type: 'fruit' as const },
      { x: 600, y: 400, type: 'fruit' as const },
      { x: 400, y: 100, type: 'wood' as const },
      { x: 400, y: 500, type: 'stone' as const },
    ];

    positions.forEach(pos => {
      nodes.push(new ResourceNode(pos.x, pos.y, pos.type));
    });

    return nodes;
  }

  start(): void {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  stop(): void {
    this.isRunning = false;
  }

  restart(): void {
    this.gameState = {
      player: new Player(400, 300),
      zombies: [],
      bullets: [],
      resourceNodes: this.generateResourceNodes(),
      buildings: [],
      particles: [],
      resources: {
        wood: 50,
        stone: 30
      },
      isWaveActive: false,
      waveCountdown: 30
    };
    this.waveManager = new WaveManager();
  }

  private gameLoop = (currentTime: number = 0): void => {
    if (!this.isRunning) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // Handle input
    this.handleInput();

    // Update wave system
    this.updateWaveSystem(deltaTime);

    // Update game objects
    this.gameState.player.update(deltaTime);
    this.gameState.zombies.forEach(zombie => zombie.update(deltaTime, this.gameState.player.position));
    this.gameState.bullets.forEach(bullet => bullet.update(deltaTime));
    
    // Update buildings and collect bullets from turrets
    this.gameState.buildings.forEach(building => {
      const turretBullets = building.update(deltaTime, this.gameState.zombies);
      this.gameState.bullets.push(...turretBullets);
    });

    // Handle collisions
    this.handleCollisions();

    // Remove dead objects
    this.cleanup();

    // Check game over conditions
    this.checkGameOver();
  }

  private handleInput(): void {
    const input = this.inputManager.getInput();
    
    // Player movement
    const moveVector = { x: 0, y: 0 };
    if (input.keys.w || input.keys.ArrowUp) moveVector.y = -1;
    if (input.keys.s || input.keys.ArrowDown) moveVector.y = 1;
    if (input.keys.a || input.keys.ArrowLeft) moveVector.x = -1;
    if (input.keys.d || input.keys.ArrowRight) moveVector.x = 1;

    this.gameState.player.setMovement(moveVector);

    // Update player aim direction based on mouse/touch position
    if (input.mouse.position) {
      this.gameState.player.setAimDirection(input.mouse.position);
    } else if (this.isMobile) {
      // For mobile without mouse input, aim in the direction of movement or keep current aim
      const aimTarget = {
        x: this.gameState.player.position.x + this.gameState.player.aimDirection.x * 100,
        y: this.gameState.player.position.y + this.gameState.player.aimDirection.y * 100
      };
      this.inputManager.setMobileAimPosition(aimTarget);
    }

    // Shooting
    if (input.mouse.isDown || input.shooting) {
      let shootTarget = input.mouse.position;
      
      // For mobile, use current aim direction if no mouse position
      if (!shootTarget || this.isMobile) {
        shootTarget = { 
          x: this.gameState.player.position.x + this.gameState.player.aimDirection.x * 100, 
          y: this.gameState.player.position.y + this.gameState.player.aimDirection.y * 100 
        };
      }
      
      this.shoot(shootTarget);
    }

    // Building
    if (input.keys.t && !this.gameState.isWaveActive) {
      this.build('turret');
    }
    if (input.keys.h && !this.gameState.isWaveActive) {
      this.build('house');
    }
    if (input.keys.w && !this.gameState.isWaveActive) {
      this.build('wall');
    }

    // Resource gathering
    if (input.keys.e) {
      this.gatherResource();
    }
  }

  private shoot(target: Vector2): void {
    const bullet = this.gameState.player.shoot(target);
    if (bullet) {
      this.gameState.bullets.push(bullet);
      this.audioManager.playSound('hit');
    }
  }

  private build(type: string): void {
    const cost = this.getBuildingCost(type);
    if (this.gameState.resources.wood >= cost.wood && this.gameState.resources.stone >= cost.stone) {
      const building = new Building(
        this.gameState.player.position.x,
        this.gameState.player.position.y,
        type as any
      );
      
      // Check if position is valid (not overlapping)
      if (this.isValidBuildingPosition(building)) {
        this.gameState.buildings.push(building);
        this.gameState.resources.wood -= cost.wood;
        this.gameState.resources.stone -= cost.stone;
        this.audioManager.playSound('success');
      }
    }
  }

  private getBuildingCost(type: string): { wood: number; stone: number } {
    const costs = {
      turret: { wood: 30, stone: 20 },
      house: { wood: 40, stone: 10 },
      wall: { wood: 10, stone: 15 }
    };
    return costs[type as keyof typeof costs] || { wood: 0, stone: 0 };
  }

  private isValidBuildingPosition(building: Building): boolean {
    // Check distance from other buildings
    for (const existingBuilding of this.gameState.buildings) {
      const dist = Math.hypot(
        building.position.x - existingBuilding.position.x,
        building.position.y - existingBuilding.position.y
      );
      if (dist < 50) return false;
    }
    
    // Check distance from resource nodes
    for (const node of this.gameState.resourceNodes) {
      const dist = Math.hypot(
        building.position.x - node.position.x,
        building.position.y - node.position.y
      );
      if (dist < 40) return false;
    }
    
    return true;
  }

  private gatherResource(): void {
    for (const node of this.gameState.resourceNodes) {
      const dist = Math.hypot(
        this.gameState.player.position.x - node.position.x,
        this.gameState.player.position.y - node.position.y
      );
      
      if (dist < 30) {
        const resource = node.gather();
        if (resource) {
          if (resource.type === 'wood') {
            this.gameState.resources.wood += resource.amount;
          } else if (resource.type === 'stone') {
            this.gameState.resources.stone += resource.amount;
          } else if (resource.type === 'fruit') {
            this.gameState.player.heal(20);
          }
          this.audioManager.playSound('success');
          break;
        }
      }
    }
  }

  private updateWaveSystem(deltaTime: number): void {
    if (!this.gameState.isWaveActive) {
      this.gameState.waveCountdown -= deltaTime;
      if (this.gameState.waveCountdown <= 0) {
        this.startWave();
      }
    } else {
      // Check if wave is complete
      if (this.gameState.zombies.length === 0 && !this.waveManager.hasMoreZombies()) {
        this.endWave();
      }
    }

    // Spawn zombies during active wave
    if (this.gameState.isWaveActive) {
      const newZombies = this.waveManager.update(deltaTime);
      this.gameState.zombies.push(...newZombies);
    }
  }

  private startWave(): void {
    this.gameState.isWaveActive = true;
    this.waveManager.startWave();
  }

  private endWave(): void {
    this.gameState.isWaveActive = false;
    this.gameState.waveCountdown = 30;
    this.waveManager.nextWave();
    
    // Regenerate some resources
    this.gameState.resourceNodes.forEach(node => node.regenerate());
  }

  private handleCollisions(): void {
    // Bullet vs Zombie collisions
    for (let i = this.gameState.bullets.length - 1; i >= 0; i--) {
      const bullet = this.gameState.bullets[i];
      for (let j = this.gameState.zombies.length - 1; j >= 0; j--) {
        const zombie = this.gameState.zombies[j];
        if (this.collisionSystem.checkCircleCollision(bullet, zombie, 15)) {
          zombie.takeDamage(25);
          this.gameState.bullets.splice(i, 1);
          this.audioManager.playSound('hit');
          break;
        }
      }
    }

    // Zombie vs Player collisions
    for (const zombie of this.gameState.zombies) {
      if (this.collisionSystem.checkCircleCollision(zombie, this.gameState.player, 20)) {
        this.gameState.player.takeDamage(10);
        this.audioManager.playSound('hit');
      }
    }

    // Zombie vs Building collisions
    for (const zombie of this.gameState.zombies) {
      for (const building of this.gameState.buildings) {
        if (this.collisionSystem.checkCircleCollision(zombie, building, 25)) {
          building.takeDamage(5);
          zombie.position.x += (zombie.position.x - building.position.x) * 0.1;
          zombie.position.y += (zombie.position.y - building.position.y) * 0.1;
        }
      }
    }
  }

  private cleanup(): void {
    // Remove dead zombies
    this.gameState.zombies = this.gameState.zombies.filter(zombie => zombie.health > 0);
    
    // Remove bullets that are off-screen
    this.gameState.bullets = this.gameState.bullets.filter(bullet => 
      bullet.position.x > -50 && bullet.position.x < 850 &&
      bullet.position.y > -50 && bullet.position.y < 650
    );

    // Remove destroyed buildings
    this.gameState.buildings = this.gameState.buildings.filter(building => building.health > 0);
  }

  private checkGameOver(): void {
    if (this.gameState.player.health <= 0) {
      // Game over
      this.isRunning = false;
      // Trigger game over UI
    }

    if (this.waveManager.getCurrentWave() > 10 && this.gameState.zombies.length === 0) {
      // Victory
      this.isRunning = false;
      // Trigger victory UI
    }
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.renderBackground();
    this.renderer.renderResourceNodes(this.gameState.resourceNodes);
    this.renderer.renderBuildings(this.gameState.buildings);
    this.renderer.renderPlayer(this.gameState.player);
    this.renderer.renderZombies(this.gameState.zombies);
    this.renderer.renderBullets(this.gameState.bullets);
    this.renderer.renderUI(this.gameState);
  }

  // Public methods for external access
  getGameState(): GameState {
    return this.gameState;
  }

  getInputManager(): InputManager {
    return this.inputManager;
  }

  getPlayer(): Player {
    return this.gameState.player;
  }
}
