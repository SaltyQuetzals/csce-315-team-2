import {LeaderBoard} from '../classes/game-classes';
import {GameController} from '../models/Game';

import {SocketController} from './SocketController';

export class RoomController {
  roomId!: string;
  username!: string;
  socket!: SocketController;
  game!: GameController;
  snackbar!: HTMLElement;
  startGameButton!: HTMLElement;
  createButton!: HTMLElement;
  copyButton!: HTMLElement;

  constructor() {
    const splitUrl = location.pathname.split('/');
    this.roomId = splitUrl[splitUrl.length - 1];
    this.username = this.getUserName();
    this.socket = new SocketController(this.roomId, this.username);
    this.game = new GameController(this.roomId, this.username, this.socket);
    this.snackbar = document.getElementById('snackbar')!;
    this.startGameButton = document.getElementById('start')!;
    this.createButton = document.getElementById('create')!;
    this.copyButton = document.getElementById('copy')!;

    this.copyButton.addEventListener(
        'click', this.onCopyButtonPressed.bind(this));
    this.startGameButton.addEventListener('click', this.startGame.bind(this));
  }

  showSnackBar(): void {
    if (this.snackbar) {
      this.snackbar.className = 'show';
      setTimeout(() => {
        if (this.snackbar) {
          this.snackbar.className = this.snackbar.className.replace('show', '');
        }
      }, 3000);
    }
  }

  startGame(): void {
    this.game.socket.sendStartGame();
    // document.getElementById('waiting-room-overlay')!.style.display = 'none';
    // document.getElementById('background')!.style.display = 'none';
    // document.getElementById('start')!.style.display = 'none';
  }

  restartGame(
      playerNames: {[socketId: string]: string},
      leaderBoard: LeaderBoard): void {
    this.game.game.sound.stopAll();
    this.game.game.state.restart();
    this.showWaiting();
    this.updatePlayerList(playerNames, leaderBoard);
  }

  onCopyButtonPressed(): void {
    this.copyText();
    this.showSnackBar();
  }

  copyText(): void {
    const el = document.createElement('textarea');
    const url = window.location.href.split('?');
    document.body.appendChild(el);
    el.value = url[0];
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  showWaiting(): void {
    document.getElementById('waiting-room-overlay')!.style.display = 'inherit';
    document.getElementById('background')!.style.display = 'inherit';
    document.getElementById('start')!.style.display = 'inherit';
  }

  getUserName(): string {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    if (username) {
      return username;
    } else {
      return '';
    }
  }

  updateAccessCodeBox(): void {
    const accessCodeBox = document.getElementById('accessCode');
    const accessCode = this.getAccessCode();
    if (accessCodeBox) accessCodeBox.innerHTML = accessCode;
  }

  updatePlayerList(
      playerNames: {[socketId: string]: string},
      leaderBoard: LeaderBoard): void {
    const playerList = document.getElementById('player-list')!;
    const templateBeginning =
        '<table><tbody id=\'player-list\'><tr><th>Player</th><th>Kills</th><th>Deaths</th></tr>';
    const templateEnding = '</tbody></table>';
    const newPlayerList = Object.keys(playerNames).map((playerId) => {
      const kills = leaderBoard.players[playerId] ?
          leaderBoard.players[playerId].stats.kills :
          0;
      const deaths = leaderBoard.players[playerId] ?
          leaderBoard.players[playerId].stats.deaths :
          0;
      return `<tr><td>${playerNames[playerId]}</td><td>${kills}</td><td>${
          deaths}</td></tr>`;
    });
    if (playerList) {
      playerList.innerHTML =
        templateBeginning + newPlayerList.join('') + templateEnding;
    }
  }

  getAccessCode(): string {
    const pathName = window.location.pathname;
    const url = pathName.split('/');
    return url[url.length - 1];
  }
}