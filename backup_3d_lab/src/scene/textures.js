import * as THREE from 'three';

/**
 * Procedural Canvas Texture Generators for Offline PBR Lab
 */

export class TextureGenerator {
  /**
   * Generates polished epoxy floor tiles with subtle grout grid
   */
  static createFloorTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base light-grey epoxy
    ctx.fillStyle = '#dde2e8';
    ctx.fillRect(0, 0, size, size);

    // Subtle epoxy micro-mottle
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 8;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise + 2));
    }
    ctx.putImageData(imgData, 0, 0);

    // Grid lines (tiles)
    const tiles = 4;
    const tileSize = size / tiles;
    ctx.strokeStyle = '#b0b8c2';
    ctx.lineWidth = 3;

    for (let i = 0; i <= tiles; i++) {
      ctx.beginPath();
      ctx.moveTo(i * tileSize, 0);
      ctx.lineTo(i * tileSize, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * tileSize);
      ctx.lineTo(size, i * tileSize);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 5); // 16m x 10m room
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Generates ceiling acoustic tiles with recessed grid
   */
  static createCeilingTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base acoustic panel off-white
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, size, size);

    // Subtle stippling
    ctx.fillStyle = '#cbd5e1';
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 1.2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grid lines (T-bar suspension grid)
    const tiles = 2;
    const tileSize = size / tiles;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;

    for (let i = 0; i <= tiles; i++) {
      ctx.beginPath();
      ctx.moveTo(i * tileSize, 0);
      ctx.lineTo(i * tileSize, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * tileSize);
      ctx.lineTo(size, i * tileSize);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 10);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Generates wall texture with lower blue-grey wainscot band
   */
  static createWallTexture() {
    const width = 512;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Upper wall clean lab off-white
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, width, height);

    // Lower wainscot band (bottom ~32% representing ~1m of 3.2m wall)
    const wainscotHeight = Math.floor(height * 0.32);
    const startY = height - wainscotHeight;

    // Slate blue-grey wainscot
    ctx.fillStyle = '#334e68';
    ctx.fillRect(0, startY, width, wainscotHeight);

    // Dark accent divider trim line
    ctx.fillStyle = '#102a43';
    ctx.fillRect(0, startY - 4, width, 5);

    // Subtle lighter highlight line above divider
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, startY - 6, width, 2);

    // Dark baseboard strip at the very bottom
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, height - 16, width, 16);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(4, 1);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Safety Signage: Exit Sign
   */
  static createExitSignTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Green safety background
    ctx.fillStyle = '#059669';
    ctx.fillRect(0, 0, 512, 256);

    // White border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.strokeRect(12, 12, 488, 232);

    // Running man icon & EXIT text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 110px "Inter", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT ➜', 256, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Safety Signage: Eyewash & Shower Sign
   */
  static createEyewashSignTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Green background
    ctx.fillStyle = '#059669';
    ctx.fillRect(0, 0, 512, 512);

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.strokeRect(16, 16, 480, 480);

    // Shower Icon (simplified)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(256, 130, 45, 0, Math.PI, true);
    ctx.fill();
    // Drops
    for (let i = -3; i <= 3; i++) {
      ctx.fillRect(256 + i * 20 - 4, 150, 8, 25);
      ctx.fillRect(256 + i * 20 - 4, 185, 8, 25);
    }

    // Eyes Icon (two ellipses)
    ctx.beginPath();
    ctx.ellipse(200, 260, 40, 25, 0, 0, Math.PI * 2);
    ctx.ellipse(312, 260, 40, 25, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(200, 260, 14, 0, Math.PI * 2);
    ctx.arc(312, 260, 14, 0, Math.PI * 2);
    ctx.fill();

    // Text
    ctx.font = 'bold 36px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EMERGENCY', 256, 360);
    ctx.fillText('EYE WASH & SHOWER', 256, 410);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Safety Signage: Biohazard Warning
   */
  static createBiohazardSignTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Safety fluorescent yellow background
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 512, 512);

    // Black border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;
    ctx.strokeRect(16, 16, 480, 480);

    // Top warning band
    ctx.fillStyle = '#000000';
    ctx.fillRect(24, 24, 464, 80);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 44px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BIOHAZARD', 256, 80);

    // Biohazard 3-ring procedural symbol
    ctx.save();
    ctx.translate(256, 260);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;

    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i * 2 * Math.PI) / 3);
      ctx.beginPath();
      ctx.arc(0, -55, 60, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    // Inner center circle knockout
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.restore();

    // Bottom warning text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL 2 CONTAINMENT', 256, 410);
    ctx.font = '20px "Inter", sans-serif';
    ctx.fillText('AUTHORIZED PERSONNEL ONLY', 256, 445);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Safety Signage: Flammable Storage Cabinet Sign
   */
  static createFlammableSignTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Safety yellow background
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 512, 256);

    // Red warning banner
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(20, 20, 472, 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FLAMMABLE', 256, 70);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 36px "Inter", sans-serif';
    ctx.fillText('KEEP FIRE AWAY', 256, 140);

    ctx.font = '24px "Inter", sans-serif';
    ctx.fillText('CHEMICAL STORAGE', 256, 190);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Whiteboard with scientific diagrams & formulas
   */
  static createWhiteboardTexture() {
    const width = 1024;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Whiteboard glossy background with slight off-white tone
    ctx.fillStyle = '#fdfdfd';
    ctx.fillRect(0, 0, width, height);

    // Grid faint dots
    ctx.fillStyle = '#e2e8f0';
    for (let x = 30; x < width; x += 40) {
      for (let y = 30; y < height; y += 40) {
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Title in dark blue
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.fillText('ENZYME KINETICS & PCR PROTOCOL', 40, 50);

    // Separator line
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, 65);
    ctx.lineTo(550, 65);
    ctx.stroke();

    // Section 1: Michaelis-Menten Equation (Red & Black)
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText('Michaelis-Menten:', 40, 110);
    ctx.fillStyle = '#0f172a';
    ctx.font = '22px "JetBrains Mono", monospace';
    ctx.fillText('v₀ = (Vmax · [S]) / (Km + [S])', 40, 145);
    ctx.fillText('Lineweaver-Burk: 1/v = (Km/Vmax)(1/[S]) + 1/Vmax', 40, 180);

    // Section 2: PCR Thermal Cycling Profile (Blue)
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText('PCR Profile (Target: 1.2 kb):', 40, 230);
    ctx.font = '19px "JetBrains Mono", monospace';
    ctx.fillStyle = '#334155';
    ctx.fillText('1. Initial Denat:   95°C  (3 min)', 50, 265);
    ctx.fillText('2. Denaturation:    95°C  (30 sec)', 50, 295);
    ctx.fillText('3. Annealing:       58°C  (30 sec) [35x cycles]', 50, 325);
    ctx.fillText('4. Extension:       72°C  (90 sec)', 50, 355);
    ctx.fillText('5. Final Extension: 72°C  (5 min)', 50, 385);
    ctx.fillText('6. Hold:             4°C  (∞)', 50, 415);

    // Right Column: Reaction Mechanism / Molecular Sketch
    ctx.fillStyle = '#047857';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText('Target Oligo Construct:', 580, 110);

    // Draw plasmid/DNA loop diagram
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(780, 240, 120, 80, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Promoter / Terminator tags
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(720, 155, 45, 12);
    ctx.fillStyle = '#0f172a';
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.fillText('pCMV', 722, 148);

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(810, 155, 60, 12);
    ctx.fillStyle = '#0f172a';
    ctx.fillText('GFP Gene', 812, 148);

    // Chemical Notes in hand-drawn style
    ctx.fillStyle = '#7c2d12';
    ctx.font = 'italic 18px "Inter", sans-serif';
    ctx.fillText('Note: Spin samples @ 14k RPM x 5 min before loading.', 580, 370);
    ctx.fillText('Keep restriction enzymes on -20°C ice block!', 580, 405);
    ctx.fillText('Autoclave tips & dH2O prior to Friday run.', 580, 440);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Chemical Bottle Reagent Label
   */
  static createBottleLabelTexture(reagentName, formula, hazardLevel = 'low') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // White paper label
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 256, 128);

    // Top color bar
    ctx.fillStyle = hazardLevel === 'high' ? '#ef4444' : hazardLevel === 'medium' ? '#f59e0b' : '#3b82f6';
    ctx.fillRect(0, 0, 256, 12);

    // Border
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 254, 126);

    // Reagent name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(reagentName, 128, 48);

    // Formula / Concentration
    ctx.font = '15px "JetBrains Mono", monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText(formula, 128, 74);

    // Purity / Grade
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('ACS Reagent Grade • 99.8%', 128, 96);
    ctx.fillText('LOT #LB-2026-09', 128, 114);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Outside window sky gradient texture
   */
  static createWindowBackdropTexture(isNight = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    if (!isNight) {
      grad.addColorStop(0, '#38bdf8');   // Daylight bright sky blue
      grad.addColorStop(0.6, '#bae6fd'); // Horizon haze
      grad.addColorStop(1, '#64748b');   // Distant trees/hills
    } else {
      grad.addColorStop(0, '#030712');   // Night deep dark blue/black
      grad.addColorStop(0.7, '#0f172a'); // Midnight horizon
      grad.addColorStop(1, '#1e293b');   // Dark silhouette
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Soft clouds if day, stars if night
    if (!isNight) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(150, 80, 50, 0, Math.PI * 2);
      ctx.arc(190, 70, 60, 0, Math.PI * 2);
      ctx.arc(230, 85, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(380, 95, 40, 0, Math.PI * 2);
      ctx.arc(420, 85, 55, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 40; i++) {
        const sx = (i * 73) % 512;
        const sy = (i * 37) % 180;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      // Crescent Moon
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(400, 60, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#030712';
      ctx.beginPath();
      ctx.arc(408, 56, 17, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
}

/**
 * Dynamic Animated Monitor Canvas Texture
 */
export class AnimatedMonitorScreen {
  constructor(width = 512, height = 320) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;

    this.mode = 0; // 0: Chromatography/HPLC, 1: Real-Time PCR, 2: Mass Spectrometry
    this.time = 0;
    this.history = [];
    for (let i = 0; i < 60; i++) {
      this.history.push(0.2);
    }
  }

  toggleMode() {
    this.mode = (this.mode + 1) % 3;
  }

  update(delta) {
    this.time += delta;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Dark terminal background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Top Header Bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, 28);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('LABORATORY ANALYSIS OS v4.2', 10, 18);

    // Clock
    const sec = Math.floor(this.time) % 60;
    const min = Math.floor(this.time / 60) % 60;
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    ctx.fillText(`T+${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')} [LIVE]`, w - 10, 18);

    // Render Mode Specific Visualizations
    if (this.mode === 0) {
      this.renderChromatography(w, h);
    } else if (this.mode === 1) {
      this.renderPCR(w, h);
    } else {
      this.renderSpectrometry(w, h);
    }

    this.texture.needsUpdate = true;
  }

  renderChromatography(w, h) {
    const ctx = this.ctx;
    // Sub-title
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('HPLC UV-VIS ABSORBANCE [280 nm]', 14, 50);

    // Grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 30; x < w - 20; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 60);
      ctx.lineTo(x, h - 30);
      ctx.stroke();
    }
    for (let y = 60; y < h - 30; y += 30) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
    }

    // Dynamic wave / peaks
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const plotYBase = h - 45;
    const plotWidth = w - 60;

    for (let i = 0; i <= plotWidth; i++) {
      const x = 30 + i;
      const progress = (i / plotWidth) * 10 - (this.time * 0.8) % 10;
      
      // Peaks modeled with Gaussian-like curves
      const p1 = Math.exp(-Math.pow((progress - 2) * 2, 2)) * 75;
      const p2 = Math.exp(-Math.pow((progress - 5) * 3, 2)) * 120;
      const p3 = Math.exp(-Math.pow((progress - 7.5) * 2.5, 2)) * 50;
      const noise = Math.sin(i * 0.2 + this.time * 5) * 2;
      const y = plotYBase - (p1 + p2 + p3 + noise);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Data readouts
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('Peak 1: Retention 4.12 min (98.4%)', 30, h - 12);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Flow: 1.00 mL/min | Press: 142 bar', w - 240, h - 12);
  }

  renderPCR(w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = '#fb7185';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('REAL-TIME PCR AMPLIFICATION [FAM / SYBR]', 14, 50);

    // Sigmoidal amplification curves
    const colors = ['#38bdf8', '#34d399', '#f43f5e', '#fbbf24'];
    const thresholds = [18, 22, 25, 31];

    for (let c = 0; c < 4; c++) {
      ctx.strokeStyle = colors[c];
      ctx.lineWidth = 2;
      ctx.beginPath();
      const ct = thresholds[c];
      for (let cycle = 1; cycle <= 40; cycle++) {
        const x = 35 + (cycle / 40) * (w - 70);
        // Sigmoid curve
        const val = 1 / (1 + Math.exp(-(cycle - ct) * 0.6));
        const y = (h - 50) - val * 170 + Math.sin(cycle + this.time) * 1.5;
        if (cycle === 1) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Threshold line
    ctx.strokeStyle = '#e2e8f0';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(35, h - 110);
    ctx.lineTo(w - 35, h - 110);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('Threshold: ΔRn = 0.20 | Mean Ct: 21.4', 35, h - 12);
    ctx.fillStyle = '#34d399';
    ctx.fillText('STATUS: RUN COMPLETE [PASS]', w - 210, h - 12);
  }

  renderSpectrometry(w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = '#a78bfa';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MASS SPECTROMETRY MS/MS PEAK M/Z', 14, 50);

    // Mass spectrum bars
    const plotBaseY = h - 45;
    const peaks = [
      { mz: 120, int: 0.35 },
      { mz: 185, int: 0.75 },
      { mz: 242, int: 0.2 },
      { mz: 310, int: 0.95 },
      { mz: 418, int: 0.6 },
      { mz: 512, int: 0.4 },
      { mz: 620, int: 0.85 },
      { mz: 740, int: 0.25 }
    ];

    for (let i = 0; i < peaks.length; i++) {
      const p = peaks[i];
      const x = 40 + (p.mz / 800) * (w - 80);
      const barH = p.int * 160 * (0.95 + 0.05 * Math.sin(this.time * 4 + i));
      const y = plotBaseY - barH;

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, plotBaseY);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.fillStyle = '#f1f5f9';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`m/z ${p.mz}`, x, y - 5);
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Target: Peptide MW = 1482.6 Da', 35, h - 12);
    ctx.fillStyle = '#c084fc';
    ctx.fillText('Resolution: 60,000 FWHM', w - 190, h - 12);
  }
}
