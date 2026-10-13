/**
 * BettingControls - Real-time stake adjustment, Cashout, and Auto triggers
 */

import React from 'react';
import { GameState } from '../types/game';
import { getMultiplierForCleared, getGoalMultiplier } from '../logic/gameRules';
import { Play, DollarSign, Zap, RotateCcw, ShieldAlert } from 'lucide-react';

interface BettingControlsProps {
  gameState: GameState;
  onBetChange: (amount: number) => void;
  onPlayClick: () => void;
  onCashoutClick: () => void;
  onAutoToggle: () => void;
  onConfigChange: (configId: 'classic' | 'fair') => void;
}

const PRESET_CHIPS = [10, 25, 50, 100, 250];

export const BettingControls: React.FC<BettingControlsProps> = ({
  gameState,
  onBetChange,
  onPlayClick,
  onCashoutClick,
  onAutoToggle,
  onConfigChange,
}) => {
  const isStandby = gameState.phase === 'STANDBY';
  const isPlaying = gameState.phase === 'PLAYING';
  const isEnd = gameState.phase === 'END';

  const currentMult =
    gameState.currentColumn >= 7
      ? getGoalMultiplier(gameState.activeConfigId)
      : gameState.currentColumn > 0
      ? getMultiplierForCleared(gameState.currentColumn, gameState.activeConfigId)
      : 1.0;

  const currentCashoutVal = Math.round(gameState.bet * currentMult * 100) / 100;
  const canCashout = isPlaying && gameState.currentColumn >= 1 && gameState.subState !== 'GOAL';
  const canPlay = (isStandby || isEnd) && gameState.bet > 0 && gameState.balance >= gameState.bet;

  const isBettingUnlocked = !isPlaying;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Stake Adjustment Section (Locked only in PLAYING) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Wager Stake
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Ruleset:</span>
              <select
                disabled={!isBettingUnlocked}
                value={gameState.activeConfigId}
                onChange={(e) => onConfigChange(e.target.value as 'classic' | 'fair')}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300 disabled:opacity-50"
              >
                <option value="classic">Classic Arcade (7.26x Goal)</option>
                <option value="fair">Calibrated 97% RTP (10.5x Goal)</option>
              </select>
            </div>
          </div>

          {/* Stepper Input & Quick Modifiers */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                $
              </span>
              <input
                type="number"
                min="1"
                max={Math.max(1, gameState.balance)}
                step="5"
                disabled={!isBettingUnlocked}
                value={gameState.bet}
                onChange={(e) => onBetChange(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm font-mono font-bold text-slate-100 disabled:opacity-50 disabled:bg-slate-950/60 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Halve / Double / Max */}
            <div className="flex items-center gap-1">
              <button
                disabled={!isBettingUnlocked || gameState.bet <= 1}
                onClick={() => onBetChange(Math.max(1, Math.floor(gameState.bet / 2)))}
                className="px-2.5 py-2 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
                title="Half Bet"
              >
                ½
              </button>
              <button
                disabled={!isBettingUnlocked || gameState.bet * 2 > gameState.balance}
                onClick={() => onBetChange(Math.min(gameState.balance, gameState.bet * 2))}
                className="px-2.5 py-2 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
                title="Double Bet"
              >
                2×
              </button>
              <button
                disabled={!isBettingUnlocked || gameState.balance <= 0}
                onClick={() => onBetChange(gameState.balance)}
                className="px-2.5 py-2 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
                title="All In"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Predefined Chip Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESET_CHIPS.map((chip) => (
              <button
                key={chip}
                disabled={!isBettingUnlocked || chip > gameState.balance}
                onClick={() => onBetChange(chip)}
                className={`px-3 py-1 text-xs font-mono rounded-md border transition-colors ${
                  gameState.bet === chip && isBettingUnlocked
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 disabled:opacity-40'
                }`}
              >
                +${chip}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Primary Action & Cashout Engine */}
        <div className="lg:col-span-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Main Action Button (Play / Start Round) */}
          <div className="flex-1">
            {isStandby || isEnd ? (
              <button
                disabled={!canPlay}
                onClick={onPlayClick}
                className="w-full py-4 px-6 rounded-xl font-bold font-['Barlow_Condensed'] text-lg tracking-wider uppercase text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2"
              >
                <Play size={20} className="fill-white" />
                <span>
                  {isEnd ? `Play Again ($${gameState.bet})` : `Kick Off Match ($${gameState.bet})`}
                </span>
              </button>
            ) : (
              /* CASHOUT BUTTON (Active in PLAYING) */
              <button
                disabled={!canCashout}
                onClick={onCashoutClick}
                className={`w-full py-4 px-6 rounded-xl font-bold font-['Barlow_Condensed'] text-lg tracking-wider uppercase transition-all shadow-lg flex flex-col items-center justify-center leading-tight ${
                  canCashout
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/60 active:scale-[0.99]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign size={20} />
                  <span>
                    {canCashout
                      ? `CASHOUT $${currentCashoutVal.toFixed(2)}`
                      : 'CASHOUT (PASS LINE 1)'}
                  </span>
                </div>
                {canCashout && (
                  <span className="text-xs font-mono font-normal opacity-90">
                    Accrued Multiplier: {currentMult.toFixed(2)}x
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Auto Mode & Planning Toggle */}
          <div className="sm:w-36">
            <button
              onClick={onAutoToggle}
              className={`w-full py-4 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                gameState.autoPlan.enabled
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
              title="Pre-plan automatic dribble steps"
            >
              <Zap size={15} className={gameState.autoPlan.enabled ? 'fill-sky-400 text-sky-400' : ''} />
              <span>{gameState.autoPlan.enabled ? 'Auto Active' : 'Auto Dribble'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
