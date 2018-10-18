export abstract class Gun {
  readonly fireRateInMillis!: number;
  protected readonly damage!: number;
  protected readonly clipSize!: number;
  protected shotsInClip!: number;
  protected canFire!: boolean;
  ammoRemaining!: number;

  constructor(
      fireRateInMillis: number, damage: number, clipSize: number,
      ammoRemaining: number) {
    this.fireRateInMillis = fireRateInMillis;
    this.damage = damage;
    this.clipSize = clipSize;
    this.canFire = true;
    if (ammoRemaining < 0) {
      throw RangeError('Ammo amount cannot be negative.');
    }
    this.ammoRemaining = ammoRemaining;
    if (this.ammoRemaining < this.clipSize) {
      this.shotsInClip = this.ammoRemaining;
      this.ammoRemaining = 0;
    } else {
      this.shotsInClip = this.clipSize;
      this.ammoRemaining -= this.shotsInClip;
    }
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
        }, this.fireRateInMillis);
      }
    }
  }

  private get canFillClip(): boolean {
    return this.shotsInClip < this.clipSize && this.ammoRemaining > 0;
  }

  reload(): void {
    if (this.ammoRemaining > 0) {
      this.canFire = false;
      while (this.canFillClip) {
        this.ammoRemaining--;
        this.shotsInClip++;
      }
    }
    this.canFire = true;
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
    super(FIRE_RATE, DAMAGE, CLIP_SIZE, ammoRemaining);
  }
}