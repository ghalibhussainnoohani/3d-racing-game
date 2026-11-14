import * as THREE from 'three';

/**
 * Safety Corner:
 * Emergency shower & eyewash combination station, wall-mounted fire extinguisher,
 * first-aid medical box, lab coats on hooks, and safety goggles rack.
 */
export class SafetyStation {
  constructor(scene, colliders, interactables, soundManager) {
    this.scene = scene;
    this.colliders = colliders;
    this.interactables = interactables;
    this.soundManager = soundManager;
    this.group = new THREE.Group();

    this.eyewashActive = false;
    this.waterParticles = [];

    this.materials = this.initMaterials();
    this.init();
  }

  initMaterials() {
    return {
      safetyGreen: new THREE.MeshStandardMaterial({
        color: 0x15803d, // OSHA emergency green
        roughness: 0.35,
        metalness: 0.2,
      }),
      safetyYellow: new THREE.MeshStandardMaterial({
        color: 0xeab308,
        roughness: 0.4,
      }),
      fireRed: new THREE.MeshStandardMaterial({
        color: 0xdc2626, // Fire red
        roughness: 0.25,
        metalness: 0.3,
      }),
      stainless: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.9,
        roughness: 0.15,
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        metalness: 0.95,
        roughness: 0.1,
      }),
      pipeSteel: new THREE.MeshStandardMaterial({
        color: 0x166534, // Green painted schedule 40 pipe
        roughness: 0.4,
        metalness: 0.3,
      }),
      labCoatCloth: new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.85,
      }),
      goggleTint: new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.9,
        transparent: true,
        opacity: 0.5,
        roughness: 0.1,
      }),
      waterMat: new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.95,
        transparent: true,
        opacity: 0.6,
      }),
    };
  }

  init() {
    // 1. Emergency Eyewash & Shower Unit in South-West corner (X = -7.2, Z = 4.0)
    this.createEmergencyShowerEyewash(-7.15, 0, 3.8);

    // 2. Wall-Mounted Fire Extinguisher (X = -7.9, Z = 4.6, Y = 1.1)
    this.createFireExtinguisher(-7.88, 1.1, 4.6);

    // 3. First-Aid Cabinet (X = -7.88, Z = 4.1, Y = 1.6)
    this.createFirstAidCabinet(-7.88, 1.6, 4.2);

    // 4. Lab Coats on Wall Hooks on South Wall (X = -3.2, Z = 4.9)
    this.createLabCoatRack(-3.0, 1.7, 4.9);

    // 5. Safety Goggles Storage Rack on South Wall (X = -3.8, Z = 4.9)
    this.createGogglesRack(-3.7, 1.5, 4.9);

    this.scene.add(this.group);
  }

  createEmergencyShowerEyewash(x, y, z) {
    const station = new THREE.Group();

    // Vertical Standpipe (Green painted 1.25" pipe)
    const pipeH = 2.4;
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, pipeH, 16),
      this.materials.pipeSteel
    );
    pipe.position.y = pipeH / 2;
    station.add(pipe);

    // Floor mounting flange
    const flange = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16),
      this.materials.stainless
    );
    flange.position.y = 0.01;
    station.add(flange);

    // Overhead Shower Arm (extending horizontally)
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.55, 12),
      this.materials.pipeSteel
    );
    arm.rotation.z = Math.PI / 2;
    arm.position.set(0.25, 2.35, 0);
    station.add(arm);

    // Showerhead Conical Bowl (Safety Green)
    const showerhead = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.08, 20),
      this.materials.safetyGreen
    );
    showerhead.rotation.x = Math.PI;
    showerhead.position.set(0.5, 2.3, 0);
    station.add(showerhead);

    // Shower Pull Rod & Triangular Handle
    const pullRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.65, 8),
      this.materials.chrome
    );
    pullRod.position.set(0.42, 1.9, 0);
    station.add(pullRod);

    const pullRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.04, 0.008, 8, 16),
      this.materials.safetyYellow
    );
    pullRing.position.set(0.42, 1.55, 0);
    station.add(pullRing);

    // Eyewash Basin (Stainless steel catch bowl at 1.05m height)
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.12, 0.1, 20),
      this.materials.stainless
    );
    bowl.position.set(0.28, 1.05, 0);
    station.add(bowl);

    // Dual Eyewash Spray Heads
    [-0.045, 0.045].forEach(sx => {
      const nozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.012, 0.04, 12),
        this.materials.safetyYellow
      );
      nozzle.position.set(0.28, 1.12, sx);
      station.add(nozzle);
    });

    // Eyewash Push-Flag Activation Handle
    const pushFlag = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, 0.01),
      this.materials.safetyYellow
    );
    pushFlag.position.set(0.44, 1.08, 0);
    station.add(pushFlag);

    // Simulated Water Spray Particles
    for (let w = 0; w < 16; w++) {
      const drop = new THREE.Mesh(
        new THREE.SphereGeometry(0.006, 6, 6),
        this.materials.waterMat
      );
      drop.visible = false;
      drop.userData = {
        baseX: 0.28,
        baseY: 1.12,
        baseZ: w % 2 === 0 ? -0.045 : 0.045,
        vy: 0.4 + Math.random() * 0.3,
        vx: (Math.random() - 0.5) * 0.08,
        vz: (Math.random() - 0.5) * 0.08,
      };
      station.add(drop);
      this.waterParticles.push(drop);
    }

    station.position.set(x, y, z);
    this.group.add(station);

    this.colliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x + 0.2, 1.2, z),
        new THREE.Vector3(0.6, 2.4, 0.6)
      )
    );

    // Interactive Eyewash test
    pushFlag.userData = {
      name: 'Emergency Eyewash Station',
      action: 'Click to Test Water Flow',
      onClick: () => this.toggleEyewash(),
    };
    bowl.userData = pushFlag.userData;
    this.interactables.push(pushFlag, bowl);
  }

  toggleEyewash() {
    this.eyewashActive = !this.eyewashActive;
    this.waterParticles.forEach(p => {
      p.visible = this.eyewashActive;
      p.position.set(p.userData.baseX, p.userData.baseY, p.userData.baseZ);
    });
    if (this.soundManager) this.soundManager.playSlide();
    return this.eyewashActive;
  }

  createFireExtinguisher(x, y, z) {
    const ext = new THREE.Group();

    // Red Cylinder Tank Body
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.48, 20),
      this.materials.fireRed
    );
    body.position.y = 0;
    body.castShadow = true;
    ext.add(body);

    // Rounded Dome Top & Bottom
    const domeTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      this.materials.fireRed
    );
    domeTop.position.y = 0.24;
    ext.add(domeTop);

    // Valve Neck & Handle Lever
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12),
      this.materials.stainless
    );
    neck.position.y = 0.35;
    ext.add(neck);

    const lever = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.02, 0.025),
      this.materials.fireRed
    );
    lever.position.set(0.04, 0.4, 0);
    ext.add(lever);

    // Pressure Gauge
    const gauge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.015, 12),
      this.materials.stainless
    );
    gauge.rotation.z = Math.PI / 2;
    gauge.position.set(0.04, 0.37, 0.03);
    ext.add(gauge);

    // Black Discharge Hose & Horn
    const hose = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.32, 10),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
    );
    hose.position.set(0.09, 0.15, 0);
    ext.add(hose);

    // Wall Bracket
    const bracket = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.2, 0.08),
      this.materials.pipeSteel
    );
    bracket.position.set(-0.08, 0, 0);
    ext.add(bracket);

    ext.position.set(x + 0.1, y, z);
    this.group.add(ext);

    body.userData = {
      name: 'Fire Extinguisher (CO2 / Dry Chemical)',
      action: 'Click to Inspect Inspection Tag',
      onClick: () => {
        if (this.soundManager) this.soundManager.playBeep();
      }
    };
    this.interactables.push(body);
  }

  createFirstAidCabinet(x, y, z) {
    const cabinet = new THREE.Group();
    const w = 0.42;
    const h = 0.52;
    const d = 0.16;

    // White Case
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(d, h, w),
      this.materials.labCoatCloth
    );
    cabinet.add(body);

    // Green Medical Cross on Front
    const crossMat = this.materials.safetyGreen;
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.18, 0.06), crossMat);
    crossV.position.set(-d / 2 - 0.005, 0, 0);
    cabinet.add(crossV);

    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.06, 0.18), crossMat);
    crossH.position.set(-d / 2 - 0.005, 0, 0);
    cabinet.add(crossH);

    cabinet.position.set(x + d / 2, y, z);
    this.group.add(cabinet);

    body.userData = {
      name: 'First Aid Emergency Kit',
      action: 'Click to Inspect Supplies',
      onClick: () => {
        if (this.soundManager) this.soundManager.playBeep();
      }
    };
    this.interactables.push(body);
  }

  createLabCoatRack(x, y, z) {
    const rack = new THREE.Group();

    // Wooden / metal wall rail
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.08, 0.02),
      this.materials.stainless
    );
    rack.add(rail);

    // 3 Pegs with hanging white lab coats
    [-0.3, 0, 0.3].forEach((px, i) => {
      // Peg hook
      const peg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.08, 8),
        this.materials.chrome
      );
      peg.rotation.x = Math.PI / 4;
      peg.position.set(px, 0.02, -0.04);
      rack.add(peg);

      // Hanging lab coat body
      const coat = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.85, 0.12),
        this.materials.labCoatCloth
      );
      coat.position.set(px, -0.45, -0.08);
      rack.add(coat);

      // Coat Collar
      const collar = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.08, 0.06),
        this.materials.labCoatCloth
      );
      collar.position.set(px, -0.05, -0.06);
      rack.add(collar);
    });

    rack.position.set(x, y, z);
    rack.rotation.y = Math.PI;
    this.group.add(rack);
  }

  createGogglesRack(x, y, z) {
    const gRack = new THREE.Group();

    // Transparent acrylic dispenser box
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.35, 0.15),
      this.materials.goggleTint
    );
    gRack.add(box);

    // Goggles inside
    for (let g = 0; g < 3; g++) {
      const goggle = new THREE.Mesh(
        new THREE.TorusGeometry(0.05, 0.015, 8, 16),
        this.materials.goggleTint
      );
      goggle.position.set(-0.12 + g * 0.12, 0, 0);
      gRack.add(goggle);
    }

    gRack.position.set(x, y, z);
    gRack.rotation.y = Math.PI;
    this.group.add(gRack);
  }

  update(delta) {
    if (this.eyewashActive) {
      for (let i = 0; i < this.waterParticles.length; i++) {
        const p = this.waterParticles[i];
        p.position.y += p.userData.vy * delta;
        p.userData.vy -= 1.5 * delta; // Gravity

        p.position.x += p.userData.vx * delta;
        p.position.z += p.userData.vz * delta;

        // Reset drop
        if (p.position.y < p.userData.baseY - 0.05) {
          p.position.set(p.userData.baseX, p.userData.baseY, p.userData.baseZ);
          p.userData.vy = 0.4 + Math.random() * 0.3;
        }
      }
    }
  }
}
