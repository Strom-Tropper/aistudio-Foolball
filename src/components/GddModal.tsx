/**
 * GddModal - Production Technical Architecture & Game Design Document
 * 
 * Provides interactive inspection of all 10 deliverables:
 * 1. Complete Game Design Document
 * 2. State Machine Diagram
 * 3. Economy Balancing Recommendations
 * 4. Data Model
 * 5. Pixi.js Architecture
 * 6. Component Breakdown
 * 7. TypeScript Interfaces
 * 8. Folder Structure
 * 9. MVP Implementation Plan
 * 10. Future Expansion Roadmap
 */

import React, { useState } from 'react';
import {
  BookOpen,
  GitBranch,
  Calculator,
  Database,
  Layers,
  Component,
  FileCode,
  FolderTree,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

export const GddModal: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number>(1);

  const sections = [
    { id: 1, title: '1. Game Design Document (GDD)', icon: <BookOpen size={16} /> },
    { id: 2, title: '2. State Machine Diagram', icon: <GitBranch size={16} /> },
    { id: 3, title: '3. Economy & RTP Balancing', icon: <Calculator size={16} /> },
    { id: 4, title: '4. Data Model & Isolation', icon: <Database size={16} /> },
    { id: 5, title: '5. Pixi.js Architecture', icon: <Layers size={16} /> },
    { id: 6, title: '6. Component Breakdown', icon: <Component size={16} /> },
    { id: 7, title: '7. TypeScript Interfaces', icon: <FileCode size={16} /> },
    { id: 8, title: '8. Folder Structure', icon: <FolderTree size={16} /> },
    { id: 9, title: '9. MVP Implementation Plan', icon: <CheckSquare size={16} /> },
    { id: 10, title: '10. Future Expansion Roadmap', icon: <Sparkles size={16} /> },
  ];

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            Technical Specification & GDD
          </span>
          <h2 className="text-2xl font-extrabold text-white font-['Barlow_Condensed'] tracking-wide">
            FOOTBALL DRIBBLE ARCHITECTURE DOCUMENTATION
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Production-grade design document, deterministic state machine, Pixi.js pipeline, and economy calibration.
          </p>
        </div>
      </div>

      {/* Navigation Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeSection === s.id
                ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-bold'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {s.icon}
            <span>{s.title}</span>
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-slate-300 text-sm leading-relaxed max-h-[640px] overflow-y-auto space-y-6">
        {/* SECTION 1: GDD */}
        {activeSection === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-['Barlow_Condensed']">
              1. COMPLETE GAME DESIGN DOCUMENT (GDD)
            </h3>
            <p>
              <strong>Game Title:</strong> Football Dribble<br />
              <strong>Genre:</strong> Risk-Reward Football Betting Game / Mines & Cashout Variant<br />
              <strong>Platform:</strong> Desktop & Mobile Web (HTML5 Canvas + React + Pixi.js)<br />
              <strong>Target Audience:</strong> Sports betting enthusiasts, crash/mines players, casual sports gamers seeking agency.
            </p>

            <h4 className="text-md font-semibold text-emerald-400 mt-4">1.1 Core Game Loop</h4>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300">
              STANDBY (Stake & Plan) → PLAY (Defenders Generated) → DRIBBLE (Pick Lane) → REVEAL (Safe / Blocked) → DECIDE (Cashout or Continue) → GOAL (Clearing Line 7) → PAYOUT
            </div>
            <p>
              Unlike generic Mines boards that display static bombs or diamonds, Football Dribble models a dynamic counter-attack. The player assumes the role of a forward carrying the ball from midfield toward the opposition goal. Every defensive line passed builds momentum (multiplier), and breaking all 7 lines triggers an unstoppable shot on goal.
            </p>

            <h4 className="text-md font-semibold text-emerald-400 mt-4">1.2 Terminology Translation</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-800">
                <thead className="bg-slate-900 text-slate-300">
                  <tr>
                    <th className="p-2 border-b border-slate-800">Legacy Mines Term</th>
                    <th className="p-2 border-b border-slate-800">Football Dribble Term</th>
                    <th className="p-2 border-b border-slate-800">Mechanical Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  <tr>
                    <td className="p-2 text-rose-400">Mine</td>
                    <td className="p-2 text-emerald-400">Defender</td>
                    <td className="p-2 text-slate-300">Hazard that halts attack upon contact</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-rose-400">Reveal / Step</td>
                    <td className="p-2 text-emerald-400">Dribble / Penetration</td>
                    <td className="p-2 text-slate-300">Choosing a lane to advance past defensive line</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-rose-400">Explosion</td>
                    <td className="p-2 text-emerald-400">Slide Tackle / Blocked</td>
                    <td className="p-2 text-slate-300">Enters BLOCKED state; triggers card window</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-rose-400">Win / Max Payout</td>
                    <td className="p-2 text-emerald-400">Goal Scored</td>
                    <td className="p-2 text-slate-300">Cinematic strike into top corner + 7.26x bonus</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="text-md font-semibold text-emerald-400 mt-4">1.3 Mathematical Foundation</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Grid Geometry: 4 rows × 7 columns.</li>
              <li>Composition per Column: Exactly 1 Defender + 3 Safe Turf cells.</li>
              <li>Success Probability per Column: 3/4 = 75.00%.</li>
              <li>Full Run Probability (Clearing 7 lines): 0.75^7 = (3/4)^7 ≈ 13.3484%.</li>
              <li>Cashout Eligibility: Unlocked after successfully crossing Column 1.</li>
            </ul>
          </div>
        )}

        {/* SECTION 2: STATE MACHINE */}
        {activeSection === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-['Barlow_Condensed']">
              2. FORMAL STATE MACHINE SPECIFICATION
            </h3>
            <p>
              To maintain strict integrity, the engine separates top-level lifecycle phases from intra-round sub-states. <strong>BLOCKED is strictly an internal sub-state of PLAYING</strong>, never a top-level phase.
            </p>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto text-slate-200">
              <pre>{`
               [ STANDBY ]
                    |
     [PLAY Clicked & Valid Stake]
                    |
                    v
            +-------------------------------------------------------+
            |                       PLAYING                         |
            |                                                       |
            |   +----------------+         +--------------------+   |
            |   |   DRIBBLING    |<------->|    AUTO DRIBBLING  |   |
            |   +----------------+         +--------------------+   |
            |        |          \\                   |               |
            |   [Safe Cell]   [Defender]       [Defender]           |
            |        |            \\                 /               |
            |        v             v               v                |
            |   (Advance Col)       +-------------+                 |
            |        |              |   BLOCKED   |                 |
            |        |              +-------------+                 |
            |        |                     |                        |
            |        |              [Use Tactical Card]             |
            |        |               /            \\                 |
            |        |     (PASS / REPLAY / SUB)  (No Card/Concede) |
            |        |             /                \\               |
            |        |            v                  v              |
            |        |      +-------------+        [END]            |
            |        |      | CARD_SELECT |          ^              |
            |        |      +-------------+          |              |
            |        |                               |              |
            |   [Col 7 Cleared]                      |              |
            |        |                               |              |
            |        v                               |              |
            |   +----------------+                   |              |
            |   |      GOAL      |-------------------+              |
            |   +----------------+  (Auto Cashout)                  |
            +-------------------------------------------------------+
                    |                                ^
            [Cashout Clicked]                        |
                    +--------------------------------+
                                    |
                                    v
                                 [ END ]
                                    |
                             [New Match Click]
                                    |
                                    v
                               [ STANDBY ]
              `}</pre>
            </div>

            <h4 className="text-md font-semibold text-emerald-400 mt-4">2.1 Invariant Rules</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Bet Mutation Invariant:</strong> Bet size and stake chips cannot be changed during PLAYING.</li>
              <li><strong>Cashout Invariant:</strong> Cashout is rejected when <code>currentColumn &lt; 1</code>.</li>
              <li><strong>Auto Termination Invariant:</strong> Encountering a defender immediately halts AUTO and forces a transition to BLOCKED for player deliberation.</li>
              <li><strong>Timeout Policy:</strong> 30s timer. If timeout occurs at Column 0, the match ends as abandoned. If timeout occurs at Column &ge; 1, the engine executes an emergency auto-cashout protecting accumulated multiplier.</li>
            </ul>
          </div>
        )}

        {/* SECTION 3: ECONOMY BALANCING */}
        {activeSection === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-['Barlow_Condensed']">
              3. ECONOMY BALANCING & MATHEMATICAL ANALYSIS
            </h3>
            <p>
              In risk-reward games, multipliers must rise faster than raw risk to compensate for the exponential drop in survival probability while maintaining an RTP between 95% and 97%.
            </p>

            <h4 className="text-md font-semibold text-emerald-400 mt-4">3.1 Step-by-Step Probability & Payout Matrix</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-800 font-mono">
                <thead className="bg-slate-900 text-slate-300">
                  <tr>
                    <th className="p-2 border-b border-slate-800">Stage</th>
                    <th className="p-2 border-b border-slate-800">Survival Rate</th>
                    <th className="p-2 border-b border-slate-800">Cumulative P(Win)</th>
                    <th className="p-2 border-b border-slate-800">Classic Spec Mult</th>
                    <th className="p-2 border-b border-slate-800">Fair (97% RTP) Mult</th>
                    <th className="p-2 border-b border-slate-800">Classic Expected RTP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-2 text-emerald-400">Line 1</td>
                    <td className="p-2">75.00%</td>
                    <td className="p-2">75.000%</td>
                    <td className="p-2 font-bold text-slate-200">1.00x</td>
                    <td className="p-2 font-bold text-amber-400">1.29x</td>
                    <td className="p-2">75.00% (High Retention)</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-emerald-400">Line 2</td>
                    <td className="p-2">75.00%</td>
                    <td className="p-2">56.250%</td>
                    <td className="p-2 font-bold text-slate-200">1.15x</td>
                    <td className="p-2 font-bold text-amber-400">1.72x</td>
                    <td className="p-2">64.69%</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-emerald-400">Line 3</td>
                    <td className="p-2">75.00%</td>
                    <td className="p-2">42.188%</td>
                    <td className="p-2 font-bold text-slate-200">1.29x</td>
                    <td className="p-2 font-bold text-amber-400">2.30x</td>
                    <td className="p-2">54.42%</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-emerald-400">Line 4</td>
                    <td className="p-2">75.00%</td>
                    <td className="p-2">31.641%</td>
                    <td className="p-2 font-bold text-slate-200">1.52x</td>
                    <td className="p-2 font-bold text-amber-400">3.07x</td>
                    <td className="p-2">48.09%</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-emerald-400">Line 5</td>
                    <td className="p-2">75.00%</td>
                    <td className="p-2">23.730%</td>
                    <td className="p-2 font-bold text-slate-200">1.88x</td>
                    <td className="p-2 font-bold text-amber-400">4.09x</td>
                    <td className="p-2">44.61%</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-emerald-400">Line 6</td>
                    <td className="p-2">75.00%</td>
                    <td className="p-2">17.798%</td>
                    <td className="p-2 font-bold text-slate-200">2.47x</td>
                    <td className="p-2 font-bold text-amber-400">5.46x</td>
                    <td className="p-2">43.96%</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-emerald-400">Line 7</td>
                    <td className="p-2">75.00%</td>
                    <td className="p-2">13.348%</td>
                    <td className="p-2 font-bold text-slate-200">3.60x</td>
                    <td className="p-2 font-bold text-amber-400">7.28x</td>
                    <td className="p-2">48.05%</td>
                  </tr>
                  <tr className="bg-amber-950/20">
                    <td className="p-2 text-amber-400 font-bold">GOAL!</td>
                    <td className="p-2">100.00%</td>
                    <td className="p-2 font-bold">13.348%</td>
                    <td className="p-2 font-bold text-amber-300">7.26x</td>
                    <td className="p-2 font-bold text-amber-300">10.50x</td>
                    <td className="p-2 font-bold text-amber-400">96.91% (Goal Spike)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="text-md font-semibold text-emerald-400 mt-4">3.2 Tactical Card Economy & Anti-Exploit Rules</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Inventory-Based Persistence:</strong> Tactical cards cannot be purchased on the fly with wagered money inside an active match. They are earned via progression or purchased in the Standby clubhouse.</li>
              <li><strong>Strict Cap Ceilings:</strong> PASS &le; 3, REPLAY &le; 2, SHIELD &le; 2, SUBSTITUTE &le; 3, SCOUT &le; 3.</li>
              <li><strong>Risk Preservation Rule:</strong> Cards reduce acute variance but never remove risk completely. A player using PASS bypasses a single defender, but faces fresh 25% failure probabilities on subsequent lines.</li>
            </ul>
          </div>
        )}

        {/* SECTION 4: DATA MODEL */}
        {activeSection === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-['Barlow_Condensed']">
              4. UNIFIED DATA MODEL & STATE ISOLATION
            </h3>
            <p>
              The state tree is strictly separated into immutable match rounds, player inventory, persistent statistics, and active turn telemetry.
            </p>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-300">
              <pre>{`
interface GameState {
  // Phase lifecycle
  phase: 'STANDBY' | 'PLAYING' | 'END';
  subState: 'DRIBBLING' | 'BLOCKED' | 'CARD_SELECT' | 'AUTO' | 'GOAL';

  // Bankroll & Bet
  balance: number;
  bet: number;

  // Turn Timing
  timer: number;
  timerRunning: boolean;

  // 4x7 Defensive Matrix
  grid: GridCell[][];
  currentColumn: number;   // 0 (Kickoff) to 7 (Box)
  currentRow: number | null;

  // Card Inventory & Modifiers
  cardInventory: Record<TacticalCardType, number>;
  cardsUsedThisMatch: TacticalCardType[];
  isShieldArmed: boolean;
  replayUsedThisMatch: boolean;
  scoutedDefenderPos: CellPosition | null;

  // Automation
  autoPlan: {
    enabled: boolean;
    plannedRows: (number | null)[];
    currentStepIndex: number;
  };

  // Telemetry & Records
  lastRound: MatchRound | null;
  history: MatchRound[];
  stats: PlayerStats;
  soundEnabled: boolean;
  activeConfigId: 'classic' | 'fair';
}
              `}</pre>
            </div>
          </div>
        )}

        {/* SECTION 5: PIXI ARCHITECTURE */}
        {activeSection === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-['Barlow_Condensed']">
              5. PIXI.JS ARCHITECTURE & VIEW PIPELINE
            </h3>
            <p>
              Pixi.js v8 powers the interactive stadium pitch. The rendering pipeline is strictly decoupled from game rules and does not own state.
            </p>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-sky-300">
              <pre>{`
Pixi Scene Graph Z-Ordering:
=======================================================
[ Stage ]
  ├── [ pitchLayer ]       -> Mown turf stripes, penalty box, center circle
  ├── [ goalLayer ]        -> 3D white goalposts, netting mesh, crossbar
  ├── [ gridLayer ]        -> 28 interactive tactical cells (pointer events)
  ├── [ effectsLayer ]     -> Slide tackles, radar scout highlights, shadows
  ├── [ playerLayer ]      -> Striker token (lerped position, #9 jersey)
  ├── [ ballLayer ]        -> 32-panel spinning football with physics trail
  └── [ uiLayer ]          -> Pitch markings, Line numbers, Goal header
              `}</pre>
            </div>

            <h4 className="text-md font-semibold text-emerald-400 mt-4">5.1 Animation & Ticker Subsystem</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Position Lerping:</strong> Player token coordinates are smoothly interpolated with exponential damping (0.15 factor per tick) to create athletic motion rather than instant snapping.</li>
              <li><strong>Ball Dynamics:</strong> The ball trails the striker during normal runs, and transitions into a quadratic bezier trajectory toward the upper 90 net during the shooting sequence.</li>
              <li><strong>Pointer Dispatch:</strong> Pixi cells emit <code>onCellClick(col, row)</code> back to React without mutating any internal variables.</li>
            </ul>
          </div>
        )}

        {/* SECTION 6: COMPONENT BREAKDOWN */}
        {activeSection === 6 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-['Barlow_Condensed']">
              6. REACT COMPONENT BREAKDOWN
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li><strong>App.tsx:</strong> Root coordinator. Holds root <code>gameState</code>, manages turn timer ticker, delegates events to state machine and sound engine.</li>
              <li><strong>MatchHeader.tsx:</strong> Implements Top Bar Contract, multi-tab routing, sound muting, live multiplier ladder, and countdown timer.</li>
              <li><strong>PitchCanvas.tsx:</strong> Manages HTML canvas lifecycle, handles ResizeObserver, instantiates <code>FootballPitchView</code>.</li>
              <li><strong>BettingControls.tsx:</strong> Wager stepper, quick chip buttons, dynamic CASHOUT engine, ruleset switch.</li>
              <li><strong>TacticalCardsBar.tsx:</strong> Inventory tracker, active card cards, card deployment, Standby clubhouse shop.</li>
              <li><strong>BlockedModal.tsx:</strong> High-tension decision modal shown when tackled, allowing deployment of PASS, REPLAY, or SUBSTITUTE.</li>
              <li><strong>GoalCelebrationOverlay.tsx:</strong> Full-screen modal with particle celebration, payout calculations, and next match trigger.</li>
              <li><strong>AutoPlanModal.tsx:</strong> Interactive 4x7 route plotter for pre-planned dribbles.</li>
              <li><strong>MatchHistoryDrawer.tsx:</strong> Match log table, career metrics, and win-rate statistics.</li>
            </ul>
          </div>
        )}

        {/* SECTION 7: TYPESCRIPT INTERFACES */}
        {activeSection === 7 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-['Barlow_Condensed']">
              7. COMPLETE TYPESCRIPT INTERFACES
            </h3>
            <p className="text-xs text-slate-400">
              Clean contracts located in <code>/src/types/game.ts</code>:
            </p>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-amber-300">
              <pre>{`
export type MainPhase = 'STANDBY' | 'PLAYING' | 'END';
export type PlayingSubState = 'DRIBBLING' | 'BLOCKED' | 'CARD_SELECT' | 'AUTO' | 'GOAL';
export type TacticalCardType = 'PASS' | 'REPLAY' | 'SHIELD' | 'SUBSTITUTE' | 'SCOUT';

export interface GridCell {
  col: number;
  row: number;
  hasDefender: boolean;
  status: 'hidden' | 'scouted_safe' | 'scouted_defender' | 'cleared' | 'tackled' | 'bypassed';
  selectedInAuto?: boolean;
}

export interface MatchRound {
  id: string;
  timestamp: number;
  betAmount: number;
  currentColumn: number;
  currentRow: number | null;
  historySteps: { col: number; row: number; safe: boolean; cardUsed?: TacticalCardType }[];
  payoutMultiplier: number;
  potentialPayout: number;
  finalPayout: number;
  result: 'IN_PROGRESS' | 'CASHED_OUT' | 'GOAL_SCORED' | 'BLOCKED_LOST' | 'TIMEOUT_ABANDONED';
  cardsUsedThisRound: TacticalCardType[];
  shieldActive: boolean;
  replayUsed: boolean;
  activeScoutedColumn: number | null;
}
              `}</pre>
            </div>
          </div>
        )}

        {/* SECTION 8: FOLDER STRUCTURE */}
        {activeSection === 8 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-['Barlow_Condensed']">
              8. PRODUCTION FOLDER STRUCTURE
            </h3>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300">
              <pre>{`
/src/
  ├── types/
  │   └── game.ts                    # Core TypeScript domain types
  ├── logic/
  │   ├── gameRules.ts               # Multipliers, defenders generator, RTP math
  │   ├── stateMachine.ts            # State transition guards & cashout logic
  │   └── soundFx.ts                 # Web Audio synthesizer for sports FX
  ├── pixi/
  │   └── FootballPitchView.ts       # Pixi.js v8 stadium canvas view layer
  ├── components/
  │   ├── PitchCanvas.tsx            # Pixi wrapper & status breadcrumbs
  │   ├── MatchHeader.tsx            # Top bar, balance, timer, ladder
  │   ├── BettingControls.tsx        # Stake adjustment, cashout trigger
  │   ├── TacticalCardsBar.tsx       # Card deck, inventory caps, deployment
  │   ├── BlockedModal.tsx           # Defensive tackle rescue modal
  │   ├── GoalCelebrationOverlay.tsx # Cinematic goal celebration & payout
  │   ├── AutoPlanModal.tsx          # Pre-selected route planner
  │   ├── MatchHistoryDrawer.tsx     # Career stats & history logs
  │   └── GddModal.tsx               # 10-Deliverables Architecture & GDD
  ├── assets/
  │   └── images/                    # Generated high-fidelity sports art
  ├── App.tsx                        # Root game coordinator
  ├── main.tsx                       # React 19 entry point
  └── index.css                      # Tailwind v4 configuration & font themes
              `}</pre>
            </div>
          </div>
        )}

        {/* SECTION 9: MVP IMPLEMENTATION PLAN */}
        {activeSection === 9 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-['Barlow_Condensed']">
              9. MVP IMPLEMENTATION PLAN (COMPLETED PHASES)
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-3">
                <span className="font-mono text-emerald-400 font-bold">Phase 1:</span>
                <div>
                  <strong>Football Theming & Pitch Reskin:</strong> Built 4x7 turf grid, striker with #9 jersey, rotating football, dynamic defender slide tackles, 18-yard box, and goal net.
                </div>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-3">
                <span className="font-mono text-emerald-400 font-bold">Phase 2:</span>
                <div>
                  <strong>Blocked Sub-State & Tactical Interventions:</strong> Implemented pure transition from DRIBBLING to BLOCKED upon defender collision, opening the rescue window.
                </div>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-3">
                <span className="font-mono text-emerald-400 font-bold">Phase 3:</span>
                <div>
                  <strong>Complete Card Suite:</strong> Implemented PASS (bypass), REPLAY (VAR review), SHIELD (50% loss preservation), SUBSTITUTE (fresh player), and SCOUT (radar recon).
                </div>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-3">
                <span className="font-mono text-emerald-400 font-bold">Phase 4:</span>
                <div>
                  <strong>Sequential Auto-Mode:</strong> Added visual 4x7 route planner executing stored choices with immediate emergency stoppage on defender encounter.
                </div>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-3">
                <span className="font-mono text-emerald-400 font-bold">Phase 5:</span>
                <div>
                  <strong>Audio & Visual Polish:</strong> Synthesized Web Audio API whistle, kicks, crowds, and confetti goal celebrations.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 10: FUTURE ROADMAP */}
        {activeSection === 10 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-['Barlow_Condensed']">
              10. FUTURE EXPANSION ROADMAP
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li><strong>PvP Penalty Shootout Tiebreakers:</strong> If two players enter a synchronized tournament match, clearing line 7 opens a head-to-head goalkeeper duel.</li>
              <li><strong>Club Leagues & Seasons:</strong> Monthly leaderboards ranking players by longest dribble streaks, highest cashouts, and career goals.</li>
              <li><strong>Dynamic Weather & Pitch Conditions:</strong> Wet turf increasing ball speed (shorter timer, higher multiplier bonuses); muddy turf adding stamina meters.</li>
              <li><strong>Customizable Kits & Boots:</strong> Unlockable collectible boots granting cosmetic trail effects and rare tactical card drops on milestones.</li>
              <li><strong>Provably Fair Cryptographic Verification:</strong> SHA-256 client/server seed hashing allowing players to verify defender positions post-round.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
