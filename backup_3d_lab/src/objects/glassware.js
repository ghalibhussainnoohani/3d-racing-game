import * as THREE from 'three';

/**
 * Procedural Glassware & Chemical Station Equipment:
 * Beakers, Erlenmeyer flasks with bubbling liquid, round-bottom flasks on clamp stands,
 * test tube racks, burettes, and interactive hot plate magnetic stirrer.
 */
export class GlasswareStation {
  constructor(scene, interactables) {
    this.scene = scene;
    this.interactables = interactables;
    this.group = new THREE.Group();

    this.bubbles = [];
    this.stirrerRunning = true;
    this.stirBar = null;
    this.stirVortex = null;

    this.materials = this.initMaterials();
    this.init();
  }

  initMaterials() {
    return {
      glass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.05,
        metalness: 0.05,
        transmission: 0.95,
        transparent: true,
        opacity: 0.35,
        ior: 1.52,
      }),
      liquidBlue: new THREE.MeshPhysicalMaterial({
        color: 0x0284c7, // Copper sulfate
        roughness: 0.1,
        metalness: 0.05,
        transmission: 0.75,
        transparent: true,
        opacity: 0.7,
      }),
      liquidPurple: new THREE.MeshPhysicalMaterial({
        color: 0x9333ea, // Permanganate
        roughness: 0.1,
        metalness: 0.05,
        transmission: 0.7,
        transparent: true,
        opacity: 0.75,
      }),
      liquidGreen: new THREE.MeshPhysicalMaterial({
        color: 0x22c55e, // Fluorescein / Nickel
        roughness: 0.1,
        metalness: 0.05,
        transmission: 0.8,
        transparent: true,
        opacity: 0.7,
      }),
      liquidAmber: new THREE.MeshPhysicalMaterial({
        color: 0xf59e0b,
        roughness: 0.1,
        metalness: 0.05,
        transmission: 0.75,
        transparent: true,
        opacity: 0.7,
      }),
      bubbleMat: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.05,
        transmission: 0.95,
        transparent: true,
        opacity: 0.6,
      }),
      standMetal: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.8,
      }),
      standRod: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.2,
        metalness: 0.9,
      }),
      clampBrass: new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.3,
        metalness: 0.7,
      }),
      woodRack: new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.6,
      }),
      hotplateCeramic: new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.15,
      }),
      hotplateBody: new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.4,
        metalness: 0.4,
      }),
      ptfeStirBar: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
      })
    };
  }

  init() {
    // 1. Hot Plate & Magnetic Stirrer inside Fume Hood (X = -6.6, Z = -2.3, Y = 0.93)
    this.createHotPlateStirrer(-6.6, 0.93, -2.4);

    // 2. Retort Stand with Round-Bottom Flask inside Fume Hood (X = -6.2, Z = -2.5)
    this.createRetortStandWithFlask(-6.15, 0.93, -2.5);

    // 3. Burette on Stand on Wet Lab Bench 1 (X = -2.8, Z = -0.5, Y = 0.9)
    this.createBuretteStand(-2.8, 0.9, -0.6);

    // 4. Test Tube Rack on Wet Lab Bench 1 (X = -2.8, Z = 0.6)
    this.createTestTubeRack(-2.8, 0.9, 0.6);

    // 5. Beakers & Erlenmeyer Flasks with bubbling liquid on Bench 2 (Center bench)
    this.createBeaker(-0.25, 0.9, -0.8, 0.08, 0.16, this.materials.liquidBlue);
    this.createBeaker(0.25, 0.9, -0.8, 0.06, 0.12, this.materials.liquidAmber);
    this.createBubblingFlask(0.0, 0.9, -0.4);

    // 6. Test Tube Rack on Bench 3
    this.createTestTubeRack(2.8, 0.9, -0.5);
    this.createBeaker(2.6, 0.9, 0.5, 0.07, 0.14, this.materials.liquidGreen);

    this.scene.add(this.group);
  }

  createHotPlateStirrer(x, y, z) {
    const hpGroup = new THREE.Group();

    // Base chassis
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.09, 0.36),
      this.materials.hotplateBody
    );
    body.position.y = 0.045;
    hpGroup.add(body);

    // White ceramic top plate
    const topPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.02, 32),
      this.materials.hotplateCeramic
    );
    topPlate.position.set(0, 0.1, -0.04);
    hpGroup.add(topPlate);

    // Knobs on front panel
    [-0.07, 0.07].forEach(kx => {
      const knob = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.02, 16),
        this.materials.standMetal
      );
      knob.rotation.x = Math.PI / 2;
      knob.position.set(kx, 0.045, 0.185);
      hpGroup.add(knob);
    });

    // Digital readout panel
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.03), ledMat);
    screen.position.set(0, 0.05, 0.181);
    hpGroup.add(screen);

    // Beaker on hot plate
    const beakerY = 0.11;
    const beakerH = 0.16;
    const beakerR = 0.08;
    const beakerMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(beakerR, beakerR, beakerH, 24, 1, true),
      this.materials.glass
    );
    beakerMesh.position.set(0, beakerY + beakerH / 2, -0.04);
    hpGroup.add(beakerMesh);

    // Beaker Bottom
    const btmMesh = new THREE.Mesh(
      new THREE.CircleGeometry(beakerR, 24),
      this.materials.glass
    );
    btmMesh.rotation.x = -Math.PI / 2;
    btmMesh.position.set(0, beakerY + 0.005, -0.04);
    hpGroup.add(btmMesh);

    // Liquid with vortex
    const liqH = beakerH * 0.65;
    this.stirVortex = new THREE.Mesh(
      new THREE.CylinderGeometry(beakerR * 0.95, beakerR * 0.92, liqH, 24),
      this.materials.liquidGreen
    );
    this.stirVortex.position.set(0, beakerY + liqH / 2, -0.04);
    hpGroup.add(this.stirVortex);

    // PTFE Magnetic Stir Bar inside
    this.stirBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.045, 12),
      this.materials.ptfeStirBar
    );
    this.stirBar.rotation.z = Math.PI / 2;
    this.stirBar.position.set(0, beakerY + 0.012, -0.04);
    hpGroup.add(this.stirBar);

    hpGroup.position.set(x, y, z);
    this.group.add(hpGroup);

    // Click to toggle magnetic stirrer
    body.userData = {
      name: 'Magnetic Stirrer & Hot Plate',
      action: 'Click to Toggle Stirring Vortex',
      onClick: () => {
        this.stirrerRunning = !this.stirrerRunning;
      }
    };
    this.interactables.push(body);
  }

  createRetortStandWithFlask(x, y, z) {
    const stand = new THREE.Group();

    // Cast iron base
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.025, 0.18),
      this.materials.standMetal
    );
    base.position.y = 0.0125;
    stand.add(base);

    // Vertical stainless steel rod
    const rodH = 0.65;
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, rodH, 16),
      this.materials.standRod
    );
    rod.position.set(0.08, rodH / 2, 0);
    stand.add(rod);

    // Clamp boss head
    const clampY = 0.35;
    const boss = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.03, 0.03),
      this.materials.standMetal
    );
    boss.position.set(0.08, clampY, 0);
    stand.add(boss);

    // Clamp arm extending outwards
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.12, 8),
      this.materials.standRod
    );
    arm.rotation.z = Math.PI / 2;
    arm.position.set(0.02, clampY, 0);
    stand.add(arm);

    // Clamp 3-prong jaws holding neck
    const jaw = new THREE.Mesh(
      new THREE.TorusGeometry(0.022, 0.005, 8, 16, Math.PI * 1.5),
      this.materials.clampBrass
    );
    jaw.position.set(-0.04, clampY, 0);
    stand.add(jaw);

    // Round-Bottom Flask (Sphere + Cylinder neck)
    const bulbR = 0.07;
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(bulbR, 24, 16),
      this.materials.glass
    );
    bulb.position.set(-0.04, clampY - 0.06, 0);
    stand.add(bulb);

    // Neck
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.09, 16, 1, true),
      this.materials.glass
    );
    neck.position.set(-0.04, clampY + 0.02, 0);
    stand.add(neck);

    // Liquid in round-bottom bulb
    const liqBulb = new THREE.Mesh(
      new THREE.SphereGeometry(bulbR * 0.94, 20, 14, 0, Math.PI * 2, Math.PI / 3, Math.PI * 0.7),
      this.materials.liquidPurple
    );
    liqBulb.position.set(-0.04, clampY - 0.06, 0);
    stand.add(liqBulb);

    stand.position.set(x, y, z);
    this.group.add(stand);
  }

  createBuretteStand(x, y, z) {
    const stand = new THREE.Group();

    // Base
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.02, 0.16),
      this.materials.standMetal
    );
    base.position.y = 0.01;
    stand.add(base);

    // Tall rod
    const rodH = 0.85;
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.007, rodH, 16),
      this.materials.standRod
    );
    rod.position.set(0.08, rodH / 2, 0);
    stand.add(rod);

    // Burette clamp
    const bClamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.04, 0.12),
      this.materials.standMetal
    );
    bClamp.position.set(0.04, 0.55, 0);
    stand.add(bClamp);

    // Burette Tube (50 mL graduated)
    const tubeH = 0.7;
    const tubeR = 0.012;
    const burette = new THREE.Mesh(
      new THREE.CylinderGeometry(tubeR, tubeR, tubeH, 16),
      this.materials.glass
    );
    burette.position.set(0, 0.45, 0);
    stand.add(burette);

    // Stopcock valve
    const valve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.04, 12),
      this.materials.clampBrass
    );
    valve.rotation.z = Math.PI / 2;
    valve.position.set(0, 0.15, 0);
    stand.add(valve);

    // Erlenmeyer flask beneath burette tip receiving titration
    this.createErlenmeyer(stand, 0, 0.02, 0, 0.06, 0.12, this.materials.liquidAmber);

    stand.position.set(x, y, z);
    this.group.add(stand);
  }

  createTestTubeRack(x, y, z) {
    const rack = new THREE.Group();
    const rackW = 0.32;
    const rackD = 0.09;
    const rackH = 0.14;

    // Wooden / acrylic side plates
    [-rackW / 2 + 0.01, rackW / 2 - 0.01].forEach(px => {
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, rackH, rackD),
        this.materials.woodRack
      );
      plate.position.set(px, rackH / 2, 0);
      rack.add(plate);
    });

    // Base tier & Top tier with holes
    [0.015, rackH * 0.75].forEach(ty => {
      const tier = new THREE.Mesh(
        new THREE.BoxGeometry(rackW - 0.02, 0.015, rackD),
        this.materials.woodRack
      );
      tier.position.set(0, ty, 0);
      rack.add(tier);
    });

    // Test tubes (8 tubes)
    const tubeCount = 6;
    const startX = -rackW / 2 + 0.05;
    const stepX = (rackW - 0.1) / (tubeCount - 1);
    const liquids = [
      this.materials.liquidBlue,
      this.materials.liquidGreen,
      this.materials.liquidPurple,
      this.materials.liquidAmber,
      this.materials.liquidBlue,
      this.materials.liquidGreen
    ];

    for (let i = 0; i < tubeCount; i++) {
      const tx = startX + i * stepX;
      // Glass tube
      const tubeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.15, 16);
      const tube = new THREE.Mesh(tubeGeo, this.materials.glass);
      tube.position.set(tx, 0.09, 0);
      rack.add(tube);

      // Rounded bottom
      const roundBtm = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
        this.materials.glass
      );
      roundBtm.position.set(tx, 0.015, 0);
      rack.add(roundBtm);

      // Liquid inside
      const liqH = 0.08 + Math.random() * 0.04;
      const liq = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, liqH, 12),
        liquids[i % liquids.length]
      );
      liq.position.set(tx, 0.02 + liqH / 2, 0);
      rack.add(liq);
    }

    rack.position.set(x, y, z);
    this.group.add(rack);
  }

  createBeaker(x, y, z, radius, height, liquidMat) {
    const beaker = new THREE.Group();

    // Cylindrical wall
    const wall = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, height, 24, 1, true),
      this.materials.glass
    );
    wall.position.y = height / 2;
    beaker.add(wall);

    // Flat bottom
    const btm = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 24),
      this.materials.glass
    );
    btm.rotation.x = -Math.PI / 2;
    btm.position.y = 0.002;
    beaker.add(btm);

    // Liquid
    const liqH = height * 0.6;
    const liq = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.94, radius * 0.94, liqH, 20),
      liquidMat
    );
    liq.position.y = liqH / 2;
    beaker.add(liq);

    beaker.position.set(x, y, z);
    this.group.add(beaker);
  }

  createErlenmeyer(parent, x, y, z, baseR, height, liquidMat) {
    const flask = new THREE.Group();

    // Conical Body
    const coneH = height * 0.7;
    const cone = new THREE.Mesh(
      new THREE.CylinderGeometry(baseR * 0.35, baseR, coneH, 24, 1, true),
      this.materials.glass
    );
    cone.position.y = coneH / 2;
    flask.add(cone);

    // Bottom
    const btm = new THREE.Mesh(
      new THREE.CircleGeometry(baseR, 24),
      this.materials.glass
    );
    btm.rotation.x = -Math.PI / 2;
    btm.position.y = 0.002;
    flask.add(btm);

    // Cylindrical Neck
    const neckH = height * 0.3;
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(baseR * 0.35, baseR * 0.35, neckH, 20, 1, true),
      this.materials.glass
    );
    neck.position.y = coneH + neckH / 2;
    flask.add(neck);

    // Liquid
    const liqH = coneH * 0.7;
    const liq = new THREE.Mesh(
      new THREE.CylinderGeometry(baseR * 0.55, baseR * 0.92, liqH, 20),
      liquidMat
    );
    liq.position.y = liqH / 2;
    flask.add(liq);

    flask.position.set(x, y, z);
    parent.add(flask);
  }

  createBubblingFlask(x, y, z) {
    const flaskGroup = new THREE.Group();
    const baseR = 0.09;
    const height = 0.22;

    this.createErlenmeyer(flaskGroup, 0, 0, 0, baseR, height, this.materials.liquidBlue);

    // Animated Rising Bubbles inside
    const bubbleGeo = new THREE.SphereGeometry(0.006, 8, 8);
    const bubbleCount = 14;

    for (let i = 0; i < bubbleCount; i++) {
      const b = new THREE.Mesh(bubbleGeo, this.materials.bubbleMat);
      b.userData = {
        speed: 0.06 + Math.random() * 0.09,
        baseY: 0.02,
        maxY: 0.11,
        radiusSpread: 0.05,
        phase: Math.random() * Math.PI * 2
      };
      b.position.set(
        (Math.random() - 0.5) * 0.06,
        0.02 + Math.random() * 0.09,
        (Math.random() - 0.5) * 0.06
      );
      flaskGroup.add(b);
      this.bubbles.push(b);
    }

    flaskGroup.position.set(x, y, z);
    this.group.add(flaskGroup);
  }

  update(delta) {
    // 1. Animate rising bubbles
    for (let i = 0; i < this.bubbles.length; i++) {
      const b = this.bubbles[i];
      b.position.y += b.userData.speed * delta;
      b.position.x += Math.sin(b.userData.phase + b.position.y * 30) * 0.001;

      if (b.position.y > b.userData.maxY) {
        b.position.y = b.userData.baseY;
        b.position.x = (Math.random() - 0.5) * 0.06;
        b.position.z = (Math.random() - 0.5) * 0.06;
      }
    }

    // 2. Animate spinning magnetic stir bar & vortex
    if (this.stirrerRunning) {
      if (this.stirBar) {
        this.stirBar.rotation.y += delta * 25; // High speed spin
      }
      if (this.stirVortex) {
        this.stirVortex.rotation.y += delta * 8;
        // Subtle vortex pulse
        const s = 1.0 + Math.sin(Date.now() * 0.01) * 0.02;
        this.stirVortex.scale.set(s, 1, s);
      }
    }
  }
}
