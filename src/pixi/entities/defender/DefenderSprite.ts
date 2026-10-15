/**
 * DefenderSprite - Red blocker. Idle after the striker gets past, fall when hit.
 * Feet sit on the bottom of the frame.
 */

import { Container, Sprite, Texture } from 'pixi.js';
import { SPRITE_SCALE, characterFrames } from '../characterSprites';

export type DefenderPose = 'idle' | 'fall';

export class DefenderSprite {
  public readonly container: Container;
  private readonly view: Sprite;
  private currentPose: DefenderPose = 'fall';
  private clock = 0;
  private settled = false;

  constructor() {
    this.container = new Container();
    this.view = new Sprite(Texture.EMPTY);
    this.view.anchor.set(0.5, 1);
    this.view.scale.set(SPRITE_SCALE);
    this.container.addChild(this.view);
    this.draw('fall', true);
  }

  public setPose(pose: DefenderPose): void {
    if (this.currentPose !== pose || this.settled) {
      this.draw(pose);
    }
  }

  public get pose(): DefenderPose {
    return this.currentPose;
  }

  public redraw(): void {
    this.draw(this.currentPose, this.settled);
  }

  public draw(pose: DefenderPose, settle = false): void {
    this.currentPose = pose;
    this.settled = settle;
    this.clock = 0;
    this.apply();
  }

  public align(time: number): void {
    this.clock = time;
    this.apply();
  }

  public step(dt: number): void {
    if (this.settled) return;
    this.clock += dt;
    if (this.currentPose === 'fall') {
      const frames = characterFrames('fall');
      if (frames.length > 0 && this.clock >= frames.length * 6) {
        this.draw('idle');
        return;
      }
    }
    this.apply();
  }

  private apply(): void {
    const sheet = this.currentPose === 'idle' ? 'blockerIdle' : 'fall';
    const frames = characterFrames(sheet);
    if (!frames.length) return;
    const index = this.currentPose === 'idle'
      ? Math.floor(this.clock / 8) % frames.length
      : this.settled
        ? frames.length - 1
        : Math.min(frames.length - 1, Math.floor(this.clock / 6));
    const texture = frames[index];
    if (texture) this.view.texture = texture;
  }
}
