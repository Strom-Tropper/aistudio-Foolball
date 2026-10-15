/**
 * FootballPitchView - Composition Root for Arcade Football Confrontation View Layer
 * 
 * Architecture:
 * - Pure composition root that instantiates entities, connects systems, and manages rendering pipeline.
 * - Entities: Ball, Player, Defender, Goalkeeper (each split into Sprite, Animator, Controller, Effects)
 * - Systems: CardSystem, DribbleSystem, CollisionSystem, CashoutSystem, AnimationSystem, AutoSystem
 * - Visual match history: Persists visual markers on pitch for PASS, REPLAY, SHIELD, and SUBSTITUTE
 */

import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { GameState, GridCell } from '../types/game';
import { GRID_COLS, GRID_ROWS, getMultiplierForCleared, getGoalMultiplier } from '../logic/gameRules';

// Entities
import { BallController } from './entities/ball/BallController';
import { PlayerController } from './entities/player/PlayerController';
import { DefenderController } from './entities/defender/DefenderController';
import { DefenderSprite } from './entities/defender/DefenderSprite';
import { GoalkeeperController } from './entities/goalkeeper/GoalkeeperController';

// Systems
import { AnimationSystem } from './systems/AnimationSystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { DribbleSystem } from './systems/DribbleSystem';
import { CardSystem } from './systems/CardSystem';
import { CashoutSystem } from './systems/CashoutSystem';
import { AutoSystem } from './systems/AutoSystem';
import { preloadCharacterSprites, characterFrames } from './entities/characterSprites';

export interface FootballPitchViewCallbacks {
  onCellClick: (col: number, row: number) => void;
  onGoalShootComplete?: () => void;
}

export class FootballPitchView {
  private app: Application | null = null;
  private canvasContainer: HTMLDivElement;
  private callbacks: FootballPitchViewCallbacks;
  private isDestroyed = false;

  // Root rendering layers in strict Z-order
  private pitchLayer = new Container();
  private goalLayer = new Container();
  private gridLayer = new Container();
  private effectsLayer = new Container();
  private defenderLayer = new Container();
  private playerLayer = new Container();
  private ballLayer = new Container();
  private uiLayer = new Container();

  // Entities (Modular Architecture)
  public readonly ball: BallController;
  public readonly player: PlayerController;
  public readonly defender: DefenderController;
  public readonly goalkeeper: GoalkeeperController;

  // Systems (Modular Architecture)
  public readonly animationSystem: AnimationSystem;
  public readonly collisionSystem: CollisionSystem;
  public readonly dribbleSystem: DribbleSystem;
  public readonly cardSystem: CardSystem;
  public readonly cashoutSystem: CashoutSystem;
  public readonly autoSystem: AutoSystem;

  // Pitch Static Elements
  private goalNet = new Container();

  // Pitch Layout & Dimensions
  public width = 860;
  public height = 400;
  public cellWidth = 100;
  public cellHeight = 82;
  public gridStartX = 55;
  public gridStartY = 38;

  // State cache
  private lastState: GameState | null = null;
  private isShootingGoal = false;
  private passedBlockers: DefenderSprite[] = [];
  private blockerClock = 0;
  private blockerFallStart = new Map<string, number>();
  private goalShotPlayed = false;
  private keeperDiveStarted = false;

  constructor(container: HTMLDivElement, callbacks: FootballPitchViewCallbacks) {
    this.canvasContainer = container;
    this.callbacks = callbacks;

    // Instantiate Entities
    this.ball = new BallController();
    this.player = new PlayerController();
    this.defender = new DefenderController();
    this.goalkeeper = new GoalkeeperController();

    // Instantiate Systems
    this.animationSystem = new AnimationSystem();
    this.collisionSystem = new CollisionSystem(this.animationSystem);
    this.dribbleSystem = new DribbleSystem();
    this.cardSystem = new CardSystem();
    this.cashoutSystem = new CashoutSystem();
    this.autoSystem = new AutoSystem();
  }

  /**
   * Initialize Pixi WebGL / WebGPU Application
   */
  public async init(): Promise<void> {
    const app = new Application();
    const rect = this.canvasContainer.getBoundingClientRect();
    const initialWidth = Math.max(rect.width || 860, 540);
    const initialHeight = Math.max(rect.height || 400, 340);

    await app.init({
      width: initialWidth,
      height: initialHeight,
      antialias: false, // Crisp arcade pixel presentation
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
      backgroundColor: 0x052e16,
    });

    if (this.isDestroyed) {
      app.destroy(true);
      return;
    }

    await preloadCharacterSprites();
    if (this.isDestroyed) {
      app.destroy(true);
      return;
    }
    this.player.sprite.redraw();
    this.defender.tacklingSprite.redraw();
    this.goalkeeper.sprite.redraw();
    this.ball.sprite.redraw();

    this.app = app;
    this.canvasContainer.appendChild(app.canvas);

    // Assemble Stage Hierarchy
    app.stage.addChild(this.pitchLayer);
    app.stage.addChild(this.goalLayer);
    app.stage.addChild(this.gridLayer);
    app.stage.addChild(this.effectsLayer);
    app.stage.addChild(this.defenderLayer);
    app.stage.addChild(this.playerLayer);
    app.stage.addChild(this.ballLayer);
    app.stage.addChild(this.uiLayer);

    // Mount System & Entity Display Objects
    this.gridLayer.addChild(this.dribbleSystem.pathGraphics);
    this.effectsLayer.addChild(this.animationSystem.particleGraphics);
    this.effectsLayer.addChild(this.animationSystem.shockwaveGraphics);

    this.goalLayer.addChild(this.goalNet);
    this.goalLayer.addChild(this.goalkeeper.container);

    this.defenderLayer.addChild(this.defender.container);
    this.playerLayer.addChild(this.player.container);
    this.ballLayer.addChild(this.ball.container);

    this.resize(initialWidth, initialHeight);

    // 60 FPS Ticker loop
    app.ticker.add(this.updateTicker, this);
  }

  /**
   * Handle responsive viewport resizing
   */
  public resize(newWidth: number, newHeight: number): void {
    if (!this.app) return;
    if (newWidth === this.width && newHeight === this.height) return;
    this.width = newWidth;
    this.height = newHeight;
    this.app.renderer.resize(newWidth, newHeight);

    const leftMargin = 55;
    const rightMargin = 55;
    const availableWidth = this.width - (leftMargin + rightMargin);
    this.cellWidth = Math.floor(availableWidth / GRID_COLS);

    this.gridStartX = leftMargin;
    this.gridStartY = 36;
    const bottomMargin = 12;
    const availableHeight = this.height - this.gridStartY - bottomMargin;
    this.cellHeight = Math.floor(availableHeight / GRID_ROWS);

    this.drawArcadePitch();
    this.setupGoalNetAndKeeper();

    if (this.lastState) {
      this.renderState(this.lastState);
    }
  }

  /**
   * Draw Arcade Football Pitch (Kunio-kun / Soccer Story alternating lawn mowing bands)
   */
  private drawArcadePitch(): void {
    this.pitchLayer.removeChildren();
    const g = new Graphics();

    // 14 Alternating mowing grass bands
    const bandWidth = Math.floor(this.width / 14);
    for (let i = 0; i < 14; i++) {
      const color = i % 2 === 0 ? 0x166534 : 0x15803d;
      g.rect(i * bandWidth, 0, bandWidth + 1, this.height).fill(color);
    }

    // Subtle turf grain texture
    for (let x = 6; x < this.width - 6; x += 16) {
      for (let y = 6; y < this.height - 6; y += 12) {
        if ((x + y) % 3 === 0) {
          g.rect(x, y, 3, 3).fill({ color: 0x22c55e, alpha: 0.15 });
        } else if ((x + y) % 5 === 0) {
          g.rect(x + 2, y + 2, 3, 3).fill({ color: 0x14532d, alpha: 0.25 });
        }
      }
    }

    // Outer touchline
    const margin = 6;
    const topMargin = 28; // Space for retro stadium sponsor perimeter boards
    g.rect(margin, topMargin, this.width - margin * 2, this.height - topMargin - margin)
      .stroke({ width: 2.5, color: 0xffffff, alpha: 0.65 });

    // Halfway / Kickoff Line
    const startLineX = this.gridStartX - 18;
    g.moveTo(startLineX, topMargin)
      .lineTo(startLineX, this.height - margin)
      .stroke({ width: 2.5, color: 0xffffff, alpha: 0.45 });

    // Kickoff mark stays left of column 1 so it does not cover the board
    g.arc(startLineX, (this.height + topMargin) / 2, 18, -Math.PI / 2, Math.PI / 2)
      .stroke({ width: 1.5, color: 0xffffff, alpha: 0.28 });

    // 18-Yard Penalty Box
    const boxX = this.gridStartX + this.cellWidth * GRID_COLS + 4;
    const boxW = Math.max(38, this.width - boxX - margin);
    const boxH = Math.min(this.height - topMargin - 18, this.cellHeight * GRID_ROWS + 14);
    const boxY = (this.height + topMargin - boxH) / 2;

    g.rect(boxX, boxY, boxW, boxH)
      .stroke({ width: 2.5, color: 0xffffff, alpha: 0.55 });

    // 6-Yard Box
    const smallBoxW = boxW * 0.55;
    const smallBoxH = boxH * 0.5;
    const smallBoxY = boxY + (boxH - smallBoxH) / 2;
    g.rect(boxX + (boxW - smallBoxW), smallBoxY, smallBoxW, smallBoxH)
      .stroke({ width: 2, color: 0xffffff, alpha: 0.4 });

    // Penalty Spot
    const penaltySpotX = boxX + Math.min(18, boxW * 0.4);
    g.rect(penaltySpotX - 2, boxY + boxH / 2 - 2, 4, 4).fill(0xffffff);

    this.pitchLayer.addChild(g);
  }

  /**
   * Set up Arcade Goal Net & Positioning Goalkeeper
   */
  private setupGoalNetAndKeeper(): void {
    this.goalNet.removeChildren();
    const g = new Graphics();

    const netX = this.width - 20;
    const netH = Math.min(160, this.cellHeight * 2.5);
    const netY = (this.height + 28 - netH) / 2;
    const netW = 16;

    // Goal mouth dark depth
    g.rect(netX, netY, netW, netH).fill({ color: 0x022c22, alpha: 0.95 });
    g.rect(netX + 2, netY + 2, netW - 4, netH - 4).fill({ color: 0x011f18, alpha: 0.98 });

    // Hexagonal / Diamond Net Mesh (white & blue arcade net pattern)
    for (let y = netY; y <= netY + netH; y += 7) {
      g.moveTo(netX, y).lineTo(netX + netW, y).stroke({ width: 1.5, color: 0xffffff, alpha: 0.4 });
    }
    for (let x = netX; x <= netX + netW; x += 4) {
      g.moveTo(x, netY).lineTo(x, netY + netH).stroke({ width: 1.5, color: 0x93c5fd, alpha: 0.35 });
    }

    // Rear goal stanchions (angled support poles)
    g.moveTo(netX, netY).lineTo(netX + netW, netY + 6).stroke({ width: 2, color: 0x64748b });
    g.moveTo(netX, netY + netH).lineTo(netX + netW, netY + netH - 6).stroke({ width: 2, color: 0x64748b });

    // Chunky White 3D Posts & Crossbar (Front frame)
    g.rect(netX - 4, netY - 2, 5, netH + 4).fill(0x0f172a); // dark outline
    g.rect(netX - 3, netY - 1, 4, netH + 2).fill(0xf8fafc); // cylindrical post
    g.rect(netX - 2, netY - 1, 2, netH + 2).fill(0xffffff); // highlight
    g.circle(netX - 1, netY - 1, 3).fill(0xffffff);
    g.circle(netX - 1, netY + netH + 1, 3).fill(0xffffff);

    this.goalNet.addChild(g);

    // Position Goalkeeper in center of goalmouth
    // The sprite is anchored at its feet, so offset it below the goal center
    // to center the visible body inside the goal mouth.
    this.goalkeeper.setPosition(netX - 16, (this.height + 28) / 2 + 32);
  }

  /**
   * Render Main Game Pipeline
   */
  public renderState(state: GameState): void {
    const prevCardCount = this.lastState?.cardsUsedThisMatch.length ?? 0;
    this.lastState = state;
    if (!this.app) return;

    if (state.currentColumn === 0 && state.subState !== 'BLOCKED') {
      this.blockerFallStart.clear();
    }

    this.gridLayer.removeChildren();
    this.gridLayer.addChild(this.dribbleSystem.pathGraphics);

    this.defenderLayer.removeChildren();
    this.defenderLayer.addChild(this.defender.container);
    this.passedBlockers = [];

    this.uiLayer.removeChildren();

    const isPlaying = state.phase === 'PLAYING';
    const currentActiveCol = isPlaying && state.subState === 'DRIBBLING' ? state.currentColumn : -1;

    // 1. Render Multiplier Banners above lines 1 to 7
    this.renderMultiplierHeaders(state, isPlaying);

    // 2. Render 4x7 Defensive Grid with confrontation lineup & match history markers
    for (let c = 0; c < GRID_COLS; c++) {
      for (let r = 0; r < GRID_ROWS; r++) {
        const cell = state.grid[c] ? state.grid[c][r] : null;
        this.renderGridCell(c, r, cell, state, currentActiveCol);
      }
    }

    // 3. Update Striker & Ball target positions
    this.player.updateCoordinatesFromState(
      state,
      this.gridStartX,
      this.gridStartY,
      this.cellWidth,
      this.cellHeight
    );

    // Position ball relative to striker feet, tackled confrontation cell, or kickoff spot
    if (!this.isShootingGoal && !this.defender.animator.isActive) {
      const isBlocked =
        state.subState === 'BLOCKED' ||
        (state.phase === 'END' && state.lastRound?.result === 'BLOCKED_LOST');

      if (isBlocked && state.currentRow !== null && state.currentColumn >= 0) {
        // Ball stays arrested right at the confrontation tackle point
        this.ball.setTarget(this.player.targetPos.x + 10, this.player.targetPos.y + 2);
      } else if (state.phase === 'STANDBY' || (state.phase === 'PLAYING' && state.currentColumn === 0)) {
        const startX = this.gridStartX - 28;
        const centerY = this.gridStartY + (this.cellHeight * GRID_ROWS) / 2;
        this.ball.setTarget(startX + 16, centerY + 4);
      } else if (state.subState === 'GOAL' || (state.phase === 'END' && state.lastRound?.result === 'GOAL_SCORED')) {
        const rest = this.ballInsideNet();
        this.ball.setTarget(rest.x, rest.y);
      } else if (state.currentColumn > 0 && state.currentColumn <= GRID_COLS) {
        this.ball.setTarget(this.player.targetPos.x + 15, this.player.targetPos.y + 4);
      } else if (state.currentColumn > GRID_COLS) {
        const rest = this.ballInsideNet();
        this.ball.setTarget(rest.x, rest.y);
      }
    }

    // 4. Update Dribble Progression Route (Single authoritative attack route)
    const route = this.dribbleSystem.calculateRoute(
      state,
      this.gridStartX,
      this.gridStartY,
      this.cellWidth,
      this.cellHeight
    );
    this.dribbleSystem.renderPath(route);

    // 5. Update Striker Poses
    const isStrikerTackled =
      state.subState === 'BLOCKED' ||
      (state.phase === 'END' && state.lastRound?.result === 'BLOCKED_LOST');
    const isStrikerCelebrating =
      state.subState === 'GOAL' ||
      (state.phase === 'END' && state.lastRound?.result === 'GOAL_SCORED');

    const goalScored = state.subState === 'GOAL';
    if (!goalScored && (state.phase !== 'PLAYING' || state.currentColumn === 0)) {
      this.goalkeeper.setDiving(false);
      this.goalShotPlayed = false;
      this.keeperDiveStarted = false;
    }
    if (goalScored && !this.goalShotPlayed) {
      this.goalShotPlayed = true;
      this.triggerGoalShot();
    }

    const usedCard = state.cardsUsedThisMatch.length > prevCardCount;
    const lastCard = state.cardsUsedThisMatch[state.cardsUsedThisMatch.length - 1];
    const dodgeCard =
      usedCard &&
      (lastCard === 'PASS' || lastCard === 'SUBSTITUTE') &&
      state.subState !== 'GOAL';
    if (isStrikerTackled) {
      this.player.setPose('tackled');
    } else if (this.isShootingGoal) {
      this.player.setPose('shooting');
    } else if (isStrikerCelebrating) {
      this.player.setPose('celebrating');
    } else if (dodgeCard) {
      this.player.playDodge();
    } else if (this.player.sprite.pose !== 'dodging') {
      this.player.setPose('running');
    }

  }

  /**
   * Render Multiplier Header Badges
   */
  private renderMultiplierHeaders(state: GameState, isPlaying: boolean): void {
    const badgeY = 8;
    const badgeH = 22;

    for (let c = 0; c < GRID_COLS; c++) {
      const colX = this.gridStartX + c * this.cellWidth;
      const colW = this.cellWidth - 6;
      const colCenterX = colX + this.cellWidth / 2;
      const isPassed = state.currentColumn > c;
      const isActive = state.currentColumn === c && isPlaying;
      const mult = this.cashoutSystem.getLineMultiplier(c + 1, state.activeConfigId);

      const badgeG = new Graphics();
      if (isActive) {
        badgeG.rect(colX + 3, badgeY, colW, badgeH).fill(0x166534);
        badgeG.rect(colX + 3, badgeY, colW, badgeH).stroke({ width: 2, color: 0x4ade80 });
      } else if (isPassed) {
        badgeG.rect(colX + 3, badgeY, colW, badgeH).fill(0x064e3b);
        badgeG.rect(colX + 3, badgeY, colW, badgeH).stroke({ width: 1, color: 0x10b981 });
      } else {
        badgeG.rect(colX + 3, badgeY, colW, badgeH).fill(0x0f172a);
        badgeG.rect(colX + 3, badgeY, colW, badgeH).stroke({ width: 1, color: 0x334155 });
      }
      this.uiLayer.addChild(badgeG);

      const headerStyle = new TextStyle({
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: 12,
        fontWeight: 'bold',
        fill: isActive ? 0xffffff : isPassed ? 0xa7f3d0 : 0x94a3b8,
      });

      const colText = new Text({
        text: `L${c + 1} · ${mult.toFixed(2)}x`,
        style: headerStyle,
      });
      colText.anchor.set(0.5);
      colText.position.set(colCenterX, badgeY + badgeH / 2);
      this.uiLayer.addChild(colText);
    }

    // Goal Badge
    const goalX = this.gridStartX + GRID_COLS * this.cellWidth + 3;
    const goalW = Math.max(42, this.width - goalX - 8);
    const goalMult = getGoalMultiplier(state.activeConfigId);
    const isGoalActive = state.currentColumn >= GRID_COLS;

    const goalBadgeG = new Graphics();
    if (isGoalActive) {
      goalBadgeG.rect(goalX, badgeY, goalW, badgeH).fill(0x78350f);
      goalBadgeG.rect(goalX, badgeY, goalW, badgeH).stroke({ width: 2, color: 0xf59e0b });
    } else {
      goalBadgeG.rect(goalX, badgeY, goalW, badgeH).fill(0x1c1917);
      goalBadgeG.rect(goalX, badgeY, goalW, badgeH).stroke({ width: 1, color: 0xd97706 });
    }
    this.uiLayer.addChild(goalBadgeG);

    const goalHeaderStyle = new TextStyle({
      fontFamily: 'Barlow Condensed, sans-serif',
      fontSize: 11,
      fontWeight: 'bold',
      fill: isGoalActive ? 0xfef08a : 0xfbbf24,
    });
    const goalText = new Text({
      text: `GOAL · ${goalMult.toFixed(2)}x`,
      style: goalHeaderStyle,
    });
    goalText.anchor.set(0.5);
    goalText.position.set(goalX + goalW / 2, badgeY + badgeH / 2);
    this.uiLayer.addChild(goalText);
  }

  /**
   * Render individual grid cell with tactical interaction, defender obstacles, and resolution markers
   */
  private renderGridCell(
    col: number,
    row: number,
    cell: GridCell | null,
    state: GameState,
    currentActiveCol: number
  ): void {
    const cellContainer = new Container();
    const cellX = this.gridStartX + col * this.cellWidth;
    const cellY = this.gridStartY + row * this.cellHeight;
    const w = this.cellWidth - 8;
    const h = this.cellHeight - 6;

    cellContainer.position.set(cellX + 4, cellY + 3);

    const isCurrentActiveCol = col === currentActiveCol;
    const isPastCol = col < state.currentColumn;
    const replayOpen =
      state.subState === 'DRIBBLING' &&
      (state.grid[state.currentColumn]?.some((c) => c.resolvedWithCard === 'REPLAY') ?? false);
    let stoodRow = state.currentRow;
    if (replayOpen && state.currentColumn > 0) {
      const prevRow = state.grid[state.currentColumn - 1]?.findIndex(
        (c) => c.status === 'cleared' || c.status === 'bypassed' || c.resolvedWithCard === 'PASS'
      );
      if (prevRow !== undefined && prevRow !== -1) stoodRow = prevRow;
    }
    const isPlayerHere = state.currentColumn === col + 1 && stoodRow === row;
    const isBlockedHere =
      state.currentColumn === col &&
      state.currentRow === row &&
      (state.subState === 'BLOCKED' ||
        (state.phase === 'END' && state.lastRound?.result === 'BLOCKED_LOST'));
    const isScouted =
      state.scoutedDefenderPos?.col === col && state.scoutedDefenderPos?.row === row;
    const isMatchEnded = state.phase === 'END';

    const bgG = new Graphics();

    const drawAttackChevron = (graphics: Graphics, color: number, alpha: number) => {
      const cx = w / 2;
      const cy = h / 2;
      // Tactical forward attacking run chevron ➤
      graphics.moveTo(cx - 7, cy - 6).lineTo(cx - 1, cy).lineTo(cx - 7, cy + 6)
        .stroke({ width: 2, color, alpha });
      graphics.moveTo(cx, cy - 6).lineTo(cx + 6, cy).lineTo(cx, cy + 6)
        .stroke({ width: 2, color, alpha });
    };

    const card = cell?.resolvedWithCard;
    const isPassLane = card === 'PASS' || cell?.status === 'bypassed';
    const isSubLane = card === 'SUBSTITUTE';
    const isReplayLane = card === 'REPLAY';
    const replayStillOpen = isReplayLane && isCurrentActiveCol;

    const paintTile = (fill: number, fillAlpha: number, stroke: number, strokeAlpha: number, strokeW: number) => {
      bgG.rect(0, 0, w, h).fill({ color: fill, alpha: fillAlpha });
      bgG.rect(0, 0, w, h).stroke({ width: strokeW, color: stroke, alpha: strokeAlpha });
    };

    if (isBlockedHere) {
      paintTile(0x7f1d1d, 0.72, 0xef4444, 1, 2.5);
    } else if (isPassLane) {
      paintTile(0x0369a1, 0.55, 0x7dd3fc, 1, 2);
    } else if (isSubLane) {
      paintTile(0x064e3b, 0.7, 0x34d399, 1, 2.5);
    } else if (isReplayLane && !replayStillOpen) {
      paintTile(0x7c2d12, 0.6, 0xfb923c, 1, 2);
    } else if (cell?.status === 'cleared' || isPlayerHere) {
      paintTile(0x14532d, 0.62, 0x4ade80, 1, 2);
    } else if (isCurrentActiveCol) {
      paintTile(0x166534, 0.78, 0xffffff, 1, 2.5);
      drawAttackChevron(bgG, 0xffffff, 0.95);

      cellContainer.eventMode = 'static';
      cellContainer.cursor = 'pointer';

      cellContainer.on('pointerover', () => {
        bgG.clear();
        paintTile(0x22c55e, 0.88, 0xffffff, 1, 3);
        drawAttackChevron(bgG, 0xffffff, 1);
      });

      cellContainer.on('pointerout', () => {
        bgG.clear();
        paintTile(0x166534, 0.78, 0xffffff, 1, 2.5);
        drawAttackChevron(bgG, 0xffffff, 0.95);
      });

      cellContainer.on('pointerdown', () => {
        const cellCenterX = cellX + w / 2;
        const footY = cellY + h / 2 + 18;
        if (cell?.hasDefender) {
          this.player.setTarget(cellCenterX - 14, footY);
          this.ball.setTarget(cellCenterX - 4, footY + 4);

          this.defender.triggerConfrontation(col, row, cellCenterX, footY, () => {
            this.callbacks.onCellClick(col, row);
          });
        } else {
          this.animationSystem.emitImpactSparks(cellCenterX, footY - 10);
          this.callbacks.onCellClick(col, row);
        }
      });
    } else if (isPastCol) {
      paintTile(0x022c22, 0.42, 0xffffff, 0.35, 1.5);
    } else {
      paintTile(0x052e16, 0.5, 0xffffff, 0.78, 1.5);
    }

    cellContainer.addChildAt(bgG, 0);
    this.gridLayer.addChild(cellContainer);

    // 2. DEFENDER VISIBILITY & RESOLUTION MARKERS
    // History should remain visible on the pitch!
    const placeDefender = (pose: 'idle' | 'fall') => {
      const defSprite = new DefenderSprite();
      const fallFrames = characterFrames('fall');
      const fallDuration = Math.max(fallFrames.length, 1) * 6;
      const fallKey = `${col},${row}`;
      let showIdle = pose === 'idle';
      if (pose === 'fall') {
        if (!this.blockerFallStart.has(fallKey)) {
          this.blockerFallStart.set(fallKey, this.blockerClock);
        }
        const elapsed = this.blockerClock - (this.blockerFallStart.get(fallKey) ?? this.blockerClock);
        showIdle = elapsed >= fallDuration;
        if (!showIdle) {
          defSprite.draw('fall');
          defSprite.align(elapsed);
        }
      }
      if (showIdle) {
        defSprite.draw('idle');
        defSprite.align(this.blockerClock);
      }
      this.passedBlockers.push(defSprite);
      defSprite.container.position.set(cellX + w / 2, cellY + h / 2 + 18);
      this.defenderLayer.addChild(defSprite.container);
    };

    const passedColumn = col < state.currentColumn;

    if (isBlockedHere) {
      placeDefender('fall');

      const cardG = new Graphics();
      cardG.rect(cellX + w / 2 + 16, cellY + h / 2 - 8, 8, 12).fill(0xef4444);
      cardG.rect(cellX + w / 2 + 16, cellY + h / 2 - 8, 8, 12).stroke({ width: 1, color: 0xffffff });
      this.uiLayer.addChild(cardG);

      if (state.isShieldArmed) {
        this.cardSystem.renderResolutionMarker(cellContainer, 'SHIELD', w, h);
      }
    } else if (isPassLane || isSubLane || (isReplayLane && !replayStillOpen) || (passedColumn && cell?.hasDefender)) {
      placeDefender('idle');
      if (isPassLane) this.cardSystem.renderResolutionMarker(cellContainer, 'PASS', w, h);
      if (isSubLane) this.cardSystem.renderResolutionMarker(cellContainer, 'SUBSTITUTE', w, h);
      if (isReplayLane) this.cardSystem.renderResolutionMarker(cellContainer, 'REPLAY', w, h);
    } else if (isReplayLane) {
      this.cardSystem.renderResolutionMarker(cellContainer, 'REPLAY', w, h);
    } else if (isScouted) {
      this.cardSystem.renderResolutionMarker(cellContainer, 'SCOUT', w, h);
    }

    // 3. Footprint cleat stud trail on cleared lines
    if (isPastCol && cell?.status === 'cleared') {
      this.player.effects.drawCleatPrints(cellContainer, w, h);
    }
  }

  /**
   * Goal Shoot Trigger:
   * Sequence:
   * 1. Player stops outside penalty area
   * 2. Shooting animation (striker wind-up & kick)
   * 3. Ball launches toward goal
   * 4. Goalkeeper reacts
   * 5. Ball enters net
   * 6. Player celebrates outside penalty area
   * The ball scores; the player NEVER enters the goal.
   */
  private triggerGoalShot(): void {
    this.isShootingGoal = true;

    // 1. Player stops outside penalty area in the final line (Line 7)
    const shootingSpotX = this.gridStartX + (GRID_COLS - 1) * this.cellWidth + this.cellWidth / 2;
    const lastRowIndex = this.lastState?.grid[GRID_COLS - 1]?.findIndex(
      (c) => c.status === 'cleared' || c.status === 'bypassed' || c.resolvedWithCard === 'PASS'
    );
    const shootRow =
      lastRowIndex !== -1 && lastRowIndex !== undefined ? lastRowIndex : (this.lastState?.currentRow ?? 1);
    const shootingSpotY = this.gridStartY + shootRow * this.cellHeight + this.cellHeight / 2 + 18;

    this.player.setPosition(shootingSpotX, shootingSpotY);
    this.player.setPose('shooting');

    const rest = this.ballInsideNet();
    this.ball.container.visible = true;
    this.ball.setPosition(shootingSpotX + 16, shootingSpotY - 8);
    this.ball.shootAtGoal(rest.x, rest.y);
  }

  private ballInsideNet(): { x: number; y: number } {
    const netX = this.width - 20;
    const netH = Math.min(160, this.cellHeight * 2.5);
    const netY = (this.height + 28 - netH) / 2;
    return { x: netX + 8, y: netY + netH * 0.58 };
  }

  /**
   * 60fps Ticker Loop: Coordinate all entity controllers and systems
   */
  private updateTicker(ticker: { deltaTime: number }): void {
    const dt = ticker.deltaTime || 1;

    // 1. Update Animation System (Camera Shake, Shockwaves, Particles)
    if (this.app) {
      this.animationSystem.updateCameraShake(this.app.stage, dt);
    }
    this.animationSystem.updateShockwave(dt);
    this.animationSystem.updateParticles(dt);
    this.dribbleSystem.update(dt);
    this.blockerClock += dt;
    for (const blocker of this.passedBlockers) blocker.step(dt);

    if (this.lastState) {
      const route = this.dribbleSystem.calculateRoute(
        this.lastState,
        this.gridStartX,
        this.gridStartY,
        this.cellWidth,
        this.cellHeight
      );
      this.dribbleSystem.renderPath(route);
    }

    // 2. Update Goalkeeper Controller
    const isPlaying = this.lastState?.phase === 'PLAYING';
    this.goalkeeper.update(
      dt,
      (this.height + 28) / 2,
      this.player.currentPos.y,
      this.ball.currentPos.y,
      isPlaying,
      this.isShootingGoal
    );

    // 3. Update Defender Confrontation Rush
    if (this.defender.animator.isActive) {
      const cellCenterX = this.gridStartX + this.defender.tacklingCol * this.cellWidth + this.cellWidth / 2;
      const cellCenterY = this.gridStartY + this.defender.tacklingRow * this.cellHeight + this.cellHeight / 2;

      this.defender.updateTackle(dt, () => {
        this.collisionSystem.triggerTackleImpact(cellCenterX - 5, cellCenterY);
        this.player.setPose('tackled');
      });
    }

    // 4. Update Striker & Ball Controllers
    this.player.update(dt, this.animationSystem.particles);

    if (this.isShootingGoal && this.ball.animator.hasLaunched && !this.keeperDiveStarted) {
      this.keeperDiveStarted = true;
      this.goalkeeper.setDiving(true);
    }

    this.ball.update(dt, this.animationSystem.particles, () => {
      this.isShootingGoal = false;
      const rest = this.ballInsideNet();
      this.collisionSystem.triggerGoalImpact(rest.x, rest.y);
      if (this.callbacks.onGoalShootComplete) {
        this.callbacks.onGoalShootComplete();
      }
    });
    const ballIsInDribble = this.player.sprite.pose === 'running' && this.player.moving;
    this.ball.container.visible = this.isShootingGoal || !ballIsInDribble;

    // 5. Confetti celebration shower if in Goal state
    if (this.lastState?.subState === 'GOAL') {
      this.player.effects.generateCelebrationShower(this.width, this.height, this.animationSystem.particles);
    }
  }

  /**
   * Clean destruction of Pixi application and display objects
   */
  public destroy(): void {
    this.isDestroyed = true;
    if (this.app) {
      this.app.ticker.remove(this.updateTicker, this);
      this.app.destroy(true, { children: true });
      this.app = null;
    }
  }
}
