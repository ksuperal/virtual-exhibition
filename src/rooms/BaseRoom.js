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
  createWalls(width, height, depth, color = 0xf5f5dc, options = {}) {
    const {
      hasLeftDoorway = false,
      hasRightDoorway = false,
      hasLeftWall = true,
      hasRightWall = true,
      doorwayWidth = 2.5,
      doorwayHeight = 2.4
    } = options;

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

    // Left wall - with optional doorway or completely removed
    if (hasLeftWall) {
      if (hasLeftDoorway) {
        this.createWallWithDoorway(wallsGroup, wallMaterial, 'left', depth, height, width, doorwayWidth, doorwayHeight);
      } else {
        const leftWall = BABYLON.MeshBuilder.CreatePlane('leftWall', {
          width: depth,
          height: height
        }, this.scene);
        leftWall.parent = wallsGroup;
        leftWall.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
        leftWall.position = new BABYLON.Vector3(-width / 2, height / 2, 0);
        leftWall.receiveShadows = true;
        leftWall.material = wallMaterial.clone('leftWallMaterial');
      }
    }

    // Right wall - with optional doorway or completely removed
    if (hasRightWall) {
      if (hasRightDoorway) {
        this.createWallWithDoorway(wallsGroup, wallMaterial, 'right', depth, height, width, doorwayWidth, doorwayHeight);
      } else {
        const rightWall = BABYLON.MeshBuilder.CreatePlane('rightWall', {
          width: depth,
          height: height
        }, this.scene);
        rightWall.parent = wallsGroup;
        rightWall.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0);
        rightWall.position = new BABYLON.Vector3(width / 2, height / 2, 0);
        rightWall.receiveShadows = true;
        rightWall.material = wallMaterial.clone('rightWallMaterial');
      }
    }

    return wallsGroup;
  }

  createWallWithDoorway(parent, material, side, wallLength, wallHeight, roomWidth, doorwayWidth, doorwayHeight) {
    // Calculate wall segments around doorway
    const doorwayOffset = 0; // Centered
    const segmentBefore = (wallLength - doorwayWidth) / 2 - doorwayOffset;
    const segmentAfter = (wallLength - doorwayWidth) / 2 + doorwayOffset;
    const xPos = side === 'left' ? -roomWidth / 2 : roomWidth / 2;
    const rotation = side === 'left' ? Math.PI / 2 : -Math.PI / 2;

    // Bottom segment of wall (before doorway)
    if (segmentBefore > 0.1) {
      const wallSegment1 = BABYLON.MeshBuilder.CreatePlane(`${side}WallSegment1`, {
        width: segmentBefore,
        height: wallHeight
      }, this.scene);
      wallSegment1.parent = parent;
      wallSegment1.rotation = new BABYLON.Vector3(0, rotation, 0);
      wallSegment1.position = new BABYLON.Vector3(xPos, wallHeight / 2, -wallLength / 2 + segmentBefore / 2);
      wallSegment1.receiveShadows = true;
      wallSegment1.material = material.clone(`${side}WallSegment1Material`);
    }

    // Top segment of wall (after doorway)
    if (segmentAfter > 0.1) {
      const wallSegment2 = BABYLON.MeshBuilder.CreatePlane(`${side}WallSegment2`, {
        width: segmentAfter,
        height: wallHeight
      }, this.scene);
      wallSegment2.parent = parent;
      wallSegment2.rotation = new BABYLON.Vector3(0, rotation, 0);
      wallSegment2.position = new BABYLON.Vector3(xPos, wallHeight / 2, wallLength / 2 - segmentAfter / 2);
      wallSegment2.receiveShadows = true;
      wallSegment2.material = material.clone(`${side}WallSegment2Material`);
    }

    // Top section above doorway
    const topSection = BABYLON.MeshBuilder.CreatePlane(`${side}WallTop`, {
      width: doorwayWidth,
      height: wallHeight - doorwayHeight
    }, this.scene);
    topSection.parent = parent;
    topSection.rotation = new BABYLON.Vector3(0, rotation, 0);
    topSection.position = new BABYLON.Vector3(
      xPos,
      doorwayHeight + (wallHeight - doorwayHeight) / 2,
      doorwayOffset
    );
    topSection.receiveShadows = true;
    topSection.material = material.clone(`${side}WallTopMaterial`);

    // Doorway frame
    this.createDoorwayFrame(parent, side, xPos, doorwayWidth, doorwayHeight, doorwayOffset, rotation);
  }

  createDoorwayFrame(parent, side, xPos, width, height, zOffset, rotation) {
    const frameMaterial = new BABYLON.StandardMaterial('doorFrameMaterial', this.scene);
    frameMaterial.diffuseColor = BABYLON.Color3.FromHexString('#8b7355');
    frameMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    const frameDepth = 0.15;
    const frameThickness = 0.1;

    // Left frame
    const leftFrame = BABYLON.MeshBuilder.CreateBox(`${side}DoorFrameLeft`, {
      width: frameThickness,
      height: height,
      depth: frameDepth
    }, this.scene);
    leftFrame.parent = parent;
    leftFrame.position = new BABYLON.Vector3(
      xPos + (side === 'left' ? frameDepth / 2 : -frameDepth / 2),
      height / 2,
      zOffset - width / 2 + frameThickness / 2
    );
    leftFrame.material = frameMaterial;
    leftFrame.receiveShadows = true;

    // Right frame
    const rightFrame = BABYLON.MeshBuilder.CreateBox(`${side}DoorFrameRight`, {
      width: frameThickness,
      height: height,
      depth: frameDepth
    }, this.scene);
    rightFrame.parent = parent;
    rightFrame.position = new BABYLON.Vector3(
      xPos + (side === 'left' ? frameDepth / 2 : -frameDepth / 2),
      height / 2,
      zOffset + width / 2 - frameThickness / 2
    );
    rightFrame.material = frameMaterial;
    rightFrame.receiveShadows = true;

    // Top frame
    const topFrame = BABYLON.MeshBuilder.CreateBox(`${side}DoorFrameTop`, {
      width: width,
      height: frameThickness,
      depth: frameDepth
    }, this.scene);
    topFrame.parent = parent;
    topFrame.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
    topFrame.position = new BABYLON.Vector3(
      xPos + (side === 'left' ? frameDepth / 2 : -frameDepth / 2),
      height - frameThickness / 2,
      zOffset
    );
    topFrame.material = frameMaterial;
    topFrame.receiveShadows = true;
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
