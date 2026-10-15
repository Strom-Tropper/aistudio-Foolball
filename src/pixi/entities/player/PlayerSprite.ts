/**
 * PlayerSprite - Blue striker frames from public/sprites.
 * Feet sit on the bottom of the frame.
 */

import { Container, Sprite, Texture } from 'pixi.js';
import { SPRITE_SCALE, characterFrames } from '../characterSprites';

export type StrikerPose = 'running' | 'dodging' | 'shooting' | 'tackled' | 'celebrating';

export class PlayerSprite {
  public readonly container: Container;
  private readonly view: Sprite;
  private currentPose: StrikerPose = 'running';
  private frameIndex = -1;
  private idleStep = 0;
  private actionFrame = 0;
  private actionTick = 0;
  private dodgeCycles = 0;

  constructor() {
    this.container = new Container();
    this.view = new Sprite(Texture.EMPTY);
    this.view.anchor.set(0.5, 1);
    this.view.scale.set(SPRITE_SCALE);
    this.container.addChild(this.view);
    this.draw('running');
  }

  public setPose(pose: StrikerPose): void {
    if (this.currentPose !== pose) {
      this.currentPose = pose;
      this.frameIndex = -1;
      this.actionFrame = 0;
      this.actionTick = 0;
      this.draw(pose);
    }
  }

  public setStride(stride: number | null): void {
    if (this.currentPose !== 'running') return;
    if (stride === null) {
      const idle = characterFrames('idle');
      if (!idle.length) return;
      this.idleStep = (this.idleStep + 1) % (idle.length * 8);
      this.useFrame(idle, Math.floor(this.idleStep / 8));
      return;
    }
    const run = characterFrames('dribble');
    if (!run.length) return;
    const phase = (stride + 1) / 2;
    const index = Math.min(run.length - 1, Math.floor(phase * run.length));
    this.useFrame(run, index);
  }

  public get pose(): StrikerPose {
    return this.currentPose;
  }

  public playDodge(): void {
    this.currentPose = 'dodging';
    this.frameIndex = -1;
    this.actionFrame = 0;
    this.actionTick = 0;
    this.dodgeCycles = 0;
    this.useFrame(characterFrames('dodge'), 0);
  }

  public stepDodge(dt: number, stillMoving: boolean): void {
    const frames = characterFrames('dodge');
    if (frames.length < 2) return;
    this.actionTick += dt;
    if (this.actionTick < 5) return;
    this.actionTick = 0;
    this.actionFrame += 1;
    if (this.actionFrame >= frames.length) {
      this.actionFrame = 0;
      this.dodgeCycles += 1;
    }
    if (!stillMoving && this.dodgeCycles >= 1) {
      this.dodgeCycles = 0;
      this.setPose('running');
      return;
    }
    this.useFrame(frames, this.actionFrame);
  }

  public stepAction(dt: number): void {
    if (this.currentPose !== 'shooting') return;
    const frames = characterFrames('kick');
    if (frames.length < 2) return;
    this.actionTick += dt;
    if (this.actionTick < 8) return;
    this.actionTick = 0;
    const raisedLeg = Math.min(2, frames.length - 1);
    if (this.actionFrame < raisedLeg) this.actionFrame += 1;
    this.useFrame(frames, this.actionFrame);
  }

  public redraw(): void {
    this.frameIndex = -1;
    this.draw(this.currentPose);
  }

  public draw(pose: StrikerPose): void {
    this.currentPose = pose;
    if (pose === 'dodging') {
      this.useFrame(characterFrames('dodge'), 0);
      return;
    }
    if (pose === 'shooting') {
      this.useFrame(characterFrames('kick'), 0);
      return;
    }
    if (pose === 'tackled') {
      this.useFrame(characterFrames('kick'), 0);
      return;
    }
    if (pose === 'celebrating') {
      this.useFrame(characterFrames('idle'), 0);
      return;
    }
    this.useFrame(characterFrames('dribble'), 0);
  }

  private useFrame(frames: Texture[], index: number): void {
    const texture = frames[index];
    if (!texture || index === this.frameIndex) return;
    this.frameIndex = index;
    this.view.texture = texture;
  }
}
