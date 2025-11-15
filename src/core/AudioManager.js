import * as THREE from 'three';

export class AudioManager {
  constructor() {
    this.listener = new THREE.AudioListener();
    this.sounds = new Map();
    this.ambientSounds = new Map();
    this.masterVolume = 1.0;
    this.musicVolume = 0.7;
    this.sfxVolume = 1.0;
  }

  attachToCamera(camera) {
    camera.add(this.listener);
  }

  createPositionalSound(name, soundData) {
    const sound = new THREE.PositionalAudio(this.listener);
    // Note: In real implementation, you'd load actual audio files
    // sound.setBuffer(buffer);
    sound.setRefDistance(soundData.refDistance || 5);
    sound.setVolume(soundData.volume || 1.0);
    sound.setLoop(soundData.loop || false);

    this.sounds.set(name, sound);
    return sound;
  }

  createAmbientSound(name, soundData) {
    const sound = new THREE.Audio(this.listener);
    // Note: In real implementation, you'd load actual audio files
    // sound.setBuffer(buffer);
    sound.setVolume((soundData.volume || 1.0) * this.musicVolume);
    sound.setLoop(soundData.loop !== false);

    this.ambientSounds.set(name, sound);
    return sound;
  }

  play(name, fadeDuration = 0) {
    const sound = this.sounds.get(name) || this.ambientSounds.get(name);
    if (sound && !sound.isPlaying) {
      if (fadeDuration > 0) {
        this.fadeIn(sound, fadeDuration);
      } else {
        sound.play();
      }
    }
  }

  stop(name, fadeDuration = 0) {
    const sound = this.sounds.get(name) || this.ambientSounds.get(name);
    if (sound && sound.isPlaying) {
      if (fadeDuration > 0) {
        this.fadeOut(sound, fadeDuration);
      } else {
        sound.stop();
      }
    }
  }

  fadeIn(sound, duration) {
    const targetVolume = sound.userData.originalVolume || sound.getVolume();
    sound.setVolume(0);
    sound.play();

    const startTime = Date.now();
    const fadeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      sound.setVolume(targetVolume * progress);

      if (progress >= 1) {
        clearInterval(fadeInterval);
      }
    }, 50);
  }

  fadeOut(sound, duration) {
    const startVolume = sound.getVolume();
    const startTime = Date.now();

    const fadeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      sound.setVolume(startVolume * (1 - progress));

      if (progress >= 1) {
        sound.stop();
        clearInterval(fadeInterval);
      }
    }, 50);
  }

  stopAll(fadeDuration = 0) {
    this.sounds.forEach((sound, name) => {
      this.stop(name, fadeDuration);
    });
    this.ambientSounds.forEach((sound, name) => {
      this.stop(name, fadeDuration);
    });
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.ambientSounds.forEach(sound => {
      sound.setVolume((sound.userData.baseVolume || 1.0) * this.musicVolume * this.masterVolume);
    });
  }

  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(sound => {
      sound.setVolume((sound.userData.baseVolume || 1.0) * this.sfxVolume * this.masterVolume);
    });
  }

  updateAllVolumes() {
    this.sounds.forEach(sound => {
      sound.setVolume((sound.userData.baseVolume || 1.0) * this.sfxVolume * this.masterVolume);
    });
    this.ambientSounds.forEach(sound => {
      sound.setVolume((sound.userData.baseVolume || 1.0) * this.musicVolume * this.masterVolume);
    });
  }

  // Placeholder for actual audio loading
  // In real implementation, you'd use THREE.AudioLoader
  async loadSound(url) {
    // const audioLoader = new THREE.AudioLoader();
    // return new Promise((resolve, reject) => {
    //   audioLoader.load(url, resolve, undefined, reject);
    // });
    console.log(`Audio loading placeholder for: ${url}`);
    return null;
  }
}
