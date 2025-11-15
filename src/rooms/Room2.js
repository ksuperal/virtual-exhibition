import * as THREE from 'three';
import { BaseRoom } from './BaseRoom.js';

export class Room2 extends BaseRoom {
  constructor(scene, interactionManager, audioManager) {
    super(scene, interactionManager, audioManager);
    this.roomOffset = new THREE.Vector3(30, 0, 0);
    this.hasBurden = true;
    this.burdenBag = null;
  }

  async init() {
    // Create surreal Alice in Wonderland-inspired environment
    this.createRoomStructure();
    this.createObstacles();
    this.createWhimsicalDecor();
    this.createBurdenSystem();
    this.createLighting();
  }

  createRoomStructure() {
    // ENCLOSED: Smaller, lower ceiling for cozy enclosed feeling
    const walls = this.createWalls(12, 3.2, 12, 0xe6e6fa); // Lavender, lower ceiling
    walls.position.copy(this.roomOffset);
    this.group.add(walls);

    // Add checkered floor pattern
    this.createCheckeredFloor();

    // Add dividing walls for maze-like enclosed feeling
    this.createDividingWalls();
  }

  createDividingWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xd8bfd8,
      roughness: 0.7
    });

    // Create partial dividing walls for enclosed corridor effect
    const wall1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 3.2, 4),
      wallMaterial
    );
    wall1.position.set(-2, 1.6, -4).add(this.roomOffset);
    this.group.add(wall1);

    const wall2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 3.2, 4),
      wallMaterial
    );
    wall2.position.set(2, 1.6, 4).add(this.roomOffset);
    this.group.add(wall2);
  }

  createCheckeredFloor() {
    // OPTIMIZED: Use a single plane with a checkerboard texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const tileSize = 512 / 12; // 12 tiles across
    for (let x = 0; x < 12; x++) {
      for (let z = 0; z < 12; z++) {
        const isBlack = (x + z) % 2 === 0;
        ctx.fillStyle = isBlack ? '#2c2c2c' : '#ffffff';
        ctx.fillRect(x * tileSize, z * tileSize, tileSize, tileSize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.7
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.01, 0).add(this.roomOffset);
    floor.receiveShadow = true;
    this.group.add(floor);
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
    const tunnel = new THREE.Group();

    // Tunnel walls
    const tunnelMaterial = new THREE.MeshStandardMaterial({
      color: 0xff1493,
      roughness: 0.6,
      emissive: 0xff1493,
      emissiveIntensity: 0.1
    });

    // Top
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.2, 2.5),
      tunnelMaterial
    );
    top.position.set(0, 0.8, 0);
    tunnel.add(top);

    // Sides
    const leftSide = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.8, 2.5),
      tunnelMaterial
    );
    leftSide.position.set(-1.5, 0.4, 0);
    tunnel.add(leftSide);

    const rightSide = leftSide.clone();
    rightSide.position.set(1.5, 0.4, 0);
    tunnel.add(rightSide);

    // Sign
    this.createSign(
      'You must go lower to move forward',
      new THREE.Vector3(-2, 1.5, -1.5)
    );

    tunnel.position.set(-3, 0, -3).add(this.roomOffset);
    this.group.add(tunnel);
  }

  createHighStep() {
    // Platform you must climb - smaller
    const step = this.createBox(
      3, 1.2, 2.5,
      0x9370db,
      new THREE.Vector3(3, 0.6, -2).add(this.roomOffset)
    );
    this.group.add(step);

    // Stairs leading up
    for (let i = 0; i < 3; i++) {
      const stair = this.createBox(
        0.8, 0.3 + i * 0.3, 2.5,
        0x8a2be2,
        new THREE.Vector3(1.5 - i * 0.8, 0.15 + i * 0.15, -2).add(this.roomOffset)
      );
      this.group.add(stair);
    }

    this.createSign(
      'Only the unburdened can climb high',
      new THREE.Vector3(2, 2, -3).add(this.roomOffset)
    );
  }

  createNarrowDoor() {
    // Narrow doorframe
    const frame = new THREE.Group();

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.5,
      metalness: 0.6
    });

    const leftPost = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 3, 0.3),
      frameMaterial
    );
    leftPost.position.set(-0.5, 1.5, 0);
    frame.add(leftPost);

    const rightPost = leftPost.clone();
    rightPost.position.set(0.5, 1.5, 0);
    frame.add(rightPost);

    const top = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.3, 0.3),
      frameMaterial
    );
    top.position.set(0, 2.85, 0);
    frame.add(top);

    frame.position.set(0, 0, 3).add(this.roomOffset);
    this.group.add(frame);

    this.createSign(
      'Lighten your load to pass through',
      new THREE.Vector3(-2, 2, 4).add(this.roomOffset)
    );
  }

  createTiltedSection() {
    // Tilted floor section
    const tiltedFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 4),
      new THREE.MeshStandardMaterial({
        color: 0x20b2aa,
        roughness: 0.8
      })
    );
    tiltedFloor.rotation.x = -Math.PI / 2;
    tiltedFloor.rotation.z = Math.PI / 12; // 15 degrees tilt
    tiltedFloor.position.set(-7, 0.02, 5).add(this.roomOffset);
    tiltedFloor.receiveShadow = true;
    this.group.add(tiltedFloor);
  }

  createWhimsicalDecor() {
    // Oversized playing cards
    this.createPlayingCards();

    // Floating teacups
    this.createTeacups();

    // Clocks at different times
    this.createClocks();

    // Mushrooms
    this.createMushrooms();
  }

  createPlayingCards() {
    const cardGeometry = new THREE.PlaneGeometry(0.8, 1.2);
    const cards = [
      { color: 0xff0000, pos: new THREE.Vector3(4, 2, -4) },
      { color: 0x000000, pos: new THREE.Vector3(3.5, 2.5, -3) },
      { color: 0xff0000, pos: new THREE.Vector3(3, 1.8, -3.5) }
    ];

    cards.forEach(card => {
      const cardMesh = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.3,
          side: THREE.DoubleSide
        })
      );
      cardMesh.position.copy(card.pos.add(this.roomOffset));
      cardMesh.rotation.y = Math.random() * Math.PI;
      this.group.add(cardMesh);

      // Add colored pattern
      const pattern = new THREE.Mesh(
        new THREE.CircleGeometry(0.2, 32),
        new THREE.MeshStandardMaterial({ color: card.color })
      );
      pattern.position.copy(cardMesh.position);
      pattern.position.z += 0.01;
      this.group.add(pattern);
    });
  }

  createTeacups() {
    const positions = [
      new THREE.Vector3(-4, 1.5, 0),
      new THREE.Vector3(-3, 2, 1.5),
      new THREE.Vector3(4, 1.8, 3)
    ];

    positions.forEach((pos, index) => {
      const cup = new THREE.Group();

      // Cup body - OPTIMIZED: reduced segments from 32 to 16
      const cupBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.1, 0.25, 16),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.2,
          metalness: 0.3
        })
      );
      cup.add(cupBody);

      // Handle - OPTIMIZED: reduced segments
      const handleGeometry = new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI);
      const handle = new THREE.Mesh(
        handleGeometry,
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      handle.rotation.y = -Math.PI / 2;
      handle.position.set(0.15, 0, 0);
      cup.add(handle);

      cup.position.copy(pos.add(this.roomOffset));
      this.group.add(cup);

      // Store for animation
      if (!this.teacups) this.teacups = [];
      this.teacups.push({ group: cup, offset: index * Math.PI * 0.66 });
    });
  }

  createClocks() {
    const positions = [
      new THREE.Vector3(-5, 2.8, 4),
      new THREE.Vector3(5, 2.8, -1),
      new THREE.Vector3(0, 3, 5)
    ];

    positions.forEach((pos, index) => {
      const clock = new THREE.Group();

      // Clock face
      const face = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32),
        new THREE.MeshStandardMaterial({
          color: 0xf5f5dc,
          roughness: 0.4
        })
      );
      face.rotation.z = Math.PI / 2;
      clock.add(face);

      // Clock hands
      const hourHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.2, 0.01),
        new THREE.MeshStandardMaterial({ color: 0x000000 })
      );
      hourHand.position.set(0.06, 0, 0);
      hourHand.rotation.z = (index * Math.PI) / 2;
      clock.add(hourHand);

      const minuteHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.3, 0.01),
        new THREE.MeshStandardMaterial({ color: 0x000000 })
      );
      minuteHand.position.set(0.06, 0, 0);
      minuteHand.rotation.z = (index * Math.PI) / 3;
      clock.add(minuteHand);

      clock.position.copy(pos.add(this.roomOffset));
      this.group.add(clock);
    });
  }

  createMushrooms() {
    const positions = [
      { pos: new THREE.Vector3(3.5, 0, 4), scale: 1 },
      { pos: new THREE.Vector3(4, 0, 3.5), scale: 0.7 },
      { pos: new THREE.Vector3(3, 0, 3.8), scale: 1.2 }
    ];

    positions.forEach(data => {
      const mushroom = new THREE.Group();

      // Stem
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 0.5, 16),
        new THREE.MeshStandardMaterial({ color: 0xf5f5dc })
      );
      stem.position.y = 0.25;
      mushroom.add(stem);

      // Cap
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({
          color: 0xff6347,
          roughness: 0.7
        })
      );
      cap.position.y = 0.5;
      mushroom.add(cap);

      // Spots
      for (let i = 0; i < 5; i++) {
        const spot = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        const angle = (i / 5) * Math.PI * 2;
        spot.position.set(
          Math.cos(angle) * 0.15,
          0.55,
          Math.sin(angle) * 0.15
        );
        mushroom.add(spot);
      }

      mushroom.scale.multiplyScalar(data.scale);
      mushroom.position.copy(data.pos.add(this.roomOffset));
      this.group.add(mushroom);
    });
  }

  createSign(text, position) {
    // Create a sign with text
    const sign = new THREE.Group();

    // Sign post
    const post = this.createCylinder(0.05, 0.05, 1.5, 0x8b4513, new THREE.Vector3(0, 0.75, 0));
    sign.add(post);

    // Sign board
    const board = this.createBox(2, 0.5, 0.1, 0xf5deb3, new THREE.Vector3(0, 1.8, 0));
    sign.add(board);

    sign.position.copy(position);
    this.group.add(sign);

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
    const burdenGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.3);
    const burdenMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.8
    });
    this.burdenBag = new THREE.Mesh(burdenGeometry, burdenMaterial);
    this.burdenBag.visible = false; // Will attach to camera later
    this.group.add(this.burdenBag);

    // Create "burden drop zone"
    this.createBurdenDropZone();
  }

  createBurdenDropZone() {
    const dropZone = new THREE.Mesh(
      new THREE.CircleGeometry(1.5, 32),
      new THREE.MeshStandardMaterial({
        color: 0x90ee90,
        transparent: true,
        opacity: 0.6,
        emissive: 0x90ee90,
        emissiveIntensity: 0.3
      })
    );
    dropZone.rotation.x = -Math.PI / 2;
    dropZone.position.set(0, 0.02, 6).add(this.roomOffset);
    this.group.add(dropZone);

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
    const newLight = new THREE.PointLight(0xffff00, 3, 20);
    newLight.position.set(0, 4, 0).add(this.roomOffset);
    this.group.add(newLight);

    // Make drop zone disappear
    if (this.dropZone) {
      this.dropZone.visible = false;
    }
  }

  createLighting() {
    // Whimsical colored lighting - lowered for lower ceiling
    const lights = [
      { color: 0xff69b4, pos: new THREE.Vector3(-5, 3, -5) },
      { color: 0x9370db, pos: new THREE.Vector3(5, 3, -5) },
      { color: 0x20b2aa, pos: new THREE.Vector3(-5, 3, 5) },
      { color: 0xffd700, pos: new THREE.Vector3(5, 3, 5) }
    ];

    lights.forEach(data => {
      const light = new THREE.PointLight(data.color, 1.5, 12);
      light.position.copy(data.pos.add(this.roomOffset));
      light.castShadow = true;
      this.group.add(light);
    });

    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.group.add(ambient);
  }

  async onEnter() {
    // Play whimsical music
    // this.audioManager.play('wonderland-music', 2);

    this.animationTime = 0;

    const uiManager = window.app?.uiManager;
    if (uiManager) {
      setTimeout(() => {
        uiManager.showModal(
          'The Journey of Growth',
          '<p style="font-size: 1.1rem; line-height: 1.8;">As we grow up, we accumulate burdens—responsibilities, expectations, worries.</p><p style="margin-top: 15px;">To move forward, sometimes we must let go.</p><p style="margin-top: 15px; color: #666;">Navigate the obstacles and discover what happens when you release what weighs you down.</p>'
        );
      }, 1000);
    }
  }

  async onExit() {
    // this.audioManager.stop('wonderland-music', 2);
  }

  update(deltaTime) {
    this.animationTime = (this.animationTime || 0) + deltaTime;

    // Animate floating teacups
    if (this.teacups) {
      this.teacups.forEach(cup => {
        cup.group.position.y += Math.sin(this.animationTime * 2 + cup.offset) * 0.3 * deltaTime;
        cup.group.rotation.y += deltaTime * 0.5;
      });
    }
  }
}
