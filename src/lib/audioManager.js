import startSound from '@/assets/sounds/start.mp3';
import completeSound from '@/assets/sounds/complete.mp3';
import tickSound from '@/assets/sounds/tick.mp3';

class AudioManager {
  constructor() {
    this.startSound = new Audio(startSound);
    this.completeSound = new Audio(completeSound);
    this.tickSound = new Audio(tickSound);
    
    // Preload sounds
    this.startSound.load();
    this.completeSound.load();
    this.tickSound.load();
  }

  playStart() {
    this.startSound.currentTime = 0;
    this.startSound.play().catch(err => console.warn('Could not play start sound:', err));
  }

  playComplete() {
    this.completeSound.currentTime = 0;
    this.completeSound.play().catch(err => console.warn('Could not play complete sound:', err));
  }

  playTick() {
    this.tickSound.currentTime = 0;
    this.tickSound.play().catch(err => console.warn('Could not play tick sound:', err));
  }
}

export const audioManager = new AudioManager(); 