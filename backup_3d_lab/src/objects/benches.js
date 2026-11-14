import * as THREE from 'three';
import { TextureGenerator } from '../scene/textures.js';

/**
 * Wet Lab Workbenches with chemical-resistant tops, sinks, gooseneck taps,
 * reagent shelves, cabinetry, and stools.
 */
export class LabBenches {
  constructor(scene, colliders) {
    this.scene = scene;
    this.colliders = colliders;
    this.group = new THREE.Group();

    this.materials = this.initMaterials();
    this.init();
  }

  initMaterials() {
    return {
      countertop: new THREE.MeshStandardMaterial({
        color: 0x111827, // Black chemical-resistant epoxy resin
        roughness: 0.25,
        metalness: 0.1,
      }),
      cabinet: new THREE.MeshStandardMaterial({
        color: 0xe2e8f0, // Clean light-grey powder-coated steel
        roughness: 0.4,
        metalness: 0.2,
      }),
      cabinetPlinth: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.7,
      }),
      shelfFrame: new THREE.MeshStandardMaterial({
        color: 0x334155, // Dark slate steel uprights
        roughness: 0.35,
        metalness: 0.7,
      }),
      shelfWood: new THREE.MeshStandardMaterial({
        color: 0xf1f5f9, // White phenolic resin shelves
        roughness: 0.3,
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.1,
        metalness: 0.95,
      }),
      sinkCeramic: new THREE.MeshStandardMaterial({
        color: 0x0f172a, // Chemical epoxy dark sink
        roughness: 0.3,
        metalness: 0.1,
      }),
      stoolSeat: new THREE.MeshStandardMaterial({
        color: 0x0f172a, // Black vinyl seat
        roughness: 0.5,
      }),
      stoolMetal: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.85,
        roughness: 0.2,
      }),
      bottleAmber: new THREE.MeshPhysicalMaterial({
        color: 0x78350f, // Amber glass
        transmission: 0.8,
        roughness: 0.15,
        transparent: true,
        opacity: 0.85,
        ior: 1.52,
      }),
      bottleClear: new THREE.MeshPhysicalMaterial({
        color: 0xf0fdf4,
        transmission: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.7,
        ior: 1.5,
      })
    };
  }

  init() {
    // 3 Central Workbenches parallel to Z axis
    const benchXPositions = [-2.8, 0.0, 2.8];

    benchXPositions.forEach((x, index) => {
      this.createWorkbench(x, 0, index);
    });

    this.scene.add(this.group);
  }

  createWorkbench(posX, posZ, index) {
    const benchGroup = new THREE.Group();
    const benchLength = 5.2; // Along Z
    const benchWidth = 1.25;  // Along X
    const benchHeight = 0.9;

    // 1. Black Chemical-Resistant Countertop
    const topThickness = 0.05;
    const topGeo = new THREE.BoxGeometry(benchWidth, topThickness, benchLength);
    const top = new THREE.Mesh(topGeo, this.materials.countertop);
    top.position.y = benchHeight - topThickness / 2;
    top.castShadow = true;
    top.receiveShadow = true;
    benchGroup.add(top);

    // 2. Baseboard / Plinth
    const plinthH = 0.08;
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(benchWidth - 0.1, plinthH, benchLength - 0.1),
      this.materials.cabinetPlinth
    );
    plinth.position.y = plinthH / 2;
    benchGroup.add(plinth);

    // 3. Under-bench Cabinets and Drawers (Modular bays along Z)
    const cabinetH = benchHeight - topThickness - plinthH;
    const bays = 4;
    const bayLen = (benchLength - 0.8) / bays; // Leave 0.8m for sink knee-space
    const cabStart = -benchLength / 2 + 0.8 + bayLen / 2;

    for (let b = 0; b < bays; b++) {
      const zPos = cabStart + b * bayLen;
      // Cabinet box
      const cab = new THREE.Mesh(
        new THREE.BoxGeometry(benchWidth - 0.08, cabinetH, bayLen - 0.04),
        this.materials.cabinet
      );
      cab.position.set(0, plinthH + cabinetH / 2, zPos);
      cab.castShadow = true;
      cab.receiveShadow = true;
      benchGroup.add(cab);

      // Handle on both sides of bench (West & East facing drawers)
      [-benchWidth / 2 + 0.02, benchWidth / 2 - 0.02].forEach(hx => {
        const handle = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.02, 0.15),
          this.materials.chrome
        );
        handle.position.set(hx, plinthH + cabinetH * 0.75, zPos);
        benchGroup.add(handle);

        const lowerHandle = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.02, 0.15),
          this.materials.chrome
        );
        lowerHandle.position.set(hx, plinthH + cabinetH * 0.35, zPos);
        benchGroup.add(lowerHandle);
      });
    }

    // 4. Lab Sink & Chrome Gooseneck Tap (at Z = -benchLength / 2 + 0.4)
    this.createSink(benchGroup, 0, benchHeight, -benchLength / 2 + 0.4);

    // 5. Overhead Reagent Shelving Unit
    this.createReagentShelves(benchGroup, benchLength - 0.8, benchHeight);

    // 6. Laboratory Stools tucked along the sides
    const stoolZPositions = [-1.2, 0.4, 2.0];
    stoolZPositions.forEach(sz => {
      this.createStool(benchGroup, -benchWidth / 2 - 0.38, sz);
      this.createStool(benchGroup, benchWidth / 2 + 0.38, sz);
    });

    benchGroup.position.set(posX, 0, posZ);
    this.group.add(benchGroup);

    // Add collider for the entire workbench block
    const boxCollider = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(posX, benchHeight / 2, posZ),
      new THREE.Vector3(benchWidth + 0.1, benchHeight, benchLength + 0.1)
    );
    this.colliders.push(boxCollider);
  }

  createSink(parent, x, y, z) {
    const sinkGroup = new THREE.Group();

    // Sink Basin (Black epoxy chemical drop-in)
    const basin = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.35, 0.55),
      this.materials.sinkCeramic
    );
    basin.position.set(x, y - 0.18, z);
    sinkGroup.add(basin);

    // Chrome Drain Rim
    const drain = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.01, 16),
      this.materials.chrome
    );
    drain.position.set(x, y - 0.34, z);
    sinkGroup.add(drain);

    // Gooseneck Faucet Base
    const faucetBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.03, 0.08, 16),
      this.materials.chrome
    );
    faucetBase.position.set(x, y + 0.04, z - 0.22);
    sinkGroup.add(faucetBase);

    // Vertical Riser Pipe
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.35, 16),
      this.materials.chrome
    );
    pipe.position.set(x, y + 0.21, z - 0.22);
    sinkGroup.add(pipe);

    // Gooseneck Arc (Torus segment)
    const neckArc = new THREE.Mesh(
      new THREE.TorusGeometry(0.08, 0.015, 12, 24, Math.PI),
      this.materials.chrome
    );
    neckArc.rotation.y = Math.PI / 2;
    neckArc.position.set(x, y + 0.38, z - 0.14);
    sinkGroup.add(neckArc);

    // Spout Tip
    const spout = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.014, 0.08, 16),
      this.materials.chrome
    );
    spout.position.set(x, y + 0.34, z - 0.06);
    sinkGroup.add(spout);

    // Hot & Cold Handle Knobs
    [-0.08, 0.08].forEach(hx => {
      const knob = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.04, 12),
        this.materials.chrome
      );
      knob.rotation.z = Math.PI / 2;
      knob.position.set(x + hx, y + 0.1, z - 0.22);
      sinkGroup.add(knob);
    });

    // Glassware Drying Rack (Pegboard beside sink)
    const rack = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.6, 0.45),
      this.materials.cabinet
    );
    rack.position.set(x + 0.45, y + 0.3, z);
    sinkGroup.add(rack);

    // Pegs on rack
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        const peg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8),
          this.materials.chrome
        );
        peg.rotation.x = -Math.PI / 6;
        peg.rotation.z = Math.PI / 2;
        peg.position.set(x + 0.48, y + 0.1 + r * 0.12, z - 0.15 + c * 0.14);
        sinkGroup.add(peg);
      }
    }

    parent.add(sinkGroup);
  }

  createReagentShelves(parent, shelfLength, benchY) {
    const shelfGroup = new THREE.Group();
    const shelfW = 0.35;
    const shelfH1 = benchY + 0.45;
    const shelfH2 = benchY + 0.85;

    // Upright steel support posts
    const postPositions = [-shelfLength / 2 + 0.1, 0, shelfLength / 2 - 0.1];
    postPositions.forEach(pz => {
      const postL = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 1.0, 0.04),
        this.materials.shelfFrame
      );
      postL.position.set(-shelfW / 2 + 0.02, benchY + 0.5, pz + 0.4);
      shelfGroup.add(postL);

      const postR = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 1.0, 0.04),
        this.materials.shelfFrame
      );
      postR.position.set(shelfW / 2 - 0.02, benchY + 0.5, pz + 0.4);
      shelfGroup.add(postR);
    });

    // Tier 1 Shelf Board
    const tier1 = new THREE.Mesh(
      new THREE.BoxGeometry(shelfW, 0.03, shelfLength),
      this.materials.shelfWood
    );
    tier1.position.set(0, shelfH1, 0.4);
    tier1.castShadow = true;
    tier1.receiveShadow = true;
    shelfGroup.add(tier1);

    // Tier 2 Shelf Board
    const tier2 = new THREE.Mesh(
      new THREE.BoxGeometry(shelfW, 0.03, shelfLength),
      this.materials.shelfWood
    );
    tier2.position.set(0, shelfH2, 0.4);
    tier2.castShadow = true;
    tier2.receiveShadow = true;
    shelfGroup.add(tier2);

    // Populate shelves with Reagent chemical bottles
    this.populateReagentBottles(shelfGroup, shelfLength, shelfH1 + 0.015, shelfH2 + 0.015);

    parent.add(shelfGroup);
  }

  populateReagentBottles(shelfGroup, shelfLength, h1, h2) {
    const reagents = [
      { name: 'NaCl 5M', f: 'Sodium Chloride', amber: false, haz: 'low' },
      { name: 'HCl 1M', f: 'Hydrochloric Acid', amber: true, haz: 'high' },
      { name: 'EtOH 99%', f: 'Ethanol Absolute', amber: true, haz: 'medium' },
      { name: 'PBS 10X', f: 'Phosphate Buffer', amber: false, haz: 'low' },
      { name: 'Tris-HCl', f: 'pH 8.0 Buffer', amber: false, haz: 'low' },
      { name: 'Methanol', f: 'HPLC Grade', amber: true, haz: 'high' },
      { name: 'EDTA 0.5M', f: 'Chelating Agent', amber: false, haz: 'low' },
      { name: 'Acetone', f: 'Analytical Grade', amber: true, haz: 'high' }
    ];

    const bottleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.16, 16);
    const neckGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.05, 16);
    const capGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.03, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

    for (let i = 0; i < reagents.length; i++) {
      const reg = reagents[i];
      const botGroup = new THREE.Group();

      const mat = reg.amber ? this.materials.bottleAmber : this.materials.bottleClear;
      const body = new THREE.Mesh(bottleGeo, mat);
      body.position.y = 0.08;
      body.castShadow = true;
      botGroup.add(body);

      const neck = new THREE.Mesh(neckGeo, mat);
      neck.position.y = 0.18;
      botGroup.add(neck);

      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.21;
      botGroup.add(cap);

      // Label
      const labelTex = TextureGenerator.createBottleLabelTexture(reg.name, reg.f, reg.haz);
      const labelMat = new THREE.MeshBasicMaterial({ map: labelTex });
      const label = new THREE.Mesh(new THREE.PlaneGeometry(0.065, 0.045), labelMat);
      label.position.set(0, 0.08, 0.046);
      botGroup.add(label);

      // Distribute onto tier 1 and tier 2
      const isTier2 = i % 2 === 1;
      const targetY = isTier2 ? h2 : h1;
      const zOffset = -shelfLength / 2 + 0.3 + (i * 0.48);

      botGroup.position.set((i % 3 === 0 ? 0.08 : -0.08), targetY, 0.4 + (zOffset % (shelfLength - 0.6)));
      botGroup.rotation.y = (i * 0.4);
      shelfGroup.add(botGroup);
    }
  }

  createStool(parent, x, z) {
    const stoolGroup = new THREE.Group();

    // Round Seat
    const seatGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 24);
    const seat = new THREE.Mesh(seatGeo, this.materials.stoolSeat);
    seat.position.y = 0.65;
    seat.castShadow = true;
    stoolGroup.add(seat);

    // Chrome Pedestal Center Column
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.62, 16),
      this.materials.stoolMetal
    );
    pole.position.y = 0.31;
    stoolGroup.add(pole);

    // Footrest Ring
    const footRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.012, 8, 20),
      this.materials.stoolMetal
    );
    footRing.rotation.x = Math.PI / 2;
    footRing.position.y = 0.22;
    stoolGroup.add(footRing);

    // 5-Star Caster Base
    for (let leg = 0; leg < 5; leg++) {
      const angle = (leg * Math.PI * 2) / 5;
      const legMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.02, 0.24),
        this.materials.stoolMetal
      );
      legMesh.position.set(Math.sin(angle) * 0.12, 0.04, Math.cos(angle) * 0.12);
      legMesh.rotation.y = angle;
      stoolGroup.add(legMesh);
    }

    stoolGroup.position.set(x, 0, z);
    parent.add(stoolGroup);
  }
}
