import * as constants from '../shared/constants';

import {Revolver, Weapon} from '../public/js/models/Guns';
import {RectangularObject} from './RectangularObject';

export enum Direction {
  North = 1,
  South,
  West,
  East
}

const INITIAL_DIRECTION = Direction.South;

const ZOMBIE_MOVE_SPEED = 3;
const HUMAN_MOVE_SPEED = 1;


export abstract class Avatar extends RectangularObject {
  type!: string;
  facingDirection!: Direction;

  constructor(readonly movementSpeed: number, location: XY) {
    super(location, constants.AVATAR_WIDTH, constants.AVATAR_HEIGHT);
    this.facingDirection = INITIAL_DIRECTION;
  }

  move(xDelta: number, yDelta: number): void {
    this.location[0] += xDelta;
    this.location[1] += yDelta;
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