import { Vector2 } from './GameEngine';

export class Bullet {
  public position: Vector2;
  private velocity: Vector2;
  private speed: number;

  constructor(x: number, y: number, target: Vector2) {
    this.position = { x, y };
    this.speed = 400;

    // Calculate direction to target
    const dx = target.x - x;
    const dy = target.y - y;
    const distance = Math.hypot(dx, dy);

    if (distance > 0) {
      this.velocity = {
        x: (dx / distance) * this.speed,
        y: (dy / distance) * this.speed
      };
    } else {
      this.velocity = { x: this.speed, y: 0 };
    }
  }

  update(deltaTime: number): void {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }
}
