import * as BABYLON from '@babylonjs/core';

export class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.sounds = new Map();
    this.ambientSounds = new Map();
    this.masterVolume = 1.0;
    this.musicVolume = 0.7;
    this.sfxVolume = 1.0;
    this.soundMetadata = new Map(); // Store custom metadata for sounds
  }

  attachToCamera(camera) {
    // In Babylon.js, spatial sound automatically uses the active camera
    // No need to explicitly attach to camera
    this.camera = camera;
  }

  createPositionalSound(name, soundData, mesh = null) {
    // Note: In real implementation, you'd load actual audio files
    // For now, creating a placeholder structure
    const sound = new BABYLON.Sound(
      name,
      null, // URL would go here
      this.scene,
      null,
      {
        loop: soundData.loop || false,
        autoplay: false,
        volume: soundData.volume || 1.0,
        spatialSound: true,
        maxDistance: (soundData.refDistance || 5) * 10, // Babylon uses maxDistance instead of refDistance
        distanceModel: 'exponential'
      }
    );

    // Attach to mesh if provided
    if (mesh) {
      sound.attachToMesh(mesh);
    }

    this.sounds.set(name, sound);
    this.soundMetadata.set(name, {
      baseVolume: soundData.volume || 1.0,
      originalVolume: soundData.volume || 1.0
    });

    return sound;
  }

  createAmbientSound(name, soundData) {
    // Note: In real implementation, you'd load actual audio files
    const sound = new BABYLON.Sound(
      name,
      null, // URL would go here
      this.scene,
      null,
      {
        loop: soundData.loop !== false,
        autoplay: false,
        volume: (soundData.volume || 1.0) * this.musicVolume,
        spatialSound: false
      }
    );

    this.ambientSounds.set(name, sound);
    this.soundMetadata.set(name, {
      baseVolume: soundData.volume || 1.0,
      originalVolume: soundData.volume || 1.0
    });

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
    const metadata = this.soundMetadata.get(sound.name);
    const targetVolume = metadata?.originalVolume || sound.getVolume();
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
      const metadata = this.soundMetadata.get(sound.name);
      const baseVolume = metadata?.baseVolume || 1.0;
      sound.setVolume(baseVolume * this.musicVolume * this.masterVolume);
    });
  }

  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(sound => {
      const metadata = this.soundMetadata.get(sound.name);
      const baseVolume = metadata?.baseVolume || 1.0;
      sound.setVolume(baseVolume * this.sfxVolume * this.masterVolume);
    });
  }

  updateAllVolumes() {
    this.sounds.forEach(sound => {
      const metadata = this.soundMetadata.get(sound.name);
      const baseVolume = metadata?.baseVolume || 1.0;
      sound.setVolume(baseVolume * this.sfxVolume * this.masterVolume);
    });
    this.ambientSounds.forEach(sound => {
      const metadata = this.soundMetadata.get(sound.name);
      const baseVolume = metadata?.baseVolume || 1.0;
      sound.setVolume(baseVolume * this.musicVolume * this.masterVolume);
    });
  }

  // Placeholder for actual audio loading
  // In real implementation, you'd use BABYLON.Sound with actual file URLs
  async loadSound(url) {
    // const sound = new BABYLON.Sound("name", url, this.scene, callback);
    console.log(`Audio loading placeholder for: ${url}`);
    return null;
  }
}
