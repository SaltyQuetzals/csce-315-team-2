import {AutomaticRifle, Revolver, SawnOffShotgun, Weapon} from './Guns';

export enum Direction {
  North = 1,
  South,
  West,
  East
}

export type Position = [number, number];  // X, Y

export abstract class Avatar {
  constructor(
      readonly movementSpeed: number, public facingDirection: Direction,
      private position: Position) {}
  move(x: number, y: number): void {}
  abstract attack(): void;
}

export class Zombie extends Avatar {
  movementSpeed = 3;
  facingDirection = Direction.South;
  attack(): void {}
}

export class Human extends Avatar {
  movementSpeed = 1;
  facingDirection = Direction.South;
  heldWeapon!: Weapon|null;
  constructor(position: Position) {
    super(1, Direction.South, position);
    this.heldWeapon = null;
  }
  attack(): void {}

  pickUp(newWeapon: Weapon): Weapon|null {
    const tempWeapon = this.heldWeapon;
    this.heldWeapon = newWeapon;
    return tempWeapon;
  }
}