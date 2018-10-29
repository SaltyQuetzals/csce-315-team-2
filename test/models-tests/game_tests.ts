import 'mocha';

import {expect} from 'chai';

import {Game, MovementData, PlayerData} from '../../src/models/Game';
import {Player} from '../../src/models/Player';

describe('Generate Players Function', () => {
  const players: PlayerData[] =
      [{name: 'gamer1'}, {name: 'gamer2'}, {name: 'gamer3'}, {name: 'gamer4'}];
  const game = new Game(100, 100);
  game.generatePlayers(players);

  it('Should generate a game with four new players', () => {
    expect(Object.keys(game.getPlayers()).length).to.equal(4);
  });
});

describe('Generate Obstacles Function', () => {
  const game = new Game(1000, 1000);
  it('Should generate obstacles and return the obstacles in the game', () => {
    game.generateObstacles();
    expect(game.getObstacles().length).to.equal(5);
  });
});

describe('Game movement function', () => {
  const game = new Game(100, 100);
  const players: PlayerData[] =
      [{name: 'gamer1'}, {name: 'gamer2'}, {name: 'gamer3'}, {name: 'gamer4'}];
  game.generatePlayers(players);
  const movementData: MovementData = {
    'gamer1': {xDelta: 10, yDelta: -10},
    'gamer2': {xDelta: 5, yDelta: -5},
    'gamer3': {xDelta: 100, yDelta: -1},
    'gamer4': {xDelta: 10, yDelta: -10}
  };
  it('Should change the location of the avatar given player data', () => {
    game.movePlayers(movementData);
    const players = game.getPlayers();
    expect(players.gamer1.avatar.position[0]).to.equal(10);
    expect(players.gamer1.avatar.position[1]).to.equal(-10);
    expect(players.gamer2.avatar.position[0]).to.equal(5);
    expect(players.gamer2.avatar.position[1]).to.equal(-5);
  });
});