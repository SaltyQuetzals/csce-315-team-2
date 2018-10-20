"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Gun {
    constructor(fireRateMillis, reloadRateMillis, damage, clipSize, ammoRemaining) {
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
    fire(firingFunction) {
        if (this.canFire) {
            if (this.shotsInClip === 0) {
                this.reload();
            }
            else {
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
    get canFillClip() {
        return this.shotsInClip < this.clipSize && this.ammoRemaining > 0;
    }
    /**
     * Determines the number of bullets that can be loaded into the clip,
     * subracts that amount from `ammoRemaining`, and adds it to `shotsInClip`.
     */
    loadBullets() {
        if (this.ammoRemaining < this.clipSize) {
            this.shotsInClip = this.ammoRemaining;
            this.ammoRemaining = 0;
        }
        else {
            this.shotsInClip = this.clipSize;
            this.ammoRemaining -= this.shotsInClip;
        }
    }
    /**
     * Prevents the gun from being fired for `reloadRateMillis` milliseconds,
     * and then calls `loadBullets`.
     */
    reload() {
        if (this.canFillClip) {
            this.canFire = false;
            setTimeout(() => {
                this.loadBullets();
            }, this.reloadRateMillis);
        }
    }
    get fireable() {
        return this.canFire;
    }
    get shotsRemaining() {
        return this.shotsInClip;
    }
    addAmmo(amount) {
        if (amount < 0) {
            throw RangeError(`Ammo amount cannot be negative, got: ${amount}`);
        }
        this.ammoRemaining += amount;
    }
}
exports.Gun = Gun;
class SixShooter extends Gun {
    constructor(ammoRemaining = 2) {
        const FIRE_RATE = 500;
        const DAMAGE = 1;
        const CLIP_SIZE = 6;
        const RELOAD_RATE = 150;
        super(FIRE_RATE, RELOAD_RATE, DAMAGE, CLIP_SIZE, ammoRemaining);
    }
}
exports.SixShooter = SixShooter;
//# sourceMappingURL=Guns.js.map