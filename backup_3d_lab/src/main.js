import * as THREE from 'three';
import { LabHUD } from './ui/hud.js';
import { SoundManager } from './ui/audio.js';
import { LabMinimap } from './ui/minimap.js';
import { CollisionSystem } from './controls/collision.js';
import { LabControls } from './controls/fpsControls.js';
import { InteractionSystem } from './controls/interaction.js';
import { LabRoom } from './scene/room.js';
import { LabLighting } from './scene/lighting.js';
import { ScreenManager } from './scene/computerScreens.js';
import { OutsideScene } from './scene/outsideScene.js';
import { StudentDesks } from './objects/studentDesks.js';
import { TeacherStation } from './objects/teacherStation.js';
import { ServerRack } from './objects/serverRack.js';
import { ComputerLabAccessories } from './objects/computerLabAccessories.js';
import { LabCharacter } from './character/character.js';
import { CustomizationManager } from './character/customization.js';

class ComputerLabApplication {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();

    this.colliders = [];
    this.interactables = [];

    this.init();
  }

  init() {
    // 1. Scene & Renderer Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070b14);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // PBR & Shadow configuration
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);

    // 2. UI, Audio & Screen Managers
    this.hud = new LabHUD();
    this.soundManager = new SoundManager();
    this.minimap = new LabMinimap('minimap');
    this.screenManager = new ScreenManager();

    // 3. Collision System
    this.collisionSystem = new CollisionSystem(this.colliders);

    // 4. Customizable Humanoid Character
    this.character = new LabCharacter(this.scene);
    this.customization = new CustomizationManager(this.character);

    // 5. Multi-Mode Controls (3rd Person Follow, 1st Person, Free Orbit)
    this.controls = new LabControls(
      this.camera,
      this.renderer.domElement,
      this.collisionSystem,
      this.hud,
      this.character,
      this.interactables
    );

    // 6. Architectural Room Shell & PBR Lighting
    this.room = new LabRoom(this.scene);
    this.colliders.push(...this.room.colliders);

    this.lighting = new LabLighting(this.scene);

    // 7. Exterior Outside Scene (3 large windows, blinds, lawn, road, trees, buildings, sky)
    this.outsideScene = new OutsideScene(this.scene, this.interactables, this.lighting);

    // 8. Computer Lab Equipment:
    // A. 4 Rows of 6 Student Desks = 24 Workstations (PCs, animated monitors, lamps, chairs)
    this.studentDesks = new StudentDesks(this.scene, this.colliders, this.interactables, this.screenManager);

    // B. Teacher Station (Executive desk, dual monitors, interactive Smart Board, whiteboard, projector)
    this.teacherStation = new TeacherStation(this.scene, this.colliders, this.interactables, this.screenManager);

    // C. Server Rack Corner (42U cabinet, network switch with blinking LEDs, patch panel, UPS)
    this.serverRack = new ServerRack(this.scene, this.colliders, this.interactables);

    // D. Lab Accessories (3D printer, multi-function scanner, bookshelf, water dispenser, posters)
    this.accessories = new ComputerLabAccessories(this.scene, this.colliders, this.interactables);

    // 9. Interaction System
    this.interactionSystem = new InteractionSystem(this.camera, this.interactables, this.hud);

    // 10. Setup HUD Buttons & Event Listeners
    this.setupUIEvents();

    // 11. Window Resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Hide Loading Screen smoothly
    setTimeout(() => {
      this.hud.hideLoadingScreen();
    }, 400);

    // Check for query parameters for direct camera staging (testing & screenshots)
    this.handleQueryParams();

    // 12. Start Render Loop
    this.animate();
  }

  handleQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam) {
      const blocker = document.getElementById('blocker');
      if (blocker) blocker.classList.add('hidden');
      const loadScreen = document.getElementById('loading-screen');
      if (loadScreen) loadScreen.classList.add('fade-out');

      if (viewParam === 'overview') {
        this.controls.setCameraMode('free-orbit');
        this.controls.orbitCamera.position.set(0, 11, 8.5);
        this.controls.orbitCamera.lookAt(0, 1.2, 0);

      } else if (viewParam === 'desks') {
        // Perspective looking down the central aisle between student desk rows
        this.controls.setCameraMode('free-orbit');
        this.controls.orbitCamera.position.set(0, 2.5, 3.8);
        this.controls.orbitCamera.lookAt(0, 0.9, -1.0);

      } else if (viewParam === 'windows') {
        // Looking directly at the 3 large windows and exterior view
        this.controls.setCameraMode('free-orbit');
        this.controls.orbitCamera.position.set(0, 1.7, -1.8);
        this.controls.orbitCamera.lookAt(0, 1.8, -10.0);

      } else if (viewParam === 'server') {
        // Close-up of server rack corner
        this.controls.setCameraMode('free-orbit');
        this.controls.orbitCamera.position.set(-5.5, 1.4, -3.2);
        this.controls.orbitCamera.lookAt(-7.0, 1.2, -3.2);

      } else if (viewParam === 'character') {
        // Third-person view of the character running down the central aisle
        this.character.group.position.set(0, 0, 1.0);
        this.controls.playerPos.set(0, 0, 1.0);
        this.controls.thirdPersonYaw = Math.PI; // Face forward North
        this.controls.thirdPersonDistance = 2.6;
        this.controls.thirdPersonPitch = 0.2;
        this.controls.setCameraMode('third-person');
        // Trigger running animation pose
        this.character.state = 'run';
        this.character.update(0.1, new THREE.Vector3(0, 0, -1), true, false);

      } else if (viewParam === 'customization') {
        // Position camera in front of character and open customization panel
        this.controls.setCameraMode('free-orbit');
        this.controls.orbitCamera.position.set(-0.2, 1.2, 2.0);
        this.controls.orbitCamera.lookAt(0, 1.0, 0.8);
        this.character.group.position.set(0, 0, 0.8);
        this.character.root.rotation.y = Math.PI; // Face towards camera
        setTimeout(() => {
          this.customization.togglePanel(true);
        }, 100);
      }
    }
  }

  setupUIEvents() {
    // Camera Mode Button (V)
    const modeBtn = document.getElementById('btn-mode');
    if (modeBtn) {
      modeBtn.addEventListener('click', () => {
        this.controls.cycleCameraMode();
      });
    }

    // Customization Button (C)
    const customBtn = document.getElementById('btn-custom');
    if (customBtn) {
      customBtn.addEventListener('click', () => {
        this.customization.togglePanel();
      });
    }

    // Lighting Button (Day / Night)
    const lightBtn = document.getElementById('btn-lighting');
    const toggleLight = () => {
      const isNight = this.lighting.toggleDayNight();
      this.outsideScene.setNightMode(isNight);
      this.room.setNightMode(isNight);
      this.hud.setLightingText(isNight ? 'Night Mode (T)' : 'Day Mode (T)');
    };

    if (lightBtn) lightBtn.addEventListener('click', toggleLight);
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyT') toggleLight();
    });

    // Audio Button
    const audioBtn = document.getElementById('btn-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const enabled = this.soundManager.toggleAudio();
        this.hud.setAudioText(enabled ? 'Audio ON' : 'Audio OFF');
      });
    }
  }

  onWindowResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.controls.handleResize();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // Update Player & Controls
    this.controls.update(delta);

    // Update Raycast Interaction
    this.interactionSystem.update();

    // Update Animated Monitors & Screens
    this.screenManager.update(delta);

    // Update Server Rack Blinking LEDs
    this.serverRack.update(delta);

    // Update Outside Scene (clouds drift, blinds)
    this.outsideScene.update(delta);

    // Update Room (wall clock ticking)
    this.room.update(delta);

    // Update HUD & Minimap
    this.hud.updateZone(this.controls.playerPos);
    this.minimap.update(this.camera);

    // Render active camera
    const activeCamera = this.controls.getActiveCamera();
    this.renderer.render(this.scene, activeCamera);
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new ComputerLabApplication();
});
