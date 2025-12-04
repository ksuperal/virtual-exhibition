import * as BABYLON from '@babylonjs/core';
import { FirstPersonControls } from './FirstPersonControls.js';
import { InteractionManager } from './InteractionManager.js';
import { AudioManager } from './AudioManager.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';
import { Room1 } from '../rooms/Room1.js';
import { Room2 } from '../rooms/Room2.js';
import { Room3 } from '../rooms/Room3.js';
import { Room4 } from '../rooms/Room4.js';
import { Room5 } from '../rooms/Room5.js';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.currentRoom = null;
    this.rooms = new Map();
    this.performanceMonitor = new PerformanceMonitor();

    this.setupEngine();
    this.setupScene();
    this.setupCamera();
    this.setupPipeline();
    this.setupControls();
    this.setupManagers();
    this.setupLights();
  }

  setupEngine() {
    // Create Babylon.js engine with optimization settings
    this.engine = new BABYLON.Engine(this.canvas, true, {
      powerPreference: 'high-performance',
      antialias: true,
      preserveDrawingBuffer: false,
      stencil: false
    });

    // Set pixel ratio (capped at 2 for performance)
    this.engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio, 2));

    // Enable basic shadows
    this.engine.getCaps().maxTextureSize = 1024;
  }

  setupScene() {
    this.scene = new BABYLON.Scene(this.engine);

    // Background color - LIGHTENED for better visibility
    this.scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.3, 1); // Lighter navy

    // Fog - LIGHTENED
    this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    this.scene.fogColor = new BABYLON.Color3(0.2, 0.2, 0.3);
    this.scene.fogStart = 10;
    this.scene.fogEnd = 50;
  }

  setupCamera() {
    this.camera = new BABYLON.UniversalCamera(
      'camera',
      new BABYLON.Vector3(0, 1.6, 5),
      this.scene
    );

    // Camera settings
    this.camera.fov = 75 * Math.PI / 180; // Convert degrees to radians
    this.camera.minZ = 0.1;
    this.camera.maxZ = 1000;

    // Disable default controls (we'll use custom FirstPersonControls)
    this.camera.inputs.clear();
  }

  setupPipeline() {
    // Image processing (tone mapping equivalent)
    const pipeline = new BABYLON.DefaultRenderingPipeline(
      'default',
      true,
      this.scene,
      [this.camera]
    );
    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.toneMappingEnabled = true;
    pipeline.imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
    pipeline.imageProcessing.exposure = 1.2;

    this.pipeline = pipeline;
  }

  setupControls() {
    this.controls = new FirstPersonControls(this.camera, this.canvas, this.scene);
  }

  setupManagers() {
    this.interactionManager = new InteractionManager(this.camera, this.scene);
    this.audioManager = new AudioManager(this.scene);
  }

  setupLights() {
    // Hemispheric light (replaces ambient light) - INCREASED for better visibility
    const hemiLight = new BABYLON.HemisphericLight(
      'hemiLight',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    hemiLight.intensity = 0.6; // Increased from 0.3

    // Directional light with shadows - INCREASED for better visibility
    const dirLight = new BABYLON.DirectionalLight(
      'dirLight',
      new BABYLON.Vector3(-5, -10, -5),
      this.scene
    );
    dirLight.position = new BABYLON.Vector3(5, 10, 5);
    dirLight.intensity = 0.8; // Increased from 0.5

    // Shadow generator (OPTIMIZED: 1024x1024 shadow map)
    this.shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
    this.shadowGenerator.useBlurExponentialShadowMap = false; // Use basic shadows for performance
    this.shadowGenerator.useContactHardeningShadow = false;
    this.shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_LOW;

    // Store for room access
    this.dirLight = dirLight;
  }

  async loadRooms() {
    // Create all rooms
    this.rooms.set(1, new Room1(this.scene, this.interactionManager, this.audioManager, this.shadowGenerator));
    this.rooms.set(2, new Room2(this.scene, this.interactionManager, this.audioManager, this.shadowGenerator));
    this.rooms.set(3, new Room3(this.scene, this.interactionManager, this.audioManager, this.shadowGenerator));
    this.rooms.set(4, new Room4(this.scene, this.interactionManager, this.audioManager, this.shadowGenerator));
    this.rooms.set(5, new Room5(this.scene, this.interactionManager, this.audioManager, this.shadowGenerator));

    // Initialize all rooms and keep them all visible for seamless walking
    for (const [id, room] of this.rooms) {
      await room.init();
      room.show(); // Keep all rooms visible for seamless walking
    }

    // Room boundaries for automatic detection (wall-by-wall placement)
    this.roomBoundaries = [
      { roomNumber: 1, minX: -6, maxX: 6 },      // Room 1: x=0, width=12, spans -6 to 6
      { roomNumber: 2, minX: 6, maxX: 18 },      // Room 2: x=12, width=12, spans 6 to 18
      { roomNumber: 3, minX: 18, maxX: 32 },     // Room 3: x=25, width=14, spans 18 to 32
      { roomNumber: 4, minX: 32, maxX: 48 },     // Room 4: x=40, width=16, spans 32 to 48
      { roomNumber: 5, minX: 48, maxX: 62 }      // Room 5: x=55, width=14, spans 48 to 62
    ];
  }

  async enterRoom(roomNumber, shouldSetCamera = true) {
    // Exit current room
    if (this.currentRoom) {
      const currentRoomNumber = this.getCurrentRoomNumber();
      if (currentRoomNumber !== roomNumber) {
        await this.currentRoom.onExit();
      }
    }

    // Enter new room
    const room = this.rooms.get(roomNumber);
    if (room) {
      this.currentRoom = room;
      await room.onEnter();

      // Set camera position for the room (only when teleporting via keyboard)
      if (shouldSetCamera) {
        this.setCameraForRoom(roomNumber);
      }

      // Update room title
      this.updateRoomTitle(roomNumber);
    }
  }

  getCurrentRoomNumber() {
    for (const [roomNumber, room] of this.rooms) {
      if (room === this.currentRoom) {
        return roomNumber;
      }
    }
    return null;
  }

  detectCurrentRoom() {
    const cameraX = this.camera.position.x;

    for (const boundary of this.roomBoundaries) {
      if (cameraX >= boundary.minX && cameraX < boundary.maxX) {
        return boundary.roomNumber;
      }
    }

    return 1; // Default to room 1
  }

  updateRoomTitle(roomNumber) {
    const titles = {
      1: { title: 'ROOM 1 — Home in Memory', subtitle: 'Reconnect with your earliest memories of home' },
      2: { title: 'ROOM 2 — The Weight of Belonging', subtitle: 'Navigate the challenges of finding your place' },
      3: { title: 'ROOM 3 — Fragments of Identity', subtitle: 'Piece together who you are' },
      4: { title: 'ROOM 4 — The Cosmic Perspective', subtitle: 'See yourself in the universe' },
      5: { title: 'ROOM 5 — Building New Homes', subtitle: 'Create community and connection' }
    };

    const roomData = titles[roomNumber];
    if (roomData && window.app?.uiManager) {
      window.app.uiManager.showRoomTitle(roomData.title, roomData.subtitle);
    }
  }

  setCameraForRoom(roomNumber) {
    // Wall-by-wall placement: rooms are directly adjacent
    const positions = {
      1: { x: 0, y: 1.6, z: 4 },      // Room 1: center at x=0
      2: { x: 12, y: 1.6, z: 5 },     // Room 2: center at x=12
      3: { x: 25, y: 1.6, z: 5 },     // Room 3: center at x=25
      4: { x: 40, y: 1.6, z: 6 },     // Room 4: center at x=40
      5: { x: 55, y: 1.6, z: 5 }      // Room 5: center at x=55
    };

    const pos = positions[roomNumber];
    if (pos) {
      this.camera.position = new BABYLON.Vector3(pos.x, pos.y, pos.z);
      this.controls.reset();
    }
  }

  start() {
    this.animate();
  }

  animate() {
    // Babylon.js render loop
    this.engine.runRenderLoop(() => {
      const deltaTime = this.engine.getDeltaTime() / 1000; // Convert to seconds

      // Update controls
      this.controls.update(deltaTime);

      // Detect room transitions based on camera position
      const detectedRoom = this.detectCurrentRoom();
      const currentRoomNumber = this.getCurrentRoomNumber();
      if (detectedRoom !== currentRoomNumber) {
        this.enterRoom(detectedRoom, false); // Don't set camera position when walking
      }

      // Update current room
      if (this.currentRoom) {
        this.currentRoom.update(deltaTime);
      }

      // Update interaction manager
      this.interactionManager.update(this.camera);

      // Update performance monitor
      this.performanceMonitor.update();

      // Render
      this.scene.render();
    });

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    this.engine.resize();
  }

  getCamera() {
    return this.camera;
  }

  getScene() {
    return this.scene;
  }

  getEngine() {
    return this.engine;
  }

  getInteractionManager() {
    return this.interactionManager;
  }

  getAudioManager() {
    return this.audioManager;
  }

  getShadowGenerator() {
    return this.shadowGenerator;
  }
}
