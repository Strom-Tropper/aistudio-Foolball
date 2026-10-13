/**
 * GoalCelebrationOverlay - Cinematic celebration when reaching and scoring the final goal!
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from '../types/game';
import { getGoalMultiplier } from '../logic/gameRules';
import { Trophy, Award, Sparkles, ArrowRight } from 'lucide-react';
import pixelStrikerHeroUrl from '../assets/images/pixel_striker_hero_1791797227049.jpg';

interface GoalCelebrationOverlayProps {
  gameState: GameState;
  onNextMatch: () => void;
}

export const GoalCelebrationOverlay: React.FC<GoalCelebrationOverlayProps> = ({
  gameState,
  onNextMatch,
}) => {
  const goalMult = getGoalMultiplier(gameState.activeConfigId);
  const payout = Math.round(gameState.bet * goalMult * 100) / 100;

  useEffect(() => {
    // Launch celebratory confetti bursts
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#fbbf24', '#38bdf8', '#ffffff'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#fbbf24', '#38bdf8', '#ffffff'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500 rounded-3xl p-8 text-center shadow-2xl space-y-5 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* HD Pixel Striker Hero Avatar */}
        <div className="relative mx-auto w-24 h-24 rounded-2xl border-2 border-amber-400 overflow-hidden shadow-xl shadow-amber-950/60">
          <img
            src={pixelStrikerHeroUrl}
            alt="Hero Striker Goal"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 shadow">
            <Trophy size={13} />
          </div>
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            All 7 Defensive Lines Cleared
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-white font-['Barlow_Condensed'] mt-1">
            GOAL! WHAT A FINISH!
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Stunning solo dribble from the halfway line into the back of the net!
          </p>
        </div>

        {/* Payout Metric */}
        <div className="py-4 px-6 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-1">
          <div className="text-xs text-slate-400">Total Match Payout ({goalMult.toFixed(2)}x)</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
            ${payout.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400">
            Initial Bet: ${gameState.bet.toFixed(2)} · Profit: +${(payout - gameState.bet).toFixed(2)}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onNextMatch}
          className="w-full py-3.5 px-6 rounded-xl font-bold font-['Barlow_Condensed'] text-lg tracking-wider uppercase text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950"
        >
          <span>Continue to Next Match</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
