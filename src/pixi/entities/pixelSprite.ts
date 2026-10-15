import { Graphics } from 'pixi.js';

export const PIXEL = 4;

export const PX = {
  o: 0x161616,
  h: 0x1b140f,
  s: 0xf0c090,
  w: 0xf7f7f7,
  b: 0x2d62d6,
  r: 0xd64545,
  y: 0xf0d34a,
  k: 0x1a1a1a,
  g: 0xf08a32,
} as const;

/** Draw a feet-anchored pixel sprite. '.' is empty. Bottom-center sits on y = 0. */
export function drawPixels(g: Graphics, rows: string[], pixel = PIXEL): void {
  const height = rows.length;
  let width = 0;
  for (const row of rows) width = Math.max(width, row.length);
  const originX = -Math.floor((width * pixel) / 2);
  const originY = -(height * pixel);

  for (let y = 0; y < height; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const key = row[x] as keyof typeof PX;
      const color = PX[key];
      if (color === undefined) continue;
      g.rect(originX + x * pixel, originY + y * pixel, pixel, pixel).fill(color);
    }
  }
}
