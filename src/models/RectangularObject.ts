export abstract class RectangularObject {
  constructor(
      public location: XY, public width: number, public height: number) {}

  collidesWith(other: XY, width: number, height: number): boolean {
    const [ax1, ay1] = this.location;
    const ax2 = ax1 + this.width;
    const ay2 = ay1 + this.height;

    const [bx1, by1] = other;
    const bx2 = bx1 + width;
    const by2 = by1 + height;

    return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
  }
}