export abstract class RectangularObject {

    constructor(public location: XY, public width: number, public height: number) {}

    collidesWith(other: XY): boolean {
        const [leftEdge, topEdge] = this.location;
        const rightEdge = leftEdge + this.width;
        const bottomEdge = topEdge + this.height;

        const [otherX, otherY] = other;

        return leftEdge <= otherX && rightEdge >= otherX && topEdge <= otherY && bottomEdge >= otherY; 
    }
}