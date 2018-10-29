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

export interface Players {
  [key: string]: Player;
}

export class Game {
  private players!: Players;
  private obstacles!: SquareObstacle[];
  private readonly boardWidth!: number;
  private readonly boardHeight!: number;

  constructor(boardWidth: number, boardHeight: number) {
    this.players = {};
    this.obstacles = [];
    this.boardHeight = boardHeight;
    this.boardWidth = boardWidth;
  }

  /*
  Get and Setter Functions
  */

  addPlayer(player: Player) {
    this.players[player.name] = player;
  }

  getPlayers() {
    return this.players;
  }

  addObstacle(obstacle: SquareObstacle) {
    this.obstacles.push(obstacle);
  }

  getObstacles() {
    return this.obstacles;
  }

  assignStartPosition(): Position {
    return [this.boardHeight / 2, this.boardWidth / 2];
  }

  generatePlayers(players: PlayerData[]) {
    const zombiePlayerIndex: number = getRandomChoice(0, players.length + 1);
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

  generateObstacles() {
    const obstacle1 = new SquareObstacle([10, 10], 100, 100);
    const obstacle2 = new SquareObstacle([100, 100], 50, 50);
    const obstacle3 = new SquareObstacle([700, 200], 200, 300);
    const obstacle4 = new SquareObstacle([800, 800], 100, 100);
    const obstacle5 = new SquareObstacle([200, 800], 20, 200);
    this.obstacles = [obstacle1, obstacle2, obstacle3, obstacle4, obstacle5];
  }

  generatePowerUps() {}

  generateGuns() {}

  movePlayer(playerName: string, movementData: MovementData) {
    this.players[playerName].avatar.move(
        movementData.xDelta, movementData.yDelta);
  }
}

function getRandomChoice(max: number, min: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}