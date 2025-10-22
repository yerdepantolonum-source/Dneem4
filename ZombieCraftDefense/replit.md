# Overview

This is a 2D zombie survival tower defense game built with React and TypeScript. Players control a character who must survive waves of zombies while gathering resources to build defensive structures. The game features both desktop (keyboard/mouse) and mobile (touch) control schemes, a custom game engine running on HTML5 Canvas, and integrates various UI components for menus and game state management.

The application is a full-stack web application with:
- **Frontend**: React-based game with custom Canvas rendering engine
- **Backend**: Express server with Vite development middleware
- **Database**: PostgreSQL with Drizzle ORM (configured but not actively used in current game implementation)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

### Game Engine (Custom Canvas-based)
The game uses a custom engine rather than a framework like Phaser or Three.js. This provides fine-grained control over rendering and game logic:

- **GameEngine.ts**: Main engine coordinator managing game loop, state updates, and subsystem orchestration
- **Renderer.ts**: Handles all Canvas 2D rendering including sprites, backgrounds, UI overlays, and particle effects
- **Player.ts**: Player character controller with movement, aiming, shooting mechanics
- **Zombie.ts**: Enemy AI with pathfinding toward player, health management, and attack behavior
- **Building.ts**: Defensive structures (turrets, walls, houses) with auto-targeting for turrets
- **WaveManager.ts**: Controls enemy spawn rates, wave progression, and difficulty scaling
- **InputManager.ts**: Unified input handling supporting both desktop (keyboard/mouse) and mobile (touch) controls
- **CollisionSystem.ts**: Physics and collision detection between game objects
- **AudioManager.ts**: Sound effect and background music playback with mute controls

**Rationale**: A custom engine was chosen over existing game frameworks to minimize bundle size, provide precise control over game mechanics, and avoid unnecessary framework overhead for this relatively simple 2D game.

### UI Framework Stack
- **React 18**: Component-based UI architecture with modern hooks
- **React Router**: Client-side routing (currently minimal with main game route and 404)
- **TanStack Query**: Server state management with caching (configured but not actively used)
- **Zustand**: Lightweight state management for game state, control modes, and audio settings
- **Radix UI**: Headless component primitives for accessible UI components
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **shadcn/ui**: Pre-built component library built on Radix UI and Tailwind

**Rationale**: This combination provides a modern React development experience with excellent accessibility (Radix), rapid styling (Tailwind), and minimal boilerplate for state management (Zustand).

### Responsive Design
The game adapts between desktop and mobile:
- Desktop: Keyboard (WASD/arrows) for movement, mouse for aiming and shooting
- Mobile: Virtual joystick for movement, tap controls for shooting and building
- `useIsMobile` hook detects viewport size to switch control schemes

## Backend Architecture

### Server Framework
- **Express.js**: HTTP server handling API routes and static file serving
- **TypeScript**: Type-safe server-side code
- **Vite Middleware**: In development, Vite handles HMR and asset transformation; in production, serves pre-built static files

**Structure**:
- `server/index.ts`: Express server setup with logging middleware
- `server/routes.ts`: API route registration (currently minimal - template for future multiplayer/leaderboard features)
- `server/storage.ts`: Data access layer with in-memory implementation (`MemStorage`) and interface for future database integration
- `server/vite.ts`: Development server configuration with Vite integration

**Rationale**: Express provides a lightweight, flexible server that can easily scale to handle RESTful APIs or WebSocket connections for multiplayer features. The storage abstraction allows switching from in-memory to database persistence without changing route logic.

## Data Storage

### Database Configuration
- **Drizzle ORM**: Type-safe database toolkit with schema-first design
- **PostgreSQL**: Relational database (via Neon serverless driver)
- **Schema Location**: `shared/schema.ts` defines database tables and validation schemas
- **Current Schema**: Basic user table with username/password (foundation for authentication)

**Migration Strategy**: Drizzle Kit generates migrations from schema changes (`npm run db:push`)

**Current State**: Database infrastructure is configured but not actively used. The game currently operates entirely client-side with in-memory state. This foundation enables future features like:
- User accounts and authentication
- Persistent high scores and leaderboards
- Saved game progress
- Multiplayer session management

**Rationale**: Drizzle was chosen for its TypeScript-first approach and excellent type inference, making database code feel native to the TypeScript ecosystem. Neon provides serverless PostgreSQL that scales to zero, ideal for hobby projects on Replit.

## External Dependencies

### UI Component Libraries
- **Radix UI Primitives**: Accessible, unstyled component primitives (dialogs, dropdowns, tooltips, etc.)
- **Tailwind CSS**: Utility-first CSS framework with JIT compilation
- **class-variance-authority**: Type-safe variant handling for component props
- **clsx/tailwind-merge**: Conditional class name utilities

### State Management
- **Zustand**: Minimal state management for game state and audio controls
- **TanStack Query (React Query)**: Server state synchronization and caching

### Routing & Navigation
- **React Router DOM**: Client-side routing with browser history management

### Database & Backend
- **Drizzle ORM**: Database toolkit with query builder and migration tools
- **@neondatabase/serverless**: PostgreSQL client for Neon database
- **Zod**: Runtime schema validation for database inserts and API validation

### Build Tools
- **Vite**: Fast build tool with HMR for development
- **esbuild**: Fast JavaScript bundler for server-side code
- **TypeScript**: Static type checking across entire codebase
- **PostCSS**: CSS processing (Tailwind integration)

### Development Tools
- **tsx**: TypeScript execution for development server
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error reporting in Replit environment

### Game Assets
- **@fontsource/inter**: Self-hosted Inter font
- **Sprite assets**: Custom PNG sprites for characters and zombies (loaded via SpriteLoader)
- **Audio files**: Background music and sound effects (MP3/OGG/WAV)

### Future Integration Points
The architecture anticipates these potential additions:
- **WebSocket library** (e.g., Socket.io): For real-time multiplayer
- **Authentication provider** (e.g., Passport.js): For user sessions
- **Cloud storage** (e.g., AWS S3): For user-generated content or replays

**Rationale**: Dependencies were chosen to balance developer experience, bundle size, and performance. Radix UI provides accessibility out-of-box; Vite offers the fastest development experience; Drizzle integrates seamlessly with TypeScript; and the build tools minimize production bundle size.