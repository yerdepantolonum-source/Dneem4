import { Zombie } from './Zombie';

export class WaveManager {
  private currentWave: number;
  private zombiesPerWave: number;
  private zombiesSpawned: number;
  private spawnTimer: number;
  private spawnRate: number;
  private waveMultiplier: number;

  constructor() {
    this.currentWave = 1;
    this.zombiesPerWave = 5;
    this.zombiesSpawned = 0;
    this.spawnTimer = 0;
    this.spawnRate = 2; // seconds between spawns
    this.waveMultiplier = 1;
  }

  startWave(): void {
    this.zombiesSpawned = 0;
    this.spawnTimer = 0;
    this.zombiesPerWave = 5 + (this.currentWave - 1) * 3;
    this.waveMultiplier = 1 + (this.currentWave - 1) * 0.2;
    this.spawnRate = Math.max(0.5, 2 - (this.currentWave - 1) * 0.1);
  }

  update(deltaTime: number): Zombie[] {
    const newZombies: Zombie[] = [];

    if (this.zombiesSpawned < this.zombiesPerWave) {
      this.spawnTimer += deltaTime;
      
      if (this.spawnTimer >= this.spawnRate) {
        this.spawnTimer = 0;
        this.zombiesSpawned++;

        // Spawn zombie at random edge position
        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch (side) {
          case 0: // Top
            x = Math.random() * 800;
            y = -20;
            break;
          case 1: // Right
            x = 820;
            y = Math.random() * 600;
            break;
          case 2: // Bottom
            x = Math.random() * 800;
            y = 620;
            break;
          case 3: // Left
            x = -20;
            y = Math.random() * 600;
            break;
          default:
            x = 0;
            y = 0;
        }

        newZombies.push(new Zombie(x, y, this.waveMultiplier));
      }
    }

    return newZombies;
  }

  nextWave(): void {
    this.currentWave++;
  }

  hasMoreZombies(): boolean {
    return this.zombiesSpawned < this.zombiesPerWave;
  }

  getCurrentWave(): number {
    return this.currentWave;
  }

  getWaveProgress(): number {
    return this.zombiesSpawned / this.zombiesPerWave;
  }
}
