/**
 * GoalkeeperController - Coordinates goalkeeper positioning, reactions, and dive states
 * Responsibility: Coordinating goalkeeper behavior relative to ball and striker
 */

import { Container } from 'pixi.js';
import { GoalkeeperSprite } from './GoalkeeperSprite';
import { GoalkeeperAnimator } from './GoalkeeperAnimator';

export class GoalkeeperController {
  public readonly sprite: GoalkeeperSprite;
  public readonly animator: GoalkeeperAnimator;

  public currentY = 200;
  public targetY = 200;
  public posX = 0;

  constructor() {
    this.sprite = new GoalkeeperSprite();
    this.animator = new GoalkeeperAnimator();
  }

  public get container(): Container {
    return this.sprite.container;
  }

  public setPosition(x: number, y: number): void {
    this.posX = x;
    this.currentY = y;
    this.targetY = y;
    this.sprite.container.position.set(x, y);
  }

  public setDiving(isDiving: boolean): void {
    this.sprite.setDiving(isDiving);
  }

  /**
   * Update goalkeeper tracking position
   */
  public update(
    dt: number,
    netCenterY: number,
    strikerY: number,
    ballY: number,
    isPlaying: boolean,
    isShootingGoal: boolean
  ): void {
    this.animator.update(dt);
    this.targetY = this.animator.calculateAnticipationY(netCenterY, strikerY, ballY, isPlaying, isShootingGoal);

    this.currentY += (this.targetY - this.currentY) * 0.12 * dt;
    this.sprite.container.position.set(this.posX, this.currentY);
  }
}
