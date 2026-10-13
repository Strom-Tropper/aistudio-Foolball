/**
 * TacticalCardsBar - Inventory & tactical card deployment
 */

import React from 'react';
import { GameState, TacticalCardType } from '../types/game';
import { TACTICAL_CARD_DEFS } from '../logic/gameRules';
import {
  CornerUpRight,
  RotateCcw,
  Shield,
  Users,
  Eye,
  PlusCircle,
  CheckCircle,
} from 'lucide-react';

interface TacticalCardsBarProps {
  gameState: GameState;
  onUseCard: (cardType: TacticalCardType) => void;
  onBuyCard: (cardType: TacticalCardType) => void;
}

const ICON_MAP: Record<TacticalCardType, React.ReactNode> = {
  PASS: <CornerUpRight size={16} />,
  REPLAY: <RotateCcw size={16} />,
  SHIELD: <Shield size={16} />,
  SUBSTITUTE: <Users size={16} />,
  SCOUT: <Eye size={16} />,
};

export const TacticalCardsBar: React.FC<TacticalCardsBarProps> = ({
  gameState,
  onUseCard,
  onBuyCard,
}) => {
  const isPlaying = gameState.phase === 'PLAYING';
  const isBlocked = isPlaying && gameState.subState === 'BLOCKED';
  const isShopOpen = gameState.phase !== 'PLAYING';

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Tactical Cards Deck
          </span>
          <span className="text-xs text-slate-400">· Persistent Resource</span>
        </div>

        {isShopOpen && (
          <span className="text-xs text-slate-400">
            Shop active between rounds
          </span>
        )}
      </div>

      {/* Grid of Tactical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(TACTICAL_CARD_DEFS) as TacticalCardType[]).map((cardKey) => {
          const cardDef = TACTICAL_CARD_DEFS[cardKey];
          const count = gameState.cardInventory[cardKey] || 0;
          const isMax = count >= cardDef.maxInventory;

          // Determine if card is currently playable
          let canPlayNow = false;
          let playLabel = 'Deploy';

          if (isPlaying) {
            if (cardKey === 'PASS' && isBlocked && count > 0) {
              canPlayNow = true;
              playLabel = 'Skip Defender';
            } else if (cardKey === 'REPLAY' && isBlocked && count > 0 && !gameState.replayUsedThisMatch) {
              canPlayNow = true;
              playLabel = 'VAR Replay';
            } else if (cardKey === 'SUBSTITUTE' && isBlocked && count > 0) {
              canPlayNow = true;
              playLabel = 'Deploy Sub';
            } else if (cardKey === 'SHIELD' && !isBlocked && count > 0 && !gameState.isShieldArmed) {
              canPlayNow = true;
              playLabel = 'Arm Shield';
            } else if (cardKey === 'SCOUT' && !isBlocked && count > 0 && !gameState.scoutedDefenderPos && gameState.currentColumn < 7) {
              canPlayNow = true;
              playLabel = 'Scout Line';
            }
          }

          const isCardActive =
            (cardKey === 'SHIELD' && gameState.isShieldArmed) ||
            (cardKey === 'SCOUT' && gameState.scoutedDefenderPos !== null) ||
            (cardKey === 'REPLAY' && gameState.replayUsedThisMatch);

          return (
            <div
              key={cardKey}
              className={`rounded-lg p-3 border transition-all flex flex-col justify-between ${
                canPlayNow
                  ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-900/30 ring-1 ring-amber-400'
                  : isCardActive
                  ? 'bg-emerald-950/30 border-emerald-600/70'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <span className="text-emerald-400">{ICON_MAP[cardKey]}</span>
                    <span className="text-xs font-bold font-['Barlow_Condensed'] tracking-wide">
                      {cardDef.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold tabular-nums text-slate-400">
                    {count}/{cardDef.maxInventory}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {cardDef.shortDescription}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2">
                {/* Deploy Button */}
                {isPlaying ? (
                  <button
                    disabled={!canPlayNow}
                    onClick={() => onUseCard(cardKey)}
                    className={`flex-1 py-1 px-2 rounded text-xs font-semibold tracking-wide transition-all ${
                      canPlayNow
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold active:scale-[0.98]'
                        : isCardActive
                        ? 'bg-emerald-900/60 text-emerald-300 cursor-default'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {isCardActive ? 'Active' : playLabel}
                  </button>
                ) : (
                  /* Standby Shop Purchase Button */
                  <button
                    disabled={isMax || gameState.balance < (cardDef.costInCredits || 50)}
                    onClick={() => onBuyCard(cardKey)}
                    className="flex-1 py-1 px-2 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors flex items-center justify-center gap-1"
                    title={`Buy for $${cardDef.costInCredits || 50}`}
                  >
                    <PlusCircle size={12} />
                    <span>${cardDef.costInCredits || 50}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
