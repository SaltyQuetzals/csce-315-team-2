import {Weapon} from './Guns';

export enum Direction {
  North = 1,
  South,
  West,
  East
}

export type Position = [number, number];  // X, Y

const INITIAL_DIRECTION = Direction.South;

const ZOMBIE_MOVE_SPEED = 3;
const HUMAN_MOVE_SPEED = 1;


export abstract class Avatar {
  facingDirection!: Direction;
  constructor(readonly movementSpeed: number, private _position: Position) {
    this.facingDirection = INITIAL_DIRECTION;
  }


  get position(): Position {
    return this._position;
  }

  move(xDelta: number, yDelta: number): void {
    this._position[0] += xDelta;
    this._position[1] += yDelta;
  }

  abstract attack(): void;
}

export class Zombie extends Avatar {
  constructor(position: Position) {
    super(ZOMBIE_MOVE_SPEED, position);
  }
  attack(): void {}
}

export class Human extends Avatar {
  heldWeapon!: Weapon|null;
  constructor(position: Position) {
    super(HUMAN_MOVE_SPEED, position);
    this.heldWeapon = null;
  }
  attack(): void {}

  pickUp(newWeapon: Weapon): Weapon|null {
    const tempWeapon = this.heldWeapon;
    this.heldWeapon = newWeapon;
    return tempWeapon;
  }
}