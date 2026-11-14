import * as THREE from 'three';

/**
 * PBR Lighting System for Laboratory
 * Handles Day/Night cycles, ceiling LED panels, and window illumination
 */
export class LabLighting {
  constructor(scene) {
    this.scene = scene;
    this.isNight = false;
    this.ceilingLights = [];

    this.init();
  }

  init() {
    // 1. Hemisphere Light (Soft ambient bounce)
    this.hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.75);
    this.hemiLight.position.set(0, 3.2, 0);
    this.scene.add(this.hemiLight);

    // 2. Main Window Directional Sun/Sky Light
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.25);
    this.sunLight.position.set(2, 6, -8);
    this.sunLight.target.position.set(0, 1, 0);
    this.scene.add(this.sunLight.target);

    // Soft Shadow settings
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 25;
    this.sunLight.shadow.camera.left = -9;
    this.sunLight.shadow.camera.right = 9;
    this.sunLight.shadow.camera.top = 6;
    this.sunLight.shadow.camera.bottom = -4;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.radius = 2.5; // Soft shadow edges
    this.scene.add(this.sunLight);

    // 3. Ceiling Recessed LED Fixture Lights (6 key interior fill lights)
    const lightPositions = [
      [-4.0, 3.0, -2.5],
      [0.0, 3.0, -2.5],
      [4.0, 3.0, -2.5],
      [-4.0, 3.0, 2.0],
      [0.0, 3.0, 2.0],
      [4.0, 3.0, 2.0]
    ];

    lightPositions.forEach(([x, y, z]) => {
      const pLight = new THREE.PointLight(0xf8fafc, 0.85, 9, 1.8);
      pLight.position.set(x, y, z);
      this.scene.add(pLight);
      this.ceilingLights.push(pLight);
    });

  }

  toggleDayNight() {
    this.isNight = !this.isNight;
    this.applyLightingMode(this.isNight);
    return this.isNight;
  }

  applyLightingMode(isNight) {
    if (isNight) {
      // Night Mode: Cool moonlit glow through windows, dimmed LED panels
      this.hemiLight.color.setHex(0x1e293b);
      this.hemiLight.groundColor.setHex(0x090d16);
      this.hemiLight.intensity = 0.3;

      this.sunLight.color.setHex(0x38bdf8);
      this.sunLight.intensity = 0.25;

      this.ceilingLights.forEach(l => {
        l.color.setHex(0x94a3b8);
        l.intensity = 0.35;
      });
    } else {
      // Day Mode: Bright, crisp natural daylight
      this.hemiLight.color.setHex(0xe0f2fe);
      this.hemiLight.groundColor.setHex(0x1e293b);
      this.hemiLight.intensity = 0.75;

      this.sunLight.color.setHex(0xfffaed);
      this.sunLight.intensity = 1.35;

      this.ceilingLights.forEach(l => {
        l.color.setHex(0xf8fafc);
        l.intensity = 0.85;
      });
    }
  }
}
