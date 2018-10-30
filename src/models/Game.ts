import {Human, Position, Zombie} from '../models/Avatar';
import {Weapon} from '../models/Guns';
import {SquareObstacle} from '../models/Obstacle';
import {Player} from '../models/Player';

export type PlayerData = {
  name: string
};

export type MovementData = {
  xDelta: number,
  yDelta: number
};

export class Game {
  private players!: {[key: string]: Player};
  private _obstacles!: SquareObstacle[];
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
    this.players[player.name] = player;
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
    this.obstacles.push(obstacle);
  }

  /**
   * Returns the obstacles
   */
  get obstacles(): SquareObstacle[] {
    return this._obstacles;
  }


  /**
   * Assigns start position in the center of the board
   */
  assignStartPosition(): Position {
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
        this.addPlayer(new Player(player.name, zombie));
      } else {
        const human = new Human([0, 0]);
        this.addPlayer(new Player(player.name, human));
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
  generateGuns() {}

  /**
   * Takes in the name/id of the player and the movementData associated with the
   * changes made by a user The function then calls the movement function for
   * that players avatar with the x and y delta
   * @param playerName the name of the player from the movement data
   * @param movementData the x and the y delta from the player
   */
  movePlayer(playerName: string, movementData: MovementData) {
    console.assert(
        typeof (movementData.xDelta) === 'number',
        'xDelta attribute is not a number');
    console.assert(
        typeof (movementData.yDelta) === 'number',
        'yDelta attribute is not a number');
    this.players[playerName].avatar.move(
        movementData.xDelta, movementData.yDelta);
  }
} /*
-----------------------------------------------------------
*/

/**
 * Returns a random integer between two numbers (namely, max and min)
 * @param min the smallest number that can be randomly generated
 * @param max the largest number that can be randomly generated
 */
export function getRandomChoice(min: number, max: number) {
  console.assert(
      Number.isInteger(min), 'The minimum provided is not an integer');
  console.assert(
      Number.isInteger(max), 'The maximum provided is not an integer');
  console.assert(
      min <= max, 'The minimum must be less than or equal to the maximum');
  return Math.floor(Math.random() * (max - min + 1) + min);
}