import 'mocha';

import {expect} from 'chai';
import {Leaderboard} from '../../src/models/Leaderboard';
describe('Leaderboard.addPlayer', () => {
  const board = new Leaderboard();
  const newPlayerId = 'socketId';
  it('Should add a player successfully', () => {
    board.addPlayer(newPlayerId, newPlayerId);
    expect(board.players[newPlayerId].stats.deaths).to.equal(0);
    expect(board.players[newPlayerId].stats.kills).to.equal(0);
  });
});


describe('Leaderboard.removePlayer', () => {
  const board = new Leaderboard();
  const newPlayerId = 'socketId';
  board.addPlayer(newPlayerId, newPlayerId);

  it('Should remove a player', () => {
    board.removePlayer(newPlayerId);
    expect(board.players).to.not.have.key(newPlayerId);
  });
});

describe('Leaderboard.playerKilled', () => {
  const board = new Leaderboard();
  const killerId = 'firstId';
  const victimId = 'secondId';

  board.addPlayer(killerId, killerId);
  board.addPlayer(victimId, killerId);


  it('Should change the proper values', () => {
    board.playerKilled(killerId, victimId);

    const {players} = board;
    expect(players[killerId].stats.kills).to.equal(1);
    expect(players[killerId].stats.deaths).to.equal(0);
    expect(players[killerId].stats.isHuman).to.equal(true);

    expect(players[victimId].stats.deaths).to.equal(1);
    expect(players[victimId].stats.kills).to.equal(0);
    expect(players[victimId].stats.isHuman).to.equal(false);
  });
});


describe('Leaderboard.humansRemaining', () => {
  const board = new Leaderboard();
  const killerId = 'killerId';
  const victimId = 'victimId';

  board.addPlayer(killerId, killerId);
  board.addPlayer(victimId, killerId);

  it('Should update when a player is killed', () => {
    board.playerKilled(killerId, victimId);
    expect(board.humansRemaining).to.equal(1);
  });
});