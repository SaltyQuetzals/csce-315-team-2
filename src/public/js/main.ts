// import * as gameConstants from './game-constants';
// import * as sharedConstants from '../../shared/constants';
// import { isNumber } from 'util';


import { SocketController } from './controllers/SocketController';
import { GameController } from './models/Game';

// let gameStarted = false;

const splitUrl = location.href.split("/");
const roomId = splitUrl[splitUrl.length - 1];

export let game = new GameController(roomId);

const startGameButton = document.getElementById('start');

function startGame() {
    document.getElementById('waiting-room-overlay')!.style.display = "none";
    document.getElementById('background')!.style.display = "none";
    document.getElementById('start')!.style.display = "none";
    console.log("MAIN.TS");
    console.log(game);
    console.log(game.socket);
    game.socket.sendStartGame();
}


if (startGameButton) {
    startGameButton.addEventListener('click', startGame);
}
