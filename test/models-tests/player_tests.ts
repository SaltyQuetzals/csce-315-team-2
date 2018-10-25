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
    await player.kill();
    expect(player.avatar).to.be.a.instanceof(Zombie);
  });

  it('Shouldn\'t replace if player\'s avatar is already a Zombie', async () => {
    const player = new Player(genericName, new Zombie(spawnPoint));
    expect(player.avatar).to.be.a.instanceof(Zombie);
    const originalAvatar = player.avatar;
    await player.kill();
    expect(player.avatar).to.equal(originalAvatar);
  });
});