/**
 * SafeTrip Audio & Haptic Feedback Engine
 * Built on Web Audio API — works offline and on all mobile browsers without external sound files.
 */

class SoundService {
  private audioCtx: AudioContext | null = null;
  private alarmOscillator: OscillatorNode | null = null;
  private isAlarmPlaying = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Gentle, friendly chime when a user checks in safely
   */
  playCheckInSuccess(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);

      this.vibrate([80]);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Noticeable reminder chime when a check-in is due in 2 minutes
   */
  playCheckInReminder(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [0, 0.18].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, now + delay); // E5
        osc.frequency.setValueAtTime(880.0, now + delay + 0.08); // A5

        gain.gain.setValueAtTime(0.25, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.16);
      });

      this.vibrate([150, 80, 150]);
    } catch {
      // ignore
    }
  }

  /**
   * High-urgency alert siren when check-in is overdue
   */
  startUrgentAlert(): void {
    if (this.isAlarmPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.isAlarmPlaying = true;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);

      // Oscillate frequency like an emergency siren
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(2.5, now); // 2.5Hz siren sweep
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(300, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.35, now);

      osc.connect(gain);
      gain.connect(ctx.destination);

      lfo.start(now);
      osc.start(now);

      this.alarmOscillator = osc;
      this.vibrate([300, 150, 300, 150, 500]);
    } catch {
      // ignore
    }
  }

  stopUrgentAlert(): void {
    if (!this.isAlarmPlaying) return;
    try {
      if (this.alarmOscillator) {
        this.alarmOscillator.stop();
        this.alarmOscillator.disconnect();
        this.alarmOscillator = null;
      }
    } catch {
      // ignore
    } finally {
      this.isAlarmPlaying = false;
    }
  }

  /**
   * Deterrent loud siren toggle for SOS mode
   */
  toggleDeterrentSiren(enable: boolean): void {
    if (enable) {
      this.startUrgentAlert();
    } else {
      this.stopUrgentAlert();
    }
  }

  /**
   * Device haptic vibration helper
   */
  vibrate(pattern: number[]): void {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // unsupported
      }
    }
  }
}

export const soundService = new SoundService();
