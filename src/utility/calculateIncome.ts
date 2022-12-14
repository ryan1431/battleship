import { BoardAction } from '../types/action';
import { Ship } from '../types/ship';
import { c } from './c';

export const calculateIncome = (ships: Ship[], actions: BoardAction[], minimumIncome: number = 10) => {
  let income = 0;

  let attackSet = new Set();
  actions
    .filter((a) => a.type === 'attack')
    .forEach(({ x, y, hits }) => {
      attackSet.add(`${x}-${y}`);
      hits.forEach(({ oX, oY }) => {
        attackSet.add(`${x + (oX ?? 0)}-${y + (oY ?? 0)}`);
      });
    });

  let shipChunks: number[] = [0];
  let shipChunkIndex = 0;

  ships.forEach((ship) => {
    const sortField = ship.segments[0].x === ship.segments[1].x ? 'x' : 'y';
    const segments = [...ship.segments];
    segments.sort((a, b) => a[sortField] - b[sortField]);
    segments.forEach(({ x, y }) => {
      if (attackSet.has(`${x}-${y}`)) {
        shipChunks.push(0);
        shipChunkIndex++;
      } else {
        shipChunks[shipChunkIndex]++;
      }
    });
    shipChunks.push(0);
    shipChunkIndex++;
  });

  shipChunks.forEach((segmentLength) => {
    income += segmentLength < 4 ? segmentLength : 3 + (segmentLength - 3) * 3;
  });

  return c(Math.max(income, minimumIncome));
};
