import * as BABYLON from '@babylonjs/core';

export class FirstPersonControls {
  constructor(camera, domElement, scene) {
    this.camera = camera;
    this.domElement = domElement;
    this.scene = scene;

    // Movement - INCREASED: from 5.0 to 10.0 for faster navigation
    this.moveSpeed = 10.0;
    this.velocity = new BABYLON.Vector3();
    this.direction = new BABYLON.Vector3();

    // Keys
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      shift: false
    };

    // Mouse look
    this.rotationX = 0;
    this.rotationY = 0;
    this.lookSpeed = 0.002;
    this.isLocked = false;

    this.init();
  }

  init() {
    // Pointer lock
    this.domElement.addEventListener('click', () => {
      this.domElement.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === this.domElement;
    });

    // Mouse movement
    this.onMouseMoveBound = (e) => this.onMouseMove(e);
    document.addEventListener('mousemove', this.onMouseMoveBound);

    // Keyboard
    this.onKeyDownBound = (e) => this.onKeyDown(e);
    this.onKeyUpBound = (e) => this.onKeyUp(e);
    document.addEventListener('keydown', this.onKeyDownBound);
    document.addEventListener('keyup', this.onKeyUpBound);
  }

  onMouseMove(event) {
    if (!this.isLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    // Update rotation - FIXED: reversed signs for natural camera control
    this.rotationY += movementX * this.lookSpeed; // Move right = look right
    this.rotationX += movementY * this.lookSpeed; // Move down = look down

    // Clamp vertical rotation
    this.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotationX));

    // Apply rotation to camera
    this.camera.rotation.x = this.rotationX;
    this.camera.rotation.y = this.rotationY;
  }

  onKeyDown(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.shift = true;
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.shift = false;
        break;
    }
  }

  update(deltaTime) {
    if (!this.isLocked) return;

    const speed = this.keys.shift ? this.moveSpeed * 2 : this.moveSpeed;

    // Damping
    this.velocity.x -= this.velocity.x * 10.0 * deltaTime;
    this.velocity.z -= this.velocity.z * 10.0 * deltaTime;

    // Movement direction
    this.direction.z = Number(this.keys.forward) - Number(this.keys.backward);
    this.direction.x = Number(this.keys.right) - Number(this.keys.left);
    this.direction.normalize();

    if (this.keys.forward || this.keys.backward) {
      this.velocity.z -= this.direction.z * speed * deltaTime;
    }
    if (this.keys.left || this.keys.right) {
      this.velocity.x -= this.direction.x * speed * deltaTime;
    }

    // Apply movement
    const moveVector = this.velocity.scale(deltaTime);

    // Transform movement to camera space
    const forward = this.camera.getDirection(BABYLON.Axis.Z);
    forward.y = 0;
    forward.normalize();

    const right = this.camera.getDirection(BABYLON.Axis.X);
    right.y = 0;
    right.normalize();

    // Apply movement
    this.camera.position.addInPlace(forward.scale(-moveVector.z));
    this.camera.position.addInPlace(right.scale(-moveVector.x));

    // Keep camera at eye level
    this.camera.position.y = 1.6;
  }

  reset() {
    this.velocity = new BABYLON.Vector3();
    this.rotationX = 0;
    this.rotationY = 0;
    this.camera.rotation.x = 0;
    this.camera.rotation.y = 0;
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      shift: false
    };
  }

  dispose() {
    document.removeEventListener('mousemove', this.onMouseMoveBound);
    document.removeEventListener('keydown', this.onKeyDownBound);
    document.removeEventListener('keyup', this.onKeyUpBound);
  }
}
