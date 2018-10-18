"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const Guns_1 = require("../../src/models/Guns");
describe('Fire function', () => {
    it('Should not re-fire immediately.', () => {
        const sixShooter = new Guns_1.SixShooter();
        sixShooter.fire();
        chai_1.expect(sixShooter.fireable).to.equal(false);
        const currentAmmo = sixShooter.ammoRemaining;
        sixShooter.fire();
        chai_1.expect(sixShooter.ammoRemaining).to.equal(currentAmmo);
    });
    it('Should be able to fire after cooling down', () => {
        const sixShooter = new Guns_1.SixShooter();
        const resetRate = sixShooter.fireRateInMillis;
        sixShooter.fire();
        const currentAmmo = sixShooter.ammoRemaining;
        setTimeout(() => {
            sixShooter.fire();
            chai_1.expect(sixShooter.ammoRemaining).to.equal(currentAmmo - 1);
        }, resetRate);
    });
});
describe('Reload function', () => {
    it('Should fill clip to clip size if possible', () => {
        const sixShooter = new Guns_1.SixShooter(); // Initializes revolver with 2 shots
        sixShooter.addAmmo(10);
        sixShooter.reload();
        chai_1.expect(sixShooter.shotsRemaining).to.equal(6);
    });
    it('Should fill the clip to the maximum available', () => {
        const sixShooter = new Guns_1.SixShooter(); // Initializes revolver with 2 shots.
        sixShooter.addAmmo(1);
        sixShooter.reload();
        chai_1.expect(sixShooter.shotsRemaining).to.equal(3);
    });
});
//# sourceMappingURL=gun_tests.js.map