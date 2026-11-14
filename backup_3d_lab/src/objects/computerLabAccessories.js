import * as THREE from 'three';

/**
 * Computer Lab Accessories:
 * 3D Printer, Office Multi-Function Laser Printer/Scanner, CS Bookshelf,
 * Water Dispenser, and Educational Tech Posters.
 */
export class ComputerLabAccessories {
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
      plasticWhite: new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.3,
      }),
      plasticDark: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.2,
      }),
      metalSteel: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.85,
        roughness: 0.25,
      }),
      bookWood: new THREE.MeshStandardMaterial({
        color: 0x451a03, // Walnut veneer bookshelf
        roughness: 0.5,
      }),
      waterBottle: new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.9,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
      }),
      touchScreen: new THREE.MeshBasicMaterial({
        color: 0x0284c7,
      }),
    };
  }

  init() {
    // 1. 3D Printer on side table along East wall (X = 7.0, Z = 0.5)
    this.create3DPrinter(7.0, 0, 0.5);

    // 2. Office Multi-Function Laser Printer/Scanner (X = 7.0, Z = -1.2)
    this.createOfficePrinter(7.0, 0, -1.2);

    // 3. Bookshelf with CS & Programming books (X = 7.2, Z = 2.4)
    this.createBookshelf(7.2, 0, 2.4);

    // 4. Water Cooler / Dispenser (X = -7.1, Z = 3.6, near door)
    this.createWaterDispenser(-7.1, 0, 3.6);

    // 5. Tech Posters on West & East Walls
    this.createPosters();

    this.scene.add(this.group);
  }

  create3DPrinter(x, y, z) {
    const printerGroup = new THREE.Group();

    // Table
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.04, 0.75),
      this.materials.plasticDark
    );
    tableTop.position.y = 0.72;
    printerGroup.add(tableTop);

    // Table legs
    [-0.38, 0.38].forEach(lx => {
      [-0.32, 0.32].forEach(lz => {
        const leg = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.7, 0.04),
          this.materials.metalSteel
        );
        leg.position.set(lx, 0.35, lz);
        printerGroup.add(leg);
      });
    });

    // 3D Printer Chassis on table
    const py = 0.74;
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.08, 0.44),
      this.materials.plasticDark
    );
    base.position.set(0, py + 0.04, 0);
    printerGroup.add(base);

    // Vertical Gantry Pillars
    [-0.2, 0.2].forEach(gx => {
      const gantry = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.48, 0.03),
        this.materials.metalSteel
      );
      gantry.position.set(gx, py + 0.32, 0);
      printerGroup.add(gantry);
    });

    // Horizontal Top Beam
    const topBeam = new THREE.Mesh(
      new THREE.BoxGeometry(0.43, 0.03, 0.03),
      this.materials.metalSteel
    );
    topBeam.position.set(0, py + 0.55, 0);
    printerGroup.add(topBeam);

    // Heated Print Bed
    const bed = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.015, 0.26),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 })
    );
    bed.position.set(0, py + 0.1, 0);
    printerGroup.add(bed);

    // Filament Spool on Top
    const spool = new THREE.Mesh(
      new THREE.TorusGeometry(0.065, 0.02, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
    );
    spool.rotation.y = Math.PI / 2;
    spool.position.set(-0.16, py + 0.65, 0);
    printerGroup.add(spool);

    // Printed 3D object on bed (spiral gear)
    const printedObj = new THREE.Mesh(
      new THREE.TorusGeometry(0.035, 0.015, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
    );
    printedObj.rotation.x = Math.PI / 2;
    printedObj.position.set(0, py + 0.125, 0);
    printerGroup.add(printedObj);

    printerGroup.position.set(x, y, z);
    this.group.add(printerGroup);

    this.colliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, 0.6, z),
        new THREE.Vector3(0.9, 1.2, 0.8)
      )
    );

    base.userData = {
      name: 'Rapid Prototyping 3D Printer',
      action: 'Click to Inspect Current Print Job',
      onClick: () => {}
    };
    this.interactables.push(base);
  }

  createOfficePrinter(x, y, z) {
    const printer = new THREE.Group();
    const w = 0.72;
    const d = 0.68;
    const h = 1.15;

    // Main lower body (paper drawer cassettes)
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h * 0.7, d),
      this.materials.plasticWhite
    );
    body.position.y = (h * 0.7) / 2;
    body.castShadow = true;
    printer.add(body);

    // Paper tray lines
    for (let t = 0; t < 3; t++) {
      const trayLine = new THREE.Mesh(
        new THREE.BoxGeometry(w - 0.04, 0.01, 0.01),
        this.materials.plasticDark
      );
      trayLine.position.set(0, 0.15 + t * 0.18, d / 2 + 0.005);
      printer.add(trayLine);
    }

    // Top Flatbed Scanner unit & Automatic Document Feeder (ADF)
    const scanner = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.18, d),
      this.materials.plasticDark
    );
    scanner.position.y = h * 0.7 + 0.09;
    printer.add(scanner);

    const adf = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.8, 0.12, d * 0.8),
      this.materials.plasticWhite
    );
    adf.position.set(0, h * 0.7 + 0.24, 0);
    printer.add(adf);

    // Touchscreen Control Panel
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.12, 0.02),
      this.materials.touchScreen
    );
    panel.rotation.x = -Math.PI / 4;
    panel.position.set(w / 2 - 0.14, h * 0.7 + 0.18, d / 2 + 0.04);
    printer.add(panel);

    printer.position.set(x, y, z);
    printer.rotation.y = -Math.PI / 2; // Face towards room
    this.group.add(printer);

    this.colliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, h / 2, z),
        new THREE.Vector3(d + 0.1, h, w + 0.1)
      )
    );

    body.userData = {
      name: 'Department Laser Printer / Scanner',
      action: 'Click to Print Student Queue',
      onClick: () => {}
    };
    this.interactables.push(body);
  }

  createBookshelf(x, y, z) {
    const shelf = new THREE.Group();
    const w = 1.2;
    const d = 0.38;
    const h = 2.0;

    // Wood frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      this.materials.bookWood
    );
    frame.position.y = h / 2;
    frame.castShadow = true;
    shelf.add(frame);

    // Interior cutout / shelves (4 tiers)
    const bookColors = [0x0284c7, 0xdc2626, 0x16a34a, 0xeab308, 0x9333ea, 0x475569];

    for (let s = 0; s < 4; s++) {
      const sy = 0.35 + s * 0.44;
      // Shelf board
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(w - 0.06, 0.025, d - 0.04),
        this.materials.bookWood
      );
      board.position.set(0, sy, 0.02);
      shelf.add(board);

      // Row of Books
      const bookCount = 14;
      const startX = -w / 2 + 0.1;
      for (let b = 0; b < bookCount; b++) {
        const bookH = 0.24 + Math.random() * 0.08;
        const bookW = 0.035 + Math.random() * 0.02;
        const bookD = 0.22;
        const bookMat = new THREE.MeshStandardMaterial({
          color: bookColors[(s * 5 + b) % bookColors.length],
          roughness: 0.6
        });
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(bookW, bookH, bookD),
          bookMat
        );
        book.position.set(startX + b * 0.065, sy + bookH / 2 + 0.012, 0.02);
        shelf.add(book);
      }
    }

    shelf.position.set(x, y, z);
    shelf.rotation.y = -Math.PI / 2;
    this.group.add(shelf);

    this.colliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, h / 2, z),
        new THREE.Vector3(d + 0.1, h, w + 0.1)
      )
    );
  }

  createWaterDispenser(x, y, z) {
    const dispenser = new THREE.Group();
    const w = 0.38;
    const d = 0.38;
    const h = 1.05;

    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      this.materials.plasticWhite
    );
    body.position.y = h / 2;
    dispenser.add(body);

    // Inverted Blue 5-Gallon Water Bottle on top
    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.38, 20),
      this.materials.waterBottle
    );
    bottle.position.y = h + 0.19;
    dispenser.add(bottle);

    const bottleDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      this.materials.waterBottle
    );
    bottleDome.position.y = h + 0.38;
    dispenser.add(bottleDome);

    // Hot & Cold Spigots (Red & Blue)
    const coldSpigot = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.04, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x0284c7 })
    );
    coldSpigot.position.set(-0.06, h - 0.22, d / 2 + 0.02);
    dispenser.add(coldSpigot);

    const hotSpigot = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.04, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xef4444 })
    );
    hotSpigot.position.set(0.06, h - 0.22, d / 2 + 0.02);
    dispenser.add(hotSpigot);

    dispenser.position.set(x, y, z);
    dispenser.rotation.y = Math.PI / 2; // Face into room
    this.group.add(dispenser);

    this.colliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, h / 2, z),
        new THREE.Vector3(d + 0.1, h + 0.4, w + 0.1)
      )
    );

    body.userData = {
      name: 'Filtered Water Dispenser',
      action: 'Click to Drink Water',
      onClick: () => {}
    };
    this.interactables.push(body);
  }

  createPosters() {
    const posterData = [
      { title: 'GIT CHEAT SHEET', color: '#f97316', x: -7.88, z: -1.2, yaw: Math.PI / 2 },
      { title: 'NEURAL NETWORKS & DEEP LEARNING', color: '#8b5cf6', x: -7.88, z: 0.8, yaw: Math.PI / 2 },
      { title: 'CLEAN CODE & BEST PRACTICES', color: '#10b981', x: 7.88, z: -3.2, yaw: -Math.PI / 2 }
    ];

    posterData.forEach(p => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 720);

      ctx.fillStyle = p.color;
      ctx.fillRect(0, 0, 512, 40);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.title, 256, 30);

      // Poster visual artwork
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 70, 452, 600);

      // Grid / diagrams
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px "JetBrains Mono", monospace';
      ctx.fillText('• Branching & PR Workflows', 256, 180);
      ctx.fillText('• Semantic Commit Standards', 256, 260);
      ctx.fillText('• Continuous Integration (CI/CD)', 256, 340);
      ctx.fillText('• Automated Unit & E2E Testing', 256, 420);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.4), mat);
      mesh.position.set(p.x, 2.0, p.z);
      mesh.rotation.y = p.yaw;
      this.group.add(mesh);
    });
  }
}
