import { Assets, Texture } from 'pixi.js';

export const SPRITE_SCALE = 0.5;

const SEQUENCES = {
  dribble: { dir: '/sprites/cut/player-blue-dribble', count: 5 },
  idle: { dir: '/sprites/cut/player-blue-idle', count: 5 },
  kick: { dir: '/sprites/cut/player-blue-kick', count: 5 },
  dodge: { dir: '/sprites/cut/player-blue-dodge', count: 5 },
  blockerIdle: { dir: '/sprites/cut/blocker-red-idle', count: 5 },
  fall: { dir: '/sprites/cut/blocker-red-fall', count: 5 },
  keeperIdle: { dir: '/sprites/cut/defender-yellow-idle', count: 5 },
  keeperJump: { dir: '/sprites/cut/defender-yellow-jump', count: 10 },
  ballSpin: { dir: '/sprites/cut/ball-spin', count: 5 },
  ballFast: { dir: '/sprites/cut/ball-fast', count: 4 },
  ballFire: { dir: '/sprites/cut/ball-fire', count: 5 },
  footprint: { dir: '/sprites/cut/footprint', count: 2 },
} as const;

export type CharacterSheet = keyof typeof SEQUENCES;

let cache: Partial<Record<CharacterSheet, Texture[]>> = {};

export async function preloadCharacterSprites(): Promise<void> {
  const entries = Object.entries(SEQUENCES) as [CharacterSheet, (typeof SEQUENCES)[CharacterSheet]][];
  await Promise.all(
    entries.map(async ([name, seq]) => {
      const textures = await Promise.all(
        Array.from({ length: seq.count }, async (_, i) => {
          const texture = await Assets.load<Texture>(`${seq.dir}/${i + 1}.png`);
          texture.source.scaleMode = 'nearest';
          return texture;
        })
      );
      cache[name] = textures;
    })
  );
}

export function characterFrames(name: CharacterSheet): Texture[] {
  return cache[name] ?? [];
}
