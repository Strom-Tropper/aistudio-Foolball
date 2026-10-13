/**
 * Football Dribble - State Machine & Phase Transitions
 * 
 * Top-Level Phases: STANDBY | PLAYING | END
 * PLAYING Sub-States: DRIBBLING | BLOCKED | CARD_SELECT | AUTO | GOAL
 * 
 * Rules:
 * - BLOCKED is strictly a PLAYING sub-state, NEVER a top-level phase.
 * - Cashout allowed only when currentColumn >= 1.
 * - Bet changes locked during PLAYING.
 */

import { MainPhase, PlayingSubState, GameState, MatchRound, TacticalCardType } from '../types/game';
import { generateDefendersGrid, getMultiplierForCleared, getGoalMultiplier, GRID_COLS, TURN_TIMEOUT_SECONDS } from './gameRules';

export class FootballStateMachine {
  /**
   * Validate if a transition from (currentPhase, currentSubState) to (newPhase, newSubState) is legal.
   */
  static canTransition(
    currentPhase: MainPhase,
    currentSubState: PlayingSubState,
    nextPhase: MainPhase,
    nextSubState: PlayingSubState
  ): boolean {
    if (currentPhase === 'STANDBY') {
      return nextPhase === 'PLAYING' && (nextSubState === 'DRIBBLING' || nextSubState === 'AUTO');
    }

    if (currentPhase === 'PLAYING') {
      // Sub-state transitions within PLAYING
      if (nextPhase === 'PLAYING') {
        switch (currentSubState) {
          case 'DRIBBLING':
            return nextSubState === 'BLOCKED' || nextSubState === 'AUTO' || nextSubState === 'GOAL';
          case 'BLOCKED':
            return nextSubState === 'CARD_SELECT' || nextSubState === 'DRIBBLING';
          case 'CARD_SELECT':
            return nextSubState === 'DRIBBLING' || nextSubState === 'BLOCKED';
          case 'AUTO':
            return nextSubState === 'BLOCKED' || nextSubState === 'DRIBBLING' || nextSubState === 'GOAL';
          case 'GOAL':
            return false; // Can only transition from GOAL to END
        }
      }

      // Transition from PLAYING to END
      if (nextPhase === 'END') {
        return (
          currentSubState === 'DRIBBLING' || // Cashout or timeout
          currentSubState === 'BLOCKED' ||    // Unresolved defender
          currentSubState === 'GOAL'          // Completed celebration
        );
      }
    }

    if (currentPhase === 'END') {
      return nextPhase === 'STANDBY' || nextPhase === 'PLAYING';
    }

    return false;
  }

  /**
   * Start a new match from STANDBY or END.
   */
  static startMatch(state: GameState): GameState {
    if (state.phase !== 'STANDBY' && state.phase !== 'END') return state;
    if (state.bet <= 0 || state.balance < state.bet) return state;

    const newGrid = generateDefendersGrid();
    const newBalance = state.balance - state.bet;

    return {
      ...state,
      phase: 'PLAYING',
      subState: 'DRIBBLING',
      balance: newBalance,
      grid: newGrid,
      currentColumn: 0,
      currentRow: null,
      timer: TURN_TIMEOUT_SECONDS,
      timerRunning: true,
      cardsUsedThisMatch: [],
      isShieldArmed: false,
      replayUsedThisMatch: false,
      scoutedDefenderPos: null,
      stats: {
        ...state.stats,
        matchesPlayed: state.stats.matchesPlayed + 1,
        totalWagered: state.stats.totalWagered + state.bet,
      },
    };
  }

  /**
   * Reset to STANDBY from END phase.
   */
  static resetToStandby(state: GameState): GameState {
    return {
      ...state,
      phase: 'STANDBY',
      subState: 'DRIBBLING',
      currentColumn: 0,
      currentRow: null,
      grid: generateDefendersGrid(),
      timer: TURN_TIMEOUT_SECONDS,
      timerRunning: false,
      cardsUsedThisMatch: [],
      isShieldArmed: false,
      replayUsedThisMatch: false,
      scoutedDefenderPos: null,
    };
  }

  /**
   * Cash out the active round.
   */
  static cashOut(state: GameState, isAutoTimeout = false): GameState {
    if (state.phase !== 'PLAYING') return state;
    if (state.currentColumn < 1) return state; // Must pass at least one column

    const mult = getMultiplierForCleared(state.currentColumn, state.activeConfigId);
    const payout = Math.round(state.bet * mult * 100) / 100;
    const newBalance = Math.round((state.balance + payout) * 100) / 100;

    const roundSummary: MatchRound = {
      id: 'match_' + Date.now(),
      timestamp: Date.now(),
      betAmount: state.bet,
      currentColumn: state.currentColumn,
      currentRow: state.currentRow,
      historySteps: [],
      payoutMultiplier: mult,
      potentialPayout: payout,
      finalPayout: payout,
      result: 'CASHED_OUT',
      cardsUsedThisRound: [...state.cardsUsedThisMatch],
      shieldActive: state.isShieldArmed,
      replayUsed: state.replayUsedThisMatch,
      activeScoutedColumn: null,
    };

    return {
      ...state,
      phase: 'END',
      subState: 'DRIBBLING',
      balance: newBalance,
      timerRunning: false,
      lastRound: roundSummary,
      history: [roundSummary, ...state.history].slice(0, 50),
      stats: {
        ...state.stats,
        cashoutsCount: state.stats.cashoutsCount + 1,
        totalWon: state.stats.totalWon + payout,
        highestMultiplier: Math.max(state.stats.highestMultiplier, mult),
        longestDribbleRun: Math.max(state.stats.longestDribbleRun, state.currentColumn),
      },
    };
  }

  /**
   * Concede or fail when defender is unresolved.
   */
  static failMatch(state: GameState): GameState {
    if (state.phase !== 'PLAYING') return state;

    // Check shield
    let finalPayout = 0;
    let mult = 0;
    if (state.isShieldArmed && state.currentColumn >= 1) {
      mult = getMultiplierForCleared(state.currentColumn, state.activeConfigId);
      finalPayout = Math.round((state.bet * mult * 0.5) * 100) / 100;
    }

    const newBalance = Math.round((state.balance + finalPayout) * 100) / 100;

    const roundSummary: MatchRound = {
      id: 'match_' + Date.now(),
      timestamp: Date.now(),
      betAmount: state.bet,
      currentColumn: state.currentColumn,
      currentRow: state.currentRow,
      historySteps: [],
      payoutMultiplier: mult,
      potentialPayout: 0,
      finalPayout: finalPayout,
      result: 'BLOCKED_LOST',
      cardsUsedThisRound: [...state.cardsUsedThisMatch],
      shieldActive: state.isShieldArmed,
      replayUsed: state.replayUsedThisMatch,
      activeScoutedColumn: null,
    };

    return {
      ...state,
      phase: 'END',
      subState: 'BLOCKED',
      balance: newBalance,
      timerRunning: false,
      lastRound: roundSummary,
      history: [roundSummary, ...state.history].slice(0, 50),
      stats: {
        ...state.stats,
        lossesCount: state.stats.lossesCount + 1,
        totalWon: state.stats.totalWon + finalPayout,
        longestDribbleRun: Math.max(state.stats.longestDribbleRun, state.currentColumn),
      },
    };
  }

  /**
   * Final goal completion and automatic payout.
   */
  static completeGoal(state: GameState): GameState {
    const goalMult = getGoalMultiplier(state.activeConfigId);
    const payout = Math.round(state.bet * goalMult * 100) / 100;
    const newBalance = Math.round((state.balance + payout) * 100) / 100;

    const roundSummary: MatchRound = {
      id: 'match_' + Date.now(),
      timestamp: Date.now(),
      betAmount: state.bet,
      currentColumn: GRID_COLS,
      currentRow: state.currentRow,
      historySteps: [],
      payoutMultiplier: goalMult,
      potentialPayout: payout,
      finalPayout: payout,
      result: 'GOAL_SCORED',
      cardsUsedThisRound: [...state.cardsUsedThisMatch],
      shieldActive: state.isShieldArmed,
      replayUsed: state.replayUsedThisMatch,
      activeScoutedColumn: null,
    };

    return {
      ...state,
      phase: 'END',
      subState: 'GOAL',
      balance: newBalance,
      timerRunning: false,
      lastRound: roundSummary,
      history: [roundSummary, ...state.history].slice(0, 50),
      stats: {
        ...state.stats,
        goalsScored: state.stats.goalsScored + 1,
        totalWon: state.stats.totalWon + payout,
        highestMultiplier: Math.max(state.stats.highestMultiplier, goalMult),
        longestDribbleRun: GRID_COLS,
      },
    };
  }
}
