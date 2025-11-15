import * as THREE from 'three';

export class BaseRoom {
  constructor(scene, interactionManager, audioManager) {
    this.scene = scene;
    this.interactionManager = interactionManager;
    this.audioManager = audioManager;
    this.group = new THREE.Group();
    this.group.visible = false;
    this.scene.add(this.group);
    this.interactiveObjects = [];
  }

  async init() {
    // Override in child classes
  }

  async onEnter() {
    // Override in child classes
    // Called when entering the room
  }

  async onExit() {
    // Override in child classes
    // Called when exiting the room
  }

  update(deltaTime) {
    // Override in child classes
    // Called every frame while in this room
  }

  show() {
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }

  // Utility methods
  createWalls(width, height, depth, color = 0xf5f5dc) {
    const walls = new THREE.Group();

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8,
      metalness: 0.1
    });

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshStandardMaterial({
        color: 0x8b7355,
        roughness: 0.9,
        metalness: 0.1
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    walls.add(floor);

    // Ceiling
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      wallMaterial
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = height;
    walls.add(ceiling);

    // Back wall
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      wallMaterial
    );
    backWall.position.z = -depth / 2;
    backWall.position.y = height / 2;
    backWall.receiveShadow = true;
    walls.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(
      new THREE.PlaneGeometry(depth, height),
      wallMaterial
    );
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.x = -width / 2;
    leftWall.position.y = height / 2;
    leftWall.receiveShadow = true;
    walls.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(
      new THREE.PlaneGeometry(depth, height),
      wallMaterial
    );
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.x = width / 2;
    rightWall.position.y = height / 2;
    rightWall.receiveShadow = true;
    walls.add(rightWall);

    return walls;
  }

  createBox(width, height, depth, color, position) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.2
    });
    const box = new THREE.Mesh(geometry, material);
    box.position.copy(position);
    box.castShadow = true;
    box.receiveShadow = true;
    return box;
  }

  createCylinder(radiusTop, radiusBottom, height, color, position) {
    // OPTIMIZED: Reduced segments from 32 to 12 for better performance
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 12);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.2
    });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.copy(position);
    // OPTIMIZED: Only receive shadows, don't cast (small objects don't need to cast)
    cylinder.castShadow = false;
    cylinder.receiveShadow = true;
    return cylinder;
  }

  createSphere(radius, color, position) {
    // OPTIMIZED: Reduced segments from 32x32 to 16x16
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.5,
      metalness: 0.3
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(position);
    // OPTIMIZED: Only receive shadows
    sphere.castShadow = false;
    sphere.receiveShadow = true;
    return sphere;
  }

  addLight(type, color, intensity, position) {
    let light;
    switch (type) {
      case 'point':
        light = new THREE.PointLight(color, intensity);
        light.castShadow = true;
        break;
      case 'spot':
        light = new THREE.SpotLight(color, intensity);
        light.castShadow = true;
        light.angle = Math.PI / 6;
        light.penumbra = 0.3;
        break;
      case 'ambient':
        light = new THREE.AmbientLight(color, intensity);
        break;
      default:
        light = new THREE.PointLight(color, intensity);
    }

    light.position.copy(position);
    this.group.add(light);
    return light;
  }

  addInteractiveObject(object, callback, promptText = 'Press E to interact') {
    this.interactionManager.addInteractiveObject(object, callback, { promptText });
    this.interactiveObjects.push(object);
  }

  clearInteractions() {
    this.interactiveObjects.forEach(obj => {
      this.interactionManager.removeInteractiveObject(obj);
    });
    this.interactiveObjects = [];
  }
}
