import 'mocha';

import {expect} from 'chai';

import {Game, PlayerData} from '../../src/models/Game';

describe('Game Function', () => {
  const players: PlayerData[] =
      [{name: 'gamer1'}, {name: 'gamer2'}, {name: 'gamer3'}, {name: 'gamer4'}];
  const game = new Game(100, 100);
  game.generatePlayers(players);

  it('Should generate a game with four new players', () => {
    expect(game.getPlayers().length).to.equal(4);
    for (let i = 0; i < players.length; i++) {
      expect(game.getPlayers()[i].name).to.equal(players[i].name);
    }
  });
});