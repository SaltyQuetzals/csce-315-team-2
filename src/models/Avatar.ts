import {Revolver, Weapon} from './Guns';

export enum Direction {
  North = 1,
  South,
  West,
  East
}

const INITIAL_DIRECTION = Direction.South;

const ZOMBIE_MOVE_SPEED = 3;
const HUMAN_MOVE_SPEED = 1;


export abstract class Avatar {
  facingDirection!: Direction;
  constructor(readonly movementSpeed: number, private _position: XY) {
    this.facingDirection = INITIAL_DIRECTION;
  }


  get position(): XY {
    return this._position;
  }

  move(xDelta: number, yDelta: number): void {
    this._position[0] += xDelta;
    this._position[1] += yDelta;
  }
}

export class Zombie extends Avatar {
  constructor(position: XY) {
    super(ZOMBIE_MOVE_SPEED, position);
  }
}

export class Human extends Avatar {
  heldWeapon!: Weapon;
  constructor(position: XY) {
    super(HUMAN_MOVE_SPEED, position);
    this.heldWeapon = new Revolver();
  }
}