import * as BABYLON from '@babylonjs/core';

export class BaseRoom {
  constructor(scene, interactionManager, audioManager, shadowGenerator) {
    this.scene = scene;
    this.interactionManager = interactionManager;
    this.audioManager = audioManager;
    this.shadowGenerator = shadowGenerator;
    this.group = new BABYLON.TransformNode('roomGroup', scene);
    this.group.setEnabled(false);
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
    this.group.setEnabled(true);
  }

  hide() {
    this.group.setEnabled(false);
  }

  // Utility methods
  createWalls(width, height, depth, color = 0xf5f5dc) {
    const wallsGroup = new BABYLON.TransformNode('walls', this.scene);
    wallsGroup.parent = this.group;

    const wallMaterial = new BABYLON.StandardMaterial('wallMaterial', this.scene);
    wallMaterial.diffuseColor = BABYLON.Color3.FromHexString('#' + color.toString(16).padStart(6, '0'));
    wallMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    wallMaterial.backFaceCulling = false; // Make walls visible from both sides

    // Floor - using CreateGround (already faces up)
    const floor = BABYLON.MeshBuilder.CreateGround('floor', {
      width: width,
      height: depth
    }, this.scene);
    floor.parent = wallsGroup;
    floor.position.y = 0;
    floor.receiveShadows = true;

    const floorMaterial = new BABYLON.StandardMaterial('floorMaterial', this.scene);
    floorMaterial.diffuseColor = BABYLON.Color3.FromHexString('#8b7355');
    floorMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    floorMaterial.backFaceCulling = false; // Visible from both sides
    floor.material = floorMaterial;

    // Ceiling - rotate to face down
    const ceiling = BABYLON.MeshBuilder.CreatePlane('ceiling', {
      width: width,
      height: depth
    }, this.scene);
    ceiling.parent = wallsGroup;
    ceiling.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0); // Rotate to face down
    ceiling.position = new BABYLON.Vector3(0, height, 0);
    ceiling.material = wallMaterial.clone('ceilingMaterial');

    // Back wall - default plane faces +Z, rotate to face camera (-Z)
    const backWall = BABYLON.MeshBuilder.CreatePlane('backWall', {
      width: width,
      height: height
    }, this.scene);
    backWall.parent = wallsGroup;
    backWall.rotation = new BABYLON.Vector3(0, Math.PI, 0); // Flip to face forward
    backWall.position = new BABYLON.Vector3(0, height / 2, -depth / 2);
    backWall.receiveShadows = true;
    backWall.material = wallMaterial.clone('backWallMaterial');

    // Front wall (optional, usually has a door)
    const frontWall = BABYLON.MeshBuilder.CreatePlane('frontWall', {
      width: width,
      height: height
    }, this.scene);
    frontWall.parent = wallsGroup;
    frontWall.rotation = new BABYLON.Vector3(0, 0, 0); // Face backward
    frontWall.position = new BABYLON.Vector3(0, height / 2, depth / 2);
    frontWall.receiveShadows = true;
    frontWall.material = wallMaterial.clone('frontWallMaterial');

    // Left wall - rotate to face right
    const leftWall = BABYLON.MeshBuilder.CreatePlane('leftWall', {
      width: depth,
      height: height
    }, this.scene);
    leftWall.parent = wallsGroup;
    leftWall.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0); // Rotate to face right
    leftWall.position = new BABYLON.Vector3(-width / 2, height / 2, 0);
    leftWall.receiveShadows = true;
    leftWall.material = wallMaterial.clone('leftWallMaterial');

    // Right wall - rotate to face left
    const rightWall = BABYLON.MeshBuilder.CreatePlane('rightWall', {
      width: depth,
      height: height
    }, this.scene);
    rightWall.parent = wallsGroup;
    rightWall.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0); // Rotate to face left
    rightWall.position = new BABYLON.Vector3(width / 2, height / 2, 0);
    rightWall.receiveShadows = true;
    rightWall.material = wallMaterial.clone('rightWallMaterial');

    return wallsGroup;
  }

  createBox(width, height, depth, color, position) {
    const box = BABYLON.MeshBuilder.CreateBox('box', {
      width: width,
      height: height,
      depth: depth
    }, this.scene);

    const material = new BABYLON.StandardMaterial('boxMaterial', this.scene);
    material.diffuseColor = BABYLON.Color3.FromHexString('#' + color.toString(16).padStart(6, '0'));
    material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    box.material = material;

    box.position = new BABYLON.Vector3(position.x, position.y, position.z);

    // Add to shadow generator
    if (this.shadowGenerator) {
      this.shadowGenerator.addShadowCaster(box);
    }
    box.receiveShadows = true;

    return box;
  }

  createCylinder(radiusTop, radiusBottom, height, color, position) {
    // OPTIMIZED: Reduced segments from 32 to 12 for better performance
    const cylinder = BABYLON.MeshBuilder.CreateCylinder('cylinder', {
      diameterTop: radiusTop * 2,
      diameterBottom: radiusBottom * 2,
      height: height,
      tessellation: 12
    }, this.scene);

    const material = new BABYLON.StandardMaterial('cylinderMaterial', this.scene);
    material.diffuseColor = BABYLON.Color3.FromHexString('#' + color.toString(16).padStart(6, '0'));
    material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    cylinder.material = material;

    cylinder.position = new BABYLON.Vector3(position.x, position.y, position.z);

    // OPTIMIZED: Only receive shadows, don't cast (small objects don't need to cast)
    cylinder.receiveShadows = true;

    return cylinder;
  }

  createSphere(radius, color, position) {
    // OPTIMIZED: Reduced segments from 32x32 to 16x16
    const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {
      diameter: radius * 2,
      segments: 16
    }, this.scene);

    const material = new BABYLON.StandardMaterial('sphereMaterial', this.scene);
    material.diffuseColor = BABYLON.Color3.FromHexString('#' + color.toString(16).padStart(6, '0'));
    material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    sphere.material = material;

    sphere.position = new BABYLON.Vector3(position.x, position.y, position.z);

    // OPTIMIZED: Only receive shadows
    sphere.receiveShadows = true;

    return sphere;
  }

  addLight(type, color, intensity, position) {
    let light;
    const colorHex = '#' + color.toString(16).padStart(6, '0');
    const babylonColor = BABYLON.Color3.FromHexString(colorHex);

    switch (type) {
      case 'point':
        light = new BABYLON.PointLight('pointLight',
          new BABYLON.Vector3(position.x, position.y, position.z),
          this.scene);
        light.intensity = intensity;
        light.diffuse = babylonColor;
        break;
      case 'spot':
        light = new BABYLON.SpotLight('spotLight',
          new BABYLON.Vector3(position.x, position.y, position.z),
          new BABYLON.Vector3(0, -1, 0), // direction
          Math.PI / 6, // angle
          2, // exponent
          this.scene);
        light.intensity = intensity;
        light.diffuse = babylonColor;
        break;
      case 'ambient':
        // Hemispheric light for ambient
        light = new BABYLON.HemisphericLight('ambientLight',
          new BABYLON.Vector3(0, 1, 0),
          this.scene);
        light.intensity = intensity;
        light.diffuse = babylonColor;
        break;
      default:
        light = new BABYLON.PointLight('defaultLight',
          new BABYLON.Vector3(position.x, position.y, position.z),
          this.scene);
        light.intensity = intensity;
        light.diffuse = babylonColor;
    }

    light.parent = this.group;
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
