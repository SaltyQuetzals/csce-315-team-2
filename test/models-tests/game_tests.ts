import 'mocha';

import {AssertionError} from 'assert';
import {expect} from 'chai';

import {Human} from '../../src/models/Avatar';
import {Game, getRandomChoice, MovementData, PlayerData} from '../../src/models/Game';
import {SawnOffShotgun} from '../../src/public/js/models/Guns';
import {Obstacle} from '../../src/models/Obstacle';
import {Player} from '../../src/models/Player';

describe('Generate Players Function', () => {
  const players: PlayerData[] =
      [{id: 'gamer1'}, {id: 'gamer2'}, {id: 'gamer3'}, {id: 'gamer4'}];
  const game = new Game(100, 100);
  game.generatePlayers(players);

  it('Should generate a game with four new players', () => {
    expect(Object.keys(game.getPlayers())).to.have.lengthOf(4);
  });

  const emptyPlayers: PlayerData[] = [];
  const emptyGame = new Game(100, 100);
  game.generatePlayers(emptyPlayers);

  it('Should generate a game with no players', () => {
    expect(Object.keys(emptyGame.getPlayers())).to.have.lengthOf(0);
  });
});

describe('Generate Obstacles Function', () => {
  const game = new Game(1000, 1000);
  it('Should generate obstacles and return the obstacles in the game', () => {
    game.generateObstacles();
    expect(game.getObstacles()).to.have.lengthOf(6);
  });
});

describe('Game movement function', () => {
  const game = new Game(100, 100);
  const players: PlayerData[] =
      [{id: 'gamer1'}, {id: 'gamer2'}, {id: 'gamer3'}, {id: 'gamer4'}];
  game.generatePlayers(players);
  it('Should change the location of the avatar given player data', () => {
    const movePlayer1: MovementData = {xDelta: 10, yDelta: -10};
    game.movePlayer('gamer1', movePlayer1);
    const movePlayer2: MovementData = {xDelta: 5, yDelta: -5};
    game.movePlayer('gamer2', movePlayer2);
    const players = game.getPlayers();
    expect(players.gamer1.avatar.location[0]).to.equal(10);
    expect(players.gamer1.avatar.location[1]).to.equal(-10);
    expect(players.gamer2.avatar.location[0]).to.equal(5);
    expect(players.gamer2.avatar.location[1]).to.equal(-5);
  });
});

describe('Random number function', () => {
  it('Should generate a random number between two numbers', () => {
    expect(getRandomChoice(1, 4)).to.be.within(1, 4);
    expect(getRandomChoice(0, 500)).to.be.within(0, 500);
    expect(getRandomChoice(-1, 0)).to.be.within(-1, 0);
  });
});

describe('Add obstacle function', () => {
  it('Should add an obstacle to the current array of objects', () => {
    const game = new Game(1000, 1000);
    game.generateObstacles();
    game.addObstacle(new Obstacle([0, 0], 100, 100));
    expect(game.getObstacles()).to.have.lengthOf(7);
    game.addObstacle(new Obstacle([100, 100], 200, 200));
    expect(game.getObstacles()).to.have.lengthOf(8);
  });
});

describe('Generate drops function', () => {
  it('Should generate drops spread across the game board', () => {
    const game1 = new Game(1000, 1000);
    game1.generateDrops();
    expect(Object.keys(game1.getDrops())).to.have.lengthOf(16);

    const game2 = new Game(500, 500);
    game2.generateDrops();
    expect(Object.keys(game2.getDrops())).to.have.lengthOf(4);
  });
});

describe('Pick up new item', () => {
  it('Should pick up new item and drop the old item', () => {
    const game = new Game(1000, 1000);
    game.generateDrops();
    game.addPlayer(new Player('1', new Human([0, 0])));
    game.pickupWeapon('1', 1);
    const playerAvatar = game.getPlayer('1').avatar;
    if (playerAvatar instanceof Human) {
      expect(playerAvatar.heldWeapon).to.be.instanceof(SawnOffShotgun);
    }
  });
});