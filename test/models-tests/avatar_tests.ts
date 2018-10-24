import 'mocha';

import {expect} from 'chai';

import {Avatar, Human, Zombie} from '../../src/models/Avatar';
import {Revolver} from '../../src/models/Guns';

describe('Human.pickUp', () => {
  const player = new Human([0, 0]);
  it('Should replace a weapon with the picked-up weapon', () => {
    expect(player.heldWeapon).to.equal(null);
    const newWeapon = new Revolver();
    const oldWeapon = player.pickUp(newWeapon);
    expect(oldWeapon).to.equal(null);
    expect(player.heldWeapon).to.equal(newWeapon);
  });
});