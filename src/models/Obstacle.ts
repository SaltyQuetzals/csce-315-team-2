import { RectangularObject } from "./RectangularObject";

export class Obstacle extends RectangularObject {
  constructor(location: XY, width: number, height: number) {
    super(location, width, height);
  }
}