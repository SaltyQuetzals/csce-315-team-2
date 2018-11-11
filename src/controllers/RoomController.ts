import {InitialState, Leaderboard} from '../models/Leaderboard';

export type GameRoom = {
  roomLeader: string,
  gameInProgress: boolean,
  names: {[socketid: string]: string},
  leaderboard: Leaderboard
};

class RoomController {
  private rooms: {[socketId: string]: GameRoom} = {};

  /**
   * Determines whether a room exists or not.
   * @param roomId The unique identifier for the room to check.
   */
  roomExists(roomId: string): boolean {
    return roomId in this.rooms;
  }

  /**
   * Creates a room if it doesn't already exist.
   * @param roomId The unique identifier of the room.
   * @param socketId The unique identifier of a user's connection.
   * @param name The user's selected name.
   */
  createRoom(roomId: string, socketId: string, name: string): void {
    if (!this.roomExists(roomId)) {
      const names: {[socketId: string]: string} = {};
      names[socketId] = name;
      this.rooms[roomId] = {
        roomLeader: socketId,
        leaderboard: new Leaderboard(),
        gameInProgress: false,
        names
      };
    }
  }

  /**
   * Adds a player to a room if it exists, isn't full, and doesn't have a game
   * in progress.
   * @param roomId The unique identifier of the room.
   * @param socketId The unique identifier of a user's connection.
   * @param name The user's selected name.
   */
  addPlayerToRoom(roomId: string, socketId: string, name: string): void {
    if (!(roomId in this.rooms)) {
      this.createRoom(roomId, socketId, name);
    }
    const room = this.rooms[roomId];
    if (Object.keys(room.names).length === 10) {
      throw Error(`Room "${roomId}" is full.`);
    }
    if (room.gameInProgress) {
      // throw Error(`Room "${roomId}"'s game is in progress. Try again
      // later.`);
    }
    room.names[socketId] = name;
  }

  /**
   * Retrieves a specific room, given its unique ID.
   * @param roomId The unique identifier of the room.
   */
  getRoom(roomId: string) {
    if (!(roomId in this.rooms)) {
      throw Error(`Room "${roomId}" does not exist.`);
    }
    return this.rooms[roomId];
  }

  getRoomHost(roomId: string) {
    const room = this.getRoom(roomId);
    return room.roomLeader;
  }

  /**
   * Returns the names in a room, given the `roomId`.
   * @param roomId The unique identifier of the room.
   */
  getNames(roomId: string) {
    return this.getRoom(roomId).names;
  }


  /**
   * Starts the game of a given room.
   * @param roomId The unique identifier of the room.
   */
  startGame(roomId: string): InitialState|undefined {
    const room = this.getRoom(roomId);
    if (!room.gameInProgress) {
      const playerData: Array<{id: string}> = [];
      for (const socketId of Object.keys(room.names)) {
        playerData.push({id: room.names[socketId]});
        room.leaderboard.addPlayer(socketId, socketId);
      }
      const initialState = room.leaderboard.initialize();
      room.gameInProgress = true;
      return initialState;
    }
    return;
  }

  /**
   * Removes a player from the room, and deletes the room if empty.
   *
   * NOTE: If the player removed is the `roomLeader`, the `roomLeader` is
   * reassigned (unless the room is empty).
   * @param roomId The unique identifier of the room.
   * @param socketId The unique user's connection to remove.
   */
  removePlayerFromRooms(socketId: string): void {
    for (const roomId of Object.keys(this.rooms)) {
      const room = this.getRoom(roomId);
      delete room.names[socketId];
      if (socketId === room.roomLeader) {
        let newLeaderIndex: number;
        const socketIds = Object.keys(room.names);
        if (Object.keys(room.names).length === 1) {
          newLeaderIndex = 0;
        } else {
          do {
            newLeaderIndex = Math.floor(Math.random() * socketIds.length);
          } while (socketIds[newLeaderIndex] === socketId);
        }
        this.rooms[roomId].roomLeader = socketIds[newLeaderIndex];
      }
      if (Object.keys(room.names).length === 0) {
        delete this.rooms[roomId];
      }
    }
  }
}

export {RoomController};