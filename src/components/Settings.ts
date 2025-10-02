import { PomodoroTimer } from './Timer.js';
import { DEFAULT_SETTINGS, type Settings } from '../utils/constants.js';

export class SettingsManager {
  private timer: PomodoroTimer;
  private workDurationInput: HTMLInputElement;
  private shortBreakInput: HTMLInputElement;
  private longBreakInput: HTMLInputElement;
  private autoStartInput: HTMLInputElement;
  private soundEnabledInput: HTMLInputElement;

  constructor(timer: PomodoroTimer) {
    this.timer = timer;
    this.workDurationInput = document.getElementById('work-duration') as HTMLInputElement;
    this.shortBreakInput = document.getElementById('short-break') as HTMLInputElement;
    this.longBreakInput = document.getElementById('long-break') as HTMLInputElement;
    this.autoStartInput = document.getElementById('auto-start') as HTMLInputElement;
    this.soundEnabledInput = document.getElementById('sound-enabled') as HTMLInputElement;

    this.loadSettings();
    this.bindEvents();
  }

  private bindEvents(): void {
    // Debounce input changes to avoid excessive updates
    let timeoutId: number;

    const handleInputChange = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        this.saveAndApplySettings();
      }, 500);
    };

    this.workDurationInput.addEventListener('input', handleInputChange);
    this.shortBreakInput.addEventListener('input', handleInputChange);
    this.longBreakInput.addEventListener('input', handleInputChange);

    // Checkboxes don't need debouncing
    this.autoStartInput.addEventListener('change', () => {
      this.saveAndApplySettings();
    });

    this.soundEnabledInput.addEventListener('change', () => {
      this.saveAndApplySettings();
    });

    // Validate inputs on blur
    [this.workDurationInput, this.shortBreakInput, this.longBreakInput].forEach(input => {
      input.addEventListener('blur', () => {
        this.validateInput(input);
      });
    });
  }

  private validateInput(input: HTMLInputElement): void {
    const value = parseInt(input.value);
    const min = parseInt(input.min);
    const max = parseInt(input.max);

    if (isNaN(value) || value < min) {
      input.value = min.toString();
    } else if (value > max) {
      input.value = max.toString();
    }
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('fokus_settings');
    let settings: Settings;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        settings = { ...DEFAULT_SETTINGS, ...parsed };
      } catch {
        settings = { ...DEFAULT_SETTINGS };
      }
    } else {
      settings = { ...DEFAULT_SETTINGS };
    }

    // Apply to UI
    this.workDurationInput.value = settings.workDuration.toString();
    this.shortBreakInput.value = settings.shortBreak.toString();
    this.longBreakInput.value = settings.longBreak.toString();
    this.autoStartInput.checked = settings.autoStartBreaks;
    this.soundEnabledInput.checked = settings.soundEnabled;

    // Apply to timer
    this.timer.updateSettings(settings);
  }

  private saveAndApplySettings(): void {
    // Validate inputs first
    this.validateInput(this.workDurationInput);
    this.validateInput(this.shortBreakInput);
    this.validateInput(this.longBreakInput);

    const settings: Settings = {
      workDuration: parseInt(this.workDurationInput.value),
      shortBreak: parseInt(this.shortBreakInput.value),
      longBreak: parseInt(this.longBreakInput.value),
      autoStartBreaks: this.autoStartInput.checked,
      soundEnabled: this.soundEnabledInput.checked,
      sessionsUntilLongBreak: DEFAULT_SETTINGS.sessionsUntilLongBreak
    };

    // Save to localStorage
    localStorage.setItem('fokus_settings', JSON.stringify(settings));

    // Apply to timer
    this.timer.updateSettings(settings);

    // Dispatch event for other components that might need to know
    document.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
  }

  public getSettings(): Settings {
    return {
      workDuration: parseInt(this.workDurationInput.value),
      shortBreak: parseInt(this.shortBreakInput.value),
      longBreak: parseInt(this.longBreakInput.value),
      autoStartBreaks: this.autoStartInput.checked,
      soundEnabled: this.soundEnabledInput.checked,
      sessionsUntilLongBreak: DEFAULT_SETTINGS.sessionsUntilLongBreak
    };
  }

  public resetToDefaults(): void {
    this.workDurationInput.value = DEFAULT_SETTINGS.workDuration.toString();
    this.shortBreakInput.value = DEFAULT_SETTINGS.shortBreak.toString();
    this.longBreakInput.value = DEFAULT_SETTINGS.longBreak.toString();
    this.autoStartInput.checked = DEFAULT_SETTINGS.autoStartBreaks;
    this.soundEnabledInput.checked = DEFAULT_SETTINGS.soundEnabled;

    this.saveAndApplySettings();
  }
}