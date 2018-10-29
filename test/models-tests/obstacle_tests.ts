import 'mocha';

import {expect} from 'chai';

import {SquareObstacle} from '../../src/models/Obstacle';

describe('Square Obstacle Tests', () => {
  const obstacle = new SquareObstacle([0, 0], 100, 100);
  it('Should determine correctly whether the point is inside the obstacle',
     () => {
       expect(obstacle.insideObstacle([10, 20])).to.equal(true);
       expect(obstacle.insideObstacle([10, 200])).to.equal(false);
       expect(obstacle.insideObstacle([200, 10])).to.equal(false);
     });
});