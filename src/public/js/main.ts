// import * as gameConstants from './game-constants';
// import * as sharedConstants from '../../shared/constants';
// import { isNumber } from 'util';


import { SocketController } from './controllers/SocketController';
import { GameController } from './models/Game';

// let gameStarted = false;

const splitUrl = location.href.split("/");
const roomId = splitUrl[splitUrl.length - 1];

export const game = new GameController(roomId);

const startGameButton = document.getElementById('start');
    startGameButton!.style.display = "none";

function startGame() {
    document.getElementById('waiting-room-overlay')!.style.display = "none";
    document.getElementById('background')!.style.display = "none";
    game.socket.sendStartGame();
}


if (startGameButton) {
    startGameButton.addEventListener('click', startGame);
}
