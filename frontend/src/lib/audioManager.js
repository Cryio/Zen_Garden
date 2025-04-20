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

// Sound effects for different actions
const soundEffects = {
  start: {
    src: '/audio/effects/start.mp3',
    volume: 0.7
  },
  pause: {
    src: '/audio/effects/pause.mp3',
    volume: 0.6
  },
  resume: {
    src: '/audio/effects/resume.mp3',
    volume: 0.6
  },
  stop: {
    src: '/audio/effects/stop.mp3',
    volume: 0.7
  },
  complete: {
    src: '/audio/effects/complete.mp3',
    volume: 0.8
  },
  tick: {
    src: '/audio/effects/tick.mp3',
    volume: 0.3
  }
};

class AudioManager {
  constructor() {
    this.backgroundAudio = new Audio();
    this.currentMusicIndex = Math.floor(Math.random() * backgroundMusic.length); // Start with random track
    this.isPlaying = false;
    this.volume = 0.4; // Lower default volume for ambient music
    this.isMuted = false;
    this.effectsVolume = 0.7;
    this.effects = new Map();
    this.shuffle = true; // Add shuffle mode
    this.playedTracks = new Set(); // Track played songs for shuffle mode
    
    // Initialize sound effects
    Object.entries(soundEffects).forEach(([key, value]) => {
      const audio = new Audio(value.src);
      audio.volume = value.volume * this.effectsVolume;
      this.effects.set(key, audio);
    });

    // Set up background music ended event
    this.backgroundAudio.addEventListener('ended', () => {
      this.playNextTrack();
    });

    // Add error handling for audio loading
    this.backgroundAudio.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
      this.playNextTrack(); // Skip to next track if current fails
    });
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
    this.playedTracks.clear(); // Reset played tracks list
  }

  pauseBackgroundMusic() {
    this.backgroundAudio.pause();
    this.isPlaying = false;
  }

  resumeBackgroundMusic() {
    if (!this.isPlaying) {
      this.backgroundAudio.play().catch(error => {
        console.error('Resume playback failed:', error);
        this.playNextTrack(); // Try next track if current fails
      });
      this.isPlaying = true;
    }
  }

  playNextTrack() {
    if (this.shuffle) {
      this.playNextShuffled();
    } else {
      this.currentMusicIndex = (this.currentMusicIndex + 1) % backgroundMusic.length;
      this.loadAndPlayTrack(this.currentMusicIndex);
    }
  }

  playPreviousTrack() {
    if (this.shuffle) {
      // In shuffle mode, previous just restarts the current track
      this.backgroundAudio.currentTime = 0;
    } else {
      this.currentMusicIndex = (this.currentMusicIndex - 1 + backgroundMusic.length) % backgroundMusic.length;
      this.loadAndPlayTrack(this.currentMusicIndex);
    }
  }

  playNextShuffled() {
    // Add current track to played list
    this.playedTracks.add(this.currentMusicIndex);

    // If all tracks have been played, reset the played list
    if (this.playedTracks.size >= backgroundMusic.length) {
      this.playedTracks.clear();
      this.playedTracks.add(this.currentMusicIndex); // Keep current track in list
    }

    // Get available tracks
    const availableTracks = [...Array(backgroundMusic.length).keys()]
      .filter(i => !this.playedTracks.has(i));

    // Pick random track from available ones
    this.currentMusicIndex = availableTracks[Math.floor(Math.random() * availableTracks.length)];
    this.loadAndPlayTrack(this.currentMusicIndex);
  }

  toggleShuffle() {
    this.shuffle = !this.shuffle;
    if (this.shuffle) {
      this.playedTracks.clear();
      this.playedTracks.add(this.currentMusicIndex);
    }
  }

  loadAndPlayTrack(index) {
    const track = backgroundMusic[index];
    this.backgroundAudio.src = track.src;
    this.backgroundAudio.volume = this.isMuted ? 0 : this.volume;
    this.backgroundAudio.play().catch(error => {
      console.error('Audio playback failed:', error);
      this.playNextTrack(); // Try next track if current fails
    });
  }

  // Sound effects controls
  playEffect(effectName) {
    const effect = this.effects.get(effectName);
    if (effect && !this.isMuted) {
      effect.currentTime = 0;
      effect.play().catch(error => console.error('Effect playback failed:', error));
    }
  }

  // Volume controls
  setVolume(value) {
    this.volume = value;
    this.backgroundAudio.volume = this.isMuted ? 0 : value;
  }

  setEffectsVolume(value) {
    this.effectsVolume = value;
    this.effects.forEach(effect => {
      effect.volume = this.isMuted ? 0 : value;
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.backgroundAudio.volume = this.isMuted ? 0 : this.volume;
    this.effects.forEach(effect => {
      effect.volume = this.isMuted ? 0 : this.effectsVolume;
    });
  }

  getCurrentTrackInfo() {
    return backgroundMusic[this.currentMusicIndex];
  }

  cleanup() {
    this.stopBackgroundMusic();
    this.effects.forEach(effect => {
      effect.pause();
      effect.currentTime = 0;
    });
  }
}

export const audioManager = new AudioManager(); 