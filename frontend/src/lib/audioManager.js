// Background music playlist with credits
const backgroundMusic = [
  {
    src: '/audio/snoozy beats - a lonely star.mp3',
    title: 'a lonely star',
    artist: 'snoozy beats',
    duration: 180
  },
  {
    src: '/audio/snoozy beats - see you again.mp3',
    title: 'see you again',
    artist: 'snoozy beats',
    duration: 180
  },
  {
    src: '/audio/Aldous Ichnite - What If We Kissed in a Perpetual State of Entropy.mp3',
    title: 'What If We Kissed in a Perpetual State of Entropy',
    artist: 'Aldous Ichnite',
    duration: 180
  },
  {
    src: '/audio/Aldous Ichnite - There is Wi-Fi at the Peak of Kilimanjaro.mp3',
    title: 'There is Wi-Fi at the Peak of Kilimanjaro',
    artist: 'Aldous Ichnite',
    duration: 180
  },
  {
    src: '/audio/Aldous Ichnite - This Doubt Tastes Like You.mp3',
    title: 'This Doubt Tastes Like You',
    artist: 'Aldous Ichnite',
    duration: 180
  },
  {
    src: '/audio/HoliznaCC0 - The Birth.mp3',
    title: 'The Birth',
    artist: 'HoliznaCC0',
    duration: 180
  },
  {
    src: '/audio/Aldous Ichnite - The Wooden Spoon Couldn\'t Cut But Left Emotional Scars.mp3',
    title: 'The Wooden Spoon Couldn\'t Cut But Left Emotional Scars',
    artist: 'Aldous Ichnite',
    duration: 180
  },
  {
    src: '/audio/Aldous Ichnite - What Would Zeno of Citium Do.mp3',
    title: 'What Would Zeno of Citium Do',
    artist: 'Aldous Ichnite',
    duration: 180
  }
];

class AudioManager {
  constructor() {
    // Sound effects
    this.startSound = new Audio('/audio/effects/play.mp3');
    this.pauseSound = new Audio('/audio/effects/pause.mp3');
    this.completeSound = new Audio('/audio/effects/complete.mp3');
    
    // Background music setup
    this.backgroundAudio = new Audio();
    this.currentMusicIndex = Math.floor(Math.random() * backgroundMusic.length);
    this.isPlaying = false;
    this.volume = 0.4;
    this.isMuted = false;
    
    // Preload sounds
    this.startSound.load();
    this.pauseSound.load();
    this.completeSound.load();
    
    // Set volumes
    this.startSound.volume = 0.7;
    this.pauseSound.volume = 0.6;
    this.completeSound.volume = 0.8;

    // Set up background music ended event
    this.backgroundAudio.addEventListener('ended', () => {
      if (this.isPlaying) {
        this.playNextTrack();
      }
    });
  }

  // Sound effects
  playStart() {
    if (!this.isMuted) {
      this.startSound.currentTime = 0;
      this.startSound.play().catch(err => console.warn('Could not play start sound:', err));
    }
  }

  playPause() {
    if (!this.isMuted) {
      this.pauseSound.currentTime = 0;
      this.pauseSound.play().catch(err => console.warn('Could not play pause sound:', err));
    }
  }

  playComplete() {
    if (!this.isMuted) {
      this.completeSound.currentTime = 0;
      this.completeSound.play().catch(err => console.warn('Could not play complete sound:', err));
    }
  }

  // Background music controls
  startBackgroundMusic() {
    if (!this.isPlaying) {
      this.loadAndPlayTrack(this.currentMusicIndex);
      this.isPlaying = true;
    }
  }

  stopBackgroundMusic() {
    this.backgroundAudio.pause();
    this.backgroundAudio.currentTime = 0;
    this.isPlaying = false;
  }

  pauseBackgroundMusic() {
    this.backgroundAudio.pause();
    this.isPlaying = false;
  }

  resumeBackgroundMusic() {
    if (!this.isPlaying) {
      this.backgroundAudio.play().catch(error => {
        console.error('Resume playback failed:', error);
        this.playNextTrack();
      });
      this.isPlaying = true;
    }
  }

  playNextTrack() {
    this.currentMusicIndex = (this.currentMusicIndex + 1) % backgroundMusic.length;
    this.loadAndPlayTrack(this.currentMusicIndex);
  }

  loadAndPlayTrack(index) {
    const track = backgroundMusic[index];
    this.backgroundAudio.src = track.src;
    this.backgroundAudio.volume = this.isMuted ? 0 : this.volume;
    this.backgroundAudio.play().catch(error => {
      console.error('Audio playback failed:', error);
      this.playNextTrack();
    });
  }

  // Volume controls
  setVolume(value) {
    this.volume = value;
    this.backgroundAudio.volume = this.isMuted ? 0 : value;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.backgroundAudio.volume = this.isMuted ? 0 : this.volume;
  }

  getCurrentTrackInfo() {
    return backgroundMusic[this.currentMusicIndex];
  }

  cleanup() {
    this.backgroundAudio.pause();
    this.backgroundAudio.src = '';
  }
}

export const audioManager = new AudioManager(); 