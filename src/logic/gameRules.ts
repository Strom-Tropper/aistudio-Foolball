/**
 * Football Dribble - Pure Game Rules & Mathematical Model
 */

import { CellPosition, GridCell, TacticalCard, TacticalCardType } from '../types/game';

export const GRID_ROWS = 4;
export const GRID_COLS = 7;
export const TURN_TIMEOUT_SECONDS = 30;

// Multiplier presets
export const MULTIPLIER_CONFIGS = {
  classic: {
    name: 'Classic Arcade (Brief Spec)',
    description: 'Conservative early multipliers scaling up to 7.26x on final goal.',
    multipliers: [1.00, 1.15, 1.29, 1.52, 1.88, 2.47, 3.60, 7.26],
  },
  fair: {
    name: 'Mathematically Calibrated (97% RTP)',
    description: 'Expected value calibrated to 97% RTP with 75% column survival rate.',
    // Fair multiplier at step k: 0.97 / (0.75^k)
    // k=1: 1.29x, k=2: 1.72x, k=3: 2.30x, k=4: 3.07x, k=5: 4.09x, k=6: 5.46x, k=7: 7.28x, Goal (k=8 bonus): 10.50x
    multipliers: [1.29, 1.72, 2.30, 3.07, 4.09, 5.46, 7.28, 10.50],
  },
};

export const TACTICAL_CARD_DEFS: Record<TacticalCardType, TacticalCard> = {
  PASS: {
    id: 'PASS',
    name: 'Pass & Move',
    shortDescription: 'Skip current defender',
    detailedDescription: 'Dispatches a high lofted pass over the charging defender, safely bypassing the current obstacle and advancing straight to the next line.',
    iconName: 'CornerUpRight',
    maxInventory: 3,
    count: 2,
    costInCredits: 50,
  },
  REPLAY: {
    id: 'REPLAY',
    name: 'VAR Review (Replay)',
    shortDescription: 'Retry current column',
    detailedDescription: 'Calls for video review on an unfair challenge. Rewinds the play and allows you to re-attempt the column once per match.',
    iconName: 'RotateCcw',
    maxInventory: 2,
    count: 1,
    costInCredits: 75,
  },
  SHIELD: {
    id: 'SHIELD',
    name: 'Tactical Foul Shield',
    shortDescription: 'Retain 50% payout on defeat',
    detailedDescription: 'Arms insurance on your dribble run. If stopped by a defender without recovery, you retain 50% of accrued cashout value.',
    iconName: 'Shield',
    maxInventory: 2,
    count: 1,
    costInCredits: 60,
  },
  SUBSTITUTE: {
    id: 'SUBSTITUTE',
    name: 'Super Sub',
    shortDescription: 'Replace player & continue',
    detailedDescription: 'Calls in a dynamic fresh striker from the bench to shake off the defensive tackle and resume attacking from this exact column.',
    iconName: 'Users',
    maxInventory: 3,
    count: 2,
    costInCredits: 80,
  },
  SCOUT: {
    id: 'SCOUT',
    name: 'Tactical Recon',
    shortDescription: 'Reveal next defender position',
    detailedDescription: 'The coaching staff radios in defensive positioning, revealing the exact cell occupied by the defender in the upcoming line.',
    iconName: 'Eye',
    maxInventory: 3,
    count: 2,
    costInCredits: 40,
  },
};

/**
 * Generate a pristine 4x7 grid with exactly one defender per column.
 */
export function generateDefendersGrid(): GridCell[][] {
  const grid: GridCell[][] = [];

  for (let c = 0; c < GRID_COLS; c++) {
    const colCells: GridCell[] = [];
    const defenderRow = Math.floor(Math.random() * GRID_ROWS);

    for (let r = 0; r < GRID_ROWS; r++) {
      colCells.push({
        col: c,
        row: r,
        hasDefender: r === defenderRow,
        status: 'hidden',
      });
    }
    grid.push(colCells);
  }

  return grid;
}

/**
 * Calculate current payout multiplier based on cleared columns.
 * clearedCount: 0 to 7. 8 if goal is scored.
 */
export function getMultiplierForCleared(clearedCount: number, configId: 'classic' | 'fair' = 'classic'): number {
  if (clearedCount <= 0) return 1.0;
  const config = MULTIPLIER_CONFIGS[configId] || MULTIPLIER_CONFIGS.classic;
  const index = Math.min(clearedCount - 1, config.multipliers.length - 1);
  return config.multipliers[index];
}

/**
 * Get goal multiplier for the final shooting sequence.
 */
export function getGoalMultiplier(configId: 'classic' | 'fair' = 'classic'): number {
  const config = MULTIPLIER_CONFIGS[configId] || MULTIPLIER_CONFIGS.classic;
  return config.multipliers[config.multipliers.length - 1];
}

/**
 * Calculate cumulative survival probability and RTP per step
 */
export function getProbabilityTable(configId: 'classic' | 'fair' = 'classic') {
  const table = [];
  const pPerColumn = 3 / 4; // 75%
  let cumProb = 1.0;

  for (let col = 1; col <= GRID_COLS; col++) {
    cumProb *= pPerColumn;
    const mult = getMultiplierForCleared(col, configId);
    const expectedValue = cumProb * mult;
    table.push({
      step: col,
      label: `Column ${col}`,
      multiplier: mult,
      stepProb: pPerColumn,
      cumProb: cumProb,
      rtp: expectedValue * 100,
    });
  }

  // Goal sequence (100% execution after column 7 or bonus shot)
  const goalMult = getGoalMultiplier(configId);
  table.push({
    step: 8,
    label: 'Goal!',
    multiplier: goalMult,
    stepProb: 1.0,
    cumProb: cumProb,
    rtp: cumProb * goalMult * 100,
  });

  return table;
}
