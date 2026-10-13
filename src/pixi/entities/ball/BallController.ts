/**
 * BallController - Coordinates ball position, target destination, and behavior
 * Responsibility: Coordinating ball behavior between sprite, animator, and effects
 */

import { Container } from 'pixi.js';
import { BallSprite } from './BallSprite';
import { BallAnimator } from './BallAnimator';
import { BallEffects } from './BallEffects';
import { ActionParticle } from '../../systems/AnimationSystem';

export class BallController {
  public readonly sprite: BallSprite;
  public readonly animator: BallAnimator;
  public readonly effects: BallEffects;

  public currentPos = { x: 0, y: 0 };
  public targetPos = { x: 0, y: 0 };

  constructor() {
    this.sprite = new BallSprite();
    this.animator = new BallAnimator();
    this.effects = new BallEffects();
  }

  public get container(): Container {
    return this.sprite.container;
  }

  public setPosition(x: number, y: number): void {
    this.currentPos.x = x;
    this.currentPos.y = y;
    this.targetPos.x = x;
    this.targetPos.y = y;
    this.sprite.container.position.set(x, y);
  }

  public setTarget(x: number, y: number): void {
    this.targetPos.x = x;
    this.targetPos.y = y;
  }

  /**
   * Shoot the ball towards the goal mouth net
   */
  public shootAtGoal(goalX: number, goalY: number): void {
    this.animator.startGoalShot(this.currentPos.x, this.currentPos.y, goalX, goalY);
  }

  /**
   * Tick update: lerp towards target, calculate rotation, and generate trail effects
   */
  public update(dt: number, particles: ActionParticle[], onShotComplete?: () => void): void {
    if (this.animator.isShotActive) {
      const shot = this.animator.stepGoalShot(dt);
      this.currentPos.x = shot.x;
      this.currentPos.y = shot.y;
      this.animator.updateRotation(true, dt);
      this.effects.generateShotSparks(this.currentPos.x, this.currentPos.y, particles);

      if (shot.isComplete && onShotComplete) {
        onShotComplete();
      }
    } else {
      const dx = this.targetPos.x - this.currentPos.x;
      const dy = this.targetPos.y - this.currentPos.y;
      const isMoving = Math.hypot(dx, dy) > 2;

      this.currentPos.x += dx * 0.22 * dt;
      this.currentPos.y += dy * 0.22 * dt;

      this.animator.updateRotation(isMoving, dt);

      if (isMoving) {
        this.effects.generateDribbleTrail(this.currentPos.x, this.currentPos.y, particles);
      }
    }

    this.sprite.container.position.set(this.currentPos.x, this.currentPos.y);
    this.sprite.container.rotation = this.animator.currentRotation;
  }
}
