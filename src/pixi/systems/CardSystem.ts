/**
 * CardSystem - Coordinates tactical card resolutions, match history markers, and visual badges
 * Responsibility: Game rules for tactical card application and visual encounter markers
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { TacticalCardType, GridCell } from '../../types/game';

export class CardSystem {
  /**
   * Render resolution marker on a pitch cell showing how the encounter was resolved
   */
  public renderResolutionMarker(
    container: Container,
    cardType: TacticalCardType,
    w: number,
    h: number
  ): void {
    const markerCont = new Container();

    switch (cardType) {
      case 'PASS': {
        // Defender Bypassed / Defeated marker
        const badgeG = new Graphics();
        badgeG.rect(w / 2 - 24, h - 22, 48, 16).fill(0x1e3a8a);
        badgeG.rect(w / 2 - 24, h - 22, 48, 16).stroke({ width: 1.5, color: 0x60a5fa });
        markerCont.addChild(badgeG);

        const txt = new Text({
          text: 'PASS ✓',
          style: new TextStyle({
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 9,
            fontWeight: 'bold',
            fill: 0x93c5fd,
          }),
        });
        txt.anchor.set(0.5);
        txt.position.set(w / 2, h - 14);
        markerCont.addChild(txt);
        break;
      }

      case 'REPLAY': {
        // VAR Replay Review marker
        const badgeG = new Graphics();
        badgeG.rect(w / 2 - 28, h - 22, 56, 16).fill(0x7c2d12);
        badgeG.rect(w / 2 - 28, h - 22, 56, 16).stroke({ width: 1.5, color: 0xfb923c });
        markerCont.addChild(badgeG);

        const txt = new Text({
          text: 'VAR REPLAY ↺',
          style: new TextStyle({
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 9,
            fontWeight: 'bold',
            fill: 0xfed7aa,
          }),
        });
        txt.anchor.set(0.5);
        txt.position.set(w / 2, h - 14);
        markerCont.addChild(txt);
        break;
      }

      case 'SHIELD': {
        // Shield Protection Badge (50% preserved)
        const badgeG = new Graphics();
        badgeG.poly([
          { x: w / 2 - 14, y: h - 24 },
          { x: w / 2 + 14, y: h - 24 },
          { x: w / 2 + 14, y: h - 14 },
          { x: w / 2, y: h - 6 },
          { x: w / 2 - 14, y: h - 14 },
        ]).fill(0xd97706).stroke({ width: 1.5, color: 0xfef08a });
        markerCont.addChild(badgeG);

        const txt = new Text({
          text: '🛡 50%',
          style: new TextStyle({
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 8,
            fontWeight: 'bold',
            fill: 0x451a03,
          }),
        });
        txt.anchor.set(0.5);
        txt.position.set(w / 2, h - 16);
        markerCont.addChild(txt);
        break;
      }

      case 'SUBSTITUTE': {
        // Substitute Marker (Fresh Striker on pitch)
        const badgeG = new Graphics();
        badgeG.rect(w / 2 - 26, h - 22, 52, 16).fill(0x065f46);
        badgeG.rect(w / 2 - 26, h - 22, 52, 16).stroke({ width: 1.5, color: 0x34d399 });
        markerCont.addChild(badgeG);

        const txt = new Text({
          text: 'SUB FRESH ⇄',
          style: new TextStyle({
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 9,
            fontWeight: 'bold',
            fill: 0xa7f3d0,
          }),
        });
        txt.anchor.set(0.5);
        txt.position.set(w / 2, h - 14);
        markerCont.addChild(txt);
        break;
      }

      case 'SCOUT': {
        // Scouted Radar Marker
        const badgeG = new Graphics();
        badgeG.rect(w / 2 - 26, 4, 52, 16).fill(0xeab308);
        badgeG.rect(w / 2 - 26, 4, 52, 16).stroke({ width: 1.5, color: 0xffffff });
        markerCont.addChild(badgeG);

        const txt = new Text({
          text: 'SCOUTED 👁',
          style: new TextStyle({
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 9,
            fontWeight: 'bold',
            fill: 0x0f172a,
          }),
        });
        txt.anchor.set(0.5);
        txt.position.set(w / 2, 12);
        markerCont.addChild(txt);
        break;
      }
    }

    container.addChild(markerCont);
  }
}
