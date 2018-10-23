"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const Avatar_1 = require("../../src/models/Avatar");
const Guns_1 = require("../../src/models/Guns");
describe('pickUp', () => {
    const player = new Avatar_1.Human([0, 0]);
    it('Should replace a weapon with the picked-up weapon', () => {
        chai_1.expect(player.heldWeapon).to.equal(null);
        const newWeapon = new Guns_1.Revolver();
        const oldWeapon = player.pickUp(newWeapon);
        chai_1.expect(oldWeapon).to.equal(null);
        chai_1.expect(player.heldWeapon).to.equal(newWeapon);
    });
});
//# sourceMappingURL=avatar_tests.js.map