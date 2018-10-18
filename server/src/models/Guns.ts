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
    this.ammoRemaining = ammoRemaining;
  }

  fire(firing?: Function): void {
    if (this.canFire) {
      if (firing) {
        firing();
      }
      this.canFire = false;
      this.ammoRemaining--;
      setTimeout(() => {
        this.canFire = true;
      }, this.fireRateInMillis);
    }
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