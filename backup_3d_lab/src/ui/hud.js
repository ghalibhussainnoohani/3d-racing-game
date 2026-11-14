/**
 * Laboratory HUD & UI Manager:
 * Crosshair, context tooltips, real-time room zone calculation,
 * status telemetry, and help modal.
 */
export class LabHUD {
  constructor() {
    this.crosshair = document.getElementById('crosshair');
    this.tooltip = document.getElementById('interaction-tooltip');
    this.tooltipText = document.getElementById('tooltip-text');
    this.zoneName = document.getElementById('zone-name');
    this.modeText = document.getElementById('mode-text');
    this.lightText = document.getElementById('light-text');
    this.audioText = document.getElementById('audio-text');
    this.helpModal = document.getElementById('help-modal');
    this.closeHelpBtn = document.getElementById('close-help-btn');
    this.tempVal = document.getElementById('temp-val');

    this.currentZone = '';
    this.initEvents();
  }

  initEvents() {
    if (this.closeHelpBtn) {
      this.closeHelpBtn.addEventListener('click', () => {
        this.toggleHelp(false);
      });
    }

    const helpBtn = document.getElementById('btn-help');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        this.toggleHelp();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyH') {
        this.toggleHelp();
      }
    });
  }

  setCrosshairActive(active) {
    if (this.crosshair) {
      if (active) this.crosshair.classList.add('active');
      else this.crosshair.classList.remove('active');
    }
  }

  setCrosshairVisible(visible) {
    if (this.crosshair) {
      this.crosshair.style.display = visible ? 'flex' : 'none';
    }
  }

  showTooltip(title, action) {
    if (this.tooltip && this.tooltipText) {
      this.tooltipText.textContent = `${title} • ${action}`;
      this.tooltip.classList.add('visible');
    }
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.classList.remove('visible');
    }
  }

  setModeText(text) {
    if (this.modeText) this.modeText.textContent = text;
  }

  setLightingText(text) {
    if (this.lightText) this.lightText.textContent = text;
  }

  setAudioText(text) {
    if (this.audioText) this.audioText.textContent = text;
  }

  toggleHelp(forceState) {
    if (!this.helpModal) return;
    const isHidden = this.helpModal.classList.contains('hidden');
    const newState = forceState !== undefined ? forceState : isHidden;

    if (newState) {
      this.helpModal.classList.remove('hidden');
    } else {
      this.helpModal.classList.add('hidden');
    }
  }

  updateZone(playerPos) {
    if (!this.zoneName) return;

    const x = playerPos.x;
    const z = playerPos.z;
    let zone = 'Student Workstation Area';

    if (x < -5.0 && z < -1.5) {
      zone = 'Server Room & Infrastructure';
    } else if (z > 2.8) {
      zone = 'Teacher Desk & Smart Board';
    } else if (x > 5.5) {
      zone = 'Resource Center (3D Print & Scan)';
    } else if (z < -3.2) {
      zone = 'North Windows & Exterior View';
    } else if (z >= 1.4) {
      zone = 'Student Area • Row 1';
    } else if (z >= 0.0 && z < 1.4) {
      zone = 'Student Area • Row 2';
    } else if (z >= -1.4 && z < 0.0) {
      zone = 'Student Area • Row 3';
    } else {
      zone = 'Student Area • Row 4';
    }

    if (this.currentZone !== zone) {
      this.currentZone = zone;
      this.zoneName.textContent = zone;
    }
  }

  hideLoadingScreen() {
    const screen = document.getElementById('loading-screen');
    if (screen) {
      screen.classList.add('fade-out');
    }
  }
}
