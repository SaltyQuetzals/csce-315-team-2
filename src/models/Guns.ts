export abstract class Weapon {
  readonly fireRateMillis!: number;
  readonly reloadRateMillis!: number;
  protected readonly damage!: number;
  protected readonly clipSize!: number;
  protected shotsInClip!: number;
  protected canFire!: boolean;
  ammoRemaining!: number;

  constructor(
      fireRateMillis: number, reloadRateMillis: number, damage: number,
      clipSize: number, ammoRemaining: number) {
    this.fireRateMillis = fireRateMillis;
    this.reloadRateMillis = reloadRateMillis;
    this.damage = damage;
    this.clipSize = clipSize;
    this.canFire = true;
    if (ammoRemaining < 0) {
      throw RangeError('Ammo amount cannot be negative.');
    }
    this.ammoRemaining = ammoRemaining;
    this.loadBullets();
  }

  /**
   * Attempts to fire the gun. If the gun cannot be fired because there
   * aren't any shots in the clip, `reload` will be called. Otherwise, if
   * `fireFunction` is provided, it will be called before `shotsInClip` is
   * decremented, and the gun is locked for `fireRateMillis`.
   * @param firingFunction The action to perform before locking the gun.
   */
  fire(firingFunction?: Function): void {
    if (this.canFire) {
      if (this.shotsInClip === 0) {
        this.reload();
      } else {
        if (firingFunction) {
          firingFunction();
        }

        this.canFire = false;
        this.shotsInClip--;
        setTimeout(() => {
          this.canFire = true;
        }, this.fireRateMillis);
      }
    }
  }

  /**
   * Convenience function to determine whether the clip can be filled
   * with more ammo.
   */
  private get canFillClip(): boolean {
    return this.shotsInClip < this.clipSize && this.ammoRemaining > 0;
  }

  /**
   * Determines the number of bullets that can be loaded into the clip,
   * subracts that amount from `ammoRemaining`, and adds it to `shotsInClip`.
   */
  private loadBullets(): void {
    if (this.ammoRemaining < this.clipSize) {
      this.shotsInClip = this.ammoRemaining;
      this.ammoRemaining = 0;
    } else {
      this.shotsInClip = this.clipSize;
      this.ammoRemaining -= this.shotsInClip;
    }
  }

  /**
   * Prevents the gun from being fired for `reloadRateMillis` milliseconds,
   * and then calls `loadBullets`.
   */
  reload(): void {
    if (this.canFillClip) {
      this.canFire = false;
      setTimeout(() => {
        this.loadBullets();
      }, this.reloadRateMillis);
    }
  }

  /**
   * Getter function to check gun firing status.
   */
  get fireable(): boolean {
    return this.canFire;
  }

  /**
   * Getter function to check the number of shots left in the clip.
   */
  get shotsRemaining(): number {
    return this.shotsInClip;
  }

  /**
   * Adds `amount` shots to `ammoRemaining`.
   * @param amount Number of shots to add
   * @throws {RangeError} if `amount` is < 0
   */
  addAmmo(amount: number): void {
    if (amount < 0) {
      throw RangeError(`Ammo amount cannot be negative, got: ${amount}`);
    }
    this.ammoRemaining += amount;
  }
}

export class Revolver extends Weapon {
  constructor(ammoRemaining = 2) {
    const FIRE_RATE = 250;
    const DAMAGE = 1;
    const CLIP_SIZE = 6;
    const RELOAD_RATE = 300;
    super(FIRE_RATE, RELOAD_RATE, DAMAGE, CLIP_SIZE, ammoRemaining);
  }
}

export class SawnOffShotgun extends Weapon {
  constructor(ammoRemaining = 2) {
    const FIRE_RATE = 500;
    const DAMAGE = 7;
    const CLIP_SIZE = 2;
    const RELOAD_RATE = 1000;

    super(FIRE_RATE, RELOAD_RATE, DAMAGE, CLIP_SIZE, ammoRemaining);
  }
}

export class AutomaticRifle extends Weapon {
  constructor(ammoRemaining = 30) {
    const FIRE_RATE = 50;
    const DAMAGE = 4;
    const CLIP_SIZE = 60;
    const RELOAD_RATE = 500;

    super(FIRE_RATE, RELOAD_RATE, DAMAGE, CLIP_SIZE, ammoRemaining);
  }
}
