import {Human, Zombie} from '../models/Avatar';
import {Weapon} from '../models/Guns';
import {SquareObstacle} from '../models/Obstacle';
import {Player} from '../models/Player';

export type PlayerData = {
  id: string
};

export type MovementData = {
  xDelta: number,
  yDelta: number
};

export class Game {
  private players!: {[key: string]: Player};
  private _obstacles!: SquareObstacle[];
  private weapons!: {[key: string]: Weapon};
  private readonly boardWidth!: number;
  private readonly boardHeight!: number;

  constructor(boardWidth: number, boardHeight: number) {
    this.players = {};
    this._obstacles = [];
    this.boardHeight = boardHeight;
    this.boardWidth = boardWidth;
  }

  /**
   * Adds a player to the players object
   * @param player a Player object that has been previously declared
   */
  addPlayer(player: Player) {
    this.players[player.id] = player;
  }

  /**
   * Returns players object
   */
  getPlayers() {
    return this.players;
  }

  /**
   * Returns the player associiated with the player id
   * @param playerId an id associated with each player
   */
  getPlayer(playerId: string): Player {
    return this.players[playerId];
  }

  /**
   * Adds an obstacle to the obstacles array
   * @param obstacle a SquareObstacle object that has been declared
   */
  addObstacle(obstacle: SquareObstacle) {
    this._obstacles.push(obstacle);
  }

  /**
   * Returns the obstacles
   */
  getObstacles(): SquareObstacle[] {
    return this._obstacles;
  }

  /**
   * Returns the weapon given by the specified weapon id
   */
  getWeapon(weaponId: string): Weapon{
    return this.weapons[weaponId];
  }

  /**
   * Assigns start position in the center of the board
   */
  assignStartPosition(): XY {
    return [this.boardHeight / 2, this.boardWidth / 2];
  }

  /**
   * Takes in player data to generate the number of players given player data
   * Insert players into player class data structure that randomly selects one
   * player as the zombie and makes the rest of the players humans
   * @param players Player data including the id and name of the player
   */
  generatePlayers(players: PlayerData[]) {
    const zombiePlayerIndex: number = getRandomChoice(0, players.length);
    for (let i = 0; i < players.length; ++i) {
      const player: PlayerData = players[i];
      if (i === zombiePlayerIndex) {
        const zombie: Zombie = new Zombie([0, 0]);
        this.addPlayer(new Player(player.id, zombie));
      } else {
        const human = new Human([0, 0]);
        this.addPlayer(new Player(player.id, human));
      }
    }
  }

  /**
   * Generates obstacles for the game to be added to the game board
   */

  // TODO move this away from hardcoding in the obstacles and have the obstacles
  // be randomly generated
  generateObstacles() {
    const obstacle1 = new SquareObstacle([10, 10], 100, 100),
          obstacle2 = new SquareObstacle([100, 100], 50, 50),
          obstacle3 = new SquareObstacle([700, 200], 200, 300),
          obstacle4 = new SquareObstacle([800, 800], 100, 100),
          obstacle5 = new SquareObstacle([200, 800], 20, 200);
    this._obstacles = [obstacle1, obstacle2, obstacle3, obstacle4, obstacle5];
  }

  // TODO generate powerups on the board randomly
  generatePowerUps() {}

  // TODO generate guns on the board randomly
  generateWeapons() {
  }

  pickupWeapon(playerId: string, weaponId: string){
    const avatar = this.getPlayer(playerId).avatar
    if (avatar instanceof Human){
      avatar.heldWeapon = this.getWeapon(weaponId);
    }
    // TODO Do something with the item being dropped and keeping track of the current location of the dropped object
  }

  /**
   * Takes in the name/id of the player and the movementData associated with the
   * changes made by a user The function then calls the movement function for
   * that players avatar with the x and y delta
   * @param playerId the unique id of the player data
   * @param movementData the x and the y delta from the player
   */
  movePlayer(playerId: string, movementData: MovementData) {
    console.assert(
        typeof (movementData.xDelta) === 'number',
        'xDelta attribute is not a number');
    console.assert(
        typeof (movementData.yDelta) === 'number',
        'yDelta attribute is not a number');
    this.players[playerId].avatar.move(
        movementData.xDelta, movementData.yDelta);
  }

  playerKilled(playerId: string, killedPlayerId: string){
    
  }
} /*
-----------------------------------------------------------
*/

/**
 * Returns a random integer between two numbers (namely, max and min)
 * @param min the smallest number that can be randomly generated
 * @param max the largest number that can be randomly generated
 */
export function getRandomChoice(min: number, max: number): integer {
  console.assert(
      Number.isInteger(min), 'The minimum provided is not an integer');
  console.assert(
      Number.isInteger(max), 'The maximum provided is not an integer');
  console.assert(
      min <= max, 'The minimum must be less than or equal to the maximum');
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getRandomPosition(min: XY, max: XY): XY {
  console.assert(
      Number.isInteger(max[0]) && Number.isInteger(max[1]),
      'The maximum position is not a set of integers');
  console.assert(
      Number.isInteger(min[0]) && Number.isInteger(min[1]),
      'The minimum position is not a set of integers');
  console.assert(
      min[0] <= max[0] && min[1] <= max[1],
      'The minimum position must be smaller than the maximum position');
  const xCoord = getRandomChoice(min[0], max[0]);
  const yCoord = getRandomChoice(min[1], max[1]);
  return [xCoord, yCoord];
}

export function generateRandomPositions(
    chunkSize: number, boardWidth: integer, boardHeight: integer) {
  let positions: XY[] = [];
  for (let i = 0; i < Math.floor(boardHeight / chunkSize); i++) {
    for (let j = 0; j < Math.floor(boardWidth / chunkSize); j++) {
      positions.push(getRandomPosition(
          [j * chunkSize, i * chunkSize],
          [chunkSize * (j + 1), chunkSize * (i + 1)]));
    }
  }
  return positions;
}