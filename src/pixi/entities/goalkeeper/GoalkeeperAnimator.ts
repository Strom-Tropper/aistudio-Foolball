/**
 * GoalkeeperAnimator - Handles lateral anticipation tracking and dive reaction
 * Responsibility: Goalkeeper movement interpolation and reaction animation only
 */

export class GoalkeeperAnimator {
  private animTick = 0;
  // Goalkeeper sprites are anchored at their feet, so their container sits
  // below the visual center of the goal mouth.
  private readonly feetAnchorOffset = 32;

  public update(dt: number): void {
    this.animTick += 0.16 * dt;
  }

  /**
   * Calculate target Y for goalkeeper to track incoming striker lane or dive at shot
   */
  public calculateAnticipationY(
    netCenterY: number,
    strikerY: number,
    ballY: number,
    isPlaying: boolean,
    isShootingGoal: boolean
  ): number {
    if (isShootingGoal) {
      return ballY;
    }

    if (isPlaying) {
      const yDiff = strikerY - netCenterY;
      const hop = Math.sin(this.animTick * 2.5) * 10;
      return netCenterY + this.feetAnchorOffset + Math.max(-42, Math.min(42, yDiff * 0.42)) + hop;
    }

    return netCenterY + this.feetAnchorOffset;
  }
}
