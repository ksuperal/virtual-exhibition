import * as BABYLON from '@babylonjs/core';
import { BaseRoom } from './BaseRoom.js';

export class Room4 extends BaseRoom {
  constructor(scene, interactionManager, audioManager, shadowGenerator) {
    super(scene, interactionManager, audioManager, shadowGenerator);
    this.roomOffset = new BABYLON.Vector3(39, 0, 0); // Wall-by-wall with Room 3 (25 + 14)
    this.stars = [];
    this.userStars = [];
    this.floatingStars = []; // Stars that orbit around the player
    this.zoomState = 'normal'; // 'normal', 'zooming_out', 'cosmic'
    this.zoomProgress = 0;
  }

  async init() {
    // Create cosmic space environment
    this.createRoomStructure();
    this.createCentralStar();
    this.createStarField();
    this.createGalaxy();
    this.createInteractionPedestal();
    this.createLighting();
  }

  createRoomStructure() {
    // ENCLOSED: Intimate cosmic space with lower ceiling
    // Room 4 has left wall with doorway (from Room 3), right wall with doorway (to Room 5)
    const walls = this.createWalls(14, 3, 12, 0x000000, {
      hasLeftDoorway: true,   // Doorway on left wall (from Room 3)
      hasRightDoorway: true   // Doorway on right wall (to Room 5) - will have space wallpaper
    });
    walls.position = this.roomOffset.clone();

    // Create space wallpaper material
    const spaceWallMaterial = new BABYLON.StandardMaterial('spaceWallMat', this.scene);
    const spaceTexture = new BABYLON.Texture('./pictures/space.jpg', this.scene);
    spaceWallMaterial.diffuseTexture = spaceTexture;
    spaceWallMaterial.emissiveTexture = spaceTexture; // Make it glow
    spaceWallMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3); // Dim glow
    spaceWallMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // No specular highlights

    // Create dark material for left wall (matches Room 3)
    const darkWallMaterial = new BABYLON.StandardMaterial('darkWallMat', this.scene);
    darkWallMaterial.diffuse = new BABYLON.Color3(0.1, 0.1, 0.1); // Dark gray like Room 3
    darkWallMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);

    // Create warm material for right wall (matches Room 5)
    const warmWallMaterial = new BABYLON.StandardMaterial('warmWallMat', this.scene);
    warmWallMaterial.diffuse = BABYLON.Color3.FromHexString('#faf0e6'); // Linen/beige like Room 5
    warmWallMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);

    // Apply materials: space wallpaper to walls and ceiling
    walls.getDescendants().forEach(child => {
      if (child.material) {
        if (child.name && (child.name.includes('leftWall') || child.name.includes('Left'))) {
          // Apply dark material to left wall
          child.material = darkWallMaterial;
        } else if (child.name && (child.name.includes('rightWall') || child.name.includes('Right'))) {
          // Apply warm material to right wall
          child.material = warmWallMaterial;
        } else if (child.name && (child.name.includes('ceiling') || child.name.includes('Ceiling'))) {
          // Apply space wallpaper to ceiling
          child.material = spaceWallMaterial;
          child.material.backFaceCulling = false; // Ensure visible from below
        } else if (child.name && !(child.name.includes('floor') || child.name.includes('Floor'))) {
          // Apply space wallpaper to other walls (back, front) but not floor
          child.material = spaceWallMaterial;
        }
      }
    });

    walls.parent = this.group;

    // Create floor with subtle grid
    this.createSpaceGrid();
  }

  createSpaceGrid() {
    // Create floor with space texture
    const spaceFloorMaterial = new BABYLON.StandardMaterial('spaceFloorMat', this.scene);
    const spaceTexture = new BABYLON.Texture('./pictures/space.jpg', this.scene);
    spaceFloorMaterial.diffuseTexture = spaceTexture;
    spaceFloorMaterial.emissiveTexture = spaceTexture;
    spaceFloorMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    spaceFloorMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

    const gridPlane = BABYLON.MeshBuilder.CreateGround('grid', { width: 14, height: 12, subdivisions: 26 }, this.scene);
    gridPlane.position = this.roomOffset.add(new BABYLON.Vector3(0, 0.01, 0));
    gridPlane.material = spaceFloorMaterial;
    gridPlane.parent = this.group;

    // Glow lines orbiting
    this.createOrbitLines();
  }

  createOrbitLines() {
    this.orbitLines = [];

    for (let i = 0; i < 3; i++) {
      const radius = 2 + i * 1.5;
      const points = [];

      // Generate circle points
      for (let j = 0; j <= 50; j++) {
        const angle = (j / 50) * Math.PI * 2;
        points.push(new BABYLON.Vector3(
          Math.cos(angle) * radius,
          0.05,
          Math.sin(angle) * radius
        ));
      }

      // Create tube mesh instead of line
      const hslColor = this.hslToRgb(i * 0.2, 1, 0.5);
      const material = new BABYLON.StandardMaterial(`orbitMat${i}`, this.scene);
      material.diffuse = new BABYLON.Color3(hslColor.r, hslColor.g, hslColor.b);
      material.emissiveColor = new BABYLON.Color3(hslColor.r, hslColor.g, hslColor.b);
      material.alpha = 0.3;

      const line = BABYLON.MeshBuilder.CreateTube('orbit', { path: points, radius: 0.05 }, this.scene);
      line.position = this.roomOffset.add(new BABYLON.Vector3(0, 0.1, 0));
      line.material = material;
      line.parent = this.group;

      this.orbitLines.push({
        line: line,
        speed: 0.2 + i * 0.1,
        radius: radius
      });
    }
  }

  hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r, g, b };
  }

  createCentralStar() {
    // The "problem star" - starts large, can zoom out
    const starMaterial = new BABYLON.StandardMaterial('centralStarMat', this.scene);
    starMaterial.diffuse = new BABYLON.Color3(1, 1, 0); // 0xffff00
    starMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0);
    starMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    this.centralStar = BABYLON.MeshBuilder.CreateSphere('centralStar', { diameter: 1, segments: 32 }, this.scene);
    this.centralStar.material = starMaterial;
    this.centralStar.position = new BABYLON.Vector3(0, 2, 0).add(this.roomOffset);

    // Add glow sphere
    const glowMaterial = new BABYLON.StandardMaterial('glowMat', this.scene);
    glowMaterial.diffuse = new BABYLON.Color3(1, 1, 0);
    glowMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0);
    glowMaterial.alpha = 0.3;

    const glow = BABYLON.MeshBuilder.CreateSphere('glow', { diameter: 1.4, segments: 32 }, this.scene);
    glow.material = glowMaterial;
    glow.parent = this.centralStar;

    // Add point light
    const light = new BABYLON.PointLight('centralStarLight', this.centralStar.position, this.scene);
    light.range = 10;
    light.intensity = 2;
    light.diffuse = new BABYLON.Color3(1, 1, 0);
    light.parent = this.centralStar;

    this.centralStar.parent = this.group;

    this.centralStarInitialPos = this.centralStar.position.clone();
  }

  createStarField() {
    // OPTIMIZED: Reduced from 1000 to 500 stars
    const starCount = 500;
    const positions = [];
    const colors = [];

    for (let i = 0; i < starCount; i++) {
      // Random position in sphere
      const radius = 15 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions.push(new BABYLON.Vector3(x, y, z));

      // Random color (white to blue)
      const hslColor = this.hslToRgb(0.6 + Math.random() * 0.1, 0.8, 0.8 + Math.random() * 0.2);
      colors.push(new BABYLON.Color3(hslColor.r, hslColor.g, hslColor.b));
    }

    // Use SolidParticleSystem for star field
    const sps = new BABYLON.SolidParticleSystem('starField', this.scene);

    // Create small sphere meshes for particles
    const star = BABYLON.MeshBuilder.CreateSphere('star', { diameter: 0.05, segments: 4 }, this.scene);

    // Add all particles
    sps.addShape(star, starCount);
    star.dispose();

    // Build mesh first
    const mesh = sps.buildMesh();

    // Initialize particles using the callback
    sps.initParticles = function() {
      for (let i = 0; i < sps.nbParticles; i++) {
        const particle = sps.particles[i];
        particle.position = positions[i];
        particle.color = colors[i];
      }
    };
    sps.initParticles();

    // Set material properties
    mesh.position = this.roomOffset;
    const material = new BABYLON.StandardMaterial('starFieldMat', this.scene);
    material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    material.alpha = 0.8;
    mesh.material = material;

    this.starField = sps.mesh;
    this.starField.parent = this.group;
  }

  createGalaxy() {
    // OPTIMIZED: Reduced from 3000 to 1500 particles
    const galaxyCount = 1500;
    const positions = [];
    const colors = [];

    for (let i = 0; i < galaxyCount; i++) {
      // Spiral pattern
      const angle = i * 0.05;
      const radius = i * 0.02; // Adjusted for fewer particles

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.5;

      positions.push(new BABYLON.Vector3(x, y, z));

      const hslColor = this.hslToRgb(0.6, 1, 0.5 + Math.random() * 0.3);
      colors.push(new BABYLON.Color3(hslColor.r, hslColor.g, hslColor.b));
    }

    // Use SolidParticleSystem for galaxy particles
    const sps = new BABYLON.SolidParticleSystem('galaxy', this.scene);

    // Create small sphere meshes for particles
    const particleMesh = BABYLON.MeshBuilder.CreateSphere('galaxyParticle', { diameter: 0.04, segments: 4 }, this.scene);

    // Add all particles
    sps.addShape(particleMesh, galaxyCount);
    particleMesh.dispose();

    // Build mesh first
    const mesh = sps.buildMesh();

    // Initialize particles using the callback
    sps.initParticles = function() {
      for (let i = 0; i < sps.nbParticles; i++) {
        const particle = sps.particles[i];
        particle.position = positions[i];
        particle.color = colors[i];
      }
    };
    sps.initParticles();

    // Set material properties
    const particleMat = new BABYLON.StandardMaterial('galaxyMat', this.scene);
    particleMat.emissiveColor = new BABYLON.Color3(0.4, 0.2, 1); // Blue/purple glow
    particleMat.alphaMode = BABYLON.Engine.ALPHA_ADD; // Additive blending
    particleMat.alpha = 0;
    mesh.material = particleMat;

    this.galaxy = mesh;
    this.galaxy.position = new BABYLON.Vector3(0, 2, 0).add(this.roomOffset);
    this.galaxy.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);

    this.galaxy.parent = this.group;
  }

  createInteractionPedestal() {
    // Tablet/pedestal for user interaction - closer to center
    const pedestalBase = this.createCylinder(
      0.4, 0.35, 1,
      0x1a1a2e,
      new BABYLON.Vector3(0, 0.5, 3.5).add(this.roomOffset)
    );
    pedestalBase.parent = this.group;

    // Tablet screen
    const tabletMaterial = new BABYLON.StandardMaterial('tabletMat', this.scene);
    tabletMaterial.diffuse = new BABYLON.Color3(0.173, 0.173, 0.243); // 0x2c2c3e
    tabletMaterial.emissiveColor = new BABYLON.Color3(0.29, 0.29, 0.42); // 0x4a4a6a
    tabletMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

    this.tablet = BABYLON.MeshBuilder.CreateBox('tablet', { width: 0.6, height: 0.4, depth: 0.05 }, this.scene);
    this.tablet.material = tabletMaterial;
    this.tablet.position = new BABYLON.Vector3(0, 1.2, 3.5).add(this.roomOffset);
    this.tablet.rotation.x = -Math.PI / 6;
    this.tablet.parent = this.group;

    // Make tablet interactive
    this.addInteractiveObject(this.tablet, () => {
      this.onTabletInteraction();
    }, 'Share your perspective');

    // Add glow to tablet
    const glowLight = new BABYLON.PointLight('tabletLight', new BABYLON.Vector3(0, 1.2, 3.7).add(this.roomOffset), this.scene);
    glowLight.range = 3;
    glowLight.intensity = 0.5;
    glowLight.diffuse = new BABYLON.Color3(0.42, 0.5, 1); // 0x6a7fff
    glowLight.parent = this.group;
  }

  onTabletInteraction() {
    const uiManager = window.app?.uiManager;
    if (!uiManager) return;

    const feelings = [
      'Sad', 'Disappointed', 'Tired', 'Heartbroken',
      'Anxious', 'Overwhelmed', 'Lost', 'Frustrated'
    ];

    uiManager.createMultiStepModal('Your Universe', [
      {
        type: 'text',
        content: 'What weighs on your heart right now?'
      },
      {
        type: 'input',
        name: 'feeling',
        placeholder: 'Choose or describe your feeling...',
        multiline: false
      },
      {
        type: 'input',
        name: 'struggle',
        placeholder: 'Tell us about your struggle...',
        multiline: true,
        onComplete: (results) => {
          this.submitPerspective(results);
        }
      }
    ]);
  }

  submitPerspective(data) {
    // Add floating stars around user
    this.createFloatingStars();

    // Trigger zoom out animation
    this.startZoomOut(data.struggle || data.feeling);
  }

  startZoomOut(problemText) {
    this.zoomState = 'zooming_out';
    this.zoomProgress = 0;
    this.problemText = problemText;

    const uiManager = window.app?.uiManager;
    if (uiManager) {
      uiManager.hideRoomTitle();
    }
  }

  animateZoomOut(deltaTime) {
    if (this.zoomState !== 'zooming_out') return;

    this.zoomProgress += deltaTime * 0.15;

    if (this.zoomProgress <= 1) {
      // Scale down central star
      const scale = 1 - this.zoomProgress * 0.95;
      this.centralStar.scaling = new BABYLON.Vector3(scale, scale, scale);

      // Move camera metaphorically by scaling the galaxy
      const galaxyScale = this.zoomProgress * 20;
      this.galaxy.scaling = new BABYLON.Vector3(galaxyScale, galaxyScale, galaxyScale);
      this.galaxy.material.alpha = this.zoomProgress * 0.8;

      // Rotate galaxy
      this.galaxy.rotation.y += deltaTime * 0.3;

    } else if (this.zoomProgress > 1 && this.zoomProgress < 1.5) {
      // Hold at cosmic view
      this.galaxy.rotation.y += deltaTime * 0.2;

    } else {
      // Complete zoom out, add star
      this.addUserStar(this.problemText);
      this.zoomState = 'cosmic';

      const uiManager = window.app?.uiManager;
      if (uiManager) {
        uiManager.showModal(
          'A Small Point',
          '<p style="font-size: 1.2rem; line-height: 1.8;">Your problem is real. Your pain matters.</p><p style="margin-top: 15px;">But look at the vastness around it.</p><p style="margin-top: 15px; color: #666;">You are part of something infinitely larger. Your life extends far beyond this single moment.</p>'
        );
      }

      // Reset zoom for next interaction
      setTimeout(() => {
        this.resetZoom();
      }, 5000);
    }
  }

  addUserStar(text) {
    // Add user's problem as a tiny star in the galaxy
    const starMaterial = new BABYLON.StandardMaterial('userStarMat', this.scene);
    starMaterial.diffuse = new BABYLON.Color3(1, 0.42, 0.42); // 0xff6b6b
    starMaterial.emissiveColor = new BABYLON.Color3(1, 0.42, 0.42);
    starMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

    const star = BABYLON.MeshBuilder.CreateSphere('userStar', { diameter: 0.06, segments: 16 }, this.scene);
    star.material = starMaterial;

    // Random position in galaxy
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 3 + 1;
    star.position = new BABYLON.Vector3(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 0.3,
      Math.sin(angle) * radius
    );

    star.parent = this.galaxy;

    const light = new BABYLON.PointLight('userStarLight', star.position, this.scene);
    light.range = 1;
    light.intensity = 0.3;
    light.diffuse = new BABYLON.Color3(1, 0.42, 0.42);
    light.parent = star;

    this.userStars.push({
      mesh: star,
      text: text,
      pulse: 0
    });
  }

  createFloatingStars() {
    // Create 8 floating stars that orbit around the player
    const numStars = 8;
    const orbitRadius = 2; // Distance from player

    for (let i = 0; i < numStars; i++) {
      const angle = (i / numStars) * Math.PI * 2;

      // Create glowing star
      const starMaterial = new BABYLON.StandardMaterial(`floatingStar${i}Mat`, this.scene);
      starMaterial.diffuse = new BABYLON.Color3(1, 0.84, 0.42); // Golden color
      starMaterial.emissiveColor = new BABYLON.Color3(1, 0.84, 0.42);
      starMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

      const star = BABYLON.MeshBuilder.CreateSphere(`floatingStar${i}`, {
        diameter: 0.15,
        segments: 8
      }, this.scene);
      star.material = starMaterial;

      // Position around player (will be updated each frame)
      star.position = new BABYLON.Vector3(
        Math.cos(angle) * orbitRadius,
        1.6, // Eye level
        Math.sin(angle) * orbitRadius
      );

      star.parent = this.group;

      // Add a point light for glow
      const light = new BABYLON.PointLight(`floatingStarLight${i}`,
        new BABYLON.Vector3(0, 0, 0),
        this.scene
      );
      light.range = 2;
      light.intensity = 0.5;
      light.diffuse = new BABYLON.Color3(1, 0.84, 0.42);
      light.parent = star;

      // Store star data for animation
      this.floatingStars.push({
        mesh: star,
        light: light,
        baseAngle: angle,
        orbitSpeed: 0.3 + Math.random() * 0.2, // Slight variation in speed
        heightOffset: Math.random() * 0.3 - 0.15, // Slight height variation
        pulse: Math.random() * Math.PI * 2 // Random pulse phase
      });
    }
  }

  resetZoom() {
    this.zoomState = 'resetting';
    const startTime = Date.now();
    const duration = 2000; // 2 seconds

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // Reset central star
      const scale = 0.05 + easeProgress * 0.95;
      this.centralStar.scaling = new BABYLON.Vector3(scale, scale, scale);

      // Reset galaxy
      const galaxyScale = 20 - easeProgress * 19.9;
      this.galaxy.scaling = new BABYLON.Vector3(galaxyScale, galaxyScale, galaxyScale);
      this.galaxy.material.alpha = 0.8 - easeProgress * 0.8;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.zoomState = 'normal';
        this.zoomProgress = 0;
      }
    };

    animate();
  }

  createLighting() {
    // Minimal ambient light for space feel
    const ambient = new BABYLON.HemisphericLight('ambientLight', new BABYLON.Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.3;
    ambient.diffuse = new BABYLON.Color3(0.067, 0.067, 0.2); // 0x111133
    ambient.parent = this.group;

    // Dim blue/purple atmospheric lights - adjusted for room dimensions (14x3x12)
    const light1 = new BABYLON.PointLight('light1', new BABYLON.Vector3(-5, 2.5, -4).add(this.roomOffset), this.scene);
    light1.range = 12;
    light1.intensity = 0.5;
    light1.diffuse = new BABYLON.Color3(0.267, 0.267, 1); // 0x4444ff
    light1.parent = this.group;

    const light2 = new BABYLON.PointLight('light2', new BABYLON.Vector3(5, 2.5, 4).add(this.roomOffset), this.scene);
    light2.range = 12;
    light2.intensity = 0.5;
    light2.diffuse = new BABYLON.Color3(0.533, 0.267, 1); // 0x8844ff
    light2.parent = this.group;
  }

  async onEnter() {
    this.animationTime = 0;

    const uiManager = window.app?.uiManager;
    if (uiManager) {
      setTimeout(() => {
        uiManager.showModal(
          'The Cosmic Perspective',
          '<p style="font-size: 1.1rem; line-height: 1.8;">In the vastness of space, every problem becomes a small point of light.</p><p style="margin-top: 15px;">Step forward and share what weighs on you.</p><p style="margin-top: 15px; color: #666;">Watch how perspective changes everything.</p>'
        );
      }, 1000);
    }
  }

  async onExit() {
    // Clean up
  }

  update(deltaTime) {
    this.animationTime = (this.animationTime || 0) + deltaTime;

    // Rotate star field slowly
    if (this.starField) {
      this.starField.rotation.y += deltaTime * 0.05;
    }

    // Pulse central star
    if (this.centralStar && this.zoomState === 'normal') {
      const pulse = Math.sin(this.animationTime * 2) * 0.1 + 1;
      const children = this.centralStar.getDescendants();
      if (children.length > 0) {
        children[0].scaling = new BABYLON.Vector3(pulse, pulse, pulse);
      }
    }

    // Animate orbit lines
    if (this.orbitLines) {
      this.orbitLines.forEach((orbitData, index) => {
        orbitData.line.rotation.y += deltaTime * orbitData.speed;
      });
    }

    // Animate zoom out if active
    if (this.zoomState === 'zooming_out') {
      this.animateZoomOut(deltaTime);
    }

    // Pulse user stars
    this.userStars.forEach(starData => {
      starData.pulse += deltaTime * 3;
      const pulse = Math.sin(starData.pulse) * 0.2 + 1;
      starData.mesh.scaling = new BABYLON.Vector3(pulse, pulse, pulse);
    });

    // Rotate galaxy
    if (this.galaxy && this.zoomState !== 'zooming_out') {
      this.galaxy.rotation.y += deltaTime * 0.1;
    }

    // Animate floating stars around the player
    if (this.floatingStars.length > 0) {
      // Get camera position from the scene
      const camera = this.scene.activeCamera;
      if (camera) {
        this.floatingStars.forEach((starData, index) => {
          // Calculate orbit angle (baseAngle + time-based rotation)
          const currentAngle = starData.baseAngle + this.animationTime * starData.orbitSpeed;

          // Calculate orbit position relative to camera
          const orbitRadius = 2;
          const x = camera.position.x + Math.cos(currentAngle) * orbitRadius;
          const z = camera.position.z + Math.sin(currentAngle) * orbitRadius;

          // Add vertical bobbing
          const bobSpeed = 2;
          const bobAmount = 0.15;
          const y = camera.position.y + starData.heightOffset + Math.sin(this.animationTime * bobSpeed + starData.pulse) * bobAmount;

          // Update star position
          starData.mesh.position = new BABYLON.Vector3(x, y, z);

          // Add pulsing scale effect
          const pulseScale = 1 + Math.sin(this.animationTime * 3 + starData.pulse) * 0.2;
          starData.mesh.scaling = new BABYLON.Vector3(pulseScale, pulseScale, pulseScale);
        });
      }
    }
  }
}
