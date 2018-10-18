"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Gun {
    constructor(fireRateInMillis, damage, clipSize, ammoRemaining) {
        this.fireRateInMillis = fireRateInMillis;
        this.damage = damage;
        this.clipSize = clipSize;
        this.canFire = true;
        this.ammoRemaining = ammoRemaining;
    }
    fire(firing) {
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