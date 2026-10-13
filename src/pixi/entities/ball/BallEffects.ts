/**
 * BallEffects - Particle and trail effects for the ball
 * Responsibility: Ball visual feedback, trail generation, turf puffs, and speed sparks
 */

import { ActionParticle } from '../../systems/AnimationSystem';

export class BallEffects {
  /**
   * Generate emerald and white speed sparks trailing the dribbling ball
   */
  public generateDribbleTrail(ballX: number, ballY: number, outParticles: ActionParticle[]): void {
    if (Math.random() > 0.35) {
      outParticles.push({
        x: ballX - 4,
        y: ballY + 4,
        vx: -1.8 + (Math.random() * 0.4 - 0.2),
        vy: (Math.random() - 0.5) * 1.5,
        alpha: 0.85,
        size: Math.random() > 0.5 ? 3 : 2,
        color: Math.random() > 0.5 ? 0xffffff : 0x86efac,
      });
    }
  }

  /**
   * Generate golden fire sparks during a powerful goal shot
   */
  public generateShotSparks(ballX: number, ballY: number, outParticles: ActionParticle[]): void {
    if (Math.random() > 0.25) {
      outParticles.push({
        x: ballX - 4,
        y: ballY + (Math.random() * 4 - 2),
        vx: -2.8 + (Math.random() * 0.6 - 0.3),
        vy: (Math.random() - 0.5) * 2,
        alpha: 1.0,
        size: Math.random() > 0.5 ? 4 : 2.5,
        color: Math.random() > 0.4 ? 0xfacc15 : 0xf97316,
      });
    }
  }

  /**
   * Generate turf grass spray when ball is kicked
   */
  public generateKickPuff(ballX: number, ballY: number, outParticles: ActionParticle[]): void {
    for (let i = 0; i < 6; i++) {
      outParticles.push({
        x: ballX + (Math.random() * 6 - 3),
        y: ballY + 6,
        vx: (Math.random() - 0.5) * 2.5,
        vy: -Math.random() * 2,
        alpha: 0.9,
        size: 2.5,
        color: Math.random() > 0.5 ? 0x22c55e : 0x15803d,
      });
    }
  }
}
