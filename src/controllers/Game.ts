
import {Game, PlayerData} from '../models/Game';

export function startGame(players: PlayerData[]) {
  const game = new Game(1000, 1000);
  game.generatePlayers(players);
  game.generateObstacles();
  game.generatePowerUps();
  game.generateGuns();
}
