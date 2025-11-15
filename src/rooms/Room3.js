import * as THREE from 'three';
import { BaseRoom } from './BaseRoom.js';

export class Room3 extends BaseRoom {
  constructor(scene, interactionManager, audioManager) {
    super(scene, interactionManager, audioManager);
    this.roomOffset = new THREE.Vector3(60, 0, 0);
    this.selectedGlass = null;
    this.memoryParticles = [];
  }

  async init() {
    // Dark room with spotlights on wine glasses
    this.createRoomStructure();
    this.createWineGlasses();
    this.createPersonalObjects();
    this.createMemoryWall();
    this.createLighting();
  }

  createRoomStructure() {
    // ENCLOSED: Intimate dark room with lower ceiling
    const walls = this.createWalls(14, 3, 12, 0x1a1a1a);
    walls.position.copy(this.roomOffset);
    this.group.add(walls);

    // Dark floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 12),
      new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.9
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.copy(this.roomOffset);
    floor.position.y = 0.01;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Add dark alcoves for enclosed feeling
    this.createAlcoves();
  }

  createAlcoves() {
    const alcoveMaterial = new THREE.MeshStandardMaterial({
      color: 0x0d0d0d,
      roughness: 0.9
    });

    // Create alcove partitions
    const alcove1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 3, 3),
      alcoveMaterial
    );
    alcove1.position.set(-4, 1.5, 0).add(this.roomOffset);
    this.group.add(alcove1);

    const alcove2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 3, 3),
      alcoveMaterial
    );
    alcove2.position.set(4, 1.5, 0).add(this.roomOffset);
    this.group.add(alcove2);
  }

  createWineGlasses() {
    // Central pedestal area with wine glasses - closer together
    this.wineGlasses = [];

    const glassPositions = [
      { pos: new THREE.Vector3(-2, 1, 0), color: 0xff6b6b },
      { pos: new THREE.Vector3(0, 1, 0), color: 0x4ecdc4 },
      { pos: new THREE.Vector3(2, 1, 0), color: 0xffe66d },
      { pos: new THREE.Vector3(-1, 1, -1.5), color: 0x95e1d3 },
      { pos: new THREE.Vector3(1, 1, -1.5), color: 0xf38181 }
    ];

    glassPositions.forEach((data, index) => {
      const glassSetup = this.createWineGlassWithPedestal(
        data.pos.clone().add(this.roomOffset),
        data.color,
        index
      );
      this.wineGlasses.push(glassSetup);
    });
  }

  createWineGlassWithPedestal(position, color, index) {
    const group = new THREE.Group();

    // Pedestal
    const pedestal = this.createCylinder(
      0.3, 0.25, 0.8,
      0x2c2c2c,
      new THREE.Vector3(0, 0.4, 0)
    );
    group.add(pedestal);

    // Wine glass
    const glass = this.createWineGlass(color);
    glass.position.y = 0.8;
    group.add(glass);

    // Spotlight on this glass
    const spotlight = new THREE.SpotLight(0xffffff, 3);
    spotlight.position.set(0, 4, 0);
    spotlight.target = glass;
    spotlight.angle = Math.PI / 8;
    spotlight.penumbra = 0.3;
    spotlight.castShadow = true;
    group.add(spotlight);

    group.position.copy(position);
    this.group.add(group);

    // Make interactive
    this.addInteractiveObject(glass, () => {
      this.onGlassSelected(index);
    }, 'Touch to see different interpretations');

    return { group, glass, spotlight, color, index };
  }

  createWineGlass(liquidColor) {
    const glass = new THREE.Group();

    // Glass stem
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.03, 0.3, 16),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.9
      })
    );
    stem.position.y = 0.15;
    glass.add(stem);

    // Glass base
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.06, 0.05, 16),
      stem.material
    );
    base.position.y = 0.025;
    glass.add(base);

    // Glass bowl
    const bowl = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6),
      stem.material
    );
    bowl.position.y = 0.38;
    glass.add(bowl);

    // Wine liquid inside
    const liquid = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshStandardMaterial({
        color: liquidColor,
        transparent: true,
        opacity: 0.7,
        roughness: 0.2,
        metalness: 0.3
      })
    );
    liquid.position.y = 0.32;
    glass.add(liquid);

    return glass;
  }

  createPersonalObjects() {
    // Objects from "home" scattered around - closer to center
    const objects = [
      { type: 'photo', pos: new THREE.Vector3(-5, 0.5, -4) },
      { type: 'book', pos: new THREE.Vector3(5, 0.5, -4) },
      { type: 'pin', pos: new THREE.Vector3(-5, 0.5, 4) },
      { type: 'letter', pos: new THREE.Vector3(5, 0.5, 4) }
    ];

    objects.forEach(obj => {
      switch (obj.type) {
        case 'photo':
          this.createPhotoFrame(obj.pos.clone().add(this.roomOffset));
          break;
        case 'book':
          this.createBook(obj.pos.clone().add(this.roomOffset));
          break;
        case 'pin':
          this.createPin(obj.pos.clone().add(this.roomOffset));
          break;
        case 'letter':
          this.createLetter(obj.pos.clone().add(this.roomOffset));
          break;
      }
    });
  }

  createPhotoFrame(position) {
    const frame = this.createBox(0.02, 0.4, 0.3, 0x8b7355, position);
    this.group.add(frame);

    const photo = new THREE.Mesh(
      new THREE.PlaneGeometry(0.38, 0.28),
      new THREE.MeshStandardMaterial({ color: 0xf5f5dc })
    );
    photo.position.copy(position);
    photo.position.x += 0.02;
    photo.rotation.y = -Math.PI / 2;
    this.group.add(photo);

    // Soft light on object
    const light = new THREE.PointLight(0xffffcc, 0.5, 3);
    light.position.copy(position);
    light.position.y += 1;
    this.group.add(light);
  }

  createBook(position) {
    const book = this.createBox(0.3, 0.05, 0.4, 0x8b0000, position);
    this.group.add(book);

    const light = new THREE.PointLight(0xffffcc, 0.5, 3);
    light.position.copy(position);
    light.position.y += 1;
    this.group.add(light);
  }

  createPin(position) {
    const pin = this.createCylinder(0.05, 0.02, 0.01, 0xffd700, position);
    this.group.add(pin);

    const light = new THREE.PointLight(0xffffcc, 0.5, 3);
    light.position.copy(position);
    light.position.y += 1;
    this.group.add(light);
  }

  createLetter(position) {
    const letter = new THREE.Mesh(
      new THREE.PlaneGeometry(0.25, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xfffacd })
    );
    letter.rotation.x = -Math.PI / 2;
    letter.position.copy(position);
    this.group.add(letter);

    const light = new THREE.PointLight(0xffffcc, 0.5, 3);
    light.position.copy(position);
    light.position.y += 1;
    this.group.add(light);
  }

  createMemoryWall() {
    // Large wall for projection of memories - adjusted for lower ceiling
    const wallPosition = new THREE.Vector3(0, 1.5, -5.9).add(this.roomOffset);

    this.memoryWallMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 2.5),
      new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        emissive: 0x000000,
        emissiveIntensity: 0
      })
    );
    this.memoryWallMesh.position.copy(wallPosition);
    this.group.add(this.memoryWallMesh);

    // Create canvas for text rendering
    this.memoryCanvas = document.createElement('canvas');
    this.memoryCanvas.width = 2048;
    this.memoryCanvas.height = 1024;
    this.memoryContext = this.memoryCanvas.getContext('2d');

    this.memoryTexture = new THREE.CanvasTexture(this.memoryCanvas);
    this.memoryWallMesh.material.map = this.memoryTexture;
    this.memoryWallMesh.material.emissive = new THREE.Color(0x444444);
    this.memoryWallMesh.material.emissiveIntensity = 0.5;

    this.memories = [];
  }

  onGlassSelected(index) {
    this.selectedGlass = index;

    // Different event interpretations based on glass
    const interpretations = [
      {
        event: 'Coming home late at night',
        views: [
          'Person A: "My parents were always worried about me."',
          'Person B: "I cherished those moments of independence."',
          'Person C: "It reminded me I was loved and cared for."'
        ]
      },
      {
        event: 'Family dinner arguments',
        views: [
          'Person A: "Those fights made me uncomfortable."',
          'Person B: "We were passionate and honest with each other."',
          'Person C: "It taught me how to express my feelings."'
        ]
      },
      {
        event: 'Moving to a new house',
        views: [
          'Person A: "I lost my childhood memories."',
          'Person B: "It was an exciting new chapter."',
          'Person C: "I learned that home is not a place."'
        ]
      },
      {
        event: 'Parent working long hours',
        views: [
          'Person A: "I felt abandoned and lonely."',
          'Person B: "I learned to be independent."',
          'Person C: "I understood sacrifice and love."'
        ]
      },
      {
        event: 'Grandparent visiting',
        views: [
          'Person A: "The house felt crowded."',
          'Person B: "I loved hearing old stories."',
          'Person C: "It connected me to my roots."'
        ]
      }
    ];

    const interpretation = interpretations[index % interpretations.length];

    const uiManager = window.app?.uiManager;
    if (uiManager) {
      let content = `<p style="font-size: 1.2rem; margin-bottom: 20px;"><strong>${interpretation.event}</strong></p>`;
      content += '<div style="line-height: 2;">';
      interpretation.views.forEach(view => {
        content += `<p style="margin: 10px 0; color: #666;">${view}</p>`;
      });
      content += '</div>';
      content += '<br><p style="font-style: italic; color: #999;">The same event, different meanings...</p>';

      uiManager.createMultiStepModal('Your Interpretation', [
        {
          type: 'text',
          content: interpretation.event
        },
        {
          type: 'text',
          content: interpretation.views.join('\n\n')
        },
        {
          type: 'input',
          name: 'memory',
          placeholder: 'What memory or event means something special to you?',
          multiline: true,
          onComplete: (results) => {
            this.addMemoryToWall(results.memory);
          }
        }
      ]);
    }
  }

  addMemoryToWall(memoryText) {
    if (!memoryText) return;

    this.memories.push({
      text: memoryText,
      x: Math.random() * 2048,
      y: Math.random() * 1024,
      alpha: 1,
      createdAt: Date.now()
    });

    this.needsTextureUpdate = true; // Flag for update
    this.updateMemoryWall();

    // Create floating particle
    this.createMemoryParticle(memoryText);
  }

  updateMemoryWall() {
    // OPTIMIZED: Only update if there are new memories
    if (!this.needsTextureUpdate) return;

    const ctx = this.memoryContext;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, this.memoryCanvas.width, this.memoryCanvas.height);

    // Draw all memories (limit to most recent 20 for performance)
    const displayMemories = this.memories.slice(-20);
    displayMemories.forEach((memory, index) => {
      ctx.save();
      ctx.globalAlpha = memory.alpha;
      ctx.fillStyle = '#ffffff';
      ctx.font = '32px Arial';
      ctx.textAlign = 'left';

      // Word wrap
      const maxWidth = 400;
      const words = memory.text.split(' ');
      let line = '';
      let y = memory.y;

      words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line.length > 0) {
          ctx.fillText(line, memory.x, y);
          line = word + ' ';
          y += 40;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, memory.x, y);

      ctx.restore();
    });

    this.memoryTexture.needsUpdate = true;
    this.needsTextureUpdate = false; // Reset flag
  }

  createMemoryParticle(text) {
    // Create a floating text sprite
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;

    context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.fillText(text.substring(0, 30) + (text.length > 30 ? '...' : ''), 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);

    sprite.position.set(
      Math.random() * 10 - 5,
      Math.random() * 3 + 1,
      -6
    ).add(this.roomOffset);

    sprite.scale.set(2, 0.5, 1);

    this.group.add(sprite);

    this.memoryParticles.push({
      sprite: sprite,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        Math.random() * 0.1 + 0.05,
        0
      ),
      life: 10
    });
  }

  createLighting() {
    // Very dim ambient
    const ambient = new THREE.AmbientLight(0x222222, 0.2);
    this.group.add(ambient);

    // Spotlights are added with wine glasses
  }

  async onEnter() {
    this.animationTime = 0;

    const uiManager = window.app?.uiManager;
    if (uiManager) {
      setTimeout(() => {
        uiManager.showModal(
          'The Lens of Interpretation',
          '<p style="font-size: 1.1rem; line-height: 1.8;">The same event can taste different to each person.</p><p style="margin-top: 15px;">Like wine in different glasses, our interpretation shapes our experience.</p><p style="margin-top: 15px; color: #666;">Choose a glass and explore how others see the world differently.</p>'
        );
      }, 1000);
    }
  }

  async onExit() {
    // Clean up
  }

  update(deltaTime) {
    this.animationTime = (this.animationTime || 0) + deltaTime;

    // Animate wine glasses slightly
    this.wineGlasses.forEach((glassData, index) => {
      const offset = index * Math.PI * 0.4;
      glassData.glass.rotation.y = Math.sin(this.animationTime * 0.5 + offset) * 0.1;
    });

    // OPTIMIZED: Update memory particles (limit to 50 max for performance)
    if (this.memoryParticles.length > 50) {
      const removed = this.memoryParticles.shift();
      this.group.remove(removed.sprite);
    }

    this.memoryParticles = this.memoryParticles.filter(particle => {
      particle.sprite.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
      particle.life -= deltaTime;

      if (particle.life <= 2) {
        particle.sprite.material.opacity = particle.life / 2;
      }

      if (particle.life <= 0) {
        this.group.remove(particle.sprite);
        return false;
      }

      return true;
    });
  }
}
