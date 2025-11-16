import * as BABYLON from '@babylonjs/core';

export class InteractionManager {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
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
    if (!object.metadata) {
      object.metadata = {};
    }
    object.metadata.interactive = true;
    object.metadata.callback = callback;
    object.metadata.interactionData = data;
    this.interactiveObjects.push(object);
  }

  removeInteractiveObject(object) {
    const index = this.interactiveObjects.indexOf(object);
    if (index > -1) {
      this.interactiveObjects.splice(index, 1);
    }
    if (object.metadata) {
      object.metadata.interactive = false;
      object.metadata.callback = null;
    }
  }

  clearInteractions() {
    this.interactiveObjects = [];
    this.currentHoveredObject = null;
  }

  update(camera) {
    // Create a ray from the camera forward direction (center of screen)
    const forward = camera.getDirection(BABYLON.Axis.Z);
    const ray = new BABYLON.Ray(camera.position, forward, this.interactionDistance);

    // Pick with ray
    const pickInfo = this.scene.pickWithRay(ray, (mesh) => {
      // Check if mesh or any of its parents are interactive
      let current = mesh;
      while (current) {
        if (this.interactiveObjects.includes(current)) {
          return true;
        }
        current = current.parent;
      }
      return false;
    });

    // Find the interactive parent
    let closestInteractive = null;
    if (pickInfo && pickInfo.hit && pickInfo.distance <= this.interactionDistance) {
      let obj = pickInfo.pickedMesh;
      while (obj && (!obj.metadata || !obj.metadata.interactive)) {
        obj = obj.parent;
      }
      if (obj && obj.metadata && obj.metadata.interactive) {
        closestInteractive = obj;
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
      const text = object.metadata?.interactionData?.promptText || 'Press E to interact';
      promptText.textContent = text;
      prompt.classList.remove('hidden');
    }

    // Optional: Change cursor or highlight object
    if (object.metadata?.onHover) {
      object.metadata.onHover(object, true);
    }
  }

  onHoverExit(object) {
    // Hide interaction prompt
    const prompt = document.getElementById('interaction-prompt');
    if (prompt) {
      prompt.classList.add('hidden');
    }

    // Optional: Reset object appearance
    if (object.metadata?.onHover) {
      object.metadata.onHover(object, false);
    }
  }

  onInteract(event) {
    // Only if pointer is locked (in-game)
    if (document.pointerLockElement) {
      this.triggerInteraction();
    }
  }

  triggerInteraction() {
    if (this.currentHoveredObject && this.currentHoveredObject.metadata?.callback) {
      this.currentHoveredObject.metadata.callback(this.currentHoveredObject);
    }
  }

  getHoveredObject() {
    return this.currentHoveredObject;
  }
}
