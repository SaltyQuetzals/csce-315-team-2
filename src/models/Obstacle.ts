import {Position} from './Avatar';



export class SquareObstacle {
  positions!: Position[];

  constructor(positions: Position[]) {
    console.assert(
        positions.length === 4, 'The number of positions is not 4 points');
    this.positions = positions;
  }

  insideObstacle(position: Position): boolean {
    const xSorted =
        this.positions.concat().sort((a: Position, b: Position) => a[0] - b[0]);
    const ySorted =
        this.positions.concat().sort((a: Position, b: Position) => a[1] - b[1]);
    if (position[0] > xSorted[0][0] &&
        position[0] < xSorted[xSorted.length - 1][0] &&
        position[1] > ySorted[0][1] &&
        position[1] < ySorted[ySorted.length - 1][1]) {
      return true;
    }
    return false;
  }
}