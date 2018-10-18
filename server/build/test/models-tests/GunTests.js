"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const Guns_1 = require("../../src/models/Guns");
describe('Calling fire', () => {
    it('Should not re-fire immediately.', () => {
        const sixShooter = new Guns_1.SixShooter();
        sixShooter.fire(() => { });
        const currentAmmo = sixShooter.ammoRemaining;
        sixShooter.fire(() => { });
        chai_1.expect(sixShooter.ammoRemaining).to.equal(currentAmmo);
    });
    it('Should be able to fire after cooling down', () => {
        const sixShooter = new Guns_1.SixShooter();
        const resetRate = sixShooter.fireRateInMillis;
        sixShooter.fire(() => { });
        const currentAmmo = sixShooter.ammoRemaining;
        setTimeout(() => {
            sixShooter.fire(() => { });
            chai_1.expect(sixShooter.ammoRemaining).to.equal(currentAmmo - 1);
        }, resetRate);
    });
});
//# sourceMappingURL=GunTests.js.map