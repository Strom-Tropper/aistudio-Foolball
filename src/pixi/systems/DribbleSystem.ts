/**
 * DribbleSystem - Coordinates attack route calculation and luminous path rendering
 * Responsibility: ONE authoritative attack route representing the exact sequence of cells visited and resolved by the player.
 *
 * Rules:
 * - Every path segment is generated strictly from resolved player decisions.
 * - Only a cleared lane or PASS extends the attack route.
 * - REPLAY retries the current column and does not extend the route.
 * - SUBSTITUTE stays on the blocked confrontation and does not extend the route.
 * - SHIELD preserves payout and does not change the route.
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

    // Cells the player actually cleared or passed. No kickoff slash and no guide line.
    for (let c = 0; c < GRID_COLS; c++) {
      if (!state.grid[c]) break;

      let resolvedCell: { r: number; type: 'cleared' | 'bypassed' } | null = null;

      for (let r = 0; r < GRID_ROWS; r++) {
        const cell = state.grid[c][r];
        if (
          cell.resolvedWithCard === 'REPLAY' ||
          cell.resolvedWithCard === 'SUBSTITUTE' ||
          cell.resolvedWithCard === 'SHIELD'
        ) {
          continue;
        }
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

    this.pathGraphics.moveTo(route[0].x, route[0].y);
    for (let i = 1; i < route.length; i++) {
      this.pathGraphics.lineTo(route[i].x, route[i].y);
    }
    this.pathGraphics.stroke({ width: 3, color: 0xbbf7d0, alpha: 0.95 });

    for (let i = 1; i < route.length; i++) {
      const pt = route[i];
      this.pathGraphics.circle(pt.x, pt.y, 3).fill({ color: 0xffffff, alpha: 0.95 });
    }
  }
}
