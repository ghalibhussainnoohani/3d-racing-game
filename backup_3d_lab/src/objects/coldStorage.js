import * as THREE from 'three';
import { TextureGenerator } from '../scene/textures.js';

/**
 * Cold Storage & Chemical Safety Cabinets:
 * +4°C Lab Refrigerator (interactive door), -80°C Ultra-Low Freezer (interactive door),
 * and Yellow Flammable Storage Cabinet (interactive double doors).
 */
export class ColdStorage {
  constructor(scene, colliders, interactables, soundManager) {
    this.scene = scene;
    this.colliders = colliders;
    this.interactables = interactables;
    this.soundManager = soundManager;
    this.group = new THREE.Group();

    // Refrigerator door state
    this.fridgeOpen = false;
    this.fridgeAngle = 0;
    this.fridgeTargetAngle = 0;
    this.fridgeDoorPivot = null;

    // -80C Freezer door state
    this.freezerOpen = false;
    this.freezerAngle = 0;
    this.freezerTargetAngle = 0;
    this.freezerDoorPivot = null;

    // Flammable cabinet doors state
    this.flamOpen = false;
    this.flamAngle = 0;
    this.flamTargetAngle = 0;
    this.flamLeftPivot = null;
    this.flamRightPivot = null;

    this.materials = this.initMaterials();
    this.init();
  }

  initMaterials() {
    return {
      fridgeWhite: new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.25,
        metalness: 0.15,
      }),
      fridgeInterior: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
      }),
      fridgeLight: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xe0f2fe,
        emissiveIntensity: 1.5,
      }),
      freezerGrey: new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.35,
        metalness: 0.2,
      }),
      flamYellow: new THREE.MeshStandardMaterial({
        color: 0xfacc15, // Bright OSHA safety yellow
        roughness: 0.35,
        metalness: 0.2,
      }),
      metalSteel: new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.85,
        roughness: 0.25,
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        metalness: 0.95,
        roughness: 0.1,
      }),
      gasketBlack: new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.8,
      }),
      cryoBoxBlue: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 }),
      cryoBoxRed: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }),
      cryoBoxGreen: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.3 }),
      cryoBoxYellow: new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3 }),
    };
  }

  init() {
    // Located along West wall (X = -6.8 to -7.0)
    // 1. Tall Lab Refrigerator at Z = 0.0
    this.createRefrigerator(-6.8, 0, 0.0);

    // 2. -80°C Freezer at Z = 1.15
    this.createUltraLowFreezer(-6.8, 0, 1.15);

    // 3. Flammable Storage Cabinet at Z = -0.95
    this.createFlammableCabinet(-6.8, 0, -1.05);

    this.scene.add(this.group);
  }

  createRefrigerator(x, y, z) {
    const fridge = new THREE.Group();
    const w = 0.85;
    const d = 0.8;
    const h = 2.05;

    // Outer Shell
    const shell = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      this.materials.fridgeWhite
    );
    shell.position.y = h / 2;
    shell.castShadow = true;
    shell.receiveShadow = true;
    fridge.add(shell);

    // Recessed Interior Chamber
    const chamber = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.12, h - 0.2, d - 0.1),
      this.materials.fridgeInterior
    );
    chamber.position.set(0.04, h / 2, 0.02);
    fridge.add(chamber);

    // Interior Shelves & Cryo Sample Boxes
    const shelfCount = 4;
    const shelfSpacing = (h - 0.3) / shelfCount;
    for (let s = 1; s <= shelfCount; s++) {
      const sy = 0.15 + s * shelfSpacing;
      // Wire shelf rack
      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(w - 0.14, 0.015, d - 0.14),
        this.materials.chrome
      );
      shelf.position.set(0.04, sy, 0.02);
      fridge.add(shelf);

      // Cryo storage tube boxes on shelf
      const boxMats = [this.materials.cryoBoxBlue, this.materials.cryoBoxRed, this.materials.cryoBoxGreen, this.materials.cryoBoxYellow];
      for (let b = 0; b < 2; b++) {
        const cBox = new THREE.Mesh(
          new THREE.BoxGeometry(0.13, 0.05, 0.13),
          boxMats[(s + b) % boxMats.length]
        );
        cBox.position.set(0.04 + (b - 0.5) * 0.16, sy + 0.025, 0.02 + (b - 0.5) * 0.15);
        fridge.add(cBox);
      }
    }

    // Interior Light Strip (turns on when door opens)
    const intLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, h - 0.3, 0.02),
      this.materials.fridgeLight
    );
    intLight.position.set(-w / 2 + 0.08, h / 2, d / 2 - 0.08);
    fridge.add(intLight);

    // Digital Temperature Readout (+4.0°C) on header
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 128;
    tempCanvas.height = 64;
    const tctx = tempCanvas.getContext('2d');
    tctx.fillStyle = '#0f172a';
    tctx.fillRect(0, 0, 128, 64);
    tctx.fillStyle = '#38bdf8';
    tctx.font = 'bold 24px "JetBrains Mono", monospace';
    tctx.textAlign = 'center';
    tctx.fillText('+4.0 °C', 64, 40);
    const tempTex = new THREE.CanvasTexture(tempCanvas);
    const tempMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.18, 0.09),
      new THREE.MeshBasicMaterial({ map: tempTex })
    );
    tempMesh.position.set(0, h - 0.08, d / 2 + 0.01);
    fridge.add(tempMesh);

    // Interactive Door with Hinge Pivot
    this.fridgeDoorPivot = new THREE.Group();
    // Pivot at front-left edge of fridge: X = -w/2, Z = d/2
    this.fridgeDoorPivot.position.set(-w / 2, 0, d / 2);

    const doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h - 0.18, 0.06),
      this.materials.fridgeWhite
    );
    // Center of door is at offset w/2 from hinge pivot
    doorMesh.position.set(w / 2, (h - 0.18) / 2 + 0.05, 0.03);
    doorMesh.castShadow = true;
    this.fridgeDoorPivot.add(doorMesh);

    // Chrome Handle on right edge of door
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.45, 16),
      this.materials.chrome
    );
    handle.position.set(w - 0.06, h / 2, 0.08);
    this.fridgeDoorPivot.add(handle);

    fridge.add(this.fridgeDoorPivot);

    fridge.position.set(x, y, z);
    fridge.rotation.y = Math.PI / 2; // Facing into lab
    this.group.add(fridge);

    this.colliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, h / 2, z),
        new THREE.Vector3(d + 0.1, h, w + 0.1)
      )
    );

    // Interaction handler
    doorMesh.userData = {
      name: 'Lab Refrigerator (+4.0°C)',
      action: 'Click to Open / Close Door',
      onClick: () => this.toggleFridgeDoor(),
    };
    handle.userData = doorMesh.userData;
    this.interactables.push(doorMesh, handle);
  }

  toggleFridgeDoor() {
    this.fridgeOpen = !this.fridgeOpen;
    this.fridgeTargetAngle = this.fridgeOpen ? Math.PI * 0.6 : 0;
    if (this.soundManager) this.soundManager.playSlide();
    return this.fridgeOpen;
  }

  createUltraLowFreezer(x, y, z) {
    const freezer = new THREE.Group();
    const w = 0.95;
    const d = 0.9;
    const h = 2.0;

    // Heavy Insulated Body
    const shell = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      this.materials.freezerGrey
    );
    shell.position.y = h / 2;
    shell.castShadow = true;
    shell.receiveShadow = true;
    freezer.add(shell);

    // Microprocessor Digital Display (-80.2°C)
    const dispCanvas = document.createElement('canvas');
    dispCanvas.width = 256;
    dispCanvas.height = 128;
    const dctx = dispCanvas.getContext('2d');
    dctx.fillStyle = '#0f172a';
    dctx.fillRect(0, 0, 256, 128);
    dctx.fillStyle = '#38bdf8';
    dctx.font = 'bold 36px "JetBrains Mono", monospace';
    dctx.textAlign = 'center';
    dctx.fillText('-80.2 °C', 128, 55);
    dctx.font = '16px "JetBrains Mono", monospace';
    dctx.fillStyle = '#22c55e';
    dctx.fillText('TEMP OK • VACUUM RELIEF', 128, 95);

    const dispTex = new THREE.CanvasTexture(dispCanvas);
    const dispMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.24, 0.12),
      new THREE.MeshBasicMaterial({ map: dispTex })
    );
    dispMesh.position.set(0, h - 0.18, d / 2 + 0.01);
    freezer.add(dispMesh);

    // Heavy Insulated Door with Pivot
    this.freezerDoorPivot = new THREE.Group();
    this.freezerDoorPivot.position.set(-w / 2, 0, d / 2);

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(w, h - 0.32, 0.1),
      this.materials.freezerGrey
    );
    door.position.set(w / 2, (h - 0.32) / 2 + 0.05, 0.05);
    door.castShadow = true;
    this.freezerDoorPivot.add(door);

    // Heavy Duty Latch
    const latch = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.16, 0.08),
      this.materials.metalSteel
    );
    latch.position.set(w - 0.08, h / 2 - 0.1, 0.12);
    this.freezerDoorPivot.add(latch);

    freezer.add(this.freezerDoorPivot);

    freezer.position.set(x, y, z);
    freezer.rotation.y = Math.PI / 2;
    this.group.add(freezer);

    this.colliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, h / 2, z),
        new THREE.Vector3(d + 0.1, h, w + 0.1)
      )
    );

    door.userData = {
      name: 'Ultra-Low Freezer (-80°C)',
      action: 'Click to Open / Close Door',
      onClick: () => this.toggleFreezerDoor(),
    };
    latch.userData = door.userData;
    this.interactables.push(door, latch);
  }

  toggleFreezerDoor() {
    this.freezerOpen = !this.freezerOpen;
    this.freezerTargetAngle = this.freezerOpen ? Math.PI * 0.55 : 0;
    if (this.soundManager) this.soundManager.playSlide();
    return this.freezerOpen;
  }

  createFlammableCabinet(x, y, z) {
    const cab = new THREE.Group();
    const w = 1.05;
    const d = 0.55;
    const h = 1.65;

    // Bright Safety Yellow Double-Walled Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      this.materials.flamYellow
    );
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    cab.add(body);

    // Hazard Warning Sign on Top Door Front
    const flamTex = TextureGenerator.createFlammableSignTexture();
    const flamSignMat = new THREE.MeshStandardMaterial({ map: flamTex, roughness: 0.3 });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.24), flamSignMat);
    signMesh.position.set(0, h - 0.25, d / 2 + 0.01);
    cab.add(signMesh);

    // Left Door with Hinge
    this.flamLeftPivot = new THREE.Group();
    this.flamLeftPivot.position.set(-w / 2, 0, d / 2);
    const leftDoor = new THREE.Mesh(
      new THREE.BoxGeometry(w / 2 - 0.02, h - 0.08, 0.03),
      this.materials.flamYellow
    );
    leftDoor.position.set((w / 4) - 0.01, h / 2, 0.015);
    this.flamLeftPivot.add(leftDoor);

    // Left Handle
    const leftHnd = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.14, 0.03),
      this.materials.chrome
    );
    leftHnd.position.set((w / 2) - 0.06, h / 2, 0.04);
    this.flamLeftPivot.add(leftHnd);
    cab.add(this.flamLeftPivot);

    // Right Door with Hinge
    this.flamRightPivot = new THREE.Group();
    this.flamRightPivot.position.set(w / 2, 0, d / 2);
    const rightDoor = new THREE.Mesh(
      new THREE.BoxGeometry(w / 2 - 0.02, h - 0.08, 0.03),
      this.materials.flamYellow
    );
    rightDoor.position.set(-(w / 4) + 0.01, h / 2, 0.015);
    this.flamRightPivot.add(rightDoor);

    const rightHnd = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.14, 0.03),
      this.materials.chrome
    );
    rightHnd.position.set(-(w / 2) + 0.06, h / 2, 0.04);
    this.flamRightPivot.add(rightHnd);
    cab.add(this.flamRightPivot);

    cab.position.set(x, y, z);
    cab.rotation.y = Math.PI / 2;
    this.group.add(cab);

    this.colliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, h / 2, z),
        new THREE.Vector3(d + 0.1, h, w + 0.1)
      )
    );

    leftDoor.userData = {
      name: 'Flammable Storage Cabinet',
      action: 'Click to Open / Close Cabinet Doors',
      onClick: () => this.toggleFlammableCabinet(),
    };
    rightDoor.userData = leftDoor.userData;
    signMesh.userData = leftDoor.userData;
    this.interactables.push(leftDoor, rightDoor, signMesh);
  }

  toggleFlammableCabinet() {
    this.flamOpen = !this.flamOpen;
    this.flamTargetAngle = this.flamOpen ? Math.PI * 0.55 : 0;
    if (this.soundManager) this.soundManager.playSlide();
    return this.flamOpen;
  }

  update(delta) {
    // Animate Refrigerator Door
    if (this.fridgeDoorPivot && Math.abs(this.fridgeAngle - this.fridgeTargetAngle) > 0.001) {
      this.fridgeAngle += (this.fridgeTargetAngle - this.fridgeAngle) * delta * 5;
      this.fridgeDoorPivot.rotation.y = this.fridgeAngle;
    }

    // Animate -80C Freezer Door
    if (this.freezerDoorPivot && Math.abs(this.freezerAngle - this.freezerTargetAngle) > 0.001) {
      this.freezerAngle += (this.freezerTargetAngle - this.freezerAngle) * delta * 4;
      this.freezerDoorPivot.rotation.y = this.freezerAngle;
    }

    // Animate Flammable Cabinet Doors
    if (this.flamLeftPivot && Math.abs(this.flamAngle - this.flamTargetAngle) > 0.001) {
      this.flamAngle += (this.flamTargetAngle - this.flamAngle) * delta * 5;
      this.flamLeftPivot.rotation.y = this.flamAngle;
      this.flamRightPivot.rotation.y = -this.flamAngle;
    }
  }
}
