import { Weapon } from './Guns';
export declare enum Direction {
    North = 1,
    South = 2,
    West = 3,
    East = 4,
}
export declare type Position = [number, number];
export declare abstract class Avatar {
    readonly movementSpeed: number;
    facingDirection: Direction;
    private position;
    constructor(movementSpeed: number, facingDirection: Direction, position: Position);
    move(x: number, y: number): void;
    abstract attack(): void;
}
export declare class Zombie extends Avatar {
    movementSpeed: number;
    facingDirection: Direction;
    attack(): void;
}
export declare class Human extends Avatar {
    movementSpeed: number;
    facingDirection: Direction;
    heldWeapon: Weapon | null;
    constructor(position: Position);
    attack(): void;
    pickUp(newWeapon: Weapon): Weapon | null;
}
