/**
 * BlockedModal - Tactical Decision Panel when a Defender Tackles the Player
 */

import React from 'react';
import { GameState, TacticalCardType } from '../types/game';
import { TACTICAL_CARD_DEFS, getMultiplierForCleared } from '../logic/gameRules';
import { ShieldAlert, CornerUpRight, RotateCcw, Users, Flag, Shield } from 'lucide-react';
import pixelDefenderUrl from '../assets/images/pixel_defender_tackle_1791797239575.jpg';

interface BlockedModalProps {
  gameState: GameState;
  onUseCard: (cardType: TacticalCardType) => void;
  onConcede: () => void;
}

export const BlockedModal: React.FC<BlockedModalProps> = ({
  gameState,
  onUseCard,
  onConcede,
}) => {
  const currentLine = gameState.currentColumn + 1;
  const passCount = gameState.cardInventory.PASS || 0;
  const replayCount = gameState.cardInventory.REPLAY || 0;
  const subCount = gameState.cardInventory.SUBSTITUTE || 0;
  const hasReplayUsed = gameState.replayUsedThisMatch;

  const currentMult =
    gameState.currentColumn >= 1
      ? getMultiplierForCleared(gameState.currentColumn, gameState.activeConfigId)
      : 1.0;
  const shieldProtectedAmount = Math.round(gameState.bet * currentMult * 0.5 * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-red-500/60 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Header Banner with HD Pixel Defender Portrait */}
        <div className="flex items-center gap-4">
          <img
            src={pixelDefenderUrl}
            alt="Slide Tackling Defender"
            className="w-16 h-16 rounded-xl object-cover border-2 border-red-500 shadow-lg shadow-red-950 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-red-400 font-semibold flex items-center gap-1.5">
              <ShieldAlert size={14} />
              <span>DEFENSIVE TACKLE ENCOUNTERED</span>
            </span>
            <h3 className="text-2xl font-bold text-white font-['Barlow_Condensed'] tracking-wide">
              ATTACK BLOCKED ON LINE {currentLine}
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          The opposition defender committed a sliding tackle! Deploy a tactical card to rescue the attack, or concede the possession.
        </p>

        {/* Shield Info Notice */}
        {gameState.isShieldArmed && (
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-center gap-2.5 text-xs text-amber-200">
            <Shield size={16} className="text-amber-400 shrink-0" />
            <span>
              <strong>Tactical Shield Armed:</strong> Conceding now preserves 50% payout ($
              {shieldProtectedAmount.toFixed(2)}).
            </span>
          </div>
        )}

        {/* Tactical Card Rescue Actions */}
        <div className="space-y-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Available Rescue Cards:
          </span>

          {/* PASS */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <CornerUpRight size={18} className="text-emerald-400" />
              <div>
                <div className="text-sm font-bold text-slate-200">
                  {TACTICAL_CARD_DEFS.PASS.name}
                </div>
                <div className="text-xs text-slate-400">
                  Skip this defender and advance to Line {currentLine + 1}
                </div>
              </div>
            </div>
            <button
              disabled={passCount <= 0}
              onClick={() => onUseCard('PASS')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Play ({passCount})
            </button>
          </div>

          {/* SUBSTITUTE */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Users size={18} className="text-sky-400" />
              <div>
                <div className="text-sm font-bold text-slate-200">
                  {TACTICAL_CARD_DEFS.SUBSTITUTE.name}
                </div>
                <div className="text-xs text-slate-400">
                  Fresh attacker replaces player & continues run
                </div>
              </div>
            </div>
            <button
              disabled={subCount <= 0}
              onClick={() => onUseCard('SUBSTITUTE')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Play ({subCount})
            </button>
          </div>

          {/* REPLAY */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <RotateCcw size={18} className="text-purple-400" />
              <div>
                <div className="text-sm font-bold text-slate-200">
                  {TACTICAL_CARD_DEFS.REPLAY.name}
                </div>
                <div className="text-xs text-slate-400">
                  VAR Review: Retry Line {currentLine} (Max 1 per match)
                </div>
              </div>
            </div>
            <button
              disabled={replayCount <= 0 || hasReplayUsed}
              onClick={() => onUseCard('REPLAY')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {hasReplayUsed ? 'Used' : `Play (${replayCount})`}
            </button>
          </div>
        </div>

        {/* Bottom Concede Button */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onConcede}
            className="w-full py-2.5 px-4 rounded-xl border border-red-500/40 text-red-300 hover:bg-red-950/40 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Flag size={14} />
            <span>
              {gameState.isShieldArmed && gameState.currentColumn >= 1
                ? `Concede Attack (Retain $${shieldProtectedAmount.toFixed(2)})`
                : 'Concede Attack (Forfeit Stake)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
