import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
import { BaseRoom } from './BaseRoom.js';

export class Room2 extends BaseRoom {
  constructor(scene, interactionManager, audioManager, shadowGenerator) {
    super(scene, interactionManager, audioManager, shadowGenerator);
    this.roomOffset = new BABYLON.Vector3(12, 0, 0); // Wall-by-wall with Room 1
    this.stuckObjects = [];
    this.activeObject = null; // Currently moving object
    this.waitingObjects = []; // Objects waiting to move
    this.returningObjects = []; // Objects returning to original position
    this.returningMode = false; // Whether objects are returning
    this.droppingObjects = []; // Objects that are dropping to ground
    this.playerCamera = null;
    this.playerControls = null;
    this.originalPlayerSpeed = null;
    this.attractionActive = false;
    this.showedStuckMessage = false;
    this.nextObjectDelay = 0; // Timer for next object activation
  }

  async init() {
    // Create minimal room with floating teacups
    this.createRoomStructure();
    await this.createWhimsicalDecor();
    this.createLighting();
  }

  createRoomStructure() {
    // Simple room structure
    // Room 2 has left wall with doorway (shared with Room 1), no right wall (Room 3's left wall serves as shared wall)
    const walls = this.createWalls(12, 3.2, 12, 0xe6e6fa, {
      hasLeftDoorway: true,  // Doorway on left wall (from Room 1)
      hasRightWall: false    // No right wall - open to Room 3
    });
    walls.position = this.roomOffset;
    walls.parent = this.group;

    // Add checkered floor pattern
    this.createCheckeredFloor();
  }

  createDividingWalls() {
    const wallMaterial = new BABYLON.StandardMaterial('wallMat', this.scene);
    wallMaterial.diffuse = BABYLON.Color3.FromHexString('#d8bfd8');
    wallMaterial.roughness = 0.7;

    // Create partial dividing walls for enclosed corridor effect
    const wall1 = BABYLON.MeshBuilder.CreateBox('wall1', { width: 0.3, height: 3.2, depth: 4 }, this.scene);
    wall1.material = wallMaterial;
    wall1.position = new BABYLON.Vector3(-2, 1.6, -4);
    wall1.position.addInPlace(this.roomOffset);
    wall1.parent = this.group;

    const wall2 = wall1.clone('wall2');
    wall2.position = new BABYLON.Vector3(2, 1.6, 4);
    wall2.position.addInPlace(this.roomOffset);
    wall2.parent = this.group;
  }

  createCheckeredFloor() {
    // OPTIMIZED: Use a single plane with a checkerboard texture
    const dynamicTexture = new BABYLON.DynamicTexture('checkeredFloor', 512, this.scene);
    const ctx = dynamicTexture.getContext('2d');

    const tileSize = 512 / 12; // 12 tiles across
    for (let x = 0; x < 12; x++) {
      for (let z = 0; z < 12; z++) {
        const isBlack = (x + z) % 2 === 0;
        ctx.fillStyle = isBlack ? '#2c2c2c' : '#ffffff';
        ctx.fillRect(x * tileSize, z * tileSize, tileSize, tileSize);
      }
    }
    dynamicTexture.update();

    const floorMaterial = new BABYLON.StandardMaterial('floorMat', this.scene);
    floorMaterial.diffuseTexture = dynamicTexture;
    floorMaterial.roughness = 0.7;

    const floor = BABYLON.MeshBuilder.CreatePlane('floor', { width: 12, height: 12 }, this.scene);
    floor.material = floorMaterial;
    floor.rotation.x = -Math.PI / 2;
    floor.position = new BABYLON.Vector3(0, 0.01, 0);
    floor.position.addInPlace(this.roomOffset);
    floor.receiveShadows = true;
    floor.parent = this.group;
  }

  createObstacles() {
    // Low tunnel - must crawl
    this.createLowTunnel();

    // High step - must jump/climb
    this.createHighStep();

    // Narrow door - must squeeze through (easier without burden)
    this.createNarrowDoor();

    // Tilted room section
    this.createTiltedSection();
  }

  createLowTunnel() {
    const tunnel = new BABYLON.TransformNode('tunnel', this.scene);

    // Tunnel walls
    const tunnelMaterial = new BABYLON.StandardMaterial('tunnelMat', this.scene);
    tunnelMaterial.diffuse = BABYLON.Color3.FromHexString('#ff1493');
    tunnelMaterial.roughness = 0.6;
    tunnelMaterial.emissiveColor = BABYLON.Color3.FromHexString('#ff1493');

    // Top
    const top = BABYLON.MeshBuilder.CreateBox('tunnelTop', { width: 3, height: 0.2, depth: 2.5 }, this.scene);
    top.material = tunnelMaterial;
    top.position = new BABYLON.Vector3(0, 0.8, 0);
    top.parent = tunnel;

    // Sides
    const leftSide = BABYLON.MeshBuilder.CreateBox('leftSide', { width: 0.2, height: 0.8, depth: 2.5 }, this.scene);
    leftSide.material = tunnelMaterial;
    leftSide.position = new BABYLON.Vector3(-1.5, 0.4, 0);
    leftSide.parent = tunnel;

    const rightSide = leftSide.clone('rightSide');
    rightSide.position = new BABYLON.Vector3(1.5, 0.4, 0);
    rightSide.parent = tunnel;

    // Sign
    this.createSign(
      'You must go lower to move forward',
      new BABYLON.Vector3(-2, 1.5, -1.5)
    );

    tunnel.position = new BABYLON.Vector3(-3, 0, -3);
    tunnel.position.addInPlace(this.roomOffset);
    tunnel.parent = this.group;
  }

  createHighStep() {
    // Platform you must climb - smaller
    const step = this.createBox(
      3, 1.2, 2.5,
      0x9370db,
      new BABYLON.Vector3(3, 0.6, -2).addInPlace(this.roomOffset)
    );
    step.parent = this.group;

    // Stairs leading up
    for (let i = 0; i < 3; i++) {
      const stair = this.createBox(
        0.8, 0.3 + i * 0.3, 2.5,
        0x8a2be2,
        new BABYLON.Vector3(1.5 - i * 0.8, 0.15 + i * 0.15, -2).addInPlace(this.roomOffset)
      );
      stair.parent = this.group;
    }

    this.createSign(
      'Only the unburdened can climb high',
      new BABYLON.Vector3(2, 2, -3).addInPlace(this.roomOffset)
    );
  }

  createNarrowDoor() {
    // Narrow doorframe
    const frame = new BABYLON.TransformNode('doorFrame', this.scene);

    const frameMaterial = new BABYLON.StandardMaterial('frameMat', this.scene);
    frameMaterial.diffuse = BABYLON.Color3.FromHexString('#ffd700');
    frameMaterial.roughness = 0.5;
    frameMaterial.specularColor = BABYLON.Color3.White().scale(0.6);

    const leftPost = BABYLON.MeshBuilder.CreateBox('leftPost', { width: 0.3, height: 3, depth: 0.3 }, this.scene);
    leftPost.material = frameMaterial;
    leftPost.position = new BABYLON.Vector3(-0.5, 1.5, 0);
    leftPost.parent = frame;

    const rightPost = leftPost.clone('rightPost');
    rightPost.position = new BABYLON.Vector3(0.5, 1.5, 0);
    rightPost.parent = frame;

    const top = BABYLON.MeshBuilder.CreateBox('doorTop', { width: 1, height: 0.3, depth: 0.3 }, this.scene);
    top.material = frameMaterial;
    top.position = new BABYLON.Vector3(0, 2.85, 0);
    top.parent = frame;

    frame.position = new BABYLON.Vector3(0, 0, 3);
    frame.position.addInPlace(this.roomOffset);
    frame.parent = this.group;

    this.createSign(
      'Lighten your load to pass through',
      new BABYLON.Vector3(-2, 2, 4).addInPlace(this.roomOffset)
    );
  }

  createTiltedSection() {
    // Tilted floor section
    const tiltedMaterial = new BABYLON.StandardMaterial('tiltedMat', this.scene);
    tiltedMaterial.diffuse = BABYLON.Color3.FromHexString('#20b2aa');
    tiltedMaterial.roughness = 0.8;

    const tiltedFloor = BABYLON.MeshBuilder.CreatePlane('tiltedFloor', { width: 5, height: 4 }, this.scene);
    tiltedFloor.material = tiltedMaterial;
    tiltedFloor.rotation.x = -Math.PI / 2;
    tiltedFloor.rotation.z = Math.PI / 12; // 15 degrees tilt
    tiltedFloor.position = new BABYLON.Vector3(-7, 0.02, 5);
    tiltedFloor.position.addInPlace(this.roomOffset);
    tiltedFloor.receiveShadows = true;
    tiltedFloor.parent = this.group;
  }

  async createWhimsicalDecor() {
    // Floating teacups
    await this.createTeacups();

    // Floating clocks
    await this.createClocks();
  }

  createPlayingCards() {
    const cardMaterial = new BABYLON.StandardMaterial('cardMat', this.scene);
    cardMaterial.diffuse = BABYLON.Color3.White();
    cardMaterial.roughness = 0.3;
    cardMaterial.backFaceCulling = false;

    const cards = [
      { color: 0xff0000, pos: new BABYLON.Vector3(4, 2, -4) },
      { color: 0x000000, pos: new BABYLON.Vector3(3.5, 2.5, -3) },
      { color: 0xff0000, pos: new BABYLON.Vector3(3, 1.8, -3.5) }
    ];

    cards.forEach((card, index) => {
      const cardMesh = BABYLON.MeshBuilder.CreatePlane(`card${index}`, { width: 0.8, height: 1.2 }, this.scene);
      cardMesh.material = cardMaterial;
      cardMesh.position = card.pos.clone();
      cardMesh.position.addInPlace(this.roomOffset);
      cardMesh.rotation.y = Math.random() * Math.PI;
      cardMesh.parent = this.group;

      // Add colored pattern
      const patternMaterial = new BABYLON.StandardMaterial(`patternMat${index}`, this.scene);
      patternMaterial.diffuse = BABYLON.Color3.FromHexString(card.color.toString(16).padStart(6, '0'));

      const pattern = BABYLON.MeshBuilder.CreateCylinder(`pattern${index}`, { diameter: 0.2, height: 0.01 }, this.scene);
      pattern.material = patternMaterial;
      pattern.position = cardMesh.position.clone();
      pattern.position.z += 0.01;
      pattern.parent = this.group;
    });
  }

  async createTeacups() {
    const positions = [
      new BABYLON.Vector3(-4, 1.5, 0),
      new BABYLON.Vector3(-3, 2, 1.5),
      new BABYLON.Vector3(4, 1.8, 3)
    ];

    if (!this.teacups) this.teacups = [];

    for (let index = 0; index < positions.length; index++) {
      const pos = positions[index];

      try {
        // Load the england tea cup GLB model
        const result = await BABYLON.SceneLoader.ImportMeshAsync(
          '',
          './models/tea_cup/',
          'england_tea_cup.glb',
          this.scene
        );

        // Create a parent transform node for the cup
        const cup = new BABYLON.TransformNode(`cup${index}`, this.scene);

        // Parent all loaded meshes to the cup transform node
        result.meshes.forEach(mesh => {
          mesh.parent = cup;
        });

        // Scale down the cup
        cup.scaling = new BABYLON.Vector3(0.005, 0.005, 0.005);

        // Position the cup
        cup.position = pos.clone();
        cup.position.addInPlace(this.roomOffset);
        cup.parent = this.group;

        // Store for animation
        this.teacups.push({ group: cup, offset: index * Math.PI * 0.66 });
      } catch (error) {
        console.error(`Failed to load teacup model for cup${index}:`, error);
        // Fallback to simple geometry if model fails to load
        this.createSimpleTeacup(pos, index);
      }
    }
  }

  createSimpleTeacup(pos, index) {
    // Fallback simple teacup using primitives
    const cupMaterial = new BABYLON.StandardMaterial('cupMat', this.scene);
    cupMaterial.diffuse = BABYLON.Color3.White();
    cupMaterial.roughness = 0.2;
    cupMaterial.specularColor = BABYLON.Color3.White().scale(0.3);

    const cup = new BABYLON.TransformNode(`cup${index}`, this.scene);

    const cupBody = BABYLON.MeshBuilder.CreateCylinder(`cupBody${index}`, { diameterTop: 0.15, diameterBottom: 0.1, height: 0.25, tessellation: 16 }, this.scene);
    cupBody.material = cupMaterial;
    cupBody.parent = cup;

    const handle = BABYLON.MeshBuilder.CreateTorus(`handle${index}`, { diameter: 0.16, thickness: 0.02, tessellation: 8 }, this.scene);
    handle.material = cupMaterial;
    handle.rotation.y = -Math.PI / 2;
    handle.position = new BABYLON.Vector3(0.15, 0, 0);
    handle.parent = cup;

    cup.position = pos.clone();
    cup.position.addInPlace(this.roomOffset);
    cup.parent = this.group;

    if (!this.teacups) this.teacups = [];
    this.teacups.push({ group: cup, offset: index * Math.PI * 0.66 });
  }

  async createClocks() {
    const positions = [
      new BABYLON.Vector3(-5, 2.8, 4),
      new BABYLON.Vector3(5, 2.8, -1),
      new BABYLON.Vector3(0, 3, 5)
    ];

    if (!this.clocks) this.clocks = [];

    for (let index = 0; index < positions.length; index++) {
      const pos = positions[index];

      try {
        // Load the vintage mantel clock GLB model
        const result = await BABYLON.SceneLoader.ImportMeshAsync(
          '',
          './models/clock/',
          'vintage_mantel_clock.glb',
          this.scene
        );

        // Create a parent transform node for the clock
        const clock = new BABYLON.TransformNode(`clock${index}`, this.scene);

        // Parent all loaded meshes to the clock transform node
        result.meshes.forEach(mesh => {
          mesh.parent = clock;
        });

        // Scale down the clock (adjust as needed)
        clock.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

        // Position the clock
        clock.position = pos.clone();
        clock.position.addInPlace(this.roomOffset);
        clock.parent = this.group;

        // Store for animation
        this.clocks.push({ group: clock, offset: index * Math.PI * 0.5 });
      } catch (error) {
        console.error(`Failed to load clock model for clock${index}:`, error);
        // Fallback to simple geometry if model fails to load
        this.createSimpleClock(pos, index);
      }
    }
  }

  createSimpleClock(pos, index) {
    // Fallback simple clock using primitives
    const faceMaterial = new BABYLON.StandardMaterial('faceMat', this.scene);
    faceMaterial.diffuse = BABYLON.Color3.FromHexString('#f5f5dc');
    faceMaterial.roughness = 0.4;

    const handMaterial = new BABYLON.StandardMaterial('handMat', this.scene);
    handMaterial.diffuse = BABYLON.Color3.Black();

    const clock = new BABYLON.TransformNode(`clock${index}`, this.scene);

    // Clock face
    const face = BABYLON.MeshBuilder.CreateCylinder(`clockFace${index}`, { diameter: 0.4, height: 0.1, tessellation: 32 }, this.scene);
    face.material = faceMaterial;
    face.rotation.z = Math.PI / 2;
    face.parent = clock;

    // Clock hands
    const hourHand = BABYLON.MeshBuilder.CreateBox(`hourHand${index}`, { width: 0.02, height: 0.2, depth: 0.01 }, this.scene);
    hourHand.material = handMaterial;
    hourHand.position = new BABYLON.Vector3(0.06, 0, 0);
    hourHand.rotation.z = (index * Math.PI) / 2;
    hourHand.parent = clock;

    const minuteHand = BABYLON.MeshBuilder.CreateBox(`minuteHand${index}`, { width: 0.02, height: 0.3, depth: 0.01 }, this.scene);
    minuteHand.material = handMaterial;
    minuteHand.position = new BABYLON.Vector3(0.06, 0, 0);
    minuteHand.rotation.z = (index * Math.PI) / 3;
    minuteHand.parent = clock;

    clock.position = pos.clone();
    clock.position.addInPlace(this.roomOffset);
    clock.parent = this.group;

    if (!this.clocks) this.clocks = [];
    this.clocks.push({ group: clock, offset: index * Math.PI * 0.5 });
  }

  createMushrooms() {
    const stemMaterial = new BABYLON.StandardMaterial('stemMat', this.scene);
    stemMaterial.diffuse = BABYLON.Color3.FromHexString('#f5f5dc');

    const capMaterial = new BABYLON.StandardMaterial('capMat', this.scene);
    capMaterial.diffuse = BABYLON.Color3.FromHexString('#ff6347');
    capMaterial.roughness = 0.7;

    const spotMaterial = new BABYLON.StandardMaterial('spotMat', this.scene);
    spotMaterial.diffuse = BABYLON.Color3.White();

    const positions = [
      { pos: new BABYLON.Vector3(3.5, 0, 4), scale: 1 },
      { pos: new BABYLON.Vector3(4, 0, 3.5), scale: 0.7 },
      { pos: new BABYLON.Vector3(3, 0, 3.8), scale: 1.2 }
    ];

    positions.forEach((data, index) => {
      const mushroom = new BABYLON.TransformNode(`mushroom${index}`, this.scene);

      // Stem
      const stem = BABYLON.MeshBuilder.CreateCylinder(`stem${index}`, { diameterTop: 0.1, diameterBottom: 0.12, height: 0.5, tessellation: 16 }, this.scene);
      stem.material = stemMaterial;
      stem.position.y = 0.25;
      stem.parent = mushroom;

      // Cap
      const cap = BABYLON.MeshBuilder.CreateSphere(`cap${index}`, { diameter: 0.5, segments: 16 }, this.scene);
      cap.material = capMaterial;
      cap.position.y = 0.5;
      cap.parent = mushroom;

      // Spots
      for (let i = 0; i < 5; i++) {
        const spot = BABYLON.MeshBuilder.CreateSphere(`spot${index}_${i}`, { diameter: 0.08, segments: 8 }, this.scene);
        spot.material = spotMaterial;
        const angle = (i / 5) * Math.PI * 2;
        spot.position = new BABYLON.Vector3(
          Math.cos(angle) * 0.15,
          0.55,
          Math.sin(angle) * 0.15
        );
        spot.parent = mushroom;
      }

      mushroom.scaling = new BABYLON.Vector3(data.scale, data.scale, data.scale);
      mushroom.position = data.pos.clone();
      mushroom.position.addInPlace(this.roomOffset);
      mushroom.parent = this.group;
    });
  }

  createSign(text, position) {
    // Create a sign with text
    const sign = new BABYLON.TransformNode('sign', this.scene);

    // Sign post
    const post = this.createCylinder(0.05, 0.05, 1.5, 0x8b4513, new BABYLON.Vector3(0, 0.75, 0));
    post.parent = sign;

    // Sign board
    const board = this.createBox(2, 0.5, 0.1, 0xf5deb3, new BABYLON.Vector3(0, 1.8, 0));
    board.parent = sign;

    sign.position = position;
    sign.parent = this.group;

    // Make sign interactive to show text
    this.addInteractiveObject(board, () => {
      const uiManager = window.app?.uiManager;
      if (uiManager) {
        uiManager.showModal('Sign', `<p style="font-size: 1.2rem; text-align: center;">${text}</p>`);
      }
    }, 'Read sign');
  }

  createBurdenSystem() {
    // Create visual burden (backpack)
    const burdenMaterial = new BABYLON.StandardMaterial('burdenMat', this.scene);
    burdenMaterial.diffuse = BABYLON.Color3.FromHexString('#8b4513');
    burdenMaterial.roughness = 0.8;

    this.burdenBag = BABYLON.MeshBuilder.CreateBox('burdenBag', { width: 0.4, height: 0.5, depth: 0.3 }, this.scene);
    this.burdenBag.material = burdenMaterial;
    this.burdenBag.isVisible = false; // Will attach to camera later
    this.burdenBag.parent = this.group;

    // Create "burden drop zone"
    this.createBurdenDropZone();
  }

  createBurdenDropZone() {
    const dropZoneMaterial = new BABYLON.StandardMaterial('dropZoneMat', this.scene);
    dropZoneMaterial.diffuse = BABYLON.Color3.FromHexString('#90ee90');
    dropZoneMaterial.alpha = 0.6;
    dropZoneMaterial.emissiveColor = BABYLON.Color3.FromHexString('#90ee90').scale(0.3);

    const dropZone = BABYLON.MeshBuilder.CreateCylinder('dropZone', { diameter: 3, height: 0.01, tessellation: 32 }, this.scene);
    dropZone.material = dropZoneMaterial;
    dropZone.rotation.x = -Math.PI / 2;
    dropZone.position = new BABYLON.Vector3(0, 0.02, 6);
    dropZone.position.addInPlace(this.roomOffset);
    dropZone.parent = this.group;

    // Add text prompt
    this.addInteractiveObject(dropZone, () => {
      this.dropBurden();
    }, 'Let go of your burden (Press E)');

    this.dropZone = dropZone;
  }

  dropBurden() {
    if (this.hasBurden) {
      this.hasBurden = false;

      const uiManager = window.app?.uiManager;
      if (uiManager) {
        uiManager.createTextInputModal(
          'Letting Go',
          'What burden do you want to leave behind?',
          (text) => {
            console.log('User released burden:', text);

            // Visual feedback - room gets brighter and more colorful
            this.onBurdenDropped();

            uiManager.showModal(
              'Freedom',
              '<p style="font-size: 1.2rem; line-height: 1.8;">You feel lighter. The world seems brighter.</p><p style="margin-top: 15px; color: #666;">Remember: you can choose what to carry.</p>'
            );
          }
        );
      }
    }
  }

  onBurdenDropped() {
    // Change room lighting to be brighter and more playful
    const newLight = new BABYLON.PointLight('burdenLight', new BABYLON.Vector3(0, 4, 0), this.scene);
    newLight.intensity = 3;
    newLight.range = 20;
    newLight.position.addInPlace(this.roomOffset);
    newLight.parent = this.group;

    // Make drop zone disappear
    if (this.dropZone) {
      this.dropZone.isVisible = false;
    }
  }

  createLighting() {
    // Whimsical colored lighting - lowered for lower ceiling
    const lights = [
      { color: '#ff69b4', pos: new BABYLON.Vector3(-5, 3, -5) },
      { color: '#9370db', pos: new BABYLON.Vector3(5, 3, -5) },
      { color: '#20b2aa', pos: new BABYLON.Vector3(-5, 3, 5) },
      { color: '#ffd700', pos: new BABYLON.Vector3(5, 3, 5) }
    ];

    lights.forEach((data, index) => {
      const light = new BABYLON.PointLight(`pointLight${index}`, data.pos.clone(), this.scene);
      light.diffuse = BABYLON.Color3.FromHexString(data.color);
      light.intensity = 1.5;
      light.range = 12;
      light.position.addInPlace(this.roomOffset);
      light.parent = this.group;
    });

    // Ambient light
    const ambient = new BABYLON.HemisphericLight('ambientLight', new BABYLON.Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.4;
    ambient.parent = this.group;
  }

  async onEnter() {
    this.animationTime = 0;
    this.attractionActive = true;
    this.stuckObjects = [];
    this.showedStuckMessage = false;
    this.nextObjectDelay = 2.0; // Start after 2 seconds

    // Get player camera reference
    this.playerCamera = this.scene.activeCamera;

    // Get controls reference for speed modification
    this.playerControls = window.app?.sceneManager?.controls;

    // Store original player speed from controls
    if (this.playerControls && this.playerControls.moveSpeed !== undefined) {
      this.originalPlayerSpeed = this.playerControls.moveSpeed;
    }

    // Initialize waiting objects list (will be populated in update)
    this.waitingObjects = [];
    this.activeObject = null;
  }

  async onExit() {
    // this.audioManager.stop('wonderland-music', 2);

    // Restore player speed
    if (this.playerControls && this.originalPlayerSpeed !== null) {
      this.playerControls.moveSpeed = this.originalPlayerSpeed;
    }

    // Deactivate attraction and reset states
    this.attractionActive = false;
    this.stuckObjects = [];
    this.activeObject = null;
    this.waitingObjects = [];
    this.droppingObjects = [];
    this.nextObjectDelay = 0;
  }

  update(deltaTime) {
    this.animationTime = (this.animationTime || 0) + deltaTime;

    // Combine all floating objects (don't use spread, keep original references)
    const allObjects = [];
    if (this.teacups) {
      this.teacups.forEach(obj => allObjects.push(obj));
    }
    if (this.clocks) {
      this.clocks.forEach(obj => allObjects.push(obj));
    }

    // Store original positions on first update
    if (allObjects.length > 0 && !this.originalPositionsStored) {
      allObjects.forEach(obj => {
        if (!obj.originalPosition) {
          obj.originalPosition = obj.group.position.clone();
        }
      });
      this.originalPositionsStored = true;
    }

    // Handle dropping objects (with gravity)
    if (this.droppingObjects && this.droppingObjects.length > 0) {
      const gravity = 9.8;
      const groundLevel = 0.3; // Slightly above floor

      this.droppingObjects.forEach(obj => {
        if (obj.dropping) {
          // Apply gravity
          obj.dropVelocity += gravity * deltaTime;
          obj.group.position.y -= obj.dropVelocity * deltaTime;

          // Add some rotation as it falls
          obj.group.rotation.x += deltaTime * 2;
          obj.group.rotation.z += deltaTime * 1.5;

          // Check if hit ground
          if (obj.group.position.y <= groundLevel) {
            obj.group.position.y = groundLevel;
            obj.dropping = false;
            obj.dropVelocity = 0;
            console.log('Object hit ground');
          }
        }
      });

      // Remove non-dropping objects from list
      this.droppingObjects = this.droppingObjects.filter(obj => obj.dropping);

      // If there are still dropping objects, don't process other animations
      if (this.droppingObjects.length > 0) {
        return;
      }
    }

    // Handle returning mode (objects returning to original positions)
    if (this.returningMode) {
      const returnSpeed = 2.0;
      let allReturned = true;

      allObjects.forEach(obj => {
        if (this.returningObjects.includes(obj)) {
          const direction = obj.originalPosition.subtract(obj.group.position);
          const distance = direction.length();

          if (distance > 0.1) {
            // Still moving back
            allReturned = false;
            const moveVector = direction.normalize().scale(returnSpeed * deltaTime);
            obj.group.position.addInPlace(moveVector);
            obj.group.rotation.y += deltaTime * 0.5;
          } else {
            // Reached original position
            obj.group.position.copyFrom(obj.originalPosition);
          }
        } else {
          // Non-returning objects just float normally
          obj.group.position.y += Math.sin(this.animationTime * 2 + obj.offset) * 0.3 * deltaTime;
          obj.group.rotation.y += deltaTime * 0.5;
        }
      });

      // If all objects returned, exit returning mode
      if (allReturned) {
        this.returningMode = false;
        this.returningObjects = [];
        console.log('All objects returned to original positions');
      }
      return;
    }

    if (!this.attractionActive || !this.playerCamera) {
      // Normal floating animation when attraction is not active
      allObjects.forEach(obj => {
        obj.group.position.y += Math.sin(this.animationTime * 2 + obj.offset) * 0.3 * deltaTime;
        obj.group.rotation.y += deltaTime * 0.5;
      });
      return;
    }

    // Initialize waiting objects list on first update
    if (this.waitingObjects.length === 0 && allObjects.length > 0) {
      this.waitingObjects = [...allObjects];
      console.log('Initialized waiting objects:', this.waitingObjects.length);
    }

    // Timer for activating next object
    if (this.nextObjectDelay > 0) {
      this.nextObjectDelay -= deltaTime;
    }

    // If delay expired and no active object, activate next one
    if (this.nextObjectDelay <= 0 && !this.activeObject && this.waitingObjects.length > 0) {
      this.activeObject = this.waitingObjects.shift();
      console.log('New object activated! Remaining:', this.waitingObjects.length);
    }

    // Attraction mechanic
    const playerPos = this.playerCamera.position;
    const attractionSpeed = 3.0; // Increased speed for better feel
    const stickDistance = 1.5;

    allObjects.forEach(obj => {
      const isStuck = this.stuckObjects.includes(obj);
      const isActive = obj === this.activeObject;
      const isWaiting = this.waitingObjects.includes(obj);

      if (isStuck) {
        // Stuck objects orbit around the player
        const angle = this.animationTime * 1.5 + obj.offset;
        const radius = 0.8 + this.stuckObjects.indexOf(obj) * 0.3;
        const height = Math.sin(this.animationTime * 2 + obj.offset) * 0.2;

        obj.group.position.x = playerPos.x + Math.cos(angle) * radius;
        obj.group.position.y = playerPos.y + height;
        obj.group.position.z = playerPos.z + Math.sin(angle) * radius;
        obj.group.rotation.y += deltaTime * 2;
      } else if (isActive) {
        // Active object moves towards player
        const direction = playerPos.subtract(obj.group.position);
        const distance = direction.length();

        if (distance < stickDistance) {
          // Object gets stuck
          this.stuckObjects.push(obj);
          this.activeObject = null;
          this.nextObjectDelay = 1.5; // Wait 1.5 seconds before next object
          this.updatePlayerSpeed();
          console.log('Object stuck! Total stuck:', this.stuckObjects.length);
        } else {
          // Move towards player
          const moveVector = direction.normalize().scale(attractionSpeed * deltaTime);
          obj.group.position.addInPlace(moveVector);

          // Add floating animation while moving
          obj.group.position.y += Math.sin(this.animationTime * 2 + obj.offset) * 0.2 * deltaTime;
          obj.group.rotation.y += deltaTime * 0.5;
        }
      } else if (isWaiting) {
        // Waiting objects just float in place
        obj.group.position.y += Math.sin(this.animationTime * 2 + obj.offset) * 0.3 * deltaTime;
        obj.group.rotation.y += deltaTime * 0.5;
      } else {
        // Fallback: normal floating for any untracked objects
        obj.group.position.y += Math.sin(this.animationTime * 2 + obj.offset) * 0.3 * deltaTime;
        obj.group.rotation.y += deltaTime * 0.5;
      }
    });
  }

  updatePlayerSpeed() {
    if (!this.playerControls || this.originalPlayerSpeed === null) return;

    // Each stuck object reduces speed by 25% (more aggressive)
    const speedMultiplier = Math.max(0, 1 - (this.stuckObjects.length * 0.25));

    // Apply to controls moveSpeed (this is what actually controls player movement)
    this.playerControls.moveSpeed = this.originalPlayerSpeed * speedMultiplier;

    // Log for debugging
    console.log(`Stuck objects: ${this.stuckObjects.length}, Speed multiplier: ${speedMultiplier}, Move speed: ${this.playerControls.moveSpeed}`);

    // Show message sequence when player can't move
    if (speedMultiplier === 0) {
      const uiManager = window.app?.uiManager;
      if (uiManager && !this.showedStuckMessage) {
        this.showedStuckMessage = true;

        // First modal
        uiManager.showModal(
          'Overwhelmed',
          '<p style="font-size: 1.1rem; line-height: 1.8;">The objects have completely overwhelmed you. You cannot move.</p>',
          () => {
            // After first modal is closed, show the second modal with action button
            uiManager.showModal(
              'Let Go',
              '<p style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 20px;">You have to let go the burden to move forward.</p><button id="letGoButton" style="padding: 12px 24px; font-size: 1rem; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">I will let go my burden</button>',
              null,
              () => {
                // Button click handler
                const button = document.getElementById('letGoButton');
                if (button) {
                  button.addEventListener('click', () => {
                    this.releaseBurdens();
                    uiManager.hideModal();
                  });
                }
              }
            );
          }
        );
      }
    }
  }

  releaseBurdens() {
    console.log('Releasing all burdens...');

    // Deactivate attraction system permanently
    this.attractionActive = false;

    // Drop all stuck objects to the ground
    this.stuckObjects.forEach(obj => {
      // Store dropping state
      if (!obj.dropping) {
        obj.dropping = true;
        obj.dropVelocity = 0;
      }
    });

    // Move to dropping objects list
    this.droppingObjects = [...this.stuckObjects];
    this.stuckObjects = [];
    this.activeObject = null;
    this.waitingObjects = [];

    // Restore player speed immediately
    if (this.playerControls && this.originalPlayerSpeed !== null) {
      this.playerControls.moveSpeed = this.originalPlayerSpeed;
    }

    // Reset the stuck message flag
    this.showedStuckMessage = false;

    console.log('Burdens released! Player can move again. Objects dropping to ground.');
  }
}