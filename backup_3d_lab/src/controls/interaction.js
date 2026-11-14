import * as THREE from 'three';

/**
 * Player Raycasting & Interaction System:
 * Detects interactive equipment in front of the player, highlights them,
 * displays context tooltips, and executes click interactions.
 */
export class InteractionSystem {
  constructor(camera, interactables, hud) {
    this.camera = camera;
    this.interactables = interactables || [];
    this.hud = hud;

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 3.2; // Maximum reach in meters
    this.centerCoord = new THREE.Vector2(0, 0);

    this.currentHoveredObject = null;
    this.originalEmissive = null;

    this.initEvents();
  }

  initEvents() {
    window.addEventListener('click', () => {
      this.triggerInteraction();
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        this.triggerInteraction();
      }
    });
  }

  addInteractable(mesh) {
    this.interactables.push(mesh);
  }

  update() {
    this.raycaster.setFromCamera(this.centerCoord, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactables, true);

    if (intersects.length > 0) {
      // Find closest interactable ancestor or mesh with userData.action
      let target = null;
      for (let i = 0; i < intersects.length; i++) {
        let obj = intersects[i].object;
        while (obj) {
          if (obj.userData && obj.userData.action) {
            target = obj;
            break;
          }
          obj = obj.parent;
        }
        if (target) break;
      }

      if (target) {
        if (this.currentHoveredObject !== target) {
          this.clearHover();
          this.setHover(target);
        }
        return;
      }
    }

    // Nothing interactive hovered
    if (this.currentHoveredObject) {
      this.clearHover();
    }
  }

  setHover(object) {
    this.currentHoveredObject = object;

    // Apply highlight if material supports emissive
    if (object.material && object.material.emissive) {
      this.originalEmissive = object.material.emissive.clone();
      object.material.emissive.setHex(0x38bdf8);
      object.material.emissiveIntensity = 0.4;
    }

    if (this.hud) {
      this.hud.showTooltip(
        object.userData.name || 'Equipment',
        object.userData.action || 'Click to Interact'
      );
      this.hud.setCrosshairActive(true);
    }
  }

  clearHover() {
    if (this.currentHoveredObject) {
      if (this.currentHoveredObject.material && this.currentHoveredObject.material.emissive && this.originalEmissive) {
        this.currentHoveredObject.material.emissive.copy(this.originalEmissive);
        this.currentHoveredObject.material.emissiveIntensity = 0;
      }
      this.currentHoveredObject = null;
      this.originalEmissive = null;
    }

    if (this.hud) {
      this.hud.hideTooltip();
      this.hud.setCrosshairActive(false);
    }
  }

  triggerInteraction() {
    if (this.currentHoveredObject && this.currentHoveredObject.userData && this.currentHoveredObject.userData.onClick) {
      this.currentHoveredObject.userData.onClick();
    }
  }
}
