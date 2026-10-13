/**
 * AnimationSystem - Central animation coordinator for ticker loop, camera shake, particles, and shockwaves
 * Responsibility: Coordinating global visual FX timing and particle simulation
 */

import { Container, Graphics } from 'pixi.js';

export interface ActionParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export class AnimationSystem {
  public particles: ActionParticle[] = [];
  public shockwave: Shockwave | null = null;
  public cameraShake = 0;

  public readonly particleGraphics = new Graphics();
  public readonly shockwaveGraphics = new Graphics();

  /**
   * Trigger screen shake with a specific intensity
   */
  public triggerCameraShake(intensity = 16): void {
    this.cameraShake = intensity;
  }

  /**
   * Trigger a shockwave ring at coords
   */
  public triggerShockwave(x: number, y: number, maxRadius = 45): void {
    this.shockwave = {
      x,
      y,
      radius: 6,
      maxRadius,
      alpha: 1.0,
    };
  }

  /**
   * Emit dramatic impact sparks & turf spray on slide tackle collision
   */
  public emitImpactSparks(x: number, y: number): void {
    for (let i = 0; i < 24; i++) {
      this.particles.push({
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 16 - 8),
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 1.2) * 5,
        alpha: 1.0,
        size: Math.random() > 0.4 ? 4 : 2,
        color: Math.random() > 0.5 ? 0xef4444 : Math.random() > 0.5 ? 0xffffff : 0xfacc15,
      });
    }
  }

  /**
   * Update screen shake on stage container
   */
  public updateCameraShake(stage: Container, dt: number): void {
    if (this.cameraShake > 0) {
      const sx = (Math.random() - 0.5) * this.cameraShake * 2;
      const sy = (Math.random() - 0.5) * this.cameraShake * 2;
      stage.position.set(sx, sy);
      this.cameraShake -= 0.8 * dt;
      if (this.cameraShake <= 0) {
        this.cameraShake = 0;
        stage.position.set(0, 0);
      }
    }
  }

  /**
   * Update shockwave ripple graphics
   */
  public updateShockwave(dt: number): void {
    this.shockwaveGraphics.clear();
    if (!this.shockwave) return;

    this.shockwave.radius += 2.8 * dt;
    this.shockwave.alpha -= 0.05 * dt;

    if (this.shockwave.alpha <= 0 || this.shockwave.radius >= this.shockwave.maxRadius) {
      this.shockwave = null;
    } else {
      this.shockwaveGraphics
        .circle(this.shockwave.x, this.shockwave.y, this.shockwave.radius)
        .stroke({ width: 3, color: 0xef4444, alpha: this.shockwave.alpha });
      this.shockwaveGraphics
        .circle(this.shockwave.x, this.shockwave.y, this.shockwave.radius * 0.6)
        .stroke({ width: 1.5, color: 0xfacc15, alpha: this.shockwave.alpha * 0.7 });
    }
  }

  /**
   * Update particle pool physics and render to graphics
   */
  public updateParticles(dt: number): void {
    this.particleGraphics.clear();
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.1 * dt;
      p.alpha -= 0.035 * dt;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      } else {
        this.particleGraphics.rect(p.x, p.y, p.size, p.size).fill({ color: p.color, alpha: p.alpha });
      }
    }
  }
}
