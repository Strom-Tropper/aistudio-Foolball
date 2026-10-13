/**
 * CollisionSystem - Detects tackle confrontation collisions and coordinates impact effects
 * Responsibility: Collision testing, impact detection, and collision FX triggers
 */

import { AnimationSystem } from './AnimationSystem';

export class CollisionSystem {
  private animationSystem: AnimationSystem;

  constructor(animationSystem: AnimationSystem) {
    this.animationSystem = animationSystem;
  }

  /**
   * Check if a cell contains an active collision with defender
   */
  public isDefenderCollision(hasDefender: boolean): boolean {
    return hasDefender;
  }

  /**
   * Handle slide tackle collision impact
   */
  public triggerTackleImpact(x: number, y: number): void {
    this.animationSystem.triggerCameraShake(16);
    this.animationSystem.triggerShockwave(x, y, 48);
    this.animationSystem.emitImpactSparks(x, y);
  }

  /**
   * Goal post bounce or goal net impact
   */
  public triggerGoalImpact(x: number, y: number): void {
    this.animationSystem.triggerCameraShake(8);
    this.animationSystem.triggerShockwave(x, y, 32);
  }
}
