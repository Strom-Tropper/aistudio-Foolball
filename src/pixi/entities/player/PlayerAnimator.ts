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
      // Slight dizzy wobble
      return Math.sin(this.animTick * 3) * 1.2;
    }
    if (isCelebrating) {
      // Energetic victory jumping bounce
      return Math.abs(Math.sin(this.animTick * 2.5)) * -6;
    }
    if (isMoving) {
      // Pumping running stride bob
      return Math.sin(this.animTick * 2.2) * 2.5;
    }
    // Idle breathing
    return Math.sin(this.animTick * 0.8) * 0.8;
  }

  public get tick(): number {
    return this.animTick;
  }
}
