/**
 * CashoutSystem - Handles multiplier progression, potential payout calculation, and shield insurance retention
 * Responsibility: Game economy calculations for cashout, goal bonuses, and partial payout shields
 */

import { getMultiplierForCleared, getGoalMultiplier } from '../../logic/gameRules';

export class CashoutSystem {
  /**
   * Calculate cashout value for current column
   */
  public calculateCashout(bet: number, currentColumn: number, configId: 'classic' | 'fair' = 'classic'): number {
    if (currentColumn < 1) return 0;
    const mult = getMultiplierForCleared(currentColumn, configId);
    return Math.round(bet * mult * 100) / 100;
  }

  /**
   * Calculate potential goal payout
   */
  public calculateGoalPayout(bet: number, configId: 'classic' | 'fair' = 'classic'): number {
    const mult = getGoalMultiplier(configId);
    return Math.round(bet * mult * 100) / 100;
  }

  /**
   * Calculate 50% shielded retention payout on tackle block
   */
  public calculateShieldRetention(bet: number, currentColumn: number, configId: 'classic' | 'fair' = 'classic'): number {
    if (currentColumn < 1) return 0;
    const fullPayout = this.calculateCashout(bet, currentColumn, configId);
    return Math.round(fullPayout * 0.5 * 100) / 100;
  }

  /**
   * Get multiplier for a specific defensive line
   */
  public getLineMultiplier(lineIndex: number, configId: 'classic' | 'fair' = 'classic'): number {
    return getMultiplierForCleared(lineIndex, configId);
  }
}
