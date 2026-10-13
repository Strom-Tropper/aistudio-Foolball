/**
 * DefenderController - Coordinates defender obstacles, visibility rules, and confrontation events
 * Responsibility: Coordinating defender behavior, confrontation rush, and resolution visual markers
 */

import { Container } from 'pixi.js';
import { DefenderSprite, DefenderPose } from './DefenderSprite';
import { DefenderAnimator, TackleSequenceState } from './DefenderAnimator';
import { GridCell, GameState } from '../../../types/game';

export class DefenderController {
  public readonly tacklingSprite: DefenderSprite;
  public readonly animator: DefenderAnimator;

  public tacklingCol = -1;
  public tacklingRow = -1;
  public onTackleCompleteCallback: (() => void) | null = null;

  constructor() {
    this.tacklingSprite = new DefenderSprite();
    this.animator = new DefenderAnimator();
    this.tacklingSprite.container.visible = false;
  }

  public get container(): Container {
    return this.tacklingSprite.container;
  }

  /**
   * Determine the appropriate pose for a defender in a cell based on game state & match resolution history
   */
  public getPoseForCell(
    cell: GridCell | null,
    isBlockedHere: boolean,
    isMatchEnded: boolean,
    isPastCol: boolean
  ): DefenderPose {
    // 1. Check if cell was resolved using a tactical card
    if (cell?.resolvedWithCard === 'PASS') {
      return 'beaten';
    }
    if (cell?.resolvedWithCard === 'REPLAY') {
      return 'replay';
    }
    if (cell?.resolvedWithCard === 'SHIELD') {
      return 'shield';
    }
    if (cell?.resolvedWithCard === 'SUBSTITUTE') {
      return 'substitute';
    }
    if (cell?.status === 'bypassed') {
      return 'beaten';
    }

    // 2. Active confrontation tackle block
    if (isBlockedHere) {
      return 'tackle';
    }

    // 3. Match ended reveal
    if (isMatchEnded && isPastCol) {
      return 'beaten';
    }

    return 'guard';
  }

  /**
   * Start a confrontation sequence: defender rushes out of the hidden lane to tackle the player
   */
  public triggerConfrontation(
    col: number,
    row: number,
    cellCenterX: number,
    cellCenterY: number,
    onComplete: () => void
  ): void {
    this.tacklingCol = col;
    this.tacklingRow = row;
    this.onTackleCompleteCallback = onComplete;

    this.tacklingSprite.container.visible = true;
    this.tacklingSprite.container.position.set(cellCenterX + 35, cellCenterY);
    this.tacklingSprite.setPose('guard');

    this.animator.startTackle(cellCenterX + 35, cellCenterX + 8);
  }

  /**
   * Step the tackle sequence
   */
  public updateTackle(dt: number, onImpact: () => void): TackleSequenceState {
    const step = this.animator.stepTackle(dt);

    if (this.animator.shouldTriggerImpact) {
      this.tacklingSprite.setPose('tackle');
      onImpact();
    }

    this.tacklingSprite.container.position.x = step.currentDefenderX;

    if (step.phase === 'done') {
      this.tacklingSprite.container.visible = false;
      const cb = this.onTackleCompleteCallback;
      this.onTackleCompleteCallback = null;
      if (cb) {
        cb();
      }
    }

    return step;
  }
}
