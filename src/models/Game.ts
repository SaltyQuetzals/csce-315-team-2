import {Human, Position, Zombie} from '../models/Avatar';
import {Weapon} from '../models/Guns';
import {SquareObstacle} from '../models/Obstacle';
import {Player} from '../models/Player';

export type PlayerData = {
  name: string
};

export class Game {
  private players!: Player[];
  private obstacles!: SquareObstacle[];
  private readonly boardWidth!: number;
  private readonly boardHeight!: number;

  constructor(boardWidth: number, boardHeight: number) {
    this.players = [];
    this.obstacles = [];
    this.boardHeight = boardHeight;
    this.boardWidth = boardWidth;
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  getPlayers() {
    return this.players;
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

  generateObstacles() {}

  generatePowerUps() {}

  generateGuns() {}
}

function getRandomChoice(max: number, min: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}