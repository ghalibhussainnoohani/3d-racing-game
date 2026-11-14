import * as THREE from 'three';

/**
 * Server Rack Corner:
 * 42U Data Center Rack Cabinet with blinking status LEDs,
 * 48-port Network Switch, Patch Panel, 2U Servers, and Rackmount UPS.
 */
export class ServerRack {
  constructor(scene, colliders, interactables) {
    this.scene = scene;
    this.colliders = colliders;
    this.interactables = interactables;
    this.group = new THREE.Group();

    this.blinkingLeds = [];
    this.ledTimer = 0;

    this.materials = this.initMaterials();
    this.init();
  }

  initMaterials() {
    return {
      rackFrame: new THREE.MeshStandardMaterial({
        color: 0x090d16, // Matte black server rack chassis
        roughness: 0.35,
        metalness: 0.5,
      }),
      rackGlass: new THREE.MeshPhysicalMaterial({
        color: 0x1e293b,
        roughness: 0.1,
        transmission: 0.7,
        transparent: true,
        opacity: 0.5,
      }),
      unitFace: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
        metalness: 0.3,
      }),
      switchFace: new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.3,
        metalness: 0.6,
      }),
      aluminum: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.85,
        roughness: 0.2,
      }),
      ledGreen: new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x22c55e,
        emissiveIntensity: 2.0,
      }),
      ledAmber: new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xf59e0b,
        emissiveIntensity: 2.0,
      }),
      ledBlue: new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x38bdf8,
        emissiveIntensity: 2.2,
      }),
      cableBlue: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 }),
      cableYellow: new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 }),
    };
  }

  init() {
    // Located in West corner (X = -7.0, Z = -3.2)
    this.createServerRack(-7.0, 0, -3.2);

    this.scene.add(this.group);
  }

  createServerRack(x, y, z) {
    const rack = new THREE.Group();
    const w = 0.85;
    const d = 0.95;
    const h = 2.15;

    // 1. Outer Steel Cabinet Frame
    const cabinet = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      this.materials.rackFrame
    );
    cabinet.position.y = h / 2;
    cabinet.castShadow = true;
    cabinet.receiveShadow = true;
    rack.add(cabinet);

    // Front Glass Door Panel (faces East towards room, +X)
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, h - 0.1, d - 0.12),
      this.materials.rackGlass
    );
    door.position.set(w / 2 + 0.005, h / 2, 0);
    rack.add(door);

    // Chrome door handle
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.35, 12),
      this.materials.aluminum
    );
    handle.position.set(w / 2 + 0.025, h / 2, d / 2 - 0.15);
    rack.add(handle);

    // 2. Rackmount Equipment Stack inside:
    // A. 48-Port Network Switch (Y = 1.65)
    this.createNetworkSwitch(rack, w / 2 - 0.02, 1.65, 0, d - 0.18);

    // B. 24-Port Patch Panel with Jumper Cables (Y = 1.52)
    this.createPatchPanel(rack, w / 2 - 0.02, 1.52, 0, d - 0.18);

    // C. 2U Rackmount Servers (Y = 1.35, 1.15, 0.95)
    this.createRackServer(rack, w / 2 - 0.02, 1.35, 0, d - 0.18, 'DATABASE CLUSTER 01');
    this.createRackServer(rack, w / 2 - 0.02, 1.15, 0, d - 0.18, 'VIRTUALIZATION HOST 02');
    this.createRackServer(rack, w / 2 - 0.02, 0.95, 0, d - 0.18, 'STUDENT STORAGE SAN');

    // D. 3U Rackmount UPS (Y = 0.45)
    this.createUPSUnit(rack, w / 2 - 0.02, 0.45, 0, d - 0.18);

    rack.position.set(x, y, z);
    this.group.add(rack);

    // Collider
    this.colliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, h / 2, z),
        new THREE.Vector3(w + 0.1, h, d + 0.1)
      )
    );

    // Interactivity
    cabinet.userData = {
      name: 'Campus Core Server Rack',
      action: 'Click to Inspect Network Health',
      onClick: () => {
        // Boost LED flashing frequency
        this.ledTimer = 0;
      }
    };
    door.userData = cabinet.userData;
    this.interactables.push(cabinet, door);
  }

  createNetworkSwitch(parent, x, y, z, depth) {
    const sw = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.06, depth),
      this.materials.switchFace
    );
    sw.position.set(x - 0.06, y, z);
    parent.add(sw);

    // Front Panel with 2 rows of 16 blinking LED activity lights
    for (let r = 0; r < 2; r++) {
      for (let p = 0; p < 16; p++) {
        const led = new THREE.Mesh(
          new THREE.SphereGeometry(0.003, 6, 6),
          p % 5 === 0 ? this.materials.ledAmber : this.materials.ledGreen
        );
        led.position.set(x + 0.002, y - 0.015 + r * 0.03, -depth / 2 + 0.08 + p * 0.04);
        parent.add(led);
        this.blinkingLeds.push(led);
      }
    }
  }

  createPatchPanel(parent, x, y, z, depth) {
    const pp = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.05, depth),
      this.materials.unitFace
    );
    pp.position.set(x - 0.06, y, z);
    parent.add(pp);

    // Jumper Ethernet Cables looped to switch above
    for (let c = 0; c < 12; c++) {
      const cableMat = c % 2 === 0 ? this.materials.cableBlue : this.materials.cableYellow;
      const cableLoop = new THREE.Mesh(
        new THREE.TorusGeometry(0.02, 0.003, 6, 12, Math.PI),
        cableMat
      );
      cableLoop.rotation.y = Math.PI / 2;
      cableLoop.position.set(x + 0.01, y + 0.06, -depth / 2 + 0.1 + c * 0.05);
      parent.add(cableLoop);
    }
  }

  createRackServer(parent, x, y, z, depth, serverLabel) {
    const srv = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.09, depth),
      this.materials.unitFace
    );
    srv.position.set(x - 0.06, y, z);
    parent.add(srv);

    // Hot swap drive caddies (8 caddies)
    for (let d = 0; d < 8; d++) {
      const caddy = new THREE.Mesh(
        new THREE.BoxGeometry(0.01, 0.07, 0.06),
        this.materials.aluminum
      );
      caddy.position.set(x + 0.002, y, -depth / 2 + 0.08 + d * 0.08);
      parent.add(caddy);

      // Blue drive activity LED
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.003, 6, 6),
        this.materials.ledBlue
      );
      led.position.set(x + 0.008, y + 0.025, -depth / 2 + 0.08 + d * 0.08);
      parent.add(led);
      this.blinkingLeds.push(led);
    }
  }

  createUPSUnit(parent, x, y, z, depth) {
    const ups = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.18, depth),
      this.materials.unitFace
    );
    ups.position.set(x - 0.06, y, z);
    parent.add(ups);

    // UPS LCD status screen
    const lcd = new THREE.Mesh(
      new THREE.PlaneGeometry(0.12, 0.06),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    );
    lcd.rotation.y = Math.PI / 2;
    lcd.position.set(x + 0.005, y, 0);
    parent.add(lcd);
  }

  update(delta) {
    this.ledTimer += delta;
    if (this.ledTimer > 0.15) {
      this.ledTimer = 0;
      for (let i = 0; i < this.blinkingLeds.length; i++) {
        // Random network activity packet flash
        if (Math.random() < 0.35) {
          this.blinkingLeds[i].visible = !this.blinkingLeds[i].visible;
        }
      }
    }
  }
}
