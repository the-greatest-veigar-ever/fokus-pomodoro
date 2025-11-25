import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PomodoroTimer } from '../Timer';
import { TIMER_STATES, SESSION_TYPES } from '../../utils/constants';

describe('PomodoroTimer', () => {
  let timer: PomodoroTimer;

  beforeEach(() => {
    vi.useFakeTimers();
    timer = new PomodoroTimer();
  });

  it('should initialize with default state', () => {
    expect(timer.getState()).toBe(TIMER_STATES.IDLE);
    expect(timer.getSessionType()).toBe(SESSION_TYPES.WORK);
    expect(timer.getTimeRemaining()).toBeGreaterThan(0);
  });

  it('should start timer', () => {
    timer.start();
    expect(timer.getState()).toBe(TIMER_STATES.RUNNING);
  });

  it('should pause timer', () => {
    timer.start();
    timer.pause();
    expect(timer.getState()).toBe(TIMER_STATES.PAUSED);
  });

  it('should resume timer', () => {
    timer.start();
    timer.pause();
    timer.resume();
    expect(timer.getState()).toBe(TIMER_STATES.RUNNING);
  });

  it('should reset timer', () => {
    timer.start();
    timer.reset();
    expect(timer.getState()).toBe(TIMER_STATES.IDLE);
  });

  it('should tick down time', () => {
    timer.start();
    const initialTime = timer.getTimeRemaining();
    vi.advanceTimersByTime(1000);
    expect(timer.getTimeRemaining()).toBe(initialTime - 1);
  });

  it('should complete session', () => {
    timer.start();
    // Fast forward to end
    vi.advanceTimersByTime(timer.getTimeRemaining() * 1000 + 100);
    
    expect(timer.getState()).toBe(TIMER_STATES.COMPLETED);
  });
});
