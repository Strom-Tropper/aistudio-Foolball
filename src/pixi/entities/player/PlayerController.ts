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

  /**
   * Calculate and update target coordinates from match GameState
   */
  public updateCoordinatesFromState(
    state: GameState,
    gridStartX: number,
    gridStartY: number,
    cellWidth: number,
    cellHeight: number,
    pitchWidth: number
  ): void {
    const centerY = gridStartY + (cellHeight * GRID_ROWS) / 2;

    const isBlocked =
      state.subState === 'BLOCKED' ||
      (state.phase === 'END' && state.lastRound?.result === 'BLOCKED_LOST');

    const isGoal =
      state.subState === 'GOAL' ||
      (state.phase === 'END' && state.lastRound?.result === 'GOAL_SCORED');

    if (isBlocked) {
      // RULE: When defender is encountered, player remains on the PREVIOUS successfully cleared cell!
      // The player must not move to a different row or teleport to the blocked cell.
      if (state.currentColumn === 0) {
        // Encounter occurred on line 1: player stays at kickoff start spot
        const startX = gridStartX - 28;
        this.targetPos = { x: startX, y: centerY };
      } else {
        const prevCol = state.currentColumn - 1;
        // Find the safe row that was previously cleared/bypassed in prevCol
        const prevRowIndex = state.grid[prevCol]?.findIndex(
          (c) => c.status === 'cleared' || c.status === 'bypassed' || c.resolvedWithCard === 'PASS'
        );
        const safeRow = prevRowIndex !== -1 ? prevRowIndex : (state.currentRow ?? 1);
        const px = gridStartX + prevCol * cellWidth + cellWidth / 2;
        const py = gridStartY + safeRow * cellHeight + cellHeight / 2;
        this.targetPos = { x: px, y: py };
      }
    } else if (isGoal) {
      // RULE: The player stops OUTSIDE the penalty area and NEVER enters the goal!
      // Only the ball travels into the net.
      const lastCol = GRID_COLS - 1;
      const lastRowIndex = state.grid[lastCol]?.findIndex(
        (c) => c.status === 'cleared' || c.status === 'bypassed' || c.resolvedWithCard === 'PASS'
      );
      const shootRow = lastRowIndex !== -1 ? lastRowIndex : (state.currentRow ?? 1);
      const px = gridStartX + lastCol * cellWidth + cellWidth / 2;
      const py = gridStartY + shootRow * cellHeight + cellHeight / 2;
      this.targetPos = { x: px, y: py };
    } else if (state.phase === 'STANDBY' || (state.phase === 'PLAYING' && state.currentColumn === 0)) {
      // Kickoff halfway stance
      const startX = gridStartX - 28;
      this.targetPos = { x: startX, y: centerY };
    } else if (state.currentColumn > 0 && state.currentColumn <= GRID_COLS) {
      // Dribbling safely at current defensive line
      const colIndex = Math.min(state.currentColumn - 1, GRID_COLS - 1);
      const rowIndex = state.currentRow !== null ? state.currentRow : 1;

      const px = gridStartX + colIndex * cellWidth + cellWidth / 2;
      const py = gridStartY + rowIndex * cellHeight + cellHeight / 2;
      this.targetPos = { x: px, y: py };
    } else if (state.currentColumn > GRID_COLS) {
      // Stay outside penalty box
      const lastCol = GRID_COLS - 1;
      const px = gridStartX + lastCol * cellWidth + cellWidth / 2;
      const py = gridStartY + (state.currentRow ?? 1) * cellHeight + cellHeight / 2;
      this.targetPos = { x: px, y: py };
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

    this.currentPos.x += dx * 0.16 * dt;
    this.currentPos.y += dy * 0.16 * dt;

    const isCelebrating = this.sprite.pose === 'celebrating';
    const isTackled = this.sprite.pose === 'tackled';
    const bobY = this.animator.getBobY(isMoving, isCelebrating, isTackled);

    this.sprite.container.position.set(this.currentPos.x, this.currentPos.y + bobY);

    if (isMoving && !isTackled) {
      this.effects.generateRunningTurf(this.currentPos.x, this.currentPos.y, particles);
    }
  }
}
