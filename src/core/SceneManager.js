import * as THREE from 'three';
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
    this.clock = new THREE.Clock();
    this.currentRoom = null;
    this.rooms = new Map();
    this.performanceMonitor = new PerformanceMonitor();

    this.setupRenderer();
    this.setupScene();
    this.setupCamera();
    this.setupControls();
    this.setupManagers();
    this.setupLights();
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance' // OPTIMIZED: Request high-performance GPU
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // OPTIMIZED: Use basic shadow map for better performance
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap; // Changed from PCFSoftShadowMap

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 1, 50);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.6, 5); // Eye level height
  }

  setupControls() {
    this.controls = new FirstPersonControls(this.camera, this.canvas);
  }

  setupManagers() {
    this.interactionManager = new InteractionManager(this.camera, this.scene);
    this.audioManager = new AudioManager();
  }

  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    // OPTIMIZED: Reduced shadow map size and simplified shadow camera
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.mapSize.width = 1024; // Reduced from 2048
    dirLight.shadow.mapSize.height = 1024; // Reduced from 2048
    this.scene.add(dirLight);
  }

  async loadRooms() {
    // Create all rooms
    this.rooms.set(1, new Room1(this.scene, this.interactionManager, this.audioManager));
    this.rooms.set(2, new Room2(this.scene, this.interactionManager, this.audioManager));
    this.rooms.set(3, new Room3(this.scene, this.interactionManager, this.audioManager));
    this.rooms.set(4, new Room4(this.scene, this.interactionManager, this.audioManager));
    this.rooms.set(5, new Room5(this.scene, this.interactionManager, this.audioManager));

    // Initialize all rooms
    for (const [id, room] of this.rooms) {
      await room.init();
      room.hide(); // Hide all rooms initially
    }
  }

  async enterRoom(roomNumber) {
    // Exit current room
    if (this.currentRoom) {
      await this.currentRoom.onExit();
      this.currentRoom.hide();
    }

    // Enter new room
    const room = this.rooms.get(roomNumber);
    if (room) {
      this.currentRoom = room;
      room.show();
      await room.onEnter();

      // Set camera position for the room
      this.setCameraForRoom(roomNumber);
    }
  }

  setCameraForRoom(roomNumber) {
    // UPDATED: Adjusted starting positions for smaller rooms - start closer to center
    const positions = {
      1: { x: 0, y: 1.6, z: 4 },    // Reduced from z:10 to z:4
      2: { x: 30, y: 1.6, z: 5 },   // Reduced from z:10 to z:5
      3: { x: 60, y: 1.6, z: 5 },   // Reduced from z:10 to z:5
      4: { x: 90, y: 1.6, z: 6 },   // Reduced from z:10 to z:6
      5: { x: 120, y: 1.6, z: 5 }   // Reduced from z:10 to z:5
    };

    const pos = positions[roomNumber];
    if (pos) {
      this.camera.position.set(pos.x, pos.y, pos.z);
      this.controls.reset();
    }
  }

  start() {
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const deltaTime = this.clock.getDelta();

    // Update controls
    this.controls.update(deltaTime);

    // Update current room
    if (this.currentRoom) {
      this.currentRoom.update(deltaTime);
    }

    // Update interaction manager
    this.interactionManager.update(this.camera);

    // Update performance monitor
    this.performanceMonitor.update();

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  getCamera() {
    return this.camera;
  }

  getScene() {
    return this.scene;
  }

  getInteractionManager() {
    return this.interactionManager;
  }

  getAudioManager() {
    return this.audioManager;
  }
}
