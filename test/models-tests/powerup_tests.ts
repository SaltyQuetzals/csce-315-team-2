import 'mocha';

import {expect} from 'chai';

import {WeirdFlex} from '../../src/models/PowerUp';


describe('WeirdFlex.activate', () => {
  const wf = new WeirdFlex();

  it('Should be active for a set amount of time', () => {
    wf.activate().then(() => {
      expect(wf.active).to.equal(false);
    });
    expect(wf.active).to.equal(true);
  });
});