/**
 * BallSprite - Visual rendering asset for the arcade football
 * Authentic Nintendo World Cup (Kunio-kun) Bold Arcade Football:
 * - High-contrast 18px diameter white sphere with bold arcade outline
 * - Classic Telstar black pentagonal leather patches
 * - Dynamic 3D drop shadow on turf that remains grounded
 * - Brilliant specular highlight for maximum visibility against green pitch
 */

import { Container, Graphics } from 'pixi.js';

export class BallSprite {
  public readonly container: Container;
  private readonly shadowGraphics: Graphics;
  private readonly ballGraphics: Graphics;

  constructor() {
    this.container = new Container();
    this.shadowGraphics = new Graphics();
    this.ballGraphics = new Graphics();
    this.container.addChild(this.shadowGraphics);
    this.container.addChild(this.ballGraphics);
    this.draw();
  }

  /**
   * Set ball height above ground (for super-shot lofting and shadow scaling)
   */
  public setElevation(elevationY: number): void {
    this.ballGraphics.position.y = -elevationY;
    // Scale and fade shadow as ball rises above turf
    const scale = Math.max(0.4, 1 - elevationY / 60);
    this.shadowGraphics.scale.set(scale);
    this.shadowGraphics.alpha = Math.max(0.2, 0.65 - elevationY / 80);
  }

  /**
   * Draw high-contrast arcade football
   */
  public draw(): void {
    // 1. Grounded Turf Drop Shadow
    this.shadowGraphics.clear();
    this.shadowGraphics.ellipse(1, 10, 10, 5).fill({ color: 0x052e16, alpha: 0.65 });
    this.shadowGraphics.ellipse(1, 10, 7, 3.5).fill({ color: 0x022c22, alpha: 0.85 });

    // 2. High-Contrast Arcade Football (Radius 9px)
    this.ballGraphics.clear();
    const g = this.ballGraphics;

    // Bold black outer rim for crisp separation from turf
    g.circle(0, 0, 9.5).fill(0x0f172a);

    // Pearl white leather sphere
    g.circle(0, 0, 8.5).fill(0xf8fafc);
    // Subtle 3D spherical shading on bottom-right
    g.circle(1.5, 1.5, 7.5).fill({ color: 0xe2e8f0, alpha: 0.4 });

    // Classic Telstar Pentagonal Patches (Bold dark charcoal 0x0f172a)
    // Center pentagon
    g.poly([
      { x: 0, y: -3.5 },
      { x: 3.5, y: -1 },
      { x: 2.2, y: 3 },
      { x: -2.2, y: 3 },
      { x: -3.5, y: -1 },
    ]).fill(0x0f172a);

    // Surrounding seam lines & edge patches
    g.circle(-6, -3, 2.5).fill(0x0f172a);
    g.circle(6, -3, 2.5).fill(0x0f172a);
    g.circle(0, 6, 2.5).fill(0x0f172a);
    g.circle(-5, 4, 2).fill(0x0f172a);
    g.circle(5, 4, 2).fill(0x0f172a);

    // Pentagon stitch lines
    g.moveTo(0, -3.5).lineTo(0, -7.5).stroke({ width: 1, color: 0x94a3b8 });
    g.moveTo(3.5, -1).lineTo(7, -1).stroke({ width: 1, color: 0x94a3b8 });
    g.moveTo(-3.5, -1).lineTo(-7, -1).stroke({ width: 1, color: 0x94a3b8 });
    g.moveTo(2.2, 3).lineTo(4.5, 6.5).stroke({ width: 1, color: 0x94a3b8 });
    g.moveTo(-2.2, 3).lineTo(-4.5, 6.5).stroke({ width: 1, color: 0x94a3b8 });

    // Brilliant Specular Gleam Highlight
    g.circle(-3, -3.5, 2).fill(0xffffff);
    g.circle(-2, -4.5, 1).fill(0xffffff);
  }
}
