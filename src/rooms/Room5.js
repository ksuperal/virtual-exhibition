import * as BABYLON from '@babylonjs/core';
import { BaseRoom } from './BaseRoom.js';

export class Room5 extends BaseRoom {
  constructor(scene, interactionManager, audioManager, shadowGenerator) {
    super(scene, interactionManager, audioManager, shadowGenerator);
    this.roomOffset = new BABYLON.Vector3(55, 0, 0); // Wall-by-wall with Room 4
    this.postcards = [];
    this.communityMessages = [];
  }

  async init() {
    // Warm communal dining space
    this.createRoomStructure();
    this.createDiningTable();
    this.createCommunityWall();
    this.createPostcardStation();
    this.createCozyDecor();
    this.createLighting();
  }

  createRoomStructure() {
    // ENCLOSED: Cozy intimate space with lower ceiling
    // Room 5 has left wall with doorway (shared with Room 4), and right wall (last room)
    const walls = this.createWalls(14, 3, 12, 0xfaf0e6, {
      hasLeftDoorway: true,  // Doorway on left wall (from Room 4)
      hasRightWall: true     // Has right wall (this is the last room)
    });
    walls.position = this.roomOffset;
    walls.parent = this.group;

    // Wooden floor
    const floor = BABYLON.MeshBuilder.CreateGround('floor', {
      width: 14,
      height: 12
    }, this.scene);

    const floorMaterial = new BABYLON.StandardMaterial('floorMaterial', this.scene);
    floorMaterial.diffuseColor = BABYLON.Color3.FromHexString('#d2691e');
    floorMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    floor.material = floorMaterial;

    floor.position = this.roomOffset.clone();
    floor.position.y = 0.01;
    floor.receiveShadows = true;
    floor.parent = this.group;

    // Add room dividers for cozy nooks
    this.createRoomDividers();
  }

  createRoomDividers() {
    const dividerMaterial = new BABYLON.StandardMaterial('dividerMaterial', this.scene);
    dividerMaterial.diffuseColor = BABYLON.Color3.FromHexString('#deb887');
    dividerMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    // Create low divider walls for intimate dining nooks
    const divider1 = BABYLON.MeshBuilder.CreateBox('divider1', {
      width: 6,
      height: 2,
      depth: 0.2
    }, this.scene);
    divider1.material = dividerMaterial;
    divider1.position = new BABYLON.Vector3(0, 1, -3).add(this.roomOffset);
    divider1.parent = this.group;
    if (this.shadowGenerator) {
      this.shadowGenerator.addShadowCaster(divider1);
    }
    divider1.receiveShadows = true;

    // Side dividers
    const sideDivider1 = BABYLON.MeshBuilder.CreateBox('sideDivider1', {
      width: 0.2,
      height: 2,
      depth: 3
    }, this.scene);
    sideDivider1.material = dividerMaterial;
    sideDivider1.position = new BABYLON.Vector3(-5, 1, 3).add(this.roomOffset);
    sideDivider1.parent = this.group;
    if (this.shadowGenerator) {
      this.shadowGenerator.addShadowCaster(sideDivider1);
    }
    sideDivider1.receiveShadows = true;

    const sideDivider2 = BABYLON.MeshBuilder.CreateBox('sideDivider2', {
      width: 0.2,
      height: 2,
      depth: 3
    }, this.scene);
    sideDivider2.material = dividerMaterial;
    sideDivider2.position = new BABYLON.Vector3(5, 1, 3).add(this.roomOffset);
    sideDivider2.parent = this.group;
    if (this.shadowGenerator) {
      this.shadowGenerator.addShadowCaster(sideDivider2);
    }
    sideDivider2.receiveShadows = true;
  }

  createDiningTable() {
    // Shorter wooden dining table for smaller room
    const tableLength = 6;
    const tableWidth = 1.8;
    const tableHeight = 0.8;

    // Table top
    const tableTop = this.createBox(
      tableLength, 0.1, tableWidth,
      0x8b4513,
      new BABYLON.Vector3(0, tableHeight, 0).add(this.roomOffset)
    );
    tableTop.parent = this.group;

    // Table legs
    const legPositions = [
      new BABYLON.Vector3(-tableLength / 2 + 0.5, tableHeight / 2, -tableWidth / 2 + 0.3),
      new BABYLON.Vector3(-tableLength / 2 + 0.5, tableHeight / 2, tableWidth / 2 - 0.3),
      new BABYLON.Vector3(tableLength / 2 - 0.5, tableHeight / 2, -tableWidth / 2 + 0.3),
      new BABYLON.Vector3(tableLength / 2 - 0.5, tableHeight / 2, tableWidth / 2 - 0.3)
    ];

    legPositions.forEach(pos => {
      const leg = this.createCylinder(0.08, 0.08, tableHeight, 0x654321, pos.add(this.roomOffset));
      leg.parent = this.group;
    });

    // Add dining items on table
    this.createTableSettings();
  }

  createTableSettings() {
    // Tea cups, plates, candles
    const itemsCount = 6;
    const spacing = 6 / itemsCount;

    for (let i = 0; i < itemsCount; i++) {
      const x = -2.5 + i * spacing;
      const z = (i % 2 === 0) ? -0.6 : 0.6;

      // Tea cup
      const cup = new BABYLON.TransformNode('cup', this.scene);

      const cupBody = BABYLON.MeshBuilder.CreateCylinder('cupBody', {
        diameterTop: 0.08 * 2,
        diameterBottom: 0.06 * 2,
        height: 0.12,
        tessellation: 16
      }, this.scene);
      const cupMaterial = new BABYLON.StandardMaterial('cupMaterial', this.scene);
      cupMaterial.diffuseColor = BABYLON.Color3.FromHexString('#ffffff');
      cupMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
      cupBody.material = cupMaterial;
      cupBody.parent = cup;

      // Handle
      const handle = BABYLON.MeshBuilder.CreateTorus('handle', {
        diameter: 0.05 * 2,
        thickness: 0.01,
        tessellation: 16
      }, this.scene);
      handle.material = cupMaterial;
      handle.rotation.y = Math.PI / 2;
      handle.position = new BABYLON.Vector3(0.08, 0, 0);
      handle.parent = cup;

      cup.position = new BABYLON.Vector3(x, 0.92, z).add(this.roomOffset);
      cup.parent = this.group;

      // Small plate
      const plate = BABYLON.MeshBuilder.CreateCylinder('plate', {
        diameterTop: 0.12 * 2,
        diameterBottom: 0.12 * 2,
        height: 0.02,
        tessellation: 32
      }, this.scene);
      const plateMaterial = new BABYLON.StandardMaterial('plateMaterial', this.scene);
      plateMaterial.diffuseColor = BABYLON.Color3.FromHexString('#f5f5dc');
      plateMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      plate.material = plateMaterial;
      plate.position = new BABYLON.Vector3(x, 0.86, z - 0.3).add(this.roomOffset);
      plate.parent = this.group;
    }

    // Central candles
    this.createCandles();
  }

  createCandles() {
    const candlePositions = [
      new BABYLON.Vector3(-1, 0.85, 0),
      new BABYLON.Vector3(0, 0.85, 0),
      new BABYLON.Vector3(1, 0.85, 0)
    ];

    candlePositions.forEach(pos => {
      // Candle
      const candle = this.createCylinder(
        0.05, 0.05, 0.3,
        0xfffacd,
        pos.clone().add(new BABYLON.Vector3(0, 0.15, 0)).add(this.roomOffset)
      );
      candle.parent = this.group;

      // Flame (glow)
      const flame = BABYLON.MeshBuilder.CreateSphere('flame', {
        diameter: 0.04 * 2,
        segments: 16
      }, this.scene);
      const flameMaterial = new BABYLON.StandardMaterial('flameMaterial', this.scene);
      flameMaterial.diffuseColor = BABYLON.Color3.FromHexString('#ffa500');
      flameMaterial.emissiveColor = BABYLON.Color3.FromHexString('#ff6600');
      flame.material = flameMaterial;
      flame.position = pos.clone().add(new BABYLON.Vector3(0, 0.35, 0)).add(this.roomOffset);
      flame.parent = this.group;

      // Flame light
      const flameLight = new BABYLON.PointLight('flameLight', flame.position, this.scene);
      flameLight.intensity = 0.8;
      flameLight.range = 5;
      flameLight.diffuse = BABYLON.Color3.FromHexString('#ffa500');
      flameLight.parent = this.group;

      // Store for animation
      if (!this.candles) this.candles = [];
      this.candles.push({
        flame: flame,
        light: flameLight,
        baseY: flame.position.y,
        offset: Math.random() * Math.PI * 2
      });
    });
  }

  createCommunityWall() {
    // Wall covered with messages - adjusted for lower ceiling
    const wallPosition = new BABYLON.Vector3(0, 1.5, -5.9).add(this.roomOffset);

    this.communityWallMesh = BABYLON.MeshBuilder.CreatePlane('communityWall', {
      width: 12,
      height: 2.5
    }, this.scene);

    const wallMaterial = new BABYLON.StandardMaterial('wallMaterial', this.scene);
    wallMaterial.diffuseColor = BABYLON.Color3.FromHexString('#f5deb3');
    wallMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    this.communityWallMesh.material = wallMaterial;

    this.communityWallMesh.position = wallPosition;
    this.communityWallMesh.parent = this.group;

    // Create DynamicTexture for messages
    this.wallTexture = new BABYLON.DynamicTexture('wallTexture', 2048, this.scene);
    this.wallTexture.getContext().canvas.width = 2048;
    this.wallTexture.getContext().canvas.height = 1024;
    this.wallCanvas = this.wallTexture.getContext().canvas;
    this.wallContext = this.wallTexture.getContext();

    wallMaterial.emissiveTexture = this.wallTexture;
    wallMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

    // Add title
    this.drawWallTitle();

    // Create interactive point to add message
    this.addInteractiveObject(this.communityWallMesh, () => {
      this.onWallInteraction();
    }, 'Add your message to the community wall');
  }

  drawWallTitle() {
    const ctx = this.wallContext;

    // Background
    ctx.fillStyle = '#f5deb3';
    ctx.fillRect(0, 0, this.wallCanvas.width, this.wallCanvas.height);

    // Title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('What Does Home Mean to You?', this.wallCanvas.width / 2, 80);

    // Draw existing messages
    this.updateCommunityWall();
  }

  updateCommunityWall() {
    // OPTIMIZED: Debounce updates - only update once per second max
    const now = Date.now();
    if (this.lastWallUpdate && now - this.lastWallUpdate < 1000) {
      this.pendingWallUpdate = true;
      return;
    }
    this.lastWallUpdate = now;
    this.pendingWallUpdate = false;

    const ctx = this.wallContext;

    // Redraw background
    ctx.fillStyle = '#f5deb3';
    ctx.fillRect(0, 0, this.wallCanvas.width, this.wallCanvas.height);

    // Redraw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('What Does Home Mean to You?', this.wallCanvas.width / 2, 80);

    // OPTIMIZED: Limit to most recent 18 messages (3 rows of 6)
    const displayMessages = this.communityMessages.slice(-18);
    displayMessages.forEach((msg, index) => {
      const col = index % 6;
      const row = Math.floor(index / 6);

      const x = 150 + col * 300;
      const y = 180 + row * 200;

      // Note background
      ctx.fillStyle = msg.color || '#ffeb3b';
      ctx.fillRect(x, y, 250, 150);

      // Note text
      ctx.fillStyle = '#333';
      ctx.font = '24px Arial';
      ctx.textAlign = 'left';

      // Word wrap
      const words = msg.text.split(' ');
      let line = '';
      let lineY = y + 30;
      const maxWidth = 230;

      words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line.length > 0) {
          ctx.fillText(line, x + 10, lineY);
          line = word + ' ';
          lineY += 30;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, x + 10, lineY);
    });

    this.wallTexture.update();
  }

  onWallInteraction() {
    const uiManager = window.app?.uiManager;
    if (!uiManager) return;

    uiManager.createTextInputModal(
      'Share Your Meaning of Home',
      'Home is...',
      (text) => {
        if (text) {
          const colors = ['#ffeb3b', '#ff9800', '#4caf50', '#2196f3', '#e91e63', '#9c27b0'];
          this.communityMessages.push({
            text: text,
            color: colors[Math.floor(Math.random() * colors.length)],
            timestamp: Date.now()
          });

          this.updateCommunityWall();

          // Add floating message
          this.createFloatingMessage(text);
        }
      }
    );
  }

  createFloatingMessage(text) {
    // Create constellation point on projection wall using billboard plane
    const billboardTexture = new BABYLON.DynamicTexture('messageTexture', 256, this.scene);
    const ctx = billboardTexture.getContext();

    // Draw star/light
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    billboardTexture.update();

    // Create billboard plane instead of sprite
    const billboard = BABYLON.MeshBuilder.CreatePlane('messageBillboard', {
      width: 0.3,
      height: 0.3
    }, this.scene);

    const billboardMaterial = new BABYLON.StandardMaterial('billboardMaterial', this.scene);
    billboardMaterial.emissiveTexture = billboardTexture;
    billboardMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    billboardMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;
    billboard.material = billboardMaterial;

    billboard.position = new BABYLON.Vector3(
      (Math.random() - 0.5) * 15,
      2 + Math.random() * 2,
      -7 + Math.random() * 2
    ).add(this.roomOffset);

    billboard.parent = this.group;

    // Make billboard face camera always
    billboard.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    // Fade in
    billboardMaterial.alpha = 0;
    const startTime = Date.now();
    const fadeIn = () => {
      const elapsed = Date.now() - startTime;
      billboardMaterial.alpha = Math.min(elapsed / 1000, 1);

      if (elapsed < 1000) {
        requestAnimationFrame(fadeIn);
      }
    };
    fadeIn();
  }

  createPostcardStation() {
    // A small table for writing postcards to future self - closer to center
    const stationTable = this.createBox(
      1.5, 0.8, 1,
      0x8b4513,
      new BABYLON.Vector3(5, 0.4, 4).add(this.roomOffset)
    );
    stationTable.parent = this.group;

    // Postcards stack
    const postcardStack = this.createBox(
      0.3, 0.05, 0.4,
      0xfff8dc,
      new BABYLON.Vector3(5, 0.85, 4).add(this.roomOffset)
    );
    postcardStack.parent = this.group;

    // Pen
    const pen = this.createCylinder(
      0.01, 0.01, 0.15,
      0x4169e1,
      new BABYLON.Vector3(5.3, 0.85, 4).add(this.roomOffset)
    );
    pen.rotation.z = Math.PI / 2;
    pen.parent = this.group;

    // Sign
    this.createTableSign(
      'Write a postcard to your future self',
      new BABYLON.Vector3(5, 1.3, 3.5).add(this.roomOffset)
    );

    // Make interactive
    this.addInteractiveObject(postcardStack, () => {
      this.onPostcardInteraction();
    }, 'Write a postcard to your future self');
  }

  createTableSign(text, position) {
    const signBoard = this.createBox(1.2, 0.3, 0.05, 0xf5deb3, position);
    signBoard.parent = this.group;
  }

  onPostcardInteraction() {
    const uiManager = window.app?.uiManager;
    if (!uiManager) return;

    uiManager.createMultiStepModal('Postcard to Your Future Self', [
      {
        type: 'text',
        content: 'Write a message to yourself one year from now.'
      },
      {
        type: 'input',
        name: 'message',
        placeholder: 'What do you want to remember?',
        multiline: true
      },
      {
        type: 'input',
        name: 'homeDefinition',
        placeholder: 'What will home mean to you next year?',
        multiline: true,
        onComplete: (results) => {
          this.savePostcard(results);
        }
      }
    ]);
  }

  savePostcard(postcardData) {
    // Save to localStorage or backend
    this.postcards.push({
      message: postcardData.message,
      homeDefinition: postcardData.homeDefinition,
      date: new Date().toISOString()
    });

    // Save to localStorage
    localStorage.setItem('postcards', JSON.stringify(this.postcards));

    const uiManager = window.app?.uiManager;
    if (uiManager) {
      uiManager.showModal(
        'Postcard Saved',
        '<p style="font-size: 1.1rem; line-height: 1.8;">Your message has been saved.</p><p style="margin-top: 15px; color: #666;">Visit again in one year to read it.</p>'
      );
    }
  }

  createCozyDecor() {
    // Plants - closer to walls
    this.createPlant(new BABYLON.Vector3(-6, 0, -5).add(this.roomOffset));
    this.createPlant(new BABYLON.Vector3(6, 0, -5).add(this.roomOffset));

    // Warm fabrics/cushions
    this.createCushions();

    // Hanging lights
    this.createHangingLights();
  }

  createPlant(position) {
    // Pot
    const pot = this.createCylinder(0.25, 0.2, 0.3, 0x8b4513, position.clone().add(new BABYLON.Vector3(0, 0.15, 0)));
    pot.parent = this.group;

    // Leaves (simplified)
    for (let i = 0; i < 5; i++) {
      const leaf = BABYLON.MeshBuilder.CreateSphere('leaf', {
        diameter: 0.1 * 2,
        segments: 8
      }, this.scene);
      const leafMaterial = new BABYLON.StandardMaterial('leafMaterial', this.scene);
      leafMaterial.diffuseColor = BABYLON.Color3.FromHexString('#228b22');
      leaf.material = leafMaterial;

      const angle = (i / 5) * Math.PI * 2;
      leaf.position = new BABYLON.Vector3(
        position.x + Math.cos(angle) * 0.15,
        position.y + 0.4 + Math.random() * 0.2,
        position.z + Math.sin(angle) * 0.15
      );
      leaf.parent = this.group;
    }
  }

  createCushions() {
    // Cushions along the sides of the table
    const cushionPositions = [
      new BABYLON.Vector3(-4, 0.2, -2.5),
      new BABYLON.Vector3(-2, 0.2, -2.5),
      new BABYLON.Vector3(2, 0.2, -2.5),
      new BABYLON.Vector3(4, 0.2, -2.5),
      new BABYLON.Vector3(-4, 0.2, 2.5),
      new BABYLON.Vector3(-2, 0.2, 2.5),
      new BABYLON.Vector3(2, 0.2, 2.5),
      new BABYLON.Vector3(4, 0.2, 2.5)
    ];

    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3];

    cushionPositions.forEach((pos, index) => {
      const cushion = this.createBox(
        0.4, 0.2, 0.4,
        colors[index % colors.length],
        pos.clone().add(this.roomOffset)
      );
      cushion.parent = this.group;
    });
  }

  createHangingLights() {
    // String lights across the ceiling
    const lightCount = 8;
    for (let i = 0; i < lightCount; i++) {
      const x = -6 + (i / lightCount) * 12;

      const bulb = this.createSphere(
        0.08,
        0xfff8dc,
        new BABYLON.Vector3(x, 4, 0).add(this.roomOffset)
      );
      bulb.material.emissiveColor = BABYLON.Color3.FromHexString('#ffd700');
      bulb.parent = this.group;

      const light = new BABYLON.PointLight('hangingLight',
        new BABYLON.Vector3(x, 4, 0).add(this.roomOffset),
        this.scene);
      light.intensity = 0.4;
      light.range = 4;
      light.diffuse = BABYLON.Color3.FromHexString('#ffd700');
      light.parent = this.group;
    }
  }

  createLighting() {
    // Warm ambient light
    const ambient = new BABYLON.HemisphericLight('ambientLight',
      new BABYLON.Vector3(0, 1, 0),
      this.scene);
    ambient.intensity = 0.7;
    ambient.diffuse = BABYLON.Color3.FromHexString('#fff8dc');
    ambient.parent = this.group;

    // Main ceiling light (warm) - lowered for lower ceiling
    const mainLight = new BABYLON.PointLight('mainLight',
      new BABYLON.Vector3(0, 2.8, 0).add(this.roomOffset),
      this.scene);
    mainLight.intensity = 1.5;
    mainLight.range = 14;
    mainLight.diffuse = BABYLON.Color3.FromHexString('#ffa500');
    if (this.shadowGenerator) {
      mainLight.shadowEnabled = true;
    }
    mainLight.parent = this.group;

    // Additional warm lights
    const light1 = new BABYLON.PointLight('warmLight1',
      new BABYLON.Vector3(-5, 2.5, -4).add(this.roomOffset),
      this.scene);
    light1.intensity = 0.8;
    light1.range = 10;
    light1.diffuse = BABYLON.Color3.FromHexString('#ffd700');
    light1.parent = this.group;

    const light2 = new BABYLON.PointLight('warmLight2',
      new BABYLON.Vector3(5, 2.5, -4).add(this.roomOffset),
      this.scene);
    light2.intensity = 0.8;
    light2.range = 10;
    light2.diffuse = BABYLON.Color3.FromHexString('#ffd700');
    light2.parent = this.group;
  }

  async onEnter() {
    this.animationTime = 0;

    // Load any saved postcards
    const savedPostcards = localStorage.getItem('postcards');
    if (savedPostcards) {
      this.postcards = JSON.parse(savedPostcards);
    }

    const uiManager = window.app?.uiManager;
    if (uiManager) {
      setTimeout(() => {
        uiManager.showModal(
          'Home We Create',
          '<p style="font-size: 1.1rem; line-height: 1.8;">After the journey through memory, burden, interpretation, and cosmic perspective...</p><p style="margin-top: 15px;">You arrive here—a place of connection.</p><p style="margin-top: 15px; color: #666;">Home is not just where we came from. It\'s what we build, together.</p>'
        );
      }, 1000);
    }
  }

  async onExit() {
    // Final message
    const uiManager = window.app?.uiManager;
    if (uiManager) {
      uiManager.showModal(
        'Thank You',
        '<p style="font-size: 1.2rem; line-height: 2; text-align: center;">Thank you for experiencing this journey.</p><p style="margin-top: 20px; text-align: center; color: #666;">May you carry the meaning of home with you, wherever you go.</p>'
      );
    }
  }

  update(deltaTime) {
    this.animationTime = (this.animationTime || 0) + deltaTime;

    // Flicker candles
    if (this.candles) {
      this.candles.forEach(candle => {
        const flicker = Math.sin(this.animationTime * 10 + candle.offset) * 0.02 + 1;
        candle.flame.position.y = candle.baseY + Math.sin(this.animationTime * 3 + candle.offset) * 0.02;
        candle.light.intensity = 0.8 * flicker;
      });
    }
  }
}
