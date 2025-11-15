import * as THREE from 'three';
import { BaseRoom } from './BaseRoom.js';

export class Room4 extends BaseRoom {
  constructor(scene, interactionManager, audioManager) {
    super(scene, interactionManager, audioManager);
    this.roomOffset = new THREE.Vector3(90, 0, 0);
    this.stars = [];
    this.userStars = [];
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
    const walls = this.createWalls(16, 3.5, 14, 0x000000);
    walls.position.copy(this.roomOffset);

    // Make walls nearly invisible (space feeling)
    walls.children.forEach(child => {
      if (child.material) {
        child.material.color.setHex(0x000000);
        child.material.emissive = new THREE.Color(0x000000);
      }
    });

    this.group.add(walls);

    // Create floor with subtle grid
    this.createSpaceGrid();
  }

  createSpaceGrid() {
    const gridHelper = new THREE.GridHelper(14, 28, 0x222244, 0x111122);
    gridHelper.position.copy(this.roomOffset);
    gridHelper.position.y = 0.01;
    this.group.add(gridHelper);

    // Glow lines orbiting
    this.createOrbitLines();
  }

  createOrbitLines() {
    this.orbitLines = [];

    for (let i = 0; i < 3; i++) {
      const radius = 2 + i * 1.5;
      const curve = new THREE.EllipseCurve(
        0, 0,
        radius, radius,
        0, 2 * Math.PI,
        false,
        0
      );

      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0.05, p.y))
      );

      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(i * 0.2, 1, 0.5),
        transparent: true,
        opacity: 0.3
      });

      const line = new THREE.Line(geometry, material);
      line.position.set(0, 0.1, 0).add(this.roomOffset);
      this.group.add(line);

      this.orbitLines.push({
        line: line,
        speed: 0.2 + i * 0.1,
        radius: radius
      });
    }
  }

  createCentralStar() {
    // The "problem star" - starts large, can zoom out
    const starGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const starMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 1,
      roughness: 0.3
    });

    this.centralStar = new THREE.Mesh(starGeometry, starMaterial);
    this.centralStar.position.set(0, 2, 0).add(this.roomOffset);

    // Add glow
    const glowGeometry = new THREE.SphereGeometry(0.7, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.centralStar.add(glow);

    // Add point light
    const light = new THREE.PointLight(0xffff00, 2, 10);
    this.centralStar.add(light);

    this.group.add(this.centralStar);

    this.centralStarInitialPos = this.centralStar.position.clone();
  }

  createStarField() {
    // OPTIMIZED: Reduced from 1000 to 500 stars
    const starCount = 500;
    const starGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = []; // Add varying sizes

    for (let i = 0; i < starCount; i++) {
      // Random position in sphere
      const radius = 15 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions.push(x, y, z);

      // Random color (white to blue)
      const color = new THREE.Color();
      color.setHSL(0.6 + Math.random() * 0.1, 0.8, 0.8 + Math.random() * 0.2);
      colors.push(color.r, color.g, color.b);

      // Varying sizes for depth perception
      sizes.push(0.03 + Math.random() * 0.04);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true // Better depth perception
    });

    this.starField = new THREE.Points(starGeometry, starMaterial);
    this.starField.position.copy(this.roomOffset);
    this.group.add(this.starField);
  }

  createGalaxy() {
    // OPTIMIZED: Reduced from 3000 to 1500 particles
    const galaxyCount = 1500;
    const galaxyGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let i = 0; i < galaxyCount; i++) {
      // Spiral pattern
      const angle = i * 0.05;
      const radius = i * 0.02; // Adjusted for fewer particles

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.5;

      positions.push(x, y, z);

      const color = new THREE.Color();
      color.setHSL(0.6, 1, 0.5 + Math.random() * 0.3);
      colors.push(color.r, color.g, color.b);
    }

    galaxyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    galaxyGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const galaxyMaterial = new THREE.PointsMaterial({
      size: 0.04, // Slightly larger to compensate for fewer particles
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending // Better glow effect
    });

    this.galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
    this.galaxy.position.set(0, 2, 0).add(this.roomOffset);
    this.galaxy.scale.set(0.1, 0.1, 0.1);
    this.group.add(this.galaxy);
  }

  createInteractionPedestal() {
    // Tablet/pedestal for user interaction - closer to center
    const pedestalBase = this.createCylinder(
      0.4, 0.35, 1,
      0x1a1a2e,
      new THREE.Vector3(0, 0.5, 3.5).add(this.roomOffset)
    );
    this.group.add(pedestalBase);

    // Tablet screen
    const tabletGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.05);
    const tabletMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c2c3e,
      emissive: 0x4a4a6a,
      emissiveIntensity: 0.5
    });

    this.tablet = new THREE.Mesh(tabletGeometry, tabletMaterial);
    this.tablet.position.set(0, 1.2, 3.5).add(this.roomOffset);
    this.tablet.rotation.x = -Math.PI / 6;
    this.group.add(this.tablet);

    // Make tablet interactive
    this.addInteractiveObject(this.tablet, () => {
      this.onTabletInteraction();
    }, 'Share your perspective');

    // Add glow to tablet
    const glowLight = new THREE.PointLight(0x6a7fff, 0.5, 3);
    glowLight.position.set(0, 1.2, 3.7).add(this.roomOffset);
    this.group.add(glowLight);
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
      this.centralStar.scale.setScalar(scale);

      // Move camera metaphorically by scaling the galaxy
      this.galaxy.scale.setScalar(this.zoomProgress * 20);
      this.galaxy.material.opacity = this.zoomProgress * 0.8;

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
    const starGeometry = new THREE.SphereGeometry(0.03, 16, 16);
    const starMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6b6b,
      emissive: 0xff6b6b,
      emissiveIntensity: 0.8
    });

    const star = new THREE.Mesh(starGeometry, starMaterial);

    // Random position in galaxy
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 3 + 1;
    star.position.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 0.3,
      Math.sin(angle) * radius
    );

    this.galaxy.add(star);

    const light = new THREE.PointLight(0xff6b6b, 0.3, 1);
    star.add(light);

    this.userStars.push({
      mesh: star,
      text: text,
      pulse: 0
    });
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
      this.centralStar.scale.setScalar(scale);

      // Reset galaxy
      this.galaxy.scale.setScalar(20 - easeProgress * 19.9);
      this.galaxy.material.opacity = 0.8 - easeProgress * 0.8;

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
    const ambient = new THREE.AmbientLight(0x111133, 0.3);
    this.group.add(ambient);

    // Dim blue/purple atmospheric lights - lowered for lower ceiling
    const light1 = new THREE.PointLight(0x4444ff, 0.5, 12);
    light1.position.set(-6, 2.8, -4).add(this.roomOffset);
    this.group.add(light1);

    const light2 = new THREE.PointLight(0x8844ff, 0.5, 12);
    light2.position.set(6, 2.8, 4).add(this.roomOffset);
    this.group.add(light2);
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
      this.centralStar.children[0].scale.setScalar(pulse);
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
      starData.mesh.scale.setScalar(pulse);
    });

    // Rotate galaxy
    if (this.galaxy && this.zoomState !== 'zooming_out') {
      this.galaxy.rotation.y += deltaTime * 0.1;
    }
  }
}
