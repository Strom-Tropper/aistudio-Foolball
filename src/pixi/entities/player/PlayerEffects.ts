/**
 * PlayerEffects - Particle, aura, and footprint effects for striker hero
 * Responsibility: Striker feedback, grass kick-up, cleat stud marks, and celebration effects
 */

import { Container, Sprite } from 'pixi.js';
import { ActionParticle } from '../../systems/AnimationSystem';
import { characterFrames } from '../characterSprites';

export class PlayerEffects {
  /**
   * Turf kick-up particles behind cleats when running
   */
  public generateRunningTurf(playerX: number, playerY: number, outParticles: ActionParticle[]): void {
    if (Math.random() > 0.5) {
      for (let i = 0; i < 3; i++) {
        outParticles.push({
          x: playerX - 10 + (Math.random() * 6 - 3),
          y: playerY + 16,
          vx: (Math.random() - 0.7) * 2.5,
          vy: -Math.random() * 2,
          alpha: 0.9,
          size: Math.random() > 0.5 ? 3 : 2,
          color: 0x16a34a,
        });
      }
    }
  }

  /**
   * Cleat prints left behind on a cleared pitch cell, toes pointing right
   */
  public drawCleatPrints(parent: Container, w: number, h: number): void {
    const frames = characterFrames('footprint');
    frames.forEach((texture, index) => {
      const mark = new Sprite(texture);
      mark.anchor.set(0.5, 0.5);
      mark.scale.set(2);
      mark.position.set(w / 2 + (index === 0 ? -8 : 6), h / 2 + (index === 0 ? -5 : 5));
      parent.addChild(mark);
    });
  }

  /**
   * Goal celebration confetti burst shower around the striker and goal
   */
  public generateCelebrationShower(width: number, height: number, outParticles: ActionParticle[]): void {
    if (Math.random() > 0.45) {
      const colors = [0xfacc15, 0x38bdf8, 0x4ade80, 0xf43f5e, 0xffffff];
      outParticles.push({
        x: width - 80 + (Math.random() * 100 - 50),
        y: height / 2 + (Math.random() * 90 - 45),
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3.5,
        alpha: 1.0,
        size: Math.random() > 0.5 ? 4 : 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }
}
