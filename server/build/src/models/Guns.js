"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Gun {
    constructor(fireRateInMillis, damage, clipSize, ammoRemaining) {
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
        }
        else {
            this.shotsInClip = this.clipSize;
            this.ammoRemaining -= this.shotsInClip;
        }
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
                }, this.fireRateInMillis);
            }
        }
    }
    get canFillClip() {
        return this.shotsInClip < this.clipSize && this.ammoRemaining > 0;
    }
    reload() {
        if (this.ammoRemaining > 0) {
            this.canFire = false;
            while (this.canFillClip) {
                this.ammoRemaining--;
                this.shotsInClip++;
            }
        }
        this.canFire = true;
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
        super(FIRE_RATE, DAMAGE, CLIP_SIZE, ammoRemaining);
    }
}
exports.SixShooter = SixShooter;
//# sourceMappingURL=Guns.js.map