import { gsap } from 'gsap';

export class AnimationManager {
  private mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  constructor() {
    if (!this.mediaQuery.matches) {
      this.initPageLoadAnimations();
      this.initMagneticButtons();
    }
  }

  private initPageLoadAnimations() {
    // Basic stagger reveal for main components
    const elements = [
      '[data-gsap="header"]',
      '[data-gsap="timer"]',
      '[data-gsap="stats"]',
      '[data-gsap="todo"]',
      '[data-gsap="settings"]',
      '[data-gsap="footer"]'
    ];

    gsap.fromTo(
      elements,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'all'
      }
    );
  }

  private initMagneticButtons() {
    const magnets = document.querySelectorAll('.magnetic-btn');

    magnets.forEach((elem) => {
      const htmlElem = elem as HTMLElement;
      
      const xTo = gsap.quickTo(htmlElem, 'x', { duration: 0.4, ease: 'power3.out' });
      const yTo = gsap.quickTo(htmlElem, 'y', { duration: 0.4, ease: 'power3.out' });

      htmlElem.addEventListener('mousemove', (e) => {
        const rect = htmlElem.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate distance from center (max 15px displacement)
        const x = (e.clientX - centerX) * 0.3;
        const y = (e.clientY - centerY) * 0.3;
        
        xTo(x);
        yTo(y);
      });

      htmlElem.addEventListener('mouseleave', () => {
        xTo(0);
        yTo(0);
      });
    });
  }

  public animateTimerZenMode(isActive: boolean) {
    if (this.mediaQuery.matches) return;

    if (isActive) {
      // Fade out everything except timer
      gsap.to('.app-header, .side-panel, .settings-section, .app-footer', {
        opacity: 0.1,
        filter: 'blur(4px)',
        duration: 1.5,
        ease: 'power2.inOut'
      });
      // Scale timer
      gsap.to('[data-gsap="timer"]', {
        scale: 1.05,
        duration: 1.5,
        ease: 'power2.inOut'
      });
    } else {
      // Restore
      gsap.to('.app-header, .side-panel, .settings-section, .app-footer', {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.5,
        ease: 'power2.inOut',
        clearProps: 'all'
      });
      gsap.to('[data-gsap="timer"]', {
        scale: 1,
        duration: 1.5,
        ease: 'power2.inOut',
        clearProps: 'all'
      });
    }
  }

  public animateTimerTick(progressPercent: number) {
    // 301.59 is the max dasharray of the circle (2 * PI * r) where r=48
    const circumference = 301.59;
    const offset = circumference - (progressPercent / 100) * circumference;

    gsap.to('.timer-progress-circle', {
      strokeDashoffset: offset,
      duration: 1,
      ease: 'linear'
    });
  }
}

export const animationManager = new AnimationManager();
