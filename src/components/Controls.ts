import { PomodoroTimer, type TimerEventData } from './Timer.js';
import { TIMER_STATES } from '../utils/constants.js';

export class TimerControls {
  private timer: PomodoroTimer;
  private startPauseBtn: HTMLButtonElement;
  private resetBtn: HTMLButtonElement;

  constructor(timer: PomodoroTimer) {
    this.timer = timer;
    this.startPauseBtn = document.getElementById('start-pause-btn') as HTMLButtonElement;
    this.resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

    this.bindEvents();
    this.timer.addEventListener('timerUpdate', this.handleTimerUpdate.bind(this));
  }

  private bindEvents(): void {
    this.startPauseBtn.addEventListener('click', () => {
      this.handleStartPauseClick();
    });

    this.resetBtn.addEventListener('click', () => {
      this.timer.reset();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !this.isInputFocused()) {
        e.preventDefault();
        this.handleStartPauseClick();
      } else if (e.code === 'KeyR' && !this.isInputFocused()) {
        e.preventDefault();
        this.timer.reset();
      }
    });
  }

  private handleStartPauseClick(): void {
    const state = this.timer.getState();

    switch (state) {
      case TIMER_STATES.IDLE:
      case TIMER_STATES.PAUSED:
        this.timer.start();
        break;
      case TIMER_STATES.RUNNING:
        this.timer.pause();
        break;
    }
  }

  private handleTimerUpdate(event: Event): void {
    const { state } = (event as CustomEvent<TimerEventData>).detail;
    this.updateButtonStates(state);
  }

  private updateButtonStates(state: string): void {
    switch (state) {
      case TIMER_STATES.IDLE:
        this.startPauseBtn.textContent = 'Start';
        this.startPauseBtn.className = 'control-btn primary';
        this.resetBtn.disabled = false;
        break;
      case TIMER_STATES.RUNNING:
        this.startPauseBtn.textContent = 'Pause';
        this.startPauseBtn.className = 'control-btn secondary';
        this.resetBtn.disabled = false;
        break;
      case TIMER_STATES.PAUSED:
        this.startPauseBtn.textContent = 'Resume';
        this.startPauseBtn.className = 'control-btn primary';
        this.resetBtn.disabled = false;
        break;
      case TIMER_STATES.COMPLETED:
        this.startPauseBtn.textContent = 'Start Next';
        this.startPauseBtn.className = 'control-btn primary';
        this.resetBtn.disabled = true;
        break;
    }
  }

  private isInputFocused(): boolean {
    const activeElement = document.activeElement;
    return activeElement instanceof HTMLInputElement ||
           activeElement instanceof HTMLTextAreaElement ||
           activeElement instanceof HTMLSelectElement;
  }
}