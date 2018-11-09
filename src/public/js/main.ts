import * as gameConstants from './game-constants';
import * as sharedConstants from '../../shared/constants';
import { isNumber } from 'util';
import { GameController } from './models/Game';
import {SocketController} from './controllers/SocketController';

// let gameStarted = false;

const splitUrl = location.href.split("/");
const roomId = splitUrl[splitUrl.length - 1];

export const game = new GameController(roomId);
export const socket = new SocketController(roomId, game);

const startGameButton = document.getElementById('start');
    startGameButton!.style.display = "none";

function startGame() {
    document.getElementById('waiting-room-overlay')!.style.display = "none";
    document.getElementById('background')!.style.display = "none";
    socket.sendStartGame();
}


if (startGameButton) {
    startGameButton.addEventListener('click', startGame);
}
