import 'mocha';

import {expect} from 'chai';

import {SixShooter} from '../../src/models/Guns';

describe('Fire function', () => {
  it('Should not re-fire immediately.', () => {
    const sixShooter = new SixShooter();
    sixShooter.fire();
    expect(sixShooter.fireable).to.equal(false);
    const currentAmmo = sixShooter.ammoRemaining;
    sixShooter.fire();
    expect(sixShooter.ammoRemaining).to.equal(currentAmmo);
  });

  it('Should be able to fire after cooling down', () => {
    const sixShooter = new SixShooter();
    const resetRate = sixShooter.fireRateMillis;
    sixShooter.fire();
    const currentAmmo = sixShooter.ammoRemaining;
    setTimeout(() => {
      sixShooter.fire();
      expect(sixShooter.ammoRemaining).to.equal(currentAmmo - 1);
    }, resetRate);
  });
});

describe('Reload function', () => {
  it('Should fill clip to clip size if possible', () => {
    const sixShooter = new SixShooter();  // Initializes revolver with 2 shots
    sixShooter.addAmmo(10);
    sixShooter.reload();
    setTimeout(() => {
      expect(sixShooter.shotsRemaining).to.equal(6);
    }, sixShooter.reloadRateMillis);
  });

  it('Should fill the clip to the maximum available', () => {
    const sixShooter = new SixShooter();  // Initializes revolver with 2 shots.
    sixShooter.addAmmo(1);
    sixShooter.reload();
    setTimeout(() => {
      expect(sixShooter.shotsRemaining).to.equal(3);
    }, sixShooter.reloadRateMillis);
  });

  it('Shouldn\'t change shotsInClip if ammoRemaining = 0', () => {
    const sixShooter = new SixShooter();  // Initializes revolver with 2 shots.
    sixShooter.reload();

    setTimeout(() => {
      expect(sixShooter.shotsRemaining).to.equal(2);
    }, sixShooter.reloadRateMillis);
  });
});