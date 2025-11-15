import * as THREE from 'three';
import { BaseRoom } from './BaseRoom.js';

export class Room1 extends BaseRoom {
  constructor(scene, interactionManager, audioManager) {
    super(scene, interactionManager, audioManager);
    this.roomOffset = new THREE.Vector3(0, 0, 0);
  }

  async init() {
    // Create warm, nostalgic childhood home environment
    this.createRoomStructure();
    this.createFurniture();
    this.createLighting();
    this.addInteractions();
  }

  createRoomStructure() {
    // ENCLOSED: Smaller room with lower ceiling for intimate feeling
    const walls = this.createWalls(12, 2.8, 10, 0xf5deb3); // Wheat color, ceiling lowered to 2.8
    walls.position.copy(this.roomOffset);
    this.group.add(walls);

    // Add side partitions for more enclosed feeling
    this.createSidePartitions();

    // Add window with curtains
    this.createWindow();

    // Add door frame
    this.createDoorway();
  }

  createSidePartitions() {
    // Add partial walls/dividers to make room feel more enclosed
    const partitionMaterial = new THREE.MeshStandardMaterial({
      color: 0xe6dcc8,
      roughness: 0.8
    });

    // Left partition
    const leftPartition = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2.8, 4),
      partitionMaterial
    );
    leftPartition.position.set(-3, 1.4, 2).add(this.roomOffset);
    this.group.add(leftPartition);

    // Right partition
    const rightPartition = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2.8, 4),
      partitionMaterial
    );
    rightPartition.position.set(3, 1.4, 2).add(this.roomOffset);
    this.group.add(rightPartition);
  }

  createWindow() {
    // Window frame - adjusted for smaller room
    const windowFrame = this.createBox(
      0.1, 2, 2.5,
      0x8b7355,
      new THREE.Vector3(-5.9, 1.2, 0).add(this.roomOffset)
    );
    this.group.add(windowFrame);

    // Window glass with transparency
    const windowGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(2.3, 1.8),
      new THREE.MeshStandardMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.3,
        roughness: 0.1,
        metalness: 0.9
      })
    );
    windowGlass.rotation.y = Math.PI / 2;
    windowGlass.position.set(-5.85, 1.2, 0).add(this.roomOffset);
    this.group.add(windowGlass);

    // Curtains (using planes with soft material)
    const curtainMaterial = new THREE.MeshStandardMaterial({
      color: 0xfaf0e6,
      roughness: 0.9,
      side: THREE.DoubleSide
    });

    const leftCurtain = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 2),
      curtainMaterial
    );
    leftCurtain.rotation.y = Math.PI / 2;
    leftCurtain.position.set(-5.75, 1.2, -1).add(this.roomOffset);
    this.group.add(leftCurtain);

    const rightCurtain = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 2),
      curtainMaterial
    );
    rightCurtain.rotation.y = Math.PI / 2;
    rightCurtain.position.set(-5.75, 1.2, 1).add(this.roomOffset);
    this.group.add(rightCurtain);

    // Animate curtains gently
    this.curtains = { left: leftCurtain, right: rightCurtain };
  }

  createDoorway() {
    // Door frame on the opposite side - adjusted for smaller room
    const doorFrame = this.createBox(
      0.1, 2.2, 1.2,
      0x8b7355,
      new THREE.Vector3(5.9, 1.1, 3).add(this.roomOffset)
    );
    this.group.add(doorFrame);
  }

  createFurniture() {
    // Wooden dining table - centered and closer
    const tableTop = this.createBox(
      2.5, 0.1, 1.2,
      0x8b4513,
      new THREE.Vector3(0, 0.8, -2).add(this.roomOffset)
    );
    this.group.add(tableTop);

    const tableLeg1 = this.createCylinder(0.05, 0.05, 0.8, 0x654321, new THREE.Vector3(-1.15, 0.4, -2.5).add(this.roomOffset));
    const tableLeg2 = this.createCylinder(0.05, 0.05, 0.8, 0x654321, new THREE.Vector3(-1.15, 0.4, -1.5).add(this.roomOffset));
    const tableLeg3 = this.createCylinder(0.05, 0.05, 0.8, 0x654321, new THREE.Vector3(1.15, 0.4, -2.5).add(this.roomOffset));
    const tableLeg4 = this.createCylinder(0.05, 0.05, 0.8, 0x654321, new THREE.Vector3(1.15, 0.4, -1.5).add(this.roomOffset));
    this.group.add(tableLeg1, tableLeg2, tableLeg3, tableLeg4);

    // Chairs around table - closer together
    this.createChair(new THREE.Vector3(0, 0, -3.2).add(this.roomOffset), 0);
    this.createChair(new THREE.Vector3(-2, 0, -2).add(this.roomOffset), Math.PI / 2);
    this.createChair(new THREE.Vector3(2, 0, -2).add(this.roomOffset), -Math.PI / 2);

    // Old bicycle in corner
    this.createBicycle(new THREE.Vector3(4, 0, -3.5).add(this.roomOffset));

    // Floral plates on table
    this.createPlates();

    // Small cabinet
    this.createCabinet(new THREE.Vector3(4.5, 0, 2).add(this.roomOffset));
  }

  createChair(position, rotation) {
    const chair = new THREE.Group();

    // Seat
    const seat = this.createBox(0.5, 0.05, 0.5, 0x8b4513, new THREE.Vector3(0, 0.5, 0));
    chair.add(seat);

    // Backrest
    const backrest = this.createBox(0.5, 0.6, 0.05, 0x8b4513, new THREE.Vector3(0, 0.8, -0.225));
    chair.add(backrest);

    // Legs
    const leg1 = this.createCylinder(0.03, 0.03, 0.5, 0x654321, new THREE.Vector3(-0.2, 0.25, -0.2));
    const leg2 = this.createCylinder(0.03, 0.03, 0.5, 0x654321, new THREE.Vector3(0.2, 0.25, -0.2));
    const leg3 = this.createCylinder(0.03, 0.03, 0.5, 0x654321, new THREE.Vector3(-0.2, 0.25, 0.2));
    const leg4 = this.createCylinder(0.03, 0.03, 0.5, 0x654321, new THREE.Vector3(0.2, 0.25, 0.2));
    chair.add(leg1, leg2, leg3, leg4);

    chair.position.copy(position);
    chair.rotation.y = rotation;
    this.group.add(chair);

    // Make chair interactive
    this.addInteractiveObject(chair, () => {
      this.onChairInteraction();
    }, 'This is where we sat for dinner');
  }

  createBicycle(position) {
    const bicycle = new THREE.Group();

    // Simplified bicycle representation
    const frame = this.createBox(0.05, 0.8, 1.2, 0xff6347, new THREE.Vector3(0, 0.6, 0));
    bicycle.add(frame);

    // Wheels
    const frontWheel = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.05, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    frontWheel.rotation.y = Math.PI / 2;
    frontWheel.position.set(0, 0.35, -0.6);
    bicycle.add(frontWheel);

    const backWheel = frontWheel.clone();
    backWheel.position.set(0, 0.35, 0.6);
    bicycle.add(backWheel);

    // Handlebars
    const handlebar = this.createCylinder(0.02, 0.02, 0.5, 0x333333, new THREE.Vector3(0, 1, -0.6));
    handlebar.rotation.z = Math.PI / 2;
    bicycle.add(handlebar);

    bicycle.position.copy(position);
    bicycle.rotation.y = Math.PI / 4;
    this.group.add(bicycle);

    // Make bicycle interactive
    this.addInteractiveObject(bicycle, () => {
      this.onBicycleInteraction();
    }, 'This was the bike we learned to ride');
  }

  createPlates() {
    // Floral plates on the table - adjusted for smaller table
    for (let i = 0; i < 3; i++) {
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.02, 16),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.3,
          metalness: 0.1
        })
      );
      plate.position.set(-1 + i * 1, 0.86, -2).add(this.roomOffset);
      this.group.add(plate);

      // Add floral pattern (simplified as colored circles)
      const pattern = new THREE.Mesh(
        new THREE.CircleGeometry(0.08, 16),
        new THREE.MeshStandardMaterial({ color: 0xff69b4 })
      );
      pattern.rotation.x = -Math.PI / 2;
      pattern.position.set(-1 + i * 1, 0.87, -2).add(this.roomOffset);
      this.group.add(pattern);
    }
  }

  createCabinet(position) {
    // Simple cabinet
    const cabinet = this.createBox(1.5, 1.5, 0.5, 0x8b4513, position.clone().add(new THREE.Vector3(0, 0.75, 0)));
    this.group.add(cabinet);

    // Cabinet doors (visual detail)
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 0.02), doorMaterial);
    leftDoor.position.set(position.x - 0.38, position.y + 0.75, position.z + 0.26);
    this.group.add(leftDoor);

    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 0.02), doorMaterial);
    rightDoor.position.set(position.x + 0.38, position.y + 0.75, position.z + 0.26);
    this.group.add(rightDoor);
  }

  createLighting() {
    // Warm golden sunlight through window
    const sunlight = new THREE.PointLight(0xffd700, 2, 10);
    sunlight.position.set(-7, 2.5, 0).add(this.roomOffset);
    sunlight.castShadow = true;
    this.group.add(sunlight);

    // Warm ambient light for nostalgic feel
    const ambientLight = new THREE.AmbientLight(0xfff8dc, 0.6);
    this.group.add(ambientLight);

    // Ceiling lamp - lowered for lower ceiling
    const ceilingLamp = new THREE.PointLight(0xffe4b5, 1.2, 10);
    ceilingLamp.position.set(0, 2.6, 0).add(this.roomOffset);
    this.group.add(ceilingLamp);

    // Lamp shade (visual)
    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.4, 0.5, 16),
      new THREE.MeshStandardMaterial({
        color: 0xfaf0e6,
        emissive: 0xffe4b5,
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide
      })
    );
    lampShade.position.set(0, 2.7, 0).add(this.roomOffset);
    lampShade.rotation.x = Math.PI;
    this.group.add(lampShade);
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
      this.curtains.left.position.x = -9.75 + Math.sin(this.animationTime * 0.5) * 0.05;
      this.curtains.right.position.x = -9.75 + Math.sin(this.animationTime * 0.5 + Math.PI) * 0.05;
    }
  }
}
