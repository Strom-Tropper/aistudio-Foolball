/**
 * BallSprite - Spin while held, fast while traveling, fire on the goal shot.
 */

import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { characterFrames, CharacterSheet } from '../characterSprites';

const BALL_SCALE = 0.42;

export class BallSprite {
  public readonly container: Container;
  private readonly shadowGraphics: Graphics;
  private readonly view: Sprite;
  private clip: Extract<CharacterSheet, 'ballSpin' | 'ballFast' | 'ballFire'> = 'ballSpin';
  private frame = 0;
  private tick = 0;

  constructor() {
    this.container = new Container();
    this.shadowGraphics = new Graphics();
    this.shadowGraphics.ellipse(0, 2, 7, 3).fill({ color: 0x052e16, alpha: 0.45 });
    this.view = new Sprite(Texture.EMPTY);
    this.view.anchor.set(0.5, 0.5);
    this.view.scale.set(BALL_SCALE);
    this.container.addChild(this.shadowGraphics);
    this.container.addChild(this.view);
  }

  public setClip(clip: typeof this.clip): void {
    if (this.clip === clip) return;
    this.clip = clip;
    this.frame = 0;
    this.tick = 0;
    this.apply();
  }

  public step(dt: number): void {
    const frames = characterFrames(this.clip);
    if (frames.length < 2) return;
    this.tick += dt;
    if (this.tick < 4) return;
    this.tick = 0;
    this.frame = (this.frame + 1) % frames.length;
    this.apply();
  }

  public setElevation(elevationY: number): void {
    this.view.position.y = -elevationY;
    const scale = Math.max(0.45, 1 - elevationY / 90);
    this.shadowGraphics.scale.set(scale, scale * 0.85);
    this.shadowGraphics.alpha = Math.max(0.18, 0.55 - elevationY / 120);
  }

  public redraw(): void {
    this.frame = 0;
    this.apply();
  }

  private apply(): void {
    const texture = characterFrames(this.clip)[this.frame];
    if (!texture) return;
    this.view.texture = texture;
    this.view.scale.set(this.clip === 'ballSpin' ? 0.32 : 0.38);
  }
}
