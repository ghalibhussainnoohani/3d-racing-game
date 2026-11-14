import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Advanced Multi-Mode Player & Camera Controller:
 * Camera Modes (toggled with 'V'):
 *  1. 'third-person' : Follows customizable humanoid character, mouse wheel zooms
 *  2. 'first-person'  : Eye-level perspective with PointerLockControls
 *  3. 'free-orbit'    : Elevated 3D inspection orbit camera
 * Movement: WASD, Shift run, Space jump, E sit/stand
 */
export class LabControls {
  constructor(camera, domElement, collisionSystem, hud, character, interactables) {
    this.camera = camera;
    this.domElement = domElement;
    this.collisionSystem = collisionSystem;
    this.hud = hud;
    this.character = character;
    this.interactables = interactables || [];

    // Camera modes: 'third-person' (default), 'first-person', 'free-orbit'
    this.cameraMode = 'third-person';
    this.thirdPersonDistance = 3.2;
    this.thirdPersonPitch = 0.25;
    this.thirdPersonYaw = 0;

    // Movement state
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isSprinting = false;
    this.isJumping = false;

    this.velocity = new THREE.Vector3();
    this.verticalVelocity = 0;
    this.gravity = -16.0;
    this.jumpForce = 5.2;
    this.isGrounded = true;

    // Spawn position near entrance (X = -4.5, Z = 3.8)
    this.playerPos = new THREE.Vector3(-4.5, 0, 3.8);
    if (this.character) {
      this.character.group.position.copy(this.playerPos);
    }

    // PointerLock for mouse look
    this.fpControls = new PointerLockControls(this.camera, document.body);

    // Orbit Camera for Free Orbit Mode
    this.orbitCamera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.orbitCamera.position.set(0, 11, 8.5);
    this.orbitCamera.lookAt(0, 1.2, 0);

    this.orbitControls = new OrbitControls(this.orbitCamera, this.domElement);
    this.orbitControls.target.set(0, 1.2, 0);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.maxPolarAngle = Math.PI / 2.05;
    this.orbitControls.enabled = false;

    this.initEvents();
  }

  initEvents() {
    const blocker = document.getElementById('blocker');
    const startBtn = document.getElementById('start-btn');

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.lock();
      });
    }

    this.fpControls.addEventListener('lock', () => {
      if (blocker) blocker.classList.add('hidden');
    });

    this.fpControls.addEventListener('unlock', () => {
      if (this.cameraMode !== 'free-orbit' && blocker) {
        blocker.classList.remove('hidden');
      }
    });

    // Mouse movement in Third-Person mode
    document.addEventListener('mousemove', (event) => {
      if (this.fpControls.isLocked && this.cameraMode === 'third-person') {
        const sens = 0.0022;
        this.thirdPersonYaw -= event.movementX * sens;
        this.thirdPersonPitch += event.movementY * sens;
        this.thirdPersonPitch = Math.max(-0.35, Math.min(1.2, this.thirdPersonPitch));
      }
    });

    // Mouse Wheel Zoom
    window.addEventListener('wheel', (event) => {
      if (this.cameraMode === 'third-person') {
        this.thirdPersonDistance += event.deltaY * 0.003;
        this.thirdPersonDistance = Math.max(1.4, Math.min(6.5, this.thirdPersonDistance));
      }
    });

    // Keyboard controls
    const onKeyDown = (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveForward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.moveBackward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveLeft = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveRight = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.isSprinting = true;
          break;
        case 'Space':
          this.jump();
          break;
        case 'KeyE':
          this.handleSitOrStand();
          break;
        case 'KeyV':
          this.cycleCameraMode();
          break;
        case 'KeyO':
          this.toggleOverviewMode();
          break;
      }
    };

    const onKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveForward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.moveBackward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveLeft = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveRight = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.isSprinting = false;
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  }

  lock() {
    if (this.cameraMode !== 'free-orbit') {
      this.fpControls.lock();
    }
  }

  unlock() {
    this.fpControls.unlock();
  }

  jump() {
    if (this.isGrounded && (!this.character || this.character.state !== 'sitting')) {
      this.verticalVelocity = this.jumpForce;
      this.isGrounded = false;
    }
  }

  handleSitOrStand() {
    if (!this.character) return;

    if (this.character.state === 'sitting') {
      // Stand up
      this.character.setSitting(null);
      return;
    }

    // Check if player is near any chair
    let closestChair = null;
    let closestDist = 1.35; // Interaction radius

    for (let i = 0; i < this.interactables.length; i++) {
      const item = this.interactables[i];
      if (item && item.userData && item.userData.isChair && item.userData.seatWorldPos) {
        const dist = this.playerPos.distanceTo(item.userData.seatWorldPos);
        if (dist < closestDist) {
          closestChair = item;
          closestDist = dist;
        }
      }
    }

    if (closestChair) {
      this.character.setSitting(closestChair);
    }
  }

  cycleCameraMode() {
    const modes = ['third-person', 'first-person', 'free-orbit'];
    const nextIdx = (modes.indexOf(this.cameraMode) + 1) % modes.length;
    this.setCameraMode(modes[nextIdx]);
  }

  toggleOverviewMode() {
    if (this.cameraMode === 'free-orbit') {
      this.setCameraMode('third-person');
    } else {
      this.setCameraMode('free-orbit');
    }
  }

  setCameraMode(mode) {
    this.cameraMode = mode;

    if (mode === 'free-orbit') {
      this.fpControls.unlock();
      this.orbitControls.enabled = true;
      const blocker = document.getElementById('blocker');
      if (blocker) blocker.classList.add('hidden');
      if (this.hud) {
        this.hud.setModeText('Orbit Mode (V)');
        this.hud.setCrosshairVisible(false);
      }
      if (this.character) this.character.group.visible = true;

    } else if (mode === 'first-person') {
      this.orbitControls.enabled = false;
      this.fpControls.lock();
      if (this.hud) {
        this.hud.setModeText('First-Person (V)');
        this.hud.setCrosshairVisible(true);
      }
      // Hide character body so it doesn't block FP camera
      if (this.character) this.character.group.visible = false;

    } else { // 'third-person'
      this.orbitControls.enabled = false;
      this.fpControls.lock();
      if (this.hud) {
        this.hud.setModeText('Third-Person (V)');
        this.hud.setCrosshairVisible(false);
      }
      if (this.character) this.character.group.visible = true;
    }
  }

  getActiveCamera() {
    return this.cameraMode === 'free-orbit' ? this.orbitCamera : this.camera;
  }

  update(delta) {
    if (this.cameraMode === 'free-orbit') {
      this.orbitControls.update();
      if (this.character) {
        this.character.update(delta, new THREE.Vector3(0, 0, 0), false, false);
      }
      return;
    }

    // Sitting state: lock movement until standing up
    if (this.character && this.character.state === 'sitting') {
      this.updateCameraFollow();
      this.character.update(delta, new THREE.Vector3(0, 0, 0), false, false);
      return;
    }

    if (!this.fpControls.isLocked) return;

    // Movement calculation
    const speed = this.isSprinting ? 5.2 : 2.8;

    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;

    // Movement input vector
    const dirZ = Number(this.moveForward) - Number(this.moveBackward);
    const dirX = Number(this.moveRight) - Number(this.moveLeft);

    // Get movement orientation relative to current yaw
    let forwardAngle = 0;
    if (this.cameraMode === 'third-person') {
      forwardAngle = this.thirdPersonYaw;
    } else {
      const camDir = new THREE.Vector3();
      this.camera.getWorldDirection(camDir);
      forwardAngle = Math.atan2(camDir.x, camDir.z);
    }

    const moveVector = new THREE.Vector3();
    if (dirZ !== 0 || dirX !== 0) {
      // Local movement relative to facing direction
      const forward = new THREE.Vector3(Math.sin(forwardAngle), 0, Math.cos(forwardAngle));
      const right = new THREE.Vector3(-Math.cos(forwardAngle), 0, Math.sin(forwardAngle));

      moveVector.addScaledVector(forward, dirZ);
      moveVector.addScaledVector(right, dirX);
      moveVector.normalize();

      this.velocity.x += moveVector.x * speed * 8.0 * delta;
      this.velocity.z += moveVector.z * speed * 8.0 * delta;
    }

    // Gravity & Jump Physics
    this.verticalVelocity += this.gravity * delta;
    let nextY = this.playerPos.y + this.verticalVelocity * delta;
    if (nextY <= 0) {
      nextY = 0;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    }

    // Displacement with collision sliding
    const displacement = new THREE.Vector3(this.velocity.x, 0, this.velocity.z);
    const currentPos = this.playerPos.clone();
    const resolvedPos = this.collisionSystem.resolveMovement(currentPos, displacement);

    this.playerPos.x = resolvedPos.x;
    this.playerPos.z = resolvedPos.z;
    this.playerPos.y = nextY;

    // Update character position & animation
    if (this.character) {
      this.character.group.position.copy(this.playerPos);
      this.character.update(delta, moveVector, this.isSprinting, !this.isGrounded);
    }

    // Update Camera positioning
    this.updateCameraFollow();
  }

  updateCameraFollow() {
    if (this.cameraMode === 'first-person') {
      this.camera.position.set(this.playerPos.x, this.playerPos.y + 1.62, this.playerPos.z);
    } else if (this.cameraMode === 'third-person') {
      // Position camera behind character target
      const targetY = this.playerPos.y + 1.35;
      const dist = this.thirdPersonDistance;
      const pitch = this.thirdPersonPitch;
      const yaw = this.thirdPersonYaw;

      const camX = this.playerPos.x - Math.sin(yaw) * Math.cos(pitch) * dist;
      const camY = targetY + Math.sin(pitch) * dist;
      const camZ = this.playerPos.z - Math.cos(yaw) * Math.cos(pitch) * dist;

      this.camera.position.set(camX, Math.max(0.3, camY), camZ);
      this.camera.lookAt(this.playerPos.x, targetY, this.playerPos.z);
    }
  }

  handleResize() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.orbitCamera.aspect = aspect;
    this.orbitCamera.updateProjectionMatrix();
  }
}
