/**
 * DefenderAnimator - Handles confrontation rush animation sequences and timing
 * Responsibility: Playing slide tackle visual sequence only
 */

export interface TackleSequenceState {
  progress: number;
  phase: 'rush' | 'impact_slide' | 'done';
  currentDefenderX: number;
  strikerKnockbackX: number;
}

export class DefenderAnimator {
  private isTackling = false;
  private progress = 0;
  private startX = 0;
  private targetX = 0;
  private hasImpactTriggered = false;

  public startTackle(fromX: number, toX: number): void {
    this.startX = fromX;
    this.targetX = toX;
    this.progress = 0;
    this.isTackling = true;
    this.hasImpactTriggered = false;
  }

  public stopTackle(): void {
    this.isTackling = false;
    this.progress = 0;
  }

  public get isActive(): boolean {
    return this.isTackling;
  }

  public get shouldTriggerImpact(): boolean {
    if (this.isTackling && this.progress >= 0.4 && !this.hasImpactTriggered) {
      this.hasImpactTriggered = true;
      return true;
    }
    return false;
  }

  /**
   * Step the tackle confrontation animation
   */
  public stepTackle(dt: number, speed = 0.045): TackleSequenceState {
    if (!this.isTackling) {
      return {
        progress: 1,
        phase: 'done',
        currentDefenderX: this.targetX,
        strikerKnockbackX: 0,
      };
    }

    this.progress += speed * dt;

    if (this.progress < 0.4) {
      // Phase 1: Rushing out into the lane towards striker
      const t = this.progress / 0.4;
      const curX = this.startX + (this.targetX - this.startX) * t;
      return {
        progress: this.progress,
        phase: 'rush',
        currentDefenderX: curX,
        strikerKnockbackX: 0,
      };
    }

    if (this.progress < 1.0) {
      // Phase 2: Slide tackle impact & knockback
      const slideT = Math.min((this.progress - 0.4) / 0.4, 1);
      const curX = this.targetX - 18 * slideT;
      const knockback = -10 * slideT;
      return {
        progress: this.progress,
        phase: 'impact_slide',
        currentDefenderX: curX,
        strikerKnockbackX: knockback,
      };
    }

    // Done
    this.isTackling = false;
    return {
      progress: 1.0,
      phase: 'done',
      currentDefenderX: this.targetX - 18,
      strikerKnockbackX: -10,
    };
  }
}
