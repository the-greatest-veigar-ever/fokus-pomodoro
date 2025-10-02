export const DEFAULT_SETTINGS = {
  workDuration: 25, // minutes
  shortBreak: 5,    // minutes
  longBreak: 15,    // minutes
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  soundEnabled: true
};

export const SESSION_TYPES = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak'
} as const;

export const TIMER_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed'
} as const;

export const STORAGE_KEYS = {
  SETTINGS: 'fokus_settings',
  STATISTICS: 'fokus_statistics',
  SESSION_HISTORY: 'fokus_session_history'
} as const;

export type SessionType = typeof SESSION_TYPES[keyof typeof SESSION_TYPES];
export type TimerState = typeof TIMER_STATES[keyof typeof TIMER_STATES];
export type Settings = typeof DEFAULT_SETTINGS;