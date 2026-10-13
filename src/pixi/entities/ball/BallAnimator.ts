/**
 * BallAnimator - Handles ball rotation, bounce bobbing, and goal shot trajectory calculation
 * Responsibility: Playing visual sequences and spatial interpolation only
 */

export interface ShotTrajectoryResult {
  x: number;
  y: number;
  progress: number;
  isComplete: boolean;
}

export class BallAnimator {
  private rotation = 0;
  private shotProgress = 0;
  private isShooting = false;

  private shotStartX = 0;
  private shotStartY = 0;
  private shotGoalX = 0;
  private shotGoalY = 0;
  private shotArcPeakY = 38;

  /**
   * Start a goal shot sequence from start coords towards goal mouth
   */
  public startGoalShot(startX: number, startY: number, goalX: number, goalY: number): void {
    this.shotStartX = startX;
    this.shotStartY = startY;
    this.shotGoalX = goalX;
    this.shotGoalY = goalY;
    this.shotProgress = 0;
    this.isShooting = true;
  }

  /**
   * Stop or cancel shot
   */
  public cancelShot(): void {
    this.isShooting = false;
    this.shotProgress = 0;
  }

  public get isShotActive(): boolean {
    return this.isShooting;
  }

  public get currentRotation(): number {
    return this.rotation;
  }

  /**
   * Update ball rotation based on movement speed
   */
  public updateRotation(isMoving: boolean, dt: number): void {
    if (this.isShooting) {
      this.rotation += 0.45 * dt;
    } else if (isMoving) {
      this.rotation += 0.25 * dt;
    } else {
      this.rotation += 0.02 * dt;
    }
  }

  /**
   * Step the quadratic Bézier arc trajectory for goal shot
   */
  public stepGoalShot(dt: number, speed = 0.04): ShotTrajectoryResult {
    if (!this.isShooting) {
      return { x: this.shotGoalX, y: this.shotGoalY, progress: 1, isComplete: true };
    }

    this.shotProgress += speed * dt;
    const t = Math.min(this.shotProgress, 1);

    // Quadratic Bézier curve through mid-air peak
    const midX = (this.shotStartX + this.shotGoalX) / 2;
    const midY = this.shotStartY - this.shotArcPeakY;

    const x = (1 - t) * (1 - t) * this.shotStartX + 2 * (1 - t) * t * midX + t * t * this.shotGoalX;
    const y = (1 - t) * (1 - t) * this.shotStartY + 2 * (1 - t) * t * midY + t * t * this.shotGoalY;

    const isComplete = t >= 1;
    if (isComplete) {
      this.isShooting = false;
    }

    return { x, y, progress: t, isComplete };
  }
}
