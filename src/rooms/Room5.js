import * as THREE from 'three';
import { BaseRoom } from './BaseRoom.js';

export class Room5 extends BaseRoom {
  constructor(scene, interactionManager, audioManager) {
    super(scene, interactionManager, audioManager);
    this.roomOffset = new THREE.Vector3(120, 0, 0);
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
    const walls = this.createWalls(14, 3, 12, 0xfaf0e6);
    walls.position.copy(this.roomOffset);
    this.group.add(walls);

    // Wooden floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 12),
      new THREE.MeshStandardMaterial({
        color: 0xd2691e,
        roughness: 0.9,
        metalness: 0.1
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.copy(this.roomOffset);
    floor.position.y = 0.01;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Add room dividers for cozy nooks
    this.createRoomDividers();
  }

  createRoomDividers() {
    const dividerMaterial = new THREE.MeshStandardMaterial({
      color: 0xdeb887,
      roughness: 0.8
    });

    // Create low divider walls for intimate dining nooks
    const divider1 = new THREE.Mesh(
      new THREE.BoxGeometry(6, 2, 0.2),
      dividerMaterial
    );
    divider1.position.set(0, 1, -3).add(this.roomOffset);
    this.group.add(divider1);

    // Side dividers
    const sideDivider1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2, 3),
      dividerMaterial
    );
    sideDivider1.position.set(-5, 1, 3).add(this.roomOffset);
    this.group.add(sideDivider1);

    const sideDivider2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2, 3),
      dividerMaterial
    );
    sideDivider2.position.set(5, 1, 3).add(this.roomOffset);
    this.group.add(sideDivider2);
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
      new THREE.Vector3(0, tableHeight, 0).add(this.roomOffset)
    );
    this.group.add(tableTop);

    // Table legs
    const legPositions = [
      new THREE.Vector3(-tableLength / 2 + 0.5, tableHeight / 2, -tableWidth / 2 + 0.3),
      new THREE.Vector3(-tableLength / 2 + 0.5, tableHeight / 2, tableWidth / 2 - 0.3),
      new THREE.Vector3(tableLength / 2 - 0.5, tableHeight / 2, -tableWidth / 2 + 0.3),
      new THREE.Vector3(tableLength / 2 - 0.5, tableHeight / 2, tableWidth / 2 - 0.3)
    ];

    legPositions.forEach(pos => {
      const leg = this.createCylinder(0.08, 0.08, tableHeight, 0x654321, pos.add(this.roomOffset));
      this.group.add(leg);
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
      const cup = new THREE.Group();

      const cupBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.06, 0.12, 16),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.3
        })
      );
      cup.add(cupBody);

      // Handle
      const handleGeometry = new THREE.TorusGeometry(0.05, 0.01, 8, 16, Math.PI);
      const handle = new THREE.Mesh(
        handleGeometry,
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      handle.rotation.y = Math.PI / 2;
      handle.position.set(0.08, 0, 0);
      cup.add(handle);

      cup.position.set(x, 0.92, z).add(this.roomOffset);
      this.group.add(cup);

      // Small plate
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.02, 32),
        new THREE.MeshStandardMaterial({
          color: 0xf5f5dc,
          roughness: 0.4
        })
      );
      plate.position.set(x, 0.86, z - 0.3).add(this.roomOffset);
      this.group.add(plate);
    }

    // Central candles
    this.createCandles();
  }

  createCandles() {
    const candlePositions = [
      new THREE.Vector3(-1, 0.85, 0),
      new THREE.Vector3(0, 0.85, 0),
      new THREE.Vector3(1, 0.85, 0)
    ];

    candlePositions.forEach(pos => {
      // Candle
      const candle = this.createCylinder(
        0.05, 0.05, 0.3,
        0xfffacd,
        pos.clone().add(new THREE.Vector3(0, 0.15, 0)).add(this.roomOffset)
      );
      this.group.add(candle);

      // Flame (glow)
      const flameGeometry = new THREE.SphereGeometry(0.04, 16, 16);
      const flameMaterial = new THREE.MeshStandardMaterial({
        color: 0xffa500,
        emissive: 0xff6600,
        emissiveIntensity: 1
      });
      const flame = new THREE.Mesh(flameGeometry, flameMaterial);
      flame.position.copy(pos).add(new THREE.Vector3(0, 0.35, 0)).add(this.roomOffset);
      this.group.add(flame);

      // Flame light
      const flameLight = new THREE.PointLight(0xffa500, 0.8, 5);
      flameLight.position.copy(flame.position);
      this.group.add(flameLight);

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
    const wallPosition = new THREE.Vector3(0, 1.5, -5.9).add(this.roomOffset);

    this.communityWallMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 2.5),
      new THREE.MeshStandardMaterial({
        color: 0xf5deb3,
        roughness: 0.8
      })
    );
    this.communityWallMesh.position.copy(wallPosition);
    this.group.add(this.communityWallMesh);

    // Create canvas for messages
    this.wallCanvas = document.createElement('canvas');
    this.wallCanvas.width = 2048;
    this.wallCanvas.height = 1024;
    this.wallContext = this.wallCanvas.getContext('2d');

    this.wallTexture = new THREE.CanvasTexture(this.wallCanvas);
    this.communityWallMesh.material.map = this.wallTexture;

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

    this.wallTexture.needsUpdate = true;
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
    // Create constellation point on projection wall
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;

    // Draw star/light
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(
      (Math.random() - 0.5) * 15,
      2 + Math.random() * 2,
      -7 + Math.random() * 2
    ).add(this.roomOffset);

    sprite.scale.set(0.3, 0.3, 1);

    this.group.add(sprite);

    // Fade in
    sprite.material.opacity = 0;
    const startTime = Date.now();
    const fadeIn = () => {
      const elapsed = Date.now() - startTime;
      sprite.material.opacity = Math.min(elapsed / 1000, 1);

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
      new THREE.Vector3(5, 0.4, 4).add(this.roomOffset)
    );
    this.group.add(stationTable);

    // Postcards stack
    const postcardStack = this.createBox(
      0.3, 0.05, 0.4,
      0xfff8dc,
      new THREE.Vector3(5, 0.85, 4).add(this.roomOffset)
    );
    this.group.add(postcardStack);

    // Pen
    const pen = this.createCylinder(
      0.01, 0.01, 0.15,
      0x4169e1,
      new THREE.Vector3(5.3, 0.85, 4).add(this.roomOffset)
    );
    pen.rotation.z = Math.PI / 2;
    this.group.add(pen);

    // Sign
    this.createTableSign(
      'Write a postcard to your future self',
      new THREE.Vector3(5, 1.3, 3.5).add(this.roomOffset)
    );

    // Make interactive
    this.addInteractiveObject(postcardStack, () => {
      this.onPostcardInteraction();
    }, 'Write a postcard to your future self');
  }

  createTableSign(text, position) {
    const signBoard = this.createBox(1.2, 0.3, 0.05, 0xf5deb3, position);
    this.group.add(signBoard);
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
    this.createPlant(new THREE.Vector3(-6, 0, -5).add(this.roomOffset));
    this.createPlant(new THREE.Vector3(6, 0, -5).add(this.roomOffset));

    // Warm fabrics/cushions
    this.createCushions();

    // Hanging lights
    this.createHangingLights();
  }

  createPlant(position) {
    // Pot
    const pot = this.createCylinder(0.25, 0.2, 0.3, 0x8b4513, position.clone().add(new THREE.Vector3(0, 0.15, 0)));
    this.group.add(pot);

    // Leaves (simplified)
    for (let i = 0; i < 5; i++) {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x228b22 })
      );
      const angle = (i / 5) * Math.PI * 2;
      leaf.position.set(
        position.x + Math.cos(angle) * 0.15,
        position.y + 0.4 + Math.random() * 0.2,
        position.z + Math.sin(angle) * 0.15
      );
      this.group.add(leaf);
    }
  }

  createCushions() {
    // Cushions along the sides of the table
    const cushionPositions = [
      new THREE.Vector3(-4, 0.2, -2.5),
      new THREE.Vector3(-2, 0.2, -2.5),
      new THREE.Vector3(2, 0.2, -2.5),
      new THREE.Vector3(4, 0.2, -2.5),
      new THREE.Vector3(-4, 0.2, 2.5),
      new THREE.Vector3(-2, 0.2, 2.5),
      new THREE.Vector3(2, 0.2, 2.5),
      new THREE.Vector3(4, 0.2, 2.5)
    ];

    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3];

    cushionPositions.forEach((pos, index) => {
      const cushion = this.createBox(
        0.4, 0.2, 0.4,
        colors[index % colors.length],
        pos.clone().add(this.roomOffset)
      );
      this.group.add(cushion);
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
        new THREE.Vector3(x, 4, 0).add(this.roomOffset)
      );
      bulb.material.emissive = new THREE.Color(0xffd700);
      bulb.material.emissiveIntensity = 0.5;
      this.group.add(bulb);

      const light = new THREE.PointLight(0xffd700, 0.4, 4);
      light.position.set(x, 4, 0).add(this.roomOffset);
      this.group.add(light);
    }
  }

  createLighting() {
    // Warm ambient light
    const ambient = new THREE.AmbientLight(0xfff8dc, 0.7);
    this.group.add(ambient);

    // Main ceiling light (warm) - lowered for lower ceiling
    const mainLight = new THREE.PointLight(0xffa500, 1.5, 14);
    mainLight.position.set(0, 2.8, 0).add(this.roomOffset);
    mainLight.castShadow = true;
    this.group.add(mainLight);

    // Additional warm lights
    const light1 = new THREE.PointLight(0xffd700, 0.8, 10);
    light1.position.set(-5, 2.5, -4).add(this.roomOffset);
    this.group.add(light1);

    const light2 = new THREE.PointLight(0xffd700, 0.8, 10);
    light2.position.set(5, 2.5, -4).add(this.roomOffset);
    this.group.add(light2);
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
