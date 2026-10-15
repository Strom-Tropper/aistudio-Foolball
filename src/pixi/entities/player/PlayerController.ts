/**
 * PlayerController - Coordinates striker movement, target coordinates, and visual states
 * Responsibility: Coordinating striker hero behavior across systems
 */

import { Container } from 'pixi.js';
import { PlayerSprite, StrikerPose } from './PlayerSprite';
import { PlayerAnimator } from './PlayerAnimator';
import { PlayerEffects } from './PlayerEffects';
import { ActionParticle } from '../../systems/AnimationSystem';
import { GameState } from '../../../types/game';
import { GRID_COLS, GRID_ROWS } from '../../../logic/gameRules';

export class PlayerController {
  public readonly sprite: PlayerSprite;
  public readonly animator: PlayerAnimator;
  public readonly effects: PlayerEffects;

  public currentPos = { x: 0, y: 0 };
  public targetPos = { x: 0, y: 0 };
  public moving = false;

  constructor() {
    this.sprite = new PlayerSprite();
    this.animator = new PlayerAnimator();
    this.effects = new PlayerEffects();
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

  public setPose(pose: StrikerPose): void {
    this.sprite.setPose(pose);
  }

  public playDodge(): void {
    this.sprite.playDodge();
  }

  /**
   * Calculate and update target coordinates from match GameState
   */
  public updateCoordinatesFromState(
    state: GameState,
    gridStartX: number,
    gridStartY: number,
    cellWidth: number,
    cellHeight: number
  ): void {
    const centerY = gridStartY + (cellHeight * GRID_ROWS) / 2;
    const stand = (col: number, row: number) => ({
      x: gridStartX + col * cellWidth + cellWidth / 2,
      y: gridStartY + row * cellHeight + cellHeight / 2 + 18,
    });

    const isBlocked =
      state.subState === 'BLOCKED' ||
      (state.phase === 'END' && state.lastRound?.result === 'BLOCKED_LOST');

    const isGoal =
      state.subState === 'GOAL' ||
      (state.phase === 'END' && state.lastRound?.result === 'GOAL_SCORED');

    const substituteRow =
      state.subState === 'DRIBBLING'
        ? state.grid[state.currentColumn]?.findIndex((c) => c.resolvedWithCard === 'SUBSTITUTE')
        : -1;

    const replayOpen =
      state.subState === 'DRIBBLING' &&
      (state.grid[state.currentColumn]?.some((c) => c.resolvedWithCard === 'REPLAY') ?? false);

    if (isBlocked || replayOpen) {
      if (state.currentColumn === 0) {
        const startX = gridStartX - 28;
        this.targetPos = { x: startX, y: centerY };
      } else {
        const prevCol = state.currentColumn - 1;
        const prevRowIndex = state.grid[prevCol]?.findIndex(
          (c) => c.status === 'cleared' || c.status === 'bypassed' || c.resolvedWithCard === 'PASS'
        );
        const safeRow = prevRowIndex !== -1 ? prevRowIndex : (state.currentRow ?? 1);
        this.targetPos = stand(prevCol, safeRow);
      }
    } else if (substituteRow !== undefined && substituteRow !== -1) {
      this.targetPos = stand(state.currentColumn, substituteRow);
    } else if (isGoal) {
      const lastCol = GRID_COLS - 1;
      const lastRowIndex = state.grid[lastCol]?.findIndex(
        (c) => c.status === 'cleared' || c.status === 'bypassed' || c.resolvedWithCard === 'PASS'
      );
      const shootRow = lastRowIndex !== -1 ? lastRowIndex : (state.currentRow ?? 1);
      this.targetPos = stand(lastCol, shootRow);
    } else if (state.phase === 'STANDBY' || (state.phase === 'PLAYING' && state.currentColumn === 0)) {
      const startX = gridStartX - 28;
      this.targetPos = { x: startX, y: centerY };
    } else if (state.currentColumn > 0 && state.currentColumn <= GRID_COLS) {
      const colIndex = Math.min(state.currentColumn - 1, GRID_COLS - 1);
      const rowIndex = state.currentRow !== null ? state.currentRow : 1;
      this.targetPos = stand(colIndex, rowIndex);
    } else if (state.currentColumn > GRID_COLS) {
      const lastCol = GRID_COLS - 1;
      this.targetPos = stand(lastCol, state.currentRow ?? 1);
    }

    // Teleport if too far (e.g. game reset)
    const dist = Math.hypot(this.targetPos.x - this.currentPos.x, this.targetPos.y - this.currentPos.y);
    if (dist > 250) {
      this.currentPos = { ...this.targetPos };
    }
  }

  /**
   * Tick update: lerp towards target, calculate bobbing, generate running turf particles
   */
  public update(dt: number, particles: ActionParticle[]): void {
    this.animator.update(dt);

    const dx = this.targetPos.x - this.currentPos.x;
    const dy = this.targetPos.y - this.currentPos.y;
    const isMoving = Math.hypot(dx, dy) > 2;
    this.moving = isMoving;

    this.currentPos.x += dx * 0.16 * dt;
    this.currentPos.y += dy * 0.16 * dt;

    const isCelebrating = this.sprite.pose === 'celebrating';
    const isTackled = this.sprite.pose === 'tackled';
    const bobY = this.animator.getBobY(isMoving, isCelebrating, isTackled);
    const stride = Math.sin(this.animator.tick * 3.4);

    if (this.sprite.pose === 'dodging') {
      this.sprite.stepDodge(dt, isMoving);
    } else if (this.sprite.pose === 'shooting') {
      this.sprite.stepAction(dt);
    }
    if (this.sprite.pose === 'running') {
      this.sprite.setStride(isMoving ? stride : null);
    }

    this.sprite.container.scale.set(1, 1);
    this.sprite.container.rotation = 0;
    this.sprite.container.position.set(
      Math.round(this.currentPos.x),
      Math.round(this.currentPos.y + bobY)
    );

    if (isMoving && !isTackled) {
      this.effects.generateRunningTurf(this.currentPos.x, this.currentPos.y, particles);
    }
  }
}
