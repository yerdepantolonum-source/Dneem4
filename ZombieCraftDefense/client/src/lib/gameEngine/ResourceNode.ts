import { Vector2 } from './GameEngine';

export type ResourceType = 'wood' | 'stone' | 'fruit';

export interface Resource {
  type: ResourceType;
  amount: number;
}

export class ResourceNode {
  public position: Vector2;
  public type: ResourceType;
  public maxResources: number;
  public currentResources: number;
  private regenRate: number;
  private lastGather: number;
  private gatherCooldown: number;

  constructor(x: number, y: number, type: ResourceType) {
    this.position = { x, y };
    this.type = type;
    this.maxResources = type === 'fruit' ? 3 : 10;
    this.currentResources = this.maxResources;
    this.regenRate = type === 'fruit' ? 0.5 : 1; // resources per second
    this.lastGather = 0;
    this.gatherCooldown = 1000; // milliseconds
  }

  gather(): Resource | null {
    const now = Date.now();
    if (now - this.lastGather < this.gatherCooldown || this.currentResources <= 0) {
      return null;
    }

    this.lastGather = now;
    this.currentResources--;

    const amount = this.type === 'fruit' ? 1 : Math.floor(Math.random() * 3) + 1;
    return {
      type: this.type,
      amount
    };
  }

  regenerate(): void {
    this.currentResources = Math.min(this.maxResources, this.currentResources + 2);
  }

  update(deltaTime: number): void {
    // Passive regeneration
    if (this.currentResources < this.maxResources) {
      this.currentResources = Math.min(
        this.maxResources,
        this.currentResources + (this.regenRate * deltaTime)
      );
    }
  }
}
