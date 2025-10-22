// Sprite paths for the game
export const SPRITE_PATHS: Record<string, string> = {
  ground: '/sprites/ground.png',
  rock: '/sprites/rock.png',
  tree: '/sprites/tree.png',
  bush: '/sprites/bush.png',
  soldier: '/sprites/soldier.png',
  zombie1: '/sprites/zombie1.png',
  zombie2: '/sprites/zombie2.png',
  zombie3: '/sprites/zombie3.png',
  zombie4: '/sprites/zombie4.png',
};

// Load and cache sprite images
export class SpriteLoader {
  private static sprites: Map<string, HTMLImageElement> = new Map();
  private static loading: Map<string, Promise<HTMLImageElement>> = new Map();

  static async loadSprite(key: string, path: string): Promise<HTMLImageElement> {
    // Return cached sprite if already loaded
    if (this.sprites.has(key)) {
      return this.sprites.get(key)!;
    }

    // Return loading promise if already loading
    if (this.loading.has(key)) {
      return this.loading.get(key)!;
    }

    // Start loading
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        console.log(`✓ Loaded sprite: ${key}`);
        this.sprites.set(key, img);
        this.loading.delete(key);
        resolve(img);
      };
      
      img.onerror = () => {
        console.error(`✗ Failed to load sprite: ${key}`);
        this.loading.delete(key);
        reject(new Error(`Failed to load sprite: ${path}`));
      };
      
      img.src = path;
    });

    this.loading.set(key, loadPromise);
    return loadPromise;
  }

  static async loadAllSprites(): Promise<void> {
    console.log('🎮 Loading all sprites...');
    
    const loadPromises = Object.entries(SPRITE_PATHS).map(async ([key, path]) => {
      try {
        await this.loadSprite(key, path);
        return { key, success: true };
      } catch (error) {
        console.error(`Failed to load ${key}:`, error);
        return { key, success: false };
      }
    });
    
    const results = await Promise.all(loadPromises);
    const successCount = results.filter(r => r.success).length;
    
    console.log(`✓ Loaded ${successCount}/${results.length} sprites successfully!`);
  }

  static getSprite(key: string): HTMLImageElement | null {
    return this.sprites.get(key) || null;
  }

  static getAllSprites(): Map<string, HTMLImageElement> {
    return this.sprites;
  }
}
