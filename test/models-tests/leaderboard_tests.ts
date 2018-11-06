import 'mocha';

import {expect} from 'chai';
import {Leaderboard} from '../../src/models/Leaderboard';
describe('Leaderboard.addPlayer', () => {
  const board = new Leaderboard();
  const newPlayerId = 'socketId';
  it('Should add a player successfully', () => {
    board.addPlayer(newPlayerId);
    expect(board.playerStats[newPlayerId].deaths).to.equal(0);
    expect(board.playerStats[newPlayerId].kills).to.equal(0);
  });
});


describe('Leaderboard.removePlayer', () => {
  const board = new Leaderboard();
  const newPlayerId = 'socketId';
  board.addPlayer(newPlayerId);

  it('Should remove a player', () => {
    board.removePlayer(newPlayerId);
    expect(board.playerStats).to.not.have.key(newPlayerId);
  });
});

describe('Leaderboard.playerKilled', () => {
  const board = new Leaderboard();
  const killerId = 'firstId';
  const victimId = 'secondId';

  board.addPlayer(killerId);
  board.addPlayer(victimId);


  it('Should change the proper values', () => {
    board.playerKilled(killerId, victimId);

    const {playerStats} = board;
    expect(playerStats[killerId].kills).to.equal(1);
    expect(playerStats[killerId].deaths).to.equal(0);
    expect(playerStats[killerId].isHuman).to.equal(true);

    expect(playerStats[victimId].deaths).to.equal(1);
    expect(playerStats[victimId].kills).to.equal(0);
    expect(playerStats[victimId].isHuman).to.equal(false);
  });
});


describe('Leaderboard.humansRemaining', () => {
  const board = new Leaderboard();
  const killerId = 'killerId';
  const victimId = 'victimId';

  board.addPlayer(killerId);
  board.addPlayer(victimId);

  it('Should update when a player is killed', () => {
    board.playerKilled(killerId, victimId);
    expect(board.humansRemaining).to.equal(1);
  });
});