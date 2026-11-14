import * as THREE from 'three';

/**
 * Laboratory Equipment Details:
 * Micropipette carousel racks, wash bottles, sample vial racks, 96-well PCR plates,
 * biohazard foot-pedal waste bin, rolling 3-tier utility cart, and cable conduit detailing.
 */
export class LabDetails {
  constructor(scene, colliders, interactables) {
    this.scene = scene;
    this.colliders = colliders;
    this.interactables = interactables;
    this.group = new THREE.Group();

    this.materials = this.initMaterials();
    this.init();
  }

  initMaterials() {
    return {
      stainless: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.9,
        roughness: 0.2,
      }),
      plasticWhite: new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.3,
      }),
      plasticTranslucent: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.2,
        transmission: 0.85,
        transparent: true,
        opacity: 0.7,
      }),
      biohazardBag: new THREE.MeshStandardMaterial({
        color: 0xdc2626, // Red biohazard bag liner
        roughness: 0.6,
      }),
      biohazardBin: new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.4,
      }),
      cableBlack: new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.7,
      }),
      washRed: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }),
      washBlue: new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 }),
      washYellow: new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3 }),
      pipetteP20: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }),
      pipetteP200: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 }),
      pipetteP1000: new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 }),
      pipetteP10: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3 }),
    };
  }

  init() {
    // 1. Micropipette Carousel Racks on Bench 1 & Bench 2
    this.createPipetteRack(-2.8, 0.9, 1.4);
    this.createPipetteRack(0.0, 0.9, 1.2);

    // 2. Wash Bottles on Bench 1 & Bench 3
    this.createWashBottle(-2.6, 0.9, -1.2, this.materials.washRed);    // Ethanol
    this.createWashBottle(-2.75, 0.9, -1.2, this.materials.washBlue);  // dH2O
    this.createWashBottle(2.6, 0.9, 1.2, this.materials.washYellow);   // Acetone

    // 3. 96-Well Microplate on Center Bench
    this.createMicroplate(0.0, 0.9, -1.3);

    // 4. Biohazard Waste Step-On Bin beside Center Bench (X = -1.2, Z = 2.4)
    this.createBiohazardBin(-1.4, 0, 2.4);

    // 5. Rolling Stainless Steel Utility Cart in Aisle (X = 1.4, Z = -1.2)
    this.createRollingCart(1.4, 0, -1.2);

    this.scene.add(this.group);
  }

  createPipetteRack(x, y, z) {
    const rack = new THREE.Group();

    // Circular Base
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.11, 0.02, 24),
      this.materials.plasticWhite
    );
    rack.add(base);

    // Center Stand Column
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.32, 16),
      this.materials.stainless
    );
    pole.position.y = 0.16;
    rack.add(pole);

    // Top Carousel Disc
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.025, 24),
      this.materials.plasticWhite
    );
    disc.position.y = 0.31;
    rack.add(disc);

    // 4 Pipettes hanging around the disc
    const pipettes = [
      { mat: this.materials.pipetteP10, name: 'P10 (0.5-10 µL)' },
      { mat: this.materials.pipetteP20, name: 'P20 (2-20 µL)' },
      { mat: this.materials.pipetteP200, name: 'P200 (20-200 µL)' },
      { mat: this.materials.pipetteP1000, name: 'P1000 (100-1000 µL)' }
    ];

    pipettes.forEach((pip, idx) => {
      const angle = (idx * Math.PI * 2) / 4;
      const pipGroup = new THREE.Group();

      // Ergonomic Body Handle
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.16, 12),
        pip.mat
      );
      body.position.y = 0.22;
      pipGroup.add(body);

      // Volume Display Window
      const window = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.03, 0.008),
        this.materials.plasticWhite
      );
      window.position.set(0, 0.24, 0.01);
      pipGroup.add(window);

      // Lower Shaft
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.008, 0.12, 10),
        this.materials.plasticWhite
      );
      shaft.position.y = 0.08;
      pipGroup.add(shaft);

      // Plunger Button on top
      const plunger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.02, 10),
        this.materials.stainless
      );
      plunger.position.y = 0.31;
      pipGroup.add(plunger);

      pipGroup.position.set(Math.sin(angle) * 0.075, 0, Math.cos(angle) * 0.075);
      rack.add(pipGroup);
    });

    rack.position.set(x, y, z);
    this.group.add(rack);
  }

  createWashBottle(x, y, z, capMat) {
    const bottle = new THREE.Group();

    // Translucent Squeeze Body (500 mL)
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.16, 18),
      this.materials.plasticTranslucent
    );
    body.position.y = 0.08;
    bottle.add(body);

    // Shoulder & Neck
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.038, 0.04, 16),
      this.materials.plasticTranslucent
    );
    neck.position.y = 0.18;
    bottle.add(neck);

    // Color Coded Cap
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.025, 16),
      capMat
    );
    cap.position.y = 0.205;
    bottle.add(cap);

    // Angled Gooseneck Delivery Tube Spout
    const spout = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.004, 0.12, 8),
      capMat
    );
    spout.rotation.z = -Math.PI / 4;
    spout.position.set(0.04, 0.25, 0);
    bottle.add(spout);

    bottle.position.set(x, y, z);
    this.group.add(bottle);
  }

  createMicroplate(x, y, z) {
    const plate = new THREE.Group();
    const w = 0.22; // 12 columns
    const d = 0.15; // 8 rows
    const h = 0.025;

    // Rigid Plastic Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      this.materials.plasticTranslucent
    );
    frame.position.y = h / 2;
    plate.add(frame);

    // 96 Wells (Simulated with top indent grid)
    const wellMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1 });
    const cols = 12;
    const rows = 8;
    const startX = -w / 2 + 0.02;
    const stepX = (w - 0.04) / (cols - 1);
    const startZ = -d / 2 + 0.02;
    const stepZ = (d - 0.04) / (rows - 1);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const well = new THREE.Mesh(
          new THREE.CylinderGeometry(0.004, 0.004, 0.005, 8),
          wellMat
        );
        well.position.set(startX + c * stepX, h + 0.001, startZ + r * stepZ);
        plate.add(well);
      }
    }

    plate.position.set(x, y, z);
    this.group.add(plate);
  }

  createBiohazardBin(x, y, z) {
    const bin = new THREE.Group();
    const w = 0.36;
    const d = 0.36;
    const h = 0.55;

    // Outer Enclosure
    const outer = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      this.materials.biohazardBin
    );
    outer.position.y = h / 2;
    bin.add(outer);

    // Lid
    const lid = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.02, 0.03, d + 0.02),
      this.materials.biohazardBin
    );
    lid.position.y = h + 0.015;
    bin.add(lid);

    // Red Bag Liner Rim visible at top
    const liner = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.01, 0.04, d + 0.01),
      this.materials.biohazardBag
    );
    liner.position.y = h - 0.02;
    bin.add(liner);

    // Foot Pedal at base
    const pedal = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.02, 0.06),
      this.materials.stainless
    );
    pedal.position.set(0, 0.02, d / 2 + 0.03);
    bin.add(pedal);

    bin.position.set(x, y, z);
    this.group.add(bin);

    this.colliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, h / 2, z),
        new THREE.Vector3(w + 0.1, h, d + 0.1)
      )
    );
  }

  createRollingCart(x, y, z) {
    const cart = new THREE.Group();
    const w = 0.65;
    const d = 0.85;
    const h = 0.9;

    // 4 Upright tubular legs
    [-w / 2 + 0.03, w / 2 - 0.03].forEach(lx => {
      [-d / 2 + 0.03, d / 2 - 0.03].forEach(lz => {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.015, h, 12),
          this.materials.stainless
        );
        leg.position.set(lx, h / 2, lz);
        cart.add(leg);

        // Caster wheel
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, 0.02, 10),
          this.materials.cableBlack
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(lx, 0.03, lz);
        cart.add(wheel);
      });
    });

    // 3 Stainless Steel Shelves with raised lip guardrails
    [0.15, 0.5, 0.88].forEach(sy => {
      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.02, d),
        this.materials.stainless
      );
      shelf.position.set(0, sy, 0);
      cart.add(shelf);

      // Guardrail lip around shelf
      const lip = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.01, 0.04, d + 0.01),
        this.materials.stainless
      );
      lip.position.set(0, sy + 0.02, 0);
      cart.add(lip);
    });

    // Push Handle on one side
    const handleBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, w, 12),
      this.materials.stainless
    );
    handleBar.rotation.z = Math.PI / 2;
    handleBar.position.set(0, h + 0.04, -d / 2 - 0.08);
    cart.add(handleBar);

    // Beakers and test tube racks on top shelf
    const beakerOnCart = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.12, 16),
      this.materials.plasticTranslucent
    );
    beakerOnCart.position.set(-0.12, 0.96, 0.1);
    cart.add(beakerOnCart);

    cart.position.set(x, y, z);
    this.group.add(cart);

    this.colliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, h / 2, z),
        new THREE.Vector3(w + 0.1, h, d + 0.1)
      )
    );
  }
}
