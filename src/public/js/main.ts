// import * as gameConstants from './game-constants';
// import * as sharedConstants from '../../shared/constants';
// import { isNumber } from 'util';


import {SocketController} from './controllers/SocketController';
import {GameController} from './models/Game';
import * as waiting from './waiting';

// let gameStarted = false;

const splitUrl = location.pathname.split('/');
const roomId = splitUrl[splitUrl.length - 1];

const username = waiting.getUserName();

export let socket = new SocketController(roomId, username);
export let game = new GameController(roomId, username, socket);

const startGameButton = document.getElementById('start');

const createButton = document.getElementById('create');

const copyButton = document.getElementById('copy');

if (copyButton) {
  copyButton.addEventListener('click', onCopyButtonPressed);
}

function onCopyButtonPressed() {
  waiting.copyText();
  showSnackBar();
}

function startGame(): void {
  document.getElementById('waiting-room-overlay')!.style.display = 'none';
  document.getElementById('background')!.style.display = 'none';
  document.getElementById('start')!.style.display = 'none';
  // console.log(game);
  // console.log(game.socket);
  game.socket.sendStartGame();
}

if (startGameButton) {
  startGameButton.addEventListener('click', startGame);
}

function showSnackBar() {
  // Get the snackbar DIV
  const x: HTMLElement|null = document.getElementById('snackbar');

  if (x) {
    x.className = 'show';
    // After 3 seconds, remove the show class from DIV
    setTimeout(() => {
      if (x) x.className = x.className.replace('show', '');
    }, 3000);
  }
}