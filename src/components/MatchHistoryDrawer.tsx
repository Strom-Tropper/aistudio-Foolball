/**
 * MatchHistoryDrawer - Match stats & past round logs
 */

import React from 'react';
import { GameState } from '../types/game';
import { Trophy, TrendingUp, ShieldCheck, XCircle, RotateCcw } from 'lucide-react';

interface MatchHistoryDrawerProps {
  gameState: GameState;
  onClearHistory: () => void;
}

export const MatchHistoryDrawer: React.FC<MatchHistoryDrawerProps> = ({
  gameState,
  onClearHistory,
}) => {
  const { stats, history } = gameState;
  const winRate =
    stats.matchesPlayed > 0
      ? (((stats.goalsScored + stats.cashoutsCount) / stats.matchesPlayed) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
      {/* Career KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            Matches Played
          </span>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {stats.matchesPlayed}
          </div>
          <span className="text-[10px] text-slate-400">
            Goals: {stats.goalsScored} · Cashouts: {stats.cashoutsCount}
          </span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            Success Rate
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {winRate}%
          </div>
          <span className="text-[10px] text-slate-400">
            Losses: {stats.lossesCount}
          </span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            Peak Multiplier
          </span>
          <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
            {stats.highestMultiplier.toFixed(2)}x
          </div>
          <span className="text-[10px] text-slate-400">
            Deepest Run: Line {stats.longestDribbleRun}
          </span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            Net Earnings
          </span>
          <div
            className={`text-xl font-bold font-mono tabular-nums ${
              stats.totalWon - stats.totalWagered >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            ${(stats.totalWon - stats.totalWagered).toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400">
            Total Won: ${stats.totalWon.toFixed(2)}
          </span>
        </div>
      </div>

      {/* History Log Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Recent Match Runs ({history.length})
          </span>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Clear Log
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
            No matches played yet. Select your stake and kick off your first attack!
          </div>
        ) : (
          <div className="overflow-x-auto max-h-64 rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Result</th>
                  <th className="py-2.5 px-3">Wager</th>
                  <th className="py-2.5 px-3">Lines Cleared</th>
                  <th className="py-2.5 px-3">Multiplier</th>
                  <th className="py-2.5 px-3">Payout</th>
                  <th className="py-2.5 px-3">Cards Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {history.map((m) => {
                  const isGoal = m.result === 'GOAL_SCORED';
                  const isCashout = m.result === 'CASHED_OUT';
                  const isBlocked = m.result === 'BLOCKED_LOST';

                  return (
                    <tr key={m.id} className="hover:bg-slate-900/50">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            isGoal
                              ? 'text-amber-400'
                              : isCashout
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {isGoal ? '★ GOAL' : isCashout ? '✓ CASHOUT' : '✗ BLOCKED'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 tabular-nums">${m.betAmount.toFixed(2)}</td>
                      <td className="py-2.5 px-3 tabular-nums">{m.currentColumn} / 7</td>
                      <td className="py-2.5 px-3 tabular-nums">{m.payoutMultiplier.toFixed(2)}x</td>
                      <td
                        className={`py-2.5 px-3 tabular-nums font-bold ${
                          m.finalPayout > 0 ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        ${m.finalPayout.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-400">
                        {m.cardsUsedThisRound.length > 0 ? m.cardsUsedThisRound.join(', ') : 'None'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
