import * as THREE from 'three';

/**
 * Teacher Station at the front of the computer lab:
 * Executive teacher desk with dual monitors, smart board / interactive projector screen
 * showing multi-slide lecture, dry-erase whiteboard, and ceiling projector.
 */
export class TeacherStation {
  constructor(scene, colliders, interactables, screenManager) {
    this.scene = scene;
    this.colliders = colliders;
    this.interactables = interactables;
    this.screenManager = screenManager;
    this.group = new THREE.Group();

    this.materials = this.initMaterials();
    this.init();
  }

  initMaterials() {
    return {
      deskWood: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.1,
      }),
      deskTrim: new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.2,
      }),
      monitorBezel: new THREE.MeshStandardMaterial({
        color: 0x090d16,
        roughness: 0.2,
      }),
      aluminum: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.85,
        roughness: 0.2,
      }),
      projectorCasing: new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.3,
      }),
      projectorLens: new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x38bdf8,
        emissiveIntensity: 1.5,
      }),
      projectorBeam: new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
      }),
      whiteboardSurface: new THREE.MeshStandardMaterial({
        color: 0xfdfdfd,
        roughness: 0.15,
      }),
      chairFabric: new THREE.MeshStandardMaterial({
        color: 0x0284c7, // Distinct teacher blue
        roughness: 0.6,
      }),
    };
  }

  init() {
    const deskX = 0;
    const deskZ = 3.6;
    const deskW = 2.2;
    const deskD = 0.9;
    const deskH = 0.76;

    // 1. Teacher Executive Desk
    this.createTeacherDesk(deskX, deskZ, deskW, deskD, deskH);

    // 2. Dual Monitors on Desk
    this.createTeacherMonitors(deskX, deskH, deskZ);

    // 3. Teacher Chair
    this.createTeacherChair(deskX, 0, deskZ + 0.6);

    // 4. Large Smart Board / Projector Screen on South Wall (X = 0, Z = 4.88)
    this.createSmartBoard(0, 1.85, 4.88);

    // 5. Whiteboard next to Smart Board (X = 3.6, Z = 4.88)
    this.createWhiteboard(3.6, 1.75, 4.88);

    // 6. Ceiling Projector aimed at Smart Board
    this.createCeilingProjector(0, 3.0, 1.2);

    this.scene.add(this.group);
  }

  createTeacherDesk(x, z, w, d, h) {
    const desk = new THREE.Group();

    // Desk top
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.04, d),
      this.materials.deskWood
    );
    top.position.y = h - 0.02;
    top.castShadow = true;
    top.receiveShadow = true;
    desk.add(top);

    // Front modesty panel with subtle blue accent band
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.05, h - 0.04, 0.02),
      this.materials.deskWood
    );
    panel.position.set(0, (h - 0.04) / 2, -d / 2 + 0.04);
    desk.add(panel);

    const accent = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.05, 0.04, 0.025),
      this.materials.deskTrim
    );
    accent.position.set(0, h - 0.12, -d / 2 + 0.04);
    desk.add(accent);

    // Side pedestals (drawers)
    [-w / 2 + 0.22, w / 2 - 0.22].forEach(px => {
      const ped = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, h - 0.04, d - 0.1),
        this.materials.deskWood
      );
      ped.position.set(px, (h - 0.04) / 2, 0.02);
      desk.add(ped);
    });

    desk.position.set(x, 0, z);
    this.group.add(desk);

    this.colliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, h / 2, z),
        new THREE.Vector3(w + 0.1, h, d + 0.1)
      )
    );
  }

  createTeacherMonitors(deskX, deskY, deskZ) {
    const setup = new THREE.Group();
    const w = 0.58;
    const h = 0.36;

    // Dual monitors angled slightly toward the teacher
    [-0.34, 0.34].forEach((mx, idx) => {
      const monGroup = new THREE.Group();

      const bezel = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, 0.025),
        this.materials.monitorBezel
      );
      bezel.position.y = 0.23;
      monGroup.add(bezel);

      // Screens: Left is Dashboard, Right is Code
      const screenTex = idx === 0
        ? this.screenManager.createDashboardTexture()
        : this.screenManager.createCodeEditorTexture();

      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(w - 0.03, h - 0.03),
        new THREE.MeshBasicMaterial({ map: screenTex })
      );
      screen.position.set(0, 0.23, -0.013);
      screen.rotation.y = Math.PI; // Face towards teacher (+Z)
      monGroup.add(screen);

      // Stand
      const stand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.16, 12),
        this.materials.aluminum
      );
      stand.position.set(0, 0.1, 0);
      monGroup.add(stand);

      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.01, 0.18),
        this.materials.aluminum
      );
      base.position.set(0, 0.005, 0);
      monGroup.add(base);

      monGroup.position.set(mx, 0, -0.15);
      monGroup.rotation.y = idx === 0 ? 0.18 : -0.18;
      setup.add(monGroup);
    });

    // Keyboard & Mouse
    const kb = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.015, 0.14),
      this.materials.monitorBezel
    );
    kb.position.set(0, 0.008, 0.15);
    setup.add(kb);

    const mouse = new THREE.Mesh(
      new THREE.BoxGeometry(0.065, 0.02, 0.1),
      this.materials.monitorBezel
    );
    mouse.position.set(0.3, 0.01, 0.15);
    setup.add(mouse);

    setup.position.set(deskX, deskY, deskZ);
    this.group.add(setup);
  }

  createTeacherChair(x, y, z) {
    const chair = new THREE.Group();

    // 5-Star Caster Base
    for (let c = 0; c < 5; c++) {
      const angle = (c * Math.PI * 2) / 5;
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.015, 0.28),
        this.materials.aluminum
      );
      leg.position.set(Math.sin(angle) * 0.14, 0.04, Math.cos(angle) * 0.14);
      leg.rotation.y = angle;
      chair.add(leg);
    }

    // Cylinder
    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.028, 0.36, 16),
      this.materials.aluminum
    );
    cylinder.position.y = 0.22;
    chair.add(cylinder);

    // Premium high-back executive seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.08, 0.5),
      this.materials.chairFabric
    );
    seat.position.y = 0.44;
    chair.add(seat);

    const highBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.65, 0.06),
      this.materials.chairFabric
    );
    highBack.position.set(0, 0.8, 0.22);
    highBack.rotation.x = -0.08;
    chair.add(highBack);

    chair.position.set(x, y, z);
    chair.rotation.y = Math.PI; // Faces North towards students

    chair.userData = {
      isChair: true,
      name: 'Teacher Chair',
      action: 'Press E to Sit / Stand',
      seatWorldPos: new THREE.Vector3(x, 0.45, z),
      chairIndex: 99
    };
    this.interactables.push(chair);
    this.group.add(chair);
  }

  createSmartBoard(x, y, z) {
    const sbGroup = new THREE.Group();
    const w = 3.6;
    const h = 2.0;

    // Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.04),
      this.materials.aluminum
    );
    sbGroup.add(frame);

    // Interactive Screen Surface
    const smartScreen = this.screenManager.createSmartBoardTexture();
    const screenMat = new THREE.MeshBasicMaterial({ map: smartScreen.texture });
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      screenMat
    );
    screen.rotation.y = Math.PI; // Face North
    screen.position.set(0, 0, -0.022);
    sbGroup.add(screen);

    // Sound bar underneath
    const soundbar = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.7, 0.08, 0.06),
      this.materials.monitorBezel
    );
    soundbar.position.set(0, -h / 2 - 0.06, 0);
    sbGroup.add(soundbar);

    sbGroup.position.set(x, y, z);
    this.group.add(sbGroup);

    // Make screen interactable to click and advance presentation slides
    screen.userData = {
      name: 'Interactive Smart Board',
      action: 'Click to Advance Lecture Slide',
      onClick: () => {
        smartScreen.nextSlide();
      }
    };
    this.interactables.push(screen);
  }

  createWhiteboard(x, y, z) {
    const wbGroup = new THREE.Group();
    const w = 2.0;
    const h = 1.4;

    // Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.06, h + 0.06, 0.03),
      this.materials.aluminum
    );
    wbGroup.add(frame);

    // Board Surface
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      this.materials.whiteboardSurface
    );
    board.rotation.y = Math.PI;
    board.position.set(0, 0, -0.016);
    wbGroup.add(board);

    // Pen tray & markers
    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.2, 0.02, 0.08),
      this.materials.aluminum
    );
    tray.position.set(0, -h / 2 - 0.01, -0.04);
    wbGroup.add(tray);

    wbGroup.position.set(x, y, z);
    this.group.add(wbGroup);
  }

  createCeilingProjector(x, y, z) {
    const proj = new THREE.Group();

    // Drop pole mount from ceiling (Y: 3.2m down to 2.8m)
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.4, 12),
      this.materials.aluminum
    );
    pole.position.y = 0.2;
    proj.add(pole);

    // Projector body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.12, 0.32),
      this.materials.projectorCasing
    );
    proj.add(body);

    // Glowing front optical lens (aimed at South wall Z = 4.88)
    const lens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16),
      this.materials.projectorLens
    );
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0.08, 0, 0.16);
    proj.add(lens);

    // Projected light cone beam
    const beamGeo = new THREE.ConeGeometry(1.6, 3.4, 16, 1, true);
    const beam = new THREE.Mesh(beamGeo, this.materials.projectorBeam);
    beam.rotation.x = -Math.PI / 2;
    beam.position.set(0, -0.4, 1.8);
    proj.add(beam);

    proj.position.set(x, y - 0.2, z);
    this.group.add(proj);
  }
}
