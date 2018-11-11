import { Obstacle } from '../../models/Obstacle';
import { Drop } from '../../models/Drop';
import { Player } from '../../models/Player';
import { CustomPlayer } from './game-classes';

export type StartGameParams = {
    obstacles: [Obstacle],
    drops: [Drop],
    players: Players
};

export type MovementParams = {
    id: string,
    location: {
        x: number,
        y: number
    }
};

export interface NewPlayerParams {
    roomHost: string;
    id: string;
    username: string;
    players: {
        [socketId: string]: string
    };
}

export interface Players {
    [socketId: string]: {
        player: Player
    };
}

export declare var io : {
    connect(url: string, data: {}): Socket;
};

export interface Socket {
    id: string;
    on(event: string, callback: (data: any) => void): any;
    emit(event: string, data: any): any;
}