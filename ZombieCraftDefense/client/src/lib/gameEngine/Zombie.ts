import { Vector2 } from './GameEngine';

export class Zombie {
  public position: Vector2;
  public health: number;
  public maxHealth: number;
  public direction: Vector2; // Current movement direction for sprite selection
  public rotation: number; // Angle in radians
  private speed: number;
  private damage: number;
  private lastAttack: number;
  private attackCooldown: number;

  constructor(x: number, y: number, waveMultiplier: number = 1) {
    this.position = { x, y };
    this.health = 50 * waveMultiplier;
    this.maxHealth = this.health;
    this.speed = 30 + (waveMultiplier * 5);
    this.damage = 15 * waveMultiplier;
    this.lastAttack = 0;
    this.attackCooldown = 1000; // milliseconds
    this.direction = { x: 0, y: 0 };
    this.rotation = 0;
  }

  update(deltaTime: number, playerPosition: Vector2): void {
    // Move toward player
    const dx = playerPosition.x - this.position.x;
    const dy = playerPosition.y - this.position.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 0) {
      const normalizedX = dx / distance;
      const normalizedY = dy / distance;

      this.direction = { x: normalizedX, y: normalizedY };
      this.rotation = Math.atan2(dy, dx);

      this.position.x += normalizedX * this.speed * deltaTime;
      this.position.y += normalizedY * this.speed * deltaTime;
    }
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  canAttack(): boolean {
    const now = Date.now();
    return now - this.lastAttack > this.attackCooldown;
  }

  attack(): number {
    if (this.canAttack()) {
      this.lastAttack = Date.now();
      return this.damage;
    }
    return 0;
  }
}
