/**
 * RightActionPanel - Tactical Football Match Decision Station
 * 
 * Sits on the right side of the field (~30% width).
 * Focused strictly on actionable information without redundant banners or ladders:
 * 
 * - STANDBY: Wager stake, Quick bet buttons, Estimated Goal Payout, Kick Off button
 * - PLAYING: Current Line, Current Multiplier, Current Cashout Value, Timer, Cashout button
 * - BLOCKED: Tactical card actions (Pass, Replay, Shield, Substitute), Concede
 * - GOAL: Final payout, Play Again, Modify Stake
 */

import React from 'react';
import { GameState, TacticalCardType } from '../types/game';
import {
  getMultiplierForCleared,
  getGoalMultiplier,
  GRID_COLS,
  TURN_TIMEOUT_SECONDS,
} from '../logic/gameRules';
import {
  Play,
  DollarSign,
  RotateCcw,
  Shield,
  Eye,
  CornerUpRight,
  Users,
  Flag,
  Trophy,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  Timer as TimerIcon,
  Flame,
} from 'lucide-react';
import pixelDefenderUrl from '../assets/images/pixel_defender_tackle_1791797239575.jpg';

interface RightActionPanelProps {
  gameState: GameState;
  onBetChange: (amount: number) => void;
  onPlayClick: () => void;
  onCashoutClick: () => void;
  onUseCard: (cardType: TacticalCardType) => void;
  onConcede: () => void;
  onAdjustBet: () => void;
  onOpenAutoModal: () => void;
  onConfigChange: (configId: 'classic' | 'fair') => void;
  onResetBankroll?: () => void;
}

const PRESET_CHIPS = [5, 10, 25, 50, 100, 250];

export const RightActionPanel: React.FC<RightActionPanelProps> = ({
  gameState,
  onBetChange,
  onPlayClick,
  onCashoutClick,
  onUseCard,
  onConcede,
  onAdjustBet,
  onOpenAutoModal,
  onConfigChange,
  onResetBankroll,
}) => {
  const isStandby = gameState.phase === 'STANDBY';
  const isPlaying = gameState.phase === 'PLAYING';
  const isBlocked = isPlaying && gameState.subState === 'BLOCKED';
  const isGoal = isPlaying && gameState.subState === 'GOAL';
  const isEnd = gameState.phase === 'END';

  const goalMult = getGoalMultiplier(gameState.activeConfigId);
  const currentMult =
    gameState.currentColumn >= GRID_COLS
      ? goalMult
      : gameState.currentColumn > 0
      ? getMultiplierForCleared(gameState.currentColumn, gameState.activeConfigId)
      : 1.0;

  const currentCashoutVal = Math.round(gameState.bet * currentMult * 100) / 100;
  const canCashout = isPlaying && gameState.currentColumn >= 1 && !isBlocked && !isGoal;
  const canPlay = (isStandby || isEnd) && gameState.bet > 0 && gameState.balance >= gameState.bet;

  const lastRound = gameState.lastRound;

  // Tactical card inventory counts
  const passCount = gameState.cardInventory.PASS || 0;
  const subCount = gameState.cardInventory.SUBSTITUTE || 0;
  const replayCount = gameState.cardInventory.REPLAY || 0;
  const shieldCount = gameState.cardInventory.SHIELD || 0;
  const scoutCount = gameState.cardInventory.SCOUT || 0;
  const hasReplayUsed = gameState.replayUsedThisMatch;

  const currentLine = gameState.currentColumn + 1;
  const shieldProtectedAmount = Math.round(gameState.bet * currentMult * 0.5 * 100) / 100;

  return (
    <div className="w-full h-full bg-slate-900/95 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between">
      {/* ========================================================= */}
      {/* STATE 1: BLOCKED CONFRONTATION PANEL                      */}
      {/* Required: Tactical Card Actions (Pass, Replay, Shield,    */}
      {/*           Substitute), Concede                            */}
      {/* ========================================================= */}
      {isBlocked ? (
        <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-red-500/30">
              <img
                src={pixelDefenderUrl}
                alt="Tackling Defender"
                className="w-12 h-12 rounded-lg object-cover border-2 border-red-500 shadow-md shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-red-400 font-bold flex items-center gap-1">
                  <Flame size={12} className="text-red-400" /> TACKLE DETECTED
                </span>
                <h3 className="text-xl font-bold text-white font-['Barlow_Condensed'] leading-tight">
                  BLOCKED ON LINE {currentLine}
                </h3>
              </div>
            </div>

            {/* Tactical Card Options */}
            <div className="space-y-2">
              {/* Pass */}
              <button
                disabled={passCount <= 0}
                onClick={() => onUseCard('PASS')}
                className="w-full p-2.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/60 disabled:opacity-30 disabled:cursor-not-allowed text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                    <CornerUpRight size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 uppercase tracking-wide">PASS</div>
                    <div className="text-[10px] text-slate-400">Bypass defender to Line {currentLine + 1}</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                  {passCount}
                </span>
              </button>

              {/* Replay */}
              <button
                disabled={replayCount <= 0 || hasReplayUsed}
                onClick={() => onUseCard('REPLAY')}
                className="w-full p-2.5 rounded-lg bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/60 disabled:opacity-30 disabled:cursor-not-allowed text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
                    <RotateCcw size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 uppercase tracking-wide">REPLAY</div>
                    <div className="text-[10px] text-slate-400">Retry Line {currentLine} challenge</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-600 text-white">
                  {hasReplayUsed ? 'USED' : replayCount}
                </span>
              </button>

              {/* Shield */}
              <button
                disabled={shieldCount <= 0 || gameState.isShieldArmed}
                onClick={() => onUseCard('SHIELD')}
                className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between group ${
                  gameState.isShieldArmed
                    ? 'bg-amber-950/80 border-amber-500/70 text-amber-200'
                    : 'bg-amber-950/50 hover:bg-amber-900/60 border-amber-500/40 disabled:opacity-30 disabled:cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                    <Shield size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 uppercase tracking-wide">SHIELD</div>
                    <div className="text-[10px] text-slate-400">
                      {gameState.isShieldArmed
                        ? `Armed ($${shieldProtectedAmount.toFixed(2)} protected)`
                        : 'Preserve 50% payout on defeat'}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-600 text-white">
                  {gameState.isShieldArmed ? 'ARMED' : shieldCount}
                </span>
              </button>

              {/* Substitute */}
              <button
                disabled={subCount <= 0}
                onClick={() => onUseCard('SUBSTITUTE')}
                className="w-full p-2.5 rounded-lg bg-sky-950/70 hover:bg-sky-900/80 border border-sky-500/60 disabled:opacity-30 disabled:cursor-not-allowed text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-sky-500/20 text-sky-400 group-hover:scale-105 transition-transform">
                    <Users size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 uppercase tracking-wide">SUBSTITUTE</div>
                    <div className="text-[10px] text-slate-400">Deploy fresh striker & continue</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-600 text-white">
                  {subCount}
                </span>
              </button>
            </div>
          </div>

          {/* Concede */}
          <div className="pt-2">
            <button
              onClick={onConcede}
              className="w-full py-2.5 px-3 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-950/50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Flag size={14} />
              <span>
                {gameState.isShieldArmed && gameState.currentColumn >= 1
                  ? `Concede ($${shieldProtectedAmount.toFixed(2)} Preserved)`
                  : 'Concede Attack (Forfeit Stake)'}
              </span>
            </button>
          </div>
        </div>
      ) : isGoal || (isEnd && lastRound?.result === 'GOAL_SCORED') ? (
        /* ========================================================= */
        /* STATE 2: GOAL CELEBRATION PANEL                           */
        /* Required: Final payout, Play Again, Modify Stake          */
        /* ========================================================= */
        <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/80 via-emerald-950/70 to-slate-900 border-2 border-amber-500/80 text-center shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-widest font-mono">
                <Trophy size={14} /> ATTACK CONVERTED
              </div>
              <h2 className="text-4xl font-extrabold text-white font-['Barlow_Condensed'] tracking-wider mt-1 drop-shadow-md">
                GOAL!
              </h2>
              <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold">
                {lastRound?.payoutMultiplier.toFixed(2) || goalMult.toFixed(2)}x MULTIPLIER
              </div>
            </div>

            {/* Final Payout */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-xs font-mono uppercase text-slate-400">Final Payout</span>
              <div className="text-3xl font-extrabold text-emerald-400 font-['Barlow_Condensed']">
                ${(lastRound?.finalPayout || Math.round(gameState.bet * goalMult * 100) / 100).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Actionable buttons: Play Again & Modify Stake */}
          <div className="space-y-2 pt-2">
            {gameState.balance < gameState.bet && onResetBankroll && (
              <button
                onClick={onResetBankroll}
                className="w-full py-2.5 px-3 rounded-xl border border-emerald-500/60 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Refill Bankroll (+$500)</span>
              </button>
            )}

            <button
              disabled={gameState.balance < gameState.bet}
              onClick={onPlayClick}
              className="w-full py-4 px-4 rounded-xl font-bold font-['Barlow_Condensed'] text-xl tracking-wider uppercase text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-950 cursor-pointer"
            >
              <Play size={20} className="fill-white" />
              <span>PLAY AGAIN (${gameState.bet})</span>
            </button>

            <button
              onClick={onAdjustBet}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Modify Stake</span>
            </button>
          </div>
        </div>
      ) : isEnd && lastRound ? (
        /* ========================================================= */
        /* STATE 2B: MATCH OUTCOME (Cashed Out or Tackled)           */
        /* Required: Final payout, Play Again, Modify Stake          */
        /* ========================================================= */
        <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow shrink-0">
                {lastRound.result === 'CASHED_OUT' ? (
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={24} />
                  </div>
                ) : lastRound.finalPayout > 0 ? (
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
                    <ShieldCheck size={24} />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400">
                    <XCircle size={24} />
                  </div>
                )}
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Match Outcome
                </span>
                <h3 className="text-xl font-bold font-['Barlow_Condensed'] text-white">
                  {lastRound.result === 'CASHED_OUT'
                    ? 'SUCCESSFUL CASHOUT'
                    : lastRound.finalPayout > 0
                    ? 'SHIELD RECOVERY'
                    : 'TACKLE CONCEDED'}
                </h3>
              </div>
            </div>

            {/* Final Payout */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-xs font-mono uppercase text-slate-400">Final Payout</span>
              <div className={`text-3xl font-extrabold font-['Barlow_Condensed'] ${
                lastRound.finalPayout > 0 ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                ${lastRound.finalPayout.toFixed(2)}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {lastRound.currentColumn} / 7 Lines Cleared · {lastRound.payoutMultiplier.toFixed(2)}x
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {gameState.balance < gameState.bet && onResetBankroll && (
              <button
                onClick={onResetBankroll}
                className="w-full py-2.5 px-3 rounded-xl border border-emerald-500/60 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Refill Bankroll (+$500)</span>
              </button>
            )}

            <button
              disabled={gameState.balance < gameState.bet}
              onClick={onPlayClick}
              className="w-full py-3.5 px-4 rounded-xl font-bold font-['Barlow_Condensed'] text-lg tracking-wider uppercase text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 cursor-pointer"
            >
              <Play size={18} className="fill-white" />
              <span>Play Again (${gameState.bet})</span>
            </button>

            <button
              onClick={onAdjustBet}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Modify Stake</span>
            </button>
          </div>
        </div>
      ) : isPlaying ? (
        /* ========================================================= */
        /* STATE 3: PLAYING                                          */
        /* Required: Current Line, Current Multiplier, Current       */
        /*           Cashout Value, Timer, Cashout button            */
        /* ========================================================= */
        <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Header with Timer */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1">
                <Flame size={13} className="text-emerald-400" /> ACTIVE ATTACK
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
                <TimerIcon size={13} className={gameState.timer <= 10 ? 'text-rose-400 animate-pulse' : 'text-slate-400'} />
                <span className={gameState.timer <= 10 ? 'text-rose-400' : 'text-slate-300'}>
                  {gameState.timer}s
                </span>
              </div>
            </div>

            {/* Timer Bar */}
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-1000 ${
                  gameState.timer <= 10 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (gameState.timer / TURN_TIMEOUT_SECONDS) * 100)}%` }}
              />
            </div>

            {/* Current Line & Current Multiplier */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Current Line</span>
                <span className="text-2xl font-bold font-['Barlow_Condensed'] text-emerald-400">
                  LINE {gameState.currentColumn + 1} OF 7
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Current Multiplier</span>
                <span className="text-2xl font-bold font-['Barlow_Condensed'] text-amber-400">
                  {currentMult.toFixed(2)}x
                </span>
              </div>
            </div>

            {/* Current Cashout Value Display */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">Current Cashout Value</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                ${currentCashoutVal.toFixed(2)}
              </span>
            </div>

            {/* Tactical Field Utilities (Shield & Scout) */}
            <div className="flex gap-2 pt-1">
              <button
                disabled={shieldCount <= 0 || gameState.isShieldArmed}
                onClick={() => onUseCard('SHIELD')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1 ${
                  gameState.isShieldArmed
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 disabled:opacity-30'
                }`}
              >
                <Shield size={12} />
                <span>{gameState.isShieldArmed ? 'Shield Active' : `Shield (${shieldCount})`}</span>
              </button>

              <button
                disabled={scoutCount <= 0 || gameState.scoutedDefenderPos !== null || gameState.currentColumn >= 7}
                onClick={() => onUseCard('SCOUT')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1 ${
                  gameState.scoutedDefenderPos !== null
                    ? 'bg-sky-950/60 border-sky-500 text-sky-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 disabled:opacity-30'
                }`}
              >
                <Eye size={12} />
                <span>{gameState.scoutedDefenderPos ? 'Scouted' : `Scout (${scoutCount})`}</span>
              </button>
            </div>
          </div>

          {/* Cashout Button */}
          <div className="pt-2">
            <button
              disabled={!canCashout}
              onClick={onCashoutClick}
              className={`w-full py-4 px-4 rounded-xl font-bold font-['Barlow_Condensed'] text-xl tracking-wider uppercase transition-all shadow-xl flex flex-col items-center justify-center ${
                canCashout
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-950 active:scale-[0.99] cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <DollarSign size={20} />
                <span>
                  {canCashout ? `CASHOUT $${currentCashoutVal.toFixed(2)}` : 'CASHOUT (PASS LINE 1)'}
                </span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* STATE 4: STANDBY                                          */
        /* Required: Wager stake, Quick bet buttons, Estimated Goal  */
        /*           Payout, Kick Off button                         */
        /* ========================================================= */
        <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
          <div className="space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold font-['Barlow_Condensed'] uppercase tracking-wider text-white">
                WAGER STAKE
              </span>
              <select
                value={gameState.activeConfigId}
                onChange={(e) => onConfigChange(e.target.value as 'classic' | 'fair')}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="classic">Classic (7.26x)</option>
                <option value="fair">97% RTP (10.5x)</option>
              </select>
            </div>

            {/* 1. Wager Stake Input & Adjustments */}
            <div className="space-y-1.5">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, gameState.balance)}
                  step="5"
                  value={gameState.bet}
                  onChange={(e) => onBetChange(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2.5 text-base font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={gameState.bet <= 1}
                  onClick={() => onBetChange(Math.max(1, Math.floor(gameState.bet / 2)))}
                  className="flex-1 py-1.5 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors cursor-pointer"
                  title="Half Stake"
                >
                  ½
                </button>
                <button
                  disabled={gameState.bet * 2 > gameState.balance}
                  onClick={() => onBetChange(Math.min(gameState.balance, gameState.bet * 2))}
                  className="flex-1 py-1.5 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors cursor-pointer"
                  title="Double Stake"
                >
                  2×
                </button>
                <button
                  disabled={gameState.balance <= 0}
                  onClick={() => onBetChange(gameState.balance)}
                  className="flex-1 py-1.5 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors cursor-pointer"
                  title="Max Stake"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* 2. Quick Bet Buttons (Chips) */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Quick Bet Chips</span>
              <div className="grid grid-cols-6 gap-1">
                {PRESET_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    disabled={chip > gameState.balance}
                    onClick={() => onBetChange(chip)}
                    className={`py-1.5 text-xs font-mono rounded border transition-colors cursor-pointer ${
                      gameState.bet === chip
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30'
                    }`}
                  >
                    ${chip}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Estimated Goal Payout */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Estimated Goal Payout
                </span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  ${(Math.round(gameState.bet * goalMult * 100) / 100).toFixed(2)}
                </span>
              </div>
              <div className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                {goalMult.toFixed(2)}x
              </div>
            </div>
          </div>

          {/* 4. Kick Off Action */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            {gameState.balance < gameState.bet && onResetBankroll && (
              <button
                onClick={onResetBankroll}
                className="w-full py-2 px-3 rounded-xl border border-emerald-500/60 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Refill Bankroll (+$500)</span>
              </button>
            )}

            <button
              disabled={!canPlay}
              onClick={onPlayClick}
              className="w-full py-4 px-4 rounded-xl font-bold font-['Barlow_Condensed'] text-xl tracking-wider uppercase text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-emerald-950 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play size={20} className="fill-white" />
              <span>KICK OFF (${gameState.bet})</span>
            </button>

            <button
              onClick={onOpenAutoModal}
              className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                gameState.autoPlan.enabled
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Zap size={13} className={gameState.autoPlan.enabled ? 'fill-sky-400 text-sky-400' : ''} />
              <span>{gameState.autoPlan.enabled ? 'Auto Plan Enabled' : 'Pre-Plan Auto Lane'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
