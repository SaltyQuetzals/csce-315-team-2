import 'mocha';

import {expect} from 'chai';

import {Revolver} from '../../src/public/js/models/Guns';

describe('Fire function', () => {
  it('Should not re-fire immediately.', async () => {
    const revolver = new Revolver();
    revolver.fire();
    expect(revolver.canFire).to.equal(false);
    const currentAmmo = revolver.ammoNotLoaded;
    revolver.fire();
    expect(revolver.ammoNotLoaded).to.equal(currentAmmo);
  });
});

describe('Reload function', () => {
  it('Should fill clip to clip size if possible', async () => {
    const revolver = new Revolver();  // Initializes revolver with 2 shots
    revolver.addAmmo(10);
    await revolver.reload();
    expect(revolver.shotsInClip).to.equal(6);
  });

  it('Should fill the clip to the maximum available', async () => {
    const revolver = new Revolver();  // Initializes revolver with 2 shots.
    revolver.addAmmo(1);
    await revolver.reload();
    expect(revolver.shotsInClip).to.equal(3);
  });

  it('Shouldn\'t change shotsInClip if ammoRemaining = 0', async () => {
    const revolver = new Revolver();  // Initializes revolver with 2 shots.
    await revolver.reload();
    expect(revolver.shotsInClip).to.equal(2);
  });
});