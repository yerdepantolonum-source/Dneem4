import { Vector2 } from './GameEngine';

export interface InputState {
  keys: Record<string, boolean>;
  mouse: {
    position: Vector2 | null;
    isDown: boolean;
  };
  shooting: boolean;
  building: string | null;
}

export class InputManager {
  private canvas: HTMLCanvasElement;
  private inputState: InputState;
  private isMobile: boolean;

  // Mobile-specific properties
  private joystickActive: boolean = false;
  private joystickCenter: Vector2 = { x: 0, y: 0 };
  private joystickPosition: Vector2 = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement, isMobile: boolean = false) {
    this.canvas = canvas;
    this.isMobile = isMobile;
    this.inputState = {
      keys: {},
      mouse: {
        position: null,
        isDown: false
      },
      shooting: false,
      building: null
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.isMobile) {
      // Desktop controls
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
      document.addEventListener('keyup', this.handleKeyUp.bind(this));
      this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
      this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
      this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.inputState.keys[event.key] = true;
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.inputState.keys[event.key] = false;
  }

  private handleMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.inputState.mouse.position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  private handleMouseDown(event: MouseEvent): void {
    if (event.button === 0) { // Left click
      this.inputState.mouse.isDown = true;
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    if (event.button === 0) { // Left click
      this.inputState.mouse.isDown = false;
    }
  }

  // Mobile control methods
  setMobileMovement(direction: Vector2): void {
    // Convert joystick input to key presses
    this.inputState.keys = {}; // Clear all keys first
    
    const threshold = 0.2;
    
    // Allow diagonal movement by setting both keys
    if (Math.abs(direction.x) > threshold) {
      this.inputState.keys[direction.x > 0 ? 'd' : 'a'] = true;
    }
    if (Math.abs(direction.y) > threshold) {
      this.inputState.keys[direction.y > 0 ? 's' : 'w'] = true;
    }
  }

  setMobileShooting(shooting: boolean): void {
    this.inputState.shooting = shooting;
    this.inputState.mouse.isDown = shooting;
  }

  setMobileAimPosition(position: Vector2): void {
    this.inputState.mouse.position = position;
  }

  setMobileBuilding(buildingType: string | null): void {
    this.inputState.building = buildingType;
    if (buildingType) {
      this.inputState.keys[buildingType.charAt(0).toLowerCase()] = true;
      // Clear it after a frame
      setTimeout(() => {
        this.inputState.keys[buildingType.charAt(0).toLowerCase()] = false;
      }, 100);
    }
  }

  setMobileGathering(gathering: boolean): void {
    this.inputState.keys['e'] = gathering;
  }

  getInput(): InputState {
    return this.inputState;
  }

  cleanup(): void {
    if (!this.isMobile) {
      document.removeEventListener('keydown', this.handleKeyDown.bind(this));
      document.removeEventListener('keyup', this.handleKeyUp.bind(this));
      this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
      this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
      this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    }
  }
}
