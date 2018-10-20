import 'mocha';

import {expect} from 'chai';

import {Revolver} from '../../src/models/Guns';

describe('Fire function', () => {
  it('Should not re-fire immediately.', () => {
    const revolver = new Revolver();
    revolver.fire();
    expect(revolver.fireable).to.equal(false);
    const currentAmmo = revolver.ammoRemaining;
    revolver.fire();
    expect(revolver.ammoRemaining).to.equal(currentAmmo);
  });

  it('Should be able to fire after cooling down', () => {
    const revolver = new Revolver();
    const resetRate = revolver.fireRateMillis;
    revolver.fire();
    const currentAmmo = revolver.ammoRemaining;
    setTimeout(() => {
      revolver.fire();
      expect(revolver.ammoRemaining).to.equal(currentAmmo - 1);
    }, resetRate);
  });
});

describe('Reload function', () => {
  it('Should fill clip to clip size if possible', () => {
    const revolver = new Revolver();  // Initializes revolver with 2 shots
    revolver.addAmmo(10);
    revolver.reload();
    setTimeout(() => {
      expect(revolver.shotsRemaining).to.equal(6);
    }, revolver.reloadRateMillis);
  });

  it('Should fill the clip to the maximum available', () => {
    const revolver = new Revolver();  // Initializes revolver with 2 shots.
    revolver.addAmmo(1);
    revolver.reload();
    setTimeout(() => {
      expect(revolver.shotsRemaining).to.equal(3);
    }, revolver.reloadRateMillis);
  });

  it('Shouldn\'t change shotsInClip if ammoRemaining = 0', () => {
    const revolver = new Revolver();  // Initializes revolver with 2 shots.
    revolver.reload();

    setTimeout(() => {
      expect(revolver.shotsRemaining).to.equal(2);
    }, revolver.reloadRateMillis);
  });
});