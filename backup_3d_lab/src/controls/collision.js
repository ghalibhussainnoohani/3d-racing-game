import * as THREE from 'three';

/**
 * Player Collision & Movement Sliding System
 * Prevents walking through room walls and furniture colliders with smooth sliding.
 */
export class CollisionSystem {
  constructor(colliders) {
    this.colliders = colliders || [];
    this.playerRadius = 0.35;

    // Room boundaries: 16m x 10m room (-8 to +8 in X, -5 to +5 in Z)
    this.minX = -7.6;
    this.maxX = 7.6;
    this.minZ = -4.6;
    this.maxZ = 4.6;
  }

  addCollider(box3) {
    this.colliders.push(box3);
  }

  /**
   * Tests a point against all obstacle bounding boxes with player radius margin
   */
  checkCollision(targetX, targetZ) {
    // 1. Room boundary check
    if (targetX < this.minX || targetX > this.maxX) return true;
    if (targetZ < this.minZ || targetZ > this.maxZ) return true;

    // 2. Obstacle boxes check
    const r = this.playerRadius;
    for (let i = 0; i < this.colliders.length; i++) {
      const box = this.colliders[i];
      // Expand box by player radius
      if (
        targetX >= box.min.x - r &&
        targetX <= box.max.x + r &&
        targetZ >= box.min.z - r &&
        targetZ <= box.max.z + r
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Resolves player movement from current position to target position with axis sliding
   */
  resolveMovement(currentPos, displacement) {
    const desiredX = currentPos.x + displacement.x;
    const desiredZ = currentPos.z + displacement.z;

    const finalPos = currentPos.clone();

    // Test full movement
    if (!this.checkCollision(desiredX, desiredZ)) {
      finalPos.x = desiredX;
      finalPos.z = desiredZ;
      return finalPos;
    }

    // Try sliding on X axis only
    if (!this.checkCollision(desiredX, currentPos.z)) {
      finalPos.x = desiredX;
    }

    // Try sliding on Z axis only
    if (!this.checkCollision(currentPos.x, desiredZ)) {
      finalPos.z = desiredZ;
    }

    return finalPos;
  }
}
