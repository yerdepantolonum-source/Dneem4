import { Vector2 } from './GameEngine';
import { Bullet } from './Bullet';

export class Player {
  public position: Vector2;
  public health: number;
  public maxHealth: number;
  public aimDirection: Vector2; // Direction the player is aiming
  public rotation: number; // Angle in radians for weapon rotation
  private speed: number;
  private shootCooldown: number;
  private lastShot: number;
  private movement: Vector2;

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.health = 100;
    this.maxHealth = 100;
    this.speed = 150;
    this.shootCooldown = 250; // milliseconds
    this.lastShot = 0;
    this.movement = { x: 0, y: 0 };
    this.aimDirection = { x: 1, y: 0 }; // Default aiming right
    this.rotation = 0;
  }

  setMovement(movement: Vector2): void {
    this.movement = movement;
  }

  setAimDirection(target: Vector2): void {
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance > 0) {
      this.aimDirection = {
        x: dx / distance,
        y: dy / distance
      };
      this.rotation = Math.atan2(dy, dx);
    }
  }

  update(deltaTime: number): void {
    // Normalize movement vector
    const magnitude = Math.hypot(this.movement.x, this.movement.y);
    if (magnitude > 0) {
      this.movement.x /= magnitude;
      this.movement.y /= magnitude;
    }

    // Apply movement
    this.position.x += this.movement.x * this.speed * deltaTime;
    this.position.y += this.movement.y * this.speed * deltaTime;

    // Keep player in bounds
    this.position.x = Math.max(20, Math.min(780, this.position.x));
    this.position.y = Math.max(20, Math.min(580, this.position.y));
  }

  shoot(target: Vector2): Bullet | null {
    const now = Date.now();
    if (now - this.lastShot < this.shootCooldown) {
      return null;
    }

    this.lastShot = now;
    return new Bullet(this.position.x, this.position.y, target);
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }
}
