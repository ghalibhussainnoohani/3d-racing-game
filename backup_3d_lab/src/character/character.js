import * as THREE from 'three';

/**
 * Humanoid Character built purely from Three.js primitives
 * Jointed hierarchy: root -> hips -> torso -> neck -> head -> limbs
 * Supports procedural idle, walk, run, jump, sit, and typing animations.
 */
export class LabCharacter {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    // Animation state
    this.state = 'idle'; // 'idle', 'walk', 'run', 'jump', 'sitting'
    this.animTime = 0;
    this.walkSpeed = 0;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.targetRotation = 0;
    this.currentRotation = 0;

    // Sitting reference
    this.currentChair = null;

    // Body parts dictionary
    this.parts = {};
    this.hairMeshes = {};
    this.accessories = {};

    this.materials = this.initMaterials();
    this.createCharacter();

    this.scene.add(this.group);
  }

  initMaterials() {
    return {
      skin: new THREE.MeshStandardMaterial({
        color: 0xf5d0b5, // Default peach skin
        roughness: 0.6,
      }),
      hair: new THREE.MeshStandardMaterial({
        color: 0x2b1d0c, // Dark brown hair
        roughness: 0.7,
      }),
      eyes: new THREE.MeshBasicMaterial({ color: 0x0f172a }),
      eyesWhite: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      shirt: new THREE.MeshStandardMaterial({
        color: 0x0284c7, // University blue
        roughness: 0.65,
      }),
      pants: new THREE.MeshStandardMaterial({
        color: 0x1e293b, // Dark denim / slate
        roughness: 0.7,
      }),
      shoes: new THREE.MeshStandardMaterial({
        color: 0xf1f5f9, // White sneakers
        roughness: 0.5,
      }),
      hoodieMat: new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.7,
      }),
      glassesMat: new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.8,
        roughness: 0.2,
      }),
      capMat: new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        roughness: 0.6,
      }),
      headphonesMat: new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.7,
        roughness: 0.3,
      }),
      lanyardMat: new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.5,
      }),
      badgeMat: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    };
  }

  createCharacter() {
    // Root group
    this.root = new THREE.Group();
    this.group.add(this.root);

    // 1. Hips / Pelvis
    this.hips = new THREE.Group();
    this.hips.position.y = 0.95;
    this.root.add(this.hips);

    const pelvisMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.16, 0.2),
      this.materials.pants
    );
    this.hips.add(pelvisMesh);
    this.parts.pelvis = pelvisMesh;

    // 2. Spine & Torso (Chest)
    this.torso = new THREE.Group();
    this.torso.position.y = 0.08;
    this.hips.add(this.torso);

    const chestMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.38, 0.22),
      this.materials.shirt
    );
    chestMesh.position.y = 0.19;
    this.torso.add(chestMesh);
    this.parts.chest = chestMesh;

    // 3. Neck & Head
    this.neck = new THREE.Group();
    this.neck.position.y = 0.38;
    this.torso.add(this.neck);

    const neckMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.07, 0.08, 12),
      this.materials.skin
    );
    neckMesh.position.y = 0.04;
    this.neck.add(neckMesh);

    this.head = new THREE.Group();
    this.head.position.y = 0.08;
    this.neck.add(this.head);

    // Stylized Head Mesh
    const headMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.26, 0.24),
      this.materials.skin
    );
    headMesh.position.y = 0.13;
    this.head.add(headMesh);
    this.parts.head = headMesh;

    // Eyes
    [-0.055, 0.055].forEach(ex => {
      // Sclera
      const sclera = new THREE.Mesh(
        new THREE.PlaneGeometry(0.04, 0.035),
        this.materials.eyesWhite
      );
      sclera.position.set(ex, 0.14, 0.122);
      this.head.add(sclera);

      // Pupil
      const pupil = new THREE.Mesh(
        new THREE.PlaneGeometry(0.02, 0.025),
        this.materials.eyes
      );
      pupil.position.set(ex, 0.14, 0.124);
      this.head.add(pupil);
    });

    // Hair Styles (Created and toggled on demand)
    this.createHairStyles();

    // 4. Arms (Left & Right)
    this.createArms();

    // 5. Legs (Left & Right)
    this.createLegs();

    // 6. Accessories (Glasses, Cap, Hoodie, Headphones, Lanyard)
    this.createAccessories();

    // 7. Floating Name Tag above head
    this.createNameTag('Student');
  }

  createHairStyles() {
    this.hairGroup = new THREE.Group();
    this.head.add(this.hairGroup);

    // A. Short Hair
    const shortHair = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.1, 0.26),
      this.materials.hair
    );
    shortHair.position.set(0, 0.25, -0.01);
    this.hairGroup.add(shortHair);
    this.hairMeshes.short = shortHair;

    // B. Long Hair
    const longHairGroup = new THREE.Group();
    const longTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.1, 0.26),
      this.materials.hair
    );
    longTop.position.set(0, 0.25, -0.01);
    longHairGroup.add(longTop);

    const longBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.35, 0.08),
      this.materials.hair
    );
    longBack.position.set(0, 0.1, -0.12);
    longHairGroup.add(longBack);
    this.hairGroup.add(longHairGroup);
    this.hairMeshes.long = longHairGroup;
    longHairGroup.visible = false;

    // C. Bun Hair
    const bunGroup = new THREE.Group();
    const bunBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.09, 0.26),
      this.materials.hair
    );
    bunBase.position.set(0, 0.25, -0.01);
    bunGroup.add(bunBase);

    const bunSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 10),
      this.materials.hair
    );
    bunSphere.position.set(0, 0.35, -0.04);
    bunGroup.add(bunSphere);
    this.hairGroup.add(bunGroup);
    this.hairMeshes.bun = bunGroup;
    bunGroup.visible = false;

    // D. Spiky Hair
    const spikyGroup = new THREE.Group();
    const spikyBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.08, 0.26),
      this.materials.hair
    );
    spikyBase.position.set(0, 0.25, -0.01);
    spikyGroup.add(spikyBase);

    for (let s = -0.08; s <= 0.08; s += 0.04) {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.03, 0.09, 6),
        this.materials.hair
      );
      spike.position.set(s, 0.31, 0.02);
      spike.rotation.z = s * -2;
      spikyGroup.add(spike);
    }
    this.hairGroup.add(spikyGroup);
    this.hairMeshes.spiky = spikyGroup;
    spikyGroup.visible = false;
  }

  setHairStyle(style) {
    Object.values(this.hairMeshes).forEach(h => h.visible = false);
    if (this.hairMeshes[style]) {
      this.hairMeshes[style].visible = true;
    }
  }

  createArms() {
    // Left Arm
    this.leftShoulder = new THREE.Group();
    this.leftShoulder.position.set(-0.2, 0.34, 0);
    this.torso.add(this.leftShoulder);

    const leftUpperMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.22, 0.09),
      this.materials.shirt
    );
    leftUpperMesh.position.y = -0.11;
    this.leftShoulder.add(leftUpperMesh);

    this.leftElbow = new THREE.Group();
    this.leftElbow.position.y = -0.22;
    this.leftShoulder.add(this.leftElbow);

    const leftForearmMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.2, 0.08),
      this.materials.skin
    );
    leftForearmMesh.position.y = -0.1;
    this.leftElbow.add(leftForearmMesh);

    const leftHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.07, 0.05),
      this.materials.skin
    );
    leftHand.position.y = -0.22;
    this.leftElbow.add(leftHand);

    // Right Arm
    this.rightShoulder = new THREE.Group();
    this.rightShoulder.position.set(0.2, 0.34, 0);
    this.torso.add(this.rightShoulder);

    const rightUpperMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.22, 0.09),
      this.materials.shirt
    );
    rightUpperMesh.position.y = -0.11;
    this.rightShoulder.add(rightUpperMesh);

    this.rightElbow = new THREE.Group();
    this.rightElbow.position.y = -0.22;
    this.rightShoulder.add(this.rightElbow);

    const rightForearmMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.2, 0.08),
      this.materials.skin
    );
    rightForearmMesh.position.y = -0.1;
    this.rightElbow.add(rightForearmMesh);

    const rightHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.07, 0.05),
      this.materials.skin
    );
    rightHand.position.y = -0.22;
    this.rightElbow.add(rightHand);
  }

  createLegs() {
    // Left Leg
    this.leftHipJoint = new THREE.Group();
    this.leftHipJoint.position.set(-0.09, -0.06, 0);
    this.hips.add(this.leftHipJoint);

    const leftThigh = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.4, 0.12),
      this.materials.pants
    );
    leftThigh.position.y = -0.2;
    this.leftHipJoint.add(leftThigh);

    this.leftKnee = new THREE.Group();
    this.leftKnee.position.y = -0.4;
    this.leftHipJoint.add(this.leftKnee);

    const leftShin = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.4, 0.11),
      this.materials.pants
    );
    leftShin.position.y = -0.2;
    this.leftKnee.add(leftShin);

    const leftFoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.08, 0.18),
      this.materials.shoes
    );
    leftFoot.position.set(0, -0.42, 0.04);
    this.leftKnee.add(leftFoot);

    // Right Leg
    this.rightHipJoint = new THREE.Group();
    this.rightHipJoint.position.set(0.09, -0.06, 0);
    this.hips.add(this.rightHipJoint);

    const rightThigh = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.4, 0.12),
      this.materials.pants
    );
    rightThigh.position.y = -0.2;
    this.rightHipJoint.add(rightThigh);

    this.rightKnee = new THREE.Group();
    this.rightKnee.position.y = -0.4;
    this.rightHipJoint.add(this.rightKnee);

    const rightShin = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.4, 0.11),
      this.materials.pants
    );
    rightShin.position.y = -0.2;
    this.rightKnee.add(rightShin);

    const rightFoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.08, 0.18),
      this.materials.shoes
    );
    rightFoot.position.set(0, -0.42, 0.04);
    this.rightKnee.add(rightFoot);
  }

  createAccessories() {
    // 1. Glasses
    const glassesGroup = new THREE.Group();
    [-0.055, 0.055].forEach(gx => {
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.028, 0.005, 6, 12),
        this.materials.glassesMat
      );
      rim.position.set(gx, 0.14, 0.13);
      glassesGroup.add(rim);
    });
    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.006, 0.01),
      this.materials.glassesMat
    );
    bridge.position.set(0, 0.14, 0.13);
    glassesGroup.add(bridge);
    this.head.add(glassesGroup);
    this.accessories.glasses = glassesGroup;
    glassesGroup.visible = false;

    // 2. Cap
    const capGroup = new THREE.Group();
    const capDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      this.materials.capMat
    );
    capDome.position.set(0, 0.22, 0);
    capGroup.add(capDome);

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.015, 0.12),
      this.materials.capMat
    );
    visor.position.set(0, 0.22, 0.15);
    visor.rotation.x = 0.1;
    capGroup.add(visor);
    this.head.add(capGroup);
    this.accessories.cap = capGroup;
    capGroup.visible = false;

    // 3. Hoodie collar
    const hoodie = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.035, 8, 16),
      this.materials.hoodieMat
    );
    hoodie.rotation.x = Math.PI / 2;
    hoodie.position.set(0, 0.36, -0.02);
    this.torso.add(hoodie);
    this.accessories.hoodie = hoodie;
    hoodie.visible = false;

    // 4. Over-ear Headphones
    const hpGroup = new THREE.Group();
    [-0.135, 0.135].forEach(hx => {
      const earCup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.03, 12),
        this.materials.headphonesMat
      );
      earCup.rotation.z = Math.PI / 2;
      earCup.position.set(hx, 0.14, 0);
      hpGroup.add(earCup);
    });
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.135, 0.015, 8, 16, Math.PI),
      this.materials.headphonesMat
    );
    band.position.set(0, 0.16, 0);
    hpGroup.add(band);
    this.head.add(hpGroup);
    this.accessories.headphones = hpGroup;
    hpGroup.visible = false;

    // 5. ID Lanyard
    const lanyardGroup = new THREE.Group();
    const strap = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.008, 6, 16),
      this.materials.lanyardMat
    );
    strap.rotation.x = Math.PI / 3;
    strap.position.set(0, 0.26, 0.05);
    lanyardGroup.add(strap);

    const badge = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.09, 0.005),
      this.materials.badgeMat
    );
    badge.position.set(0, 0.1, 0.13);
    lanyardGroup.add(badge);
    this.torso.add(lanyardGroup);
    this.accessories.lanyard = lanyardGroup;
    lanyardGroup.visible = false;
  }

  createNameTag(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    this.nameCanvas = canvas;
    this.nameCtx = canvas.getContext('2d');
    this.nameTex = new THREE.CanvasTexture(canvas);

    this.updateNameTag(name);

    const spriteMat = new THREE.SpriteMaterial({
      map: this.nameTex,
      transparent: true,
    });
    this.nameSprite = new THREE.Sprite(spriteMat);
    this.nameSprite.scale.set(0.9, 0.22, 1);
    this.nameSprite.position.set(0, 0.48, 0);
    this.head.add(this.nameSprite);
  }

  updateNameTag(name) {
    const ctx = this.nameCtx;
    ctx.clearRect(0, 0, 256, 64);

    // Pill background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(10, 8, 236, 48, 24);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Name Text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name || 'Student', 128, 40);

    this.nameTex.needsUpdate = true;
  }

  setSitting(chair) {
    if (this.state === 'sitting') {
      // Stand up
      this.state = 'idle';
      this.currentChair = null;
      this.root.position.y = 0;
      this.resetLimbsToNeutral();
      return false;
    } else if (chair) {
      // Sit down on chair
      this.state = 'sitting';
      this.currentChair = chair;
      const seatPos = chair.userData.seatWorldPos;
      if (seatPos) {
        this.group.position.x = seatPos.x;
        this.group.position.z = seatPos.z;
        this.targetRotation = 0; // Face forward towards desk
        this.currentRotation = 0;
        this.root.rotation.y = 0;
      }
      return true;
    }
  }

  resetLimbsToNeutral() {
    this.leftShoulder.rotation.set(0, 0, 0);
    this.rightShoulder.rotation.set(0, 0, 0);
    this.leftElbow.rotation.set(0, 0, 0);
    this.rightElbow.rotation.set(0, 0, 0);
    this.leftHipJoint.rotation.set(0, 0, 0);
    this.rightHipJoint.rotation.set(0, 0, 0);
    this.leftKnee.rotation.set(0, 0, 0);
    this.rightKnee.rotation.set(0, 0, 0);
    this.torso.rotation.set(0, 0, 0);
    this.hips.position.y = 0.95;
  }

  update(delta, moveDir, isRunning, isJumping) {
    this.animTime += delta;

    // Handle Sitting pose & typing
    if (this.state === 'sitting') {
      this.hips.position.y = 0.62; // Lower to chair cushion
      // 90-degree hip bend forward
      this.leftHipJoint.rotation.x = -Math.PI / 2 + 0.1;
      this.rightHipJoint.rotation.x = -Math.PI / 2 + 0.1;
      // 90-degree knee bend down
      this.leftKnee.rotation.x = Math.PI / 2;
      this.rightKnee.rotation.x = Math.PI / 2;

      // Arms reaching forward to keyboard
      this.leftShoulder.rotation.x = -0.7;
      this.rightShoulder.rotation.x = -0.7;

      // Typing animation (gentle finger tapping oscillation)
      const typeSpeed = 16;
      this.leftElbow.rotation.x = -0.6 + Math.sin(this.animTime * typeSpeed) * 0.08;
      this.rightElbow.rotation.x = -0.6 + Math.cos(this.animTime * typeSpeed * 1.2) * 0.08;
      return;
    }

    // Smooth movement rotation
    if (moveDir.lengthSq() > 0.01) {
      this.targetRotation = Math.atan2(moveDir.x, moveDir.z);
      // Angular interpolation
      let diff = this.targetRotation - this.currentRotation;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.currentRotation += diff * delta * 12;
      this.root.rotation.y = this.currentRotation;

      this.state = isRunning ? 'run' : 'walk';
    } else {
      this.state = 'idle';
    }

    // Animation states
    if (this.state === 'idle') {
      // Idle Breathing
      const breath = Math.sin(this.animTime * 2.5);
      this.torso.position.y = 0.08 + breath * 0.006;
      this.parts.chest.scale.set(1 + breath * 0.02, 1, 1 + breath * 0.015);

      this.leftShoulder.rotation.set(0, 0, 0.05 + breath * 0.01);
      this.rightShoulder.rotation.set(0, 0, -0.05 - breath * 0.01);
      this.leftElbow.rotation.set(0, 0, 0);
      this.rightElbow.rotation.set(0, 0, 0);

      this.leftHipJoint.rotation.set(0, 0, 0);
      this.rightHipJoint.rotation.set(0, 0, 0);
      this.leftKnee.rotation.set(0, 0, 0);
      this.rightKnee.rotation.set(0, 0, 0);
      this.hips.position.y = 0.95;

    } else if (this.state === 'walk') {
      const freq = 7.5;
      const t = this.animTime * freq;
      const swing = Math.sin(t) * 0.55;

      // Legs swing in opposite directions
      this.leftHipJoint.rotation.x = swing;
      this.rightHipJoint.rotation.x = -swing;

      // Knee bending on backswing
      this.leftKnee.rotation.x = swing < 0 ? Math.abs(swing) * 1.1 : 0.05;
      this.rightKnee.rotation.x = swing > 0 ? Math.abs(swing) * 1.1 : 0.05;

      // Arms counter-swing
      this.leftShoulder.rotation.x = -swing * 0.8;
      this.rightShoulder.rotation.x = swing * 0.8;
      this.leftElbow.rotation.x = -0.2;
      this.rightElbow.rotation.x = -0.2;

      // Torso bobbing
      this.hips.position.y = 0.95 + Math.abs(Math.sin(t)) * 0.04;
      this.torso.rotation.y = Math.sin(t) * 0.08;

    } else if (this.state === 'run') {
      const freq = 12.0;
      const t = this.animTime * freq;
      const swing = Math.sin(t) * 0.85;

      // Legs vigorous swing
      this.leftHipJoint.rotation.x = swing;
      this.rightHipJoint.rotation.x = -swing;

      // High knee lift
      this.leftKnee.rotation.x = swing < 0 ? Math.abs(swing) * 1.5 : 0.1;
      this.rightKnee.rotation.x = swing > 0 ? Math.abs(swing) * 1.5 : 0.1;

      // Bent arm sprinting pump
      this.leftShoulder.rotation.x = -swing * 1.2;
      this.rightShoulder.rotation.x = swing * 1.2;
      this.leftElbow.rotation.x = -0.8;
      this.rightElbow.rotation.x = -0.8;

      // Forward lean & dynamic bounce
      this.torso.rotation.x = 0.22;
      this.hips.position.y = 0.95 + Math.abs(Math.sin(t)) * 0.08;
      this.torso.rotation.y = Math.sin(t) * 0.12;
    }
  }
}
