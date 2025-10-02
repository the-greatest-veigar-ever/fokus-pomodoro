import { PomodoroTimer, type TimerEventData } from './Timer.js';
import { SESSION_TYPES, TIMER_STATES } from '../utils/constants.js';

interface DailyStats {
  date: string;
  sessionsCompleted: number;
  focusTimeMinutes: number;
  streak: number;
}

export class Statistics {
  private timer: PomodoroTimer;
  private sessionsElement: HTMLElement;
  private focusTimeElement: HTMLElement;
  private streakElement: HTMLElement;
  private dailyStats: DailyStats;

  constructor(timer: PomodoroTimer) {
    this.timer = timer;
    this.sessionsElement = document.getElementById('sessions-completed') as HTMLElement;
    this.focusTimeElement = document.getElementById('focus-time') as HTMLElement;
    this.streakElement = document.getElementById('current-streak') as HTMLElement;

    this.dailyStats = this.loadTodaysStats();
    this.timer.addEventListener('timerUpdate', this.handleTimerUpdate.bind(this));
    this.updateDisplay();
  }

  private handleTimerUpdate(event: Event): void {
    const { state, sessionType, sessionsCompleted } = (event as CustomEvent<TimerEventData>).detail;

    if (state === TIMER_STATES.COMPLETED && sessionType === SESSION_TYPES.WORK) {
      this.recordCompletedSession();
    }

    this.updateSessionsFromTimer(sessionsCompleted);
  }

  private recordCompletedSession(): void {
    const today = this.getTodayString();

    if (this.dailyStats.date !== today) {
      // New day, reset stats
      this.dailyStats = {
        date: today,
        sessionsCompleted: 0,
        focusTimeMinutes: 0,
        streak: this.calculateNewDayStreak()
      };
    }

    this.dailyStats.sessionsCompleted++;
    this.dailyStats.focusTimeMinutes += this.timer.getSettings().workDuration;
    this.dailyStats.streak = this.calculateCurrentStreak();

    this.saveStats();
    this.updateDisplay();
  }

  private updateSessionsFromTimer(sessionsCompleted: number): void {
    // Update display to match timer's session count
    if (this.dailyStats.sessionsCompleted !== sessionsCompleted) {
      this.dailyStats.sessionsCompleted = sessionsCompleted;
      this.updateDisplay();
    }
  }

  private updateDisplay(): void {
    this.sessionsElement.textContent = this.dailyStats.sessionsCompleted.toString();
    this.focusTimeElement.textContent = this.formatFocusTime(this.dailyStats.focusTimeMinutes);
    this.streakElement.textContent = this.dailyStats.streak.toString();
  }

  private formatFocusTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${remainingMinutes}m`;
    }
  }

  private loadTodaysStats(): DailyStats {
    const today = this.getTodayString();
    const saved = localStorage.getItem('fokus_daily_stats');

    if (saved) {
      const parsed: DailyStats = JSON.parse(saved);
      if (parsed.date === today) {
        return parsed;
      }
    }

    // Return new stats for today
    return {
      date: today,
      sessionsCompleted: 0,
      focusTimeMinutes: 0,
      streak: this.loadStreakFromHistory()
    };
  }

  private saveStats(): void {
    localStorage.setItem('fokus_daily_stats', JSON.stringify(this.dailyStats));
    this.saveToHistory();
  }

  private saveToHistory(): void {
    const historyKey = 'fokus_session_history';
    const existing = localStorage.getItem(historyKey);
    const history: DailyStats[] = existing ? JSON.parse(existing) : [];

    // Update or add today's entry
    const todayIndex = history.findIndex(entry => entry.date === this.dailyStats.date);
    if (todayIndex >= 0) {
      history[todayIndex] = { ...this.dailyStats };
    } else {
      history.push({ ...this.dailyStats });
    }

    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const filtered = history.filter(entry => new Date(entry.date) >= thirtyDaysAgo);

    localStorage.setItem(historyKey, JSON.stringify(filtered));
  }

  private loadStreakFromHistory(): number {
    const historyKey = 'fokus_session_history';
    const existing = localStorage.getItem(historyKey);
    if (!existing) return 0;

    const history: DailyStats[] = JSON.parse(existing);
    return this.calculateStreakFromHistory(history);
  }

  private calculateStreakFromHistory(history: DailyStats[]): number {
    if (history.length === 0) return 0;

    // Sort by date descending
    const sorted = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);

    for (const entry of sorted) {
      const entryDate = new Date(entry.date);

      // Check if this entry is for the expected date
      if (this.isSameDate(entryDate, checkDate) && entry.sessionsCompleted > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (this.isSameDate(entryDate, checkDate)) {
        // No sessions completed on this day, break streak
        break;
      }
      // If entry is for an older date, continue checking
    }

    return streak;
  }

  private calculateNewDayStreak(): number {
    // When starting a new day, calculate streak from history
    return this.loadStreakFromHistory();
  }

  private calculateCurrentStreak(): number {
    // Current streak includes today if we have sessions
    if (this.dailyStats.sessionsCompleted > 0) {
      const historyStreak = this.loadStreakFromHistory();
      // If today is not yet in history, add 1 for today
      return historyStreak + 1;
    }
    return this.loadStreakFromHistory();
  }

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0];
  }

  // Public method to get current stats
  public getStats(): DailyStats {
    return { ...this.dailyStats };
  }
}