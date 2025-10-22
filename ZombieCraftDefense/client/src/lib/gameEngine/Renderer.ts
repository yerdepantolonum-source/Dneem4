import { GameState } from './GameEngine';
import { Player } from './Player';
import { Zombie } from './Zombie';
import { Bullet } from './Bullet';
import { ResourceNode } from './ResourceNode';
import { Building } from './Building';
import { SpriteLoader, SPRITE_PATHS } from '@/assets/sprites';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private spritesLoaded: boolean = false;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.loadSprites();
  }

  private async loadSprites(): Promise<void> {
    try {
      await SpriteLoader.loadAllSprites();
      this.spritesLoaded = true;
      console.log('Renderer: Sprites loaded and ready');
    } catch (error) {
      console.error('Renderer: Failed to load sprites:', error);
      this.spritesLoaded = false;
    }
  }
  
  isReady(): boolean {
    return this.spritesLoaded;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, 800, 600);
  }

  renderBackground(): void {
    const groundSprite = SpriteLoader.getSprite('ground');
    
    if (groundSprite && this.spritesLoaded) {
      // Tile the ground texture across the canvas
      const pattern = this.ctx.createPattern(groundSprite, 'repeat');
      if (pattern) {
        this.ctx.fillStyle = pattern;
        this.ctx.fillRect(0, 0, 800, 600);
      }
    } else {
      // Fallback to gradient
      const gradient = this.ctx.createLinearGradient(0, 0, 0, 600);
      gradient.addColorStop(0, '#b89968');
      gradient.addColorStop(1, '#9d7d4f');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, 800, 600);
    }

    // Add decorative rocks and bushes
    this.renderDecorations();
  }

  private renderDecorations(): void {
    const rockSprite = SpriteLoader.getSprite('rock');
    const bushSprite = SpriteLoader.getSprite('bush');

    // Fixed positions for decorative elements
    const decorations = [
      { type: 'rock', x: 150, y: 350, size: 40 },
      { type: 'rock', x: 650, y: 250, size: 35 },
      { type: 'bush', x: 250, y: 450, size: 45 },
      { type: 'bush', x: 550, y: 180, size: 40 },
      { type: 'rock', x: 300, y: 150, size: 30 },
      { type: 'rock', x: 500, y: 500, size: 38 },
      { type: 'bush', x: 750, y: 400, size: 42 },
      { type: 'bush', x: 50, y: 200, size: 38 },
    ];

    decorations.forEach(deco => {
      const sprite = deco.type === 'rock' ? rockSprite : bushSprite;
      
      if (sprite && this.spritesLoaded) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.6;
        this.ctx.drawImage(
          sprite,
          deco.x - deco.size / 2,
          deco.y - deco.size / 2,
          deco.size,
          deco.size
        );
        this.ctx.restore();
      }
    });
  }

  renderPlayer(player: Player): void {
    const sprite = SpriteLoader.getSprite('soldier');
    
    this.ctx.save();
    this.ctx.translate(player.position.x, player.position.y);
    this.ctx.rotate(player.rotation);
    
    if (sprite && this.spritesLoaded) {
      // Draw soldier sprite rotated to face aim direction
      this.ctx.drawImage(sprite, -32, -32, 64, 64);
    } else {
      // Fallback rendering
      this.ctx.fillStyle = '#4a90e2';
      this.ctx.fillRect(-15, -15, 30, 30);
      
      // Draw direction indicator
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(20, 0);
      this.ctx.stroke();
    }
    
    this.ctx.restore();

    // Health bar
    this.renderHealthBar(player.position.x, player.position.y - 40, player.health, player.maxHealth, 40);
  }

  renderZombies(zombies: Zombie[]): void {
    zombies.forEach((zombie, index) => {
      // Select sprite based on direction (4 different sprites for variety)
      const spriteIndex = (index % 4) + 1;
      const sprite = SpriteLoader.getSprite(`zombie${spriteIndex}`);
      
      this.ctx.save();
      this.ctx.translate(zombie.position.x, zombie.position.y);
      
      // Flip sprite if moving left
      if (zombie.direction.x < 0) {
        this.ctx.scale(-1, 1);
      }
      
      if (sprite && this.spritesLoaded) {
        this.ctx.drawImage(sprite, -32, -32, 64, 64);
      } else {
        // Fallback rendering
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(-15, -15, 30, 30);
      }
      
      this.ctx.restore();

      // Health bar
      this.renderHealthBar(zombie.position.x, zombie.position.y - 40, zombie.health, zombie.maxHealth, 40);
    });
  }

  renderBullets(bullets: Bullet[]): void {
    bullets.forEach(bullet => {
      // Draw bullet with glow effect
      this.ctx.save();
      
      // Glow
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = '#ffff00';
      this.ctx.fillStyle = '#ffff00';
      
      this.ctx.beginPath();
      this.ctx.arc(bullet.position.x, bullet.position.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Inner bright core
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(bullet.position.x, bullet.position.y, 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  renderResourceNodes(nodes: ResourceNode[]): void {
    nodes.forEach(node => {
      if (node.currentResources <= 0) return;

      let sprite: HTMLImageElement | null = null;
      let size = 60;

      switch (node.type) {
        case 'wood':
          sprite = SpriteLoader.getSprite('tree');
          size = 70;
          break;
        case 'stone':
          sprite = SpriteLoader.getSprite('rock');
          size = 55;
          break;
        case 'fruit':
          sprite = SpriteLoader.getSprite('bush');
          size = 65;
          break;
      }

      // Draw sprite with shadow
      this.ctx.save();
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      this.ctx.shadowOffsetY = 5;
      
      if (sprite && this.spritesLoaded) {
        this.ctx.drawImage(
          sprite,
          node.position.x - size / 2,
          node.position.y - size / 2,
          size,
          size
        );
      } else {
        // Fallback rendering
        let color = '#654321';
        let emoji = '';

        switch (node.type) {
          case 'wood':
            color = '#5a3e2b';
            emoji = '🌲';
            break;
          case 'stone':
            color = '#5a5a5a';
            emoji = '⛰️';
            break;
          case 'fruit':
            color = '#c41e3a';
            emoji = '🍎';
            break;
        }

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(node.position.x, node.position.y, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(emoji, node.position.x, node.position.y);
      }
      
      this.ctx.restore();

      // Resource count with background
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(node.position.x - 15, node.position.y + size / 2 - 5, 30, 16);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        Math.floor(node.currentResources).toString(),
        node.position.x,
        node.position.y + size / 2 + 3
      );
    });
  }

  renderBuildings(buildings: Building[]): void {
    buildings.forEach(building => {
      let color = '#666';
      let emoji = '';
      let size = 40;

      switch (building.type) {
        case 'turret':
          color = '#3a3a3a';
          emoji = '🗼';
          size = 45;
          break;
        case 'wall':
          color = '#6b5b4a';
          emoji = '🧱';
          size = 35;
          break;
        case 'house':
          color = '#8b4726';
          emoji = '🏠';
          size = 50;
          break;
      }

      // Draw building with shadow
      this.ctx.save();
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      
      this.ctx.fillStyle = color;
      this.ctx.fillRect(
        building.position.x - size / 2,
        building.position.y - size / 2,
        size,
        size
      );
      
      this.ctx.restore();

      // Border
      this.ctx.strokeStyle = '#2a2a2a';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        building.position.x - size / 2,
        building.position.y - size / 2,
        size,
        size
      );

      // Draw emoji
      this.ctx.font = `${size - 10}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(emoji, building.position.x, building.position.y);

      // Health bar
      this.renderHealthBar(
        building.position.x,
        building.position.y - size / 2 - 12,
        building.health,
        building.maxHealth,
        size
      );
    });
  }

  private renderHealthBar(x: number, y: number, health: number, maxHealth: number, width: number = 30): void {
    const barHeight = 6;
    const healthPercent = Math.max(0, Math.min(1, health / maxHealth));

    // Background (black outline)
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(x - width / 2 - 1, y - 1, width + 2, barHeight + 2);

    // Red background
    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(x - width / 2, y, width, barHeight);

    // Green health (gradient for style)
    const gradient = this.ctx.createLinearGradient(x - width / 2, 0, x + width / 2, 0);
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(1, '#16a34a');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x - width / 2, y, width * healthPercent, barHeight);

    // Shine effect
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.fillRect(x - width / 2, y, width * healthPercent, 2);
  }

  renderUI(gameState: GameState): void {
    // Top panel with gradient background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, 800, 120);
    
    // Bottom gradient
    const gradient = this.ctx.createLinearGradient(0, 110, 0, 120);
    gradient.addColorStop(0, 'rgba(139, 69, 19, 0.5)');
    gradient.addColorStop(1, 'rgba(139, 69, 19, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 110, 800, 10);

    // Resources section
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'left';
    
    // Wood
    this.ctx.fillStyle = '#8b4513';
    this.ctx.fillRect(15, 15, 35, 35);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🌲', 32, 40);
    
    this.ctx.textAlign = 'left';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`${gameState.resources.wood}`, 58, 40);
    
    // Stone
    this.ctx.fillStyle = '#708090';
    this.ctx.fillRect(15, 60, 35, 35);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('⛰️', 32, 85);
    
    this.ctx.textAlign = 'left';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`${gameState.resources.stone}`, 58, 85);

    // Wave status - center
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 28px Arial';
    
    if (gameState.isWaveActive) {
      this.ctx.fillStyle = '#ff4444';
      this.ctx.fillText('⚔️ WAVE ACTIVE ⚔️', 400, 35);
      
      const zombieCount = gameState.zombies.length;
      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillStyle = '#ffaa00';
      this.ctx.fillText(`Zombies: ${zombieCount}`, 400, 65);
    } else {
      this.ctx.fillStyle = '#44ff44';
      this.ctx.fillText('🛡️ BUILD PHASE 🛡️', 400, 35);
      
      this.ctx.font = 'bold 24px Arial';
      this.ctx.fillStyle = '#ffffff';
      const countdown = Math.ceil(gameState.waveCountdown);
      this.ctx.fillText(`Next wave: ${countdown}s`, 400, 70);
    }

    // Player health - right side
    this.ctx.textAlign = 'right';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('HEALTH', 785, 25);
    
    // Health bar
    const healthBarX = 650;
    const healthBarY = 35;
    const healthBarWidth = 135;
    const healthBarHeight = 20;
    const healthPercent = gameState.player.health / gameState.player.maxHealth;
    
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(healthBarX - 1, healthBarY - 1, healthBarWidth + 2, healthBarHeight + 2);
    
    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    
    const healthGradient = this.ctx.createLinearGradient(healthBarX, 0, healthBarX + healthBarWidth, 0);
    healthGradient.addColorStop(0, '#22c55e');
    healthGradient.addColorStop(1, '#16a34a');
    this.ctx.fillStyle = healthGradient;
    this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercent, healthBarHeight);
    
    // Health text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${gameState.player.health}/${gameState.player.maxHealth}`, healthBarX + healthBarWidth / 2, healthBarY + 15);

    // Building costs at bottom
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 560, 800, 40);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('🗼 Turret [T]: 30🌲 20⛰️', 130, 582);
    this.ctx.fillText('🏠 House [H]: 40🌲 10⛰️', 350, 582);
    this.ctx.fillText('🧱 Wall [W]: 10🌲 15⛰️', 560, 582);
    this.ctx.fillText('Gather [E]', 720, 582);
  }
}
