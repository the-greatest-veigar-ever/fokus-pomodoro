import { SESSION_TYPES, TIMER_STATES, DEFAULT_SETTINGS, type SessionType, type TimerState, type Settings } from '../utils/constants.js';

export interface TimerEventData {
  timeRemaining: number;
  sessionType: SessionType;
  state: TimerState;
  sessionsCompleted: number;
  progress: number;
}

export class PomodoroTimer extends EventTarget {
  private timeRemaining: number = 0;
  private sessionType: SessionType = SESSION_TYPES.WORK;
  private state: TimerState = TIMER_STATES.IDLE;
  private sessionsCompleted: number = 0;
  private intervalId: number | null = null;
  private settings: Settings = { ...DEFAULT_SETTINGS };

  constructor(settings?: Partial<Settings>) {
    super();
    if (settings) {
      this.updateSettings(settings);
    }
    this.reset();
  }

  public start(): void {
    if (this.state === TIMER_STATES.IDLE) {
      this.timeRemaining = this.getCurrentSessionDuration() * 60;
    }

    this.state = TIMER_STATES.RUNNING;
    this.intervalId = window.setInterval(() => {
      this.tick();
    }, 1000);

    this.dispatchTimerEvent();
  }

  public pause(): void {
    if (this.state === TIMER_STATES.RUNNING) {
      this.state = TIMER_STATES.PAUSED;
      this.clearInterval();
      this.dispatchTimerEvent();
    }
  }

  public resume(): void {
    if (this.state === TIMER_STATES.PAUSED) {
      this.start();
    }
  }

  public reset(): void {
    this.state = TIMER_STATES.IDLE;
    this.clearInterval();
    this.timeRemaining = this.getCurrentSessionDuration() * 60;
    this.dispatchTimerEvent();
  }

  public skip(): void {
    this.completeSession();
  }

  public updateSettings(newSettings: Partial<Settings>): void {
    this.settings = { ...this.settings, ...newSettings };
    if (this.state === TIMER_STATES.IDLE) {
      this.timeRemaining = this.getCurrentSessionDuration() * 60;
      this.dispatchTimerEvent();
    }
  }

  private tick(): void {
    this.timeRemaining--;

    if (this.timeRemaining <= 0) {
      this.completeSession();
    } else {
      this.dispatchTimerEvent();
    }
  }

  private completeSession(): void {
    this.state = TIMER_STATES.COMPLETED;
    this.clearInterval();

    if (this.sessionType === SESSION_TYPES.WORK) {
      this.sessionsCompleted++;
    }

    this.dispatchTimerEvent();

    // Auto-advance to next session
    setTimeout(() => {
      this.advanceToNextSession();
    }, 1000);
  }

  private advanceToNextSession(): void {
    this.sessionType = this.getNextSessionType();
    this.timeRemaining = this.getCurrentSessionDuration() * 60;
    this.state = TIMER_STATES.IDLE;

    if (this.settings.autoStartBreaks && this.sessionType !== SESSION_TYPES.WORK) {
      this.start();
    } else {
      this.dispatchTimerEvent();
    }
  }

  private getNextSessionType(): SessionType {
    if (this.sessionType === SESSION_TYPES.WORK) {
      // After work, check if it's time for long break
      return this.sessionsCompleted % this.settings.sessionsUntilLongBreak === 0
        ? SESSION_TYPES.LONG_BREAK
        : SESSION_TYPES.SHORT_BREAK;
    } else {
      // After any break, return to work
      return SESSION_TYPES.WORK;
    }
  }

  private getCurrentSessionDuration(): number {
    switch (this.sessionType) {
      case SESSION_TYPES.WORK:
        return this.settings.workDuration;
      case SESSION_TYPES.SHORT_BREAK:
        return this.settings.shortBreak;
      case SESSION_TYPES.LONG_BREAK:
        return this.settings.longBreak;
      default:
        return this.settings.workDuration;
    }
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private dispatchTimerEvent(): void {
    const totalDuration = this.getCurrentSessionDuration() * 60;
    const progress = totalDuration > 0 ? ((totalDuration - this.timeRemaining) / totalDuration) * 100 : 0;

    const eventData: TimerEventData = {
      timeRemaining: this.timeRemaining,
      sessionType: this.sessionType,
      state: this.state,
      sessionsCompleted: this.sessionsCompleted,
      progress
    };

    this.dispatchEvent(new CustomEvent('timerUpdate', { detail: eventData }));
  }

  // Getters for current state
  public getTimeRemaining(): number {
    return this.timeRemaining;
  }

  public getSessionType(): SessionType {
    return this.sessionType;
  }

  public getState(): TimerState {
    return this.state;
  }

  public getSessionsCompleted(): number {
    return this.sessionsCompleted;
  }

  public getSettings(): Settings {
    return { ...this.settings };
  }
}