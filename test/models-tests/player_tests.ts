import 'mocha';

import {expect} from 'chai';

import {Avatar, Human, Zombie} from '../../src/models/Avatar';
import {Player} from '../../src/models/Player';

describe('Player.kill', () => {
  const genericName = 'Kennedy';
  const spawnPoint: [number, number] = [0, 0];

  it('Should replace the player\'s Human with a Zombie', async () => {
    const player = new Player(genericName, new Human(spawnPoint));
    expect(player.avatar).to.be.a.instanceof(Human);
    player.kill();
    setTimeout(() => {
      expect(player.avatar).to.be.a.instanceof(Zombie);
    }, 1000);
  });

  it('Shouldn\'t replace if player\'s avatar is already a Zombie', async () => {
    const player = new Player(genericName, new Zombie(spawnPoint));
    expect(player.avatar).to.be.a.instanceof(Zombie);
    const originalAvatar = player.avatar;
    player.kill();
    setTimeout(() => {
      expect(player.avatar).to.equal(originalAvatar);
    }, 1000);
  });
});