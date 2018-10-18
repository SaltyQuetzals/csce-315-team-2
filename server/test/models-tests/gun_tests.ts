import 'mocha';

import {expect} from 'chai';

import {SixShooter} from '../../src/models/Guns';

describe('Calling fire', () => {
  it('Should not re-fire immediately.', () => {
    const sixShooter = new SixShooter();
    sixShooter.fire();
    const currentAmmo = sixShooter.ammoRemaining;
    sixShooter.fire();
    expect(sixShooter.ammoRemaining).to.equal(currentAmmo);
  });

  it('Should be able to fire after cooling down', () => {
    const sixShooter = new SixShooter();
    const resetRate = sixShooter.fireRateInMillis;
    sixShooter.fire();
    const currentAmmo = sixShooter.ammoRemaining;
    setTimeout(() => {
      sixShooter.fire();
      expect(sixShooter.ammoRemaining).to.equal(currentAmmo - 1);
    }, resetRate);
  });
});