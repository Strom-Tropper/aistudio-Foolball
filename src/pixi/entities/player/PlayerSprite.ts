/**
 * PlayerSprite - Visual rendering asset for the arcade striker hero
 * Authentic Nintendo World Cup (Kunio-kun / Nekketsu Soccer) Chibi Aesthetic:
 * - Stout, athletic chibi proportions with bold arcade outlines
 * - Spiky anime pompadour fringe with high-contrast hair sheen
 * - Fierce slanted anime eyes & expressive comedic expressions (dizzy KO swirls, goal grin)
 * - Team kit #10 with white collar, athletic shorts, folded socks & chunky cleats
 */

import { Container, Graphics } from 'pixi.js';

export type StrikerPose = 'running' | 'shooting' | 'tackled' | 'celebrating';

export class PlayerSprite {
  public readonly container: Container;
  private readonly graphics: Graphics;
  private currentPose: StrikerPose = 'running';

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.draw('running');
  }

  public setPose(pose: StrikerPose): void {
    if (this.currentPose !== pose) {
      this.currentPose = pose;
      this.draw(pose);
    }
  }

  public get pose(): StrikerPose {
    return this.currentPose;
  }

  /**
   * Draw Nintendo World Cup style arcade striker
   */
  public draw(pose: StrikerPose): void {
    this.graphics.clear();
    const g = this.graphics;

    // 1. Chunky Arcade Turf Drop Shadow
    g.ellipse(0, 22, 20, 8).fill({ color: 0x052e16, alpha: 0.65 });
    g.ellipse(0, 22, 14, 5).fill({ color: 0x022c22, alpha: 0.85 });

    if (pose === 'shooting') {
      // =======================================================================
      // POSE: SUPER SHOT (Legendary Kunio-kun Thunder Shot Wind-up & Kick)
      // =======================================================================
      // Planted left leg & kicking right leg swung forward
      // Left boot (planted)
      g.rect(-16, 17, 11, 7).fill(0x0f172a); // boot outline
      g.rect(-15, 18, 9, 5).fill(0xea580c);  // fiery orange cleat
      g.rect(-15, 23, 9, 2).fill(0xffffff);  // studs
      g.rect(-13, 10, 8, 8).fill(0xffffff);  // white sock
      g.rect(-13, 10, 8, 2).fill(0x2563eb);  // blue stripe

      // Right leg swung forward in high kick!
      g.rect(4, 10, 14, 8).fill(0x1d4ed8);   // right short leg
      g.rect(14, 6, 9, 8).fill(0xffffff);    // sock
      g.rect(20, 3, 13, 9).fill(0x0f172a);   // boot outline
      g.rect(21, 4, 11, 7).fill(0xea580c);   // kicking cleat
      g.rect(21, 10, 11, 2).fill(0xffffff);  // studs

      // Shorts (athletic blue with white side stripe)
      g.rect(-14, 4, 26, 10).fill(0x1e40af);
      g.rect(-14, 4, 3, 10).fill(0xffffff);

      // Torso tilted back in athletic power strike
      g.rect(-16, -15, 30, 20).fill(0x0f172a); // dark outline
      g.rect(-15, -14, 28, 18).fill(0x2563eb); // vibrant blue kit
      g.rect(-15, -14, 6, 18).fill(0x3b82f6);  // highlight
      g.rect(-6, -14, 12, 4).fill(0xffffff);   // white v-neck collar

      // Number 10 on chest
      g.rect(-4, -9, 3, 8).fill(0xffffff);     // "1"
      g.rect(1, -9, 5, 8).fill(0xffffff);      // "0"
      g.rect(2, -7, 3, 4).fill(0x2563eb);

      // Left arm back for balance, right arm driving forward
      g.rect(-22, -8, 8, 8).fill(0xfbbf24);   // clenched fist
      g.rect(14, -12, 10, 8).fill(0xfbbf24);

      // Head: Fierce determined warrior face (Kunio super shot roar)
      g.rect(-10, -32, 22, 18).fill(0x0f172a); // head outline
      g.rect(-9, -31, 20, 16).fill(0xfde047);  // arcade skin tone
      // Fierce roaring open mouth
      g.rect(-3, -19, 8, 5).fill(0x991b1b);
      g.rect(-2, -18, 6, 2).fill(0xffffff);   // teeth
      // Fierce slanted eyes
      g.rect(-6, -26, 5, 4).fill(0x0f172a);
      g.rect(-5, -25, 2, 2).fill(0xffffff);
      g.rect(3, -26, 5, 4).fill(0x0f172a);
      g.rect(4, -25, 2, 2).fill(0xffffff);
      // Furrowed thick brow
      g.rect(-7, -28, 7, 2).fill(0x18181b);
      g.rect(2, -28, 7, 2).fill(0x18181b);

      // Spiky Anime Pompadour Hair
      g.rect(-13, -39, 28, 10).fill(0x0f172a);
      g.rect(-12, -38, 26, 8).fill(0x451a03);
      g.rect(-6, -42, 14, 5).fill(0x451a03);   // tall spiky fringe
      g.rect(-4, -40, 8, 3).fill(0xd97706);    // golden hair sheen

      // Kick impact speed swoosh trail behind foot
      g.arc(24, 8, 16, Math.PI * 0.3, Math.PI * 0.9).stroke({ width: 3, color: 0xfef08a, alpha: 0.8 });
    } else if (pose === 'tackled') {
      // =======================================================================
      // POSE: TACKLED / KNOCKED BACK (Kunio-kun Comedic Dizzy KO)
      // =======================================================================
      // Sprawled limbs, torso thrown back
      g.rect(-16, 12, 10, 8).fill(0xea580c); // boots kicked in air
      g.rect(8, 14, 10, 8).fill(0xea580c);
      g.rect(-15, 6, 8, 8).fill(0xffffff);   // socks
      g.rect(7, 8, 8, 8).fill(0xffffff);

      // Tilted Shorts
      g.rect(-14, -2, 26, 10).fill(0x1e40af);

      // Torso knocked back
      g.rect(-16, -16, 28, 16).fill(0x0f172a);
      g.rect(-15, -15, 26, 14).fill(0x2563eb);
      g.rect(-6, -15, 12, 3).fill(0xffffff);

      // Head thrown back with COMEDIC DIZZY SPIRAL EYES
      g.rect(-11, -30, 22, 16).fill(0x0f172a);
      g.rect(-10, -29, 20, 14).fill(0xfde047);

      // Spiral / Cross dizzy eyes (Classic Technos knockout face)
      // Left eye X
      g.moveTo(-7, -25).lineTo(-3, -21).stroke({ width: 2, color: 0x0f172a });
      g.moveTo(-3, -25).lineTo(-7, -21).stroke({ width: 2, color: 0x0f172a });
      // Right eye X
      g.moveTo(2, -25).lineTo(6, -21).stroke({ width: 2, color: 0x0f172a });
      g.moveTo(6, -25).lineTo(2, -21).stroke({ width: 2, color: 0x0f172a });

      // O-shaped stunned open mouth
      g.ellipse(-1, -17, 3, 4).fill(0x991b1b);

      // Hair disheveled
      g.rect(-14, -36, 28, 8).fill(0x451a03);
      g.rect(-8, -39, 12, 4).fill(0x451a03);

      // Flying comedic sweat beads (classic anime hit effect)
      g.ellipse(-16, -28, 3, 5).fill(0x38bdf8);
      g.ellipse(14, -26, 3, 5).fill(0x38bdf8);
      g.ellipse(16, -16, 2, 4).fill(0x38bdf8);
    } else if (pose === 'celebrating') {
      // =======================================================================
      // POSE: GOAL CELEBRATION (Victory Fist Pump Jumping \o/)
      // =======================================================================
      // Boots & socks jumping in air
      g.rect(-12, 10, 10, 7).fill(0x0f172a);
      g.rect(-11, 11, 8, 5).fill(0xea580c);
      g.rect(-11, 15, 8, 2).fill(0xffffff); // studs
      g.rect(3, 10, 10, 7).fill(0x0f172a);
      g.rect(4, 11, 8, 5).fill(0xea580c);
      g.rect(4, 15, 8, 2).fill(0xffffff);

      g.rect(-10, 4, 7, 7).fill(0xffffff);
      g.rect(4, 4, 7, 7).fill(0xffffff);

      // Shorts
      g.rect(-13, -4, 26, 10).fill(0x1e40af);
      g.rect(-13, -4, 3, 10).fill(0xffffff);

      // Torso upright & proud
      g.rect(-16, -20, 32, 18).fill(0x0f172a);
      g.rect(-15, -19, 30, 16).fill(0x2563eb);
      g.rect(-6, -19, 12, 3).fill(0xffffff);

      // Number 10
      g.rect(-3, -15, 3, 8).fill(0xffffff);
      g.rect(2, -15, 4, 8).fill(0xffffff);
      g.rect(3, -13, 2, 4).fill(0x2563eb);

      // Both Arms Thrashing the Air in Victory! \o/
      g.rect(-24, -32, 8, 16).fill(0x0f172a);
      g.rect(-23, -31, 6, 14).fill(0xfde047);
      g.rect(-26, -37, 10, 8).fill(0xfbbf24); // raised left fist!

      g.rect(16, -32, 8, 16).fill(0x0f172a);
      g.rect(17, -31, 6, 14).fill(0xfde047);
      g.rect(16, -37, 10, 8).fill(0xfbbf24); // raised right fist!

      // Joyful shouting head (huge smiling grin, curved happy anime eyes)
      g.rect(-11, -33, 22, 16).fill(0x0f172a);
      g.rect(-10, -32, 20, 14).fill(0xfde047);

      // Cheerful crescent eyes (^ ^)
      g.arc(-5, -27, 4, Math.PI, 0).stroke({ width: 2, color: 0x0f172a });
      g.arc(4, -27, 4, Math.PI, 0).stroke({ width: 2, color: 0x0f172a });

      // Huge open shouting mouth
      g.rect(-4, -22, 8, 5).fill(0x991b1b);
      g.rect(-3, -22, 6, 2).fill(0xffffff); // teeth

      // Spiky Anime Pompadour with golden champion gleam
      g.rect(-13, -40, 28, 9).fill(0x0f172a);
      g.rect(-12, -39, 26, 7).fill(0x451a03);
      g.rect(-6, -44, 14, 6).fill(0x451a03);
      g.rect(-4, -42, 8, 3).fill(0xfacc15); // gold sheen

      // Celebration sparkle stars around fists
      g.rect(-24, -42, 3, 3).fill(0xfef08a);
      g.rect(23, -42, 3, 3).fill(0xfef08a);
    } else {
      // =======================================================================
      // POSE: RUNNING (Chunky Arcade Dribbling Stride)
      // =======================================================================
      // Sturdy athletic legs & cleats
      // Left leg
      g.rect(-12, 14, 10, 7).fill(0x0f172a); // outline
      g.rect(-11, 15, 8, 5).fill(0xea580c);  // cleat
      g.rect(-11, 20, 8, 2).fill(0xffffff);  // studs
      g.rect(-10, 6, 7, 9).fill(0xffffff);   // folded sock
      g.rect(-10, 7, 7, 2).fill(0x2563eb);   // blue stripe

      // Right leg
      g.rect(3, 13, 10, 7).fill(0x0f172a);
      g.rect(4, 14, 8, 5).fill(0xea580c);
      g.rect(4, 19, 8, 2).fill(0xffffff);
      g.rect(4, 5, 7, 9).fill(0xffffff);
      g.rect(4, 6, 7, 2).fill(0x2563eb);

      // Athletic Shorts (Chunky blue with crisp white trim)
      g.rect(-13, -1, 26, 9).fill(0x1e40af);
      g.rect(-13, -1, 3, 9).fill(0xffffff);
      g.rect(10, -1, 3, 9).fill(0xffffff);

      // Powerful Torso with Jersey #10
      g.rect(-16, -18, 32, 19).fill(0x0f172a); // outline
      g.rect(-15, -17, 30, 17).fill(0x2563eb); // blue kit
      g.rect(-15, -17, 5, 17).fill(0x3b82f6);  // muscle highlight
      g.rect(-6, -17, 12, 4).fill(0xffffff);   // white v-neck collar

      // Number 10 on chest
      g.rect(-3, -12, 3, 8).fill(0xffffff);
      g.rect(2, -12, 4, 8).fill(0xffffff);
      g.rect(3, -10, 2, 4).fill(0x2563eb);

      // Pumping running arms with clenched fists
      g.rect(-20, -10, 6, 12).fill(0x0f172a);
      g.rect(-19, -9, 4, 10).fill(0xfde047);
      g.rect(-21, -2, 6, 6).fill(0xfbbf24);   // clenched fist

      g.rect(14, -13, 6, 12).fill(0x0f172a);
      g.rect(15, -12, 4, 10).fill(0xfde047);
      g.rect(14, -16, 6, 6).fill(0xfbbf24);   // front fist

      // Chunky Chibi Head with Determined Expression
      g.rect(-11, -33, 22, 17).fill(0x0f172a);
      g.rect(-10, -32, 20, 15).fill(0xfde047);

      // Slanted determined anime eyes
      g.rect(-6, -26, 5, 4).fill(0x0f172a);
      g.rect(-5, -25, 2, 2).fill(0xffffff);
      g.rect(2, -26, 5, 4).fill(0x0f172a);
      g.rect(3, -25, 2, 2).fill(0xffffff);

      // Thick anime eyebrows
      g.rect(-7, -29, 6, 2).fill(0x18181b);
      g.rect(2, -29, 6, 2).fill(0x18181b);

      // Determined grimace mouth
      g.rect(-3, -19, 6, 2).fill(0x991b1b);

      // Spiky Anime Pompadour Fringe Hair
      g.rect(-13, -40, 28, 9).fill(0x0f172a);
      g.rect(-12, -39, 26, 7).fill(0x451a03);
      g.rect(-6, -43, 14, 5).fill(0x451a03);
      g.rect(-4, -41, 8, 3).fill(0xd97706);   // hair sheen
    }
  }
}
