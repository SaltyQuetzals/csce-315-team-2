import * as constants from '../shared/constants';

import { Avatar, Human, Zombie } from './Avatar';
import { Drop } from './Drop';
import { AutomaticRifle, Revolver, SawnOffShotgun, Weapon } from './Guns';
import { Obstacle } from './Obstacle';
import { Player } from './Player';
import { Grit, Hammertime, PowerUp, WeirdFlex } from './PowerUp';
import { RectangularObject } from './RectangularObject';

export type InitialState = {
  obstacles: Obstacle[],
  drops: { [dropId: number]: Drop },
  players: {
    [socketId: string]: {
      player: Player,
      name: string
    }
  }
};

export type PlayerStats = {
  kills: number, deaths: number, isHuman: boolean;
};

export class Leaderboard {
  players: { [socketId: string]: { stats: PlayerStats, name: string } } = {};

  /**
   * Adds a player to the leaderboard to be tracked.
   * @param socketId The unique socket identifier of the player.
   */
  addPlayer(socketId: SocketId, name: string) {
    this.players[socketId] = {
      stats: { kills: 0, deaths: 0, isHuman: true },
      name
    };
  }

  /**
   * Removes a player from the leaderboard.
   * @param socketId The unique socket identifier of the player.
   */
  removePlayer(socketId: SocketId): void {
    delete this.players[socketId];
  }

  /**
   * Increments the killer's number of kills, and the victim's number of deaths.
   * @param killerId The killer's unique socket identifier
   * @param victimId The victim's unique socket identifier
   */
  playerKilled(killerId: SocketId, victimId: SocketId): void {
    if (!(killerId in this.players)) {
      throw Error(`The killerId provided (${killerId}) was not found.`);
    }
    if (!(victimId in this.players)) {
      throw Error(`The victimId provided (${victimId}) was not found.`);
    }
    this.players[killerId].stats.kills++;
    this.players[victimId].stats.deaths++;
    this.players[victimId].stats.isHuman = false;
  }


  get humansRemaining(): number {
    let humans = 0;
    for (const socketId in this.players) {
      if (this.players[socketId].stats.isHuman) {
        humans++;
      }
    }
    return humans;
  }

  initialize(): InitialState {
    const obstacles = generateObstacles();

    const playerIds = Object.keys(this.players);
    const zombieIndex = Math.floor(Math.random() * playerIds.length);
    const zombieSocketId = playerIds[zombieIndex];
    this.players[zombieSocketId].stats.isHuman = false;

    const initialPlayerData: {
      [socketId: string]: {
        player: Player,
        name: string
      }
    } = {};

    const collidables: RectangularObject[] = [];
    collidables.concat(obstacles);

    for (const socketId of Object.keys(this.players)) {
      const position = generatePosition(collidables);
      let avatar: Avatar;
      if (this.players[socketId].stats.isHuman) {
        avatar = new Human(position);
      } else {
        avatar = new Zombie(position);
      }
      collidables.push(avatar);
      initialPlayerData[socketId] = {
        player: new Player(socketId, avatar),
        name: this.players[socketId].name
      };

    }
    const drops = generateDrops(collidables);
    return { obstacles, players: initialPlayerData, drops };
  }
}

function generatePosition(collidables: RectangularObject[] = []): XY {
  let position: XY = [
    Math.random() * constants.GAME_BOARD_WIDTH,
    Math.random() * constants.GAME_BOARD_HEIGHT
  ];
  while (collidesWithAny(collidables, position)) {
    position = [
      Math.random() * constants.GAME_BOARD_WIDTH,
      Math.random() * constants.GAME_BOARD_HEIGHT
    ];
  }
  return position;
}


function generateObstacles(): Obstacle[] {
  const MIN_OBSTACLE_WIDTH = 0.05 * constants.GAME_BOARD_WIDTH;
  const MAX_OBSTACLE_WIDTH = 0.30 * constants.GAME_BOARD_WIDTH;

  const MIN_OBSTACLE_HEIGHT = 0.05 * constants.GAME_BOARD_HEIGHT;
  const MAX_OBSTACLE_HEIGHT = 0.30 * constants.GAME_BOARD_HEIGHT;


  const obstacles: Obstacle[] = [];
  for (let i = 0; i < 7; ++i) {
    const position = generatePosition();

    const width = Math.random() * MAX_OBSTACLE_WIDTH + MIN_OBSTACLE_WIDTH;
    const height = Math.random() * MAX_OBSTACLE_HEIGHT + MIN_OBSTACLE_HEIGHT;

    obstacles.push(new Obstacle(position, width, height));
  }
  return obstacles;
}

function generateDrops(collidables: RectangularObject[]): { [dropId: number]: Drop } {
  let dropId = 0;
  const drops: { [dropId: number]: Drop } = {};
  for (let i = 0; i < constants.NUM_INITIAL_DROPS; i++) {
    let dropItem: Weapon | PowerUp;

    switch (i % 6) {
      case 0:
        dropItem = new Revolver();
        break;
      case 1:
        dropItem = new SawnOffShotgun();
        break;
      case 2:
        dropItem = new AutomaticRifle();
        break;
      case 3:
        dropItem = new WeirdFlex();
        break;
      case 4:
        dropItem = new Hammertime();
        break;
      default:
        dropItem = new Grit();
        break;
    }

    const position = generatePosition(collidables);
    drops[dropId] = new Drop(dropItem, position, dropId);
    dropId++;
  }
  return drops;
}

function collidesWithAny(collidables: RectangularObject[], position: XY) {
  for (const obj of collidables) {
    if (obj.collidesWith(position)) {
      return true;
    }
  }
  return false;
}