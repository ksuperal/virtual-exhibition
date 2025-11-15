import * as THREE from 'three';

export class InteractionManager {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactiveObjects = [];
    this.currentHoveredObject = null;
    this.interactionDistance = 3;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Click/touch for interaction
    document.addEventListener('click', (e) => this.onInteract(e));

    // E key for interaction
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        this.triggerInteraction();
      }
    });
  }

  addInteractiveObject(object, callback, data = {}) {
    object.userData.interactive = true;
    object.userData.callback = callback;
    object.userData.interactionData = data;
    this.interactiveObjects.push(object);
  }

  removeInteractiveObject(object) {
    const index = this.interactiveObjects.indexOf(object);
    if (index > -1) {
      this.interactiveObjects.splice(index, 1);
    }
    object.userData.interactive = false;
    object.userData.callback = null;
  }

  clearInteractions() {
    this.interactiveObjects = [];
    this.currentHoveredObject = null;
  }

  update(camera) {
    // Raycast from center of screen (crosshair position)
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    // Find closest interactive object within range
    let closestInteractive = null;
    for (const intersect of intersects) {
      if (intersect.distance <= this.interactionDistance) {
        // Find the interactive parent
        let obj = intersect.object;
        while (obj && !obj.userData.interactive) {
          obj = obj.parent;
        }
        if (obj && obj.userData.interactive) {
          closestInteractive = obj;
          break;
        }
      }
    }

    // Update hover state
    if (closestInteractive !== this.currentHoveredObject) {
      if (this.currentHoveredObject) {
        this.onHoverExit(this.currentHoveredObject);
      }
      this.currentHoveredObject = closestInteractive;
      if (this.currentHoveredObject) {
        this.onHoverEnter(this.currentHoveredObject);
      }
    }
  }

  onHoverEnter(object) {
    // Show interaction prompt
    const prompt = document.getElementById('interaction-prompt');
    const promptText = document.getElementById('prompt-text');

    if (prompt && promptText) {
      const text = object.userData.interactionData?.promptText || 'Press E to interact';
      promptText.textContent = text;
      prompt.classList.remove('hidden');
    }

    // Optional: Change cursor or highlight object
    if (object.userData.onHover) {
      object.userData.onHover(object, true);
    }
  }

  onHoverExit(object) {
    // Hide interaction prompt
    const prompt = document.getElementById('interaction-prompt');
    if (prompt) {
      prompt.classList.add('hidden');
    }

    // Optional: Reset object appearance
    if (object.userData.onHover) {
      object.userData.onHover(object, false);
    }
  }

  onInteract(event) {
    // Only if pointer is locked (in-game)
    if (document.pointerLockElement) {
      this.triggerInteraction();
    }
  }

  triggerInteraction() {
    if (this.currentHoveredObject && this.currentHoveredObject.userData.callback) {
      this.currentHoveredObject.userData.callback(this.currentHoveredObject);
    }
  }

  getHoveredObject() {
    return this.currentHoveredObject;
  }
}
