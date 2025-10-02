# Fokus - Pomodoro Timer Web App

A beautiful, modern web-based Pomodoro technique application with glassmorphism design and integrated todo list. Built with TypeScript and Vite for optimal performance and user experience.

## ✨ Features

### 🎯 **Pomodoro Timer**
- **Classic 25-minute work sessions** with 5/15-minute breaks
- **Beautiful glassmorphism interface** with jade green theme
- **Animated progress indicators** and visual feedback
- **Audio notifications** with custom chimes for completion
- **Browser notifications** with desktop alerts

### ✅ **Focus Tasks (Todo List)**
- **24-hour task cache** - tasks automatically expire after 1 day
- **Quick add/remove** with keyboard shortcuts and mobile gestures
- **Swipe-to-delete** on mobile devices
- **Task completion tracking** with visual indicators
- **No backend required** - uses local/session storage

### 🎨 **Modern Design**
- **Glassmorphism effects** with backdrop blur and transparency
- **Green-jade color palette** with gradients and animations
- **Responsive mobile-first design** optimized for all devices
- **Touch-friendly interface** with gesture support
- **Dark mode support** that adapts to system preferences

### 📱 **Progressive Web App (PWA)**
- **Installable** on mobile and desktop
- **Offline functionality** with service worker
- **App shortcuts** for quick timer start and task adding
- **Native app experience** when installed

### 🚀 **Performance & Deployment**
- **GitHub Pages ready** - static hosting compatible
- **Optimized build** with code splitting and compression
- **Fast loading** with minimal bundle size
- **TypeScript** for type safety and better DX

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd "Fokus - Pomodoro Web App"
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🎯 How to Use

### **Pomodoro Timer**
1. **Start a Session**: Click the "Start" button to begin a 25-minute work session
2. **Take Breaks**: The app automatically transitions to break periods after work sessions
3. **Customize Settings**: Adjust timer durations and preferences in the settings section
4. **Track Progress**: View your daily sessions, focus time, and current streak

### **Focus Tasks (Todo List)**
1. **Add Tasks**: Type in the "Focus Tasks" input and press Enter or click "Add"
2. **Complete Tasks**: Click the ✓ button to mark tasks as complete
3. **Delete Tasks**: Click the ✕ button or swipe left on mobile to delete tasks
4. **Auto-Cleanup**: Tasks automatically expire after 24 hours

### **Keyboard Shortcuts**
- `Space`: Start/pause timer
- `R`: Reset current session
- `Enter`: Add new task (when todo input is focused)

### **Mobile Features**
- **Swipe left** on tasks to delete them
- **Install app** via browser menu or install prompt
- **Offline usage** once installed

## 🏗️ Project Structure

```
src/
├── components/          # Core application components
│   ├── Timer.ts        # Pomodoro timer logic
│   ├── Display.ts      # Timer display and visual updates
│   ├── Controls.ts     # Timer control buttons
│   ├── Statistics.ts   # Session tracking and stats
│   └── Settings.ts     # User preferences management
├── utils/              # Utility modules
│   ├── constants.ts    # App constants and types
│   ├── storage.ts      # Local storage management
│   └── audio.ts        # Audio notifications
├── styles/             # CSS styles
│   └── main.css        # Main application styles
└── main.ts             # Application entry point
```

## 🛠️ Technologies Used

- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **Web Audio API**: Custom notification sounds
- **Local Storage**: Client-side data persistence
- **CSS Grid & Flexbox**: Responsive layout
- **Web Notifications API**: Browser notifications

## 📱 Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 🔧 Development Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run typecheck`: Run TypeScript type checking

## 🎨 Customization

The app includes several customization options:

- **Timer Durations**: Adjust work and break periods
- **Auto-start**: Automatically start breaks
- **Sound Notifications**: Enable/disable audio alerts
- **Visual Themes**: Automatic dark/light mode support

## 🤝 Contributing

This is a personal project, but feel free to fork and adapt it for your own needs!

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Inspired by the Pomodoro Technique by Francesco Cirillo
- Built with modern web technologies for optimal performance
- Designed with accessibility and user experience in mind

---

**Stay focused, stay productive!** 🍅⏰