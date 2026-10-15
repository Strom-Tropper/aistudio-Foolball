/**
 * PlayerAnimator - Handles striker running bob, idle breathing, celebration bounce
 * Responsibility: Playing visual sequences and procedural offsets only
 */

export class PlayerAnimator {
  private animTick = 0;

  public update(dt: number): void {
    this.animTick += 0.16 * dt;
  }

  /**
   * Get vertical bobbing offset based on whether striker is moving or idle
   */
  public getBobY(isMoving: boolean, isCelebrating: boolean, isTackled: boolean): number {
    if (isTackled) {
      return Math.sin(this.animTick * 4) * 3;
    }
    if (isCelebrating) {
      return Math.abs(Math.sin(this.animTick * 2.8)) * -8;
    }
    if (isMoving) {
      return Math.abs(Math.sin(this.animTick * 3.4)) * -4;
    }
    return Math.sin(this.animTick * 1.1) * 2;
  }

  public get tick(): number {
    return this.animTick;
  }
}
