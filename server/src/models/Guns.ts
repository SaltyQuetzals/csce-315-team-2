export abstract class Gun {
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

  private get canFillClip(): boolean {
    return this.shotsInClip < this.clipSize && this.ammoRemaining > 0;
  }

  private loadBullets(): void {
    if (this.ammoRemaining < this.clipSize) {
      this.shotsInClip = this.ammoRemaining;
      this.ammoRemaining = 0;
    } else {
      this.shotsInClip = this.clipSize;
      this.ammoRemaining -= this.shotsInClip;
    }
  }

  reload(): void {
    if (this.canFillClip) {
      this.canFire = false;
      setTimeout(() => {
        this.loadBullets();
      }, this.reloadRateMillis);
    }
  }

  get fireable(): boolean {
    return this.canFire;
  }

  get shotsRemaining(): number {
    return this.shotsInClip;
  }

  addAmmo(amount: number): void {
    if (amount < 0) {
      throw RangeError(`Ammo amount cannot be negative, got: ${amount}`);
    }
    this.ammoRemaining += amount;
  }
}

export class SixShooter extends Gun {
  constructor(ammoRemaining = 2) {
    const FIRE_RATE = 500;
    const DAMAGE = 1;
    const CLIP_SIZE = 6;
    const RELOAD_RATE = 150;
    super(FIRE_RATE, RELOAD_RATE, DAMAGE, CLIP_SIZE, ammoRemaining);
  }
}