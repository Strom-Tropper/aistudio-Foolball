/**
 * AutoPlanModal - Visual path planner for sequential automatic dribbles
 */

import React, { useState } from 'react';
import { GameState } from '../types/game';
import { GRID_COLS, GRID_ROWS } from '../logic/gameRules';
import { Zap, X, Shuffle, ArrowRight } from 'lucide-react';

interface AutoPlanModalProps {
  gameState: GameState;
  onSaveAndRun: (plannedRows: (number | null)[]) => void;
  onClose: () => void;
}

export const AutoPlanModal: React.FC<AutoPlanModalProps> = ({
  gameState,
  onSaveAndRun,
  onClose,
}) => {
  const [plannedRows, setPlannedRows] = useState<(number | null)[]>(
    gameState.autoPlan.plannedRows.length === GRID_COLS
      ? [...gameState.autoPlan.plannedRows]
      : [1, 2, 0, 2, 3, 1, 0]
  );

  const handleSelectRow = (col: number, row: number) => {
    const updated = [...plannedRows];
    updated[col] = updated[col] === row ? null : row;
    setPlannedRows(updated);
  };

  const handleRandomize = () => {
    const rand = Array.from({ length: GRID_COLS }, () => Math.floor(Math.random() * GRID_ROWS));
    setPlannedRows(rand);
  };

  const handleZigzag = () => {
    const zig = Array.from({ length: GRID_COLS }, (_, i) => (i % 2 === 0 ? 1 : 2));
    setPlannedRows(zig);
  };

  const isComplete = plannedRows.every((r) => r !== null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-500 flex items-center justify-center text-sky-400">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Barlow_Condensed'] tracking-wide">
                TACTICAL AUTO-DRIBBLE PLANNER
              </h3>
              <p className="text-xs text-slate-400">
                Pre-select your attacking lane through each of the 7 defensive lines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice of Rules */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-400">Rule Notice:</strong> Auto mode does not know defender locations. If an opposing defender is encountered, Auto immediately halts, enters <span className="font-mono text-red-400">BLOCKED</span>, and prompts you to deploy tactical cards.
        </div>

        {/* Visual 4x7 Mini Grid */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: GRID_COLS }).map((_, c) => (
              <div key={c} className="flex flex-col gap-1.5 items-center">
                <span className="text-[10px] font-mono font-semibold text-slate-400">
                  L{c + 1}
                </span>
                {Array.from({ length: GRID_ROWS }).map((_, r) => {
                  const isSelected = plannedRows[c] === r;
                  return (
                    <button
                      key={r}
                      onClick={() => handleSelectRow(c, r)}
                      className={`w-full aspect-square rounded-md border text-[11px] font-mono font-bold transition-all flex items-center justify-center ${
                        isSelected
                          ? 'bg-sky-500 border-sky-300 text-slate-950 shadow-md shadow-sky-500/40'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {isSelected ? '✓' : `R${r + 1}`}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Presets & Run Action */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomize}
              className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Shuffle size={13} />
              <span>Random Lane</span>
            </button>
            <button
              onClick={handleZigzag}
              className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Center Wave
            </button>
          </div>

          <button
            disabled={!isComplete}
            onClick={() => onSaveAndRun(plannedRows)}
            className="px-5 py-2.5 rounded-xl font-bold font-['Barlow_Condensed'] text-sm tracking-wider uppercase text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-sky-950"
          >
            <span>Activate Auto Plan</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
