import {Position} from './Avatar';

export class SquareObstacle {
  position!: Position;
  width!: number;
  height!: number;


  constructor(position: Position, width: number, height: number) {
    this.position = position;
    this.width = width;
    this.height = height;
  }

  insideObstacle(position: Position): boolean {
    if (position[0] > this.position[0] &&
        position[0] < this.position[0] + this.width &&
        position[1] > this.position[1] &&
        position[1] < this.position[1] + this.height) {
      return true;
    }
    return false;
  }
}