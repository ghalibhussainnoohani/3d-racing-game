import * as THREE from 'three';

/**
 * 4 Rows of Student Desks (6 per row = 24 workstations)
 * Each with monitor (animated canvas screens), keyboard, mouse, PC tower,
 * desk lamp, and interactive office chair.
 */
export class StudentDesks {
  constructor(scene, colliders, interactables, screenManager) {
    this.scene = scene;
    this.colliders = colliders;
    this.interactables = interactables;
    this.screenManager = screenManager;
    this.group = new THREE.Group();

    this.desks = [];
    this.chairs = [];
    this.lamps = [];
    this.monitors = [];

    this.materials = this.initMaterials();
    this.init();
  }

  initMaterials() {
    return {
      deskTop: new THREE.MeshStandardMaterial({
        color: 0x334155, // Durable charcoal lab laminate
        roughness: 0.35,
        metalness: 0.1,
      }),
      deskLegs: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.25,
      }),
      pcCase: new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.3,
        metalness: 0.4,
      }),
      pcLed: new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x38bdf8,
        emissiveIntensity: 1.5,
      }),
      monitorBezel: new THREE.MeshStandardMaterial({
        color: 0x090d16,
        roughness: 0.25,
      }),
      monitorStand: new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.85,
        roughness: 0.2,
      }),
      keyboardMat: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
      }),
      mouseMat: new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.5,
      }),
      lampMetal: new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.8,
        roughness: 0.2,
      }),
      lampHead: new THREE.MeshStandardMaterial({
        color: 0x0284c7, // Lab blue shade
        roughness: 0.3,
      }),
      lampBulb: new THREE.MeshStandardMaterial({
        color: 0xffedd5,
        emissive: 0xfef08a,
        emissiveIntensity: 1.2,
      }),
      chairFabric: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.7,
      }),
      chairMetal: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.9,
        roughness: 0.2,
      }),
    };
  }

  init() {
    // 4 Rows along Z, 6 desks per row along X (3 on left aisle, 3 on right aisle)
    const rowZPositions = [2.1, 0.7, -0.7, -2.1];
    const leftXPositions = [-4.6, -3.1, -1.6];
    const rightXPositions = [1.6, 3.1, 4.6];
    const allXPositions = [...leftXPositions, ...rightXPositions];

    // Prepare monitor screen textures
    const screenTextures = [
      this.screenManager.createCodeEditorTexture(),
      this.screenManager.createTerminalTexture(),
      this.screenManager.createBrowserTexture(),
      this.screenManager.createDashboardTexture(),
      this.screenManager.createLoginTexture()
    ];

    let deskIndex = 0;

    for (let r = 0; r < rowZPositions.length; r++) {
      const z = rowZPositions[r];
      for (let c = 0; c < allXPositions.length; c++) {
        const x = allXPositions[c];
        const screenTex = screenTextures[deskIndex % screenTextures.length];

        this.createStudentWorkstation(x, z, screenTex, deskIndex);
        deskIndex++;
      }
    }

    this.scene.add(this.group);
  }

  createStudentWorkstation(x, z, screenTex, index) {
    const stationGroup = new THREE.Group();
    const deskW = 1.25;
    const deskD = 0.75;
    const deskH = 0.74;

    // 1. Desk Table
    const desk = this.createDesk(deskW, deskD, deskH);
    stationGroup.add(desk);

    // 2. PC Tower (placed under desk on right side)
    const pc = this.createPC();
    pc.position.set(deskW / 2 - 0.16, 0.22, 0);
    stationGroup.add(pc);

    // 3. Monitor with animated canvas screen (faces South towards student)
    const monitor = this.createMonitor(screenTex);
    monitor.position.set(0, deskH, -0.12);
    stationGroup.add(monitor);
    this.monitors.push(monitor);

    // 4. Keyboard & Mouse on desktop
    const kb = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.015, 0.14),
      this.materials.keyboardMat
    );
    kb.position.set(0, deskH + 0.008, 0.12);
    stationGroup.add(kb);

    const mouse = new THREE.Mesh(
      new THREE.BoxGeometry(0.065, 0.02, 0.1),
      this.materials.mouseMat
    );
    mouse.position.set(0.28, deskH + 0.01, 0.12);
    stationGroup.add(mouse);

    // 5. Desk Lamp (left corner of desk)
    const lamp = this.createDeskLamp();
    lamp.position.set(-deskW / 2 + 0.14, deskH, -deskD / 2 + 0.14);
    stationGroup.add(lamp);
    this.lamps.push(lamp);

    // 6. Office Chair tucked behind desk (at Z + 0.55)
    const chair = this.createChair();
    chair.position.set(0, 0, 0.58);
    // Add user data for sit interaction
    chair.userData = {
      isChair: true,
      name: `Student Workstation #${index + 1}`,
      action: 'Press E to Sit / Stand',
      seatWorldPos: new THREE.Vector3(x, 0.45, z + 0.58),
      chairIndex: index
    };
    stationGroup.add(chair);
    this.chairs.push(chair);
    this.interactables.push(chair);

    stationGroup.position.set(x, 0, z);
    this.group.add(stationGroup);

    // Add desk collider (allows player to walk around desks and chairs)
    const deskCollider = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(x, deskH / 2, z),
      new THREE.Vector3(deskW + 0.05, deskH, deskD + 0.05)
    );
    this.colliders.push(deskCollider);
  }

  createDesk(w, d, h) {
    const group = new THREE.Group();

    // Tabletop
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.035, d),
      this.materials.deskTop
    );
    top.position.y = h - 0.0175;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // 4 Tubular Steel Legs
    const legThick = 0.04;
    [-w / 2 + 0.06, w / 2 - 0.06].forEach(lx => {
      [-d / 2 + 0.06, d / 2 - 0.06].forEach(lz => {
        const leg = new THREE.Mesh(
          new THREE.BoxGeometry(legThick, h - 0.035, legThick),
          this.materials.deskLegs
        );
        leg.position.set(lx, (h - 0.035) / 2, lz);
        group.add(leg);
      });
    });

    // Modesty Panel across back of desk
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.12, 0.32, 0.02),
      this.materials.deskLegs
    );
    panel.position.set(0, h - 0.2, -d / 2 + 0.06);
    group.add(panel);

    return group;
  }

  createPC() {
    const pc = new THREE.Group();
    const w = 0.18;
    const h = 0.42;
    const d = 0.42;

    const caseMesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      this.materials.pcCase
    );
    caseMesh.castShadow = true;
    pc.add(caseMesh);

    // Power LED on front
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.006, 8, 8),
      this.materials.pcLed
    );
    led.position.set(0, h / 2 - 0.05, d / 2 + 0.005);
    pc.add(led);

    // Front intake air vents
    for (let v = 0; v < 4; v++) {
      const vent = new THREE.Mesh(
        new THREE.BoxGeometry(w - 0.04, 0.01, 0.01),
        this.materials.deskLegs
      );
      vent.position.set(0, -h / 4 + v * 0.03, d / 2 + 0.005);
      pc.add(vent);
    }

    return pc;
  }

  createMonitor(screenTex) {
    const group = new THREE.Group();
    const w = 0.54;
    const h = 0.33;

    // Bezel
    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.025),
      this.materials.monitorBezel
    );
    bezel.position.y = 0.23;
    bezel.castShadow = true;
    group.add(bezel);

    // Screen Display Plane (faces towards +Z direction, into room)
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(w - 0.03, h - 0.03),
      screenMat
    );
    screen.position.set(0, 0.23, 0.013);
    group.add(screen);

    // Stand Neck
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.16, 12),
      this.materials.monitorStand
    );
    neck.position.set(0, 0.1, -0.02);
    group.add(neck);

    // Stand Base Plate
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.01, 0.18),
      this.materials.monitorStand
    );
    base.position.set(0, 0.005, 0);
    group.add(base);

    return group;
  }

  createDeskLamp() {
    const lamp = new THREE.Group();

    // Round Base
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.07, 0.015, 16),
      this.materials.lampMetal
    );
    lamp.add(base);

    // Articulated Stem (Lower & Upper rods)
    const lowerArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.22, 8),
      this.materials.lampMetal
    );
    lowerArm.rotation.z = -0.3;
    lowerArm.position.set(0.03, 0.11, 0);
    lamp.add(lowerArm);

    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.22, 8),
      this.materials.lampMetal
    );
    upperArm.rotation.z = 0.45;
    upperArm.position.set(0.08, 0.28, 0);
    lamp.add(upperArm);

    // Lamp Shade Cone
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.065, 0.1, 16, 1, true),
      this.materials.lampHead
    );
    shade.rotation.z = Math.PI / 2 + 0.3;
    shade.position.set(0.18, 0.36, 0);
    lamp.add(shade);

    // Glowing Bulb inside shade
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 10, 10),
      this.materials.lampBulb
    );
    bulb.position.set(0.16, 0.35, 0);
    lamp.add(bulb);

    return lamp;
  }

  createChair() {
    const chair = new THREE.Group();

    // 5-Star Caster Base
    for (let c = 0; c < 5; c++) {
      const angle = (c * Math.PI * 2) / 5;
      const spoke = new THREE.Mesh(
        new THREE.BoxGeometry(0.025, 0.015, 0.24),
        this.materials.chairMetal
      );
      spoke.position.set(Math.sin(angle) * 0.12, 0.04, Math.cos(angle) * 0.12);
      spoke.rotation.y = angle;
      chair.add(spoke);

      // Caster wheel
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.015, 8),
        this.materials.deskLegs
      );
      wheel.position.set(Math.sin(angle) * 0.24, 0.02, Math.cos(angle) * 0.24);
      chair.add(wheel);
    }

    // Gas lift cylinder
    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.025, 0.34, 12),
      this.materials.chairMetal
    );
    cylinder.position.y = 0.21;
    chair.add(cylinder);

    // Seat cushion
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.06, 0.44),
      this.materials.chairFabric
    );
    seat.position.y = 0.41;
    seat.castShadow = true;
    chair.add(seat);

    // Mesh Backrest
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.44, 0.04),
      this.materials.chairFabric
    );
    back.position.set(0, 0.68, 0.2);
    back.rotation.x = -0.1;
    chair.add(back);

    return chair;
  }
}
