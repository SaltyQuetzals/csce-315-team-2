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
    private loadBullets();
    reload(): void;
    readonly fireable: boolean;
    readonly shotsRemaining: number;
    addAmmo(amount: number): void;
}
export declare class SixShooter extends Gun {
    constructor(ammoRemaining?: number);
}
