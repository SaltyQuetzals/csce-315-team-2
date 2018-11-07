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
  type!: string;
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
  public static numZombies: number = -1;
  constructor(position: XY) {
    super(ZOMBIE_MOVE_SPEED, position);
    this.type = 'zombie';
    Zombie.numZombies++;
  }
}

export class Human extends Avatar {
  heldWeapon!: Weapon;
  constructor(position: XY) {
    super(HUMAN_MOVE_SPEED, position);
    this.heldWeapon = new Revolver();
    this.type = 'human';
  }
}