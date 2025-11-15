import * as THREE from 'three';
import { SceneManager } from './core/SceneManager.js';
import { UIManager } from './core/UIManager.js';

class VirtualExhibition {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.loadingScreen = document.getElementById('loading-screen');

    this.init();
  }

  async init() {
    try {
      // Show loading
      this.updateLoadingProgress(0, 'Initializing...');

      // Create scene manager
      this.sceneManager = new SceneManager(this.canvas);
      this.updateLoadingProgress(20, 'Creating world...');

      // Initialize UI
      this.uiManager = new UIManager(this.sceneManager);
      this.updateLoadingProgress(40, 'Loading rooms...');

      // Load all rooms
      await this.sceneManager.loadRooms();
      this.updateLoadingProgress(80, 'Setting up experience...');

      // Start the experience
      await this.start();
      this.updateLoadingProgress(100, 'Ready!');

      // Hide loading screen
      setTimeout(() => {
        this.hideLoadingScreen();
      }, 500);

    } catch (error) {
      console.error('Error initializing exhibition:', error);
      this.updateLoadingProgress(0, 'Error loading experience');
    }
  }

  updateLoadingProgress(percent, text) {
    const progressBar = document.querySelector('.loading-progress');
    const loadingText = document.querySelector('.loading-text');

    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
    if (loadingText) {
      loadingText.textContent = text;
    }
  }

  hideLoadingScreen() {
    this.loadingScreen.style.opacity = '0';
    setTimeout(() => {
      this.loadingScreen.style.display = 'none';
      // Start the animation loop
      this.sceneManager.start();
    }, 500);
  }

  async start() {
    // Store reference globally so rooms can access UI manager
    window.app = {
      sceneManager: this.sceneManager,
      uiManager: this.uiManager
    };

    // Start in Room 1
    await this.sceneManager.enterRoom(1);

    // Show initial room title
    this.uiManager.showRoomTitle(
      'ROOM 1 — Home in Memory',
      'Reconnect with your earliest memories of home'
    );

    // Setup window resize
    window.addEventListener('resize', () => {
      this.sceneManager.onWindowResize();
    });

    // Setup room navigation (optional: auto-advance or manual)
    this.setupRoomNavigation();
  }

  setupRoomNavigation() {
    // Add keyboard shortcuts for room navigation (for testing/development)
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Digit1') this.sceneManager.enterRoom(1);
      if (e.code === 'Digit2') this.sceneManager.enterRoom(2);
      if (e.code === 'Digit3') this.sceneManager.enterRoom(3);
      if (e.code === 'Digit4') this.sceneManager.enterRoom(4);
      if (e.code === 'Digit5') this.sceneManager.enterRoom(5);
    });
  }
}

// Start the exhibition when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new VirtualExhibition();
});
