/**
 * DefenderSprite - Visual rendering asset for the arcade defender obstacle
 * Authentic Nintendo World Cup (Kunio-kun / Nekketsu Soccer) Rival Defender Aesthetic:
 * - Chunky, menacing rival player with bold arcade outlines
 * - Rival team Crimson & Charcoal kit with menacing stance
 * - Dynamic poses: Guard wall stance, Aggressive studs-up slide tackle, Beaten slump with dizzy spiral eyes
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export type DefenderPose = 'guard' | 'tackle' | 'beaten' | 'replay' | 'shield' | 'substitute';

export class DefenderSprite {
  public readonly container: Container;
  private readonly graphics: Graphics;
  private currentPose: DefenderPose = 'guard';

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.draw('guard');
  }

  public setPose(pose: DefenderPose): void {
    if (this.currentPose !== pose) {
      this.currentPose = pose;
      this.draw(pose);
    }
  }

  public get pose(): DefenderPose {
    return this.currentPose;
  }

  /**
   * Draw large arcade defender sprite (Chunky, menacing rival team kit #4, River City style)
   */
  public draw(pose: DefenderPose): void {
    this.container.removeChildren();
    this.graphics.clear();
    this.container.addChild(this.graphics);
    const g = this.graphics;

    // Chunky arcade turf drop shadow
    g.ellipse(0, 22, 20, 8).fill({ color: 0x052e16, alpha: 0.65 });
    g.ellipse(0, 22, 14, 5).fill({ color: 0x022c22, alpha: 0.85 });

    if (pose === 'tackle') {
      // =======================================================================
      // POSE: SLIDE TACKLE (Aggressive studs-up sliding collision pose)
      // =======================================================================
      // Sliding legs kicking across the lane
      g.rect(-28, 11, 24, 8).fill(0x0f172a); // outline
      g.rect(-27, 12, 22, 6).fill(0xdc2626); // crimson short/leg
      g.rect(-34, 10, 8, 8).fill(0xffffff);  // white sock
      g.rect(-40, 8, 10, 10).fill(0x0f172a); // boot outline
      g.rect(-39, 9, 8, 8).fill(0x18181b);   // black boot
      g.rect(-39, 15, 8, 2).fill(0xffffff);  // studs forward!

      // Sliding Torso horizontal on grass
      g.rect(-12, -2, 26, 16).fill(0x0f172a); // outline
      g.rect(-11, -1, 24, 14).fill(0xdc2626); // crimson jersey
      g.rect(-11, -1, 4, 14).fill(0xef4444);  // highlight
      g.rect(-11, -1, 3, 14).fill(0xffffff);  // white trim

      // Head: Grimacing fierce slide tackle bite
      g.rect(12, -12, 16, 16).fill(0x0f172a); // outline
      g.rect(13, -11, 14, 14).fill(0xfca5a5); // skin tone
      // Dark tough hair & headband
      g.rect(12, -16, 16, 6).fill(0x18181b);
      g.rect(12, -12, 16, 3).fill(0xffffff);  // white fighter headband!
      // Glaring eyes & clenched teeth
      g.rect(16, -7, 4, 3).fill(0x0f172a);
      g.rect(17, -6, 2, 1).fill(0xffffff);
      g.rect(14, -3, 8, 3).fill(0x18181b);   // grit teeth

      // Slide tackle turf spray & grass chunks
      g.rect(-36, 18, 10, 4).fill(0xffffff);
      g.rect(-44, 14, 8, 4).fill(0x4ade80);
      g.rect(-24, 20, 6, 3).fill(0x86efac);
    } else if (pose === 'beaten') {
      // =======================================================================
      // POSE: BEATEN / OUTPLAYED (River City classic slump on grass with spiral eyes)
      // =======================================================================
      // Slumped legs sitting on turf
      g.rect(-14, 14, 12, 8).fill(0x18181b); // boots
      g.rect(2, 14, 12, 8).fill(0x18181b);
      g.rect(-12, 6, 24, 10).fill(0x991b1b); // shorts

      // Slumped back of jersey
      g.rect(-16, -12, 32, 18).fill(0x0f172a);
      g.rect(-15, -11, 30, 16).fill(0xdc2626);
      g.rect(-4, -8, 8, 8).fill(0xffffff); // #4 on back

      // Head slumped with spiral dizzy eyes / stunned expression
      g.rect(-10, -28, 20, 16).fill(0x0f172a);
      g.rect(-9, -27, 18, 14).fill(0xfca5a5);
      // X / Spiral eyes
      g.moveTo(-6, -23).lineTo(-2, -19).stroke({ width: 2, color: 0x0f172a });
      g.moveTo(-2, -23).lineTo(-6, -19).stroke({ width: 2, color: 0x0f172a });
      g.moveTo(2, -23).lineTo(6, -19).stroke({ width: 2, color: 0x0f172a });
      g.moveTo(6, -23).lineTo(2, -19).stroke({ width: 2, color: 0x0f172a });
      // Mouth gaping in disbelief
      g.rect(-2, -16, 5, 3).fill(0x7f1d1d);

      // Messy black hair & headband
      g.rect(-12, -34, 24, 7).fill(0x18181b);
      g.rect(-12, -29, 24, 3).fill(0xffffff); // headband

      // Giant blue sweat droplets (Technos comical outplayed marker)
      g.ellipse(12, -30, 4, 7).fill(0x38bdf8);
      g.ellipse(-14, -26, 3, 5).fill(0x38bdf8);
    } else {
      // =======================================================================
      // POSE: GUARD (Stout, menacing defensive wall stance)
      // =======================================================================
      // Wide athletic stance boots & socks
      g.rect(-15, 14, 11, 8).fill(0x0f172a); // outline
      g.rect(-14, 15, 9, 6).fill(0x18181b);  // black boot
      g.rect(-14, 20, 9, 2).fill(0xffffff);  // studs
      g.rect(-13, 6, 8, 9).fill(0xffffff);   // white sock
      g.rect(-13, 7, 8, 2).fill(0xdc2626);   // red stripe

      g.rect(4, 14, 11, 8).fill(0x0f172a);
      g.rect(5, 15, 9, 6).fill(0x18181b);
      g.rect(5, 20, 9, 2).fill(0xffffff);
      g.rect(5, 6, 8, 9).fill(0xffffff);
      g.rect(5, 7, 8, 2).fill(0xdc2626);

      // Chunky Charcoal / Red Shorts
      g.rect(-15, -1, 30, 10).fill(0x18181b);
      g.rect(-15, -1, 3, 10).fill(0xdc2626); // red side stripe
      g.rect(12, -1, 3, 10).fill(0xdc2626);

      // Wide muscular Crimson Jersey Torso #4
      g.rect(-18, -19, 36, 20).fill(0x0f172a); // outline
      g.rect(-17, -18, 34, 18).fill(0xdc2626); // red kit
      g.rect(-17, -18, 5, 18).fill(0xef4444);  // muscle highlight
      g.rect(-7, -18, 14, 4).fill(0x18181b);   // black collar

      // Number 4 on chest
      g.rect(0, -13, 3, 9).fill(0xffffff);
      g.rect(-4, -13, 4, 3).fill(0xffffff);
      g.rect(-4, -10, 7, 3).fill(0xffffff);

      // Bulky arms with clenched fists
      g.rect(-22, -12, 7, 13).fill(0x0f172a);
      g.rect(-21, -11, 5, 11).fill(0xfca5a5);
      g.rect(-23, -3, 7, 7).fill(0xf87171); // clenched left fist

      g.rect(15, -12, 7, 13).fill(0x0f172a);
      g.rect(16, -11, 5, 11).fill(0xfca5a5);
      g.rect(16, -3, 7, 7).fill(0xf87171);  // clenched right fist

      // Chunky Head: Square jaw tough-guy glare
      g.rect(-12, -34, 24, 18).fill(0x0f172a);
      g.rect(-11, -33, 22, 16).fill(0xfca5a5);

      // Slanted menacing glare eyes
      g.rect(-7, -27, 5, 4).fill(0x0f172a);
      g.rect(-6, -26, 2, 2).fill(0xffffff);
      g.rect(2, -27, 5, 4).fill(0x0f172a);
      g.rect(3, -26, 2, 2).fill(0xffffff);

      // Unibrow / fierce furrowed brow
      g.rect(-8, -30, 16, 2).fill(0x18181b);

      // Gritting teeth grimace
      g.rect(-4, -20, 8, 3).fill(0x18181b);
      g.rect(-3, -20, 6, 1).fill(0xffffff);

      // Spiky Flat-Top Hair & Fighter Headband
      g.rect(-14, -41, 28, 9).fill(0x0f172a);
      g.rect(-13, -40, 26, 7).fill(0x18181b);
      g.rect(-14, -34, 28, 3).fill(0xffffff); // white headband!
      g.rect(-6, -34, 12, 3).fill(0xdc2626);  // red center crest
    }

    // Resolution overlay badges
    if (pose === 'replay') {
      const varBadge = new Graphics();
      varBadge.rect(-24, -48, 48, 14).fill(0x7c2d12);
      varBadge.rect(-24, -48, 48, 14).stroke({ width: 1.5, color: 0xfb923c });
      this.container.addChild(varBadge);

      const label = new Text({
        text: 'VAR ↺',
        style: new TextStyle({
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 9,
          fontWeight: 'bold',
          fill: 0xfed7aa,
        }),
      });
      label.anchor.set(0.5);
      label.position.set(0, -41);
      this.container.addChild(label);
    } else if (pose === 'shield') {
      const shieldBadge = new Graphics();
      shieldBadge.circle(0, 0, 24).stroke({ width: 2, color: 0xf59e0b, alpha: 0.9 });
      shieldBadge.circle(0, 0, 26).stroke({ width: 1, color: 0xfef08a, alpha: 0.5 });
      this.container.addChild(shieldBadge);
    } else if (pose === 'substitute') {
      const subBadge = new Graphics();
      subBadge.rect(-24, -48, 48, 14).fill(0x064e3b);
      subBadge.rect(-24, -48, 48, 14).stroke({ width: 1.5, color: 0x34d399 });
      this.container.addChild(subBadge);

      const label = new Text({
        text: 'SUB ⇄',
        style: new TextStyle({
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 9,
          fontWeight: 'bold',
          fill: 0xa7f3d0,
        }),
      });
      label.anchor.set(0.5);
      label.position.set(0, -41);
      this.container.addChild(label);
    }
  }
}
