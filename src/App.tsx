/**
 * Football Dribble - Root Application Coordinator
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameState, MainPhase, PlayingSubState, TacticalCardType } from './types/game';
import { FootballStateMachine } from './logic/stateMachine';
import {
  generateDefendersGrid,
  GRID_COLS,
  GRID_ROWS,
  TURN_TIMEOUT_SECONDS,
  TACTICAL_CARD_DEFS,
  getMultiplierForCleared,
  getGoalMultiplier,
} from './logic/gameRules';
import { soundFx } from './logic/soundFx';

import { PitchCanvas } from './components/PitchCanvas';
import { MatchHeader } from './components/MatchHeader';
import { TacticalCardsBar } from './components/TacticalCardsBar';
import { RightActionPanel } from './components/RightActionPanel';
import { AutoPlanModal } from './components/AutoPlanModal';
import { MatchHistoryDrawer } from './components/MatchHistoryDrawer';
import { GddModal } from './components/GddModal';
import confetti from 'canvas-confetti';

import stadiumBackdrop from './assets/images/football_stadium_arena_1791795052995.jpg';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    phase: 'STANDBY',
    subState: 'DRIBBLING',
    balance: 1000,
    bet: 50,
    timer: TURN_TIMEOUT_SECONDS,
    timerRunning: false,
    grid: generateDefendersGrid(),
    currentColumn: 0,
    currentRow: null,
    cardInventory: {
      PASS: 2,
      REPLAY: 1,
      SHIELD: 1,
      SUBSTITUTE: 2,
      SCOUT: 2,
    },
    cardsUsedThisMatch: [],
    isShieldArmed: false,
    replayUsedThisMatch: false,
    scoutedDefenderPos: null,
    autoPlan: {
      enabled: false,
      plannedRows: [1, 2, 0, 2, 3, 1, 0],
      currentStepIndex: 0,
    },
    lastRound: null,
    history: [],
    stats: {
      matchesPlayed: 0,
      goalsScored: 0,
      cashoutsCount: 0,
      lossesCount: 0,
      totalWagered: 0,
      totalWon: 0,
      highestMultiplier: 1.0,
      longestDribbleRun: 0,
    },
    soundEnabled: true,
    activeConfigId: 'classic',
  }));

  const [activeTab, setActiveTab] = useState<'pitch' | 'cards' | 'history' | 'gdd'>('pitch');
  const [showAutoModal, setShowAutoModal] = useState(false);
  const autoStepTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sound sync
  useEffect(() => {
    soundFx.setMuted(!gameState.soundEnabled);
  }, [gameState.soundEnabled]);

  // Turn Timer Loop
  useEffect(() => {
    if (!gameState.timerRunning) return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        if (!prev.timerRunning) return prev;

        if (prev.timer <= 1) {
          // Timer reached 0
          if (prev.phase === 'PLAYING') {
            if (prev.currentColumn >= 1) {
              // Auto cashout on timeout after progression
              soundFx.playCashout();
              return FootballStateMachine.cashOut(prev, true);
            } else {
              // Timeout before first move -> round abandoned
              return {
                ...FootballStateMachine.failMatch(prev),
                lastRound: {
                  ...prev.lastRound!,
                  result: 'TIMEOUT_ABANDONED',
                },
              };
            }
          }
          return { ...prev, timer: 0, timerRunning: false };
        }

        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.timerRunning]);

  // Handle Play / Kickoff
  const handlePlayClick = () => {
    soundFx.playRefereeWhistle();
    soundFx.playDribbleKick();
    setGameState((prev) => FootballStateMachine.startMatch(prev));
  };

  // Handle Manual Cashout
  const handleCashoutClick = () => {
    soundFx.playCashout();
    setGameState((prev) => FootballStateMachine.cashOut(prev));
  };

  // Handle Cell Click (Dribble)
  const handleCellClick = (col: number, row: number) => {
    setGameState((prev) => {
      if (prev.phase !== 'PLAYING') return prev;
      if (prev.subState !== 'DRIBBLING' && prev.subState !== 'AUTO') return prev;
      if (col !== prev.currentColumn) return prev; // Must play in column sequence

      const cell = prev.grid[col][row];
      const newGrid = prev.grid.map((cList, cIdx) =>
        cList.map((c, rIdx) => {
          if (cIdx === col && rIdx === row) {
            return {
              ...c,
              status: cell.hasDefender ? ('tackled' as const) : ('cleared' as const),
            };
          }
          return c;
        })
      );

      if (cell.hasDefender) {
        // Tackled by Defender!
        soundFx.playRefereeWhistle();
        return {
          ...prev,
          grid: newGrid,
          currentRow: row,
          subState: 'BLOCKED',
          autoPlan: { ...prev.autoPlan, enabled: false }, // Stop auto immediately
        };
      } else {
        // Safe Dribble!
        soundFx.playDribbleKick();
        soundFx.playSafeStep(col + 1);

        const nextCol = col + 1;
        const reachedGoal = nextCol >= GRID_COLS;

        if (reachedGoal) {
          // Column 7 passed -> GOAL sequence!
          soundFx.playGoalCelebration();
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
          });
          const stateWithGoal = {
            ...prev,
            grid: newGrid,
            currentColumn: GRID_COLS,
            currentRow: row,
            subState: 'GOAL' as PlayingSubState,
            timerRunning: false,
            scoutedDefenderPos: null,
          };
          return FootballStateMachine.completeGoal(stateWithGoal);
        }

        return {
          ...prev,
          grid: newGrid,
          currentColumn: nextCol,
          currentRow: row,
          timer: TURN_TIMEOUT_SECONDS,
          scoutedDefenderPos: null, // Clear scouted indicator on move
        };
      }
    });
  };

  // Auto Dribble Step Executor
  useEffect(() => {
    if (gameState.phase !== 'PLAYING' || !gameState.autoPlan.enabled || gameState.subState !== 'DRIBBLING') {
      return;
    }

    const nextCol = gameState.currentColumn;
    if (nextCol >= GRID_COLS) return;

    const plannedRow = gameState.autoPlan.plannedRows[nextCol];
    if (plannedRow === null || plannedRow === undefined) return;

    autoStepTimeoutRef.current = setTimeout(() => {
      handleCellClick(nextCol, plannedRow);
    }, 600);

    return () => {
      if (autoStepTimeoutRef.current) clearTimeout(autoStepTimeoutRef.current);
    };
  }, [gameState.phase, gameState.currentColumn, gameState.autoPlan.enabled, gameState.subState]);

  // Tactical Cards Handler
  const handleUseCard = (cardType: TacticalCardType) => {
    soundFx.playCardUse();

    setGameState((prev) => {
      const count = prev.cardInventory[cardType] || 0;
      if (count <= 0) return prev;

      const updatedInventory = {
        ...prev.cardInventory,
        [cardType]: count - 1,
      };
      const updatedUsedCards = [...prev.cardsUsedThisMatch, cardType];

      const currentCol = prev.currentColumn;
      const currentRow = prev.currentRow;

      if (cardType === 'PASS') {
        // Skip current defender, advance to next column!
        const nextCol = prev.currentColumn + 1;
        const updatedGrid = prev.grid.map((cList, cIdx) => {
          if (cIdx === currentCol && currentRow !== null) {
            return cList.map((c, rIdx) => {
              if (rIdx === currentRow) {
                return { ...c, status: 'bypassed' as const, resolvedWithCard: 'PASS' as const };
              }
              return c;
            });
          }
          return cList;
        });

        if (nextCol >= GRID_COLS) {
          soundFx.playGoalCelebration();
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
          });
          const goalState = {
            ...prev,
            grid: updatedGrid,
            cardInventory: updatedInventory,
            cardsUsedThisMatch: updatedUsedCards,
            currentColumn: GRID_COLS,
            subState: 'GOAL' as PlayingSubState,
            timerRunning: false,
          };
          return FootballStateMachine.completeGoal(goalState);
        }

        return {
          ...prev,
          grid: updatedGrid,
          cardInventory: updatedInventory,
          cardsUsedThisMatch: updatedUsedCards,
          currentColumn: nextCol,
          subState: 'DRIBBLING',
          timer: TURN_TIMEOUT_SECONDS,
        };
      }

      if (cardType === 'SUBSTITUTE') {
        // Replace tackled player with fresh striker, resume attack on this line!
        const updatedGrid = prev.grid.map((cList, cIdx) => {
          if (cIdx === currentCol && currentRow !== null) {
            return cList.map((c, rIdx) => {
              if (rIdx === currentRow) {
                return { ...c, resolvedWithCard: 'SUBSTITUTE' as const };
              }
              return c;
            });
          }
          return cList;
        });

        return {
          ...prev,
          grid: updatedGrid,
          cardInventory: updatedInventory,
          cardsUsedThisMatch: updatedUsedCards,
          subState: 'DRIBBLING',
          timer: TURN_TIMEOUT_SECONDS,
        };
      }

      if (cardType === 'REPLAY') {
        // VAR Review: mark replay on pitch and allow retrying the line
        const updatedGrid = prev.grid.map((cList, cIdx) => {
          if (cIdx === currentCol) {
            return cList.map((c, rIdx) => {
              if (rIdx === currentRow) {
                return { ...c, status: 'hidden' as const, resolvedWithCard: 'REPLAY' as const };
              }
              return { ...c, status: 'hidden' as const };
            });
          }
          return cList;
        });

        return {
          ...prev,
          grid: updatedGrid,
          cardInventory: updatedInventory,
          cardsUsedThisMatch: updatedUsedCards,
          replayUsedThisMatch: true,
          subState: 'DRIBBLING',
          timer: TURN_TIMEOUT_SECONDS,
        };
      }

      if (cardType === 'SHIELD') {
        // Arm 50% loss preservation & tag blocked cell if currently tackled
        const updatedGrid = prev.grid.map((cList, cIdx) => {
          if (cIdx === currentCol && currentRow !== null && prev.subState === 'BLOCKED') {
            return cList.map((c, rIdx) => {
              if (rIdx === currentRow) {
                return { ...c, resolvedWithCard: 'SHIELD' as const };
              }
              return c;
            });
          }
          return cList;
        });

        return {
          ...prev,
          grid: updatedGrid,
          cardInventory: updatedInventory,
          cardsUsedThisMatch: updatedUsedCards,
          isShieldArmed: true,
        };
      }

      if (cardType === 'SCOUT') {
        // Reveal next defender location
        const targetCol = prev.currentColumn;
        const defenderRow = prev.grid[targetCol]?.findIndex((c) => c.hasDefender);
        return {
          ...prev,
          cardInventory: updatedInventory,
          cardsUsedThisMatch: updatedUsedCards,
          scoutedDefenderPos: defenderRow !== -1 ? { col: targetCol, row: defenderRow } : null,
        };
      }

      return prev;
    });
  };

  // Buy Tactical Card in Standby
  const handleBuyCard = (cardType: TacticalCardType) => {
    const cost = TACTICAL_CARD_DEFS[cardType]?.costInCredits || 50;
    if (gameState.balance < cost) return;

    soundFx.playCashout();
    setGameState((prev) => ({
      ...prev,
      balance: prev.balance - cost,
      cardInventory: {
        ...prev.cardInventory,
        [cardType]: (prev.cardInventory[cardType] || 0) + 1,
      },
    }));
  };

  // Concede Match in Blocked State
  const handleConcede = () => {
    soundFx.playRefereeWhistle();
    setGameState((prev) => FootballStateMachine.failMatch(prev));
  };

  // Return to Standby for Next Match
  const handleNextMatch = () => {
    setGameState((prev) => ({
      ...prev,
      phase: 'STANDBY',
      subState: 'DRIBBLING',
      currentColumn: 0,
      currentRow: null,
      grid: generateDefendersGrid(),
      timer: TURN_TIMEOUT_SECONDS,
      timerRunning: false,
      cardsUsedThisMatch: [],
      isShieldArmed: false,
      replayUsedThisMatch: false,
      scoutedDefenderPos: null,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-['Outfit'] relative">
      {/* Cinematic Stadium Background Header Scrim */}
      <div className="absolute top-0 left-0 right-0 h-96 overflow-hidden pointer-events-none opacity-25 z-0">
        <img
          src={stadiumBackdrop}
          alt="Stadium Atmosphere"
          className="w-full h-full object-cover object-center filter blur-[1px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/80 to-slate-950" />
      </div>

      {/* Header & Live Multiplier Bar */}
      <MatchHeader
        gameState={gameState}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggleSound={() =>
          setGameState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        onResetBankroll={() =>
          setGameState((prev) => ({ ...prev, balance: Math.max(prev.balance + 500, 500) }))
        }
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 z-10 space-y-6">
        {activeTab === 'pitch' && (
          <div className="space-y-4 animate-fade-in">
            {/* 70% Field on left, 30% Wager Stake Panel on right */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-stretch">
              {/* Left Column: Football Field + Tactical Cards Deck (70% width) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <PitchCanvas
                  gameState={gameState}
                  onCellClick={handleCellClick}
                  onGoalShootComplete={() => {
                    soundFx.playGoalCelebration();
                    confetti({
                      particleCount: 70,
                      spread: 80,
                      origin: { y: 0.6 },
                    });
                  }}
                  onPlayAgain={handlePlayClick}
                  onAdjustBet={handleNextMatch}
                />

                {/* Tactical Cards Deck below the field */}
                <TacticalCardsBar
                  gameState={gameState}
                  onUseCard={handleUseCard}
                  onBuyCard={handleBuyCard}
                />
              </div>

              {/* Right Column: Wager Stake & In-Place Tactical Resolution Panel (30% width) */}
              <div className="lg:col-span-3 h-full">
                <RightActionPanel
                  gameState={gameState}
                  onBetChange={(amt) => setGameState((prev) => ({ ...prev, bet: amt }))}
                  onPlayClick={handlePlayClick}
                  onCashoutClick={handleCashoutClick}
                  onUseCard={handleUseCard}
                  onConcede={handleConcede}
                  onAdjustBet={handleNextMatch}
                  onOpenAutoModal={() => setShowAutoModal(true)}
                  onConfigChange={(configId) =>
                    setGameState((prev) => ({ ...prev, activeConfigId: configId }))
                  }
                  onResetBankroll={() =>
                    setGameState((prev) => ({ ...prev, balance: Math.max(prev.balance + 500, 500) }))
                  }
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cards' && (
          <div className="space-y-6 animate-fade-in">
            <TacticalCardsBar
              gameState={gameState}
              onUseCard={handleUseCard}
              onBuyCard={handleBuyCard}
            />
            {/* Cards Info Section */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white font-['Barlow_Condensed']">
                CLUBHOUSE TACTICAL CARDS REPERTORY
              </h3>
              <p className="text-xs text-slate-400">
                Cards are inventory-based persistent strategic assets. Purchase replacements between rounds or earn them through progression.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(TACTICAL_CARD_DEFS).map((card) => (
                  <div key={card.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 font-['Barlow_Condensed'] text-base">
                        {card.name}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Cap: {card.maxInventory}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {card.detailedDescription}
                    </p>
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Inventory:</span>
                      <span className="text-emerald-400 font-bold">
                        {gameState.cardInventory[card.id] || 0} / {card.maxInventory}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-fade-in">
            <MatchHistoryDrawer
              gameState={gameState}
              onClearHistory={() => setGameState((prev) => ({ ...prev, history: [] }))}
            />
          </div>
        )}

        {activeTab === 'gdd' && (
          <div className="animate-fade-in">
            <GddModal />
          </div>
        )}
      </main>

      {/* Auto Plan Modal */}
      {showAutoModal && (
        <AutoPlanModal
          gameState={gameState}
          onSaveAndRun={(plannedRows) => {
            setShowAutoModal(false);
            setGameState((prev) => ({
              ...prev,
              autoPlan: {
                enabled: true,
                plannedRows,
                currentStepIndex: prev.currentColumn,
              },
            }));
          }}
          onClose={() => setShowAutoModal(false)}
        />
      )}
    </div>
  );
}
