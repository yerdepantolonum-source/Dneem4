import { Vector2 } from './GameEngine';
import { Zombie } from './Zombie';
import { Bullet } from './Bullet';

export type BuildingType = 'turret' | 'wall' | 'house';

export class Building {
  public position: Vector2;
  public type: BuildingType;
  public health: number;
  public maxHealth: number;
  private shootCooldown: number;
  private lastShot: number;
  private range: number;

  constructor(x: number, y: number, type: BuildingType) {
    this.position = { x, y };
    this.type = type;
    this.lastShot = 0;

    // Set properties based on building type
    switch (type) {
      case 'turret':
        this.health = 100;
        this.maxHealth = 100;
        this.shootCooldown = 500;
        this.range = 150;
        break;
      case 'wall':
        this.health = 200;
        this.maxHealth = 200;
        this.shootCooldown = 0;
        this.range = 0;
        break;
      case 'house':
        this.health = 150;
        this.maxHealth = 150;
        this.shootCooldown = 0;
        this.range = 0;
        break;
    }
  }

  update(deltaTime: number, zombies: Zombie[]): Bullet[] {
    const bullets: Bullet[] = [];

    if (this.type === 'turret') {
      const now = Date.now();
      if (now - this.lastShot > this.shootCooldown) {
        // Find nearest zombie in range
        let nearestZombie: Zombie | null = null;
        let nearestDistance = Infinity;

        for (const zombie of zombies) {
          const distance = Math.hypot(
            zombie.position.x - this.position.x,
            zombie.position.y - this.position.y
          );

          if (distance < this.range && distance < nearestDistance) {
            nearestZombie = zombie;
            nearestDistance = distance;
          }
        }

        if (nearestZombie) {
          bullets.push(new Bullet(this.position.x, this.position.y, nearestZombie.position));
          this.lastShot = now;
        }
      }
    }

    return bullets;
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  repair(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }
}
