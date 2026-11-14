import * as THREE from 'three';
import { TextureGenerator } from './textures.js';

/**
 * Procedural Laboratory Architecture Shell
 * Dimensions: 16m (X) x 10m (Z) x 3.2m (Y)
 */
export class LabRoom {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.colliders = []; // Bounding boxes for player movement collision
    this.windowBackdropMesh = null;
    this.ledPanels = [];
    this.ceilingVents = [];

    this.width = 16;
    this.depth = 10;
    this.height = 3.2;

    this.init();
  }

  init() {
    this.buildFloor();
    this.buildCeiling();
    this.buildWalls();
    this.buildDoor();
    this.buildBaseboards();
    this.buildCeilingFixtures();
    this.buildSignage();

    this.scene.add(this.group);
  }

  buildFloor() {
    const floorGeo = new THREE.PlaneGeometry(this.width, this.depth);
    const floorTexture = TextureGenerator.createFloorTexture();

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.18,
      metalness: 0.05,
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.group.add(floor);
  }

  buildCeiling() {
    const ceilingGeo = new THREE.PlaneGeometry(this.width, this.depth);
    const ceilingTexture = TextureGenerator.createCeilingTexture();

    const ceilingMat = new THREE.MeshStandardMaterial({
      map: ceilingTexture,
      roughness: 0.85,
      metalness: 0.02,
    });

    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = this.height;
    this.group.add(ceiling);
  }

  buildWalls() {
    const wallTexture = TextureGenerator.createWallTexture();
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTexture,
      roughness: 0.6,
      metalness: 0.05,
    });

    const halfW = this.width / 2;
    const halfD = this.depth / 2;
    const halfH = this.height / 2;

    // South Wall (Front, Z = +5) - Contains Door at X = -5
    // Split into left section, door header, and right section
    const doorW = 1.2;
    const doorH = 2.4;
    const doorX = -4.5;

    // South Wall Left of Door (-8 to -5.1)
    const southLeftW = (doorX - doorW / 2) - (-halfW);
    const southLeftGeo = new THREE.BoxGeometry(southLeftW, this.height, 0.2);
    const southLeft = new THREE.Mesh(southLeftGeo, wallMat);
    southLeft.position.set(-halfW + southLeftW / 2, halfH, halfD + 0.1);
    southLeft.receiveShadow = true;
    this.group.add(southLeft);
    this.colliders.push(new THREE.Box3().setFromObject(southLeft));

    // South Wall Above Door (Door header)
    const headerH = this.height - doorH;
    const headerGeo = new THREE.BoxGeometry(doorW, headerH, 0.2);
    const header = new THREE.Mesh(headerGeo, wallMat);
    header.position.set(doorX, doorH + headerH / 2, halfD + 0.1);
    this.group.add(header);

    // South Wall Right of Door
    const southRightW = halfW - (doorX + doorW / 2);
    const southRightGeo = new THREE.BoxGeometry(southRightW, this.height, 0.2);
    const southRight = new THREE.Mesh(southRightGeo, wallMat);
    southRight.position.set(halfW - southRightW / 2, halfH, halfD + 0.1);
    southRight.receiveShadow = true;
    this.group.add(southRight);
    this.colliders.push(new THREE.Box3().setFromObject(southRight));

    // North Wall (Back, Z = -5) - Contains large laboratory ribbon windows
    // Bottom apron wall (Y: 0 to 0.9m)
    const northApronGeo = new THREE.BoxGeometry(this.width, 0.9, 0.2);
    const northApron = new THREE.Mesh(northApronGeo, wallMat);
    northApron.position.set(0, 0.45, -halfD - 0.1);
    northApron.receiveShadow = true;
    this.group.add(northApron);
    this.colliders.push(new THREE.Box3().setFromObject(northApron));

    // Top transom wall (Y: 2.7 to 3.2m)
    const northTopGeo = new THREE.BoxGeometry(this.width, 0.5, 0.2);
    const northTop = new THREE.Mesh(northTopGeo, wallMat);
    northTop.position.set(0, 2.95, -halfD - 0.1);
    this.group.add(northTop);

    // Left and right pillars on North wall
    const pillarW = 1.0;
    const pillarGeo = new THREE.BoxGeometry(pillarW, 1.8, 0.2);
    const pillarLeft = new THREE.Mesh(pillarGeo, wallMat);
    pillarLeft.position.set(-halfW + pillarW / 2, 1.8, -halfD - 0.1);
    this.group.add(pillarLeft);

    const pillarRight = new THREE.Mesh(pillarGeo, wallMat);
    pillarRight.position.set(halfW - pillarW / 2, 1.8, -halfD - 0.1);
    this.group.add(pillarRight);

    // West Wall (Left, X = -8)
    const westGeo = new THREE.BoxGeometry(0.2, this.height, this.depth);
    const westWall = new THREE.Mesh(westGeo, wallMat);
    westWall.position.set(-halfW - 0.1, halfH, 0);
    westWall.receiveShadow = true;
    this.group.add(westWall);
    this.colliders.push(new THREE.Box3().setFromObject(westWall));

    // East Wall (Right, X = +8)
    const eastGeo = new THREE.BoxGeometry(0.2, this.height, this.depth);
    const eastWall = new THREE.Mesh(eastGeo, wallMat);
    eastWall.position.set(halfW + 0.1, halfH, 0);
    eastWall.receiveShadow = true;
    this.group.add(eastWall);
    this.colliders.push(new THREE.Box3().setFromObject(eastWall));
  }

  buildWindows() {
    const halfD = this.depth / 2;
    // Window opening from X = -7 to +7, Y = 0.9 to 2.7 (Width = 14m, Height = 1.8m)
    const winWidth = 14;
    const winHeight = 1.8;
    const winY = 1.8;

    // Window Glass
    const glassGeo = new THREE.PlaneGeometry(winWidth, winHeight);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.9,
      transparent: true,
      opacity: 0.45,
      ior: 1.5,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, winY, -halfD);
    this.group.add(glass);

    // Window Frame & Mullions (Black/Charcoal aluminum)
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3,
    });

    // Outer frame perimeter
    const frameThick = 0.08;
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(winWidth, frameThick, 0.1), frameMat);
    topBar.position.set(0, winY + winHeight / 2, -halfD);
    this.group.add(topBar);

    const botBar = new THREE.Mesh(new THREE.BoxGeometry(winWidth, frameThick, 0.1), frameMat);
    botBar.position.set(0, winY - winHeight / 2, -halfD);
    this.group.add(botBar);

    // Vertical Mullions (every 2 meters, 7 sections)
    const sections = 7;
    const secW = winWidth / sections;
    for (let i = 0; i <= sections; i++) {
      const mul = new THREE.Mesh(new THREE.BoxGeometry(frameThick, winHeight, 0.12), frameMat);
      mul.position.set(-winWidth / 2 + i * secW, winY, -halfD);
      this.group.add(mul);
    }

    // Horizontal Transom
    const trans = new THREE.Mesh(new THREE.BoxGeometry(winWidth, frameThick, 0.09), frameMat);
    trans.position.set(0, winY + 0.3, -halfD);
    this.group.add(trans);

    // Soft Exterior Sky Backdrop beyond the window
    const skyGeo = new THREE.PlaneGeometry(28, 10);
    this.skyTexture = TextureGenerator.createWindowBackdropTexture(false);
    this.skyMat = new THREE.MeshBasicMaterial({
      map: this.skyTexture,
      side: THREE.DoubleSide,
    });
    this.windowBackdropMesh = new THREE.Mesh(skyGeo, this.skyMat);
    this.windowBackdropMesh.position.set(0, 3, -halfD - 5.5);
    this.group.add(this.windowBackdropMesh);
  }

  buildDoor() {
    const halfD = this.depth / 2;
    const doorX = -4.5;
    const doorW = 1.15;
    const doorH = 2.35;

    // Door Frame
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.6,
      roughness: 0.4,
    });

    const fLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, doorH, 0.24), frameMat);
    fLeft.position.set(doorX - doorW / 2, doorH / 2, halfD);
    this.group.add(fLeft);

    const fRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, doorH, 0.24), frameMat);
    fRight.position.set(doorX + doorW / 2, doorH / 2, halfD);
    this.group.add(fRight);

    const fTop = new THREE.Mesh(new THREE.BoxGeometry(doorW + 0.08, 0.08, 0.24), frameMat);
    fTop.position.set(doorX, doorH, halfD);
    this.group.add(fTop);

    // Door Panel (Birch / Grey laminate)
    const doorPanelMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.5,
      metalness: 0.1,
    });
    const door = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.04, doorH - 0.04, 0.06), doorPanelMat);
    door.position.set(doorX, doorH / 2, halfD);
    this.group.add(door);

    // Door Window (Vision Panel)
    const winGeo = new THREE.BoxGeometry(0.25, 0.7, 0.07);
    const winMat = new THREE.MeshPhysicalMaterial({
      color: 0xcfd8dc,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      transparent: true,
      opacity: 0.5,
    });
    const doorWin = new THREE.Mesh(winGeo, winMat);
    doorWin.position.set(doorX + 0.2, 1.5, halfD);
    this.group.add(doorWin);

    // Door Handle / Lever (Chrome)
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.95,
      roughness: 0.15,
    });
    const leverGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.14, 12);
    const lever = new THREE.Mesh(leverGeo, chromeMat);
    lever.rotation.z = Math.PI / 2;
    lever.position.set(doorX - 0.42, 1.0, halfD - 0.05);
    this.group.add(lever);

    // Kick plate
    const kickPlateGeo = new THREE.BoxGeometry(doorW - 0.08, 0.25, 0.065);
    const kickMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.8,
      roughness: 0.3,
    });
    const kickPlate = new THREE.Mesh(kickPlateGeo, kickMat);
    kickPlate.position.set(doorX, 0.14, halfD);
    this.group.add(kickPlate);
  }

  buildBaseboards() {
    const baseboardMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
    });
    const bH = 0.1;
    const bT = 0.03;

    // East baseboard
    const bbEast = new THREE.Mesh(new THREE.BoxGeometry(bT, bH, this.depth), baseboardMat);
    bbEast.position.set(this.width / 2 - bT / 2, bH / 2, 0);
    this.group.add(bbEast);

    // West baseboard
    const bbWest = new THREE.Mesh(new THREE.BoxGeometry(bT, bH, this.depth), baseboardMat);
    bbWest.position.set(-this.width / 2 + bT / 2, bH / 2, 0);
    this.group.add(bbWest);

    // North baseboard
    const bbNorth = new THREE.Mesh(new THREE.BoxGeometry(this.width, bH, bT), baseboardMat);
    bbNorth.position.set(0, bH / 2, -this.depth / 2 + bT / 2);
    this.group.add(bbNorth);
  }

  buildCeilingFixtures() {
    // Recessed LED Troffer Panels (Grid of 3 x 4 fixtures)
    const ledGeo = new THREE.BoxGeometry(1.4, 0.04, 0.7);
    const casingMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.2,
    });

    const diffuserGeo = new THREE.PlaneGeometry(1.3, 0.6);
    this.diffuserMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xf0f9ff,
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });

    const xPositions = [-4.5, -1.5, 1.5, 4.5];
    const zPositions = [-3.0, 0, 3.0];

    xPositions.forEach(x => {
      zPositions.forEach(z => {
        // Casing
        const fixture = new THREE.Mesh(ledGeo, casingMat);
        fixture.position.set(x, this.height - 0.02, z);
        this.group.add(fixture);

        // Emissive Diffuser Panel
        const diff = new THREE.Mesh(diffuserGeo, this.diffuserMat);
        diff.rotation.x = Math.PI / 2;
        diff.position.set(x, this.height - 0.041, z);
        this.group.add(diff);
        this.ledPanels.push(diff);
      });
    });

    // HVAC Air Diffusers / Grilles (Ceiling vents)
    const ventMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.7,
      roughness: 0.4,
    });
    const ventGeo = new THREE.BoxGeometry(0.8, 0.02, 0.8);
    const ventPositions = [
      [-6.5, 1.5], [6.5, 1.5], [-6.5, -3.5], [6.5, -3.5]
    ];

    ventPositions.forEach(([vx, vz]) => {
      const vent = new THREE.Mesh(ventGeo, ventMat);
      vent.position.set(vx, this.height - 0.01, vz);
      this.group.add(vent);

      // Louvers
      for (let l = -0.3; l <= 0.3; l += 0.1) {
        const slit = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.01, 0.02), casingMat);
        slit.position.set(vx, this.height - 0.015, vz + l);
        this.group.add(slit);
      }
    });

    // Lab Exhaust Fan Vent on ceiling near chemistry zone
    const fanCasing = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 24), casingMat);
    fanCasing.position.set(-6, this.height - 0.05, -3.5);
    this.group.add(fanCasing);

    // Rotating Fan Blades inside vent
    this.exhaustFan = new THREE.Group();
    const bladeGeo = new THREE.BoxGeometry(0.3, 0.01, 0.08);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 });
    for (let b = 0; b < 4; b++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.y = (b * Math.PI) / 2;
      this.exhaustFan.add(blade);
    }
    this.exhaustFan.position.set(-6, this.height - 0.06, -3.5);
    this.group.add(this.exhaustFan);
  }

  buildSignage() {
    const halfD = this.depth / 2;
    const halfW = this.width / 2;

    // 1. Exit Sign above main door
    const exitTex = TextureGenerator.createExitSignTexture();
    const exitSignMat = new THREE.MeshStandardMaterial({
      map: exitTex,
      emissive: 0x059669,
      emissiveIntensity: 0.4,
      roughness: 0.2,
    });
    const exitSign = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), exitSignMat);
    exitSign.position.set(-4.5, 2.7, halfD - 0.08);
    exitSign.rotation.y = Math.PI;
    this.group.add(exitSign);

    // Wall Clock on South Wall
    this.buildWallClock(halfD);
  }

  buildWallClock(halfD) {
    const clockGroup = new THREE.Group();
    // Frame
    const frameGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.05, 32);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.rotation.x = Math.PI / 2;
    clockGroup.add(frame);

    // Dial face
    const dialCanvas = document.createElement('canvas');
    dialCanvas.width = 256;
    dialCanvas.height = 256;
    const dctx = dialCanvas.getContext('2d');
    dctx.fillStyle = '#ffffff';
    dctx.beginPath();
    dctx.arc(128, 128, 120, 0, Math.PI * 2);
    dctx.fill();

    dctx.strokeStyle = '#0f172a';
    dctx.lineWidth = 4;
    dctx.stroke();

    // Hour ticks
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const x1 = 128 + Math.sin(angle) * 95;
      const y1 = 128 - Math.cos(angle) * 95;
      const x2 = 128 + Math.sin(angle) * 110;
      const y2 = 128 - Math.cos(angle) * 110;
      dctx.beginPath();
      dctx.moveTo(x1, y1);
      dctx.lineTo(x2, y2);
      dctx.stroke();
    }
    const dialTex = new THREE.CanvasTexture(dialCanvas);
    dialTex.colorSpace = THREE.SRGBColorSpace;
    const dialMat = new THREE.MeshBasicMaterial({ map: dialTex });
    const dial = new THREE.Mesh(new THREE.CircleGeometry(0.26, 32), dialMat);
    dial.position.z = 0.026;
    clockGroup.add(dial);

    // Hands
    const handMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    this.clockHourHand = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.12, 0.01), handMat);
    this.clockHourHand.position.set(0, 0.04, 0.03);
    clockGroup.add(this.clockHourHand);

    this.clockMinuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.18, 0.01), handMat);
    this.clockMinuteHand.position.set(0, 0.06, 0.032);
    clockGroup.add(this.clockMinuteHand);

    clockGroup.position.set(0, 2.6, halfD - 0.05);
    clockGroup.rotation.y = Math.PI;
    this.group.add(clockGroup);
  }

  buildGasCylinders() {
    // 3 Gas Cylinders chained to West wall: Nitrogen (N2), Argon (Ar), Compressed Air
    const cylinderData = [
      { color: 0x2563eb, name: 'N2 - NITROGEN', z: 2.2 },
      { color: 0x16a34a, name: 'AR - ARGON', z: 2.6 },
      { color: 0xd97706, name: 'COMPRESSED AIR', z: 3.0 }
    ];

    const metalMat = new THREE.MeshStandardMaterial({
      metalness: 0.85,
      roughness: 0.25,
      color: 0x94a3b8,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      metalness: 0.9,
      roughness: 0.2,
      color: 0xd97706,
    });

    cylinderData.forEach(c => {
      const cylGroup = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({
        color: c.color,
        roughness: 0.35,
        metalness: 0.5,
      });

      // Tank Body
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.4, 20), bodyMat);
      body.position.y = 0.7;
      body.castShadow = true;
      cylGroup.add(body);

      // Rounded Top
      const topDome = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), bodyMat);
      topDome.position.y = 1.4;
      cylGroup.add(topDome);

      // Neck & Valve
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.1, 16), metalMat);
      neck.position.y = 1.56;
      cylGroup.add(neck);

      // Brass Regulator
      const regulator = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), brassMat);
      regulator.position.set(0.03, 1.62, 0);
      cylGroup.add(regulator);

      // Dual Pressure Gauges
      const gaugeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16);
      const g1 = new THREE.Mesh(gaugeGeo, metalMat);
      g1.rotation.z = Math.PI / 2;
      g1.position.set(0.08, 1.65, -0.04);
      cylGroup.add(g1);

      const g2 = new THREE.Mesh(gaugeGeo, metalMat);
      g2.rotation.z = Math.PI / 2;
      g2.position.set(0.08, 1.65, 0.04);
      cylGroup.add(g2);

      // Hand Wheel
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 8, 16), brassMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(0, 1.68, 0);
      cylGroup.add(wheel);

      cylGroup.position.set(-this.width / 2 + 0.35, 0, c.z);
      this.group.add(cylGroup);
      this.colliders.push(new THREE.Box3().setFromObject(body));
    });

    // Safety Chain Bracket along the wall
    const bracketMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const wallBracket = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 1.2), bracketMat);
    wallBracket.position.set(-this.width / 2 + 0.05, 1.0, 2.6);
    this.group.add(wallBracket);

    const safetyChain = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.15, 8), bracketMat);
    safetyChain.rotation.x = Math.PI / 2;
    safetyChain.position.set(-this.width / 2 + 0.45, 1.0, 2.6);
    this.group.add(safetyChain);
  }

  setNightMode(isNight) {
    if (this.windowBackdropMesh) {
      if (this.skyTexture) this.skyTexture.dispose();
      this.skyTexture = TextureGenerator.createWindowBackdropTexture(isNight);
      this.skyMat.map = this.skyTexture;
      this.skyMat.needsUpdate = true;
    }

    // Adjust LED panel glow intensity
    if (this.diffuserMat) {
      this.diffuserMat.emissiveIntensity = isNight ? 0.3 : 1.2;
    }
  }

  update(delta) {
    // Rotate ceiling exhaust fan
    if (this.exhaustFan) {
      this.exhaustFan.rotation.y += delta * 4;
    }

    // Ticking wall clock
    const now = new Date();
    const sec = now.getSeconds() + now.getMilliseconds() / 1000;
    const min = now.getMinutes() + sec / 60;
    const hr = (now.getHours() % 12) + min / 60;

    if (this.clockMinuteHand) {
      this.clockMinuteHand.rotation.z = -min * (Math.PI / 30);
    }
    if (this.clockHourHand) {
      this.clockHourHand.rotation.z = -hr * (Math.PI / 6);
    }
  }
}
