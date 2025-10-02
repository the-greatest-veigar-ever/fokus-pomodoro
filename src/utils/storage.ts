import { STORAGE_KEYS, type Settings } from './constants.js';

export interface SessionRecord {
  id: string;
  date: string;
  sessionType: string;
  duration: number; // in minutes
  completed: boolean;
  startTime: string;
  endTime?: string;
}

export interface DailyStatistics {
  date: string;
  sessionsCompleted: number;
  focusTimeMinutes: number;
  breakTimeMinutes: number;
  streak: number;
}

export class StorageManager {
  private static instance: StorageManager;

  private constructor() {}

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // Settings management
  public saveSettings(settings: Settings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  }

  public loadSettings(): Settings | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load settings:', error);
      return null;
    }
  }

  // Statistics management
  public saveStatistics(stats: DailyStatistics): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
    } catch (error) {
      console.warn('Failed to save statistics:', error);
    }
  }

  public loadStatistics(): DailyStatistics | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATISTICS);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load statistics:', error);
      return null;
    }
  }

  // Session history management
  public saveSessionRecord(session: SessionRecord): void {
    try {
      const existing = this.loadSessionHistory();
      existing.push(session);

      // Keep only last 100 sessions to prevent storage bloat
      const limited = existing.slice(-100);

      localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(limited));
    } catch (error) {
      console.warn('Failed to save session record:', error);
    }
  }

  public loadSessionHistory(): SessionRecord[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to load session history:', error);
      return [];
    }
  }

  public getSessionsForDate(date: string): SessionRecord[] {
    const allSessions = this.loadSessionHistory();
    return allSessions.filter(session => session.date === date);
  }

  public getSessionsForDateRange(startDate: string, endDate: string): SessionRecord[] {
    const allSessions = this.loadSessionHistory();
    return allSessions.filter(session =>
      session.date >= startDate && session.date <= endDate
    );
  }

  // Daily statistics helpers
  public calculateDailyStats(date: string): DailyStatistics {
    const sessions = this.getSessionsForDate(date);

    const workSessions = sessions.filter(s => s.sessionType === 'work' && s.completed);
    const breakSessions = sessions.filter(s => s.sessionType !== 'work' && s.completed);

    const focusTimeMinutes = workSessions.reduce((total, session) => total + session.duration, 0);
    const breakTimeMinutes = breakSessions.reduce((total, session) => total + session.duration, 0);

    return {
      date,
      sessionsCompleted: workSessions.length,
      focusTimeMinutes,
      breakTimeMinutes,
      streak: this.calculateStreak(date)
    };
  }

  private calculateStreak(currentDate: string): number {
    const allDates = this.getUniqueDatesWithSessions();
    if (allDates.length === 0) return 0;

    // Sort dates in descending order
    allDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date(currentDate);
    let checkDate = new Date(today);

    // Check each day backwards from current date
    for (let i = 0; i < allDates.length; i++) {
      const sessionDate = new Date(allDates[i]);

      if (this.isSameDate(sessionDate, checkDate)) {
        const dayStats = this.calculateDailyStats(allDates[i]);
        if (dayStats.sessionsCompleted > 0) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      } else if (sessionDate < checkDate) {
        // Gap in dates, streak broken
        break;
      }
    }

    return streak;
  }

  private getUniqueDatesWithSessions(): string[] {
    const sessions = this.loadSessionHistory();
    const dates = [...new Set(sessions.map(s => s.date))];
    return dates;
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0];
  }

  // Utility methods
  public exportData(): string {
    const data = {
      settings: this.loadSettings(),
      statistics: this.loadStatistics(),
      sessionHistory: this.loadSessionHistory(),
      exportDate: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.settings) {
        this.saveSettings(data.settings);
      }

      if (data.statistics) {
        this.saveStatistics(data.statistics);
      }

      if (data.sessionHistory && Array.isArray(data.sessionHistory)) {
        localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(data.sessionHistory));
      }

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  public clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.STATISTICS);
      localStorage.removeItem(STORAGE_KEYS.SESSION_HISTORY);
    } catch (error) {
      console.warn('Failed to clear data:', error);
    }
  }

  // Storage space utilities
  public getStorageInfo(): { used: number; available: number } {
    try {
      let total = 0;

      // Estimate current usage
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }

      return {
        used: total,
        available: 5 * 1024 * 1024 - total // Assume 5MB limit
      };
    } catch (error) {
      console.warn('Failed to get storage info:', error);
      return { used: 0, available: 0 };
    }
  }
}