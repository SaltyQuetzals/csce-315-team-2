import {CustomPlayer} from './game-classes';

export interface Players {
  [key: string]: {username: string};
}

export function getAccessCode(): string {
  const pathName = window.location.pathname;
  const url = pathName.split('/');
  return url[url.length-1];
}

export function copyText(): void {
  const el = document.createElement('textarea');
  const url = window.location.href.split('?');
  document.body.appendChild(el);
  el.value = url[0]; 
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

export function updateAccessCodeBox(): void {
  const accessCodeBox = document.getElementById('accessCode');
  const accessCode = getAccessCode();
  if (accessCodeBox) accessCodeBox.innerHTML = accessCode;
}

export function updatePlayerList(playerNames: { [socketId: string]: string}):
  void {
  const playerList = document.getElementById('player-list');
  const newPlayerList = Object.keys(playerNames).map((playerId) => {
    // console.log(playerId);
    return '<li>' + playerNames[playerId] + '</li>';
  });
  if (playerList) playerList.innerHTML = newPlayerList.join('');
}

export function getUserName(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');
  if (username) {
    return username;
  } else {
    return '';
  }
}