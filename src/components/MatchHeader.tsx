/**
 * MatchHeader - Top Bar Contract & Real-Time Multiplier Ladder
 */

import React from 'react';
import { GameState } from '../types/game';
import { MULTIPLIER_CONFIGS, getMultiplierForCleared, getGoalMultiplier } from '../logic/gameRules';
import { Volume2, VolumeX, Shield, Timer } from 'lucide-react';

interface MatchHeaderProps {
  gameState: GameState;
  activeTab: 'pitch' | 'cards' | 'history' | 'gdd';
  onTabChange: (tab: 'pitch' | 'cards' | 'history' | 'gdd') => void;
  onToggleSound: () => void;
  onResetBankroll: () => void;
}

export const MatchHeader: React.FC<MatchHeaderProps> = ({
  gameState,
  activeTab,
  onTabChange,
  onToggleSound,
  onResetBankroll,
}) => {
  const currentMult =
    gameState.currentColumn >= 7
      ? getGoalMultiplier(gameState.activeConfigId)
      : gameState.currentColumn > 0
      ? getMultiplierForCleared(gameState.currentColumn, gameState.activeConfigId)
      : 1.0;

  const potentialWin = Math.round(gameState.bet * currentMult * 100) / 100;
  const config = MULTIPLIER_CONFIGS[gameState.activeConfigId];

  // Timer percentage
  const timerPct = Math.max(0, Math.min(100, (gameState.timer / 30) * 100));

  return (
    <div className="w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Bar Contract (3 zones) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3 border-b border-slate-800/80">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-900/40">
            FD
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-['Barlow_Condensed'] whitespace-nowrap shrink-0">
            FOOTBALL DRIBBLE
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onTabChange('pitch')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white pb-0.5 ${
              activeTab === 'pitch' ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Match Arena
          </button>
          <button
            onClick={() => onTabChange('cards')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white pb-0.5 ${
              activeTab === 'cards' ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Tactical Cards Deck
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white pb-0.5 ${
              activeTab === 'history' ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Match History
          </button>
          <button
            onClick={() => onTabChange('gdd')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white pb-0.5 ${
              activeTab === 'gdd' ? 'text-amber-400 border-b-2 border-amber-400 font-semibold' : 'text-slate-400'
            }`}
          >
            GDD & Architecture
          </button>
        </nav>

        {/* Zone 3: Balance & Quick Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Turn Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Timer size={14} className={gameState.timer <= 10 && gameState.phase === 'PLAYING' ? 'text-rose-400 animate-pulse' : 'text-slate-400'} />
            <span className="text-slate-400 font-mono hidden sm:inline">Timer:</span>
            <span
              className={`font-mono font-bold tabular-nums ${
                gameState.timer <= 10 && gameState.phase === 'PLAYING' ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {gameState.timer}s
            </span>
          </div>

          {/* Active Pot */}
          {gameState.phase === 'PLAYING' && gameState.currentColumn >= 1 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs font-mono">
              <span className="text-slate-400">Pot:</span>
              <span className="text-emerald-400 font-bold tabular-nums">
                ${potentialWin.toFixed(2)}
              </span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={gameState.soundEnabled ? 'Mute Audio FX' : 'Enable Audio FX'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            {gameState.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-red-400" />}
          </button>

          {/* Balance Pill-Free Card */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400">Balance:</span>
            <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
              ${gameState.balance.toFixed(2)}
            </span>
            {gameState.balance < 5 && (
              <button
                onClick={onResetBankroll}
                className="text-[11px] underline text-amber-400 hover:text-amber-300 ml-1"
                title="Replenish demo bankroll"
              >
                Top up
              </button>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};
