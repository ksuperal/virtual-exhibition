import * as THREE from 'three';

export class FirstPersonControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Movement - INCREASED: from 5.0 to 10.0 for faster navigation
    this.moveSpeed = 10.0;
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    // Keys
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      shift: false
    };

    // Mouse look
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.lookSpeed = 0.002;
    this.isLocked = false;

    // Raycaster for collision
    this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 2);

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
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));

    // Keyboard
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  onMouseMove(event) {
    if (!this.isLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= movementX * this.lookSpeed;
    this.euler.x -= movementY * this.lookSpeed;

    // Clamp vertical rotation
    this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));

    this.camera.quaternion.setFromEuler(this.euler);
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
    const moveVector = new THREE.Vector3();
    moveVector.copy(this.velocity).multiplyScalar(deltaTime);

    // Transform movement to camera space
    const cameraDirection = new THREE.Vector3();
    this.camera.getWorldDirection(cameraDirection);

    const right = new THREE.Vector3();
    right.crossVectors(cameraDirection, this.camera.up).normalize();

    const forward = new THREE.Vector3();
    forward.copy(cameraDirection);
    forward.y = 0;
    forward.normalize();

    // Apply movement
    this.camera.position.addScaledVector(forward, -moveVector.z);
    this.camera.position.addScaledVector(right, -moveVector.x);

    // Keep camera at eye level
    this.camera.position.y = 1.6;
  }

  reset() {
    this.velocity.set(0, 0, 0);
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      shift: false
    };
  }

  dispose() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
  }
}
