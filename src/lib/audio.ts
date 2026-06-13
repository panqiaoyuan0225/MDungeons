/**
 * Retro Chiptune Synthesizer Sound Engine using Web Audio API
 * Zero-dependencies retro audio generation for immersive RPG experience.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private init() {
    if (this.muted) return;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted && this.ctx) {
      this.ctx.suspend();
    } else if (!this.muted && this.ctx) {
      this.ctx.resume();
    }
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  // Combat base swing / punch
  playAttack() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);
    
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Critical heavy blow
  playCrit() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.35);
    
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Block shields bump
  playBlock() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(140, now + 0.05);
    
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  // Spells casting chord
  playMagic() {
    this.init();
    if (!this.ctx || this.muted) return;
    
    const playHarmonic = (freq: number, delay: number, dur: number) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 2, t + dur);
      
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + dur);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.01);
    };

    playHarmonic(330, 0, 0.25);
    playHarmonic(440, 0.05, 0.25);
    playHarmonic(660, 0.10, 0.30);
  }

  // Heal rise notes
  playHeal() {
    this.init();
    if (!this.ctx || this.muted) return;
    
    const playTone = (freq: number, delay: number) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, t + 0.14);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    };

    playTone(290, 0);
    playTone(410, 0.05);
    playTone(550, 0.10);
    playTone(820, 0.15);
  }

  // Coins checkout / spend chime
  playCoin() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    
    const playChime = (freq: number, delay: number) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.13);
    };

    playChime(987.77, 0); // B5
    playChime(1318.51, 0.08); // E6
  }

  // Chest loot / fan-fare opening
  playChest() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    });
  }

  // Talent unlocked or Level-Up fanfare
  playUpgrade() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    
    const playPulse = (freq: number, delay: number, length: number) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + length);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + length + 0.01);
    };

    playPulse(330, 0, 0.15); // E4
    playPulse(392, 0.06, 0.15); // G4
    playPulse(523, 0.12, 0.15); // C5
    playPulse(659, 0.18, 0.30); // E5
  }

  // Gentle layout select sound click
  playClick() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Epic dungeon crawler boss defeat song
  playDefeat() {
    this.init();
    if (!this.ctx || this.muted) return;
    
    const playTone = (freq: number, delay: number, duration: number) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq - 40, t + duration);
      
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + duration + 0.01);
    };

    playTone(220, 0, 0.4);   // A3
    playTone(196, 0.25, 0.4); // G3
    playTone(174, 0.5, 0.4);  // F3
    playTone(146, 0.75, 0.85); // D3
  }

  // Epic dungeon victory trumpet chord
  playVictory() {
    this.init();
    if (!this.ctx || this.muted) return;
    
    const playTone = (freq: number, delay: number, duration: number) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + duration + 0.01);
    };

    playTone(261.63, 0, 0.15);    // C4
    playTone(329.63, 0.12, 0.15);  // E4
    playTone(392.00, 0.24, 0.15);  // G4
    playTone(523.25, 0.36, 0.15);  // C5
    playTone(392.00, 0.48, 0.10);  // G4
    playTone(523.25, 0.58, 0.45);  // C5
  }
}

export const audio = new SoundEngine();
