/**
 * GoalkeeperSprite - Yellow defender idle, jump on the shot.
 * Feet sit on the bottom of the frame.
 */

import { Container, Sprite, Texture } from 'pixi.js';
import { SPRITE_SCALE, characterFrames } from '../characterSprites';

export class GoalkeeperSprite {
  public readonly container: Container;
  private readonly view: Sprite;
  private isDiving = false;
  private frame = 0;
  private tick = 0;

  constructor() {
    this.container = new Container();
    this.view = new Sprite(Texture.EMPTY);
    this.view.anchor.set(0.5, 1);
    this.view.scale.set(SPRITE_SCALE);
    this.container.addChild(this.view);
    this.apply();
  }

  public setDiving(diving: boolean): void {
    if (this.isDiving === diving) return;
    this.isDiving = diving;
    this.frame = 0;
    this.tick = 0;
    this.apply();
  }

  public step(dt: number): void {
    const frames = characterFrames(this.isDiving ? 'keeperJump' : 'keeperIdle');
    if (frames.length < 2) return;
    this.tick += dt;
    const speed = this.isDiving ? 10 : 8;
    if (this.tick < speed) return;
    this.tick = 0;
    if (this.isDiving) {
      if (this.frame < frames.length - 1) {
        this.frame += 1;
      } else {
        this.isDiving = false;
        this.frame = 0;
      }
    } else {
      this.frame = (this.frame + 1) % frames.length;
    }
    this.apply();
  }

  public redraw(): void {
    this.frame = 0;
    this.apply();
  }

  private apply(): void {
    const frames = characterFrames(this.isDiving ? 'keeperJump' : 'keeperIdle');
    const texture = frames[this.frame];
    if (texture) this.view.texture = texture;
  }
}
