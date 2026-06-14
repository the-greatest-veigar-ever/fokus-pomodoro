import { gsap } from 'gsap';

export class AnimationManager {
  private mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  constructor() {
    if (!this.mediaQuery.matches) {
      this.initBackgroundAnimation();
      this.initPageLoadAnimations();
      this.initMagneticButtons();
    }
  }

  private initBackgroundAnimation() {
    // Monochrome Kinetic Background: Slow, massive breathing circles
    const circles = document.querySelectorAll('.kinetic-circle');
    if (!circles.length) return;

    circles.forEach((circle, index) => {
      // Randomize initial positions slightly
      gsap.set(circle, {
        x: 'random(-10vw, 10vw)',
        y: 'random(-10vh, 10vh)',
        scale: 'random(0.8, 1.2)',
        opacity: 'random(0.01, 0.04)'
      });

      // Infinite breathing animation
      gsap.to(circle, {
        x: 'random(-30vw, 30vw)',
        y: 'random(-30vh, 30vh)',
        scale: 'random(1, 1.8)',
        opacity: 'random(0.02, 0.08)',
        duration: 'random(20, 40)',
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: index * -5 // Offset starts
      });
    });
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
