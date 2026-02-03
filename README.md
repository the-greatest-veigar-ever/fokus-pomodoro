# Fokus

A high-precision, monochrome Pomodoro timer and task management system designed for flow state. Built with TypeScript and Vite, Fokus emphasizes visual clarity, performance, and a distraction-free environment.

## Design Philosophy

The interface follows a "Minimal Luxury" aesthetic—pure black and white, crisp typography, and subtle glassmorphism. Every interaction is engineered to be instantaneous and satisfying, stripping away unnecessary clutter to leave only what matters: your focus.

## Core Capabilities

### Precision Timer
- **Session Management** | Standard 25-minute work blocks with 5/15-minute intervals.
- **Audio Environment** | Custom-engineered chimes for unobtrusive state changes.
- **Visual Feedback** | Minimalist progress indicators that respect your attention.
- **Background Intelligence** | Smart notifications and state persistence.

### Focus Tasks
- **Ephemeral Storage** | Logic that mimics short-term memory—tasks expire after 24 hours to keep your slate clean.
- **Interaction Design** | Drag-and-drop prioritization and double-click editing.
- **Gesture Control** | Swipe protocols for rapid task management on touch devices.
- **Zero Latency** | Local-first architecture for immediate response.

### Technical Foundation
- **PWA Core** | Installable native-like experience with offline capabilities.
- **Performance** | Optimized build with sub-second load times.
- **Type Safety** | Robust TypeScript architecture.
- **Modern CSS** | Native CSS composition using variables and advanced layout algos.

## Quick Start

### Prerequisites
- Node.js 14+
- npm or yarn

### Deployment

1. Initialize the repository
   ```bash
   git clone https://github.com/yourusername/fokus-pomodoro.git
   cd fokus-pomodoro
   ```

2. Hydrate dependencies
   ```bash
   npm install
   ```

3. Launch development environment
   ```bash
   npm run dev
   ```

4. Build for production
   ```bash
   npm run build
   ```

## Architecture

The codebase mirrors the interface: clean, structured, and modular.

```
src/
├── components/          # UI Logic
│   ├── Timer.ts        # Core state machine
│   ├── Display.ts      # Rendering engine
│   ├── Controls.ts     # Input handling
│   ├── Statistics.ts   # Data visualization
│   ├── Settings.ts     # Configuration
│   └── TodoList.ts     # Task management
├── utils/              # System Core
│   ├── constants.ts    # Configuration primitives
│   ├── storage.ts      # Persistence layer
│   ├── todoStorage.ts  # Task persistence
│   └── audio.ts        # Audio engine
├── styles/             # Design System
│   └── main.css        # Global theme
└── main.ts             # Application entry
```

## Technology Stack

- **TypeScript**
- **Vite**
- **Web Audio API**
- **Local Storage API**
- **Service Workers**

## License

MIT License. Open source and available for personal or commercial adaptation.