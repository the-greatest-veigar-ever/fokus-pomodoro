import { PomodoroTimer, type TimerEventData } from './Timer.js';
import { SESSION_TYPES, TIMER_STATES } from '../utils/constants.js';

export class TimerDisplay {
  private timer: PomodoroTimer;
  private sessionTypeElement: HTMLElement;
  private timeDisplayElement: HTMLElement;
  private progressFillElement: HTMLElement;

  constructor(timer: PomodoroTimer) {
    this.timer = timer;
    this.sessionTypeElement = document.querySelector('.session-type') as HTMLElement;
    this.timeDisplayElement = document.querySelector('.time-display') as HTMLElement;
    this.progressFillElement = document.querySelector('.progress-fill') as HTMLElement;

    this.timer.addEventListener('timerUpdate', this.handleTimerUpdate.bind(this));
    this.updateDisplay();
  }

  private handleTimerUpdate(event: Event): void {
    const eventData = (event as CustomEvent<TimerEventData>).detail;
    this.updateDisplay(eventData);
  }

  private updateDisplay(data?: TimerEventData): void {
    if (!data) {
      // Initial display
      this.sessionTypeElement.textContent = this.getSessionTypeText(this.timer.getSessionType());
      this.timeDisplayElement.textContent = this.formatTime(this.timer.getTimeRemaining());
      this.updateProgressIndicators(0);
      return;
    }

    const { timeRemaining, sessionType, state, progress } = data;

    // Update session type
    this.sessionTypeElement.textContent = this.getSessionTypeText(sessionType);

    // Update time display
    this.timeDisplayElement.textContent = this.formatTime(timeRemaining);

    // Update progress indicators (both circular and linear)
    this.updateProgressIndicators(progress);

    // Update circular timer gradient for break sessions
    this.updateCircularTimerGradient(sessionType);

    // Update visual state
    this.updateVisualState(state, sessionType);

    // Update document title
    this.updateDocumentTitle(timeRemaining, sessionType, state);
  }

  private updateProgressIndicators(progress: number): void {
    // Update linear progress bar
    if (this.progressFillElement) {
      this.progressFillElement.style.width = `${progress}%`;
    }
  }

  private updateCircularTimerGradient(_sessionType: string): void {
    // Removed - no longer using circular timer
  }

  private getSessionTypeText(sessionType: string): string {
    switch (sessionType) {
      case SESSION_TYPES.WORK:
        return 'Work Session';
      case SESSION_TYPES.SHORT_BREAK:
        return 'Short Break';
      case SESSION_TYPES.LONG_BREAK:
        return 'Long Break';
      default:
        return 'Session';
    }
  }

  private formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private updateVisualState(state: string, sessionType: string): void {
    const timerSection = document.querySelector('.timer-section') as HTMLElement;

    // Remove all state classes
    timerSection.classList.remove('running', 'paused', 'completed', 'work', 'break');

    // Add current state class
    timerSection.classList.add(state);

    // Add session type class
    if (sessionType === SESSION_TYPES.WORK) {
      timerSection.classList.add('work');
    } else {
      timerSection.classList.add('break');
    }
  }

  private updateDocumentTitle(timeRemaining: number, sessionType: string, state: string): void {
    if (state === TIMER_STATES.RUNNING) {
      const timeText = this.formatTime(timeRemaining);
      const sessionText = sessionType === SESSION_TYPES.WORK ? 'Work' : 'Break';
      document.title = `${timeText} - ${sessionText} | Fokus`;
    } else {
      document.title = 'Fokus - Pomodoro Timer';
    }
  }
}