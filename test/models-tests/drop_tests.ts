import 'mocha';

import {expect} from 'chai';

import {Drop, DropType} from '../../src/models/Drop';
import {Revolver, SawnOffShotgun} from '../../src/models/Guns';
import {Grit} from '../../src/models/PowerUp';

describe('Drop.constructor', () => {
  const pos: [number, number] = [0, 0];
  it('Should assign type correctly given a Weapon', () => {
    const revolver = new Revolver();
    const shotty = new SawnOffShotgun();
    const drop = new Drop(revolver, pos, 1);
    const drop2 = new Drop(shotty, pos, 1);

    expect(drop.type).to.equal(DropType.WEAPON);
    expect(drop2.type).to.equal(DropType.WEAPON);
  });

  it('Should assign type correctly given a PowerUp', () => {
    const grit = new Grit();
    const drop = new Drop(grit, pos, 1);

    expect(drop.type).to.equal(DropType.POWER_UP);
  });
});