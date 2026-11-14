import * as THREE from 'three';

/**
 * Animated Canvas Screen Generators for Computer Lab Monitors
 * 5 distinct screen types: Code Editor, Terminal, Browser, Dashboard, Login Screen,
 * plus a Presentation Slideshow for the Teacher Smart Board.
 */

export class ScreenManager {
  constructor() {
    this.screens = [];
    this.time = 0;
  }

  createCodeEditorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const screenData = {
      type: 'code',
      canvas,
      ctx,
      texture,
      cursorBlink: 0,
      charIndex: 0,
      codeLines: [
        'import * as THREE from "three";',
        '',
        'class StudentProject {',
        '  constructor() {',
        '    this.scene = new THREE.Scene();',
        '    this.renderer = new THREE.WebGLRenderer();',
        '    this.score = 100;',
        '  }',
        '',
        '  async renderLoop() {',
        '    requestAnimationFrame(() => this.renderLoop());',
        '    this.updatePhysics();',
        '  }',
        '}'
      ]
    };

    this.screens.push(screenData);
    return texture;
  }

  createTerminalTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const screenData = {
      type: 'terminal',
      canvas,
      ctx,
      texture,
      scrollOffset: 0,
      lines: [
        'student@lab-node-14:~$ git status',
        'On branch main - Your branch is up to date.',
        'student@lab-node-14:~$ npm run test',
        '> laboratory-sim@2.0.0 test',
        'PASS src/character/animation.test.js (4 tests)',
        'PASS src/objects/studentDesks.test.js (6 tests)',
        'student@lab-node-14:~$ ping -c 4 server.local',
        '64 bytes from 192.168.1.10: icmp_seq=1 ttl=64 time=0.42 ms',
        '64 bytes from 192.168.1.10: icmp_seq=2 ttl=64 time=0.38 ms',
        'student@lab-node-14:~$ npm run dev -- --host'
      ]
    };

    this.screens.push(screenData);
    return texture;
  }

  createBrowserTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const screenData = {
      type: 'browser',
      canvas,
      ctx,
      texture,
      scrollPos: 0
    };

    this.screens.push(screenData);
    return texture;
  }

  createDashboardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const screenData = {
      type: 'dashboard',
      canvas,
      ctx,
      texture,
      graphData: Array.from({ length: 30 }, () => Math.random() * 0.6 + 0.2)
    };

    this.screens.push(screenData);
    return texture;
  }

  createLoginTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const screenData = {
      type: 'login',
      canvas,
      ctx,
      texture,
      dots: 6
    };

    this.screens.push(screenData);
    return texture;
  }

  createSmartBoardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 576;
    const ctx = canvas.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const screenData = {
      type: 'smartboard',
      canvas,
      ctx,
      texture,
      currentSlide: 0,
      slides: [
        {
          title: 'CS302: COMPUTER GRAPHICS & WEBGL',
          subtitle: 'Lecture 7: Real-Time 3D Procedural Scene Construction',
          bullets: [
            '• PBR Materials: Roughness, Metalness, Transmission & IOR',
            '• InstancedMesh for 60 FPS performance on repetitive items',
            '• Jointed Hierarchical Humanoid Character Animation',
            '• Collision Detection with Axis Sliding Movement'
          ],
          accent: '#0284c7'
        },
        {
          title: 'DATA STRUCTURES & MEMORY MANAGEMENT',
          subtitle: 'Lecture 8: Binary Trees, Hash Tables & Shaders',
          bullets: [
            '• Cache Locality & Spatial Coherence in Virtual Worlds',
            '• Shader Uniforms vs Vertex Attributes',
            '• Raymarching & Procedural Canvas Textures',
            '• Client-Side Persistence with localStorage API'
          ],
          accent: '#10b981'
        },
        {
          title: 'LABORATORY ASSIGNMENT #3',
          subtitle: 'Interactive 3D Simulation & Character Controller',
          bullets: [
            '• Task 1: Complete 4 rows of 6 student workstations',
            '• Task 2: Configure Server Rack & Blinking Switch LEDs',
            '• Task 3: Customize character avatar (Skin, Hair, Outfit)',
            '• Due: Friday 11:59 PM • Submit via Git repository'
          ],
          accent: '#8b5cf6'
        }
      ]
    };

    this.screens.push(screenData);
    return {
      texture,
      nextSlide: () => {
        screenData.currentSlide = (screenData.currentSlide + 1) % screenData.slides.length;
        screenData.texture.needsUpdate = true;
      }
    };
  }

  update(delta) {
    this.time += delta;

    for (let i = 0; i < this.screens.length; i++) {
      const scr = this.screens[i];
      const ctx = scr.ctx;
      const w = scr.canvas.width;
      const h = scr.canvas.height;

      if (scr.type === 'code') {
        this.renderCode(scr, w, h);
      } else if (scr.type === 'terminal') {
        this.renderTerminal(scr, w, h);
      } else if (scr.type === 'browser') {
        this.renderBrowser(scr, w, h);
      } else if (scr.type === 'dashboard') {
        this.renderDashboard(scr, w, h, delta);
      } else if (scr.type === 'login') {
        this.renderLogin(scr, w, h);
      } else if (scr.type === 'smartboard') {
        this.renderSmartBoard(scr, w, h);
      }

      scr.texture.needsUpdate = true;
    }
  }

  renderCode(scr, w, h) {
    const ctx = scr.ctx;
    // Dark VS Code theme background
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, w, h);

    // Tab bar
    ctx.fillStyle = '#252526';
    ctx.fillRect(0, 0, w, 28);
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(10, 3, 140, 25);
    ctx.fillStyle = '#cccccc';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('app.js ×', 25, 20);

    // Line number gutter
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 28, 35, h - 28);
    ctx.fillStyle = '#858585';
    ctx.font = '10px "JetBrains Mono", monospace';

    const startY = 48;
    const lineHeight = 18;

    for (let i = 0; i < scr.codeLines.length; i++) {
      const y = startY + i * lineHeight;
      ctx.fillStyle = '#6e7681';
      ctx.textAlign = 'right';
      ctx.fillText(`${i + 1}`, 26, y);

      // Syntax highlighted text
      ctx.textAlign = 'left';
      const line = scr.codeLines[i];
      if (line.includes('import') || line.includes('class') || line.includes('async')) {
        ctx.fillStyle = '#c586c0'; // purple keyword
      } else if (line.includes('constructor') || line.includes('renderLoop')) {
        ctx.fillStyle = '#dcdcaa'; // yellow function
      } else if (line.includes('"')) {
        ctx.fillStyle = '#ce9178'; // orange string
      } else {
        ctx.fillStyle = '#9cdcfe'; // cyan variable
      }
      ctx.fillText(line, 42, y);
    }

    // Blinking cursor
    if (Math.floor(this.time * 2) % 2 === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(230, startY + 11 * lineHeight - 12, 7, 14);
    }
  }

  renderTerminal(scr, w, h) {
    const ctx = scr.ctx;
    ctx.fillStyle = '#0c1017';
    ctx.fillRect(0, 0, w, h);

    // Title bar
    ctx.fillStyle = '#161b22';
    ctx.fillRect(0, 0, w, 24);
    // Window buttons
    ctx.fillStyle = '#ff5f56';
    ctx.beginPath(); ctx.arc(14, 12, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffbd2e';
    ctx.beginPath(); ctx.arc(28, 12, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#27c93f';
    ctx.beginPath(); ctx.arc(42, 12, 4.5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#8b949e';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('bash - student@lab-pc: ~ (node v22)', w / 2, 16);

    // Terminal lines
    ctx.textAlign = 'left';
    ctx.font = '11px "JetBrains Mono", monospace';
    const startY = 46;
    for (let i = 0; i < scr.lines.length; i++) {
      const line = scr.lines[i];
      if (line.startsWith('student@')) {
        ctx.fillStyle = '#38bdf8';
      } else if (line.startsWith('PASS')) {
        ctx.fillStyle = '#34d399';
      } else {
        ctx.fillStyle = '#c9d1d9';
      }
      ctx.fillText(line, 16, startY + i * 22);
    }

    // Blinking green block cursor at last line
    if (Math.floor(this.time * 2) % 2 === 0) {
      ctx.fillStyle = '#34d399';
      ctx.fillRect(320, startY + 9 * 22 - 12, 8, 15);
    }
  }

  renderBrowser(scr, w, h) {
    const ctx = scr.ctx;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    // Browser navigation bar
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, w, 36);

    // URL bar
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(60, 6, w - 80, 24, 12);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.font = '11px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🔒 https://threejs.org/docs/#api/en/core/InstancedMesh', 80, 22);

    // Page content
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.fillText('InstancedMesh Documentation', 24, 70);

    ctx.fillStyle = '#334155';
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillText('A distinct type of mesh with support for instanced rendering.', 24, 95);
    ctx.fillText('Use InstancedMesh if you have to render a large number of objects', 24, 115);
    ctx.fillText('with the same geometry and material but with different world transforms.', 24, 135);

    // Code block inside docs
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(24, 155, w - 48, 110);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('const mesh = new THREE.InstancedMesh(geometry, material, count);', 36, 185);
    ctx.fillText('mesh.setMatrixAt(index, matrix);', 36, 210);
    ctx.fillText('mesh.instanceMatrix.needsUpdate = true;', 36, 235);
  }

  renderDashboard(scr, w, h, delta) {
    const ctx = scr.ctx;
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, w, h);

    // Header
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, 32);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SYSTEM RESOURCE MONITOR', 16, 21);

    // CPU Gauge Bar
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('CPU LOAD: 34%', 20, 65);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(20, 75, 200, 14);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(20, 75, 200 * (0.34 + Math.sin(this.time * 2) * 0.05), 14);

    // Memory Gauge Bar
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('MEMORY: 8.2 GB / 32 GB', 20, 115);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(20, 125, 200, 14);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(20, 125, 200 * 0.42, 14);

    // Network Real-time Graph
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('NETWORK TRAFFIC (Mbps)', 20, 170);

    const graphX = 20;
    const graphY = 185;
    const graphW = w - 40;
    const graphH = 105;

    ctx.fillStyle = '#111827';
    ctx.fillRect(graphX, graphY, graphW, graphH);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(graphX, graphY, graphW, graphH);

    // Draw live animated wave
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const pts = 30;
    for (let p = 0; p <= pts; p++) {
      const px = graphX + (p / pts) * graphW;
      const val = 0.5 + 0.3 * Math.sin(p * 0.4 + this.time * 3) + 0.15 * Math.cos(p * 0.8 - this.time * 2);
      const py = graphY + graphH - val * (graphH - 10);
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  renderLogin(scr, w, h) {
    const ctx = scr.ctx;
    // Campus portal gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Center Card
    const cardW = 280;
    const cardH = 220;
    const cx = (w - cardW) / 2;
    const cy = (h - cardH) / 2;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(cx, cy, cardW, cardH, 12);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    // User Avatar circle
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(w / 2, cy + 45, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👤', w / 2, cy + 52);

    // Username label
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 13px "Inter", sans-serif';
    ctx.fillText('Student Portal Login', w / 2, cy + 90);

    // Password input field
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(cx + 30, cy + 110, cardW - 60, 32, 6);
    ctx.fill();

    // Bullets
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillText('• • • • • • • •', w / 2, cy + 132);

    // Sign in button
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(cx + 30, cy + 155, cardW - 60, 34, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.fillText('SIGN IN', w / 2, cy + 177);
  }

  renderSmartBoard(scr, w, h) {
    const ctx = scr.ctx;
    const slide = scr.slides[scr.currentSlide];

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Top banner
    ctx.fillStyle = slide.accent;
    ctx.fillRect(0, 0, w, 12);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(slide.title, 50, 80);

    // Subtitle
    ctx.fillStyle = slide.accent;
    ctx.font = '22px "JetBrains Mono", monospace';
    ctx.fillText(slide.subtitle, 50, 125);

    // Divider line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 150);
    ctx.lineTo(w - 50, 150);
    ctx.stroke();

    // Bullet points
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '22px "Inter", sans-serif';
    for (let b = 0; b < slide.bullets.length; b++) {
      ctx.fillText(slide.bullets[b], 60, 220 + b * 55);
    }

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.fillText(`Slide ${scr.currentSlide + 1} of ${scr.slides.length} • [Click to Advance Slide]`, 50, h - 35);
  }
}
