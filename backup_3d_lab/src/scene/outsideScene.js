import * as THREE from 'three';

/**
 * Exterior Environment & Realistic Windows with Interactive Blinds:
 * 3 large windows with molded frames, mullions, window sills, and reflective glass.
 * Outside scene includes: lawn, road with lane stripes, trees, distant university buildings,
 * soft procedural clouds, and day/night lighting integration.
 */
export class OutsideScene {
  constructor(scene, interactables, lighting) {
    this.scene = scene;
    this.interactables = interactables;
    this.lighting = lighting;
    this.group = new THREE.Group();

    this.blinds = [];
    this.blindsOpen = true;
    this.clouds = [];
    this.isNight = false;

    this.materials = this.initMaterials();
    this.init();
  }

  initMaterials() {
    return {
      frameWhite: new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.3,
        metalness: 0.1,
      }),
      sillWood: new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.3,
      }),
      windowGlass: new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.9,
        transparent: true,
        opacity: 0.35,
        ior: 1.52,
      }),
      blindSlats: new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.4,
      }),
      blindRail: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.8,
        roughness: 0.2,
      }),
      lawnGrass: new THREE.MeshStandardMaterial({
        color: 0x2e7d32, // Manicured campus lawn green
        roughness: 0.8,
      }),
      sidewalk: new THREE.MeshStandardMaterial({
        color: 0xcfd8dc,
        roughness: 0.6,
      }),
      roadAsphalt: new THREE.MeshStandardMaterial({
        color: 0x263238,
        roughness: 0.7,
      }),
      roadStripe: new THREE.MeshBasicMaterial({
        color: 0xfacc15,
      }),
      treeTrunk: new THREE.MeshStandardMaterial({
        color: 0x4e342e,
        roughness: 0.85,
      }),
      treeLeaves: new THREE.MeshStandardMaterial({
        color: 0x388e3c,
        roughness: 0.6,
      }),
      buildingBrick: new THREE.MeshStandardMaterial({
        color: 0xb0bec5, // Modern campus architecture
        roughness: 0.5,
      }),
      buildingGlass: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.1,
        metalness: 0.8,
      }),
      cloudMat: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.9,
        transparent: true,
        opacity: 0.85,
      }),
      sunMeshMat: new THREE.MeshBasicMaterial({
        color: 0xfef08a,
      }),
    };
  }

  init() {
    // 1. Build 3 Large Windows along North Wall (Z = -5.0)
    const windowXPositions = [-4.6, 0.0, 4.6];
    const winWidth = 3.4;
    const winHeight = 1.9;
    const winY = 1.8;

    windowXPositions.forEach((wx, idx) => {
      this.createLargeWindow(wx, winY, -4.95, winWidth, winHeight, idx);
    });

    // 2. Build Exterior Environment beyond Z = -5.5
    this.buildLawnAndRoad();
    this.buildTrees();
    this.buildCampusBuildings();
    this.buildClouds();
    this.buildSunAndSky();

    this.scene.add(this.group);
  }

  createLargeWindow(x, y, z, w, h, index) {
    const winGroup = new THREE.Group();

    // A. Molded Outer Perimeter Frame
    const frameT = 0.09;
    const frameD = 0.14;

    // Top & Bottom rails
    [h / 2, -h / 2].forEach(fy => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(w + frameT * 2, frameT, frameD),
        this.materials.frameWhite
      );
      rail.position.set(0, fy, 0);
      winGroup.add(rail);
    });

    // Left & Right jambs
    [-w / 2, w / 2].forEach(fx => {
      const jamb = new THREE.Mesh(
        new THREE.BoxGeometry(frameT, h, frameD),
        this.materials.frameWhite
      );
      jamb.position.set(fx, 0, 0);
      winGroup.add(jamb);
    });

    // B. Mullion Divider (Cross mullion in center)
    const mulV = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, h, 0.08),
      this.materials.frameWhite
    );
    winGroup.add(mulV);

    const mulH = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.05, 0.08),
      this.materials.frameWhite
    );
    winGroup.add(mulH);

    // C. Deep Interior Window Sill (projecting inwards into room)
    const sill = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.24, 0.05, 0.32),
      this.materials.sillWood
    );
    sill.position.set(0, -h / 2 - 0.02, 0.08);
    sill.receiveShadow = true;
    winGroup.add(sill);

    // D. Glass Pane
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      this.materials.windowGlass
    );
    winGroup.add(glass);

    // E. Interactive Blinds (Venetian blinds that lower/raise on click)
    const blindGroup = new THREE.Group();
    const headRail = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.05, 0.06),
      this.materials.blindRail
    );
    headRail.position.set(0, h / 2 - 0.03, 0.06);
    blindGroup.add(headRail);

    // Slat stack (scale Y to open/close)
    const slats = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.06, h - 0.08, 0.02),
      this.materials.blindSlats
    );
    slats.position.set(0, 0, 0.06);
    slats.scale.y = 0.15; // Start open/retracted at top
    blindGroup.add(slats);

    blindGroup.position.set(0, 0, 0);
    winGroup.add(blindGroup);

    // Store blind reference for animation
    const blindData = {
      group: blindGroup,
      slats: slats,
      targetScaleY: 0.15,
      currentScaleY: 0.15,
      isOpen: true
    };
    this.blinds.push(blindData);

    // Setup click interaction to toggle blinds
    headRail.userData = {
      name: `Window Blinds #${index + 1}`,
      action: 'Click to Open / Close Blinds',
      onClick: () => this.toggleBlinds(index)
    };
    slats.userData = headRail.userData;
    glass.userData = headRail.userData;
    this.interactables.push(headRail, slats, glass);

    winGroup.position.set(x, y, z);
    this.group.add(winGroup);
  }

  toggleBlinds(index) {
    const b = this.blinds[index];
    if (!b) return;
    b.isOpen = !b.isOpen;
    b.targetScaleY = b.isOpen ? 0.15 : 1.0;
  }

  buildLawnAndRoad() {
    // 1. Manicured Green Lawn spanning from Z = -5.2 to Z = -18
    const lawnGeo = new THREE.PlaneGeometry(50, 14);
    const lawn = new THREE.Mesh(lawnGeo, this.materials.lawnGrass);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.set(0, -0.05, -12);
    this.group.add(lawn);

    // 2. Concrete Sidewalk (Z = -18 to -20)
    const walkGeo = new THREE.PlaneGeometry(50, 2);
    const walk = new THREE.Mesh(walkGeo, this.materials.sidewalk);
    walk.rotation.x = -Math.PI / 2;
    walk.position.set(0, -0.04, -19);
    this.group.add(walk);

    // 3. Two-Lane Asphalt Road (Z = -20 to -28)
    const roadGeo = new THREE.PlaneGeometry(50, 8);
    const road = new THREE.Mesh(roadGeo, this.materials.roadAsphalt);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -0.03, -24);
    this.group.add(road);

    // Road dashed center line
    for (let s = -22; s < 25; s += 3.5) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 0.18),
        this.materials.roadStripe
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(s, -0.02, -24);
      this.group.add(stripe);
    }
  }

  buildTrees() {
    // Row of procedural leafy trees along the lawn and sidewalk
    const treePositions = [
      [-12, -9], [-7, -10], [-2, -8.5], [3, -9], [8, -10], [13, -8.5],
      [-10, -16], [-3, -15], [4, -16], [11, -15]
    ];

    treePositions.forEach(([tx, tz]) => {
      const tree = new THREE.Group();

      // Tree Trunk
      const trunkH = 2.2 + Math.random() * 0.8;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.24, trunkH, 8),
        this.materials.treeTrunk
      );
      trunk.position.y = trunkH / 2;
      tree.add(trunk);

      // Foliage Clumps (overlapping spheres)
      const foliageGroup = new THREE.Group();
      const foliageR = 1.4 + Math.random() * 0.4;

      const clump1 = new THREE.Mesh(
        new THREE.SphereGeometry(foliageR, 10, 8),
        this.materials.treeLeaves
      );
      clump1.position.set(0, trunkH + foliageR * 0.8, 0);
      foliageGroup.add(clump1);

      const clump2 = new THREE.Mesh(
        new THREE.SphereGeometry(foliageR * 0.8, 8, 8),
        this.materials.treeLeaves
      );
      clump2.position.set(0.6, trunkH + foliageR * 0.5, 0.4);
      foliageGroup.add(clump2);

      const clump3 = new THREE.Mesh(
        new THREE.SphereGeometry(foliageR * 0.75, 8, 8),
        this.materials.treeLeaves
      );
      clump3.position.set(-0.5, trunkH + foliageR * 0.6, -0.3);
      foliageGroup.add(clump3);

      tree.add(foliageGroup);
      tree.position.set(tx, 0, tz);
      this.group.add(tree);
    });
  }

  buildCampusBuildings() {
    // Distant university campus academic buildings on the other side of the road (Z = -32 to -45)
    const buildings = [
      { x: -14, z: -34, w: 10, h: 12, d: 8 },
      { x: -3,  z: -38, w: 12, h: 16, d: 10 },
      { x: 11,  z: -35, w: 11, h: 14, d: 9 }
    ];

    buildings.forEach(b => {
      const bldg = new THREE.Group();

      // Facade block
      const mass = new THREE.Mesh(
        new THREE.BoxGeometry(b.w, b.h, b.d),
        this.materials.buildingBrick
      );
      mass.position.y = b.h / 2;
      bldg.add(mass);

      // Glass ribbon windows along facade
      const floors = Math.floor(b.h / 2.5);
      for (let f = 1; f < floors; f++) {
        const winBand = new THREE.Mesh(
          new THREE.BoxGeometry(b.w - 0.4, 1.1, 0.05),
          this.materials.buildingGlass
        );
        winBand.position.set(0, f * 2.5, b.d / 2 + 0.02);
        bldg.add(winBand);
      }

      bldg.position.set(b.x, 0, b.z);
      this.group.add(bldg);
    });
  }

  buildClouds() {
    // Procedural soft cloud clumps in the sky
    const cloudPositions = [
      [-12, 11, -22], [2, 13, -26], [16, 12, -24], [-6, 14, -30]
    ];

    cloudPositions.forEach(([cx, cy, cz]) => {
      const cloud = new THREE.Group();
      for (let p = 0; p < 5; p++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(1.6 + Math.random() * 0.8, 8, 8),
          this.materials.cloudMat
        );
        puff.position.set(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 2
        );
        cloud.add(puff);
      }
      cloud.position.set(cx, cy, cz);
      this.group.add(cloud);
      this.clouds.push(cloud);
    });
  }

  buildSunAndSky() {
    // Glowing Sun disc in sky
    this.sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(2.0, 16, 16),
      this.materials.sunMeshMat
    );
    this.sunMesh.position.set(8, 16, -32);
    this.group.add(this.sunMesh);
  }

  setNightMode(isNight) {
    this.isNight = isNight;

    if (isNight) {
      this.materials.lawnGrass.color.setHex(0x0f291e);
      this.materials.roadAsphalt.color.setHex(0x0a0f14);
      this.materials.buildingBrick.color.setHex(0x1e293b);
      this.materials.buildingGlass.color.setHex(0xfef08a); // Lit office windows at night!
      this.materials.buildingGlass.emissive = new THREE.Color(0xfef08a);
      this.materials.buildingGlass.emissiveIntensity = 0.5;
      this.sunMesh.material.color.setHex(0xe2e8f0); // Pale moon
    } else {
      this.materials.lawnGrass.color.setHex(0x2e7d32);
      this.materials.roadAsphalt.color.setHex(0x263238);
      this.materials.buildingBrick.color.setHex(0xb0bec5);
      this.materials.buildingGlass.color.setHex(0x1e293b);
      this.materials.buildingGlass.emissive = new THREE.Color(0x000000);
      this.materials.buildingGlass.emissiveIntensity = 0;
      this.sunMesh.material.color.setHex(0xfef08a);
    }
  }

  update(delta) {
    // 1. Animate blind slat extension / retraction
    for (let i = 0; i < this.blinds.length; i++) {
      const b = this.blinds[i];
      if (Math.abs(b.currentScaleY - b.targetScaleY) > 0.005) {
        b.currentScaleY += (b.targetScaleY - b.currentScaleY) * delta * 5;
        b.slats.scale.y = b.currentScaleY;
        b.slats.position.y = (1.9 / 2) * (1 - b.currentScaleY);
      }
    }

    // 2. Gentle drift for exterior clouds
    for (let c = 0; c < this.clouds.length; c++) {
      this.clouds[c].position.x += delta * 0.15;
      if (this.clouds[c].position.x > 25) {
        this.clouds[c].position.x = -25;
      }
    }
  }
}
