import 'mocha';

import {expect} from 'chai';

import {Obstacle} from '../../src/models/Obstacle';

describe('Obstacle Tests', () => {
  const obstacle = new Obstacle([0, 0], 100, 100);
  it('Should determine correctly whether the point is inside the obstacle',
     () => {
       expect(obstacle.collidesWith([10, 20], 100, 100)).to.equal(true);
       expect(obstacle.collidesWith([10, 200], 100, 100)).to.equal(false);
       expect(obstacle.collidesWith([200, 10], 100, 100)).to.equal(false);
     });
});