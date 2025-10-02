export class AudioNotificationManager {
  private audioContext: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    this.initializeAudioContext();
    this.listenForSettingsChanges();
  }

  private initializeAudioContext(): void {
    // Only create AudioContext when needed to avoid browser warnings
    document.addEventListener('click', () => {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    }, { once: true });
  }

  private listenForSettingsChanges(): void {
    document.addEventListener('settingsChanged', (event: Event) => {
      const { soundEnabled } = (event as CustomEvent).detail;
      this.soundEnabled = soundEnabled;
    });
  }

  public async playNotification(type: 'workComplete' | 'breakComplete'): Promise<void> {
    if (!this.soundEnabled) return;

    try {
      // Request browser notification permission if not already granted
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      // Show browser notification
      this.showBrowserNotification(type);

      // Play audio notification
      await this.playAudioNotification(type);
    } catch (error) {
      console.warn('Failed to play notification:', error);
    }
  }

  private showBrowserNotification(type: 'workComplete' | 'breakComplete'): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const options: NotificationOptions = {
        icon: '/vite.svg', // You can replace with a custom icon
        badge: '/vite.svg',
        requireInteraction: false,
        tag: 'fokus-timer'
      };

      if (type === 'workComplete') {
        new Notification('Work Session Complete! 🎉', {
          body: 'Great work! Time for a well-deserved break.',
          ...options
        });
      } else {
        new Notification('Break Time Over! 💪', {
          body: 'Ready to get back to work? Let\'s stay focused!',
          ...options
        });
      }
    }
  }

  private async playAudioNotification(type: 'workComplete' | 'breakComplete'): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Create different tones for different notification types
    if (type === 'workComplete') {
      await this.playChime(); // Pleasant chime for work completion
    } else {
      await this.playAlert(); // Gentle alert for break end
    }
  }

  private async playChime(): Promise<void> {
    if (!this.audioContext) return;

    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.audioContext.destination);

    // Play a pleasant 3-note chime (C-E-G)
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    const duration = 0.3;

    for (let i = 0; i < frequencies.length; i++) {
      setTimeout(() => {
        this.playTone(frequencies[i], duration, gainNode, 0.1);
      }, i * 200);
    }
  }

  private async playAlert(): Promise<void> {
    if (!this.audioContext) return;

    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.audioContext.destination);

    // Play a gentle two-tone alert
    const frequencies = [440, 554.37]; // A4, C#5
    const duration = 0.2;

    for (let i = 0; i < 2; i++) {
      setTimeout(() => {
        this.playTone(frequencies[i % frequencies.length], duration, gainNode, 0.08);
      }, i * 300);
    }
  }

  private playTone(frequency: number, duration: number, gainNode: GainNode, volume: number): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(gainNode);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'sine';

    // Create a smooth envelope
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  public async testNotification(): Promise<void> {
    await this.playNotification('workComplete');
  }
}