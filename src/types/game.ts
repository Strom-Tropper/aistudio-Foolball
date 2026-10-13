/**
 * Football Dribble - Core Domain Types and Interfaces
 */

export type MainPhase = 'STANDBY' | 'PLAYING' | 'END';

export type PlayingSubState = 'DRIBBLING' | 'BLOCKED' | 'CARD_SELECT' | 'AUTO' | 'GOAL';

export type TacticalCardType = 'PASS' | 'REPLAY' | 'SHIELD' | 'SUBSTITUTE' | 'SCOUT';

export interface TacticalCard {
  id: TacticalCardType;
  name: string;
  shortDescription: string;
  detailedDescription: string;
  iconName: string;
  maxInventory: number;
  count: number;
  costInCredits?: number;
}

export interface CellPosition {
  col: number; // 0 to 6 (Columns 1 to 7)
  row: number; // 0 to 3 (Rows 1 to 4)
}

export type CellStatus = 
  | 'hidden' 
  | 'scouted_safe' 
  | 'scouted_defender' 
  | 'cleared' 
  | 'tackled' 
  | 'bypassed';

export interface GridCell {
  col: number;
  row: number;
  hasDefender: boolean;
  status: CellStatus;
  selectedInAuto?: boolean;
  resolvedWithCard?: TacticalCardType; // Tracks card used to resolve encounter: 'PASS' | 'REPLAY' | 'SHIELD' | 'SUBSTITUTE'
}

export interface MultiplierStep {
  column: number; // 1 to 7, plus 8 for Goal
  label: string;
  multiplier: number;
  probability: number;
  cumulativeProb: number;
}

export interface MatchRound {
  id: string;
  timestamp: number;
  betAmount: number;
  currentColumn: number; // 0 (start) up to 7 (cleared all columns)
  currentRow: number | null;
  historySteps: { col: number; row: number; safe: boolean; cardUsed?: TacticalCardType }[];
  payoutMultiplier: number;
  potentialPayout: number;
  finalPayout: number;
  result: 'IN_PROGRESS' | 'CASHED_OUT' | 'GOAL_SCORED' | 'BLOCKED_LOST' | 'TIMEOUT_ABANDONED';
  cardsUsedThisRound: TacticalCardType[];
  shieldActive: boolean;
  replayUsed: boolean;
  activeScoutedColumn: number | null;
}

export interface AutoPlan {
  enabled: boolean;
  plannedRows: (number | null)[]; // row index for cols 0..6
  currentStepIndex: number;
}

export interface EconomyConfig {
  houseEdge: number; // e.g. 0.03 for 3% edge
  multipliers: number[]; // 7 columns + 1 goal
  minBet: number;
  maxBet: number;
  defaultBet: number;
  turnTimeoutSeconds: number;
}

export interface PlayerStats {
  matchesPlayed: number;
  goalsScored: number;
  cashoutsCount: number;
  lossesCount: number;
  totalWagered: number;
  totalWon: number;
  highestMultiplier: number;
  longestDribbleRun: number;
}

export interface GameState {
  phase: MainPhase;
  subState: PlayingSubState;
  balance: number;
  bet: number;
  timer: number; // 30s countdown
  timerRunning: boolean;
  grid: GridCell[][]; // [col][row]
  currentColumn: number; // 0 to 7. 0 means at start line (before Col 1). 7 means Column 7 passed -> GOAL!
  currentRow: number | null;
  cardInventory: Record<TacticalCardType, number>;
  cardsUsedThisMatch: TacticalCardType[];
  isShieldArmed: boolean;
  replayUsedThisMatch: boolean;
  scoutedDefenderPos: CellPosition | null;
  autoPlan: AutoPlan;
  lastRound: MatchRound | null;
  history: MatchRound[];
  stats: PlayerStats;
  soundEnabled: boolean;
  activeConfigId: 'classic' | 'fair';
}
