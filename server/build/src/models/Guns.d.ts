export declare abstract class Weapon {
    readonly fireRateMillis: number;
    readonly reloadRateMillis: number;
    protected readonly damage: number;
    protected readonly clipSize: number;
    protected shotsInClip: number;
    protected canFire: boolean;
    ammoRemaining: number;
    constructor(fireRateMillis: number, reloadRateMillis: number, damage: number, clipSize: number, ammoRemaining: number);
    /**
     * Attempts to fire the gun. If the gun cannot be fired because there
     * aren't any shots in the clip, `reload` will be called. Otherwise, if
     * `fireFunction` is provided, it will be called before `shotsInClip` is
     * decremented, and the gun is locked for `fireRateMillis`.
     * @param firingFunction The action to perform before locking the gun.
     */
    fire(firingFunction?: Function): void;
    /**
     * Convenience function to determine whether the clip can be filled
     * with more ammo.
     */
    private readonly canFillClip;
    /**
     * Determines the number of bullets that can be loaded into the clip,
     * subracts that amount from `ammoRemaining`, and adds it to `shotsInClip`.
     */
    private loadBullets();
    /**
     * Prevents the gun from being fired for `reloadRateMillis` milliseconds,
     * and then calls `loadBullets`.
     */
    reload(): void;
    /**
     * Getter function to check gun firing status.
     */
    readonly fireable: boolean;
    /**
     * Getter function to check the number of shots left in the clip.
     */
    readonly shotsRemaining: number;
    /**
     * Adds `amount` shots to `ammoRemaining`.
     * @param amount Number of shots to add
     * @throws {RangeError} if `amount` is < 0
     */
    addAmmo(amount: number): void;
}
export declare class Revolver extends Weapon {
    constructor(ammoRemaining?: number);
}
export declare class SawnOffShotgun extends Weapon {
    constructor(ammoRemaining?: number);
}
export declare class AutomaticRifle extends Weapon {
    constructor(ammoRemaining?: number);
}
