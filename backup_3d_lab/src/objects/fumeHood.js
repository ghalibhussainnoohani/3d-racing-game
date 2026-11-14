import * as THREE from 'three';

/**
 * Fume Hood with interactive sliding glass sash, internal lighting,
 * baffles, utility valves, and digital face velocity monitor.
 */
export class FumeHood {
  constructor(scene, colliders, interactables) {
    this.scene = scene;
    this.colliders = colliders;
    this.interactables = interactables;
    this.group = new THREE.Group();

    this.sashOpen = false;
    this.sashCurrentY = 0;
    this.sashTargetY = 0;
    this.sashMesh = null;

    this.materials = this.initMaterials();
    this.init();
  }

  initMaterials() {
    return {
      casing: new THREE.MeshStandardMaterial({
        color: 0xe2e8f0, // Clean lab exterior off-white
        roughness: 0.35,
        metalness: 0.2,
      }),
      interiorLiner: new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.2,
      }),
      workSurface: new THREE.MeshStandardMaterial({
        color: 0x0f172a, // Black dished epoxy
        roughness: 0.2,
        metalness: 0.1,
      }),
      baseCabinet: new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        roughness: 0.4,
      }),
      sashGlass: new THREE.MeshPhysicalMaterial({
        color: 0xf0fdf4,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.88,
        transparent: true,
        opacity: 0.4,
        ior: 1.52,
      }),
      aluminum: new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.85,
        roughness: 0.25,
      }),
      duct: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.7,
        roughness: 0.3,
      }),
      ledLight: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xecfeff,
        emissiveIntensity: 1.5,
      }),
    };
  }

  init() {
    const posX = -6.6;
    const posZ = -2.4;
    const w = 1.8;
    const d = 1.05;
    const h = 2.55;

    // 1. Lower Base Cabinet (Acid / Solvent storage)
    const baseH = 0.9;
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(w, baseH, d),
      this.materials.baseCabinet
    );
    base.position.set(0, baseH / 2, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    this.group.add(base);

    // Base cabinet double door lines & vents
    for (let side = -1; side <= 1; side += 2) {
      const doorPanel = new THREE.Mesh(
        new THREE.BoxGeometry(w / 2 - 0.04, baseH - 0.08, 0.02),
        this.materials.casing
      );
      doorPanel.position.set(side * (w / 4), baseH / 2, d / 2 + 0.01);
      this.group.add(doorPanel);

      // Handles
      const hnd = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.15, 0.03),
        this.materials.aluminum
      );
      hnd.position.set(side * 0.08, baseH * 0.7, d / 2 + 0.03);
      this.group.add(hnd);
    }

    // 2. Black Epoxy Work Surface with Marine Edge Lip
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.04, 0.06, d + 0.04),
      this.materials.workSurface
    );
    top.position.set(0, baseH + 0.03, 0);
    top.receiveShadow = true;
    this.group.add(top);

    // 3. Superstructure Walls (Left, Right, Back, Top)
    const hoodH = h - baseH;
    const wallT = 0.08;

    // Left wall
    const wallL = new THREE.Mesh(
      new THREE.BoxGeometry(wallT, hoodH, d),
      this.materials.casing
    );
    wallL.position.set(-w / 2 + wallT / 2, baseH + hoodH / 2, 0);
    this.group.add(wallL);

    // Right wall
    const wallR = new THREE.Mesh(
      new THREE.BoxGeometry(wallT, hoodH, d),
      this.materials.casing
    );
    wallR.position.set(w / 2 - wallT / 2, baseH + hoodH / 2, 0);
    this.group.add(wallR);

    // Back wall & Rear Aerodynamic Baffles
    const wallB = new THREE.Mesh(
      new THREE.BoxGeometry(w, hoodH, wallT),
      this.materials.interiorLiner
    );
    wallB.position.set(0, baseH + hoodH / 2, -d / 2 + wallT / 2);
    this.group.add(wallB);

    // Upper Baffle Panel
    const baffle = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.2, hoodH * 0.7, 0.02),
      this.materials.interiorLiner
    );
    baffle.position.set(0, baseH + hoodH * 0.6, -d / 2 + 0.12);
    this.group.add(baffle);

    // Top Header & Bypass Grille
    const topHeader = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.35, d),
      this.materials.casing
    );
    topHeader.position.set(0, h - 0.175, 0);
    this.group.add(topHeader);

    // Exhaust Duct Collar connecting to ceiling
    const duct = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.7, 24),
      this.materials.duct
    );
    duct.position.set(0, h + 0.35, 0);
    this.group.add(duct);

    // Interior Fluorescent Light Fixture
    const hoodLightMesh = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.4, 0.04, 0.15),
      this.materials.ledLight
    );
    hoodLightMesh.position.set(0, h - 0.37, 0);
    this.group.add(hoodLightMesh);

    // Digital Airflow Face Velocity Monitor on front header
    this.createControlPanel(0, h - 0.18, d / 2 + 0.01);

    // 4. Interactive Sliding Glass Sash
    this.createSash(w - 0.18, 0.85, baseH + 0.06, d / 2 - 0.04);

    // Position group in scene
    this.group.position.set(posX, 0, posZ);
    this.scene.add(this.group);

    // Collider
    this.colliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(posX, h / 2, posZ),
        new THREE.Vector3(w + 0.1, h, d + 0.1)
      )
    );
  }

  createControlPanel(x, y, z) {
    const panelCanvas = document.createElement('canvas');
    panelCanvas.width = 256;
    panelCanvas.height = 64;
    const ctx = panelCanvas.getContext('2d');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 64);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText('105 FPM', 15, 30);

    ctx.font = '12px "Inter", sans-serif';
    ctx.fillStyle = '#4ade80';
    ctx.fillText('FACE VELOCITY: NORMAL', 15, 48);

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(220, 32, 10, 0, Math.PI * 2);
    ctx.fill();

    const panelTex = new THREE.CanvasTexture(panelCanvas);
    const panelMat = new THREE.MeshBasicMaterial({ map: panelTex });
    const panelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.1), panelMat);
    panelMesh.position.set(0.5, y, z);
    this.group.add(panelMesh);
  }

  createSash(width, height, baseY, z) {
    this.sashBaseY = baseY;
    this.sashClosedY = baseY + height / 2 + 0.02;
    this.sashOpenedY = baseY + height / 2 + 0.45;
    this.sashCurrentY = this.sashClosedY;
    this.sashTargetY = this.sashClosedY;

    this.sashGroup = new THREE.Group();

    // Glass pane
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, 0.02),
      this.materials.sashGlass
    );
    this.sashGroup.add(glass);

    // Bottom Handle Bar (Aerodynamic handle)
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.02, 0.04, 0.06),
      this.materials.aluminum
    );
    handle.position.y = -height / 2 + 0.02;
    this.sashGroup.add(handle);

    this.sashGroup.position.set(0, this.sashCurrentY, z);
    this.group.add(this.sashGroup);

    // Mark as interactable
    glass.userData = {
      type: 'fumeHoodSash',
      name: 'Fume Hood Sash',
      action: 'Click to Raise / Lower Glass',
      onClick: () => this.toggleSash(),
    };
    handle.userData = glass.userData;
    this.interactables.push(glass, handle);
  }

  toggleSash() {
    this.sashOpen = !this.sashOpen;
    this.sashTargetY = this.sashOpen ? this.sashOpenedY : this.sashClosedY;
    return this.sashOpen;
  }

  update(delta) {
    if (Math.abs(this.sashCurrentY - this.sashTargetY) > 0.001) {
      this.sashCurrentY += (this.sashTargetY - this.sashCurrentY) * delta * 6;
      this.sashGroup.position.y = this.sashCurrentY;
    }
  }
}
