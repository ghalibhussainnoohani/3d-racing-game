import * as THREE from 'three';

/**
 * 2D Top-Down Interactive Laboratory Minimap
 * Renders floor plan, zone boundaries, and real-time player position / facing direction.
 */
export class LabMinimap {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
    this.coordsEl = document.getElementById('coords-text');

    // Lab dimensions: 16m (X: -8 to +8) x 10m (Z: -5 to +5)
    this.labWidth = 16;
    this.labDepth = 10;
  }

  update(camera) {
    if (!this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Padding & scale factors
    const pad = 10;
    const mapW = w - pad * 2;
    const mapH = h - pad * 2;

    const toMapX = (worldX) => pad + ((worldX + 8) / this.labWidth) * mapW;
    const toMapY = (worldZ) => pad + ((worldZ + 5) / this.labDepth) * mapH;

    // Room Outer Walls
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pad, pad, mapW, mapH);

    // North Ribbon Windows (Top edge)
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(toMapX(-7), pad);
    ctx.lineTo(toMapX(7), pad);
    ctx.stroke();

    // South Entrance Door (Bottom edge)
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(toMapX(-5.1), pad + mapH);
    ctx.lineTo(toMapX(-3.9), pad + mapH);
    ctx.stroke();

    // 1. Student Desks (4 rows of 6 desks)
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;

    const rowZs = [2.1, 0.7, -0.7, -2.1];
    const deskXs = [-4.6, -3.1, -1.6, 1.6, 3.1, 4.6];
    const dW = (1.2 / this.labWidth) * mapW;
    const dH = (0.7 / this.labDepth) * mapH;

    rowZs.forEach(rz => {
      deskXs.forEach(dx => {
        const mx = toMapX(dx - 0.6);
        const my = toMapY(rz - 0.35);
        ctx.fillRect(mx, my, dW, dH);
        ctx.strokeRect(mx, my, dW, dH);
      });
    });

    // 2. Teacher Station & Smart Board (South)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.strokeStyle = '#10b981';
    const tdX = toMapX(-1.1);
    const tdY = toMapY(3.2);
    const tdW = (2.2 / this.labWidth) * mapW;
    const tdH = (0.9 / this.labDepth) * mapH;
    ctx.fillRect(tdX, tdY, tdW, tdH);
    ctx.strokeRect(tdX, tdY, tdW, tdH);

    // Smart board line on wall
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(toMapX(-1.8), pad + mapH - 1);
    ctx.lineTo(toMapX(1.8), pad + mapH - 1);
    ctx.stroke();

    // 3. Server Rack (West corner)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    const srX = toMapX(-7.4);
    const srY = toMapY(-3.7);
    const srW = (0.9 / this.labWidth) * mapW;
    const srH = (1.0 / this.labDepth) * mapH;
    ctx.fillRect(srX, srY, srW, srH);
    ctx.strokeRect(srX, srY, srW, srH);

    // 4. Resource Center / 3D Printer (East Wall)
    ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.strokeStyle = '#a855f7';
    const rcX = toMapX(6.6);
    const rcY = toMapY(-1.6);
    const rcW = (0.9 / this.labWidth) * mapW;
    const rcH = (4.4 / this.labDepth) * mapH;
    ctx.fillRect(rcX, rcY, rcW, rcH);
    ctx.strokeRect(rcX, rcY, rcW, rcH);

    // Player Position & Direction Arrow
    const px = toMapX(camera.position.x);
    const py = toMapY(camera.position.z);

    // Get camera facing direction
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const angle = Math.atan2(dir.z, dir.x);

    // FOV cone
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, 18, angle - 0.45, angle + 0.45);
    ctx.closePath();
    ctx.fill();

    // Direction arrow
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(angle) * 14, py + Math.sin(angle) * 14);
    ctx.stroke();

    // Player dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Update Coordinate Readout
    if (this.coordsEl) {
      this.coordsEl.textContent = `X: ${camera.position.x.toFixed(1)}m | Z: ${camera.position.z.toFixed(1)}m`;
    }
  }
}
