import * as BABYLON from '@babylonjs/core';
import { BaseRoom } from './BaseRoom.js';
import '@babylonjs/loaders/glTF';

export class Room1 extends BaseRoom {
  constructor(scene, interactionManager, audioManager, shadowGenerator) {
    super(scene, interactionManager, audioManager, shadowGenerator);
    this.roomOffset = new BABYLON.Vector3(0, 0, 0);
  }

  async init() {
    // Create warm, nostalgic childhood home environment
    this.createRoomStructure();
    await this.createFurniture();
    this.createLighting();
    this.addInteractions();
  }

  createRoomStructure() {
    // ENCLOSED: Smaller room with lower ceiling for intimate feeling
    const walls = this.createWalls(12, 2.8, 10, 0xf5deb3); // Wheat color, ceiling lowered to 2.8
    walls.position = this.roomOffset;
    walls.parent = this.group;

    // Add side partitions for more enclosed feeling
    this.createSidePartitions();

    // Add window with curtains
    this.createWindow();

    // Add door frame
    this.createDoorway();
  }

  createSidePartitions() {
    // Add partial walls/dividers to make room feel more enclosed
    const partitionMaterial = new BABYLON.StandardMaterial('partitionMaterial', this.scene);
    partitionMaterial.diffuseColor = BABYLON.Color3.FromHexString('#e6dcc8');
    partitionMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    // Left partition
    const leftPartition = BABYLON.MeshBuilder.CreateBox('leftPartition', {
      width: 0.2,
      height: 2.8,
      depth: 4
    }, this.scene);
    leftPartition.material = partitionMaterial;
    leftPartition.position = new BABYLON.Vector3(-3, 1.4, 2).add(this.roomOffset);
    leftPartition.parent = this.group;
    if (this.shadowGenerator) {
      this.shadowGenerator.addShadowCaster(leftPartition);
    }
    leftPartition.receiveShadows = true;

    // Right partition
    const rightPartition = BABYLON.MeshBuilder.CreateBox('rightPartition', {
      width: 0.2,
      height: 2.8,
      depth: 4
    }, this.scene);
    rightPartition.material = partitionMaterial;
    rightPartition.position = new BABYLON.Vector3(3, 1.4, 2).add(this.roomOffset);
    rightPartition.parent = this.group;
    if (this.shadowGenerator) {
      this.shadowGenerator.addShadowCaster(rightPartition);
    }
    rightPartition.receiveShadows = true;
  }

  createWindow() {
    // Window frame - adjusted for smaller room
    const windowFrame = this.createBox(
      0.1, 2, 2.5,
      0x8b7355,
      new BABYLON.Vector3(-5.9, 1.2, 0).add(this.roomOffset)
    );
    windowFrame.parent = this.group;

    // Window glass with transparency
    const windowGlass = BABYLON.MeshBuilder.CreatePlane('windowGlass', {
      width: 2.3,
      height: 1.8
    }, this.scene);
    const windowGlassMaterial = new BABYLON.StandardMaterial('windowGlassMaterial', this.scene);
    windowGlassMaterial.diffuseColor = BABYLON.Color3.FromHexString('#87ceeb');
    windowGlassMaterial.alpha = 0.3;
    windowGlassMaterial.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9);
    windowGlass.material = windowGlassMaterial;
    windowGlass.rotation.y = Math.PI / 2;
    windowGlass.position = new BABYLON.Vector3(-5.85, 1.2, 0).add(this.roomOffset);
    windowGlass.parent = this.group;

    // Curtains (using planes with soft material)
    const curtainMaterial = new BABYLON.StandardMaterial('curtainMaterial', this.scene);
    curtainMaterial.diffuseColor = BABYLON.Color3.FromHexString('#faf0e6');
    curtainMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    curtainMaterial.backFaceCulling = false;

    const leftCurtain = BABYLON.MeshBuilder.CreatePlane('leftCurtain', {
      width: 0.6,
      height: 2
    }, this.scene);
    leftCurtain.material = curtainMaterial;
    leftCurtain.rotation.y = Math.PI / 2;
    leftCurtain.position = new BABYLON.Vector3(-5.75, 1.2, -1).add(this.roomOffset);
    leftCurtain.parent = this.group;

    const rightCurtain = BABYLON.MeshBuilder.CreatePlane('rightCurtain', {
      width: 0.6,
      height: 2
    }, this.scene);
    rightCurtain.material = curtainMaterial;
    rightCurtain.rotation.y = Math.PI / 2;
    rightCurtain.position = new BABYLON.Vector3(-5.75, 1.2, 1).add(this.roomOffset);
    rightCurtain.parent = this.group;

    // Animate curtains gently
    this.curtains = { left: leftCurtain, right: rightCurtain };
  }

  createDoorway() {
    // Door frame on the opposite side - adjusted for smaller room
    const doorFrame = this.createBox(
      0.1, 2.2, 1.2,
      0x8b7355,
      new BABYLON.Vector3(5.9, 1.1, 3).add(this.roomOffset)
    );
    doorFrame.parent = this.group;
  }

  // ...existing code...
  async createBicycle(position) {
    try {
      // Load the 3D model from public/models/bike/bike.glb
      const result = await BABYLON.SceneLoader.ImportMeshAsync(
        "",                // load all meshes
        "/models/bike/",   // folder under public
        "bike.glb",        // file name
        this.scene
      );

      const bicycle = result.meshes[0];
      bicycle.name = "bicycle";
      bicycle.position = new BABYLON.Vector3(position.x, position.y + 0.5, position.z);
      bicycle.rotationQuaternion = null
      bicycle.rotation.y = Math.PI / 2;
      bicycle.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
      bicycle.parent = this.group;

      if (this.shadowGenerator) {
        result.meshes.forEach(m => this.shadowGenerator.addShadowCaster(m));
      }
      result.meshes.forEach(m => (m.receiveShadows = true));

      this.addInteractiveObject(
        bicycle,
        () => this.onBicycleInteraction(),
        "This was the bike we learned to ride"
      );

      return bicycle;
    } catch (error) {
      return this.createSimpleBicycle(position);
    }
  }
// ...existing code...
  createSimpleBicycle(position) {
    // Keep your existing code as fallback
    const bicycle = new BABYLON.TransformNode('bicycle', this.scene);

    // Simplified bicycle representation
    const frame = this.createBox(0.05, 0.8, 1.2, 0xff6347, new BABYLON.Vector3(0, 0.6, 0));
    frame.parent = bicycle;

    // Wheels
    const frontWheel = BABYLON.MeshBuilder.CreateTorus('frontWheel', {
      diameter: 0.35 * 2,
      thickness: 0.05,
      tessellation: 16
    }, this.scene);
    const wheelMaterial = new BABYLON.StandardMaterial('wheelMaterial', this.scene);
    wheelMaterial.diffuseColor = BABYLON.Color3.FromHexString('#333333');
    wheelMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    frontWheel.material = wheelMaterial;
    frontWheel.rotation.y = Math.PI / 2;
    frontWheel.position = new BABYLON.Vector3(0, 0.35, -0.6);
    frontWheel.parent = bicycle;

    const backWheel = frontWheel.clone('backWheel');
    backWheel.position = new BABYLON.Vector3(0, 0.35, 0.6);
    backWheel.parent = bicycle;

    // Handlebars
    const handlebar = this.createCylinder(0.02, 0.02, 0.5, 0x333333, new BABYLON.Vector3(0, 1, -0.6));
    handlebar.rotation.z = Math.PI / 2;
    handlebar.parent = bicycle;

    bicycle.position = position;
    bicycle.rotation.y = Math.PI / 4;
    bicycle.parent = this.group;

    // Make bicycle interactive
    this.addInteractiveObject(bicycle, () => {
      this.onBicycleInteraction();
    }, 'This was the bike we learned to ride');

    return bicycle;
  }

  async createFurniture() {
    // Wooden dining table - centered and closer
    const tableTop = this.createBox(
      2.5, 0.1, 1.2,
      0x8b4513,
      new BABYLON.Vector3(0, 0.8, -2).add(this.roomOffset)
    );
    tableTop.parent = this.group;

    const tableLeg1 = this.createCylinder(0.05, 0.05, 0.8, 0x654321, new BABYLON.Vector3(-1.15, 0.4, -2.5).add(this.roomOffset));
    const tableLeg2 = this.createCylinder(0.05, 0.05, 0.8, 0x654321, new BABYLON.Vector3(-1.15, 0.4, -1.5).add(this.roomOffset));
    const tableLeg3 = this.createCylinder(0.05, 0.05, 0.8, 0x654321, new BABYLON.Vector3(1.15, 0.4, -2.5).add(this.roomOffset));
    const tableLeg4 = this.createCylinder(0.05, 0.05, 0.8, 0x654321, new BABYLON.Vector3(1.15, 0.4, -1.5).add(this.roomOffset));
    tableLeg1.parent = this.group;
    tableLeg2.parent = this.group;
    tableLeg3.parent = this.group;
    tableLeg4.parent = this.group;

    // Chairs around table - closer together
    this.createChair(new BABYLON.Vector3(0, 0, -3.2).add(this.roomOffset), 0);
    this.createChair(new BABYLON.Vector3(-2, 0, -2).add(this.roomOffset), Math.PI / 2);
    this.createChair(new BABYLON.Vector3(2, 0, -2).add(this.roomOffset), -Math.PI / 2);

    // Old bicycle in corner - now async
    await this.createBicycle(new BABYLON.Vector3(4, 0, -3.5).add(this.roomOffset));

    // Floral plates on table
    this.createPlates();

    // Small cabinet
    this.createCabinet(new BABYLON.Vector3(4.5, 0, 2).add(this.roomOffset));
  }

  createChair(position, rotation) {
    const chair = new BABYLON.TransformNode('chair', this.scene);

    // Seat
    const seat = this.createBox(0.5, 0.05, 0.5, 0x8b4513, new BABYLON.Vector3(0, 0.5, 0));
    seat.parent = chair;

    // Backrest
    const backrest = this.createBox(0.5, 0.6, 0.05, 0x8b4513, new BABYLON.Vector3(0, 0.8, -0.225));
    backrest.parent = chair;

    // Legs
    const leg1 = this.createCylinder(0.03, 0.03, 0.5, 0x654321, new BABYLON.Vector3(-0.2, 0.25, -0.2));
    const leg2 = this.createCylinder(0.03, 0.03, 0.5, 0x654321, new BABYLON.Vector3(0.2, 0.25, -0.2));
    const leg3 = this.createCylinder(0.03, 0.03, 0.5, 0x654321, new BABYLON.Vector3(-0.2, 0.25, 0.2));
    const leg4 = this.createCylinder(0.03, 0.03, 0.5, 0x654321, new BABYLON.Vector3(0.2, 0.25, 0.2));
    leg1.parent = chair;
    leg2.parent = chair;
    leg3.parent = chair;
    leg4.parent = chair;

    chair.position = position;
    chair.rotation.y = rotation;
    chair.parent = this.group;

    // Make chair interactive
    this.addInteractiveObject(chair, () => {
      this.onChairInteraction();
    }, 'This is where we sat for dinner');
  }

  createPlates() {
    // Floral plates on the table - adjusted for smaller table
    for (let i = 0; i < 3; i++) {
      const plate = BABYLON.MeshBuilder.CreateCylinder('plate', {
        diameterTop: 0.15 * 2,
        diameterBottom: 0.15 * 2,
        height: 0.02,
        tessellation: 16
      }, this.scene);
      const plateMaterial = new BABYLON.StandardMaterial('plateMaterial', this.scene);
      plateMaterial.diffuseColor = BABYLON.Color3.FromHexString('#ffffff');
      plateMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
      plate.material = plateMaterial;
      plate.position = new BABYLON.Vector3(-1 + i * 1, 0.86, -2).add(this.roomOffset);
      plate.parent = this.group;

      // Add floral pattern (simplified as colored circles)
      const pattern = BABYLON.MeshBuilder.CreateCylinder('pattern', {
        diameterTop: 0.08 * 2,
        diameterBottom: 0.08 * 2,
        height: 0.01,
        tessellation: 16
      }, this.scene);
      const patternMaterial = new BABYLON.StandardMaterial('patternMaterial', this.scene);
      patternMaterial.diffuseColor = BABYLON.Color3.FromHexString('#ff69b4');
      pattern.material = patternMaterial;
      pattern.rotation.x = -Math.PI / 2;
      pattern.position = new BABYLON.Vector3(-1 + i * 1, 0.87, -2).add(this.roomOffset);
      pattern.parent = this.group;
    }
  }

  createCabinet(position) {
    // Simple cabinet
    const cabinetPos = new BABYLON.Vector3(position.x, position.y + 0.75, position.z);
    const cabinet = this.createBox(1.5, 1.5, 0.5, 0x8b4513, cabinetPos);
    cabinet.parent = this.group;

    // Cabinet doors (visual detail)
    const doorMaterial = new BABYLON.StandardMaterial('doorMaterial', this.scene);
    doorMaterial.diffuseColor = BABYLON.Color3.FromHexString('#654321');
    doorMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    const leftDoor = BABYLON.MeshBuilder.CreateBox('leftDoor', {
      width: 0.7,
      height: 1.4,
      depth: 0.02
    }, this.scene);
    leftDoor.material = doorMaterial;
    leftDoor.position = new BABYLON.Vector3(position.x - 0.38, position.y + 0.75, position.z + 0.26);
    leftDoor.parent = this.group;

    const rightDoor = BABYLON.MeshBuilder.CreateBox('rightDoor', {
      width: 0.7,
      height: 1.4,
      depth: 0.02
    }, this.scene);
    rightDoor.material = doorMaterial;
    rightDoor.position = new BABYLON.Vector3(position.x + 0.38, position.y + 0.75, position.z + 0.26);
    rightDoor.parent = this.group;
  }

  createLighting() {
    // Warm golden sunlight through window
    const sunlight = new BABYLON.PointLight('sunlight',
      new BABYLON.Vector3(-7, 2.5, 0).add(this.roomOffset),
      this.scene);
    sunlight.intensity = 2;
    sunlight.diffuse = BABYLON.Color3.FromHexString('#ffd700');
    sunlight.parent = this.group;

    // Warm ambient light for nostalgic feel
    const ambientLight = new BABYLON.HemisphericLight('ambientLight',
      new BABYLON.Vector3(0, 1, 0),
      this.scene);
    ambientLight.intensity = 0.6;
    ambientLight.diffuse = BABYLON.Color3.FromHexString('#fff8dc');
    ambientLight.parent = this.group;

    // Ceiling lamp - lowered for lower ceiling
    const ceilingLamp = new BABYLON.PointLight('ceilingLamp',
      new BABYLON.Vector3(0, 2.6, 0).add(this.roomOffset),
      this.scene);
    ceilingLamp.intensity = 1.2;
    ceilingLamp.diffuse = BABYLON.Color3.FromHexString('#ffe4b5');
    ceilingLamp.parent = this.group;

    // Lamp shade (visual)
    const lampShade = BABYLON.MeshBuilder.CreateCylinder('lampShade', {
      diameterTop: 0.4 * 2,
      diameterBottom: 0.5 * 2,
      height: 0.5,
      tessellation: 16
    }, this.scene);
    const lampShadeMaterial = new BABYLON.StandardMaterial('lampShadeMaterial', this.scene);
    lampShadeMaterial.diffuseColor = BABYLON.Color3.FromHexString('#faf0e6');
    lampShadeMaterial.emissiveColor = BABYLON.Color3.FromHexString('#ffe4b5').scale(0.3);
    lampShadeMaterial.backFaceCulling = false;
    lampShade.material = lampShadeMaterial;
    lampShade.position = new BABYLON.Vector3(0, 2.7, 0).add(this.roomOffset);
    lampShade.rotation.x = Math.PI;
    lampShade.parent = this.group;
  }

  addInteractions() {
    // Additional memory trigger points could be added here
  }

  onChairInteraction() {
    // Show memory modal
    const uiManager = window.app?.uiManager;
    if (uiManager) {
      uiManager.showModal(
        'Memory',
        '<p style="font-size: 1.1rem; line-height: 1.8;">This is where we sat for dinner. The smell of warm rice, the sound of clinking dishes, the gentle conversation...</p><p style="margin-top: 15px; color: #666;">These simple moments formed the foundation of who we are.</p>'
      );
    }
  }

  onBicycleInteraction() {
    const uiManager = window.app?.uiManager;
    if (uiManager) {
      uiManager.showModal(
        'Memory',
        '<p style="font-size: 1.1rem; line-height: 1.8;">This was the bike we learned to ride. Scraped knees, wobbly wheels, and the triumph of that first solo ride...</p><p style="margin-top: 15px; color: #666;">Every journey starts with a single pedal.</p>'
      );
    }
  }

  async onEnter() {
    // Play ambient home sounds
    // this.audioManager.play('home-ambience', 2);

    // Start subtle animations
    this.animationTime = 0;
  }

  async onExit() {
    // Fade out sounds
    // this.audioManager.stop('home-ambience', 2);
  }

  update(deltaTime) {
    this.animationTime = (this.animationTime || 0) + deltaTime;

    // Gently sway curtains
    if (this.curtains) {
      this.curtains.left.position.x = -5.75 + Math.sin(this.animationTime * 0.5) * 0.05;
      this.curtains.right.position.x = -5.75 + Math.sin(this.animationTime * 0.5 + Math.PI) * 0.05;
    }
  }
}
