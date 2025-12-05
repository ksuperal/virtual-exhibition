import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
import { BaseRoom } from './BaseRoom.js';

export class Room3 extends BaseRoom {
  constructor(scene, interactionManager, audioManager, shadowGenerator) {
    super(scene, interactionManager, audioManager, shadowGenerator);
    this.roomOffset = new BABYLON.Vector3(25, 0, 0); // Wall-by-wall with Room 2
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
    // Room 3 has left wall with doorway (shared with Room 2), right wall with doorway (to Room 4)
    const walls = this.createWalls(14, 3, 12, 0x1a1a1a, {
      hasLeftDoorway: true,  // Doorway on left wall (from Room 2)
      hasRightDoorway: true  // Doorway on right wall (to Room 4)
    });
    walls.position = this.roomOffset.clone();
    walls.parent = this.group;

    // Apply space wallpaper to right wall only (facing Room 4)
    const spaceWallMaterial = new BABYLON.StandardMaterial('spaceWallMat3', this.scene);
    const spaceTexture = new BABYLON.Texture('./pictures/space.jpg', this.scene);
    spaceWallMaterial.diffuseTexture = spaceTexture;
    spaceWallMaterial.emissiveTexture = spaceTexture;
    spaceWallMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    spaceWallMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

    // Find and apply space texture to right wall only
    walls.getDescendants().forEach(child => {
      if (child.name && (child.name.includes('rightWall') || child.name.includes('Right'))) {
        if (child.material) {
          child.material = spaceWallMaterial;
        }
      }
    });

    // Dark floor
    const floor = BABYLON.MeshBuilder.CreatePlane('darkFloor', {
      width: 14,
      height: 12
    }, this.scene);

    const floorMaterial = new BABYLON.StandardMaterial('darkFloorMaterial', this.scene);
    floorMaterial.diffuseColor = BABYLON.Color3.FromHexString('#0a0a0a');
    floorMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    floor.material = floorMaterial;

    floor.rotation.x = -Math.PI / 2;
    floor.position = this.roomOffset.clone();
    floor.position.y = 0.01;
    floor.receiveShadows = true;
    floor.parent = this.group;

    // Add dark alcoves for enclosed feeling
    this.createAlcoves();
  }

  createAlcoves() {
    const alcoveMaterial = new BABYLON.StandardMaterial('alcoveMaterial', this.scene);
    alcoveMaterial.diffuseColor = BABYLON.Color3.FromHexString('#0d0d0d');
    alcoveMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    // Create alcove partitions
    const alcove1 = BABYLON.MeshBuilder.CreateBox('alcove1', {
      width: 0.3,
      height: 3,
      depth: 3
    }, this.scene);

    alcove1.material = alcoveMaterial;
    alcove1.position = new BABYLON.Vector3(-4 + this.roomOffset.x, 1.5 + this.roomOffset.y, 0 + this.roomOffset.z);
    alcove1.parent = this.group;

    const alcove2 = BABYLON.MeshBuilder.CreateBox('alcove2', {
      width: 0.3,
      height: 3,
      depth: 3
    }, this.scene);

    alcove2.material = alcoveMaterial;
    alcove2.position = new BABYLON.Vector3(4 + this.roomOffset.x, 1.5 + this.roomOffset.y, 0 + this.roomOffset.z);
    alcove2.parent = this.group;
  }

  createWineGlasses() {
    // Central pedestal area with wine glasses - closer together
    this.wineGlasses = [];

    const glassPositions = [
      { pos: new BABYLON.Vector3(-2, 1, 0), color: 0xff6b6b },
      { pos: new BABYLON.Vector3(0, 1, 0), color: 0x4ecdc4 },
      { pos: new BABYLON.Vector3(2, 1, 0), color: 0xffe66d },
      { pos: new BABYLON.Vector3(-1, 1, -1.5), color: 0x95e1d3 },
      { pos: new BABYLON.Vector3(1, 1, -1.5), color: 0xf38181 }
    ];

    glassPositions.forEach((data, index) => {
      const glassSetup = this.createWineGlassWithPedestal(
        data.pos.clone().addInPlace(this.roomOffset),
        data.color,
        index
      );
      this.wineGlasses.push(glassSetup);
    });
  }

  createWineGlassWithPedestal(position, color, index) {
    const group = new BABYLON.TransformNode('glassGroup', this.scene);
    group.parent = this.group;

    // Pedestal
    const pedestal = this.createCylinder(
      0.3, 0.25, 0.8,
      0x2c2c2c,
      new BABYLON.Vector3(0, 0.4, 0)
    );
    pedestal.parent = group;

    // Wine glass
    const glass = this.createWineGlass(color);
    glass.position.y = 0.8;
    glass.parent = group;

    // Spotlight on this glass
    const spotlight = new BABYLON.SpotLight('spotlight',
      new BABYLON.Vector3(0, 4, 0),
      new BABYLON.Vector3(0, -1, 0),
      Math.PI / 4,
      2,
      this.scene
    );
    spotlight.intensity = 3;
    spotlight.diffuse = BABYLON.Color3.White();
    spotlight.parent = group;

    // Configure shadow generation - add mesh children, not the TransformNode
    if (this.shadowGenerator) {
      glass.getChildMeshes().forEach(mesh => {
        this.shadowGenerator.addShadowCaster(mesh);
      });
    }

    group.position = position.clone();
    group.parent = this.group;

    // Make interactive
    this.addInteractiveObject(glass, () => {
      this.onGlassSelected(index);
    }, 'Touch to see different interpretations');

    return { group, glass, spotlight, color, index };
  }

  createWineGlass(liquidColor) {
    // Using simple geometry - 3D models have too complex materials that cause shader errors
    return this.createSimpleWineGlass(liquidColor);
  }

  createSimpleWineGlass(liquidColor) {
    // Simple wine glass using primitives - optimized to avoid shader errors
    const glass = new BABYLON.TransformNode('wineGlass', this.scene);

    // Use StandardMaterial instead of PBRMaterial to avoid shader complexity
    const glassMaterial = new BABYLON.StandardMaterial(`glassMat_${Date.now()}`, this.scene);
    glassMaterial.diffuseColor = BABYLON.Color3.White();
    glassMaterial.alpha = 0.4;
    glassMaterial.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);

    // Glass stem
    const stem = BABYLON.MeshBuilder.CreateCylinder('stem', {
      diameterTop: 0.04,
      diameterBottom: 0.06,
      height: 0.3,
      tessellation: 16
    }, this.scene);

    stem.material = glassMaterial;
    stem.position.y = 0.15;
    stem.parent = glass;

    // Glass base
    const base = BABYLON.MeshBuilder.CreateCylinder('base', {
      diameterTop: 0.16,
      diameterBottom: 0.12,
      height: 0.05,
      tessellation: 16
    }, this.scene);

    base.material = glassMaterial;
    base.position.y = 0.025;
    base.parent = glass;

    // Glass bowl - make it more wine glass shaped
    const bowl = BABYLON.MeshBuilder.CreateCylinder('bowl', {
      diameterTop: 0.22,
      diameterBottom: 0.12,
      height: 0.35,
      tessellation: 32
    }, this.scene);

    bowl.material = glassMaterial;
    bowl.position.y = 0.48;
    bowl.parent = glass;

    // Wine liquid inside
    const liquidMaterial = new BABYLON.StandardMaterial(`liquidMat_${Date.now()}`, this.scene);
    const liquidColorHex = '#' + liquidColor.toString(16).padStart(6, '0');
    liquidMaterial.diffuseColor = BABYLON.Color3.FromHexString(liquidColorHex);
    liquidMaterial.alpha = 0.7;
    liquidMaterial.emissiveColor = BABYLON.Color3.FromHexString(liquidColorHex).scale(0.3);

    const liquid = BABYLON.MeshBuilder.CreateCylinder('liquid', {
      diameterTop: 0.18,
      diameterBottom: 0.1,
      height: 0.25,
      tessellation: 32
    }, this.scene);

    liquid.material = liquidMaterial;
    liquid.position.y = 0.43;
    liquid.parent = glass;

    return glass;
  }

  createPersonalObjects() {
    // Objects from "home" scattered around - closer to center
    const objects = [
      { type: 'photo', pos: new BABYLON.Vector3(-5, 0.5, -4) },
      { type: 'book', pos: new BABYLON.Vector3(5, 0.5, -4) },
      { type: 'pin', pos: new BABYLON.Vector3(-5, 0.5, 4) },
      { type: 'letter', pos: new BABYLON.Vector3(5, 0.5, 4) }
    ];

    objects.forEach(obj => {
      switch (obj.type) {
        case 'photo':
          this.createPhotoFrame(obj.pos.clone().addInPlace(this.roomOffset));
          break;
        case 'book':
          this.createBook(obj.pos.clone().addInPlace(this.roomOffset));
          break;
        case 'pin':
          this.createPin(obj.pos.clone().addInPlace(this.roomOffset));
          break;
        case 'letter':
          this.createLetter(obj.pos.clone().addInPlace(this.roomOffset));
          break;
      }
    });
  }

  createPhotoFrame(position) {
    const frame = this.createBox(0.02, 0.4, 0.3, 0x8b7355, position);
    frame.parent = this.group;

    const photo = BABYLON.MeshBuilder.CreatePlane('photo', {
      width: 0.38,
      height: 0.28
    }, this.scene);

    const photoMaterial = new BABYLON.StandardMaterial('photoMaterial', this.scene);
    photoMaterial.diffuseColor = BABYLON.Color3.FromHexString('#f5f5dc');
    photo.material = photoMaterial;

    photo.position = position.clone();
    photo.position.x += 0.02;
    photo.rotation.y = -Math.PI / 2;
    photo.parent = this.group;

    // Soft light on object
    const light = new BABYLON.PointLight('photoLight',
      new BABYLON.Vector3(position.x, position.y + 1, position.z),
      this.scene
    );
    light.intensity = 0.5;
    light.diffuse = BABYLON.Color3.FromHexString('#ffffcc');
    light.range = 3;
    light.parent = this.group;
  }

  createBook(position) {
    const book = this.createBox(0.3, 0.05, 0.4, 0x8b0000, position);
    book.parent = this.group;

    const light = new BABYLON.PointLight('bookLight',
      new BABYLON.Vector3(position.x, position.y + 1, position.z),
      this.scene
    );
    light.intensity = 0.5;
    light.diffuse = BABYLON.Color3.FromHexString('#ffffcc');
    light.range = 3;
    light.parent = this.group;
  }

  createPin(position) {
    const pin = this.createCylinder(0.05, 0.02, 0.01, 0xffd700, position);
    pin.parent = this.group;

    const light = new BABYLON.PointLight('pinLight',
      new BABYLON.Vector3(position.x, position.y + 1, position.z),
      this.scene
    );
    light.intensity = 0.5;
    light.diffuse = BABYLON.Color3.FromHexString('#ffffcc');
    light.range = 3;
    light.parent = this.group;
  }

  createLetter(position) {
    const letter = BABYLON.MeshBuilder.CreatePlane('letter', {
      width: 0.25,
      height: 0.18
    }, this.scene);

    const letterMaterial = new BABYLON.StandardMaterial('letterMaterial', this.scene);
    letterMaterial.diffuseColor = BABYLON.Color3.FromHexString('#fffacd');
    letter.material = letterMaterial;

    letter.rotation.x = -Math.PI / 2;
    letter.position = position.clone();
    letter.parent = this.group;

    const light = new BABYLON.PointLight('letterLight',
      new BABYLON.Vector3(position.x, position.y + 1, position.z),
      this.scene
    );
    light.intensity = 0.5;
    light.diffuse = BABYLON.Color3.FromHexString('#ffffcc');
    light.range = 3;
    light.parent = this.group;
  }

  createMemoryWall() {
    // Large wall for projection of memories - adjusted for lower ceiling
    const wallPosition = new BABYLON.Vector3(0, 1.5, -5.9).addInPlace(this.roomOffset);

    this.memoryWallMesh = BABYLON.MeshBuilder.CreatePlane('memoryWall', {
      width: 12,
      height: 2.5
    }, this.scene);

    const wallMaterial = new BABYLON.StandardMaterial('memoryWallMaterial', this.scene);
    wallMaterial.diffuseColor = BABYLON.Color3.FromHexString('#1a1a1a');
    wallMaterial.emissiveColor = BABYLON.Color3.FromHexString('#444444');
    this.memoryWallMesh.material = wallMaterial;

    this.memoryWallMesh.position = wallPosition;
    this.memoryWallMesh.parent = this.group;

    // Create dynamic texture for text rendering
    this.memoryCanvas = document.createElement('canvas');
    this.memoryCanvas.width = 2048;
    this.memoryCanvas.height = 1024;
    this.memoryContext = this.memoryCanvas.getContext('2d');

    // Create Babylon.js DynamicTexture
    this.memoryTexture = new BABYLON.DynamicTexture('memoryTexture', 2048, this.scene, false);
    this.memoryWallMesh.material.emissiveTexture = this.memoryTexture;

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

    // Update the DynamicTexture with canvas content
    const ctx2d = this.memoryTexture.getContext('2d');
    ctx2d.drawImage(this.memoryCanvas, 0, 0);
    this.memoryTexture.update();

    this.needsTextureUpdate = false; // Reset flag
  }

  createMemoryParticle(text) {
    // Create a floating text plane (billboard equivalent)
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;

    context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.fillText(text.substring(0, 30) + (text.length > 30 ? '...' : ''), 256, 64);

    // Create dynamic texture from canvas
    const texture = new BABYLON.DynamicTexture('particleTexture', 512, this.scene, false);
    const ctx = texture.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    texture.update();

    // Create a plane for the particle instead of sprite
    const plane = BABYLON.MeshBuilder.CreatePlane('textParticle', {
      width: 2,
      height: 0.5
    }, this.scene);

    const particleMaterial = new BABYLON.StandardMaterial('particleMaterial', this.scene);
    particleMaterial.emissiveTexture = texture;
    particleMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    plane.material = particleMaterial;

    // Set billboard mode to always face camera
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    plane.position = new BABYLON.Vector3(
      Math.random() * 10 - 5,
      Math.random() * 3 + 1,
      -6
    ).addInPlace(this.roomOffset);

    plane.parent = this.group;

    this.memoryParticles.push({
      plane: plane,
      velocity: new BABYLON.Vector3(
        (Math.random() - 0.5) * 0.2,
        Math.random() * 0.1 + 0.05,
        0
      ),
      life: 10
    });
  }

  createLighting() {
    // Very dim ambient
    const ambient = new BABYLON.HemisphericLight('ambientLight',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    ambient.intensity = 0.2;
    ambient.diffuse = BABYLON.Color3.FromHexString('#222222');
    ambient.parent = this.group;

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
      removed.plane.dispose();
    }

    this.memoryParticles = this.memoryParticles.filter(particle => {
      particle.plane.position.addInPlace(particle.velocity.clone().scale(deltaTime));
      particle.life -= deltaTime;

      if (particle.life <= 2) {
        particle.plane.material.alpha = particle.life / 2;
      }

      if (particle.life <= 0) {
        particle.plane.dispose();
        return false;
      }

      return true;
    });
  }
}