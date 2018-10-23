"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const Guns_1 = require("../../src/models/Guns");
describe('Fire function', () => {
    it('Should not re-fire immediately.', () => {
        const revolver = new Guns_1.Revolver();
        revolver.fire();
        chai_1.expect(revolver.fireable).to.equal(false);
        const currentAmmo = revolver.ammoRemaining;
        revolver.fire();
        chai_1.expect(revolver.ammoRemaining).to.equal(currentAmmo);
    });
    it('Should be able to fire after cooling down', () => {
        const revolver = new Guns_1.Revolver();
        const resetRate = revolver.fireRateMillis;
        revolver.fire();
        const currentAmmo = revolver.ammoRemaining;
        setTimeout(() => {
            revolver.fire();
            chai_1.expect(revolver.ammoRemaining).to.equal(currentAmmo - 1);
        }, resetRate);
    });
});
describe('Reload function', () => {
    it('Should fill clip to clip size if possible', () => {
        const revolver = new Guns_1.Revolver(); // Initializes revolver with 2 shots
        revolver.addAmmo(10);
        revolver.reload();
        setTimeout(() => {
            chai_1.expect(revolver.shotsRemaining).to.equal(6);
        }, revolver.reloadRateMillis);
    });
    it('Should fill the clip to the maximum available', () => {
        const revolver = new Guns_1.Revolver(); // Initializes revolver with 2 shots.
        revolver.addAmmo(1);
        revolver.reload();
        setTimeout(() => {
            chai_1.expect(revolver.shotsRemaining).to.equal(3);
        }, revolver.reloadRateMillis);
    });
    it('Shouldn\'t change shotsInClip if ammoRemaining = 0', () => {
        const revolver = new Guns_1.Revolver(); // Initializes revolver with 2 shots.
        revolver.reload();
        setTimeout(() => {
            chai_1.expect(revolver.shotsRemaining).to.equal(2);
        }, revolver.reloadRateMillis);
    });
});
//# sourceMappingURL=gun_tests.js.map