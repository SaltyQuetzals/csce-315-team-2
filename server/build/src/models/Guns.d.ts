export declare abstract class Gun {
    readonly fireRateMillis: number;
    readonly reloadRateMillis: number;
    protected readonly damage: number;
    protected readonly clipSize: number;
    protected shotsInClip: number;
    protected canFire: boolean;
    ammoRemaining: number;
    constructor(fireRateMillis: number, reloadRateMillis: number, damage: number, clipSize: number, ammoRemaining: number);
    fire(firingFunction?: Function): void;
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
    readonly fireable: boolean;
    readonly shotsRemaining: number;
    addAmmo(amount: number): void;
}
export declare class SixShooter extends Gun {
    constructor(ammoRemaining?: number);
}
