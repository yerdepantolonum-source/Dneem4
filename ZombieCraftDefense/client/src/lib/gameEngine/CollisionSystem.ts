import { Vector2 } from './GameEngine';

export interface Collidable {
  position: Vector2;
}

export class CollisionSystem {
  checkCircleCollision(obj1: Collidable, obj2: Collidable, radius: number): boolean {
    const dx = obj1.position.x - obj2.position.x;
    const dy = obj1.position.y - obj2.position.y;
    const distance = Math.hypot(dx, dy);
    return distance < radius;
  }

  checkRectCollision(
    obj1: Collidable, 
    obj2: Collidable, 
    width1: number, 
    height1: number,
    width2: number,
    height2: number
  ): boolean {
    const left1 = obj1.position.x - width1 / 2;
    const right1 = obj1.position.x + width1 / 2;
    const top1 = obj1.position.y - height1 / 2;
    const bottom1 = obj1.position.y + height1 / 2;

    const left2 = obj2.position.x - width2 / 2;
    const right2 = obj2.position.x + width2 / 2;
    const top2 = obj2.position.y - height2 / 2;
    const bottom2 = obj2.position.y + height2 / 2;

    return !(right1 < left2 || left1 > right2 || bottom1 < top2 || top1 > bottom2);
  }

  getDistance(obj1: Collidable, obj2: Collidable): number {
    const dx = obj1.position.x - obj2.position.x;
    const dy = obj1.position.y - obj2.position.y;
    return Math.hypot(dx, dy);
  }

  getNormalizedDirection(from: Vector2, to: Vector2): Vector2 {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance === 0) return { x: 0, y: 0 };
    
    return {
      x: dx / distance,
      y: dy / distance
    };
  }
}
