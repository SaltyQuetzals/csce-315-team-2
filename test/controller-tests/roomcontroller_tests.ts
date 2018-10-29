import 'mocha';

import {expect} from 'chai';

import {RoomController} from '../../src/controllers/RoomController';
import {Game} from '../../src/models/Game';
const mockSocketId = 'abcdef';
const mockRoomId = 'room';
const mockName = 'The Entirety of the Great Gatsby';

describe('RoomController.createRoom', () => {
  const rc = new RoomController();
  rc.createRoom(mockRoomId, mockSocketId, mockName);
  it('Should create & initialize a GameRoom', () => {
    const room = rc.getRoom(mockRoomId);
    expect(room.gameInProgress).to.equal(false);
    expect(room.names).to.have.all.keys([mockSocketId]);
    expect(room.names[mockSocketId]).to.equal(mockName);
  });

  it('Should not overwrite an existing room', () => {
    const origRoom = rc.getRoom(mockRoomId);
    rc.createRoom(mockRoomId, mockSocketId, mockName);
    const newRoom = rc.getRoom(mockRoomId);
    expect(origRoom).to.equal(newRoom);
  });
});

describe('RoomController.addPlayer', () => {
  const mockNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const mockSocketIds = ['1', '2', '3', '4', '5', '6', '7', '8'];


  it('Should add a player to an existing room.', () => {
    const rc = new RoomController();
    rc.createRoom(mockRoomId, mockSocketId, mockName);
    const mockSocketId2 = 'jklmnop';
    const mockName2 = 'Bilbo';
    rc.addPlayerToRoom(mockRoomId, 'jklmnop', mockName2);
    const room = rc.getRoom(mockRoomId);
    expect(room.names).to.have.all.keys([mockSocketId, mockSocketId2]);
  });

  it('Should create a room if one doesn\'t already exist', () => {
    const rc = new RoomController();
    rc.createRoom(mockRoomId, mockSocketId, mockName);
    const nonExistentRoom = 'Route 27 Bus';
    rc.addPlayerToRoom(nonExistentRoom, mockSocketId, mockName);
    const room = rc.getRoom(nonExistentRoom);
    // tslint:disable-next-line
    expect(room).to.not.be.undefined;
  });

  it('Should not allow a player entry if room is full', () => {
    const rc = new RoomController();
    rc.createRoom(mockRoomId, mockSocketId, mockName);
    for (let i = 0; i < mockNames.length; ++i) {
      const mockName = mockNames[i];
      const mockSocketId = mockSocketIds[i];
      rc.addPlayerToRoom(mockRoomId, mockSocketId, mockName);
    }
    expect(rc.addPlayerToRoom.bind(rc, mockRoomId, 'I', '9'))
        .to.not.throw(Error);
    expect(rc.addPlayerToRoom.bind(mockRoomId, 'J', '10')).to.throw(Error);
  });
});

describe('RoomController.startGame', () => {
  const rc = new RoomController();
  rc.createRoom(mockRoomId, mockSocketId, mockName);
  rc.startGame(mockRoomId);
  const room = rc.getRoom(mockRoomId);
  expect(room.gameInProgress).to.equal(true);
});

describe('RoomController.removePlayerFromRoom', () => {
  const anotherMockName = 'Another player';
  const anotherMockSocketId = 'jklmn';
  it('Should remove the given player', () => {
    const rc = new RoomController();
    rc.createRoom(mockRoomId, mockSocketId, mockName);
    rc.addPlayerToRoom(mockRoomId, anotherMockSocketId, anotherMockName);
    rc.removePlayerFromRooms(anotherMockSocketId);
    const room = rc.getRoom(mockRoomId);
    expect(Object.keys(room.names).length).to.equal(1);
  });

  it('Should delete the entire room if empty', () => {
    const rc = new RoomController();
    rc.createRoom(mockRoomId, mockSocketId, mockName);
    rc.removePlayerFromRooms(mockSocketId);
    expect(rc.getRoom.bind(rc, mockRoomId)).to.throw(Error);
  });

  it('Should reassign leader if original leader leaves', () => {
    const rc = new RoomController();
    rc.createRoom(mockRoomId, mockSocketId, mockName);
    rc.addPlayerToRoom(mockRoomId, anotherMockSocketId, anotherMockName);
    rc.removePlayerFromRooms(mockSocketId);
    const room = rc.getRoom(mockRoomId);
    expect(room.roomLeader).to.equal(anotherMockSocketId);
  });
});