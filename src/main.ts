import { PomodoroTimer } from './components/Timer.js';
import { TimerDisplay } from './components/Display.js';
import { TimerControls } from './components/Controls.js';
import { Statistics } from './components/Statistics.js';
import { SettingsManager } from './components/Settings.js';
import { TodoList } from './components/TodoList.js';
import { AudioNotificationManager } from './utils/audio.js';
import { StorageManager } from './utils/storage.js';
import { TodoStorage } from './utils/todoStorage.js';
import { SESSION_TYPES, TIMER_STATES } from './utils/constants.js';
import './styles/main.css';

// Particle system removed for static design

// Minimal Luxury Theme Manager
class ThemeManager {
  private isDark: boolean = false;
  private toggleButton: HTMLButtonElement | null = null;
  private themeIcon: HTMLElement | null = null;

  constructor() {
    this.initializeTheme();
    this.setupToggleButton();
  }

  private initializeTheme(): void {
    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem('fokus-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    this.applyTheme();

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('fokus-theme')) {
        this.isDark = e.matches;
        this.applyTheme();
        this.updateToggleIcon();
      }
    });
  }

  private setupToggleButton(): void {
    this.toggleButton = document.getElementById('theme-toggle') as HTMLButtonElement;
    this.themeIcon = document.querySelector('.theme-icon');

    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    this.updateToggleIcon();
  }

  private applyTheme(): void {
    if (this.isDark) {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }

  private updateToggleIcon(): void {
    if (this.themeIcon) {
      this.themeIcon.textContent = this.isDark ? '☀️' : '🌙';
    }
  }

  public toggleTheme(): void {
    this.isDark = !this.isDark;
    this.applyTheme();
    this.updateToggleIcon();

    // Save preference
    localStorage.setItem('fokus-theme', this.isDark ? 'dark' : 'light');
  }

  public getCurrentTheme(): string {
    return this.isDark ? 'dark' : 'light';
  }
}

// Interactive effects removed for static design

class FokusApp {
  private timer: PomodoroTimer;
  private display!: TimerDisplay;
  private controls!: TimerControls;
  private statistics!: Statistics;
  private settings!: SettingsManager;
  private todoList!: TodoList;
  private audioManager: AudioNotificationManager;
  private storageManager: StorageManager;
  private todoStorage: TodoStorage;
  private themeManager!: ThemeManager;

  constructor() {
    this.storageManager = StorageManager.getInstance();
    this.todoStorage = TodoStorage.getInstance();
    this.timer = new PomodoroTimer();
    this.audioManager = new AudioNotificationManager();

    this.initializeComponents();
    this.initializeLuxuryEffects();
    this.bindGlobalEvents();
    this.setupNotifications();
    this.setupPWAFeatures();
    this.handleURLParameters();

    console.log('🎯 Fokus App with minimal luxury design initialized successfully!');
  }

  private initializeLuxuryEffects(): void {
    // Initialize theme system only
    this.themeManager = new ThemeManager();

    // Particle system and interactive effects disabled for static design
    // this.particleSystem = new ParticleSystem();
    // this.interactiveEffects = new InteractiveEffects();

    // Store references to prevent unused variable warnings
    void this.themeManager;
  }

  private initializeComponents(): void {
    // Initialize UI components (stored as properties for potential future use)
    this.display = new TimerDisplay(this.timer);
    this.controls = new TimerControls(this.timer);
    this.statistics = new Statistics(this.timer);
    this.settings = new SettingsManager(this.timer);
    this.todoList = new TodoList();

    // Components work via side effects during instantiation
    void this.display;
    void this.controls;
    void this.statistics;
    void this.settings;
    void this.todoList;
  }

  private bindGlobalEvents(): void {
    // Handle timer completion events
    this.timer.addEventListener('timerUpdate', (event: Event) => {
      const eventData = (event as CustomEvent).detail;

      if (eventData.state === TIMER_STATES.COMPLETED) {
        this.handleSessionCompletion(eventData);
      }
    });

    // Handle page visibility changes (pause timer when tab is hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.timer.getState() === TIMER_STATES.RUNNING) {
        // Don't automatically pause - users might want timer to continue
        // Just update the title to show current state
        this.updateTabTitle();
      }
    });

    // Handle beforeunload to warn about active timer
    window.addEventListener('beforeunload', (event) => {
      if (this.timer.getState() === TIMER_STATES.RUNNING) {
        event.preventDefault();
        event.returnValue = 'You have an active timer running. Are you sure you want to leave?';
        return event.returnValue;
      }
    });
  }

  private setupNotifications(): void {
    // Request notification permission on first user interaction
    document.addEventListener('click', () => {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('✅ Notifications enabled');
          }
        });
      }
    }, { once: true });
  }

  private async handleSessionCompletion(eventData: any): Promise<void> {
    const { sessionType } = eventData;

    // Play appropriate notification
    if (sessionType === SESSION_TYPES.WORK) {
      await this.audioManager.playNotification('workComplete');
    } else {
      await this.audioManager.playNotification('breakComplete');
    }

    // Record session in storage
    this.recordSession(sessionType);
  }

  private recordSession(sessionType: string): void {
    const settings = this.timer.getSettings();
    const duration = sessionType === SESSION_TYPES.WORK
      ? settings.workDuration
      : sessionType === SESSION_TYPES.SHORT_BREAK
        ? settings.shortBreak
        : settings.longBreak;

    const sessionRecord = {
      id: this.generateSessionId(),
      date: new Date().toISOString().split('T')[0],
      sessionType,
      duration,
      completed: true,
      startTime: new Date(Date.now() - duration * 60 * 1000).toISOString(),
      endTime: new Date().toISOString()
    };

    this.storageManager.saveSessionRecord(sessionRecord);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupPWAFeatures(): void {
    // Register service worker for offline functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Handle PWA installation prompt
    let deferredPrompt: any;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      // Show install button after a delay
      setTimeout(() => {
        this.showInstallPrompt(deferredPrompt);
      }, 30000); // Show after 30 seconds of usage
    });

    // Handle app installation
    window.addEventListener('appinstalled', () => {
      console.log('Fokus has been installed!');
      deferredPrompt = null;
    });
  }

  private showInstallPrompt(deferredPrompt: any): void {
    if (!deferredPrompt) return;

    const installBanner = document.createElement('div');
    installBanner.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--primary-gradient);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-glass);
      backdrop-filter: var(--glass-blur);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 1rem;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;

    installBanner.innerHTML = `
      <div>
        <div style="font-weight: 600; margin-bottom: 0.25rem;">Install Fokus</div>
        <div style="font-size: 0.875rem; opacity: 0.9;">Get the full app experience</div>
      </div>
      <button id="install-btn" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        white-space: nowrap;
      ">Install</button>
      <button id="dismiss-btn" style="
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1.25rem;
        padding: 0.25rem;
        margin-left: 0.5rem;
      ">✕</button>
    `;

    document.body.appendChild(installBanner);

    // Handle install button click
    installBanner.querySelector('#install-btn')?.addEventListener('click', () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
        installBanner.remove();
      });
    });

    // Handle dismiss button click
    installBanner.querySelector('#dismiss-btn')?.addEventListener('click', () => {
      installBanner.remove();
    });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (installBanner.parentNode) {
        installBanner.remove();
      }
    }, 10000);
  }

  private handleURLParameters(): void {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');

    switch (action) {
      case 'start':
        // Auto-start timer if not already running
        if (this.timer.getState() === TIMER_STATES.IDLE) {
          setTimeout(() => this.timer.start(), 1000);
        }
        break;
      case 'add-task':
        // Focus on todo input
        setTimeout(() => {
          const todoInput = document.querySelector('.todo-input') as HTMLInputElement;
          if (todoInput) {
            todoInput.focus();
            todoInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
        break;
    }

    // Clean URL after handling
    if (action) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  private updateTabTitle(): void {
    const state = this.timer.getState();
    const timeRemaining = this.timer.getTimeRemaining();
    const sessionType = this.timer.getSessionType();

    if (state === TIMER_STATES.RUNNING) {
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      const sessionText = sessionType === SESSION_TYPES.WORK ? 'Work' : 'Break';
      document.title = `${timeText} - ${sessionText} | Fokus`;
    } else {
      document.title = 'Fokus - Pomodoro Timer';
    }
  }

  // Public methods for debugging/testing
  public getTimer(): PomodoroTimer {
    return this.timer;
  }

  public getStorageManager(): StorageManager {
    return this.storageManager;
  }

  public async testNotification(): Promise<void> {
    await this.audioManager.testNotification();
  }

  public getTodoList(): TodoList {
    return this.todoList;
  }

  public getTodoStorage(): TodoStorage {
    return this.todoStorage;
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new FokusApp();

  // Make app available globally for debugging
  (window as any).fokusApp = app;
});

// Handle any unhandled errors gracefully
window.addEventListener('error', (event) => {
  console.error('Fokus App Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  event.preventDefault();
});