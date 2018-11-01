import {delay} from '../shared/functions';

export abstract class Weapon {
  readonly fireRateMillis!: number;
  readonly reloadRateMillis!: number;
  protected readonly _damage!: number;
  protected readonly _clipSize!: number;
  protected _shotsInClip!: number;
  protected _canFire!: boolean;
  ammoNotLoaded!: number;

  constructor(
      fireRateMillis: number, reloadRateMillis: number, damage: number,
      clipSize: number, ammoNotLoaded: number) {
    this.fireRateMillis = fireRateMillis;
    this.reloadRateMillis = reloadRateMillis;
    this._damage = damage;
    this._clipSize = clipSize;
    this._canFire = true;
    if (ammoNotLoaded < 0) {
      throw RangeError('Ammo amount cannot be negative.');
    }
    this.ammoNotLoaded = ammoNotLoaded;
    this._shotsInClip = 0;
    this._loadBullets();
  }

  /**
   * Attempts to fire the gun. If the gun cannot be fired because there
   * aren't any shots in the clip, `reload` will be called. Otherwise, if
   * `fireFunction` is provided, it will be called before `shotsInClip` is
   * decremented, and the gun is locked for `fireRateMillis`.
   * @param firingFunction The action to perform before locking the gun.
   */
  async fire(firingFunction?: Function): Promise<void> {
    if (this._canFire) {
      if (this._shotsInClip === 0) {
        this.reload();
      } else {
        if (firingFunction) {
          firingFunction();
        }

        this._canFire = false;
        this._shotsInClip--;
        await delay(this.fireRateMillis);
        this._canFire = true;
      }
    }
  }

  /**
   * Convenience function to determine whether the clip can be filled
   * with more ammo.
   */
  private get _canFillClip(): boolean {
    return this._shotsInClip < this._clipSize && this.ammoNotLoaded > 0;
  }

  /**
   * Determines the number of bullets that can be loaded into the clip,
   * subracts that amount from `ammoRemaining`, and adds it to `shotsInClip`.
   */
  private _loadBullets(): void {
    while (this._canFillClip) {
      this._shotsInClip++;
      this.ammoNotLoaded--;
    }
  }

  /**
   * Prevents the gun from being fired for `reloadRateMillis` milliseconds,
   * and then calls `loadBullets`.
   */
  async reload(): Promise<void> {
    if (this._canFillClip) {
      this._canFire = false;
      await delay(this.reloadRateMillis);
      this._loadBullets();
    }
  }

  /**
   * Getter function to check gun firing status.
   */
  get canFire(): boolean {
    return this._canFire;
  }

  /**
   * Returns `shotsInClip`.
   */
  get shotsInClip(): number {
    return this._shotsInClip;
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
    this.ammoNotLoaded += amount;
  }
}

export class Revolver extends Weapon {
  constructor(ammoRemaining = 2) {
    const FIRE_RATE = 500;
    const DAMAGE = 1;
    const CLIP_SIZE = 6;
    const RELOAD_RATE = 300;
    super(FIRE_RATE, RELOAD_RATE, DAMAGE, CLIP_SIZE, ammoRemaining);
  }
}

export class SawnOffShotgun extends Weapon {
  constructor(ammoRemaining = 2) {
    const FIRE_RATE = 1000;
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
