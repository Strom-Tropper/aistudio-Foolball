/**
 * PitchCanvas - React wrapper for Pixi.js FootballPitchView
 */

import React, { useEffect, useRef } from 'react';
import { FootballPitchView } from '../pixi/FootballPitchView';
import { GameState } from '../types/game';
import { Play, RotateCcw, Trophy, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

interface PitchCanvasProps {
  gameState: GameState;
  onCellClick: (col: number, row: number) => void;
  onGoalShootComplete: () => void;
  onPlayAgain?: () => void;
  onAdjustBet?: () => void;
}

export const PitchCanvas: React.FC<PitchCanvasProps> = ({
  gameState,
  onCellClick,
  onGoalShootComplete,
  onPlayAgain,
  onAdjustBet,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<FootballPitchView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const view = new FootballPitchView(containerRef.current, {
      onCellClick,
      onGoalShootComplete,
    });
    viewRef.current = view;

    view.init().then(() => {
      view.renderState(gameState);
    });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect && viewRef.current) {
          viewRef.current.resize(
            Math.max(entry.contentRect.width, 480),
            Math.max(entry.contentRect.height, 360)
          );
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  // Update Pixi view on state change
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.renderState(gameState);
    }
  }, [gameState]);

  return (
    <div className="relative w-full h-[380px] sm:h-[410px] md:h-[430px] rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

