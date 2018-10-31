
export class SquareObstacle {
  position!: XY;
  width!: number;
  height!: number;


  constructor(position: XY, width: number, height: number) {
    this.position = position;
    this.width = width;
    this.height = height;
  }

  /**
   * Takes in a position type and returns if that position is within the given
   * obstacle
   * @param position Position type that corresponds to a given point on the game
   * board
   */
  insideObstacle(position: XY): boolean {
    if (position[0] > this.position[0] &&
        position[0] < this.position[0] + this.width &&
        position[1] > this.position[1] &&
        position[1] < this.position[1] + this.height) {
      return true;
    }
    return false;
  }
}