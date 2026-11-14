import * as THREE from 'three';
import { TextureGenerator, AnimatedMonitorScreen } from '../scene/textures.js';

/**
 * Computer & Analysis Corner:
 * Workstation desks, dual monitors with live animated canvas graphs (interactive click to cycle modes),
 * mechanical keyboards, optical mice, ergonomic chairs, and whiteboard with scientific formulas.
 */
export class ComputerStation {
  constructor(scene, colliders, interactables, soundManager) {
    this.scene = scene;
    this.colliders = colliders;
    this.interactables = interactables;
    this.soundManager = soundManager;
    this.group = new THREE.Group();

    this.monitors = [];

    this.materials = this.initMaterials();
    this.init();
  }

  initMaterials() {
    return {
      deskTop: new THREE.MeshStandardMaterial({
        color: 0x334155, // Charcoal laminate
        roughness: 0.35,
        metalness: 0.1,
      }),
      deskLegs: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.2,
      }),
      monitorBezel: new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.25,
        metalness: 0.2,
      }),
      monitorStand: new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.85,
        roughness: 0.2,
      }),
      chairMesh: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.7,
      }),
      chairMetal: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.9,
        roughness: 0.15,
      }),
      keyboardMat: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
      }),
      mousepadMat: new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.85,
      }),
      pcTowerMat: new THREE.MeshStandardMaterial({
        color: 0x090d16,
        roughness: 0.3,
        metalness: 0.5,
      }),
      pcLedMat: new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x38bdf8,
        emissiveIntensity: 2.0,
      }),
    };
  }

  init() {
    const deskX = 6.4;
    const deskZ = -3.2;
    const deskW = 0.9;
    const deskL = 2.4;
    const deskH = 0.75;

    // 1. Dual Workstation Desk
    this.createDesk(deskX, deskZ, deskW, deskL, deskH);

    // 2. Dual Monitors on Left Workstation
    this.createMonitorSetup(deskX, deskH, deskZ - 0.5);

    // 3. Ergonomic Office Chairs
    this.createOfficeChair(deskX - 0.7, 0, deskZ - 0.5);
    this.createOfficeChair(deskX - 0.7, 0, deskZ + 0.5);

    // 4. Whiteboard with formulas on East Wall (X = 7.9, Z = -3.2)
    this.createWhiteboard(7.88, 1.75, deskZ);

    this.scene.add(this.group);
  }

  createDesk(x, z, w, l, h) {
    const desk = new THREE.Group();

    // Top
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.04, l),
      this.materials.deskTop
    );
    top.position.y = h - 0.02;
    top.castShadow = true;
    top.receiveShadow = true;
    desk.add(top);

    // Steel frame legs
    const legThick = 0.05;
    [-w / 2 + 0.05, w / 2 - 0.05].forEach(lx => {
      [-l / 2 + 0.08, l / 2 - 0.08].forEach(lz => {
        const leg = new THREE.Mesh(
          new THREE.BoxGeometry(legThick, h - 0.04, legThick),
          this.materials.deskLegs
        );
        leg.position.set(lx, (h - 0.04) / 2, lz);
        desk.add(leg);
      });
    });

    // Horizontal crossbar
    const crossBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.04, l - 0.2),
      this.materials.deskLegs
    );
    crossBar.position.set(0, 0.2, 0);
    desk.add(crossBar);

    // Computer PC Tower on floor under desk
    const pc = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.44, 0.46),
      this.materials.pcTowerMat
    );
    pc.position.set(w / 2 - 0.18, 0.22, -l / 2 + 0.35);
    desk.add(pc);

    // PC power LED
    const pcLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.005, 8, 8),
      this.materials.pcLedMat
    );
    pcLed.position.set(w / 2 - 0.26, 0.4, -l / 2 + 0.58);
    desk.add(pcLed);

    desk.position.set(x, 0, z);
    this.group.add(desk);

    this.colliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, h / 2, z),
        new THREE.Vector3(w + 0.1, h, l + 0.1)
      )
    );
  }

  createMonitorSetup(deskX, deskY, centerZ) {
    const setup = new THREE.Group();

    // 1. Left Monitor (Interactive live graph display)
    const animScreen1 = new AnimatedMonitorScreen(512, 320);
    animScreen1.mode = 0; // HPLC
    this.monitors.push(animScreen1);

    const mon1 = this.createMonitor(animScreen1.texture, -0.42, 0.05);
    setup.add(mon1);

    // 2. Right Monitor (Interactive live graph display)
    const animScreen2 = new AnimatedMonitorScreen(512, 320);
    animScreen2.mode = 1; // Real-time PCR
    this.monitors.push(animScreen2);

    const mon2 = this.createMonitor(animScreen2.texture, 0.42, -0.05);
    setup.add(mon2);

    // Neoprene Desk Pad
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.004, 0.9),
      this.materials.mousepadMat
    );
    pad.position.set(-0.15, 0.002, 0);
    setup.add(pad);

    // Keyboard
    const kb = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.015, 0.46),
      this.materials.keyboardMat
    );
    kb.position.set(-0.15, 0.01, -0.1);
    setup.add(kb);

    // Optical Mouse
    const mouse = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.02, 0.11),
      this.materials.keyboardMat
    );
    mouse.position.set(-0.15, 0.012, 0.24);
    setup.add(mouse);

    setup.position.set(deskX, deskY, centerZ);
    this.group.add(setup);

    // Setup interactive toggle on monitors
    mon1.userData = {
      name: 'Chromatography Data Terminal',
      action: 'Click to Switch Analysis View',
      onClick: () => {
        animScreen1.toggleMode();
        if (this.soundManager) this.soundManager.playBeep();
      }
    };

    mon2.userData = {
      name: 'PCR Amplification Terminal',
      action: 'Click to Switch Analysis View',
      onClick: () => {
        animScreen2.toggleMode();
        if (this.soundManager) this.soundManager.playBeep();
      }
    };

    this.interactables.push(mon1, mon2);
  }

  createMonitor(screenTexture, zOffset, yawAngle) {
    const monGroup = new THREE.Group();
    const w = 0.58;
    const h = 0.36;

    // Bezel Frame
    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, h, w),
      this.materials.monitorBezel
    );
    bezel.position.y = 0.24;
    bezel.castShadow = true;
    monGroup.add(bezel);

    // Screen Display Plane
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
    });
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(w - 0.03, h - 0.03),
      screenMat
    );
    screen.rotation.y = -Math.PI / 2;
    screen.position.set(-0.013, 0.24, 0);
    monGroup.add(screen);

    // Monitor Stand Neck
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.18, 16),
      this.materials.monitorStand
    );
    neck.position.set(0.04, 0.12, 0);
    monGroup.add(neck);

    // Stand Base Plate
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.01, 0.22),
      this.materials.monitorStand
    );
    base.position.set(0.04, 0.005, 0);
    monGroup.add(base);

    monGroup.position.set(0.1, 0, zOffset);
    monGroup.rotation.y = yawAngle;
    return monGroup;
  }

  createOfficeChair(x, y, z) {
    const chair = new THREE.Group();

    // 5-Star Caster Base
    for (let c = 0; c < 5; c++) {
      const angle = (c * Math.PI * 2) / 5;
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.02, 0.28),
        this.materials.chairMetal
      );
      leg.position.set(Math.sin(angle) * 0.14, 0.05, Math.cos(angle) * 0.14);
      leg.rotation.y = angle;
      chair.add(leg);

      // Caster wheel
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.015, 8),
        this.materials.chairMesh
      );
      wheel.position.set(Math.sin(angle) * 0.28, 0.02, Math.cos(angle) * 0.28);
      chair.add(wheel);
    }

    // Pneumatic Center Cylinder
    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.03, 0.38, 16),
      this.materials.chairMetal
    );
    cylinder.position.y = 0.24;
    chair.add(cylinder);

    // Padded Seat Cushion
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.07, 0.48),
      this.materials.chairMesh
    );
    seat.position.y = 0.44;
    seat.castShadow = true;
    chair.add(seat);

    // Ergonomic Curved Mesh Backrest
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.52, 0.44),
      this.materials.chairMesh
    );
    back.position.set(0.24, 0.72, 0);
    back.rotation.z = -0.08;
    chair.add(back);

    // Armrests
    [-0.23, 0.23].forEach(az => {
      // Arm upright
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.2, 12),
        this.materials.chairMetal
      );
      post.position.set(0.05, 0.54, az);
      chair.add(post);

      // Arm pad
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.025, 0.06),
        this.materials.chairMesh
      );
      pad.position.set(0.05, 0.64, az);
      chair.add(pad);
    });

    chair.position.set(x, y, z);
    this.group.add(chair);
  }

  createWhiteboard(x, y, z) {
    const wbGroup = new THREE.Group();
    const w = 2.4;
    const h = 1.3;

    // Aluminum Perimeter Frame
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.2,
    });
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, h + 0.06, w + 0.06),
      frameMat
    );
    frame.position.set(0, 0, 0);
    wbGroup.add(frame);

    // Whiteboard Board Face with Formulas Texture
    const wbTex = TextureGenerator.createWhiteboardTexture();
    const wbMat = new THREE.MeshStandardMaterial({
      map: wbTex,
      roughness: 0.15,
      metalness: 0.05,
    });
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      wbMat
    );
    board.rotation.y = -Math.PI / 2;
    board.position.set(-0.021, 0, 0);
    wbGroup.add(board);

    // Aluminum Pen Tray at Bottom
    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.02, w - 0.2),
      frameMat
    );
    tray.position.set(-0.04, -h / 2 - 0.01, 0);
    wbGroup.add(tray);

    // Dry-Erase Markers on Tray
    const markerColors = [0x0f172a, 0x2563eb, 0xdc2626, 0x16a34a];
    markerColors.forEach((col, idx) => {
      const marker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.12, 10),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.3 })
      );
      marker.rotation.x = Math.PI / 2;
      marker.position.set(-0.04, -h / 2 + 0.015, -0.4 + idx * 0.14);
      wbGroup.add(marker);
    });

    // Eraser on tray
    const eraser = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.03, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
    );
    eraser.position.set(-0.04, -h / 2 + 0.02, 0.35);
    wbGroup.add(eraser);

    wbGroup.position.set(x, y, z);
    this.group.add(wbGroup);
  }

  update(delta) {
    // Update live animated monitors
    for (let i = 0; i < this.monitors.length; i++) {
      this.monitors[i].update(delta);
    }
  }
}
