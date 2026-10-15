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
  private shotArcPeakY = 14;
  private windup = 0;
  private launched = false;
  private idlePhase = 0;
  private hopAmp = 4;

  /**
   * Start a goal shot sequence from start coords towards goal mouth
   */
  public startGoalShot(startX: number, startY: number, goalX: number, goalY: number): void {
    this.shotStartX = startX;
    this.shotStartY = startY;
    this.shotGoalX = goalX;
    this.shotGoalY = goalY;
    this.shotProgress = 0;
    this.windup = 0;
    this.launched = false;
    this.isShooting = true;
  }

  /**
   * Stop or cancel shot
   */
  public cancelShot(): void {
    this.isShooting = false;
    this.shotProgress = 0;
    this.launched = false;
  }

  public get isShotActive(): boolean {
    return this.isShooting;
  }

  public get flightProgress(): number {
    return this.shotProgress;
  }

  public get hasLaunched(): boolean {
    return this.launched;
  }

  public get currentRotation(): number {
    return this.rotation;
  }

  /**
   * Update ball rotation based on movement speed
   */
  public updateRotation(isMoving: boolean, dt: number): void {
    this.idlePhase += (isMoving ? 0.45 : 0.12) * dt;
    this.hopAmp = isMoving ? 8 : 3;
    if (this.isShooting) {
      this.rotation += 0.55 * dt;
    } else if (isMoving) {
      this.rotation += 0.38 * dt;
    } else {
      this.rotation += 0.04 * dt;
    }
  }

  public get hop(): number {
    if (this.isShooting) return 0;
    return Math.abs(Math.sin(this.idlePhase)) * this.hopAmp;
  }

  /**
   * Step the quadratic Bézier arc trajectory for goal shot
   */
  public stepGoalShot(dt: number, speed = 0.01): ShotTrajectoryResult {
    if (!this.isShooting) {
      return { x: this.shotGoalX, y: this.shotGoalY, progress: 1, isComplete: true };
    }

    if (!this.launched) {
      this.windup += dt;
      // Kick contact is the third frame: two steps of 8 ticks in PlayerSprite.
      if (this.windup < 16) {
        return { x: this.shotStartX, y: this.shotStartY, progress: 0, isComplete: false };
      }
      this.launched = true;
    }

    this.shotProgress += speed * dt;
    const t = Math.min(this.shotProgress, 1);

    // Quadratic Bézier curve through mid-air peak
    const midX = (this.shotStartX + this.shotGoalX) / 2;
    const midY = (this.shotStartY + this.shotGoalY) / 2 - this.shotArcPeakY;

    const x = (1 - t) * (1 - t) * this.shotStartX + 2 * (1 - t) * t * midX + t * t * this.shotGoalX;
    const y = (1 - t) * (1 - t) * this.shotStartY + 2 * (1 - t) * t * midY + t * t * this.shotGoalY;

    const isComplete = t >= 1;
    if (isComplete) {
      this.isShooting = false;
    }

    return { x, y, progress: t, isComplete };
  }
}
