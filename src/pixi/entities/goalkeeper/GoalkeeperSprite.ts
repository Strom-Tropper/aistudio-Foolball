/**
 * GoalkeeperSprite - Visual rendering asset for the arcade goalkeeper
 * Authentic Nintendo World Cup (Kunio-kun / Nekketsu Soccer) Goalkeeper:
 * - Bulky, wide-shouldered goalkeeper with oversized padded gloves
 * - Neon green & charcoal kit with dark shorts
 * - Alert defensive stance vs full-extension horizontal dive pose
 */

import { Container, Graphics } from 'pixi.js';

export class GoalkeeperSprite {
  public readonly container: Container;
  private readonly graphics: Graphics;
  private isDiving = false;

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.draw(false);
  }

  public setDiving(diving: boolean): void {
    if (this.isDiving !== diving) {
      this.isDiving = diving;
      this.draw(diving);
    }
  }

  /**
   * Draw large arcade goalkeeper sprite
   */
  public draw(isDiving: boolean): void {
    this.graphics.clear();
    const g = this.graphics;

    // Chunky arcade turf drop shadow
    g.ellipse(0, 22, 22, 8).fill({ color: 0x052e16, alpha: 0.65 });
    g.ellipse(0, 22, 16, 5).fill({ color: 0x022c22, alpha: 0.85 });

    if (isDiving) {
      // =======================================================================
      // POSE: HORIZONTAL DIVE (Dramatic aerial leap across the goalmouth)
      // =======================================================================
      // Body horizontal, gloves reaching toward ball
      // Back legs & cleats trailing in air
      g.rect(-34, 4, 14, 8).fill(0x0f172a);
      g.rect(-33, 5, 12, 6).fill(0x18181b); // black boot
      g.rect(-33, 9, 12, 2).fill(0xffffff); // studs
      g.rect(-22, 2, 10, 8).fill(0xffffff); // white sock
      g.rect(-16, 0, 16, 12).fill(0x0f172a); // dark shorts

      // Horizontal Torso in Neon Green Goalkeeper Jersey
      g.rect(-4, -6, 28, 18).fill(0x0f172a); // outline
      g.rect(-3, -5, 26, 16).fill(0x16a34a); // neon green kit
      g.rect(-3, -5, 4, 16).fill(0x4ade80);  // highlight
      g.rect(6, -5, 8, 4).fill(0x0f172a);    // collar

      // Massive Goalkeeper Gloves Outstretched reaching for the ball!
      g.rect(20, -12, 14, 14).fill(0x0f172a); // outline
      g.rect(21, -11, 12, 12).fill(0xf97316); // bright orange padded glove
      g.rect(23, -9, 8, 8).fill(0xffedd5);   // white palm grip padding
      g.rect(21, -1, 12, 3).fill(0x18181b);  // wrist strap

      // Goalkeeper Head & Fierce Dive Expression
      g.rect(0, -18, 16, 16).fill(0x0f172a);
      g.rect(1, -17, 14, 14).fill(0xfca5a5);
      // Dark spiky hair
      g.rect(-2, -22, 18, 6).fill(0x18181b);
      // Slanted focused eyes looking right at the ball
      g.rect(6, -14, 4, 3).fill(0x0f172a);
      g.rect(7, -13, 2, 1).fill(0xffffff);
      // Open shouting mouth
      g.rect(4, -9, 6, 3).fill(0x991b1b);
    } else {
      // =======================================================================
      // POSE: ALERT CROUCH (Wide-stance guardian of the goal net)
      // =======================================================================
      // Wide Athletic Stance Boots & Socks
      g.rect(-16, 14, 12, 8).fill(0x0f172a); // outline
      g.rect(-15, 15, 10, 6).fill(0x18181b);
      g.rect(-15, 20, 10, 2).fill(0xffffff); // studs
      g.rect(-14, 6, 9, 9).fill(0xffffff);   // socks
      g.rect(-14, 7, 9, 2).fill(0x16a34a);

      g.rect(5, 14, 12, 8).fill(0x0f172a);
      g.rect(6, 15, 10, 6).fill(0x18181b);
      g.rect(6, 20, 10, 2).fill(0xffffff);
      g.rect(6, 6, 9, 9).fill(0xffffff);
      g.rect(6, 7, 9, 2).fill(0x16a34a);

      // Chunky Dark Shorts
      g.rect(-16, -1, 32, 10).fill(0x0f172a);
      g.rect(-16, -1, 3, 10).fill(0x4ade80); // green side trim
      g.rect(13, -1, 3, 10).fill(0x4ade80);

      // Bulky Broad-Shouldered Neon Green Kit #1
      g.rect(-19, -19, 38, 20).fill(0x0f172a); // outline
      g.rect(-18, -18, 36, 18).fill(0x16a34a); // neon green
      g.rect(-18, -18, 5, 18).fill(0x4ade80);  // highlight
      g.rect(-7, -18, 14, 4).fill(0x0f172a);   // black v-neck collar

      // Number 1 on chest
      g.rect(-2, -13, 3, 9).fill(0xffffff);
      g.rect(-4, -13, 3, 3).fill(0xffffff);

      // MASSIVE OVERSIZED GOALKEEPER GLOVES (Ready crouch spread)
      // Left Glove
      g.rect(-27, -8, 13, 13).fill(0x0f172a); // outline
      g.rect(-26, -7, 11, 11).fill(0xf97316); // orange glove
      g.rect(-24, -5, 7, 7).fill(0xffedd5);   // palm padding
      g.rect(-26, 2, 11, 3).fill(0x18181b);   // black wrist strap

      // Right Glove
      g.rect(14, -8, 13, 13).fill(0x0f172a);
      g.rect(15, -7, 11, 11).fill(0xf97316);
      g.rect(17, -5, 7, 7).fill(0xffedd5);
      g.rect(15, 2, 11, 3).fill(0x18181b);

      // Chunky Goalie Head & Fierce Watchful Expression
      g.rect(-12, -34, 24, 18).fill(0x0f172a);
      g.rect(-11, -33, 22, 16).fill(0xfca5a5);

      // Slanted fierce arcade eyes
      g.rect(-7, -27, 5, 4).fill(0x0f172a);
      g.rect(-6, -26, 2, 2).fill(0xffffff);
      g.rect(2, -27, 5, 4).fill(0x0f172a);
      g.rect(3, -26, 2, 2).fill(0xffffff);

      // Heavy brow & focused mouth
      g.rect(-8, -30, 16, 2).fill(0x18181b);
      g.rect(-3, -20, 6, 2).fill(0x991b1b);

      // Spiky Goalkeeper Haircut
      g.rect(-14, -40, 28, 8).fill(0x0f172a);
      g.rect(-13, -39, 26, 6).fill(0x18181b);
      g.rect(-7, -42, 14, 4).fill(0x18181b);
    }
  }
}
