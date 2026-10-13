/**
 * DribbleSystem - Coordinates attack route calculation and luminous path rendering
 * Responsibility: ONE authoritative attack route representing the exact sequence of cells visited and resolved by the player.
 *
 * Rules:
 * - Every path segment is generated strictly from resolved player decisions.
 * - PASS, REPLAY, SHIELD and SUBSTITUTE states update the single authoritative route.
 * - No separate visual histories or disjointed lines.
 * - The player's dribble route ends outside the penalty area; only the ball enters the net.
 */

import { Graphics } from 'pixi.js';
import { GameState } from '../../types/game';
import { GRID_COLS, GRID_ROWS } from '../../logic/gameRules';

export interface RoutePoint {
  x: number;
  y: number;
  col?: number;
  row?: number;
  type?: 'kickoff' | 'cleared' | 'bypassed';
}

export class DribbleSystem {
  public readonly pathGraphics = new Graphics();
  private animTick = 0;

  /**
   * Calculate the single authoritative attack route through resolved cells
   */
  public calculateRoute(
    state: GameState,
    gridStartX: number,
    gridStartY: number,
    cellWidth: number,
    cellHeight: number
  ): RoutePoint[] {
    const route: RoutePoint[] = [];
    const startLineX = gridStartX - 24;
    const startLineY = gridStartY + (GRID_ROWS * cellHeight) / 2;

    // 1. Kickoff origin point
    route.push({ x: startLineX, y: startLineY, type: 'kickoff' });

    // 2. Exact sequence of cells visited and successfully resolved by the player
    for (let c = 0; c < GRID_COLS; c++) {
      if (!state.grid[c]) break;

      let resolvedCell: { r: number; type: 'cleared' | 'bypassed' } | null = null;

      for (let r = 0; r < GRID_ROWS; r++) {
        const cell = state.grid[c][r];
        if (cell.resolvedWithCard === 'PASS' || cell.status === 'bypassed') {
          resolvedCell = { r, type: 'bypassed' };
          break;
        } else if (cell.status === 'cleared') {
          resolvedCell = { r, type: 'cleared' };
          break;
        }
      }

      if (resolvedCell) {
        const stepX = gridStartX + c * cellWidth + cellWidth / 2;
        const stepY = gridStartY + resolvedCell.r * cellHeight + cellHeight / 2;
        route.push({
          x: stepX,
          y: stepY,
          col: c,
          row: resolvedCell.r,
          type: resolvedCell.type,
        });
      } else {
        // Line has not been resolved (e.g. current line is in progress, blocked, replay, or unreached)
        // Stop here: the route represents ONLY resolved player decisions!
        break;
      }
    }

    return route;
  }

  public update(dt: number): void {
    this.animTick += dt;
  }

  /**
   * Render the single authoritative attack progression route
   */
  public renderPath(route: RoutePoint[]): void {
    this.pathGraphics.clear();
    if (route.length < 2) return;

    // 1. Luminous arcade emerald aura glow
    this.pathGraphics.moveTo(route[0].x, route[0].y);
    for (let i = 1; i < route.length; i++) {
      this.pathGraphics.lineTo(route[i].x, route[i].y);
    }
    this.pathGraphics.stroke({ width: 7, color: 0x22c55e, alpha: 0.28 });

    // 2. High-contrast crisp tactical progression tracer
    this.pathGraphics.moveTo(route[0].x, route[0].y);
    for (let i = 1; i < route.length; i++) {
      this.pathGraphics.lineTo(route[i].x, route[i].y);
    }
    this.pathGraphics.stroke({ width: 2.5, color: 0x4ade80, alpha: 0.9 });

    // 3. Tactical Waypoint Nodes
    for (let i = 1; i < route.length; i++) {
      const pt = route[i];
      const isBypassed = pt.type === 'bypassed';
      const nodeColor = isBypassed ? 0x38bdf8 : 0x86efac;

      // Outer ring
      this.pathGraphics.circle(pt.x, pt.y, 4.5).fill({ color: nodeColor, alpha: 0.9 });
      // Core stud
      this.pathGraphics.circle(pt.x, pt.y, 2).fill(0xffffff);

      // If bypassed via PASS, draw distinctive tactical bypass arc
      if (isBypassed) {
        this.pathGraphics
          .arc(pt.x, pt.y, 8, -Math.PI * 0.7, Math.PI * 0.7)
          .stroke({ width: 1.5, color: 0x38bdf8, alpha: 0.8 });
      }
    }
  }
}
