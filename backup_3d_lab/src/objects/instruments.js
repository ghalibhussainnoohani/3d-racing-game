import * as THREE from 'three';

/**
 * Procedural Analytical Instruments:
 * Microscope, Centrifuge (interactive high-speed spin), Analytical Balance (interactive draft shield),
 * PCR Thermocycler, UV-Vis Spectrophotometer, Digital pH Meter, and 3D Bio-Printer.
 */
export class LabInstruments {
  constructor(scene, colliders, interactables, soundManager) {
    this.scene = scene;
    this.colliders = colliders;
    this.interactables = interactables;
    this.soundManager = soundManager;
    this.group = new THREE.Group();

    // Centrifuge state
    this.centrifugeSpinning = false;
    this.centrifugeSpeed = 0;
    this.centrifugeTargetSpeed = 0;
    this.centrifugeRotor = null;
    this.centrifugeLed = null;

    // Balance draft shield state
    this.balanceDoorOpen = false;
    this.balanceDoorCurrentX = 0;
    this.balanceDoorTargetX = 0;
    this.balanceDoorMesh = null;

    // Blink timer
    this.blinkTime = 0;
    this.blinkingLeds = [];

    this.materials = this.initMaterials();
    this.init();
  }

  initMaterials() {
    return {
      countertop: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.3,
        metalness: 0.1,
      }),
      cabinet: new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.4,
      }),
      instrumentWhite: new THREE.MeshStandardMaterial({
        color: 0xf8fafc, // Clean medical appliance white
        roughness: 0.25,
        metalness: 0.1,
      }),
      instrumentDark: new THREE.MeshStandardMaterial({
        color: 0x334155, // Charcoal accents
        roughness: 0.35,
        metalness: 0.2,
      }),
      metalSteel: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.85,
        roughness: 0.25,
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        metalness: 0.95,
        roughness: 0.1,
      }),
      brass: new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.8,
        roughness: 0.3,
      }),
      shieldGlass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.92,
        transparent: true,
        opacity: 0.4,
        ior: 1.5,
      }),
      ledGreen: new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x22c55e,
        emissiveIntensity: 1.5,
      }),
      ledBlue: new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x38bdf8,
        emissiveIntensity: 1.8,
      }),
      screenMat: new THREE.MeshBasicMaterial({
        color: 0x0284c7,
      }),
    };
  }

  init() {
    // 1. Long Sturdy Instrument Counter along East Wall
    const benchX = 6.6;
    const benchZ = 2.2;
    const benchW = 1.0;
    const benchL = 4.8;
    const benchH = 0.9;

    this.createInstrumentBench(benchX, benchZ, benchW, benchL, benchH);

    // Place Instruments on the Counter:
    // A. Microscope at Z = 0.4
    this.createMicroscope(benchX, benchH, 0.4);

    // B. Centrifuge at Z = 1.3
    this.createCentrifuge(benchX, benchH, 1.3);

    // C. Analytical Balance at Z = 2.2
    this.createAnalyticalBalance(benchX, benchH, 2.2);

    // D. PCR Thermocycler at Z = 3.0
    this.createPCRMachine(benchX, benchH, 3.0);

    // E. UV-Vis Spectrophotometer at Z = 3.8
    this.createSpectrophotometer(benchX, benchH, 3.8);

    // F. pH Meter beside the microscope at Z = 0.9
    this.createPHMeter(benchX - 0.15, benchH, 0.85);

    // G. 3D Bio-Printer on an adjacent workstation table at X = 6.6, Z = -1.2
    this.create3DPrinter(benchX, 0, -1.2);

    this.scene.add(this.group);
  }

  createInstrumentBench(x, z, w, l, h) {
    const bench = new THREE.Group();

    // Top
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.05, l),
      this.materials.countertop
    );
    top.position.y = h - 0.025;
    top.castShadow = true;
    top.receiveShadow = true;
    bench.add(top);

    // Base cabinets
    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.08, h - 0.05, l - 0.08),
      this.materials.cabinet
    );
    cab.position.y = (h - 0.05) / 2;
    cab.castShadow = true;
    cab.receiveShadow = true;
    bench.add(cab);

    bench.position.set(x, 0, z);
    this.group.add(bench);

    this.colliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, h / 2, z),
        new THREE.Vector3(w + 0.1, h, l + 0.1)
      )
    );
  }

  createMicroscope(x, y, z) {
    const scope = new THREE.Group();

    // Heavy Cast Base
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.045, 0.3),
      this.materials.instrumentDark
    );
    base.position.y = 0.0225;
    scope.add(base);

    // Vertical Curved Limb / Arm
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.32, 0.08),
      this.materials.instrumentWhite
    );
    arm.position.set(0, 0.2, 0.08);
    scope.add(arm);

    // Horizontal Upper Head Arm
    const headArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 0.16),
      this.materials.instrumentWhite
    );
    headArm.position.set(0, 0.34, 0.02);
    scope.add(headArm);

    // Binocular Eyepiece Head (Tilted 45 degrees)
    const binoHead = new THREE.Group();
    [-0.035, 0.035].forEach(ex => {
      // Eyepiece tube
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.016, 0.09, 16),
        this.materials.metalSteel
      );
      tube.position.set(ex, 0.045, 0);
      binoHead.add(tube);

      // Rubber eyecup
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.015, 0.02, 16),
        this.materials.instrumentDark
      );
      cup.position.set(ex, 0.09, 0);
      binoHead.add(cup);
    });

    binoHead.rotation.x = Math.PI / 4;
    binoHead.position.set(0, 0.35, -0.05);
    scope.add(binoHead);

    // Revolving Nosepiece (Objective Turret)
    const turret = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.04, 0.025, 20),
      this.materials.instrumentDark
    );
    turret.position.set(0, 0.26, -0.05);
    scope.add(turret);

    // 4 Objective Lenses
    for (let o = 0; o < 4; o++) {
      const angle = (o * Math.PI * 2) / 4;
      const obj = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.008, 0.05, 12),
        this.materials.chrome
      );
      obj.position.set(Math.sin(angle) * 0.025, 0.23, -0.05 + Math.cos(angle) * 0.025);
      scope.add(obj);
    }

    // Specimen Stage with Slide Clips
    const stage = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.015, 0.16),
      this.materials.instrumentDark
    );
    stage.position.set(0, 0.17, -0.05);
    scope.add(stage);

    // Glass microscope slide on stage
    const slide = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.004, 0.03),
      this.materials.shieldGlass
    );
    slide.position.set(0, 0.18, -0.05);
    scope.add(slide);

    // Substage Condenser & LED Light
    const condenser = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.04, 16),
      this.materials.metalSteel
    );
    condenser.position.set(0, 0.13, -0.05);
    scope.add(condenser);

    // Coarse & Fine Focus Knobs
    [-0.05, 0.05].forEach(kx => {
      const knobCoarse = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16),
        this.materials.instrumentDark
      );
      knobCoarse.rotation.z = Math.PI / 2;
      knobCoarse.position.set(kx, 0.12, 0.08);
      scope.add(knobCoarse);

      const knobFine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.03, 16),
        this.materials.metalSteel
      );
      knobFine.rotation.z = Math.PI / 2;
      knobFine.position.set(kx * 1.15, 0.12, 0.08);
      scope.add(knobFine);
    });

    scope.position.set(x, y, z);
    scope.rotation.y = -Math.PI / 2;
    this.group.add(scope);

    base.userData = {
      name: 'Research Microscope (1000x Oil Immersion)',
      action: 'Click to Inspect Specimen',
      onClick: () => {
        if (this.soundManager) this.soundManager.playBeep();
      }
    };
    this.interactables.push(base);
  }

  createCentrifuge(x, y, z) {
    const centGroup = new THREE.Group();

    // Aerodynamic Chassis
    const bodyGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.22, 28);
    const body = new THREE.Mesh(bodyGeo, this.materials.instrumentWhite);
    body.position.y = 0.11;
    body.castShadow = true;
    centGroup.add(body);

    // Front Control Panel & LCD Display
    const displayCanvas = document.createElement('canvas');
    displayCanvas.width = 256;
    displayCanvas.height = 128;
    this.centDisplayCtx = displayCanvas.getContext('2d');
    this.centDisplayTex = new THREE.CanvasTexture(displayCanvas);
    this.updateCentrifugeDisplay(0, false);

    const dispMat = new THREE.MeshBasicMaterial({ map: this.centDisplayTex });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.09), dispMat);
    screen.position.set(0, 0.12, 0.245);
    centGroup.add(screen);

    // Status LED
    this.centrifugeLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.008, 12, 12),
      this.materials.ledBlue
    );
    this.centrifugeLed.position.set(0.1, 0.15, 0.24);
    centGroup.add(this.centrifugeLed);

    // Internal Rotor Chamber
    const chamber = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.1, 24),
      this.materials.instrumentDark
    );
    chamber.position.y = 0.16;
    centGroup.add(chamber);

    // Spinning 24-tube Angled Rotor
    this.centrifugeRotor = new THREE.Group();
    const rotorCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.04, 20),
      this.materials.metalSteel
    );
    this.centrifugeRotor.add(rotorCore);

    // 1.5 mL Microcentrifuge Tubes in rotor
    const tubeGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.035, 10);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 });
    for (let t = 0; t < 12; t++) {
      const angle = (t * Math.PI * 2) / 12;
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.position.set(Math.sin(angle) * 0.09, 0.01, Math.cos(angle) * 0.09);
      tube.rotation.x = Math.PI / 6;
      this.centrifugeRotor.add(tube);
    }
    this.centrifugeRotor.position.y = 0.18;
    centGroup.add(this.centrifugeRotor);

    // Transparent Acrylic Lid Window
    const lidGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.02, 28);
    const lid = new THREE.Mesh(lidGeo, this.materials.shieldGlass);
    lid.position.y = 0.23;
    centGroup.add(lid);

    centGroup.position.set(x, y, z);
    centGroup.rotation.y = -Math.PI / 2;
    this.group.add(centGroup);

    // Interaction handler
    body.userData = {
      name: 'High-Speed Microcentrifuge (14,000 RPM)',
      action: 'Click to Start / Stop Spin Cycle',
      onClick: () => this.toggleCentrifuge(),
    };
    lid.userData = body.userData;
    this.interactables.push(body, lid);
  }

  updateCentrifugeDisplay(rpm, isRunning) {
    const ctx = this.centDisplayCtx;
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 256, 128);

    ctx.fillStyle = isRunning ? '#22c55e' : '#38bdf8';
    ctx.font = 'bold 32px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(rpm)} RPM`, 128, 55);

    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(isRunning ? 'RUNNING: 04:32' : 'STANDBY • READY', 128, 95);

    this.centDisplayTex.needsUpdate = true;
  }

  toggleCentrifuge() {
    this.centrifugeSpinning = !this.centrifugeSpinning;
    this.centrifugeTargetSpeed = this.centrifugeSpinning ? 14000 : 0;

    if (this.soundManager) {
      if (this.centrifugeSpinning) {
        this.soundManager.playCentrifugeSpin();
      } else {
        this.soundManager.stopCentrifugeSpin();
      }
    }
    return this.centrifugeSpinning;
  }

  createAnalyticalBalance(x, y, z) {
    const balance = new THREE.Group();

    // Heavy Cast Base
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.08, 0.35),
      this.materials.instrumentWhite
    );
    base.position.y = 0.04;
    balance.add(base);

    // LCD Tare Display
    const lcd = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, 0.05),
      this.materials.screenMat
    );
    lcd.position.set(0, 0.06, 0.176);
    balance.add(lcd);

    // Leveling feet
    [-0.12, 0.12].forEach(fx => {
      [-0.15, 0.15].forEach(fz => {
        const foot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.015, 0.02, 12),
          this.materials.metalSteel
        );
        foot.position.set(fx, 0.01, fz);
        balance.add(foot);
      });
    });

    // Glass Draft Shield Chamber (Width = 0.26, Height = 0.28, Depth = 0.22)
    const chamberH = 0.26;
    const chamberY = 0.08 + chamberH / 2;

    // Fixed Top Glass
    const topGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.01, 0.22),
      this.materials.shieldGlass
    );
    topGlass.position.set(0, 0.08 + chamberH, -0.02);
    balance.add(topGlass);

    // Fixed Rear Glass
    const backGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, chamberH, 0.01),
      this.materials.shieldGlass
    );
    backGlass.position.set(0, chamberY, -0.13);
    balance.add(backGlass);

    // Fixed Left Glass
    const leftGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, chamberH, 0.22),
      this.materials.shieldGlass
    );
    leftGlass.position.set(-0.13, chamberY, -0.02);
    balance.add(leftGlass);

    // Sliding Front / Right Glass Door (Interactive!)
    this.balanceDoorClosedX = 0.13;
    this.balanceDoorOpenX = 0.02;
    this.balanceDoorCurrentX = this.balanceDoorClosedX;
    this.balanceDoorTargetX = this.balanceDoorClosedX;

    this.balanceDoorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, chamberH - 0.01, 0.2),
      this.materials.shieldGlass
    );
    this.balanceDoorMesh.position.set(this.balanceDoorCurrentX, chamberY, -0.02);
    balance.add(this.balanceDoorMesh);

    // Stainless Steel Weighing Pan inside
    const pan = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.008, 24),
      this.materials.metalSteel
    );
    pan.position.set(0, 0.11, -0.02);
    balance.add(pan);

    balance.position.set(x, y, z);
    balance.rotation.y = -Math.PI / 2;
    this.group.add(balance);

    // Interaction
    base.userData = {
      name: 'Analytical Balance (±0.0001 g)',
      action: 'Click to Slide Draft Shield Door',
      onClick: () => this.toggleBalanceDoor(),
    };
    this.balanceDoorMesh.userData = base.userData;
    this.interactables.push(base, this.balanceDoorMesh);
  }

  toggleBalanceDoor() {
    this.balanceDoorOpen = !this.balanceDoorOpen;
    this.balanceDoorTargetX = this.balanceDoorOpen ? this.balanceDoorOpenX : this.balanceDoorClosedX;
    if (this.soundManager) this.soundManager.playSlide();
    return this.balanceDoorOpen;
  }

  createPCRMachine(x, y, z) {
    const pcr = new THREE.Group();

    // Chassis
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.18, 0.38),
      this.materials.instrumentWhite
    );
    body.position.y = 0.09;
    body.castShadow = true;
    pcr.add(body);

    // Heated Lid with Ergonomic Blue Lever
    const lid = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.06, 0.22),
      this.materials.instrumentDark
    );
    lid.position.set(0, 0.21, -0.04);
    pcr.add(lid);

    const lever = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.16, 12),
      new THREE.MeshStandardMaterial({ color: 0x0284c7 })
    );
    lever.rotation.z = Math.PI / 2;
    lever.position.set(0, 0.24, 0.06);
    pcr.add(lever);

    // Angled Front Touchscreen
    const screenGeo = new THREE.BoxGeometry(0.18, 0.12, 0.02);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const touchScreen = new THREE.Mesh(screenGeo, screenMat);
    touchScreen.rotation.x = -Math.PI / 4;
    touchScreen.position.set(0, 0.13, 0.13);
    pcr.add(touchScreen);

    // Status LED
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.006, 8, 8),
      this.materials.ledGreen
    );
    led.position.set(0.1, 0.16, 0.13);
    pcr.add(led);
    this.blinkingLeds.push(led);

    pcr.position.set(x, y, z);
    pcr.rotation.y = -Math.PI / 2;
    this.group.add(pcr);

    body.userData = {
      name: 'PCR Thermocycler (96-Well Gradient)',
      action: 'Click to Check Thermal Profile',
      onClick: () => {
        if (this.soundManager) this.soundManager.playBeep();
      }
    };
    this.interactables.push(body);
  }

  createSpectrophotometer(x, y, z) {
    const spec = new THREE.Group();

    // Chassis
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.14, 0.36),
      this.materials.instrumentWhite
    );
    body.position.y = 0.07;
    spec.add(body);

    // Cuvette Sample Compartment Hinged Lid
    const lid = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.03, 0.12),
      this.materials.instrumentDark
    );
    lid.position.set(-0.08, 0.15, -0.05);
    spec.add(lid);

    // LCD Readout Display
    const lcd = new THREE.Mesh(
      new THREE.PlaneGeometry(0.14, 0.06),
      new THREE.MeshBasicMaterial({ color: 0x0369a1 })
    );
    lcd.rotation.x = -Math.PI / 6;
    lcd.position.set(0.08, 0.14, 0.05);
    spec.add(lcd);

    // Keypad Buttons
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const btn = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.005, 0.02),
          this.materials.instrumentDark
        );
        btn.position.set(0.04 + c * 0.035, 0.145, 0.1 + r * 0.03);
        spec.add(btn);
      }
    }

    spec.position.set(x, y, z);
    spec.rotation.y = -Math.PI / 2;
    this.group.add(spec);

    body.userData = {
      name: 'UV-Vis Spectrophotometer',
      action: 'Click to Read Absorbance [A280]',
      onClick: () => {
        if (this.soundManager) this.soundManager.playBeep();
      }
    };
    this.interactables.push(body);
  }

  createPHMeter(x, y, z) {
    const ph = new THREE.Group();

    // Benchtop Base Console
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.05, 0.18),
      this.materials.instrumentWhite
    );
    base.position.y = 0.025;
    ph.add(base);

    // Screen
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.1, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x15803d })
    );
    screen.rotation.x = -Math.PI / 5;
    screen.position.set(0, 0.055, 0.02);
    ph.add(screen);

    // Articulated Electrode Arm
    const armBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.015, 0.05, 12),
      this.materials.metalSteel
    );
    armBase.position.set(0.06, 0.05, -0.06);
    ph.add(armBase);

    // Upper Segment
    const seg1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.18, 8),
      this.materials.metalSteel
    );
    seg1.rotation.z = Math.PI / 4;
    seg1.position.set(0.11, 0.12, -0.06);
    ph.add(seg1);

    // Glass Electrode Probe
    const probe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.14, 12),
      this.materials.shieldGlass
    );
    probe.position.set(0.18, 0.09, -0.06);
    ph.add(probe);

    ph.position.set(x, y, z);
    ph.rotation.y = -Math.PI / 2;
    this.group.add(ph);
  }

  create3DPrinter(x, y, z) {
    const printerGroup = new THREE.Group();
    const w = 0.55;
    const d = 0.5;
    const h = 0.65;

    // Base Chassis
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.1, d),
      this.materials.instrumentDark
    );
    base.position.y = 0.05;
    base.castShadow = true;
    printerGroup.add(base);

    // Dual Vertical Lead Screws / Extrusion Frame Pillars
    [-w / 2 + 0.05, w / 2 - 0.05].forEach(px => {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, h - 0.1, 0.04),
        this.materials.metalSteel
      );
      pillar.position.set(px, h / 2, 0);
      printerGroup.add(pillar);
    });

    // Top Cross Beam
    const crossBeam = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.04, 0.04),
      this.materials.metalSteel
    );
    crossBeam.position.set(0, h - 0.02, 0);
    printerGroup.add(crossBeam);

    // Heated Print Bed Platform
    const bed = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.015, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 })
    );
    bed.position.set(0, 0.14, 0);
    printerGroup.add(bed);

    // Print Object on Bed (Procedural miniature biomaterial scaffold)
    const scaffold = new THREE.Mesh(
      new THREE.TorusGeometry(0.04, 0.015, 12, 24),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b })
    );
    scaffold.rotation.x = Math.PI / 2;
    scaffold.position.set(0, 0.165, 0);
    printerGroup.add(scaffold);

    // Extruder Toolhead Carriage & Dual Syringes
    const carriage = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, 0.09),
      this.materials.instrumentWhite
    );
    carriage.position.set(0, 0.28, 0);
    printerGroup.add(carriage);

    // Syringes
    [-0.03, 0.03].forEach(sx => {
      const syringe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.1, 12),
        this.materials.shieldGlass
      );
      syringe.position.set(sx, 0.33, 0.03);
      printerGroup.add(syringe);
    });

    printerGroup.position.set(x, y, z);
    this.group.add(printerGroup);

    this.colliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, h / 2, z),
        new THREE.Vector3(w + 0.1, h, d + 0.1)
      )
    );
  }

  update(delta) {
    // 1. Centrifuge rotation animation
    if (Math.abs(this.centrifugeSpeed - this.centrifugeTargetSpeed) > 1) {
      this.centrifugeSpeed += (this.centrifugeTargetSpeed - this.centrifugeSpeed) * delta * 2;
      this.updateCentrifugeDisplay(this.centrifugeSpeed, this.centrifugeSpinning);
    }

    if (this.centrifugeRotor && this.centrifugeSpeed > 10) {
      this.centrifugeRotor.rotation.y += (this.centrifugeSpeed / 60) * Math.PI * 2 * delta;
    }

    // 2. Analytical balance draft shield animation
    if (this.balanceDoorMesh && Math.abs(this.balanceDoorCurrentX - this.balanceDoorTargetX) > 0.001) {
      this.balanceDoorCurrentX += (this.balanceDoorTargetX - this.balanceDoorCurrentX) * delta * 8;
      this.balanceDoorMesh.position.x = this.balanceDoorCurrentX;
    }

    // 3. Blinking Instrument LEDs
    this.blinkTime += delta;
    if (this.blinkTime > 0.8) {
      this.blinkTime = 0;
      this.blinkingLeds.forEach(led => {
        led.visible = !led.visible;
      });
    }
  }
}
