import {Drop} from '../../../models/Drop';
import {Obstacle} from '../../../models/Obstacle';
import {Player} from '../../../models/Player';

import {CustomPlayer} from './game-classes';
import { InitialState } from '../../../models/Leaderboard';

export type StartGameParams = {
  initialState: InitialState,
  // obstacles: [Obstacle],
  // drops: [Drop],
  // players: Players
  playerNames: { [socketId: string]: string }
};

export type MovementParams = {
  id: string,
  location: { x: number, y: number },
  facing: { x: number, y: number }
};

// export interface NewPlayerParams {
//   roomHost: string;
//   id: string;
//   username: string;
//   players: {[socketId: string]: string};
// }

export interface NewPlayerParams {
  roomHost: string;
  newPlayerId: string;
  playerNames: { [socketId: string]: string };
}

export interface Players {
  [socketId: string]: {player: Player};
}

export declare var io: {connect(url: string, data: {}): Socket;};

export interface Socket {
  id: string;
  on(event: string, callback: (data: any) => void): any;  // tslint:disable-line
  emit(event: string, data: any): any;                    // tslint:disable-line
}