/**
 * AutoSystem - Coordinates autonomous attack plan progression and validation
 * Responsibility: Autonomous dribble path decisions, step sequencing, and auto-plan execution
 */

import { AutoPlan, GameState } from '../../types/game';
import { GRID_COLS, GRID_ROWS } from '../../logic/gameRules';

export class AutoSystem {
  /**
   * Validate if auto plan has a valid next step
   */
  public getNextAutoStep(state: GameState): { col: number; row: number } | null {
    if (!state.autoPlan.enabled || state.phase !== 'PLAYING' || state.subState !== 'DRIBBLING') {
      return null;
    }

    const nextCol = state.currentColumn;
    if (nextCol >= GRID_COLS) return null;

    const plannedRow = state.autoPlan.plannedRows[nextCol];
    if (plannedRow === null || plannedRow === undefined) {
      // If unassigned in plan, choose middle safe row
      return { col: nextCol, row: 1 };
    }

    return { col: nextCol, row: plannedRow };
  }

  /**
   * Generate a random zigzag auto-plan across all 7 lines
   */
  public generateRandomPlan(): number[] {
    const plan: number[] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      plan.push(Math.floor(Math.random() * GRID_ROWS));
    }
    return plan;
  }
}
